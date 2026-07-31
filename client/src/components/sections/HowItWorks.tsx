import { howItWorksSteps } from "@/constants/site";

const icons = {
  list: ListIcon,
  hammer: HammerIcon,
  box: BoxIcon,
} as const;

export function HowItWorks() {
  return (
    <section className="bg-sand px-6 py-20 sm:py-24 md:px-10 xl:px-16">
      <h2 className="font-[family-name:var(--font-barlow-condensed)] text-4xl font-extrabold uppercase tracking-tight text-ink-on-sand sm:text-5xl">
        How It Works
      </h2>

      <div className="mt-16 grid grid-cols-1 items-start gap-12 sm:grid-cols-3 sm:gap-x-12 sm:gap-y-0">
        {howItWorksSteps.map((step, index) => {
          const Icon = icons[step.icon];
          return (
            <div key={step.number} className="group/step relative">
              <div className="flex items-start gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-ink-on-sand/25 transition-colors duration-300 group-hover/step:border-gold/40">
                  <Icon className="h-8 w-8 text-ink-on-sand" />
                </div>

                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-[family-name:var(--font-barlow-condensed)] text-5xl font-bold text-ink-on-sand">
                      {step.number}
                    </span>
                    <span className="font-[family-name:var(--font-barlow)] text-xl font-bold uppercase tracking-wide text-ink-on-sand">
                      {step.title}
                    </span>
                  </div>
                  <p className="mt-2 max-w-[280px] font-[family-name:var(--font-barlow)] text-base text-[#000000b3]">
                    {step.description}
                  </p>
                </div>
              </div>

              {index > 0 && (
                <div className="pointer-events-none absolute right-[100%] top-10 hidden -translate-x-px sm:flex">
                  <svg
                    className="h-3 w-10 text-[#000000]"
                    viewBox="0 0 32 8"
                    fill="none"
                  >
                    <line
                      x1="0"
                      y1="4"
                      x2="24"
                      y2="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path d="M24 0L32 4L24 8V0Z" fill="currentColor" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 3.5h6M9 10h6M9 14h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function HammerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m14 6 4 4M4 20l7-7M6.5 12.5l5-5 4 4-5 5-4-4Zm7.5-9 2.5-2.5L20 4.5 17.5 7 14 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21 8 12 3 3 8m18 0-9 5m9-5v8l-9 5m0-8L3 8m9 5v8M3 8v8l9 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
