/** Converts a UTC ISO string to a `datetime-local` input value in the browser's local time zone. */
export function isoToLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** `datetime-local` input values have no timezone — browsers parse them as local time,
 * so this just needs to hand it to Date and re-serialize as UTC ISO for storage. */
export function localInputValueToIso(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

/** Renders a stored UTC ISO timestamp in the viewer's local time zone. */
export function formatLocalDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
