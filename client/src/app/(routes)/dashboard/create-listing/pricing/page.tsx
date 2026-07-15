"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepCard } from "@/components/create-listing/StepCard";
import { StepCardSkeleton } from "@/components/create-listing/StepCardSkeleton";
import { BidPriceOption } from "@/components/create-listing/BidPriceOption";
import { WizardFooterActions } from "@/components/create-listing/WizardFooterActions";
import { useListingWizard } from "@/hooks/useListingWizard";
import { useToast } from "@/hooks/useToast";
import { isoToLocalInputValue, localInputValueToIso } from "@/utils/dateUtils";

export default function PricingStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { state, persistStep, setFields } = useListingWizard();

  useEffect(() => {
    if (!state.isHydrating && !state.listingId) {
      router.replace("/dashboard/create-listing/product");
    }
  }, [state.isHydrating, state.listingId, router]);

  if (state.isHydrating || !state.listingId) return <StepCardSkeleton />;

  async function handleSaveDraft() {
    try {
      await persistStep({
        bid_price: state.bidPrice ?? undefined,
        auction_start_at: state.auctionStartAt ?? undefined,
      });
      toast("Saved as draft.", "success");
      router.push("/dashboard/my-listings");
    } catch {
      toast("Couldn't save your changes. Try again.", "error");
    }
  }

  async function handleNext() {
    try {
      await persistStep({
        bid_price: state.bidPrice ?? undefined,
        auction_start_at: state.auctionStartAt ?? undefined,
        current_step: 6,
      });
      router.push("/dashboard/create-listing/review");
    } catch {
      toast("Couldn't save your changes. Try again.", "error");
    }
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

        <div className="mt-6 border-t border-ink-on-sand/10 pt-5">
          <p className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand">
            Auction start time
          </p>
          <p className="mb-2 font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
            Pick a date and time in your local time zone — bidders will see it converted to theirs.
          </p>
          <input
            type="datetime-local"
            value={isoToLocalInputValue(state.auctionStartAt)}
            onChange={(e) => setFields({ auctionStartAt: localInputValueToIso(e.target.value) })}
            className="h-10 rounded-md border border-ink-on-sand/20 bg-white/60 px-3 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand focus:outline-none"
          />
        </div>
      </StepCard>

      <WizardFooterActions
        onSaveDraft={handleSaveDraft}
        onNext={handleNext}
        nextLabel="Review"
        isSaving={state.isSaving}
        nextDisabled={!state.bidPrice || !state.auctionStartAt}
      />
    </div>
  );
}
