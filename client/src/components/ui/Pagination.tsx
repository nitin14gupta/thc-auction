export function Pagination({
  page,
  totalPages,
  onChange,
  variant = "light",
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  variant?: "light" | "dark";
}) {
  if (totalPages <= 1) return null;

  const isDark = variant === "dark";
  const buttonClass = isDark
    ? "border-white/15 text-paper"
    : "border-ink-on-sand/20 text-ink-on-sand";
  const labelClass = isDark ? "text-gray-on-dark" : "text-muted-on-sand";

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className={`h-8 rounded-md border px-3 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase disabled:opacity-40 ${buttonClass}`}
      >
        Prev
      </button>

      <span className={`font-[family-name:var(--font-barlow)] text-xs ${labelClass}`}>
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className={`h-8 rounded-md border px-3 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase disabled:opacity-40 ${buttonClass}`}
      >
        Next
      </button>
    </div>
  );
}
