import type { SuggestedBidPrice } from "@/types/listing";

export function BidPriceOption({
  suggestion,
  isSelected,
  onSelect,
}: {
  suggestion: SuggestedBidPrice;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors ${
        isSelected ? "border-ink-on-sand bg-ink-on-sand text-paper" : "border-ink-on-sand/15 bg-white/50 text-ink-on-sand hover:border-ink-on-sand/40"
      }`}
    >
      <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold">
        ₹{suggestion.price.toLocaleString("en-IN")}
      </span>
      <span className={`font-[family-name:var(--font-barlow)] text-xs ${isSelected ? "text-paper/80" : "text-muted-on-sand"}`}>
        {suggestion.label}
      </span>
    </button>
  );
}
