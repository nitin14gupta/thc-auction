import { productCategories } from "@/constants/productCategories";

export function CategoryFilter({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (category: string | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip label="All" isActive={!value} onClick={() => onChange(undefined)} />
      {productCategories.map((category) => (
        <Chip key={category} label={category} isActive={value === category} onClick={() => onChange(category)} />
      ))}
    </div>
  );
}

function Chip({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 font-[family-name:var(--font-barlow)] text-xs font-medium transition-colors ${
        isActive ? "bg-ink-on-sand text-paper" : "bg-white/60 text-ink-on-sand hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}
