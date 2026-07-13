export function WhyItMattersCallout({ title, body }: { title: string; body: string }) {
  return (
    <div className="w-[260px] shrink-0 rounded-xl border border-ink-on-sand/10 bg-white/40 p-5">
      <div className="flex items-center gap-2">
        <ShieldIcon className="h-4 w-4 text-gold" />
        <p className="font-[family-name:var(--font-barlow)] text-sm font-semibold text-ink-on-sand">{title}</p>
      </div>
      <p className="mt-2 font-[family-name:var(--font-barlow)] text-xs leading-relaxed text-muted-on-sand">{body}</p>
    </div>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3l7 3v6c0 4.4-3 7.9-7 9-4-1.1-7-4.6-7-9V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
