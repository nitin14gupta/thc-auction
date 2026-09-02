"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuctionListingCard } from "@/components/auctions/AuctionListingCard";
import { AuctionListingCardSkeleton } from "@/components/auctions/AuctionListingCardSkeleton";
import { EmptyAuctionState } from "@/components/auctions/EmptyAuctionState";
import { Pagination } from "@/components/ui/Pagination";
import { getWatchlist } from "@/api/listingApi";
import { useAuth } from "@/hooks/useAuth";
import type { AuctionScope, BrowseListing } from "@/types/listing";

const PAGE_SIZE = 12;

// The Saved page mixes listings in every auction state. Route each card to
// whichever detail page matches its current state — the detail view itself
// reads status straight from the API response, so the URL segment only
// affects the "back to auctions" link and card badge, not the content.
function scopeForListing(listing: BrowseListing): AuctionScope {
  if (listing.auction_status === "scheduled") return "upcoming";
  if (listing.auction_status === "live") return "live";
  return "sold";
}

function SavedListingsView() {
  const { authFetch } = useAuth();
  const [items, setItems] = useState<BrowseListing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getWatchlist(authFetch, page, PAGE_SIZE);
        if (!cancelled) {
          setItems(data.items);
          setTotal(data.total);
        }
      } catch {
        if (!cancelled) setError("Couldn't load your saved items. Try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [authFetch, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="bg-sand">
      <div className="px-6 py-8 md:px-10">
        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-ink-on-sand">
            Saved
          </h1>
          <p className="mt-1 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
            Listings you&apos;ve saved with the heart icon.
          </p>
        </div>

        {error ? (
          <p className="mt-8 font-[family-name:var(--font-barlow)] text-sm text-red-urgent">{error}</p>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <AuctionListingCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyAuctionState
            title="Nothing saved yet"
            body="Tap the heart icon on any listing to save it here."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {items.map((listing) => (
                <AuctionListingCard key={listing.id} listing={listing} scope={scopeForListing(listing)} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} variant="light" />
          </>
        )}
      </div>
    </div>
  );
}

export default function SavedPage() {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col bg-sand">
        <Navbar />
        <main className="flex-1">
          <SavedListingsView />
        </main>
        <Footer />
      </div>
    </RequireAuth>
  );
}
