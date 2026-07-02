import { Container } from "@/components/ui/Container";
import { stats } from "@/constants/site";

const icons = {
  auctions: GavelWaveIcon,
  users: UsersIcon,
  volume: CoinsIcon,
} as const;

export function StatsStrip() {
  return (
    <div className="border-t border-ink-on-sand/10 bg-sand">
      <Container className="flex flex-wrap items-center gap-8 py-6 sm:gap-10">
        {stats.map((stat, index) => {
          const Icon = icons[stat.icon];
          return (
            <div key={stat.label} className="flex items-center gap-3">
              {index > 0 && (
                <span className="hidden h-8 w-px bg-ink-on-sand/15 sm:block" aria-hidden="true" />
              )}
              <Icon className="h-6 w-6 text-ink-on-sand" />
              <div>
                <p className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold leading-none text-ink-on-sand">
                  {stat.value}
                </p>
                <p className="mt-1 font-[family-name:var(--font-barlow)] text-xs font-medium uppercase tracking-wide text-muted-on-sand">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}

        <a
          href="/market-pulse"
          className="ml-auto flex items-center gap-2 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand"
        >
          Market Pulse
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </Container>
    </div>
  );
}

function GavelWaveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 20c1.5-3 2.5-3 4 0s2.5 3 4 0 2.5-3 4 0 2.5 3 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 20c.2-2.4 1.7-4 3.7-4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CoinsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 6v5c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 11v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
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
