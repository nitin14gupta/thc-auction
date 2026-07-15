"use client";

import { useEffect, useState } from "react";
import { browseListings } from "@/api/listingApi";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import type { AuctionScope, BrowseListing } from "@/types/listing";

const PAGE_SIZE = 12;

export function useBrowseListings(scope: AuctionScope) {
  const { authFetch } = useAuth();
  const [query, setQueryRaw] = useState("");
  const [category, setCategoryRaw] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query, 300);

  const [items, setItems] = useState<BrowseListing[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function setQuery(value: string) {
    setQueryRaw(value);
    setPage(1);
  }

  function setCategory(value: string | undefined) {
    setCategoryRaw(value);
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await browseListings(authFetch, scope, category, debouncedQuery.trim(), page, PAGE_SIZE);
        if (!cancelled) {
          setItems(data.items);
          setTotal(data.total);
        }
      } catch {
        if (!cancelled) setError("Couldn't load auctions. Try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [authFetch, scope, category, debouncedQuery, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return { query, setQuery, category, setCategory, page, setPage, totalPages, items, isLoading, error };
}
