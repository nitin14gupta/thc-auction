"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EarningsPoint } from "@/types/analytics";

export function EarningsChart({ data }: { data: EarningsPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
        No earnings recorded yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#83766a20" vertical={false} />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 11, fill: "#83766a" }}
          tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: "#83766a" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Earnings"]}
          labelFormatter={(v) => new Date(String(v)).toLocaleDateString()}
          contentStyle={{ background: "#141110", border: "none", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#f4f1ec" }}
          itemStyle={{ color: "#d9c4a8" }}
        />
        <Line type="monotone" dataKey="amount" stroke="#b8935b" strokeWidth={2.5} dot={{ r: 3, fill: "#b8935b" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
