import Image from "next/image";
import type { ProductSearchResult } from "@/types/product";

export function ProductSearchResultCard({
  product,
  onSelect,
  disabled,
}: {
  product: ProductSearchResult;
  onSelect: (product: ProductSearchResult) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      disabled={disabled}
      className="flex flex-col overflow-hidden rounded-lg border border-ink-on-sand/10 bg-white/50 text-left transition-colors hover:border-gold/50 disabled:opacity-50"
    >
      <div className="relative aspect-square w-full bg-sand">
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 220px"
            unoptimized
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand">
          {product.name}
        </p>
        <p className="font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
          {product.brand ?? product.product_type ?? "—"}
        </p>
        {product.price != null && (
          <span className="mt-auto pt-1 font-[family-name:var(--font-barlow-condensed)] text-sm font-bold text-ink-on-sand">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        )}
      </div>
    </button>
  );
}
