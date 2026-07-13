"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { StepCard } from "@/components/create-listing/StepCard";
import { StepCardSkeleton } from "@/components/create-listing/StepCardSkeleton";
import { WhyItMattersCallout } from "@/components/create-listing/WhyItMattersCallout";
import { WizardFooterActions } from "@/components/create-listing/WizardFooterActions";
import { useListingWizard } from "@/hooks/useListingWizard";
import { guessColorwayFromName } from "@/utils/productHeuristics";
import type { Product } from "@/types/product";

export default function DetailsStepPage() {
  const router = useRouter();
  const { state, persistStep, setFields } = useListingWizard();
  const didPrefill = useRef(false);

  useEffect(() => {
    if (!state.isHydrating && !state.listingId) {
      router.replace("/dashboard/create-listing/product");
    }
  }, [state.isHydrating, state.listingId, router]);

  const product = state.product as Product | null;

  useEffect(() => {
    if (didPrefill.current || !product) return;
    didPrefill.current = true;
    const fields: Partial<typeof state> = {};
    if (!state.colorway) fields.colorway = guessColorwayFromName(product.name);
    if (!state.styleSku && product.sku) fields.styleSku = product.sku;
    if (Object.keys(fields).length > 0) setFields(fields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (state.isHydrating || !state.listingId) return <StepCardSkeleton />;

  const sizeOptions = Array.from(
    new Set((product?.variants ?? []).map((v) => v.size).filter((s): s is string => Boolean(s)))
  );
  const requiresSize = sizeOptions.length > 0;
  const canProceed = !requiresSize || Boolean(state.variantSize);

  async function handleSaveDraft() {
    await persistStep({
      variant_size: state.variantSize || undefined,
      colorway: state.colorway || undefined,
      year_of_release: state.yearOfRelease || undefined,
      style_sku: state.styleSku || undefined,
    });
    router.push("/dashboard/my-listings");
  }

  async function handleNext() {
    await persistStep({
      variant_size: state.variantSize || undefined,
      colorway: state.colorway || undefined,
      year_of_release: state.yearOfRelease || undefined,
      style_sku: state.styleSku || undefined,
      current_step: 3,
    });
    router.push("/dashboard/create-listing/condition");
  }

  return (
    <div>
      <div className="flex items-start gap-6">
        <StepCard stepNumber={2} title="Select Product Details">
          <p className="-mt-2 mb-4 font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
            Choose the option that best matches your item.
          </p>

          <div className="flex flex-col gap-4">
            {requiresSize && (
              <Field label="Size" description="Select the size of your item" required>
                <select
                  value={state.variantSize}
                  onChange={(e) => setFields({ variantSize: e.target.value })}
                  className="h-10 w-full rounded-md border border-ink-on-sand/20 bg-white/60 px-3 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand focus:outline-none"
                >
                  <option value="">Select a size</option>
                  {sizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Colorway" description="Enter the color or colorway of your item">
              <input
                type="text"
                value={state.colorway}
                onChange={(e) => setFields({ colorway: e.target.value })}
                placeholder="e.g. University Blue"
                className="h-10 w-full rounded-md border border-ink-on-sand/20 bg-white/60 px-3 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand placeholder:text-muted-on-sand focus:outline-none"
              />
            </Field>

            <Field label="Year of Release" description="Enter the year of release">
              <input
                type="text"
                inputMode="numeric"
                value={state.yearOfRelease}
                onChange={(e) => setFields({ yearOfRelease: e.target.value })}
                placeholder="e.g. 2023"
                className="h-10 w-full rounded-md border border-ink-on-sand/20 bg-white/60 px-3 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand placeholder:text-muted-on-sand focus:outline-none"
              />
            </Field>

            <Field label="Style / SKU" description="Enter the style or SKU if available (optional)">
              <input
                type="text"
                value={state.styleSku}
                onChange={(e) => setFields({ styleSku: e.target.value })}
                placeholder="e.g. DZ5485-410"
                className="h-10 w-full rounded-md border border-ink-on-sand/20 bg-white/60 px-3 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand placeholder:text-muted-on-sand focus:outline-none"
              />
            </Field>
          </div>
        </StepCard>

        <WhyItMattersCallout
          title="Why this step"
          body="Providing accurate details helps buyers find your listing and builds trust."
        />
      </div>

      <WizardFooterActions
        onSaveDraft={handleSaveDraft}
        onNext={handleNext}
        isSaving={state.isSaving}
        nextDisabled={!canProceed}
      />
    </div>
  );
}

function Field({
  label,
  description,
  required,
  children,
}: {
  label: string;
  description: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand">
        {label} {required && <span className="text-red-urgent">*</span>}
      </p>
      <p className="mt-0.5 mb-1.5 font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">{description}</p>
      {children}
    </div>
  );
}
