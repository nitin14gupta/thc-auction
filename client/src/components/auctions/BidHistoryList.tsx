"use client";

import { useEffect, useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { formatLocalDateTime } from "@/utils/dateUtils";
import type { Bid } from "@/types/listing";

const PAGE_SIZE = 10;

export function BidHistoryList({ bids, currentUserId }: { bids: Bid[]; currentUserId: string | undefined }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(bids.length / PAGE_SIZE));

  // Bids are already sorted newest-first, so page 1 always shows the latest
  // activity regardless of how many total bids there are — only clamp back
  // if the current page no longer exists (e.g. viewing a stale deep page).
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (bids.length === 0) {
    return <p className="font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">No bids yet. Be the first.</p>;
  }

  const start = (page - 1) * PAGE_SIZE;
  const pageBids = bids.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col gap-2">
        {pageBids.map((bid, i) => {
          const index = start + i;
          return (
            <div
              key={bid.id}
              className="flex items-center justify-between rounded-md border border-ink-on-sand/10 bg-white/60 px-4 py-2.5"
            >
              <span className="font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">
                {bid.bidder_id === currentUserId ? "You" : `Bidder ${bid.bidder_id.slice(0, 8)}`}
                {index === 0 && <span className="ml-2 text-xs font-semibold uppercase text-gold">Highest</span>}
              </span>
              <div className="text-right">
                <p className="font-[family-name:var(--font-barlow-condensed)] text-sm font-bold text-ink-on-sand">
                  ₹{bid.amount.toLocaleString("en-IN")}
                </p>
                <p className="font-[family-name:var(--font-barlow)] text-[11px] text-muted-on-sand">
                  {formatLocalDateTime(bid.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {bids.length > PAGE_SIZE && (
        <>
          <p className="mt-2 font-[family-name:var(--font-barlow)] text-[11px] text-muted-on-sand">
            {bids.length} bids total
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} variant="light" />
        </>
      )}
    </div>
  );
}
