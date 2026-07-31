"use client";

import { useState } from "react";
import { productCategories } from "@/constants/productCategories";

const CATEGORY_LABELS = ["All Categories", ...productCategories] as const;
const PRICE_OPTIONS = ["Any", "0 - 5k", "5k - 10k", "10k - 20k", "20k - 30k", "30k - 40k", "40k - 50k", "50k +"] as const;

export type HomeSortOption = "newest" | "price_asc" | "price_desc";
const SORT_LABELS: Record<HomeSortOption, string> = {
  newest: "Newest",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
};

export function parsePriceBucket(bucket: string): [number, number] {
  if (bucket === "Any") return [0, Infinity];
  if (bucket === "50k +") return [50000, Infinity];
  const [lo, hi] = bucket.split(" - ").map((part) => Number(part.replace("k", "")) * 1000);
  return [lo, hi];
}

export function FilterBar({
  category,
  setCategory,
  price,
  setPrice,
  sort,
  setSort,
}: {
  category: string | undefined;
  setCategory: (v: string | undefined) => void;
  price: string;
  setPrice: (v: string) => void;
  sort: HomeSortOption;
  setSort: (v: HomeSortOption) => void;
}) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const fields = [
    {
      label: "Category",
      display: category ?? "All Categories",
      options: CATEGORY_LABELS,
      onSelect: (option: string) => setCategory(option === "All Categories" ? undefined : option),
    },
    {
      label: "Price",
      display: price,
      options: PRICE_OPTIONS,
      onSelect: (option: string) => setPrice(option),
    },
    {
      label: "Sort By",
      display: SORT_LABELS[sort],
      options: (Object.keys(SORT_LABELS) as HomeSortOption[]).map((key) => SORT_LABELS[key]),
      onSelect: (option: string) => {
        const match = (Object.keys(SORT_LABELS) as HomeSortOption[]).find((key) => SORT_LABELS[key] === option);
        if (match) setSort(match);
      },
    },
  ];

  return (
    <div className="border-b border-white/10 bg-ink">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 px-6 py-5 md:px-10 xl:px-16">
        {fields.map((field) => (
          <div key={field.label} className="flex items-center gap-6">
            <div className="relative">
              <p className="font-[family-name:var(--font-barlow)] text-[11px] font-medium uppercase tracking-widest text-[#aaaaaae6]">
                {field.label}
              </p>
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === field.label ? null : field.label)}
                className="mt-1 flex items-center gap-1.5 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-[#ffffff]"
              >
                {field.display}
                <ChevronDownIcon className="h-3.5 w-3.5 text-[#ffffff]" />
              </button>

              {activeDropdown === field.label && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                  <div className="absolute left-0 top-full z-50 mt-2 max-h-72 min-w-[180px] overflow-y-auto rounded-md border border-white/15 bg-ink py-1 shadow-lg">
                    {field.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          field.onSelect(option);
                          setActiveDropdown(null);
                        }}
                        className="block w-full whitespace-nowrap px-4 py-2 text-left font-[family-name:var(--font-barlow)] text-sm uppercase tracking-wide text-[#ffffff] transition-colors hover:bg-white/10"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <span className="hidden h-8 w-px bg-white/10 last-of-type:hidden sm:block" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
