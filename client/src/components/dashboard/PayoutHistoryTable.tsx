"use client";

import { useState } from "react";
import { downloadCsv } from "@/utils/csv";
import { formatLocalDateTime } from "@/utils/dateUtils";
import type { PayoutHistoryRow } from "@/types/payout";

const STATUS_LABELS: Record<PayoutHistoryRow["status"], string> = {
  paid: "Paid",
  processing: "Processing",
};

const STATUS_CLASSES: Record<PayoutHistoryRow["status"], string> = {
  paid: "bg-emerald-600/10 text-emerald-600",
  processing: "bg-gold/15 text-gold",
};

export function PayoutHistoryTable({
  rows,
  isAdmin,
  markingId,
  onMarkPaid,
}: {
  rows: PayoutHistoryRow[];
  isAdmin: boolean;
  markingId: string | null;
  onMarkPaid: (orderId: string) => void;
}) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function handleExport() {
    downloadCsv(
      "payout-history.csv",
      ["Date", "Order #", "Item", "Sale Price", "Commission", "Payout", "Status"],
      rows.map((r) => [
        r.date ? formatLocalDateTime(r.date) : "",
        r.order_id,
        r.product_name,
        r.sale_price,
        `${r.commission} (${r.commission_rate_pct}%)`,
        r.payout_amount,
        STATUS_LABELS[r.status],
      ])
    );
  }

  return (
    <div className="rounded-lg border border-ink-on-sand/10 bg-white/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand">
          Payout History
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={rows.length === 0}
          className="rounded-md bg-ink-on-sand px-4 py-2 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase text-paper disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
          No payouts yet — this fills in once a buyer pays for one of your listings.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-ink-on-sand/10 text-left">
                {["Date", "Order #", "Item", "Sale Price", "Commission", "Payout", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-2 py-2 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-wide text-muted-on-sand"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.order_id} className="border-b border-ink-on-sand/5 last:border-b-0">
                  <td className="whitespace-nowrap px-2 py-2.5 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">
                    {row.date ? formatLocalDateTime(row.date) : "—"}
                  </td>
                  <td className="px-2 py-2.5 font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
                    {row.order_id.slice(0, 8)}
                  </td>
                  <td className="max-w-[200px] truncate px-2 py-2.5 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">
                    {row.product_brand ? `${row.product_brand} — ` : ""}
                    {row.product_name}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">
                    ₹{row.sale_price.toLocaleString("en-IN")}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
                    ₹{row.commission.toLocaleString("en-IN")} ({row.commission_rate_pct}%)
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 font-[family-name:var(--font-barlow)] text-sm font-semibold text-ink-on-sand">
                    ₹{row.payout_amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-2 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 font-[family-name:var(--font-barlow)] text-xs font-semibold ${STATUS_CLASSES[row.status]}`}
                    >
                      {STATUS_LABELS[row.status]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5">
                    {isAdmin && row.status === "processing" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirmingId === row.order_id) {
                            onMarkPaid(row.order_id);
                            setConfirmingId(null);
                          } else {
                            setConfirmingId(row.order_id);
                          }
                        }}
                        onBlur={() => setConfirmingId(null)}
                        disabled={markingId === row.order_id}
                        className="rounded-md border border-ink-on-sand/20 px-3 py-1.5 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase text-ink-on-sand disabled:opacity-50"
                      >
                        {markingId === row.order_id
                          ? "Marking..."
                          : confirmingId === row.order_id
                            ? "Confirm?"
                            : "Mark Paid"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
