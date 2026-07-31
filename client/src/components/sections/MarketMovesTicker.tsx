import { marketMoves } from "@/constants/site";

function TickerContent() {
  return (
    <div className="flex shrink-0 items-center gap-3 pr-3 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">
      {marketMoves.map((item, index) => (
        <span key={index} className="flex items-center gap-3 whitespace-nowrap">
          <span className="transition-colors duration-200 hover:text-ink-on-sand/80">{item}</span>
          <span className="text-ink-on-sand/40">•</span>
        </span>
      ))}
    </div>
  );
}

export function MarketMovesTicker() {
  return (
    <div className="border-y border-ink-on-sand/10 bg-sand">
      <div className="mx-auto flex w-full items-center gap-6 px-6 py-4 md:px-10 xl:px-16">
        <span className="flex shrink-0 items-center gap-2 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand">
          <BoltIcon className="h-4 w-4" />
          Market Moves
        </span>

        <div className="marquee-wrapper flex-1 overflow-hidden">
          <div className="animate-marquee flex w-max">
            <TickerContent />
            <TickerContent />
          </div>
        </div>

        <a
          href="/market"
          className="flex shrink-0 items-center gap-2 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand"
        >
          View Market
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
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
