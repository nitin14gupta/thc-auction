"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { wizardSteps } from "@/constants/wizardSteps";
import { useListingWizard } from "@/hooks/useListingWizard";

export function Stepper() {
  const pathname = usePathname();
  const { state } = useListingWizard();
  const activeStep = wizardSteps.find((s) => pathname.startsWith(s.path))?.step ?? 1;
  const reachableStep = Math.max(activeStep, state.currentStep);

  return (
    <div className="flex items-center gap-2">
      {wizardSteps.map((s, index) => {
        const isCompleted = s.step < activeStep || (s.step < state.currentStep && s.step !== activeStep);
        const isActive = s.step === activeStep;
        const isReachable = state.listingId != null && s.step <= reachableStep;

        const circle = (
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full font-[family-name:var(--font-barlow)] text-sm font-semibold ${
                isActive
                  ? "bg-ink-on-sand text-paper"
                  : isCompleted
                    ? "bg-ink-on-sand/80 text-paper"
                    : "border border-ink-on-sand/30 text-ink-on-sand/50"
              }`}
            >
              {isCompleted ? <CheckIcon className="h-4 w-4" /> : s.step}
            </div>
            <span
              className={`font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-wide ${
                isActive ? "text-ink-on-sand" : "text-muted-on-sand"
              }`}
            >
              {s.label}
            </span>
          </div>
        );

        return (
          <div key={s.step} className="flex items-center gap-2">
            {isReachable ? (
              <Link href={s.path} className="cursor-pointer">
                {circle}
              </Link>
            ) : (
              <div className="cursor-not-allowed opacity-60">{circle}</div>
            )}
            {index < wizardSteps.length - 1 && <div className="mb-4 h-px w-8 bg-ink-on-sand/20" />}
          </div>
        );
      })}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12.5 10 17l9-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
