"use client";

import { useEffect, useState } from "react";
import { getOverview } from "@/api/analyticsApi";
import { ActiveListingsPreviewGrid } from "@/components/dashboard/ActiveListingsPreviewGrid";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";
import { StatTile } from "@/components/dashboard/StatTile";
import { useAuth } from "@/hooks/useAuth";
import type { Overview } from "@/types/analytics";

export default function OverviewPage() {
  const { user, authFetch } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getOverview(authFetch)
      .then((data) => !cancelled && setOverview(data))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [authFetch]);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-ink-on-sand">
        Welcome back, {user?.name}.
      </h1>
      <p className="mt-2 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
        Here&apos;s a snapshot of your seller activity.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Active Listings" value={isLoading ? "—" : String(overview?.active_listings ?? 0)} />
        <StatTile label="Pending Review" value={isLoading ? "—" : String(overview?.pending_review ?? 0)} />
        <StatTile
          label="Total Earnings"
          value={isLoading ? "—" : `₹${(overview?.total_earnings ?? 0).toLocaleString("en-IN")}`}
        />
      </div>

      <div className="mt-8 rounded-lg border border-ink-on-sand/10 bg-white/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand">
            Recent Activity
          </p>
        </div>
        {isLoading ? (
          <p className="font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">Loading...</p>
        ) : (
          <RecentActivityList events={overview?.recent_activity ?? []} />
        )}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand">
            Active Listings ({overview?.active_listings ?? 0})
          </p>
        </div>
        {isLoading ? (
          <p className="font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">Loading...</p>
        ) : (
          <ActiveListingsPreviewGrid listings={overview?.active_listings_preview ?? []} />
        )}
      </div>
    </div>
  );
}
