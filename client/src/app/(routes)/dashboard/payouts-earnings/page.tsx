"use client";

import { useEffect, useState } from "react";
import { getMyPayouts, markOrderPaidOut } from "@/api/payoutApi";
import { CommissionStructureCard } from "@/components/dashboard/CommissionStructureCard";
import { PayoutHistoryTable } from "@/components/dashboard/PayoutHistoryTable";
import { PendingPayoutCard } from "@/components/dashboard/PendingPayoutCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import type { SellerPayouts } from "@/types/payout";

export default function PayoutsEarningsPage() {
  const { authFetch, user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<SellerPayouts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const result = await getMyPayouts(authFetch);
        if (!cancelled) setData(result);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authFetch, reloadKey]);

  async function handleMarkPaid(orderId: string) {
    setMarkingId(orderId);
    try {
      await markOrderPaidOut(authFetch, orderId);
      toast("Marked as paid out.", "success");
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't mark this payout as paid.", "error");
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-ink-on-sand">
        Payouts &amp; Earnings
      </h1>
      <p className="mt-2 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
        Track what you&apos;re owed and how much you&apos;ve been paid out for.
      </p>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-40 animate-pulse rounded-lg bg-ink-on-sand/10" />
          <div className="h-40 animate-pulse rounded-lg bg-ink-on-sand/10" />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PendingPayoutCard pendingPayout={data?.pending_payout ?? 0} pendingCount={data?.pending_count ?? 0} />
          <CommissionStructureCard />
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-lg bg-ink-on-sand/10" />
        ) : (
          <PayoutHistoryTable
            rows={data?.history ?? []}
            isAdmin={Boolean(user?.is_admin)}
            markingId={markingId}
            onMarkPaid={handleMarkPaid}
          />
        )}
      </div>
    </div>
  );
}
