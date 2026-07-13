from datetime import datetime, timezone

from fastapi import HTTPException, status

from db.config import get_supabase_client
from utils.r2_client import r2_client

BID_DISCOUNTS = (0.30, 0.325, 0.35, 0.375, 0.40)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _round_price(value: float) -> float:
    return round(value / 50) * 50


def get_suggested_bid_prices(base_price: float | None) -> list[dict]:
    if not base_price:
        return []
    suggestions = []
    for discount in BID_DISCOUNTS:
        price = _round_price(base_price * (1 - discount))
        suggestions.append(
            {
                "label": f"{int(discount * 100)}% off",
                "price": price,
                "discount_pct": discount * 100,
            }
        )
    return suggestions


def _get_photos(db, listing_id: str) -> list[dict]:
    res = (
        db.table("listing_photos")
        .select("id, url, sort_order")
        .eq("listing_id", listing_id)
        .order("sort_order")
        .execute()
    )
    return res.data or []


def _hydrate(db, listing: dict) -> dict:
    listing["photos"] = _get_photos(db, listing["id"])
    listing["suggested_bid_prices"] = get_suggested_bid_prices(listing.get("base_price"))
    return listing


def _get_owned_listing(db, listing_id: str, user_id: str) -> dict:
    res = db.table("listings").select("*").eq("id", listing_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found.")
    listing = res.data[0]
    if listing["seller_id"] != user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not own this listing.")
    return listing


def create_listing(user_id: str, product_id: str) -> dict:
    db = get_supabase_client()
    product_res = db.table("products").select("id, price").eq("id", product_id).limit(1).execute()
    if not product_res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    product = product_res.data[0]

    res = (
        db.table("listings")
        .insert(
            {
                "seller_id": user_id,
                "product_id": product_id,
                "base_price": product.get("price"),
                "status": "draft",
                "current_step": 1,
            }
        )
        .execute()
    )
    return _hydrate(db, res.data[0])


def update_listing(user_id: str, listing_id: str, patch: dict) -> dict:
    db = get_supabase_client()
    _get_owned_listing(db, listing_id, user_id)

    update_fields = {k: v for k, v in patch.items() if v is not None}
    if update_fields:
        update_fields["updated_at"] = _now()
        db.table("listings").update(update_fields).eq("id", listing_id).execute()

    res = db.table("listings").select("*").eq("id", listing_id).limit(1).execute()
    return _hydrate(db, res.data[0])


def get_listing(user_id: str, listing_id: str) -> dict:
    db = get_supabase_client()
    listing = _get_owned_listing(db, listing_id, user_id)
    return _hydrate(db, listing)


def list_my_listings(user_id: str, status_filter: str | None = None) -> list[dict]:
    db = get_supabase_client()
    query = db.table("listings").select("*").eq("seller_id", user_id).order("updated_at", desc=True)
    if status_filter:
        query = query.eq("status", status_filter)
    res = query.execute()
    return [_hydrate(db, listing) for listing in (res.data or [])]


def add_photos(user_id: str, listing_id: str, uploads: list[tuple[bytes, str]]) -> list[dict]:
    db = get_supabase_client()
    _get_owned_listing(db, listing_id, user_id)

    existing = _get_photos(db, listing_id)
    next_sort = len(existing)

    from utils.image_utils import convert_to_webp

    inserted = []
    for i, (raw_bytes, filename) in enumerate(uploads):
        webp_bytes = convert_to_webp(raw_bytes)
        upload_result = r2_client.upload_file(webp_bytes, f"{filename}.webp", folder=f"listings/{listing_id}")
        row = (
            db.table("listing_photos")
            .insert(
                {
                    "listing_id": listing_id,
                    "url": upload_result["url"],
                    "r2_path": upload_result["path"],
                    "sort_order": next_sort + i,
                }
            )
            .execute()
        )
        inserted.append(row.data[0])
    return inserted


def delete_photo(user_id: str, listing_id: str, photo_id: str) -> None:
    db = get_supabase_client()
    _get_owned_listing(db, listing_id, user_id)

    res = db.table("listing_photos").select("*").eq("id", photo_id).eq("listing_id", listing_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Photo not found.")
    photo = res.data[0]

    r2_client.delete_file(photo["r2_path"])
    db.table("listing_photos").delete().eq("id", photo_id).execute()


def reorder_photos(user_id: str, listing_id: str, photo_ids: list[str]) -> list[dict]:
    db = get_supabase_client()
    _get_owned_listing(db, listing_id, user_id)

    for index, photo_id in enumerate(photo_ids):
        db.table("listing_photos").update({"sort_order": index}).eq("id", photo_id).eq(
            "listing_id", listing_id
        ).execute()

    return _get_photos(db, listing_id)


def submit_listing(user_id: str, listing_id: str) -> dict:
    db = get_supabase_client()
    listing = _get_owned_listing(db, listing_id, user_id)
    photos = _get_photos(db, listing_id)

    missing = []
    if not listing.get("product_id"):
        missing.append("product")
    if not listing.get("condition_grade"):
        missing.append("condition")
    if len(photos) < 3:
        missing.append("at least 3 photos")
    if not listing.get("bid_price"):
        missing.append("bid price")

    if missing:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Listing is incomplete: missing {', '.join(missing)}.",
        )

    db.table("listings").update(
        {"status": "pending_review", "submitted_at": _now(), "updated_at": _now()}
    ).eq("id", listing_id).execute()

    res = db.table("listings").select("*").eq("id", listing_id).limit(1).execute()
    return _hydrate(db, res.data[0])
