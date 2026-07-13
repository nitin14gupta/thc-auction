import Link from "next/link";
import type { ReactNode } from "react";

export function ReviewSummarySection({
  title,
  editHref,
  children,
}: {
  title: string;
  editHref: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-ink-on-sand/10 py-4 last:border-b-0">
      <div className="flex items-center justify-between">
        <p className="font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand">
          {title}
        </p>
        <Link href={editHref} className="font-[family-name:var(--font-barlow)] text-xs font-medium text-gold hover:underline">
          Edit
        </Link>
      </div>
      <div className="mt-2 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">{children}</div>
    </div>
  );
}
