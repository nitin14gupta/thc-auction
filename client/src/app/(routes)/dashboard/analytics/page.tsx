"use client";

import { useEffect, useState } from "react";
import { getSellerAnalytics } from "@/api/analyticsApi";
import { BidsChart } from "@/components/dashboard/BidsChart";
import { EarningsChart } from "@/components/dashboard/EarningsChart";
import { ListingPerformanceTable } from "@/components/dashboard/ListingPerformanceTable";
import { StatTile } from "@/components/dashboard/StatTile";
import { useAuth } from "@/hooks/useAuth";
import type { SellerAnalytics } from "@/types/analytics";

export default function AnalyticsPage() {
  const { authFetch } = useAuth();
  const [data, setData] = useState<SellerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSellerAnalytics(authFetch)
      .then((res) => !cancelled && setData(res))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [authFetch]);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-ink-on-sand">
        Analytics
      </h1>
      <p className="mt-2 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
        Track your store performance &amp; buyer activity.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Earnings" value={isLoading ? "—" : `₹${(data?.total_earnings ?? 0).toLocaleString("en-IN")}`} />
        <StatTile label="Bids Received" value={isLoading ? "—" : String(data?.bids_received ?? 0)} />
        <StatTile label="Listing Views" value={isLoading ? "—" : String(data?.listing_views ?? 0)} />
        <StatTile label="Watchlisted" value={isLoading ? "—" : String(data?.watchlisted ?? 0)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-ink-on-sand/10 bg-white/40 p-5">
          <p className="mb-2 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand">
            Earnings Over Time
          </p>
          {isLoading ? (
            <p className="font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">Loading...</p>
          ) : (
            <EarningsChart data={data?.earnings_over_time ?? []} />
          )}
        </div>

        <div className="rounded-lg border border-ink-on-sand/10 bg-white/40 p-5">
          <p className="mb-2 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand">
            Bids Received Over Time
          </p>
          {isLoading ? (
            <p className="font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">Loading...</p>
          ) : (
            <BidsChart data={data?.bids_over_time ?? []} />
          )}
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">Loading...</p>
        ) : (
          <ListingPerformanceTable rows={data?.listing_performance ?? []} />
        )}
      </div>

      <p className="mt-4 font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
        Earnings reflect confirmed payouts only, recorded once a sale is paid and delivered — not just bid on.
      </p>
    </div>
  );
}
