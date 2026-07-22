const TIERS = [
  { label: "Under ₹50,000", commission: "8%" },
  { label: "₹50,000 & above", commission: "10%" },
];

export function CommissionStructureCard() {
  return (
    <div className="h-full rounded-lg border border-ink-on-sand/10 bg-white/40 p-6">
      <p className="font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand">
        Commission Structure
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {TIERS.map((tier) => (
          <div key={tier.label} className="flex items-center justify-between border-b border-ink-on-sand/10 pb-3 last:border-b-0">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-on-sand/10 text-ink-on-sand">
                <TrendIcon className="h-4 w-4" />
              </span>
              <span className="font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">{tier.label}</span>
            </div>
            <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-bold text-ink-on-sand">
              {tier.commission}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
        Final payout shown after authentication &amp; platform fees.
      </p>
    </div>
  );
}

function TrendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 16l5-5 4 4 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
