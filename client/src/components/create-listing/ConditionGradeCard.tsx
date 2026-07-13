import type { ConditionGradeConfig } from "@/constants/conditionGrades";

export function ConditionGradeCard({
  grade,
  isSelected,
  onSelect,
}: {
  grade: ConditionGradeConfig;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col gap-1 rounded-lg border p-4 text-left transition-colors ${
        isSelected ? "border-ink-on-sand bg-ink-on-sand text-paper" : "border-ink-on-sand/15 bg-white/50 text-ink-on-sand hover:border-ink-on-sand/40"
      }`}
    >
      {isSelected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-paper text-ink-on-sand">
          <CheckIcon className="h-3 w-3" />
        </span>
      )}
      <span className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold">{grade.label}</span>
      <span
        className={`font-[family-name:var(--font-barlow)] text-xs leading-snug ${
          isSelected ? "text-paper/80" : "text-muted-on-sand"
        }`}
      >
        {grade.description}
      </span>
    </button>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12.5 10 17l9-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
