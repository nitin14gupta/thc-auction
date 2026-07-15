export function EmptyAuctionState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/15 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
        <HammerIcon className="h-6 w-6 text-gray-on-dark" />
      </div>
      <p className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase text-paper">
        {title}
      </p>
      <p className="max-w-xs font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">{body}</p>
    </div>
  );
}

function HammerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m14.5 6.5 3 3M4 20l7-7M9.5 8.5l3 3-2 2-3-3 2-2Zm3.5-4.5 6 6 2-2-6-6-2 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
