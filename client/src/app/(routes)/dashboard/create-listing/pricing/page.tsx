"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepCard } from "@/components/create-listing/StepCard";
import { StepCardSkeleton } from "@/components/create-listing/StepCardSkeleton";
import { BidPriceOption } from "@/components/create-listing/BidPriceOption";
import { WizardFooterActions } from "@/components/create-listing/WizardFooterActions";
import { useListingWizard } from "@/hooks/useListingWizard";

export default function PricingStepPage() {
  const router = useRouter();
  const { state, persistStep, setFields } = useListingWizard();

  useEffect(() => {
    if (!state.isHydrating && !state.listingId) {
      router.replace("/dashboard/create-listing/product");
    }
  }, [state.isHydrating, state.listingId, router]);

  if (state.isHydrating || !state.listingId) return <StepCardSkeleton />;

  async function handleSaveDraft() {
    await persistStep({ bid_price: state.bidPrice ?? undefined });
    router.push("/dashboard/my-listings");
  }

  async function handleNext() {
    await persistStep({ bid_price: state.bidPrice ?? undefined, current_step: 6 });
    router.push("/dashboard/create-listing/review");
  }

  return (
    <div>
      <StepCard stepNumber={5} title="Pricing">
        {state.basePrice != null && (
          <p className="-mt-2 mb-4 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
            Catalog price:{" "}
            <span className="font-semibold text-ink-on-sand">₹{state.basePrice.toLocaleString("en-IN")}</span>
          </p>
        )}

        <p className="mb-2 font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand">
          Choose your bid price
        </p>
        <p className="mb-4 font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
          Bid prices are set 30–40% below the catalog price to attract fast offers.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {state.suggestedBidPrices.map((suggestion) => (
            <BidPriceOption
              key={suggestion.label}
              suggestion={suggestion}
              isSelected={state.bidPrice === suggestion.price}
              onSelect={() => setFields({ bidPrice: suggestion.price })}
            />
          ))}
        </div>
      </StepCard>

      <WizardFooterActions
        onSaveDraft={handleSaveDraft}
        onNext={handleNext}
        nextLabel="Review"
        isSaving={state.isSaving}
        nextDisabled={!state.bidPrice}
      />
    </div>
  );
}
