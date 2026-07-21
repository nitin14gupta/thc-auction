"""Post-auction payment flow.

When a listing closes `sold`, the winner gets an `orders` row with a
PAYMENT_WINDOW_MINUTES-minute deadline (see auction_service.sync_auction_status,
which calls create_order_for_winner). Like auction status, payment deadlines
are enforced lazily: sync_order_status is called whenever an order is read
(list_my_orders, create_razorpay_order, verify_payment). If the deadline has
passed unpaid, the order expires and the win cascades to the next-highest
distinct bidder (a fresh order + a fresh deadline for them), or the listing
is marked unsold if there's no one left to offer it to.
"""

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status

from core.config import settings
from db.config import get_supabase_client

PAYMENT_WINDOW = timedelta(minutes=settings.PAYMENT_WINDOW_MINUTES)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _get_user(db, user_id: str) -> dict | None:
    res = db.table("users").select("id, name, email").eq("id", user_id).limit(1).execute()
    return res.data[0] if res.data else None


def _get_product_name(db, listing: dict) -> str:
    if not listing.get("product_id"):
        return "your item"
    res = db.table("products").select("name").eq("id", listing["product_id"]).limit(1).execute()
    return res.data[0]["name"] if res.data else "your item"


def create_order_for_winner(db, listing: dict) -> dict | None:
    """Called by auction_service right after a listing closes sold. Idempotent —
    won't double-create if an order for this exact winner+amount already exists."""
    winner_id = listing.get("winner_id")
    amount = listing.get("final_price")
    if not winner_id or not amount:
        return None

    existing = (
        db.table("orders")
        .select("*")
        .eq("listing_id", listing["id"])
        .eq("buyer_id", winner_id)
        .eq("status", "pending_payment")
        .limit(1)
        .execute()
    )
    if existing.data:
        return existing.data[0]

    deadline = _now() + PAYMENT_WINDOW
    try:
        res = (
            db.table("orders")
            .insert(
                {
                    "listing_id": listing["id"],
                    "buyer_id": winner_id,
                    "amount": amount,
                    "status": "pending_payment",
                    "payment_deadline": deadline.isoformat(),
                }
            )
            .execute()
        )
        order = res.data[0]
    except Exception:
        # Someone else's concurrent call already created the pending order for
        # this listing (idx_orders_one_pending_per_listing rejected ours) — use
        # theirs instead of erroring or double-emailing the winner.
        existing = (
            db.table("orders")
            .select("*")
            .eq("listing_id", listing["id"])
            .eq("status", "pending_payment")
            .limit(1)
            .execute()
        )
        return existing.data[0] if existing.data else None

    buyer = _get_user(db, winner_id)
    if buyer:
        from services.email_service import send_auction_won_email

        try:
            product_name = _get_product_name(db, listing)
            send_auction_won_email(
                buyer["email"], buyer["name"], product_name, amount, settings.PAYMENT_WINDOW_MINUTES
            )
        except Exception:
            pass

    return order


