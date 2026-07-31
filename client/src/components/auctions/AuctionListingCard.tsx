"use client";

import Image from "next/image";
import Link from "next/link";
import { useCountdown } from "@/hooks/useCountdown";
import { formatLocalDateTime } from "@/utils/dateUtils";
import type { AuctionScope, BrowseListing } from "@/types/listing";

const BADGE: Record<AuctionScope, { label: string; className: string }> = {
  live: { label: "● HYPE Verified", className: "bg-[#1a7a3c] text-white" },
  upcoming: { label: "HYPE Verified", className: "bg-gold text-ink-on-sand" },
  sold: { label: "Sold", className: "bg-emerald-600 text-white" },
};

export function AuctionListingCard({ listing, scope }: { listing: BrowseListing; scope: AuctionScope }) {
  const product = listing.product;
  const badge = BADGE[scope];
  const countdownTarget = scope === "live" ? listing.close_deadline : scope === "upcoming" ? listing.auction_start_at : null;
  const countdown = useCountdown(countdownTarget);

  return (
    <Link
      href={`/${scope}/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-ink-on-sand/10 bg-white/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-sm"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-sand">
        {product?.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImagePlaceholderIcon className="h-8 w-8 text-muted-on-sand/40" />
          </div>
        )}
        {/* Verified badge */}
        <span className={`absolute left-2 top-2 rounded px-2 py-0.5 font-[family-name:var(--font-barlow)] text-[9px] font-bold uppercase tracking-wider ${badge.className}`}>
          {badge.label}
        </span>
        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink-on-sand/60 backdrop-blur-sm transition-colors hover:text-red-urgent"
          aria-label="Add to wishlist"
        >
          <HeartIcon className="h-3.5 w-3.5" />
        </button>
        {/* Countdown */}
        {countdown.label && (
          <span className={`absolute bottom-2 right-2 rounded-full px-2 py-0.5 font-[family-name:var(--font-barlow-condensed)] text-[11px] font-bold tabular-nums text-paper ${countdown.isUrgent ? "animate-pulse bg-red-urgent" : "bg-black/65"}`}>
            {countdown.label}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        <h3 className="line-clamp-2 font-[family-name:var(--font-barlow)] text-sm font-medium leading-snug text-ink-on-sand">
          {product?.name ?? "—"}
        </h3>
        <p className="font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
          {product?.brand ?? product?.product_type ?? "—"}
          {listing.variant_size ? ` · ${listing.variant_size}` : ""}
        </p>
        <div className="mt-auto border-t border-ink-on-sand/10 pt-3">
          <span className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold text-ink-on-sand">
            {listing.bid_price != null ? `₹${listing.bid_price.toLocaleString("en-IN")}` : "—"}
          </span>
          <p className="mt-0.5 font-[family-name:var(--font-barlow)] text-[11px] text-muted-on-sand">
            {scope === "live" ? (listing.bid_count > 0 ? `${listing.bid_count} bid${listing.bid_count === 1 ? "" : "s"}` : "No bids yet") : null}
            {scope === "upcoming" ? `Starts ${formatLocalDateTime(listing.auction_start_at)}` : null}
            {scope === "sold" ? `Sold ${formatLocalDateTime(listing.auction_start_at)}` : null}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ImagePlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <path d="m3 15 5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 21C12 21 3 14.5 3 8.5C3 5.46 5.46 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.54 3 23 5.46 23 8.5C23 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
