"""Quickly seed a handful of LIVE listings for the demo seller account, for
manual testing of the /live browse page and auction detail flow.

Usage (from server/, with the venv active):
    python scripts/seed_live_listings.py
    python scripts/seed_live_listings.py --count 5 --email demo.seller01@hype.test

Creates the demo seller if it doesn't exist yet (same convention as
seed_demo_listings.py), picks random products from the already-imported
catalog, and inserts accepted listings with auction_start_at a few seconds in
the past so they show up as "live" immediately.
"""

import argparse
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core.security import hash_password  # noqa: E402
from db.config import get_supabase_client  # noqa: E402
from services.listing_service import get_suggested_bid_prices  # noqa: E402

DEMO_PASSWORD = "DemoPass123!"
CONDITION_GRADES = ("DS", "VNDS", "USED", "BEAT")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def get_or_create_seller(db, email: str) -> dict:
    existing = db.table("users").select("id, name, email").eq("email", email).limit(1).execute()
    if existing.data:
        return existing.data[0]
    name = email.split("@")[0].replace(".", " ").title()
    res = db.table("users").insert({"name": name, "email": email, "password_hash": hash_password(DEMO_PASSWORD)}).execute()
    return res.data[0]


def pick_random_products(db, count: int) -> list[dict]:
    res = db.table("products").select("id, name, price").not_.is_("price", "null").limit(2000).execute()
    rows = res.data or []
    if not rows:
        return []
    return random.sample(rows, k=min(count, len(rows)))


def build_live_listing_row(seller_id: str, product: dict) -> dict:
    price = product.get("price") or 5000
    suggestions = get_suggested_bid_prices(price)
    bid_price = random.choice(suggestions)["price"] if suggestions else round(price * 0.65)
    submitted_at = _now() - timedelta(hours=random.randint(1, 48))
    start = _now() - timedelta(seconds=random.randint(5, 30))
    return {
        "seller_id": seller_id,
        "product_id": product["id"],
        "condition_grade": random.choice(CONDITION_GRADES),
        "condition_notes": "Seeded live demo listing.",
        "base_price": price,
        "bid_price": bid_price,
        "status": "accepted",
        "current_step": 6,
        "submitted_at": submitted_at.isoformat(),
        "reviewed_at": (submitted_at + timedelta(hours=1)).isoformat(),
        "auction_start_at": start.isoformat(),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed a handful of live listings for the demo seller.")
    parser.add_argument("--email", default="demo.seller01@hype.test")
    parser.add_argument("--count", type=int, default=5)
    args = parser.parse_args()

    db = get_supabase_client()

    seller = get_or_create_seller(db, args.email)
    print(f"Seller: {seller['name']} <{seller['email']}>  id={seller['id']}")

    products = pick_random_products(db, args.count)
    if not products:
        print("No products with a price found in the catalog — run import_products.py first.")
        return

    rows = [build_live_listing_row(seller["id"], p) for p in products]
    inserted = db.table("listings").insert(rows).execute().data or []

    print(f"Created {len(inserted)} live listings:")
    for listing, product in zip(inserted, products):
        print(f"  {product['name'][:60]:<60}  /live/{listing['id']}")


if __name__ == "__main__":
    main()
