"use client";

import { useRouter } from "next/navigation";
import { StepCard } from "@/components/create-listing/StepCard";
import { ProductSearchInput } from "@/components/create-listing/ProductSearchInput";
import { CategoryFilter } from "@/components/create-listing/CategoryFilter";
import { ProductSearchResultsList } from "@/components/create-listing/ProductSearchResultsList";
import { useProductSearch } from "@/hooks/useProductSearch";
import { useListingWizard } from "@/hooks/useListingWizard";
import { useToast } from "@/hooks/useToast";
import type { ProductSearchResult } from "@/types/product";

export default function ProductStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { query, setQuery, category, setCategory, results, isLoading, error, isDefaultSet } = useProductSearch();
  const { selectProduct, state } = useListingWizard();

  async function handleSelect(product: ProductSearchResult) {
    try {
      await selectProduct(product);
      router.push("/dashboard/create-listing/details");
    } catch {
      toast("Couldn't start this listing. Try again.", "error");
    }
  }

  return (
    <StepCard stepNumber={1} title="About Your Product">
      <div>
        <p className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand">
          What product are you listing?
        </p>
        <p className="mt-1 font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
          Search and select the exact product you want to sell.
        </p>

        <div className="mt-4">
          <ProductSearchInput value={query} onChange={setQuery} />
        </div>

        <div className="mt-3">
          <CategoryFilter value={category} onChange={setCategory} />
        </div>

        <ProductSearchResultsList
          results={results}
          isLoading={isLoading}
          error={error}
          isDefaultSet={isDefaultSet}
          onSelect={handleSelect}
          isSelecting={state.isSaving}
        />
      </div>
    </StepCard>
  );
}
