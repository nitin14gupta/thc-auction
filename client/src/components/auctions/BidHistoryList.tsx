import { formatLocalDateTime } from "@/utils/dateUtils";
import type { Bid } from "@/types/listing";

export function BidHistoryList({ bids, currentUserId }: { bids: Bid[]; currentUserId: string | undefined }) {
  if (bids.length === 0) {
    return <p className="font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">No bids yet. Be the first.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {bids.map((bid, index) => (
        <div
          key={bid.id}
          className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-2.5"
        >
          <span className="font-[family-name:var(--font-barlow)] text-sm text-paper">
            {bid.bidder_id === currentUserId ? "You" : `Bidder ${bid.bidder_id.slice(0, 8)}`}
            {index === 0 && <span className="ml-2 text-xs font-semibold uppercase text-gold">Highest</span>}
          </span>
          <div className="text-right">
            <p className="font-[family-name:var(--font-barlow-condensed)] text-sm font-bold text-paper">
              ₹{bid.amount.toLocaleString("en-IN")}
            </p>
            <p className="font-[family-name:var(--font-barlow)] text-[11px] text-gray-on-dark">
              {formatLocalDateTime(bid.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
