import type { ReactNode } from "react";

export function StepCard({
  stepNumber,
  title,
  children,
}: {
  stepNumber: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1 rounded-xl border border-ink-on-sand/10 bg-white/50 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-on-sand font-[family-name:var(--font-barlow)] text-sm font-semibold text-paper">
          {stepNumber}
        </div>
        <h2 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold text-ink-on-sand">
          {title}
        </h2>
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
