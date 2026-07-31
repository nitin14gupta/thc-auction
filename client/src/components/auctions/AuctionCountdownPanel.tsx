import type { CountdownState } from "@/hooks/useCountdown";
import type { AuctionDetail } from "@/types/listing";

export function AuctionCountdownPanel({
  detail,
  countdown,
  currentUserId,
}: {
  detail: AuctionDetail;
  countdown: CountdownState;
  currentUserId: string | undefined;
}) {
  if (!countdown.label) return null;

  if (detail.auction_status === "scheduled") {
    return (
      <div className="flex items-center justify-between rounded-lg border border-gold/30 bg-gold/10 px-4 py-3">
        <p className="font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">Auction starts in</p>
        <p className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-extrabold tabular-nums text-gold">
          {countdown.label}
        </p>
      </div>
    );
  }

  if (detail.auction_status !== "live") return null;

  const isHighestBidder = detail.bids[0]?.bidder_id === currentUserId;
  const hasBids = detail.bid_count > 0;

  const label = hasBids
    ? isHighestBidder
      ? "You're winning! Sold to you if no one outbids you in"
      : "Highest bidder wins if no one bids in"
    : "No bids yet — goes unsold if nobody bids in";

  const urgentClass = countdown.isUrgent
    ? "border-red-urgent/50 bg-red-urgent/10 animate-pulse"
    : hasBids
      ? "border-tan/30 bg-tan/10"
      : "border-ink-on-sand/15 bg-ink-on-sand/5";
  const numberClass = countdown.isUrgent ? "text-red-urgent" : hasBids ? "text-tan" : "text-ink-on-sand";

  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors ${urgentClass}`}>
      <p className="font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">{label}</p>
      <p className={`font-[family-name:var(--font-barlow-condensed)] text-2xl font-extrabold tabular-nums ${numberClass}`}>
        {countdown.label}
      </p>
    </div>
  );
}
