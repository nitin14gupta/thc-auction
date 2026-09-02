"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";
import { AuctionListingCard } from "@/components/auctions/AuctionListingCard";
import { AuctionListingCardSkeleton } from "@/components/auctions/AuctionListingCardSkeleton";
import { EmptyAuctionState } from "@/components/auctions/EmptyAuctionState";
import { useBrowseListings } from "@/hooks/useBrowseListings";
import { useCountdown } from "@/hooks/useCountdown";
import type { AuctionScope, BrowseListing } from "@/types/listing";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortOption = "newest" | "price_asc" | "price_desc" | "most_watched";
type ViewMode = "grid" | "list";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  most_watched: "Most Watched",
};

const EMPTY_COPY: Record<AuctionScope, { title: string; body: string }> = {
  live: { title: "Nothing live right now", body: "Check back soon, or browse upcoming drops." },
  upcoming: { title: "No upcoming drops yet", body: "New auctions get scheduled all the time — check back soon." },
  sold: { title: "No sales yet", body: "Once auctions close with a winning bid, they'll show up here." },
};

const BADGE: Record<AuctionScope, { label: string; className: string }> = {
  live: { label: "● HYPE Verified", className: "bg-[#1a7a3c] text-white" },
  upcoming: { label: "HYPE Verified", className: "bg-gold text-ink-on-sand" },
  sold: { label: "Sold", className: "bg-emerald-600 text-white" },
};

// ─── Sidebar constants ────────────────────────────────────────────────────────

