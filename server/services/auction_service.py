"""Auction lifecycle rules.

An accepted listing moves through: scheduled -> live -> sold | unsold.

- scheduled: auction_start_at is in the future.
- live: auction_start_at has passed and the auction hasn't closed yet.
- unsold: no bids were placed within NO_BID_TIMEOUT of the start time.
- sold: at least one bid was placed, and SOFT_CLOSE has elapsed since the
  most recent bid with no new bid coming in (classic "soft close" — every
  bid pushes the close time back by SOFT_CLOSE).

There's no background scheduler yet, so status is recomputed lazily on every
read (get_listing, browse, auction detail, place_bid) and persisted if it
changed. sold/unsold are terminal — once reached, never recomputed.
"""

from datetime import datetime, timedelta, timezone

NO_BID_TIMEOUT = timedelta(minutes=5)
SOFT_CLOSE = timedelta(seconds=30)

TERMINAL_STATUSES = ("sold", "unsold")


def _parse(ts: str) -> datetime:
    return datetime.fromisoformat(ts)


def current_price(listing: dict) -> float:
    bids = listing.get("_bids") or []
    if bids:
        return max(b["amount"] for b in bids)
    return listing.get("bid_price") or listing.get("base_price") or 0


def next_close_deadline(listing: dict) -> str | None:
    """When a live auction will auto-close if no new bid comes in."""
    if listing.get("auction_status") != "live":
        return None
    bids = listing.get("_bids") or []
    if bids:
        return (_parse(bids[-1]["created_at"]) + SOFT_CLOSE).isoformat()
    if listing.get("auction_start_at"):
        return (_parse(listing["auction_start_at"]) + NO_BID_TIMEOUT).isoformat()
    return None


def sync_auction_status(db, listing: dict) -> dict:
    """Recompute + persist auction_status (and winner/final_price on close) if
    it has changed. Always stashes the fetched bids on listing["_bids"] so
    callers don't need a second query. Returns the same dict, mutated."""
    if listing.get("status") != "accepted" or not listing.get("auction_start_at"):
        listing["_bids"] = []
        return listing

    if listing.get("auction_status") in TERMINAL_STATUSES:
        if "_bids" not in listing:
            bids_res = (
                db.table("bids")
                .select("id, bidder_id, amount, created_at")
                .eq("listing_id", listing["id"])
                .order("created_at")
                .execute()
            )
            listing["_bids"] = bids_res.data or []
        return listing

    now = datetime.now(timezone.utc)
    start = _parse(listing["auction_start_at"])

    bids_res = (
        db.table("bids")
        .select("id, bidder_id, amount, created_at")
        .eq("listing_id", listing["id"])
        .order("created_at")
        .execute()
    )
    bids = bids_res.data or []
    listing["_bids"] = bids

    updates: dict = {}
    if now < start:
        new_status = "scheduled"
    elif not bids:
        new_status = "unsold" if now - start >= NO_BID_TIMEOUT else "live"
    else:
        last_bid = bids[-1]
        last_bid_time = _parse(last_bid["created_at"])
        if now - last_bid_time >= SOFT_CLOSE:
            new_status = "sold"
            updates["winner_id"] = last_bid["bidder_id"]
            updates["final_price"] = last_bid["amount"]
            updates["sold_at"] = now.isoformat()
        else:
            new_status = "live"

    if new_status != listing.get("auction_status"):
        updates["auction_status"] = new_status
        db.table("listings").update(updates).eq("id", listing["id"]).execute()
        listing.update(updates)

    return listing
