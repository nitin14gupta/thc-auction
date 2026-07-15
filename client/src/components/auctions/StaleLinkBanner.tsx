import Link from "next/link";
import type { AuctionScope, AuctionStatus } from "@/types/listing";

const STATUS_TO_SCOPE: Record<AuctionStatus, AuctionScope | null> = {
  scheduled: "upcoming",
  live: "live",
  sold: "sold",
  unsold: null,
};

export function StaleLinkBanner({
  id,
  routeScope,
  auctionStatus,
}: {
  id: string;
  routeScope: AuctionScope;
  auctionStatus: AuctionStatus;
}) {
  const currentScope = STATUS_TO_SCOPE[auctionStatus];
  if (currentScope === routeScope) return null;

  const copy: Record<AuctionStatus, string> = {
    scheduled: "This auction hasn't started yet.",
    live: "This auction is live right now — bidding is open!",
    sold: "This link is stale — this auction has already ended and sold.",
    unsold: "This link is stale — this auction ended with no bids and is no longer available.",
  };

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3">
      <p className="font-[family-name:var(--font-barlow)] text-sm text-paper">{copy[auctionStatus]}</p>
      {currentScope && (
        <Link
          href={`/${currentScope}/${id}`}
          className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-wide text-gold hover:underline"
        >
          View where it belongs →
        </Link>
      )}
    </div>
  );
}
