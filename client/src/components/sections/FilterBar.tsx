"use client";

import { useState } from "react";
import { filters } from "@/constants/site";

const CATEGORY_OPTIONS = [
  "Sneakers",
  "Apparel",
  "Beauty",
  "Accessories",
  "Bags",
  "Collectables",
] as const;

const PRICE_OPTIONS = [
  "0 - 5k",
  "5k - 10k",
  "10k - 20k",
  "20k - 30k",
  "30k - 40k",
  "40k - 50k",
  "50k +",
] as const;

const ENDING_OPTIONS = [
  "1 Day",
  "7 Day",
  "10 Day",
  "20 Day",
  "30 Day",
] as const;

const SORT_OPTIONS = [
  "Ending Soon",
  "Coming Soon",
  "Live",
] as const;

function getFilterValue(
  label: string,
  category: string,
  price: string,
  ending: string,
  sort: string,
) {
  switch (label) {
    case "Category": return category;
    case "Price": return price;
    case "Ending": return ending;
    case "Sort By": return sort;
    default: return filters.find((f) => f.label === label)?.value ?? "";
  }
}

function getDropdownOptions(label: string) {
  switch (label) {
    case "Category": return CATEGORY_OPTIONS;
    case "Price": return PRICE_OPTIONS;
    case "Ending": return ENDING_OPTIONS;
    case "Sort By": return SORT_OPTIONS;
    default: return [];
  }
}

function getActiveValue(label: string, category: string, price: string, ending: string, sort: string) {
  switch (label) {
    case "Category": return category;
    case "Price": return price;
    case "Ending": return ending;
    case "Sort By": return sort;
    default: return "";
  }
}

function handleSelect(
  label: string,
  option: string,
  setCategory: (v: string) => void,
  setPrice: (v: string) => void,
  setEnding: (v: string) => void,
  setSort: (v: string) => void,
) {
  switch (label) {
    case "Category": setCategory(option); break;
    case "Price": setPrice(option); break;
    case "Ending": setEnding(option); break;
    case "Sort By": setSort(option); break;
  }
}

export function FilterBar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [category, setCategory] = useState("Sneakers");
  const [price, setPrice] = useState("0 - 5k");
  const [ending, setEnding] = useState("1 Day");
  const [sort, setSort] = useState("Live");

  return (
    <div className="border-b border-white/10 bg-ink">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 px-6 py-5 md:px-10 xl:px-16">
        {filters.map((filter) => (
          <div key={filter.label} className="flex items-center gap-6">
            <div className="relative">
              <p className="font-[family-name:var(--font-barlow)] text-[11px] font-medium uppercase tracking-widest text-[#aaaaaae6]">
                {filter.label}
              </p>
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === filter.label ? null : filter.label,
                  )
                }
                className="mt-1 flex items-center gap-1.5 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-[#ffffff]"
              >
                {getFilterValue(filter.label, category, price, ending, sort)}
                <ChevronDownIcon className="h-3.5 w-3.5 text-[#ffffff]" />
              </button>

              {["Category", "Price", "Ending", "Sort By"].includes(filter.label) &&
                activeDropdown === filter.label && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setActiveDropdown(null)}
                  />
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-[160px] rounded-md border border-white/15 bg-ink py-1 shadow-lg">
                    {getDropdownOptions(filter.label).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          handleSelect(filter.label, option, setCategory, setPrice, setEnding, setSort);
                          setActiveDropdown(null);
                        }}
                        className="block w-full px-4 py-2 text-left font-[family-name:var(--font-barlow)] text-sm uppercase tracking-wide text-[#ffffff] transition-colors hover:bg-white/10"
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

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#aaaaaa99] text-paper transition-colors hover:border-[#aaaaaa] hover:bg-white/10"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#aaaaaa99] text-paper transition-colors hover:border-[#aaaaaa] hover:bg-white/10"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
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

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M19 12H5m0 0 6 6m-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
