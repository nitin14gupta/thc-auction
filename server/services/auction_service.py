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

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

NO_BID_TIMEOUT = timedelta(days=7)
SOFT_CLOSE = timedelta(days=7)

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


def _fetch_bids(db, listing_id: str) -> list[dict]:
    res = (
        db.table("bids")
        .select("id, bidder_id, amount, created_at")
        .eq("listing_id", listing_id)
        .order("created_at")
        .execute()
    )
    return res.data or []


BATCH_FETCH_CHUNK_SIZE = 100
# PostgREST caps rows returned per request (commonly ~1000) regardless of how
# many actually match — a single popular listing can have more bids than
# that on its own. Without paging within a chunk too, a chunk whose combined
# bid rows exceed the cap comes back silently truncated (no error, just
# missing rows), which previously undercounted bid totals for any high-
# volume listing sharing a chunk. Same page size used for both axes.
_ROWS_PER_PAGE = BATCH_FETCH_CHUNK_SIZE


def batch_fetch_bids(db, listing_ids: list[str]) -> dict[str, list[dict]]:
    """One query per chunk of listings' bids instead of one query per listing —
    use this before calling sync_auction_status in a loop over a page of
    listings (list_my_listings, browse_listings, get_related_listings).

    Chunked because a single IN(...) with hundreds of listing ids can exceed
    the request-size limit the DB provider enforces on GET query strings."""
    by_listing: dict[str, list[dict]] = {lid: [] for lid in listing_ids}
    if not listing_ids:
        return by_listing

    for i in range(0, len(listing_ids), BATCH_FETCH_CHUNK_SIZE):
        chunk = listing_ids[i : i + BATCH_FETCH_CHUNK_SIZE]
        offset = 0
        while True:
            res = (
                db.table("bids")
                .select("id, bidder_id, amount, created_at, listing_id")
                .in_("listing_id", chunk)
                .order("created_at")
                .range(offset, offset + _ROWS_PER_PAGE - 1)
                .execute()
            )
            page = res.data or []
            for bid in page:
                by_listing.setdefault(bid["listing_id"], []).append(bid)
            if len(page) < _ROWS_PER_PAGE:
                break
            offset += _ROWS_PER_PAGE

    return by_listing


_COUNT_MAX_WORKERS = 10


def batch_count_bids(db, listing_ids: list[str]) -> dict[str, int]:
    """Bid *counts* for a page of listings (browse_listings' display, not the
    price/status logic) — deliberately not batch_fetch_bids. A single popular
    listing here can have hundreds of bids, and browse only ever needs a
    number, not the rows, so pulling full histories for a whole page of those
    is pure waste (seconds of wasted transfer for a "412 bids" label). Each
    count is a HEAD request (Content-Range header only, no body) fired
    concurrently — count queries don't batch via IN() the way row fetches do,
    since PostgREST's count is for the whole filtered set, not grouped per id."""
    if not listing_ids:
        return {}

    def _count(listing_id: str) -> tuple[str, int]:
        res = db.table("bids").select("id", count="exact", head=True).eq("listing_id", listing_id).execute()
        return listing_id, res.count or 0

    with ThreadPoolExecutor(max_workers=min(_COUNT_MAX_WORKERS, len(listing_ids))) as pool:
        return dict(pool.map(_count, listing_ids))


def sweep_pending_auctions() -> int:
    """Proactively syncs every not-yet-terminal, already-started listing on a
    timer (see main.py's startup task) instead of only ever finding out a
    listing is overdue to close when someone happens to browse Live and pays
    for examining the whole backlog synchronously — including the
    order-creation + winner email side effects sync_auction_status fires on
    a sold transition, which then block that person's page load. Returns the
    number of listings checked, for logging."""
    from db.config import get_supabase_client

    db = get_supabase_client()
    res = (
        db.table("listings")
        .select("id, status, auction_start_at, auction_status, winner_id, final_price")
        .eq("status", "accepted")
        .not_.is_("auction_start_at", "null")
        .lte("auction_start_at", datetime.now(timezone.utc).isoformat())
        .or_(f"auction_status.is.null,auction_status.not.in.({','.join(TERMINAL_STATUSES)})")
        .execute()
    )
    listings = res.data or []
    if not listings:
        return 0

    bids_by_listing = batch_fetch_bids(db, [listing["id"] for listing in listings])
    for listing in listings:
        try:
            sync_auction_status(db, listing, bids=bids_by_listing.get(listing["id"], []))
        except Exception:
            pass  # one bad listing shouldn't stop the rest of the sweep
    return len(listings)


def sync_auction_status(db, listing: dict, bids: list[dict] | None = None) -> dict:
    """Recompute + persist auction_status (and winner/final_price on close) if
    it has changed. Always stashes the bids on listing["_bids"] so callers
    don't need a second query.

    Pass `bids` when the caller already has them (e.g. batch-fetched for a
    whole page of listings via `.in_("listing_id", ids)`) — otherwise this
    fires one query per listing, which is fine for a single detail view but
    an N+1 disaster for a list of N listings."""
    if listing.get("status") != "accepted" or not listing.get("auction_start_at"):
        listing["_bids"] = []
        return listing

    if listing.get("auction_status") in TERMINAL_STATUSES:
        if bids is not None:
            listing["_bids"] = bids
        elif "_bids" not in listing:
            listing["_bids"] = _fetch_bids(db, listing["id"])
        return listing

    now = datetime.now(timezone.utc)
    start = _parse(listing["auction_start_at"])

    bids = bids if bids is not None else _fetch_bids(db, listing["id"])
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

    old_status = listing.get("auction_status")
    if new_status != old_status:
        updates["auction_status"] = new_status

        # Optimistic concurrency: only apply if auction_status still matches what
        # we read (WHERE id=... AND auction_status=<old>). If two requests race to
        # close the same listing, only one update actually matches a row — the
        # loser sees an empty result and refetches instead of double-firing the
        # sold side effects (order creation + emails).
        query = db.table("listings").update(updates).eq("id", listing["id"])
        query = query.is_("auction_status", "null") if old_status is None else query.eq("auction_status", old_status)
        res = query.execute()
        won_race = bool(res.data)

        if won_race:
            listing.update(updates)
            if new_status == "sold":
                from services import order_service

                try:
                    order_service.create_order_for_winner(db, listing)
                except Exception:
                    pass  # Order/email hiccups shouldn't block the auction status itself.
        else:
            refreshed = db.table("listings").select("*").eq("id", listing["id"]).limit(1).execute()
            if refreshed.data:
                listing.update(refreshed.data[0])

    return listing
