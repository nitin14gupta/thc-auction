"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listMyListings } from "@/api/listingApi";
import { ListingRowSkeleton } from "@/components/dashboard/ListingRowSkeleton";
import { useAuth } from "@/hooks/useAuth";
import type { Listing } from "@/types/listing";

export default function MyListingsPage() {
  const { authFetch } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listMyListings(authFetch)
      .then((data) => !cancelled && setListings(data))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [authFetch]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-ink-on-sand">
          My Listings
        </h1>
        <Link
          href="/dashboard/create-listing"
          className="rounded-md bg-ink-on-sand px-4 py-2 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase text-paper"
        >
          + New Listing
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ListingRowSkeleton key={i} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <p className="mt-8 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
          You haven&apos;t created any listings yet.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex items-center justify-between rounded-lg border border-ink-on-sand/10 bg-white/40 px-5 py-4"
            >
              <div>
                <p className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand">
                  {listing.style_sku || listing.id}
                </p>
                <p className="font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
                  {listing.condition_grade ?? "No condition set"} · Step {listing.current_step}/6 ·{" "}
                  {listing.status === "draft" ? "Draft" : "Pending review"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {listing.status === "draft" && (
                  <Link
                    href={`/dashboard/create-listing/product?listingId=${listing.id}`}
                    className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-wide text-gold hover:underline"
                  >
                    Continue draft
                  </Link>
                )}
                <Link
                  href={`/dashboard/my-listings/${listing.id}`}
                  className="rounded-md border border-ink-on-sand/30 px-3 py-1.5 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase text-ink-on-sand hover:bg-ink-on-sand/5"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
