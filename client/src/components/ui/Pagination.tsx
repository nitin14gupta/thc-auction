export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="h-8 rounded-md border border-ink-on-sand/20 px-3 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase text-ink-on-sand disabled:opacity-40"
      >
        Prev
      </button>

      <span className="font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="h-8 rounded-md border border-ink-on-sand/20 px-3 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase text-ink-on-sand disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
