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


def list_my_listings(user_id: str, status_filter: str | None = None, page: int = 1, page_size: int = 10) -> dict:
    db = get_supabase_client()
    query = db.table("listings").select("*", count="exact").eq("seller_id", user_id).order("updated_at", desc=True)
    if status_filter:
        query = query.eq("status", status_filter)

    offset = (page - 1) * page_size
    res = query.range(offset, offset + page_size - 1).execute()
    listings = res.data or []
    total = res.count or 0

    listing_ids = [listing["id"] for listing in listings]
    photos_by_listing: dict[str, list[dict]] = {lid: [] for lid in listing_ids}
    if listing_ids:
        photos_res = (
            db.table("listing_photos")
            .select("id, url, sort_order, listing_id")
            .in_("listing_id", listing_ids)
            .order("sort_order")
            .execute()
        )
        for photo in photos_res.data or []:
            photos_by_listing.setdefault(photo["listing_id"], []).append(photo)

    items = []
    for listing in listings:
        listing["photos"] = photos_by_listing.get(listing["id"], [])
        listing["suggested_bid_prices"] = get_suggested_bid_prices(listing.get("base_price"))
        items.append(listing)

    return {"items": items, "total": total, "page": page, "page_size": page_size}


def browse_listings(
    exclude_user_id: str,
    scope: str,
    category: str | None = None,
    q: str | None = None,
    page: int = 1,
    page_size: int = 12,
) -> dict:
    from services.product_service import _first_image_url

    db = get_supabase_client()
    now = _now()

    query = (
        db.table("listings")
        .select(
            "id, variant_size, condition_grade, bid_price, auction_start_at, seller_id, "
            "products(id, name, brand, images, price, product_type)"
        )
        .eq("status", "accepted")
        .neq("seller_id", exclude_user_id)
    )
    query = query.lte("auction_start_at", now) if scope == "live" else query.gt("auction_start_at", now)

    res = query.execute()
    rows = res.data or []

    if category:
        rows = [r for r in rows if (r.get("products") or {}).get("product_type") == category]
    if q:
        ql = q.strip().lower()
        rows = [
            r
            for r in rows
            if ql in f"{(r.get('products') or {}).get('name', '')} {(r.get('products') or {}).get('brand', '')}".lower()
        ]

    rows.sort(key=lambda r: r.get("auction_start_at") or "", reverse=(scope == "live"))

    total = len(rows)
    start = (page - 1) * page_size
    page_rows = rows[start : start + page_size]

    items = []
    for r in page_rows:
        p = r.get("products")
        product = None
        if p:
            product = {
                "id": p["id"],
                "name": p["name"],
                "brand": p.get("brand"),
                "product_type": p.get("product_type"),
                "price": p.get("price"),
                "image_url": _first_image_url(p.get("images")),
            }
        items.append(
            {
                "id": r["id"],
                "variant_size": r.get("variant_size"),
                "condition_grade": r.get("condition_grade"),
                "bid_price": r.get("bid_price"),
                "auction_start_at": r.get("auction_start_at"),
                "product": product,
            }
        )

    return {"items": items, "total": total, "page": page, "page_size": page_size}


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


def delete_listing(user_id: str, listing_id: str) -> None:
    db = get_supabase_client()
    listing = _get_owned_listing(db, listing_id, user_id)

    if listing["status"] == "accepted":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Accepted listings can't be deleted.")

    photos_res = db.table("listing_photos").select("r2_path").eq("listing_id", listing_id).execute()
    for photo in photos_res.data or []:
        r2_client.delete_file(photo["r2_path"])

    # listing_photos rows cascade-delete via the FK, no need to delete them separately.
    db.table("listings").delete().eq("id", listing_id).execute()


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


def _get_seller_and_product(db, listing: dict) -> tuple[dict | None, dict | None]:
    seller_res = db.table("users").select("id, name, email").eq("id", listing["seller_id"]).limit(1).execute()
    seller = seller_res.data[0] if seller_res.data else None

    product = None
    if listing.get("product_id"):
        product_res = db.table("products").select("name").eq("id", listing["product_id"]).limit(1).execute()
        product = product_res.data[0] if product_res.data else None

    return seller, product


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
    updated = res.data[0]

    seller, product = _get_seller_and_product(db, updated)
    if seller:
        from services.email_service import send_listing_created_email

        try:
            send_listing_created_email(seller["email"], seller["name"], product["name"] if product else "your item")
        except Exception:
            pass  # Email delivery failures shouldn't block a successful submission.

    return _hydrate(db, updated)


def review_listing(listing_id: str, action: str) -> dict:
    db = get_supabase_client()
    res = db.table("listings").select("*").eq("id", listing_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found.")
    listing = res.data[0]

    if listing["status"] != "pending_review":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only listings pending review can be reviewed.")

    new_status = "accepted" if action == "accept" else "rejected"
    db.table("listings").update({"status": new_status, "reviewed_at": _now(), "updated_at": _now()}).eq(
        "id", listing_id
    ).execute()

    res = db.table("listings").select("*").eq("id", listing_id).limit(1).execute()
    updated = res.data[0]

    if new_status == "accepted":
        seller, product = _get_seller_and_product(db, updated)
        if seller:
            from services.email_service import send_listing_accepted_email

            try:
                send_listing_accepted_email(
                    seller["email"],
                    seller["name"],
                    product["name"] if product else "your item",
                    updated.get("auction_start_at"),
                    updated.get("bid_price"),
                )
            except Exception:
                pass

    return _hydrate(db, updated)
