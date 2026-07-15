"""Seed demo sellers + listings so the Live/Upcoming browse pages have real data.

Usage (from server/, with the venv active):
    python scripts/seed_demo_listings.py

Creates 20 new demo users, each with one listing (90% accepted / 10% rejected),
plus 20 more listings for the existing user id passed via --extra-user-id.
Accepted listings get a mix of past (live) and future (upcoming) auction start
times. Safe to re-run — demo users are upserted on email, and each run adds a
fresh batch of listings (no dedup on listings, since re-running is meant to
grow the demo dataset, not replace it).
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


def create_demo_users(db, count: int) -> list[dict]:
    users = []
    for i in range(1, count + 1):
        email = f"demo.seller{i:02d}@hype.test"
        name = f"Demo Seller {i:02d}"
        existing = db.table("users").select("id, name, email").eq("email", email).limit(1).execute()
        if existing.data:
            users.append(existing.data[0])
            continue
        res = (
            db.table("users")
            .insert({"name": name, "email": email, "password_hash": hash_password(DEMO_PASSWORD)})
            .execute()
        )
        users.append(res.data[0])
    return users


def pick_random_products(db, count: int) -> list[dict]:
    # Pull a large-ish page and sample in Python (avoids relying on SQL-level
    # random ordering for a one-off seed script).
    res = db.table("products").select("id, price").not_.is_("price", "null").limit(2000).execute()
    rows = res.data or []
    return random.sample(rows, k=min(count, len(rows)))


def build_listing_row(seller_id: str, product: dict, is_accepted: bool) -> dict:
    price = product.get("price") or 5000
    suggestions = get_suggested_bid_prices(price)
    bid_price = random.choice(suggestions)["price"] if suggestions else round(price * 0.65)

    submitted_at = _now() - timedelta(days=random.randint(1, 5))
    row = {
        "seller_id": seller_id,
        "product_id": product["id"],
        "condition_grade": random.choice(CONDITION_GRADES),
        "condition_notes": "Seeded demo listing.",
        "base_price": price,
        "bid_price": bid_price,
        "status": "accepted" if is_accepted else "rejected",
        "current_step": 6,
        "submitted_at": submitted_at.isoformat(),
        "reviewed_at": (submitted_at + timedelta(hours=random.randint(2, 24))).isoformat(),
    }
    if is_accepted:
        # Split accepted listings roughly evenly between "live" (started a minute
        # ago, still inside the no-bid timeout so it stays biddable for a bit)
        # and "upcoming" (starts in the next few days).
        if random.random() < 0.5:
            start = _now() - timedelta(minutes=random.randint(1, 3))
        else:
            start = _now() + timedelta(days=random.randint(1, 10))
        row["auction_start_at"] = start.isoformat()
    return row


def seed_listings(db, seller_ids: list[str], products: list[dict]) -> tuple[int, int]:
    """One listing per (seller_id, product) pair, 90% accepted / 10% rejected overall."""
    n = len(seller_ids)
    accepted_count = round(n * 0.9)
    flags = [True] * accepted_count + [False] * (n - accepted_count)
    random.shuffle(flags)

    rows = [
        build_listing_row(seller_id, product, is_accepted)
        for seller_id, product, is_accepted in zip(seller_ids, products, flags)
    ]
    if rows:
        db.table("listings").insert(rows).execute()
    return accepted_count, n - accepted_count


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed demo sellers + listings.")
    parser.add_argument("--user-count", type=int, default=20)
    parser.add_argument("--extra-user-id", default="36fe7e44-a5c4-4cc1-8431-03a50c9b2961")
    parser.add_argument("--extra-listing-count", type=int, default=20)
    args = parser.parse_args()

    db = get_supabase_client()

    print(f"Creating/loading {args.user_count} demo users...")
    demo_users = create_demo_users(db, args.user_count)
    print(f"  {len(demo_users)} demo users ready.")

    print("Seeding one listing per demo user (90% accepted / 10% rejected)...")
    products = pick_random_products(db, len(demo_users))
    if not products:
        print("  No products available, aborting.")
        return
    seller_ids = [u["id"] for u in demo_users][: len(products)]
    accepted, rejected = seed_listings(db, seller_ids, products)
    print(f"  {len(products)} listings created ({accepted} accepted, {rejected} rejected).")

    extra_user = db.table("users").select("id, name, email").eq("id", args.extra_user_id).limit(1).execute()
    if not extra_user.data:
        print(f"Warning: user {args.extra_user_id} not found, skipping extra listings.")
    else:
        print(f"Seeding {args.extra_listing_count} listings for user {args.extra_user_id}...")
        extra_products = pick_random_products(db, args.extra_listing_count)
        extra_seller_ids = [args.extra_user_id] * len(extra_products)
        accepted, rejected = seed_listings(db, extra_seller_ids, extra_products)
        print(f"  {len(extra_products)} listings created ({accepted} accepted, {rejected} rejected).")

    print("Done.")


if __name__ == "__main__":
    main()
