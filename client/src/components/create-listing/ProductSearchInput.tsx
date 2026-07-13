export function ProductSearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-md border border-ink-on-sand/20 bg-white/60 px-4">
      <SearchIcon className="h-4 w-4 shrink-0 text-muted-on-sand" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search sneakers, brands, SKU or collections"
        className="w-full bg-transparent font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand placeholder:text-muted-on-sand focus:outline-none"
      />
    </div>
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
