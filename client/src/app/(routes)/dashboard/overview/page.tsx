"use client";

import { useAuth } from "@/hooks/useAuth";

export default function OverviewPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-ink-on-sand">
        Welcome back, {user?.name}.
      </h1>
      <p className="mt-2 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
        Here&apos;s a snapshot of your seller activity.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Active Listings", value: "0" },
          { label: "Pending Review", value: "0" },
          { label: "Total Earnings", value: "₹0" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-ink-on-sand/10 bg-white/40 p-5">
            <p className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-widest text-muted-on-sand">
              {stat.label}
            </p>
            <p className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold text-ink-on-sand">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
