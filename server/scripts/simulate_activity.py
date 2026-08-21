"""Fake-activity bot: makes the site look alive by growing the user base,
topping up the live/upcoming listing pool, and driving real bids through the
HTTP API. Meant to run on a schedule (every 15 minutes in production, via the
systemd timer in deploy/thc-auction-simulate.timer).

What it does each run:
  1. Registers a handful of new "bot" users directly in the DB (cheap, no
     need to hit /auth/register — same convention as seed_demo_listings.py).
  2. Tops up the pool of accepted listings (live + upcoming) toward a target
     range by creating new listings for random bot sellers on random
     products, split between "starts now" (live) and "starts later"
     (upcoming) — again written straight to the DB, matching the existing
     seed scripts. This intentionally skips photos/submit/review: those
     endpoints are exercised for real by actual sellers, this script's job
     is to keep the browse pages populated.
  3. Places real bids through the live HTTP API (GET .../auction then POST
     .../bids, exactly what the browser does), using short-lived JWTs minted
     in-process for a handful of bot bidders per listing. This is the part
     that actually exercises the auction business logic (min bid, soft
     close, winner/order creation) end to end.

Usage (from server/, with the venv active):
    python scripts/simulate_activity.py
    python scripts/simulate_activity.py --dry-run

Configuration is via environment variables (all optional, sane defaults):
    SIMULATE_API_BASE_URL        default: http://127.0.0.1:8000
    SIMULATE_MAX_BOT_USERS       default: 400
    SIMULATE_NEW_USERS_MIN/MAX   default: 4 / 5
    SIMULATE_TARGET_LIVE_MIN/MAX default: 100 / 200
    SIMULATE_MAX_NEW_LISTINGS    default: 20   (cap per run, so growth is gradual)
    SIMULATE_MAX_BID_LISTINGS    default: 25   (how many live auctions to touch per run)
    SIMULATE_BID_ROUNDS_MIN/MAX  default: 2 / 4
    SIMULATE_BID_DELAY_SECONDS   default: 2
"""

import argparse
import logging
import os
import random
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx  # noqa: E402

from core.security import create_access_token, hash_password  # noqa: E402
from db.config import get_supabase_client  # noqa: E402
from services.listing_service import get_suggested_bid_prices  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
log = logging.getLogger("simulate_activity")

BOT_EMAIL_DOMAIN = "hype.bot"
BOT_PASSWORD = "BotTraffic123!"
CONDITION_GRADES = ("DS", "VNDS", "USED", "BEAT")


def _env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    return int(value) if value else default


API_BASE_URL = os.getenv("SIMULATE_API_BASE_URL", "http://127.0.0.1:8000")
MAX_BOT_USERS = _env_int("SIMULATE_MAX_BOT_USERS", 400)
NEW_USERS_MIN = _env_int("SIMULATE_NEW_USERS_MIN", 4)
NEW_USERS_MAX = _env_int("SIMULATE_NEW_USERS_MAX", 5)
TARGET_LIVE_MIN = _env_int("SIMULATE_TARGET_LIVE_MIN", 100)
TARGET_LIVE_MAX = _env_int("SIMULATE_TARGET_LIVE_MAX", 200)
MAX_NEW_LISTINGS = _env_int("SIMULATE_MAX_NEW_LISTINGS", 20)
MAX_BID_LISTINGS = _env_int("SIMULATE_MAX_BID_LISTINGS", 25)
BID_ROUNDS_MIN = _env_int("SIMULATE_BID_ROUNDS_MIN", 2)
BID_ROUNDS_MAX = _env_int("SIMULATE_BID_ROUNDS_MAX", 4)
BID_DELAY_SECONDS = _env_int("SIMULATE_BID_DELAY_SECONDS", 2)


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# 1. Grow the bot user pool
# ---------------------------------------------------------------------------
def get_bot_users(db) -> list[dict]:
    res = db.table("users").select("id, name, email").like("email", f"%@{BOT_EMAIL_DOMAIN}").execute()
    return res.data or []


def create_bot_users(db, existing: list[dict], dry_run: bool) -> list[dict]:
    if len(existing) >= MAX_BOT_USERS:
        log.info("Bot pool already at cap (%d), skipping new user creation.", len(existing))
        return []

    count = min(random.randint(NEW_USERS_MIN, NEW_USERS_MAX), MAX_BOT_USERS - len(existing))
    existing_emails = {u["email"] for u in existing}
    next_index = len(existing) + 1

    rows = []
    while len(rows) < count:
        email = f"bot{next_index:05d}@{BOT_EMAIL_DOMAIN}"
        next_index += 1
        if email in existing_emails:
            continue
        rows.append({
            "name": f"Bot Buyer {next_index - 1:05d}",
            "email": email,
            "password_hash": hash_password(BOT_PASSWORD),
        })

    if dry_run:
        log.info("[dry-run] Would create %d bot users.", len(rows))
        return []

    inserted = db.table("users").insert(rows).execute().data or [] if rows else []
    log.info("Created %d new bot users (pool now ~%d).", len(inserted), len(existing) + len(inserted))
    return inserted


# ---------------------------------------------------------------------------
# 2. Top up the live/upcoming listing pool
# ---------------------------------------------------------------------------
def count_active_listings(db) -> int:
    res = (
        db.table("listings")
        .select("id", count="exact")
        .eq("status", "accepted")
        .not_.in_("auction_status", ["sold", "unsold"])
        .execute()
    )
    return res.count or 0


def pick_random_products(db, count: int) -> list[dict]:
    res = db.table("products").select("id, price").not_.is_("price", "null").limit(2000).execute()
    rows = res.data or []
    return random.sample(rows, k=min(count, len(rows))) if rows else []


