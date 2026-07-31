"use client";

import { useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { downloadCsv } from "@/utils/csv";
import type { ListingPerformanceRow } from "@/types/analytics";

const PAGE_SIZE = 8;

export function ListingPerformanceTable({ rows }: { rows: ListingPerformanceRow[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleExport() {
    downloadCsv(
      "listing-performance.csv",
      ["Item", "Views", "Watchlisted", "Bids", "Conversion Rate", "Final Price", "Vs Market"],
      rows.map((r) => [
        r.product_name,
        r.views,
        r.watchlisted,
        r.bids,
        `${r.conversion_rate}%`,
        r.final_price ?? "",
        r.vs_market_pct != null ? `${r.vs_market_pct}%` : "",
      ])
    );
  }

  return (
    <div className="rounded-lg border border-ink-on-sand/10 bg-white/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand">
          Listing Performance
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
          No accepted listings yet — this table fills in once you have live or sold listings.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-ink-on-sand/10 text-left">
                {["Item", "Views", "Watchlisted", "Bids", "Conversion Rate", "Final Price", "Vs Market"].map((h) => (
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
              {pageRows.map((row) => (
                <tr key={row.listing_id} className="border-b border-ink-on-sand/5 last:border-b-0">
                  <td className="max-w-[200px] truncate px-2 py-2.5 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">
                    {row.product_name}
                  </td>
                  <td className="px-2 py-2.5 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">{row.views}</td>
                  <td className="px-2 py-2.5 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">
                    {row.watchlisted}
                  </td>
                  <td className="px-2 py-2.5 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">{row.bids}</td>
                  <td className="px-2 py-2.5 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">
                    {row.conversion_rate}%
                  </td>
                  <td className="px-2 py-2.5 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">
                    {row.final_price != null ? `₹${row.final_price.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td
                    className={`px-2 py-2.5 font-[family-name:var(--font-barlow)] text-sm ${
                      row.vs_market_pct == null
                        ? "text-muted-on-sand"
                        : row.vs_market_pct >= 0
                          ? "text-emerald-600"
                          : "text-red-urgent"
                    }`}
                  >
                    {row.vs_market_pct != null ? `${row.vs_market_pct >= 0 ? "+" : ""}${row.vs_market_pct}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} variant="light" />
        </div>
      )}
    </div>
  );
}