const BRANDS = ["Nike", "Jordan", "Adidas", "New Balance", "Other"];
const UK_SIZES = ["All", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18+"];
const CONDITIONS: { value: string; label: string }[] = [
  { value: "All", label: "All" },
  { value: "DS", label: "DS / Brand New" },
  { value: "VNDS", label: "VNDS / Like New" },
  { value: "USED", label: "Used" },
  { value: "BEAT", label: "Beat" },
];
const CATEGORY_OPTIONS = ["All Categories", "Sneakers", "Apparel", "Collectibles"];
const MAX_PRICE_CEILING = 1000000;

function extractSizeNumber(variantSize: string | null | undefined): number | null {
  const match = (variantSize ?? "").match(/(\d+(\.\d+)?)/);
  return match ? Math.floor(parseFloat(match[1])) : null;
}

function matchesFilters(
  listing: BrowseListing,
  { brand, sizes, conditions, maxPrice }: { brand: string | undefined; sizes: string[]; conditions: string[]; maxPrice: number }
): boolean {
  if (brand) {
    const listingBrand = (listing.product?.brand ?? "").toLowerCase();
    if (brand === "Other") {
      const known = BRANDS.filter((b) => b !== "Other").map((b) => b.toLowerCase());
      if (known.includes(listingBrand)) return false;
    } else if (listingBrand !== brand.toLowerCase()) {
      return false;
    }
  }

  if (!sizes.includes("All")) {
    const num = extractSizeNumber(listing.variant_size);
    const sizeOk = sizes.some((s) => (s === "18+" ? num != null && num >= 18 : num === Number(s)));
    if (!sizeOk) return false;
  }

  if (!conditions.includes("All") && !conditions.includes(listing.condition_grade ?? "")) {
    return false;
  }

  if (listing.bid_price != null && listing.bid_price > maxPrice) return false;

  return true;
}

// ─── Sidebar Filter ───────────────────────────────────────────────────────────

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-ink-on-sand/10 py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between font-[family-name:var(--font-barlow)] text-base font-bold uppercase tracking-[0.15em] text-ink-on-sand"
      >
        {title}
        <ChevronIcon className={`h-3 w-3 transition-transform ${open ? "" : "-rotate-180"}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function Sidebar({
  category,
  setCategory,
  sort,
  setSort,
  brand,
  setBrand,
  selectedSizes,
  setSelectedSizes,
  selectedConditions,
  setSelectedConditions,
  maxPrice,
  setMaxPrice,
}: {
  category: string | undefined;
  setCategory: (v: string | undefined) => void;
  sort: SortOption;
  setSort: (v: SortOption) => void;
  brand: string | undefined;
  setBrand: (v: string | undefined) => void;
  selectedSizes: string[];
  setSelectedSizes: (v: string[] | ((prev: string[]) => string[])) => void;
  selectedConditions: string[];
  setSelectedConditions: (v: string[] | ((prev: string[]) => string[])) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
}) {
  const [brandSearch, setBrandSearch] = useState("");

  function toggleSize(size: string) {
    if (size === "All") { setSelectedSizes(["All"]); return; }
    setSelectedSizes((prev) => {
      const without = prev.filter((s) => s !== "All");
      return without.includes(size) ? without.filter((s) => s !== size) || ["All"] : [...without, size];
    });
  }

  function toggleCondition(cond: string) {
    if (cond === "All") { setSelectedConditions(["All"]); return; }
    setSelectedConditions((prev) => {
      const without = prev.filter((c) => c !== "All");
      return without.includes(cond) ? without.filter((c) => c !== cond) || ["All"] : [...without, cond];
    });
  }

  const filteredBrands = BRANDS.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <aside className="sticky top-24 w-[300px] shrink-0 self-start rounded-lg border border-ink-on-sand/10 bg-paper px-4 py-1">
      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
      {/* Category */}
      <SidebarSection title="Category">
        <div className="flex flex-col gap-2">
          {CATEGORY_OPTIONS.map((cat) => {
            const val = cat === "All Categories" ? undefined : cat;
            const active = cat === "All Categories" ? !category : category === cat;
            return (
              <label key={cat} className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="category"
                  checked={active}
                  onChange={() => setCategory(val)}
                  className="h-5 w-5 accent-ink-on-sand"
                />
                <span className={`flex-1 font-[family-name:var(--font-barlow)] text-base ${active ? "font-semibold text-ink-on-sand" : "text-ink-on-sand/70"}`}>
                  {cat}
                </span>
              </label>
            );
          })}
        </div>
      </SidebarSection>

      {/* Brand */}
      <SidebarSection title="Brand">
        <div className="mb-2.5 flex items-center gap-2 rounded-md border border-ink-on-sand/15 bg-sand px-3 py-2">
          <SearchIcon className="h-4 w-4 shrink-0 text-muted-on-sand" />
          <input
            type="text"
            placeholder="Search brand"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full bg-transparent font-[family-name:var(--font-barlow)] text-base text-ink-on-sand placeholder:text-muted-on-sand focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          {brand && (
            <button
              type="button"
              onClick={() => setBrand(undefined)}
              className="self-start font-[family-name:var(--font-barlow)] text-xs font-medium text-gold underline"
            >
              Clear
            </button>
          )}
          {filteredBrands.map((b) => {
            const active = brand === b;
            return (
              <label key={b} className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="brand"
                  checked={active}
                  onChange={() => setBrand(b)}
                  className="h-5 w-5 accent-ink-on-sand"
                />
                <span className={`flex-1 font-[family-name:var(--font-barlow)] text-base ${active ? "font-semibold text-ink-on-sand" : "text-ink-on-sand/70"}`}>
                  {b}
                </span>
              </label>
            );
          })}
        </div>
      </SidebarSection>

      {/* Size (UK) */}
      <SidebarSection title="Size (UK)">
        <div className="flex flex-wrap gap-1.5">
          {UK_SIZES.map((size, i) => {
            const active = selectedSizes.includes(size);
            return (
              <button
                key={`${size}-${i}`}
                type="button"
                onClick={() => toggleSize(size)}
                className={`flex h-10 min-w-[40px] items-center justify-center rounded-md border px-3 font-[family-name:var(--font-barlow)] text-base font-medium transition-colors ${
                  active
                    ? "border-ink-on-sand bg-ink-on-sand text-paper"
                    : "border-ink-on-sand/20 bg-transparent text-ink-on-sand/70 hover:border-ink-on-sand/50"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </SidebarSection>

      {/* Condition */}
      <SidebarSection title="Condition">
        <div className="flex flex-col gap-2">
          {CONDITIONS.map((cond) => {
            const active = selectedConditions.includes(cond.value);
            return (
              <label key={cond.value} className="flex cursor-pointer items-center gap-3">
                <span
                  onClick={() => toggleCondition(cond.value)}
                  className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
                    active ? "border-ink-on-sand bg-ink-on-sand" : "border-ink-on-sand/30 bg-transparent"
                  }`}
                >
                  {active && <CheckIcon className="h-3 w-3 text-paper" />}
                </span>
                <span
                  onClick={() => toggleCondition(cond.value)}
                  className={`flex-1 font-[family-name:var(--font-barlow)] text-base ${active ? "font-medium text-ink-on-sand" : "text-ink-on-sand/70"}`}
                >
                  {cond.label}
                </span>
              </label>
            );
          })}
        </div>
      </SidebarSection>

      {/* Price Range */}
      <SidebarSection title="Price Range">
        <p className="mb-2 font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">Max</p>
        <div className="mb-2 flex h-10 items-center rounded-md border border-ink-on-sand/15 bg-sand px-3">
          <span className="font-[family-name:var(--font-barlow)] text-base text-ink-on-sand/60">₹</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full bg-transparent font-[family-name:var(--font-barlow)] text-base text-ink-on-sand focus:outline-none"
          />
        </div>
        <input
          type="range"
          min={0}
          max={MAX_PRICE_CEILING}
          step={1000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-ink-on-sand"
        />
      </SidebarSection>

      {/* Sort */}
      <SidebarSection title="Sort">
        <div className="flex flex-col gap-2">
          {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="sort"
                checked={sort === opt}
                onChange={() => setSort(opt)}
                className="h-5 w-5 accent-ink-on-sand"
              />
              <span className={`font-[family-name:var(--font-barlow)] text-base ${sort === opt ? "font-semibold text-ink-on-sand" : "text-ink-on-sand/70"}`}>
                {SORT_LABELS[opt]}
              </span>
            </label>
          ))}
        </div>
      </SidebarSection>

      </div>
    </aside>
  );
}

// ─── Card (List row) ──────────────────────────────────────────────────────────

function ListingRow({ listing, scope }: { listing: BrowseListing; scope: AuctionScope }) {
  const product = listing.product;
  const badge = BADGE[scope];
  const countdownTarget = scope === "live" ? listing.close_deadline : scope === "upcoming" ? listing.auction_start_at : null;
  const countdown = useCountdown(countdownTarget);

  return (
    <Link
      href={`/${scope}/${listing.id}`}
      className="group flex items-center gap-4 rounded-lg border border-ink-on-sand/10 bg-white/60 px-4 py-3 transition-all duration-200 hover:border-gold/50 hover:shadow-sm"
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-sand">
        {product?.image_url ? (
          <Image src={product.image_url} alt={product?.name ?? ""} fill className="object-cover" sizes="80px" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImagePlaceholderIcon className="h-5 w-5 text-muted-on-sand/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 font-[family-name:var(--font-barlow)] text-[9px] font-bold uppercase tracking-wider ${badge.className}`}>
            {badge.label}
          </span>
          {listing.condition_grade && (
            <span className="font-[family-name:var(--font-barlow)] text-[10px] text-muted-on-sand">
              {listing.condition_grade}
            </span>
          )}
        </div>
        <h3 className="mt-0.5 truncate font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand">
          {product?.name ?? "—"}
        </h3>
        <p className="font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
          {product?.brand ?? "—"}{listing.variant_size ? ` · ${listing.variant_size}` : ""}
        </p>
      </div>

      {/* Price + countdown */}
      <div className="shrink-0 text-right">
        <p className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold text-ink-on-sand">
          {listing.bid_price != null ? `₹${listing.bid_price.toLocaleString("en-IN")}` : "—"}
        </p>
        {countdown.label && (
          <span className={`text-[11px] font-bold tabular-nums ${countdown.isUrgent ? "text-red-urgent" : "text-muted-on-sand"}`}>
            {countdown.label}
          </span>
        )}
        <p className="font-[family-name:var(--font-barlow)] text-[11px] text-muted-on-sand">
          {scope === "live" && listing.bid_count > 0 ? `${listing.bid_count} bid${listing.bid_count === 1 ? "" : "s"}` : null}
        </p>
      </div>
    </Link>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function AuctionBrowseView({
  scope,
  title,
  subtitle,
}: {
  scope: AuctionScope;
  title: string;
  subtitle: string;
}) {
  const { category, setCategory, page, setPage, totalPages, items, isLoading, error } =
    useBrowseListings(scope);
  const [sort, setSort] = useState<SortOption>("newest");
  const [view, setView] = useState<ViewMode>("grid");
  const [brand, setBrand] = useState<string | undefined>(undefined);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["All"]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(["All"]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE_CEILING);

  // Client-side filter + sort (server already paginates category/scope; this
  // narrows and sorts the current page for brand/size/condition/price).
  const filtered = items.filter((listing) => matchesFilters(listing, { brand, sizes: selectedSizes, conditions: selectedConditions, maxPrice }));
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price_asc") return (a.bid_price ?? 0) - (b.bid_price ?? 0);
    if (sort === "price_desc") return (b.bid_price ?? 0) - (a.bid_price ?? 0);
    if (sort === "most_watched") return (b.bid_count ?? 0) - (a.bid_count ?? 0);
    return 0; // newest — keep server order
  });

  return (
    <div className="bg-sand">

      <div className="px-6 py-8 md:px-10">
        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-ink-on-sand">
            {title}
          </h1>
          <p className="mt-1 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">{subtitle}</p>
        </div>

        {/* Top bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="h-8 appearance-none rounded-md border border-ink-on-sand/15 bg-paper pl-3 pr-8 font-[family-name:var(--font-barlow)] text-xs text-ink-on-sand focus:border-ink-on-sand/40 focus:outline-none"
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                  <option key={opt} value={opt}>{`Sort by: ${SORT_LABELS[opt]}`}</option>
                ))}
              </select>
              <ChevronIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-on-sand" />
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 rounded-md border border-ink-on-sand/15 bg-paper p-1">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`flex h-6 w-6 items-center justify-center rounded ${view === "grid" ? "bg-ink-on-sand text-paper" : "text-muted-on-sand hover:text-ink-on-sand"}`}
                aria-label="Grid view"
              >
                <GridIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`flex h-6 w-6 items-center justify-center rounded ${view === "list" ? "bg-ink-on-sand text-paper" : "text-muted-on-sand hover:text-ink-on-sand"}`}
                aria-label="List view"
              >
                <ListIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <Sidebar
              category={category}
              setCategory={setCategory}
              sort={sort}
              setSort={setSort}
              brand={brand}
              setBrand={setBrand}
              selectedSizes={selectedSizes}
              setSelectedSizes={setSelectedSizes}
              selectedConditions={selectedConditions}
              setSelectedConditions={setSelectedConditions}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
            />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {error ? (
              <p className="mt-8 font-[family-name:var(--font-barlow)] text-sm text-red-urgent">{error}</p>
            ) : isLoading ? (
              <div className={view === "grid" ? "grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4" : "flex flex-col gap-3"}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <AuctionListingCardSkeleton key={i} />
                ))}
              </div>
            ) : sorted.length === 0 && items.length > 0 ? (
              <EmptyAuctionState title="No matches" body="No listings match these filters — try widening your brand, size, condition, or price range." />
            ) : sorted.length === 0 ? (
              <EmptyAuctionState title={EMPTY_COPY[scope].title} body={EMPTY_COPY[scope].body} />
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                {sorted.map((listing) => (
                  <AuctionListingCard key={listing.id} listing={listing} scope={scope} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sorted.map((listing) => (
                  <ListingRow key={listing.id} listing={listing} scope={scope} />
                ))}
              </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} variant="light" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
