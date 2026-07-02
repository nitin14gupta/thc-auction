import { Container } from "@/components/ui/Container";
import { filters } from "@/constants/site";

export function FilterBar() {
  return (
    <div className="border-b border-white/10 bg-ink">
      <Container className="flex flex-wrap items-center gap-x-8 gap-y-4 py-5">
        {filters.map((filter) => (
          <div key={filter.label} className="flex items-center gap-6">
            <div>
              <p className="font-[family-name:var(--font-barlow)] text-[11px] font-medium uppercase tracking-widest text-gray-on-dark">
                {filter.label}
              </p>
              <button
                type="button"
                className="mt-1 flex items-center gap-1.5 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-paper"
              >
                {filter.value}
                <ChevronDownIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="hidden h-8 w-px bg-white/10 last-of-type:hidden sm:block" aria-hidden="true" />
          </div>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-paper transition-colors hover:bg-white/10"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-paper transition-colors hover:bg-white/10"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </Container>
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M19 12H5m0 0 6 6m-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
