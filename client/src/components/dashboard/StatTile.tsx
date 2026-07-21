export function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-ink p-4">
      <div className="flex items-center gap-2 text-gray-on-dark">
        {icon}
        <p className="font-[family-name:var(--font-barlow)] text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-2xl font-extrabold text-paper">
        {value}
      </p>
    </div>
  );
}
