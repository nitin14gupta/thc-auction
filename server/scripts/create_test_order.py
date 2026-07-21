"""Create a sold listing + payable order for a given user, for testing My
Orders / Razorpay checkout without waiting through the real bid/soft-close flow.

Usage (from server/, with the venv active):
    python scripts/create_test_order.py --user-id 302719d9-02a7-47fc-846a-0d4590f6fe2a
    python scripts/create_test_order.py --user-id <id> --listing-id <existing accepted listing>
    python scripts/create_test_order.py --user-id <id> --amount 15000
"""

import argparse
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from db.config import get_supabase_client  # noqa: E402
from services import order_service  # noqa: E402
from services.listing_service import get_suggested_bid_prices  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a test sold listing + order for a buyer.")
    parser.add_argument("--user-id", default="302719d9-02a7-47fc-846a-0d4590f6fe2a", help="Buyer user id.")
    parser.add_argument("--listing-id", default=None, help="Reuse an existing accepted listing instead of creating one.")
    parser.add_argument("--amount", type=float, default=None, help="Winning bid amount (defaults to a suggested price).")
    args = parser.parse_args()

    db = get_supabase_client()

    buyer_res = db.table("users").select("id, name, email").eq("id", args.user_id).limit(1).execute()
    if not buyer_res.data:
        print(f"No user found with id {args.user_id}")
        return
    buyer = buyer_res.data[0]
    print(f"Buyer: {buyer['name']} <{buyer['email']}>")

    if args.listing_id:
        listing_res = db.table("listings").select("*").eq("id", args.listing_id).limit(1).execute()
        if not listing_res.data:
            print(f"No listing found with id {args.listing_id}")
            return
        listing = listing_res.data[0]
        amount = args.amount or listing.get("bid_price") or listing.get("base_price") or 5000
        now = datetime.now(timezone.utc)
        db.table("listings").update(
            {
                "status": "accepted",
                "auction_status": "sold",
                "winner_id": args.user_id,
                "final_price": amount,
                "sold_at": now.isoformat(),
            }
        ).eq("id", listing["id"]).execute()
        listing.update({"auction_status": "sold", "winner_id": args.user_id, "final_price": amount})
        db.table("bids").insert({"listing_id": listing["id"], "bidder_id": args.user_id, "amount": amount}).execute()
    else:
        seller_res = db.table("users").select("id").neq("id", args.user_id).limit(1).execute()
        if not seller_res.data:
            print("No other user available to act as seller.")
            return
        seller_id = seller_res.data[0]["id"]

        products = db.table("products").select("id, price").not_.is_("price", "null").limit(50).execute().data
        product = random.choice(products)
        price = product["price"]
        amount = args.amount or get_suggested_bid_prices(price)[0]["price"]

        now = datetime.now(timezone.utc)
        row = {
            "seller_id": seller_id,
            "product_id": product["id"],
            "condition_grade": "DS",
            "condition_notes": "Test order — created by create_test_order.py.",
            "base_price": price,
            "bid_price": amount,
            "status": "accepted",
            "current_step": 6,
            "auction_start_at": (now - timedelta(minutes=10)).isoformat(),
            "auction_status": "sold",
            "winner_id": args.user_id,
            "final_price": amount,
            "sold_at": now.isoformat(),
        }
        listing = db.table("listings").insert(row).execute().data[0]
        db.table("bids").insert({"listing_id": listing["id"], "bidder_id": args.user_id, "amount": amount}).execute()
        print(f"Created listing {listing['id']} (product: {product['id']})")

    order = order_service.create_order_for_winner(db, listing)
    if not order:
        print("Order creation failed — check that the `orders` table/migration has been run.")
        return

    print(f"Listing: {listing['id']}  status=sold  amount={amount}")
    print(f"Order:   {order['id']}  status={order['status']}  deadline={order['payment_deadline']}")
    print("Open /dashboard/my-orders while logged in as this user to pay.")


if __name__ == "__main__":
    main()
