const MAX_LENGTH = 500;

export function ConditionNotesField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand">
        Condition Notes <span className="text-muted-on-sand">(Optional)</span>
      </p>
      <textarea
        value={value}
        maxLength={MAX_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add any details about the condition, flaws, or replacements..."
        rows={4}
        className="mt-2 w-full resize-none rounded-lg border border-ink-on-sand/20 bg-white/50 p-3 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand placeholder:text-muted-on-sand focus:outline-none"
      />
      <p className="mt-1 text-right font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
        {value.length}/{MAX_LENGTH}
      </p>
    </div>
  );
}
