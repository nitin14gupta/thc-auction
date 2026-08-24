from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

from fastapi import HTTPException, status

from db.config import get_supabase_client
from services import auction_service
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


def _batch_fetch_photos(db, listing_ids: list[str]) -> dict[str, list[dict]]:
    by_listing: dict[str, list[dict]] = {lid: [] for lid in listing_ids}
    if not listing_ids:
        return by_listing
    res = (
        db.table("listing_photos")
        .select("id, url, sort_order, listing_id")
        .in_("listing_id", listing_ids)
        .order("sort_order")
        .execute()
    )
    for photo in res.data or []:
        by_listing.setdefault(photo["listing_id"], []).append(photo)
    return by_listing


def _hydrate(db, listing: dict, photos: list[dict] | None = None) -> dict:
    listing_id = listing["id"]
    if photos is None:
        # Photos and bids are independent reads — fetch concurrently.
        with ThreadPoolExecutor(max_workers=2) as pool:
            photos_future = pool.submit(_get_photos, db, listing_id)
            bids_future = pool.submit(auction_service.batch_fetch_bids, db, [listing_id])
            photos = photos_future.result()
            bids_map = bids_future.result()
    else:
        bids_map = auction_service.batch_fetch_bids(db, [listing_id])

    listing["photos"] = photos
    listing["suggested_bid_prices"] = get_suggested_bid_prices(listing.get("base_price"))
    auction_service.sync_auction_status(db, listing, bids=bids_map.get(listing_id, []))
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
    listing = _get_owned_listing(db, listing_id, user_id)

    update_fields = {k: v for k, v in patch.items() if v is not None}
    if update_fields:
        update_fields["updated_at"] = _now()
        # update() already returns the updated row — no need for a follow-up SELECT.
        res = db.table("listings").update(update_fields).eq("id", listing_id).execute()
        listing = res.data[0]

    return _hydrate(db, listing)


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

    # Photos and bids are independent queries — run them concurrently instead
    # of back-to-back (each Supabase round trip costs real wall-clock time).
    with ThreadPoolExecutor(max_workers=2) as pool:
        photos_future = pool.submit(_batch_fetch_photos, db, listing_ids)
        bids_future = pool.submit(auction_service.batch_fetch_bids, db, listing_ids)
        photos_by_listing = photos_future.result()
        bids_by_listing = bids_future.result()

    items = []
    for listing in listings:
        listing["photos"] = photos_by_listing.get(listing["id"], [])
        listing["suggested_bid_prices"] = get_suggested_bid_prices(listing.get("base_price"))
        auction_service.sync_auction_status(db, listing, bids=bids_by_listing.get(listing["id"], []))
        items.append(listing)

    return {"items": items, "total": total, "page": page, "page_size": page_size}


def browse_listings(
    exclude_user_id: str | None,
    scope: str,
    category: str | None = None,
    q: str | None = None,
    page: int = 1,
    page_size: int = 12,
) -> dict:
    from services.product_service import _first_image_url

    db = get_supabase_client()
    target_status = {"live": "live", "upcoming": "scheduled", "sold": "sold"}[scope]

    query = (
        db.table("listings")
        .select(
            "id, variant_size, condition_grade, bid_price, auction_start_at, auction_status, "
            "final_price, status, seller_id, products(id, name, brand, images, price, product_type), "
            "bids(id, bidder_id, amount, created_at)"
        )
        .eq("status", "accepted")
        .not_.is_("auction_start_at", "null")
        .order("created_at", foreign_table="bids")
    )
    if scope != "sold" and exclude_user_id:
        # Sold listings are a public record — no reason to hide a seller's own
        # sales from them, unlike live/upcoming where bidding on your own item
        # makes no sense. Anonymous visitors have nothing to exclude.
        query = query.neq("seller_id", exclude_user_id)

    res = query.execute()
    rows = res.data or []

    for r in rows:
        auction_service.sync_auction_status(db, r, bids=r.get("bids") or [])
    rows = [r for r in rows if r.get("auction_status") == target_status]

    if category:
        rows = [r for r in rows if (r.get("products") or {}).get("product_type") == category]
    if q:
        ql = q.strip().lower()
        rows = [
            r
            for r in rows
            if ql in f"{(r.get('products') or {}).get('name', '')} {(r.get('products') or {}).get('brand', '')}".lower()
        ]

    rows.sort(key=lambda r: r.get("auction_start_at") or "", reverse=(scope != "upcoming"))

    total = len(rows)
    start = (page - 1) * page_size
    page_rows = rows[start : start + page_size]

    watched_ids: set[str] = set()
    if exclude_user_id and page_rows:
        watch_res = (
            db.table("listing_watchlist")
            .select("listing_id")
            .eq("user_id", exclude_user_id)
            .in_("listing_id", [r["id"] for r in page_rows])
            .execute()
        )
        watched_ids = {w["listing_id"] for w in (watch_res.data or [])}

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
                "bid_price": r.get("final_price") if scope == "sold" else auction_service.current_price(r),
                "auction_start_at": r.get("auction_start_at"),
                "auction_status": r.get("auction_status"),
                "close_deadline": auction_service.next_close_deadline(r),
                "bid_count": len(r.get("_bids") or []),
                "is_watching": r["id"] in watched_ids,
                "product": product,
            }
        )

    return {"items": items, "total": total, "page": page, "page_size": page_size}


