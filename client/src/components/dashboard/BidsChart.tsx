"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BidsPoint } from "@/types/analytics";

export function BidsChart({ data }: { data: BidsPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
        No bids recorded yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#83766a20" vertical={false} />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 11, fill: "#83766a" }}
          tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: "#83766a" }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
        <Tooltip
          formatter={(value) => [value, "Bids"]}
          labelFormatter={(v) => new Date(String(v)).toLocaleDateString()}
          contentStyle={{ background: "#141110", border: "none", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#f4f1ec" }}
          itemStyle={{ color: "#d9c4a8" }}
          cursor={{ fill: "#83766a10" }}
        />
        <Bar dataKey="count" fill="#d9c4a8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
