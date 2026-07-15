"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StepCard } from "@/components/create-listing/StepCard";
import { StepCardSkeleton } from "@/components/create-listing/StepCardSkeleton";
import { ReviewSummarySection } from "@/components/create-listing/ReviewSummarySection";
import { submitListing } from "@/api/listingApi";
import { useAuth } from "@/hooks/useAuth";
import { useListingWizard } from "@/hooks/useListingWizard";
import { useToast } from "@/hooks/useToast";
import { formatLocalDateTime } from "@/utils/dateUtils";
import type { Product } from "@/types/product";

export default function ReviewStepPage() {
  const router = useRouter();
  const { authFetch } = useAuth();
  const { toast } = useToast();
  const { state } = useListingWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.isHydrating && !state.listingId) {
      router.replace("/dashboard/create-listing/product");
    }
  }, [state.isHydrating, state.listingId, router]);

  if (state.isHydrating || !state.listingId) return <StepCardSkeleton />;

  const product = state.product as Product | null;

  async function handleSubmit() {
    if (!state.listingId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await submitListing(authFetch, state.listingId);
      toast("Listing submitted for review!", "success");
      router.push("/dashboard/my-listings");
    } catch {
      const message = "Couldn't submit your listing. Make sure every step is complete.";
      setError(message);
      toast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <StepCard stepNumber={6} title="Review">
        <ReviewSummarySection title="Product" editHref="/dashboard/create-listing/product">
          {product?.name ?? "—"} {product?.brand ? `· ${product.brand}` : ""}
        </ReviewSummarySection>

        <ReviewSummarySection title="Details" editHref="/dashboard/create-listing/details">
          Size: {state.variantSize || "—"} · Colorway: {state.colorway || "—"} · Year: {state.yearOfRelease || "—"} ·
          SKU: {state.styleSku || "—"}
        </ReviewSummarySection>

        <ReviewSummarySection title="Condition" editHref="/dashboard/create-listing/condition">
          {state.conditionGrade || "—"} {state.conditionNotes ? `— ${state.conditionNotes}` : ""}
        </ReviewSummarySection>

        <ReviewSummarySection title="Photos" editHref="/dashboard/create-listing/photos">
          {state.photos.length} photo{state.photos.length === 1 ? "" : "s"} uploaded
        </ReviewSummarySection>

        <ReviewSummarySection title="Pricing" editHref="/dashboard/create-listing/pricing">
          {state.bidPrice != null ? `₹${state.bidPrice.toLocaleString("en-IN")}` : "—"} · Starts{" "}
          {formatLocalDateTime(state.auctionStartAt)}
        </ReviewSummarySection>

        {error && <p className="mt-4 font-[family-name:var(--font-barlow)] text-xs text-red-urgent">{error}</p>}
      </StepCard>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-md bg-ink-on-sand px-8 py-3 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-ink-on-sand/90 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Done"}
        </button>
      </div>
    </div>
  );
}
