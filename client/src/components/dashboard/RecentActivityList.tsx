import { formatLocalDateTime } from "@/utils/dateUtils";
import type { ActivityEvent } from "@/types/analytics";

const DOT_COLOR: Record<string, string> = {
  bid: "bg-gold",
  sold: "bg-emerald-500",
  submitted: "bg-tan",
  created: "bg-ink-on-sand/40",
  payout: "bg-emerald-500",
};

export function RecentActivityList({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
        No activity yet — it&apos;ll show up here as your listings get views, bids, and sales.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {events.map((event, i) => (
        <li key={i} className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLOR[event.type] ?? "bg-ink-on-sand/40"}`} />
            <p className="font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand">{event.text}</p>
          </div>
          <span className="shrink-0 font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
            {formatLocalDateTime(event.at)}
          </span>
        </li>
      ))}
    </ul>
  );
}