def _next_distinct_bidder(db, listing_id: str, exclude_bidder_id: str) -> dict | None:
    res = (
        db.table("bids")
        .select("bidder_id, amount, created_at")
        .eq("listing_id", listing_id)
        .neq("bidder_id", exclude_bidder_id)
        .order("amount", desc=True)
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def _handle_expired_order(db, order: dict) -> None:
    listing_res = db.table("listings").select("*").eq("id", order["listing_id"]).limit(1).execute()
    if not listing_res.data:
        return
    listing = listing_res.data[0]

    # These three only depend on `listing`/`order`, already in hand — not on
    # each other — so fetch them concurrently instead of one after another.
    with ThreadPoolExecutor(max_workers=3) as pool:
        buyer_future = pool.submit(_get_user, db, order["buyer_id"])
        product_name_future = pool.submit(_get_product_name, db, listing)
        next_bid_future = pool.submit(_next_distinct_bidder, db, listing["id"], order["buyer_id"])
        expired_buyer = buyer_future.result()
        product_name = product_name_future.result()
        next_bid = next_bid_future.result()

    if next_bid:
        db.table("listings").update(
            {
                "winner_id": next_bid["bidder_id"],
                "final_price": next_bid["amount"],
                "sold_at": _now().isoformat(),
            }
        ).eq("id", listing["id"]).execute()
        listing["winner_id"] = next_bid["bidder_id"]
        listing["final_price"] = next_bid["amount"]

        if expired_buyer:
            from services.email_service import send_payment_expired_reassigned_email

            try:
                send_payment_expired_reassigned_email(expired_buyer["email"], expired_buyer["name"], product_name)
            except Exception:
                pass

        create_order_for_winner(db, listing)
    else:
        db.table("listings").update(
            {"auction_status": "unsold", "winner_id": None, "final_price": None}
        ).eq("id", listing["id"]).execute()

        if expired_buyer:
            from services.email_service import send_payment_expired_unsold_email

            try:
                send_payment_expired_unsold_email(expired_buyer["email"], expired_buyer["name"], product_name)
            except Exception:
                pass


def sync_order_status(db, order: dict) -> dict:
    if order.get("status") != "pending_payment":
        return order

    deadline = datetime.fromisoformat(order["payment_deadline"])
    if _now() < deadline:
        return order

    # Optimistic concurrency: WHERE status='pending_payment' means only the
    # first of any racing callers actually flips it and runs the cascade
    # (reassign to next bidder / mark unsold + emails). The loser just
    # refetches the already-expired row.
    res = (
        db.table("orders")
        .update({"status": "expired"})
        .eq("id", order["id"])
        .eq("status", "pending_payment")
        .execute()
    )
    if not res.data:
        refreshed = db.table("orders").select("*").eq("id", order["id"]).limit(1).execute()
        return refreshed.data[0] if refreshed.data else order

    order["status"] = "expired"
    _handle_expired_order(db, order)
    return order


def _get_owned_order(db, order_id: str, user_id: str) -> dict:
    res = db.table("orders").select("*").eq("id", order_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found.")
    order = res.data[0]
    if order["buyer_id"] != user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not own this order.")
    return order


def list_my_orders(user_id: str, page: int = 1, page_size: int = 10) -> dict:
    db = get_supabase_client()
    res = (
        db.table("orders")
        .select("*", count="exact")
        .eq("buyer_id", user_id)
        .order("created_at", desc=True)
        .range((page - 1) * page_size, (page - 1) * page_size + page_size - 1)
        .execute()
    )
    orders = [sync_order_status(db, o) for o in (res.data or [])]

    listing_ids = list({o["listing_id"] for o in orders})
    listings_by_id: dict[str, dict] = {}
    if listing_ids:
        listings_res = (
            db.table("listings")
            .select("id, product_id, products(id, name, brand, images)")
            .in_("id", listing_ids)
            .execute()
        )
        for row in listings_res.data or []:
            listings_by_id[row["id"]] = row

    from services.product_service import _first_image_url

    items = []
    for o in orders:
        listing = listings_by_id.get(o["listing_id"])
        product = (listing or {}).get("products")
        items.append(
            {
                **o,
                "product": {
                    "id": product["id"],
                    "name": product["name"],
                    "brand": product.get("brand"),
                    "image_url": _first_image_url(product.get("images")),
                }
                if product
                else None,
            }
        )

    return {"items": items, "total": res.count or 0, "page": page, "page_size": page_size}


def create_razorpay_order(user_id: str, order_id: str) -> dict:
    from utils.razorpay_client import razorpay_client

    db = get_supabase_client()
    order = _get_owned_order(db, order_id, user_id)
    order = sync_order_status(db, order)

    if order["status"] != "pending_payment":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This order is no longer payable.")

    rp_order = razorpay_client.create_order(order["amount"], receipt=order["id"])
    db.table("orders").update({"razorpay_order_id": rp_order["id"]}).eq("id", order_id).execute()

    return {
        "razorpay_order_id": rp_order["id"],
        "amount": order["amount"],
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
    }


def verify_payment(
    user_id: str,
    order_id: str,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> dict:
    from services.email_service import send_item_sold_paid_email, send_payment_confirmed_email
    from utils.razorpay_client import razorpay_client

    db = get_supabase_client()
    order = _get_owned_order(db, order_id, user_id)
    order = sync_order_status(db, order)

    if order["status"] != "pending_payment":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This order is no longer payable.")
    if order.get("razorpay_order_id") != razorpay_order_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Order mismatch.")

    if not razorpay_client.verify_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Payment verification failed.")

    update_res = (
        db.table("orders")
        .update({"status": "paid", "razorpay_payment_id": razorpay_payment_id, "paid_at": _now().isoformat()})
        .eq("id", order_id)
        .execute()
    )
    updated_order = update_res.data[0]

    # Listing and buyer lookups are independent — no reason to wait for one
    # before firing the other.
    with ThreadPoolExecutor(max_workers=2) as pool:
        listing_future = pool.submit(
            lambda: db.table("listings").select("*").eq("id", order["listing_id"]).limit(1).execute()
        )
        buyer_future = pool.submit(_get_user, db, user_id)
        listing_res = listing_future.result()
        buyer = buyer_future.result()
    listing = listing_res.data[0] if listing_res.data else None

    if listing and buyer:
        product_name = _get_product_name(db, listing)
        try:
            send_payment_confirmed_email(buyer["email"], buyer["name"], product_name, order["amount"])
        except Exception:
            pass

        seller = _get_user(db, listing["seller_id"])
        if seller:
            try:
                send_item_sold_paid_email(seller["email"], seller["name"], product_name, order["amount"])
            except Exception:
                pass

    return updated_order