def build_listing_row(seller_id: str, product: dict, live: bool) -> dict:
    price = product.get("price") or 5000
    suggestions = get_suggested_bid_prices(price)
    bid_price = random.choice(suggestions)["price"] if suggestions else round(price * 0.65)

    submitted_at = _now() - timedelta(hours=random.randint(1, 48))
    start = _now() - timedelta(seconds=random.randint(5, 45)) if live else _now() + timedelta(hours=random.randint(1, 96))

    return {
        "seller_id": seller_id,
        "product_id": product["id"],
        "condition_grade": random.choice(CONDITION_GRADES),
        "condition_notes": "Auto-generated listing.",
        "base_price": price,
        "bid_price": bid_price,
        "status": "accepted",
        "current_step": 6,
        "submitted_at": submitted_at.isoformat(),
        "reviewed_at": (submitted_at + timedelta(hours=random.randint(1, 6))).isoformat(),
        "auction_start_at": start.isoformat(),
    }


def top_up_listings(db, bot_users: list[dict], dry_run: bool) -> int:
    if not bot_users:
        log.warning("No bot users available yet, skipping listing top-up.")
        return 0

    active = count_active_listings(db)
    if active >= TARGET_LIVE_MAX:
        log.info("Active listing pool at %d (target max %d), skipping top-up.", active, TARGET_LIVE_MAX)
        return 0

    target = random.randint(TARGET_LIVE_MIN, TARGET_LIVE_MAX)
    needed = min(max(target - active, 0), MAX_NEW_LISTINGS)
    if needed == 0:
        return 0

    products = pick_random_products(db, needed)
    if not products:
        log.warning("No priced products available, skipping listing top-up.")
        return 0

    rows = []
    for product in products:
        seller = random.choice(bot_users)
        live = random.random() < 0.5
        rows.append(build_listing_row(seller["id"], product, live))

    if dry_run:
        log.info("[dry-run] Would create %d listings (pool %d -> %d target %d).", len(rows), active, active + len(rows), target)
        return 0

    inserted = db.table("listings").insert(rows).execute().data or []
    log.info("Created %d listings (pool %d -> ~%d, target was %d).", len(inserted), active, active + len(inserted), target)
    return len(inserted)


# ---------------------------------------------------------------------------
# 3. Drive real bids through the HTTP API
# ---------------------------------------------------------------------------
def get_live_listings(db, limit: int) -> list[dict]:
    cutoff = (_now() - timedelta(minutes=4)).isoformat()  # stay inside NO_BID_TIMEOUT
    res = (
        db.table("listings")
        .select("id, seller_id, auction_status")
        .eq("status", "accepted")
        .not_.in_("auction_status", ["sold", "unsold"])
        .lte("auction_start_at", _now().isoformat())
        .gte("auction_start_at", cutoff)
        .limit(200)
        .execute()
    )
    rows = res.data or []
    random.shuffle(rows)
    return rows[:limit]


def bid_on_listing(client: httpx.Client, listing: dict, bidders: list[dict], dry_run: bool) -> int:
    candidates = [b for b in bidders if b["id"] != listing["seller_id"]]
    if len(candidates) < 2:
        return 0

    rounds = random.randint(BID_ROUNDS_MIN, BID_ROUNDS_MAX)
    placed = 0
    last_bidder_id = None

    for _ in range(rounds):
        pool = [b for b in candidates if b["id"] != last_bidder_id]
        bidder = random.choice(pool)
        token = create_access_token(bidder["id"])
        headers = {"Authorization": f"Bearer {token}"}

        try:
            detail = client.get(f"/listings/{listing['id']}/auction", headers=headers)
            if detail.status_code != 200:
                break
            data = detail.json()
            if data.get("auction_status") != "live":
                break
            amount = data.get("min_next_bid") or (data["current_price"] * 1.05)
            amount = round(amount, 2)

            if dry_run:
                log.info("[dry-run] Would bid %.2f on %s as %s", amount, listing["id"], bidder["email"])
            else:
                resp = client.post(f"/listings/{listing['id']}/bids", headers=headers, json={"amount": amount})
                if resp.status_code != 200:
                    break
                placed += 1
                last_bidder_id = bidder["id"]
        except httpx.HTTPError as exc:
            log.warning("Bid attempt failed for listing %s: %s", listing["id"], exc)
            break

        time.sleep(BID_DELAY_SECONDS)

    return placed


def simulate_bidding(bot_users: list[dict], db, dry_run: bool) -> None:
    if len(bot_users) < 2:
        log.warning("Not enough bot users to bid with yet, skipping bidding.")
        return

    listings = get_live_listings(db, MAX_BID_LISTINGS)
    if not listings:
        log.info("No live listings in the biddable window right now.")
        return

    total_bids = 0
    with httpx.Client(base_url=API_BASE_URL, timeout=10.0) as client:
        for listing in listings:
            bidders = random.sample(bot_users, k=min(9, len(bot_users)))
            total_bids += bid_on_listing(client, listing, bidders, dry_run)

    log.info("Placed %d bids across %d live listings.", total_bids, len(listings))


# ---------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(description="Simulate site activity: bot users, listings, bids.")
    parser.add_argument("--dry-run", action="store_true", help="Log intended actions without writing/calling anything.")
    args = parser.parse_args()

    log.info("=== simulate_activity run starting (dry_run=%s, api=%s) ===", args.dry_run, API_BASE_URL)
    db = get_supabase_client()

    existing_bots = get_bot_users(db)
    new_bots = create_bot_users(db, existing_bots, args.dry_run)
    all_bots = existing_bots + new_bots

    top_up_listings(db, all_bots, args.dry_run)
    simulate_bidding(all_bots, db, args.dry_run)

    log.info("=== simulate_activity run complete ===")


if __name__ == "__main__":
    main()
