"use client";

import { useEffect, useState } from "react";
import { getFeaturedProducts, searchProducts } from "@/api/productApi";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import type { ProductSearchResult } from "@/types/product";

const PAGE_SIZE = 12;

export function useProductSearch() {
  const { authFetch } = useAuth();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const data = debouncedQuery.trim()
          ? await searchProducts(authFetch, debouncedQuery.trim(), PAGE_SIZE, category)
          : await getFeaturedProducts(authFetch, PAGE_SIZE, category);
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) setError("Couldn't load products. Try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, category, authFetch]);

  return {
    query,
    setQuery,
    category,
    setCategory,
    results,
    isLoading,
    error,
    isDefaultSet: !debouncedQuery.trim(),
  };
}
