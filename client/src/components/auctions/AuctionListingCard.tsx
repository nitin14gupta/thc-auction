"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toggleWatch } from "@/api/listingApi";
import { useAuth } from "@/hooks/useAuth";
import { useCountdown } from "@/hooks/useCountdown";
import { useToast } from "@/hooks/useToast";
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

  const router = useRouter();
  const { isAuthenticated, authFetch } = useAuth();
  const { toast } = useToast();
  const [isWatching, setIsWatching] = useState(listing.is_watching);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      const result = await toggleWatch(authFetch, listing.id);
      setIsWatching(result.is_watching);
      toast(result.is_watching ? "Saved." : "Removed from saved.", "success");
    } catch {
      toast("Couldn't update saved items. Try again.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Link
      href={`/${scope}/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-ink-on-sand/10 bg-white/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-sm"
    >
      {/* Image */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-sand">
        {product?.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 22vw, 16vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImagePlaceholderIcon className="h-6 w-6 text-muted-on-sand/40" />
          </div>
        )}
        {/* Verified badge */}
        <span className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 font-[family-name:var(--font-barlow)] text-[8px] font-bold uppercase tracking-wider ${badge.className}`}>
          {badge.label}
        </span>
        {/* Save */}
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={isSaving}
          className={`absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors disabled:opacity-60 ${
            isWatching ? "text-gold" : "text-ink-on-sand/60 hover:text-gold"
          }`}
          aria-label={isWatching ? "Remove from saved" : "Save"}
          aria-pressed={isWatching}
        >
          <SaveIcon className="h-3 w-3" filled={isWatching} />
        </button>
        {/* Countdown */}
        {countdown.label && (
          <span className={`absolute bottom-1.5 right-1.5 rounded-full px-1.5 py-0.5 font-[family-name:var(--font-barlow-condensed)] text-[10px] font-bold tabular-nums text-paper ${countdown.isUrgent ? "animate-pulse bg-red-urgent" : "bg-black/65"}`}>
            {countdown.label}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 px-2.5 py-2.5">
        <h3 className="line-clamp-2 font-[family-name:var(--font-barlow)] text-xs font-medium leading-snug text-ink-on-sand">
          {product?.name ?? "—"}
        </h3>
        <p className="truncate font-[family-name:var(--font-barlow)] text-[11px] text-muted-on-sand">
          {product?.brand ?? product?.product_type ?? "—"}
          {listing.variant_size ? ` · ${listing.variant_size}` : ""}
        </p>
        <div className="mt-auto border-t border-ink-on-sand/10 pt-2">
          <span className="font-[family-name:var(--font-barlow-condensed)] text-base font-bold text-ink-on-sand">
            {listing.bid_price != null ? `₹${listing.bid_price.toLocaleString("en-IN")}` : "—"}
          </span>
          <p className="mt-0.5 truncate font-[family-name:var(--font-barlow)] text-[10px] text-muted-on-sand">
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

function SaveIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className={className} aria-hidden="true">
      <path d="M6 4h12v16l-6-4-6 4V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
