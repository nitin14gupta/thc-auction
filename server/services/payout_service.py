"""Seller payouts.

A payout only happens after the buyer has paid (order.status == 'paid') AND
an admin has manually confirmed the item was authenticated and delivered —
there's no automated delivery-tracking integration, so this stays a manual,
admin-triggered step (mark_order_paid_out). Until that happens, a paid order
shows as "processing" in the seller's payout history; once an admin marks it,
a `payouts` row is created and it flips to "paid".

Commission structure: 8% under ₹50,000, 10% at or above ₹50,000. (The source
mockup showed "7-8%" for the lower tier — flattened to a single 8% rate here
since a range isn't a computable number; adjust COMMISSION_RATE_LOW if a
specific split within that band is needed.)
"""

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

from fastapi import HTTPException, status

from db.config import get_supabase_client
from services.product_service import _first_image_url

COMMISSION_THRESHOLD = 50_000
COMMISSION_RATE_LOW = 0.08
COMMISSION_RATE_HIGH = 0.10


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def compute_commission(sale_price: float) -> tuple[float, float]:
    """Returns (commission_amount, rate_fraction)."""
    rate = COMMISSION_RATE_LOW if sale_price < COMMISSION_THRESHOLD else COMMISSION_RATE_HIGH
    return round(sale_price * rate, 2), rate


def get_seller_payouts(seller_id: str) -> dict:
    db = get_supabase_client()

    listings_res = db.table("listings").select("id, product_id").eq("seller_id", seller_id).execute()
    listings_by_id = {l["id"]: l for l in (listings_res.data or [])}
    listing_ids = list(listings_by_id.keys())

    if not listing_ids:
        return {"pending_payout": 0.0, "pending_count": 0, "history": []}

    # Paid orders and existing payout rows for this seller's listings are
    # independent reads — fetch concurrently.
    with ThreadPoolExecutor(max_workers=2) as pool:
        orders_future = pool.submit(
            lambda: db.table("orders").select("*").in_("listing_id", listing_ids).eq("status", "paid").execute()
        )
        payouts_future = pool.submit(
            lambda: db.table("payouts").select("*").in_("listing_id", listing_ids).execute()
        )
        paid_orders = orders_future.result().data or []
        payouts = payouts_future.result().data or []

    payouts_by_listing = {p["listing_id"]: p for p in payouts}

    product_ids = list({listings_by_id[o["listing_id"]]["product_id"] for o in paid_orders if listings_by_id.get(o["listing_id"], {}).get("product_id")})
    products_by_id: dict[str, dict] = {}
    if product_ids:
        products_res = db.table("products").select("id, name, brand, images").in_("id", product_ids).execute()
        products_by_id = {p["id"]: p for p in (products_res.data or [])}

    history = []
    pending_payout = 0.0
    pending_count = 0

    for order in paid_orders:
        listing = listings_by_id.get(order["listing_id"], {})
        product = products_by_id.get(listing.get("product_id"))
        payout = payouts_by_listing.get(order["listing_id"])

        if payout:
            commission = round(order["amount"] - payout["amount"], 2)
            rate = round(commission / order["amount"], 4) if order["amount"] else 0
            payout_amount = payout["amount"]
            row_status = "paid"
            row_date = payout["created_at"]
        else:
            commission, rate = compute_commission(order["amount"])
            payout_amount = round(order["amount"] - commission, 2)
            row_status = "processing"
            row_date = order.get("paid_at")
            pending_payout += payout_amount
            pending_count += 1

        image_url = _first_image_url(product.get("images")) if product else None

        history.append(
            {
                "order_id": order["id"],
                "listing_id": order["listing_id"],
                "product_name": (product or {}).get("name", "—"),
                "product_brand": (product or {}).get("brand"),
                "image_url": image_url,
                "sale_price": order["amount"],
                "commission": commission,
                "commission_rate_pct": round(rate * 100, 1),
                "payout_amount": payout_amount,
                "status": row_status,
                "date": row_date,
            }
        )

    history.sort(key=lambda r: r["date"] or "", reverse=True)

    return {
        "pending_payout": round(pending_payout, 2),
        "pending_count": pending_count,
        "history": history,
    }


def mark_order_paid_out(order_id: str) -> dict:
    db = get_supabase_client()

    order_res = db.table("orders").select("*").eq("id", order_id).limit(1).execute()
    if not order_res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found.")
    order = order_res.data[0]
    if order["status"] != "paid":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This order hasn't been paid by the buyer yet.")

    listing_res = db.table("listings").select("id, seller_id").eq("id", order["listing_id"]).limit(1).execute()
    if not listing_res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found.")
    listing = listing_res.data[0]

    commission, rate = compute_commission(order["amount"])
    payout_amount = round(order["amount"] - commission, 2)

    try:
        res = (
            db.table("payouts")
            .insert(
                {
                    "seller_id": listing["seller_id"],
                    "listing_id": listing["id"],
                    "amount": payout_amount,
                    "note": f"Sale ₹{order['amount']:,.0f} minus {int(rate * 100)}% commission (₹{commission:,.0f})",
                }
            )
            .execute()
        )
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This listing has already been paid out.")

    return res.data[0]
