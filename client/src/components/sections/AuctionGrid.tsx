"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { browseListings } from "@/api/listingApi";
import { AuctionListingCard } from "@/components/auctions/AuctionListingCard";
import { AuctionListingCardSkeleton } from "@/components/auctions/AuctionListingCardSkeleton";
import { FilterBar, parsePriceBucket, type HomeSortOption } from "@/components/sections/FilterBar";
import { useAuth } from "@/hooks/useAuth";
import type { AuctionScope, BrowseListing } from "@/types/listing";

const TEASER_SIZE = 6;

function useTeaserListings(scope: AuctionScope, category: string | undefined) {
  const { authFetch } = useAuth();
  const [items, setItems] = useState<BrowseListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await browseListings(authFetch, scope, category, "", 1, TEASER_SIZE);
        if (!cancelled) setItems(data.items);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authFetch, scope, category]);

  return { items, isLoading };
}

function applyPriceAndSort(items: BrowseListing[], price: string, sort: HomeSortOption): BrowseListing[] {
  const [min, max] = parsePriceBucket(price);
  const filtered = items.filter((item) => item.bid_price == null || (item.bid_price >= min && item.bid_price <= max));
  return [...filtered].sort((a, b) => {
    if (sort === "price_asc") return (a.bid_price ?? 0) - (b.bid_price ?? 0);
    if (sort === "price_desc") return (b.bid_price ?? 0) - (a.bid_price ?? 0);
    return 0; // newest — keep server order
  });
}

function TeaserSection({
  title,
  scope,
  category,
  price,
  sort,
  viewAllHref,
  emptyCopy,
}: {
  title: string;
  scope: AuctionScope;
  category: string | undefined;
  price: string;
  sort: HomeSortOption;
  viewAllHref: string;
  emptyCopy: string;
}) {
  const { items, isLoading } = useTeaserListings(scope, category);
  const sorted = applyPriceAndSort(items, price, sort);

  return (
    <div className="mt-12 first:mt-0">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight text-ink-on-sand">
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-wide text-muted-on-sand hover:text-ink-on-sand"
        >
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <AuctionListingCardSkeleton key={i} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink-on-sand/15 py-10 text-center font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
          {emptyCopy}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {sorted.map((listing) => (
            <AuctionListingCard key={listing.id} listing={listing} scope={scope} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AuctionGrid() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [price, setPrice] = useState("Any");
  const [sort, setSort] = useState<HomeSortOption>("newest");

  return (
    <>
      <FilterBar category={category} setCategory={setCategory} price={price} setPrice={setPrice} sort={sort} setSort={setSort} />
      <section className="bg-sand px-6 py-10 md:px-10 xl:px-16">
        <TeaserSection
          title="Live Now"
          scope="live"
          category={category}
          price={price}
          sort={sort}
          viewAllHref="/live"
          emptyCopy="Nothing live right now — check back soon."
        />
        <TeaserSection
          title="Coming Soon"
          scope="upcoming"
          category={category}
          price={price}
          sort={sort}
          viewAllHref="/upcoming"
          emptyCopy="No upcoming drops scheduled yet."
        />
      </section>
    </>
  );
}
