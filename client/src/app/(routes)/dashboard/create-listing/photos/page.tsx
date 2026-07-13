"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StepCard } from "@/components/create-listing/StepCard";
import { StepCardSkeleton } from "@/components/create-listing/StepCardSkeleton";
import { PhotoGrid } from "@/components/create-listing/PhotoGrid";
import { WizardFooterActions } from "@/components/create-listing/WizardFooterActions";
import { deleteListingPhoto, reorderListingPhotos, uploadListingPhotos } from "@/api/listingApi";
import { useAuth } from "@/hooks/useAuth";
import { useListingWizard } from "@/hooks/useListingWizard";

const MIN_PHOTOS = 3;

export default function PhotosStepPage() {
  const router = useRouter();
  const { authFetch } = useAuth();
  const { state, setFields, persistStep } = useListingWizard();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.isHydrating && !state.listingId) {
      router.replace("/dashboard/create-listing/product");
    }
  }, [state.isHydrating, state.listingId, router]);

  if (state.isHydrating || !state.listingId) return <StepCardSkeleton />;

  async function handleUpload(files: File[]) {
    if (!state.listingId) return;
    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await uploadListingPhotos(authFetch, state.listingId, files);
      setFields({ photos: [...state.photos, ...uploaded] });
    } catch {
      setError("Couldn't upload one or more photos. Try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove(photoId: string) {
    if (!state.listingId) return;
    setFields({ photos: state.photos.filter((p) => p.id !== photoId) });
    try {
      await deleteListingPhoto(authFetch, state.listingId, photoId);
    } catch {
      setError("Couldn't remove that photo.");
    }
  }

  async function handleReorder(photoIds: string[]) {
    if (!state.listingId) return;
    const reordered = photoIds
      .map((id, index) => {
        const photo = state.photos.find((p) => p.id === id);
        return photo ? { ...photo, sort_order: index } : null;
      })
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    setFields({ photos: reordered });
    try {
      await reorderListingPhotos(authFetch, state.listingId, photoIds);
    } catch {
      setError("Couldn't save the new photo order.");
    }
  }

  async function handleSaveDraft() {
    await persistStep({});
    router.push("/dashboard/my-listings");
  }

  async function handleNext() {
    await persistStep({ current_step: 5 });
    router.push("/dashboard/create-listing/pricing");
  }

  return (
    <div>
      <StepCard stepNumber={4} title="Photos">
        <PhotoGrid
          photos={state.photos}
          isUploading={isUploading}
          onUpload={handleUpload}
          onRemove={handleRemove}
          onReorder={handleReorder}
        />
        {error && <p className="mt-3 font-[family-name:var(--font-barlow)] text-xs text-red-urgent">{error}</p>}
      </StepCard>

      <WizardFooterActions
        onSaveDraft={handleSaveDraft}
        onNext={handleNext}
        isSaving={state.isSaving || isUploading}
        nextDisabled={state.photos.length < MIN_PHOTOS}
      />
    </div>
  );
}
