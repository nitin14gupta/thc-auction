import { Container } from "@/components/ui/Container";
import { howItWorksSteps } from "@/constants/site";

const icons = {
  list: ListIcon,
  hammer: HammerIcon,
  box: BoxIcon,
} as const;

export function HowItWorks() {
  return (
    <section className="bg-sand py-16 sm:py-20">
      <Container>
        <h2 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-ink-on-sand sm:text-4xl">
          How It Works
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          {howItWorksSteps.map((step, index) => {
            const Icon = icons[step.icon];
            return (
              <div key={step.number} className="relative flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-ink-on-sand/25">
                  <Icon className="h-6 w-6 text-ink-on-sand" />
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold text-ink-on-sand">
                      {step.number}
                    </span>
                    <span className="font-[family-name:var(--font-barlow)] text-base font-bold uppercase tracking-wide text-ink-on-sand">
                      {step.title}
                    </span>
                  </div>
                  <p className="mt-1 max-w-[220px] font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
                    {step.description}
                  </p>
                </div>

                {index < howItWorksSteps.length - 1 && (
                  <ArrowRightIcon className="absolute -right-8 top-6 hidden h-6 w-6 text-ink-on-sand/50 sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </Container>
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