def get_watchlist(user_id: str, page: int = 1, page_size: int = 12) -> dict:
    """The listings a user has saved (heart/watch icon), most recently
    saved first — same item shape as browse_listings so the frontend can
    reuse the same card component."""
    from services.product_service import _first_image_url

    db = get_supabase_client()

    watch_res = (
        db.table("listing_watchlist")
        .select("listing_id, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    watch_rows = watch_res.data or []
    total = len(watch_rows)
    start = (page - 1) * page_size
    page_watch_rows = watch_rows[start : start + page_size]
    if not page_watch_rows:
        return {"items": [], "total": total, "page": page, "page_size": page_size}

    listing_ids = [w["listing_id"] for w in page_watch_rows]
    listings_res = (
        db.table("listings")
        .select(
            "id, variant_size, condition_grade, bid_price, auction_start_at, auction_status, "
            "final_price, status, products(id, name, brand, images, price, product_type), "
            "bids(id, bidder_id, amount, created_at)"
        )
        .in_("id", listing_ids)
        .order("created_at", foreign_table="bids")
        .execute()
    )
    listings_by_id = {r["id"]: r for r in (listings_res.data or [])}

    items = []
    for w in page_watch_rows:
        r = listings_by_id.get(w["listing_id"])
        if not r:
            continue  # listing was deleted since it was saved
        auction_service.sync_auction_status(db, r, bids=r.get("bids") or [])

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
                "bid_price": r.get("final_price") if r.get("auction_status") == "sold" else auction_service.current_price(r),
                "auction_start_at": r.get("auction_start_at"),
                "auction_status": r.get("auction_status"),
                "close_deadline": auction_service.next_close_deadline(r),
                "bid_count": len(r.get("_bids") or []),
                "is_watching": True,
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
    r2_paths = [photo["r2_path"] for photo in (photos_res.data or [])]
    if r2_paths:
        # Each is an independent external R2 call — up to 12 of them for a
        # full photo set, so fire them concurrently rather than one-by-one.
        with ThreadPoolExecutor(max_workers=min(len(r2_paths), 8)) as pool:
            list(pool.map(r2_client.delete_file, r2_paths))

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

    # Each photo's sort_order update is an independent write — fire them
    # concurrently instead of one-by-one (up to 12 sequential round trips).
    def _update(index: int, photo_id: str):
        db.table("listing_photos").update({"sort_order": index}).eq("id", photo_id).eq(
            "listing_id", listing_id
        ).execute()

    with ThreadPoolExecutor(max_workers=min(len(photo_ids), 8) or 1) as pool:
        list(pool.map(lambda pair: _update(*pair), enumerate(photo_ids)))

    return _get_photos(db, listing_id)


def _get_seller_and_product(db, listing: dict) -> tuple[dict | None, dict | None]:
    if not listing.get("product_id"):
        seller_res = db.table("users").select("id, name, email").eq("id", listing["seller_id"]).limit(1).execute()
        return (seller_res.data[0] if seller_res.data else None), None

    with ThreadPoolExecutor(max_workers=2) as pool:
        seller_future = pool.submit(
            lambda: db.table("users").select("id, name, email").eq("id", listing["seller_id"]).limit(1).execute()
        )
        product_future = pool.submit(
            lambda: db.table("products").select("name").eq("id", listing["product_id"]).limit(1).execute()
        )
        seller_res = seller_future.result()
        product_res = product_future.result()

    seller = seller_res.data[0] if seller_res.data else None
    product = product_res.data[0] if product_res.data else None
    return seller, product


def submit_listing(user_id: str, listing_id: str) -> dict:
    db = get_supabase_client()

    # Ownership and photos both only need listing_id — fetch concurrently,
    # then check ownership from the result.
    with ThreadPoolExecutor(max_workers=2) as pool:
        listing_future = pool.submit(
            lambda: db.table("listings").select("*").eq("id", listing_id).limit(1).execute()
        )
        photos_future = pool.submit(_get_photos, db, listing_id)
        listing_res = listing_future.result()
        photos = photos_future.result()

    if not listing_res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found.")
    listing = listing_res.data[0]
    if listing["seller_id"] != user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not own this listing.")

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

    update_res = (
        db.table("listings")
        .update({"status": "pending_review", "submitted_at": _now(), "updated_at": _now()})
        .eq("id", listing_id)
        .execute()
    )
    updated = update_res.data[0]

    seller, product = _get_seller_and_product(db, updated)
    if seller:
        from services.email_service import send_listing_created_email

        try:
            send_listing_created_email(seller["email"], seller["name"], product["name"] if product else "your item")
        except Exception:
            pass  # Email delivery failures shouldn't block a successful submission.

    return _hydrate(db, updated, photos=photos)


def review_listing(listing_id: str, action: str) -> dict:
    db = get_supabase_client()
    res = db.table("listings").select("*").eq("id", listing_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found.")
    listing = res.data[0]

    if listing["status"] != "pending_review":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only listings pending review can be reviewed.")

    new_status = "accepted" if action == "accept" else "rejected"
    update_res = (
        db.table("listings")
        .update({"status": new_status, "reviewed_at": _now(), "updated_at": _now()})
        .eq("id", listing_id)
        .execute()
    )
    updated = update_res.data[0]

    if new_status == "accepted":
        auction_service.sync_auction_status(db, updated)
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


def get_auction_detail(viewer_id: str, listing_id: str) -> dict:
    from services import analytics_service
    from services.product_service import _first_image_url

    db = get_supabase_client()
    res = (
        db.table("listings")
        .select("*, products(id, name, brand, images, price, product_type)")
        .eq("id", listing_id)
        .limit(1)
        .execute()
    )
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found.")
    listing = res.data[0]
    if listing["status"] != "accepted":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "This auction isn't available.")

    is_owner = listing["seller_id"] == viewer_id

    # None of these five depend on each other — only on listing_id/seller_id/
    # viewer_id, all already known. This is the endpoint the frontend polls
    # every few seconds while an auction page is open, so collapsing 6
    # sequential round trips into 1 matters a lot here.
    with ThreadPoolExecutor(max_workers=5) as pool:
        bids_future = pool.submit(auction_service.batch_fetch_bids, db, [listing_id])
        seller_future = pool.submit(
            lambda: db.table("users").select("id, name, avatar_url").eq("id", listing["seller_id"]).limit(1).execute()
        )
        watch_count_future = pool.submit(analytics_service.get_watch_count, db, listing_id)
        is_watching_future = pool.submit(analytics_service.is_watching, db, listing_id, viewer_id)
        photos_future = pool.submit(_get_photos, db, listing_id)
        if not is_owner:
            pool.submit(analytics_service.increment_view_count, db, listing)

        bids_map = bids_future.result()
        seller_res = seller_future.result()
        watch_count = watch_count_future.result()
        is_watching = is_watching_future.result()
        photos = photos_future.result()

    auction_service.sync_auction_status(db, listing, bids=bids_map.get(listing_id, []))

    p = listing.get("products")
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

    bids = sorted(listing.get("_bids") or [], key=lambda b: b["created_at"], reverse=True)
    seller = seller_res.data[0] if seller_res.data else None
    current = auction_service.current_price(listing)

    return {
        "id": listing["id"],
        "product": product,
        "variant_size": listing.get("variant_size"),
        "condition_grade": listing.get("condition_grade"),
        "condition_notes": listing.get("condition_notes"),
        "photos": photos,
        "starting_price": listing.get("bid_price"),
        "current_price": current,
        "min_next_bid": current + 1,
        "auction_status": listing.get("auction_status"),
        "auction_start_at": listing.get("auction_start_at"),
        "close_deadline": auction_service.next_close_deadline(listing),
        "bids": bids,
        "bid_count": len(bids),
        "winner_id": listing.get("winner_id"),
        "final_price": listing.get("final_price"),
        "is_own_listing": listing["seller_id"] == viewer_id,
        "view_count": listing.get("view_count", 0),
        "watch_count": watch_count,
        "is_watching": is_watching,
        "seller": {"id": seller["id"], "name": seller["name"], "avatar_url": seller.get("avatar_url")}
        if seller
        else None,
    }


def get_related_listings(viewer_id: str, listing_id: str, limit: int = 4) -> list[dict]:
    from services.product_service import _first_image_url

    db = get_supabase_client()

    # The candidates query only filters on listing_id/viewer_id (both already
    # known) — it doesn't need anything from the source-listing lookup, which
    # is only used for Python-side filtering afterward. Run both concurrently.
    with ThreadPoolExecutor(max_workers=2) as pool:
        source_future = pool.submit(
            lambda: db.table("listings")
            .select("id, product_id, seller_id, products(product_type)")
            .eq("id", listing_id)
            .limit(1)
            .execute()
        )
        candidates_future = pool.submit(
            lambda: db.table("listings")
            .select(
                "id, variant_size, condition_grade, bid_price, auction_start_at, auction_status, "
                "status, seller_id, products(id, name, brand, images, price, product_type), "
                "bids(id, bidder_id, amount, created_at)"
            )
            .eq("status", "accepted")
            .neq("id", listing_id)
            .neq("seller_id", viewer_id)
            .not_.is_("auction_start_at", "null")
            .order("created_at", foreign_table="bids")
            .execute()
        )
        res = source_future.result()
        candidates_res = candidates_future.result()

    if not res.data:
        return []
    source = res.data[0]
    category = (source.get("products") or {}).get("product_type")

    rows = candidates_res.data or []
    for r in rows:
        auction_service.sync_auction_status(db, r, bids=r.get("bids") or [])
    rows = [r for r in rows if r.get("auction_status") in ("live", "scheduled")]

    # Prefer same seller first, then same category, to surface a coherent
    # "more from this drop" set rather than pure randomness.
    same_seller = [r for r in rows if r["seller_id"] == source["seller_id"]]
    same_category = [
        r for r in rows if category and (r.get("products") or {}).get("product_type") == category and r["seller_id"] != source["seller_id"]
    ]
    ordered = (same_seller + same_category)[:limit]

    items = []
    for r in ordered:
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
                "bid_price": auction_service.current_price(r),
                "auction_start_at": r.get("auction_start_at"),
                "auction_status": r.get("auction_status"),
                "close_deadline": auction_service.next_close_deadline(r),
                "bid_count": len(r.get("_bids") or []),
                "product": product,
            }
        )
    return items


def place_bid(bidder_id: str, listing_id: str, amount: float) -> dict:
    db = get_supabase_client()
    res = db.table("listings").select("*").eq("id", listing_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found.")
    listing = res.data[0]
    if listing["status"] != "accepted":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "This auction isn't available.")

    auction_service.sync_auction_status(db, listing)

    if listing["seller_id"] == bidder_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can't bid on your own listing.")

    if listing.get("auction_status") != "live":
        status_message = {
            "scheduled": "This auction hasn't started yet.",
            "sold": "This auction has already ended.",
            "unsold": "This auction has already ended.",
        }.get(listing.get("auction_status"), "This auction isn't accepting bids right now.")
        raise HTTPException(status.HTTP_400_BAD_REQUEST, status_message)

    bids = listing.get("_bids") or []
    if bids and bids[-1]["bidder_id"] == bidder_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You're already the highest bidder.")

    current = auction_service.current_price(listing)
    if amount <= current:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Your bid must be higher than the current price of ₹{current:.0f}.")

    db.table("bids").insert({"listing_id": listing_id, "bidder_id": bidder_id, "amount": amount}).execute()

    return get_auction_detail(bidder_id, listing_id)
