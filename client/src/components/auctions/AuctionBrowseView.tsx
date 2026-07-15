"use client";

import { Container } from "@/components/ui/Container";
import { Pagination } from "@/components/ui/Pagination";
import { AuctionCategoryFilter } from "@/components/auctions/AuctionCategoryFilter";
import { AuctionListingCard } from "@/components/auctions/AuctionListingCard";
import { AuctionListingCardSkeleton } from "@/components/auctions/AuctionListingCardSkeleton";
import { EmptyAuctionState } from "@/components/auctions/EmptyAuctionState";
import { useBrowseListings } from "@/hooks/useBrowseListings";
import type { AuctionScope } from "@/types/listing";

const EMPTY_COPY: Record<AuctionScope, { title: string; body: string }> = {
  live: { title: "Nothing live right now", body: "Check back soon, or browse upcoming drops to set your sights on what's next." },
  upcoming: { title: "No upcoming drops yet", body: "New auctions get scheduled all the time — check back soon." },
  sold: { title: "No sales yet", body: "Once auctions close with a winning bid, they'll show up here." },
};

export function AuctionBrowseView({
  scope,
  title,
  subtitle,
}: {
  scope: AuctionScope;
  title: string;
  subtitle: string;
}) {
  const { query, setQuery, category, setCategory, page, setPage, totalPages, items, isLoading, error } =
    useBrowseListings(scope);

  return (
    <div className="min-h-screen bg-ink py-10">
      <Container>
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-paper">
          {title}
        </h1>
        <p className="mt-1 font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">{subtitle}</p>

        <div className="mt-6 flex h-11 items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4">
          <SearchIcon className="h-4 w-4 shrink-0 text-gray-on-dark" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name or brand"
            className="w-full bg-transparent font-[family-name:var(--font-barlow)] text-sm text-paper placeholder:text-gray-on-dark focus:outline-none"
          />
        </div>

        <div className="mt-4">
          <AuctionCategoryFilter value={category} onChange={setCategory} />
        </div>

        {error ? (
          <p className="mt-8 font-[family-name:var(--font-barlow)] text-sm text-red-urgent">{error}</p>
        ) : isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <AuctionListingCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyAuctionState title={EMPTY_COPY[scope].title} body={EMPTY_COPY[scope].body} />
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((listing) => (
                <AuctionListingCard key={listing.id} listing={listing} scope={scope} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} variant="dark" />
          </>
        )}
      </Container>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
