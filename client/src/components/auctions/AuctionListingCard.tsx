"use client";

import Image from "next/image";
import Link from "next/link";
import { useCountdown } from "@/hooks/useCountdown";
import { formatLocalDateTime } from "@/utils/dateUtils";
import type { AuctionScope, BrowseListing } from "@/types/listing";

const BADGE: Record<AuctionScope, { label: string; className: string }> = {
  live: { label: "● Live", className: "bg-red-urgent text-paper" },
  upcoming: { label: "Upcoming", className: "bg-gold text-ink-on-sand" },
  sold: { label: "Sold", className: "bg-emerald-600 text-paper" },
};

export function AuctionListingCard({ listing, scope }: { listing: BrowseListing; scope: AuctionScope }) {
  const product = listing.product;
  const badge = BADGE[scope];

  const countdownTarget = scope === "live" ? listing.close_deadline : scope === "upcoming" ? listing.auction_start_at : null;
  const countdown = useCountdown(countdownTarget);

  return (
    <Link
      href={`/${scope}/${listing.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-ink transition-transform duration-200 hover:-translate-y-0.5 hover:border-gold/50"
    >
      <div className="relative aspect-[4/3] w-full">
        {product?.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 220px"
            unoptimized
          />
        )}
        <span
          className={`absolute left-2 top-2 rounded px-2 py-0.5 font-[family-name:var(--font-barlow)] text-[10px] font-bold uppercase tracking-wider ${badge.className}`}
        >
          {badge.label}
        </span>
        {countdown.label && (
          <span
            className={`absolute right-2 top-2 rounded-full px-2 py-0.5 font-[family-name:var(--font-barlow-condensed)] text-[11px] font-bold tabular-nums text-paper ${
              countdown.isUrgent ? "bg-red-urgent animate-pulse" : "bg-black/70"
            }`}
          >
            {countdown.label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        <h3 className="line-clamp-2 font-[family-name:var(--font-barlow)] text-base font-medium text-paper">
          {product?.name ?? "—"}
        </h3>
        <p className="font-[family-name:var(--font-barlow)] text-xs text-gray-on-dark">
          {product?.brand ?? product?.product_type ?? "—"}
          {listing.variant_size ? ` · ${listing.variant_size}` : ""}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
          <span className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold text-paper">
            {listing.bid_price != null ? `₹${listing.bid_price.toLocaleString("en-IN")}` : "—"}
          </span>
        </div>
        <p className="font-[family-name:var(--font-barlow)] text-xs text-gray-on-dark">
          {scope === "live" ? (listing.bid_count > 0 ? `${listing.bid_count} bid${listing.bid_count === 1 ? "" : "s"}` : "No bids yet") : null}
          {scope === "upcoming" ? `Starts ${formatLocalDateTime(listing.auction_start_at)}` : null}
          {scope === "sold" ? `Sold ${formatLocalDateTime(listing.auction_start_at)}` : null}
        </p>
      </div>
    </Link>
  );
}
