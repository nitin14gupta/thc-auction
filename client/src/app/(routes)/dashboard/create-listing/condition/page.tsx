"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepCard } from "@/components/create-listing/StepCard";
import { StepCardSkeleton } from "@/components/create-listing/StepCardSkeleton";
import { ConditionGradeCard } from "@/components/create-listing/ConditionGradeCard";
import { ConditionNotesField } from "@/components/create-listing/ConditionNotesField";
import { WizardFooterActions } from "@/components/create-listing/WizardFooterActions";
import { conditionGrades } from "@/constants/conditionGrades";
import { useListingWizard } from "@/hooks/useListingWizard";
import type { ConditionGrade } from "@/types/listing";

export default function ConditionStepPage() {
  const router = useRouter();
  const { state, persistStep, setFields } = useListingWizard();

  useEffect(() => {
    if (!state.isHydrating && !state.listingId) {
      router.replace("/dashboard/create-listing/product");
    }
  }, [state.isHydrating, state.listingId, router]);

  if (state.isHydrating || !state.listingId) return <StepCardSkeleton />;

  async function handleSaveDraft() {
    await persistStep({
      condition_grade: state.conditionGrade ?? undefined,
      condition_notes: state.conditionNotes || undefined,
    });
    router.push("/dashboard/my-listings");
  }

  async function handleNext() {
    await persistStep({
      condition_grade: state.conditionGrade ?? undefined,
      condition_notes: state.conditionNotes || undefined,
      current_step: 4,
    });
    router.push("/dashboard/create-listing/photos");
  }

  return (
    <div>
      <StepCard stepNumber={3} title="Condition">
        <p className="-mt-2 mb-4 font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
          Describe the condition of your item.
        </p>

        <p className="mb-2 font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand">
          Condition Grade
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {conditionGrades.map((grade) => (
            <ConditionGradeCard
              key={grade.code}
              grade={grade}
              isSelected={state.conditionGrade === grade.code}
              onSelect={() => setFields({ conditionGrade: grade.code as ConditionGrade })}
            />
          ))}
        </div>

        <div className="mt-6">
          <ConditionNotesField
            value={state.conditionNotes}
            onChange={(value) => setFields({ conditionNotes: value })}
          />
        </div>
      </StepCard>

      <WizardFooterActions
        onSaveDraft={handleSaveDraft}
        onNext={handleNext}
        isSaving={state.isSaving}
        nextDisabled={!state.conditionGrade}
      />
    </div>
  );
}
