"""View tracking, watchlist, and seller-facing analytics (overview + charts).

Total Earnings is deliberately NOT derived from orders/final_price — a real
payout only happens once the buyer has paid and the item has been delivered
via the courier, which today is a manual, admin-confirmed step (no admin
panel yet). The `payouts` table is the source of truth and starts empty;
until an admin tool exists to insert rows there, Total Earnings reads ₹0,
which is the honest state rather than a number implied by unpaid/undelivered
sales.
"""

from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status

from db.config import get_supabase_client

ACTIVE_AUCTION_STATUSES = ("scheduled", "live")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def increment_view_count(db, listing: dict) -> None:
    try:
        db.table("listings").update({"view_count": (listing.get("view_count") or 0) + 1}).eq(
            "id", listing["id"]
        ).execute()
    except Exception:
        pass  # A missed view count is never worth failing the page load over.


def get_watch_count(db, listing_id: str) -> int:
    res = db.table("listing_watchlist").select("id", count="exact").eq("listing_id", listing_id).execute()
    return res.count or 0


def is_watching(db, listing_id: str, user_id: str) -> bool:
    res = (
        db.table("listing_watchlist")
        .select("id")
        .eq("listing_id", listing_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    return bool(res.data)


def toggle_watch(user_id: str, listing_id: str) -> dict:
    db = get_supabase_client()
    listing_res = db.table("listings").select("id, seller_id").eq("id", listing_id).limit(1).execute()
    if not listing_res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found.")
    if listing_res.data[0]["seller_id"] == user_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can't watch your own listing.")

    existing = (
        db.table("listing_watchlist")
        .select("id")
        .eq("listing_id", listing_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if existing.data:
        db.table("listing_watchlist").delete().eq("id", existing.data[0]["id"]).execute()
        now_watching = False
    else:
        try:
            db.table("listing_watchlist").insert({"listing_id": listing_id, "user_id": user_id}).execute()
        except Exception:
            pass  # Unique-constraint race — someone else's toggle already added it.
        now_watching = True

    return {"is_watching": now_watching, "watch_count": get_watch_count(db, listing_id)}


def _get_seller_listings(db, seller_id: str) -> list[dict]:
    res = (
        db.table("listings")
        .select("id, status, auction_status, final_price, base_price, view_count, created_at, submitted_at, sold_at, product_id")
        .eq("seller_id", seller_id)
        .execute()
    )
    return res.data or []


def _get_active_preview(db, seller_id: str) -> list[dict]:
    from services.product_service import _first_image_url

    res = (
        db.table("listings")
        .select("id, bid_price, final_price, products(id, name, images, price)")
        .eq("seller_id", seller_id)
        .eq("status", "accepted")
        .in_("auction_status", list(ACTIVE_AUCTION_STATUSES))
        .order("created_at", desc=True)
        .limit(4)
        .execute()
    )
    preview = []
    for l in res.data or []:
        p = l.get("products")
        if not p:
            continue
        preview.append(
            {
                "id": l["id"],
                "name": p["name"],
                "image_url": _first_image_url(p.get("images")),
                "price": l.get("bid_price") or p.get("price"),
            }
        )
    return preview


def get_seller_overview(seller_id: str) -> dict:
    db = get_supabase_client()

    # These three only need seller_id — none of them depend on each other's
    # results — so fetch all three concurrently instead of back-to-back.
    with ThreadPoolExecutor(max_workers=3) as pool:
        listings_future = pool.submit(_get_seller_listings, db, seller_id)
        payouts_future = pool.submit(
            lambda: db.table("payouts")
            .select("amount, created_at")
            .eq("seller_id", seller_id)
            .order("created_at", desc=True)
            .execute()
        )
        active_preview_future = pool.submit(_get_active_preview, db, seller_id)

        listings = listings_future.result()
        payouts = payouts_future.result().data or []
        active_preview = active_preview_future.result()

    listing_ids = [l["id"] for l in listings]
    product_ids = list({l["product_id"] for l in listings if l.get("product_id")})

    active_listings = sum(1 for l in listings if l["status"] == "accepted" and l.get("auction_status") in ACTIVE_AUCTION_STATUSES)
    pending_review = sum(1 for l in listings if l["status"] == "pending_review")
    total_earnings = sum(p["amount"] for p in payouts)

    # Both depend on `listings` (product_ids / listing_ids), but not on each
    # other, so they can still run concurrently once listings are in hand.
    with ThreadPoolExecutor(max_workers=2) as pool:
        products_future = (
            pool.submit(lambda: db.table("products").select("id, name").in_("id", product_ids).execute())
            if product_ids
            else None
        )
        bids_future = (
            pool.submit(
                lambda: db.table("bids")
                .select("amount, created_at, listing_id")
                .in_("listing_id", listing_ids)
                .order("created_at", desc=True)
                .limit(20)
                .execute()
            )
            if listing_ids
            else None
        )
        products_by_id = {p["id"]: p for p in (products_future.result().data or [])} if products_future else {}
        recent_bids = bids_future.result().data or [] if bids_future else []

    events = []
    for l in listings:
        product_name = products_by_id.get(l.get("product_id"), {}).get("name", "your item")
        if l.get("sold_at"):
            events.append({"type": "sold", "text": f'"{product_name}" sold', "at": l["sold_at"]})
        elif l.get("submitted_at"):
            events.append({"type": "submitted", "text": f'Listing submitted: "{product_name}"', "at": l["submitted_at"]})
        elif l.get("created_at"):
            events.append({"type": "created", "text": f'New listing created: "{product_name}"', "at": l["created_at"]})

    listings_by_id = {l["id"]: l for l in listings}
    for b in recent_bids:
        listing = listings_by_id.get(b["listing_id"], {})
        product_name = products_by_id.get(listing.get("product_id"), {}).get("name", "your item")
        events.append(
            {
                "type": "bid",
                "text": f'New bid of ₹{b["amount"]:,.0f} on "{product_name}"',
                "at": b["created_at"],
            }
        )

    for p in payouts[:10]:
        events.append({"type": "payout", "text": f'Payout of ₹{p["amount"]:,.0f} initiated', "at": p["created_at"]})

    events.sort(key=lambda e: e["at"], reverse=True)

    return {
        "active_listings": active_listings,
        "pending_review": pending_review,
        "total_earnings": total_earnings,
        "recent_activity": events[:8],
        "active_listings_preview": active_preview,
    }


def get_seller_analytics(seller_id: str, days: int = 90) -> dict:
    db = get_supabase_client()

    with ThreadPoolExecutor(max_workers=2) as pool:
        listings_future = pool.submit(_get_seller_listings, db, seller_id)
        payouts_future = pool.submit(
            lambda: db.table("payouts").select("amount, created_at").eq("seller_id", seller_id).execute()
        )
        listings = listings_future.result()
        payouts = payouts_future.result().data or []

    listing_ids = [l["id"] for l in listings]
    product_ids = list({l["product_id"] for l in listings if l.get("product_id")})
    total_earnings = sum(p["amount"] for p in payouts)
    total_views = sum(l.get("view_count") or 0 for l in listings)

    # Bids, watchlist rows, and products all depend only on listings/product_ids
    # (already in hand) — not on each other — and the watchlist rows serve
    # both the total count and the per-listing breakdown, so there's no
    # separate count-only query needed.
    with ThreadPoolExecutor(max_workers=3) as pool:
        bids_future = (
            pool.submit(
                lambda: db.table("bids").select("amount, created_at, listing_id").in_("listing_id", listing_ids).execute()
            )
            if listing_ids
            else None
        )
        watch_future = (
            pool.submit(lambda: db.table("listing_watchlist").select("listing_id").in_("listing_id", listing_ids).execute())
            if listing_ids
            else None
        )
        products_future = (
            pool.submit(lambda: db.table("products").select("id, name, price").in_("id", product_ids).execute())
            if product_ids
            else None
        )
        bids = bids_future.result().data or [] if bids_future else []
        watch_rows = watch_future.result().data or [] if watch_future else []
        products_by_id = {p["id"]: p for p in (products_future.result().data or [])} if products_future else {}

    watch_by_listing: dict[str, int] = defaultdict(int)
    for row in watch_rows:
        watch_by_listing[row["listing_id"]] += 1
    watch_count = len(watch_rows)

    cutoff = _now() - timedelta(days=days)

    def _week_bucket(ts: str) -> str:
        d = datetime.fromisoformat(ts)
        monday = d - timedelta(days=d.weekday())
        return monday.date().isoformat()

    earnings_by_week: dict[str, float] = defaultdict(float)
    for p in payouts:
        if datetime.fromisoformat(p["created_at"]) >= cutoff:
            earnings_by_week[_week_bucket(p["created_at"])] += p["amount"]

    bids_by_week: dict[str, int] = defaultdict(int)
    for b in bids:
        if datetime.fromisoformat(b["created_at"]) >= cutoff:
            bids_by_week[_week_bucket(b["created_at"])] += 1

    weeks = sorted(set(earnings_by_week) | set(bids_by_week))
    earnings_over_time = [{"period": w, "amount": round(earnings_by_week.get(w, 0), 2)} for w in weeks]
    bids_over_time = [{"period": w, "count": bids_by_week.get(w, 0)} for w in weeks]

    bids_by_listing: dict[str, list[dict]] = defaultdict(list)
    for b in bids:
        bids_by_listing[b["listing_id"]].append(b)

    performance = []
    for l in listings:
        if l["status"] != "accepted":
            continue
        product = products_by_id.get(l.get("product_id"))
        listing_bids = bids_by_listing.get(l["id"], [])
        views = l.get("view_count") or 0
        bid_count = len(listing_bids)
        conversion_rate = round((bid_count / views) * 100, 1) if views else 0.0
        final_price = l.get("final_price")
        market_price = (product or {}).get("price")
        vs_market = None
        if final_price and market_price:
            vs_market = round(((final_price - market_price) / market_price) * 100, 1)

        performance.append(
            {
                "listing_id": l["id"],
                "product_name": (product or {}).get("name", "—"),
                "views": views,
                "watchlisted": watch_by_listing.get(l["id"], 0),
                "bids": bid_count,
                "conversion_rate": conversion_rate,
                "final_price": final_price,
                "vs_market_pct": vs_market,
            }
        )
    performance.sort(key=lambda r: r["views"], reverse=True)

    return {
        "total_earnings": total_earnings,
        "bids_received": len(bids),
        "listing_views": total_views,
        "watchlisted": watch_count,
        "earnings_over_time": earnings_over_time,
        "bids_over_time": bids_over_time,
        "listing_performance": performance,
    }
