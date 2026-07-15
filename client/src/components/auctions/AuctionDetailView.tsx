"use client";

import Image from "next/image";
import Link from "next/link";
import { AuctionCountdownPanel } from "@/components/auctions/AuctionCountdownPanel";
import { BidForm } from "@/components/auctions/BidForm";
import { BidHistoryList } from "@/components/auctions/BidHistoryList";
import { SellerCard } from "@/components/auctions/SellerCard";
import { RelatedListingsSection } from "@/components/auctions/RelatedListingsSection";
import { StaleLinkBanner } from "@/components/auctions/StaleLinkBanner";
import { useAuctionDetail } from "@/hooks/useAuctionDetail";
import { useAuth } from "@/hooks/useAuth";
import { useCountdown } from "@/hooks/useCountdown";
import { formatLocalDateTime } from "@/utils/dateUtils";
import type { AuctionScope } from "@/types/listing";

const STATUS_COPY: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-gold text-ink-on-sand" },
  live: { label: "● Live", className: "bg-red-urgent text-paper" },
  sold: { label: "Sold", className: "bg-emerald-600 text-paper" },
  unsold: { label: "Unsold", className: "bg-white/20 text-paper" },
};

export function AuctionDetailView({ id, backHref, scope }: { id: string; backHref: string; scope: AuctionScope }) {
  const { user } = useAuth();
  const { detail, isLoading, error, refresh } = useAuctionDetail(id);

  const countdownTarget =
    detail?.auction_status === "live"
      ? detail.close_deadline
      : detail?.auction_status === "scheduled"
        ? detail.auction_start_at
        : null;
  const countdown = useCountdown(countdownTarget);
  const currentUserId = user?.id;

  return (
    <>
      <Link
        href={backHref}
        className="font-[family-name:var(--font-barlow)] text-sm font-medium text-gray-on-dark hover:text-paper"
      >
        ‹ Back to auctions
      </Link>

      {isLoading ? (
        <p className="mt-8 font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">Loading...</p>
      ) : error || !detail ? (
        <p className="mt-8 font-[family-name:var(--font-barlow)] text-sm text-red-urgent">
          {error ?? "Auction not found."}
        </p>
      ) : (
        <>
          {detail.auction_status && (
            <StaleLinkBanner id={detail.id} routeScope={scope} auctionStatus={detail.auction_status} />
          )}
          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white/5">
              {(() => {
                const imageUrl = detail.photos[0]?.url ?? detail.product?.image_url;
                return imageUrl ? (
                  <Image src={imageUrl} alt={detail.product?.name ?? ""} fill className="object-cover" unoptimized />
                ) : null;
              })()}
              {detail.auction_status && (
                <span
                  className={`absolute left-3 top-3 rounded-full px-3 py-1 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-wide ${STATUS_COPY[detail.auction_status].className}`}
                >
                  {STATUS_COPY[detail.auction_status].label}
                </span>
              )}
            </div>

            <div>
              <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-paper">
                {detail.product?.name ?? "Listing"}
              </h1>
              <p className="mt-1 font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
                {detail.product?.brand ?? detail.product?.product_type ?? "—"}
                {detail.variant_size ? ` · Size ${detail.variant_size}` : ""}
                {detail.condition_grade ? ` · ${detail.condition_grade}` : ""}
              </p>

              {detail.condition_notes && (
                <p className="mt-3 font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
                  {detail.condition_notes}
                </p>
              )}

              <div className="mt-5">
                <AuctionCountdownPanel detail={detail} countdown={countdown} currentUserId={currentUserId} />
              </div>

              <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-widest text-gray-on-dark">
                  {detail.auction_status === "sold" ? "Sold for" : "Current price"}
                </p>
                <p className="mt-1 font-[family-name:var(--font-barlow-condensed)] text-4xl font-extrabold text-paper">
                  ₹
                  {(detail.auction_status === "sold"
                    ? (detail.final_price ?? detail.current_price)
                    : detail.current_price
                  ).toLocaleString("en-IN")}
                </p>
                <p className="mt-1 font-[family-name:var(--font-barlow)] text-xs text-gray-on-dark">
                  {detail.bid_count} bid{detail.bid_count === 1 ? "" : "s"}
                  {detail.auction_status === "live" && detail.min_next_bid != null
                    ? ` · Minimum next bid ₹${detail.min_next_bid.toLocaleString("en-IN")}`
                    : ""}
                  {" · "}
                  {detail.auction_status === "scheduled"
                    ? `Starts ${formatLocalDateTime(detail.auction_start_at)}`
                    : `Started ${formatLocalDateTime(detail.auction_start_at)}`}
                </p>

                <div className="mt-4">
                  {detail.is_own_listing ? (
                    <p className="font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
                      This is your own listing — you can&apos;t bid on it.
                    </p>
                  ) : detail.auction_status === "live" ? (
                    <BidForm listingId={detail.id} currentPrice={detail.current_price} onPlaced={refresh} />
                  ) : detail.auction_status === "scheduled" ? (
                    <p className="font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
                      Bidding opens once the auction starts.
                    </p>
                  ) : detail.auction_status === "sold" ? (
                    <p className="font-[family-name:var(--font-barlow)] text-sm text-emerald-400">
                      {detail.winner_id === user?.id
                        ? "You won this auction! Payment (Razorpay) is coming soon."
                        : "This auction has ended."}
                    </p>
                  ) : (
                    <p className="font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
                      This auction ended with no bids.
                    </p>
                  )}
                </div>
              </div>

              {detail.seller && (
                <div className="mt-4">
                  <SellerCard seller={detail.seller} />
                </div>
              )}

              <div className="mt-6">
                <p className="mb-2 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-paper">
                  Bid History
                </p>
                <BidHistoryList bids={detail.bids} currentUserId={user?.id} />
              </div>
            </div>
          </div>

          <RelatedListingsSection listingId={detail.id} />
        </>
      )}
    </>
  );
}
