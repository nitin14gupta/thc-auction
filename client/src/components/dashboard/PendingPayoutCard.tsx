export function PendingPayoutCard({ pendingPayout, pendingCount }: { pendingPayout: number; pendingCount: number }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-lg bg-ink p-6">
      <div>
        <div className="flex items-center gap-2 text-gray-on-dark">
          <WalletIcon className="h-4 w-4" />
          <p className="font-[family-name:var(--font-barlow)] text-xs font-medium uppercase tracking-wide">
            Pending Payout
          </p>
        </div>
        <p className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-4xl font-extrabold text-paper">
          ₹{pendingPayout.toLocaleString("en-IN")}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1.5 font-[family-name:var(--font-barlow)] text-xs font-semibold text-gold">
          <ClockIcon className="h-3.5 w-3.5" />
          {pendingCount} order{pendingCount === 1 ? "" : "s"} awaiting payout
        </span>
      </div>

      <p className="mt-4 flex items-start gap-1.5 font-[family-name:var(--font-barlow)] text-xs text-gray-on-dark">
        <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Payouts are processed after authentication &amp; delivery.
      </p>
    </div>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 13a1.5 1.5 0 1 0 0-3h5v3h-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M3 8h13" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5M12 8v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
