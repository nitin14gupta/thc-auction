export function WizardFooterActions({
  onSaveDraft,
  onNext,
  nextLabel = "Next step",
  isSaving = false,
  nextDisabled = false,
}: {
  onSaveDraft: () => void;
  onNext: () => void;
  nextLabel?: string;
  isSaving?: boolean;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <button
        type="button"
        onClick={onSaveDraft}
        disabled={isSaving}
        className="rounded-md border border-ink-on-sand/30 px-5 py-2.5 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand transition-colors hover:bg-ink-on-sand/5 disabled:opacity-50"
      >
        Save as draft
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={isSaving || nextDisabled}
        className="rounded-md bg-ink-on-sand px-6 py-2.5 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-ink-on-sand/90 disabled:opacity-50"
      >
        {isSaving ? "Saving..." : nextLabel} {!isSaving && "→"}
      </button>
    </div>
  );
}
