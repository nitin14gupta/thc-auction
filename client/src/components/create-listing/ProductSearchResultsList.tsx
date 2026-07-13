import { ProductSearchResultCard } from "@/components/create-listing/ProductSearchResultCard";
import { ProductSearchResultCardSkeleton } from "@/components/create-listing/ProductSearchResultCardSkeleton";
import type { ProductSearchResult } from "@/types/product";

export function ProductSearchResultsList({
  results,
  isLoading,
  error,
  isDefaultSet,
  onSelect,
  isSelecting,
}: {
  results: ProductSearchResult[];
  isLoading: boolean;
  error: string | null;
  isDefaultSet: boolean;
  onSelect: (product: ProductSearchResult) => void;
  isSelecting: boolean;
}) {
  if (error) {
    return <p className="mt-4 font-[family-name:var(--font-barlow)] text-sm text-red-urgent">{error}</p>;
  }

  if (isLoading) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductSearchResultCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return <p className="mt-4 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">No products found.</p>;
  }

  return (
    <div className="mt-4">
      {isDefaultSet && (
        <p className="mb-2 font-[family-name:var(--font-barlow)] text-xs uppercase tracking-wide text-muted-on-sand">
          Trending right now
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {results.map((product) => (
          <ProductSearchResultCard key={product.id} product={product} onSelect={onSelect} disabled={isSelecting} />
        ))}
      </div>
    </div>
  );
}
