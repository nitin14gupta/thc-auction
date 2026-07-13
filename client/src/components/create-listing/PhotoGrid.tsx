"use client";

import { useRef } from "react";
import { PhotoUploadTile } from "@/components/create-listing/PhotoUploadTile";
import { PhotoThumbnail } from "@/components/create-listing/PhotoThumbnail";
import type { ListingPhoto } from "@/types/listing";

const MAX_PHOTOS = 12;

export function PhotoGrid({
  photos,
  isUploading,
  onUpload,
  onRemove,
  onReorder,
}: {
  photos: ListingPhoto[];
  isUploading: boolean;
  onUpload: (files: File[]) => void;
  onRemove: (photoId: string) => void;
  onReorder: (photoIds: string[]) => void;
}) {
  const dragIndexRef = useRef<number | null>(null);

  function handleDrop(targetIndex: number) {
    const sourceIndex = dragIndexRef.current;
    dragIndexRef.current = null;
    if (sourceIndex === null || sourceIndex === targetIndex) return;

    const reordered = [...photos];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    onReorder(reordered.map((p) => p.id));
  }

  const canUploadMore = photos.length < MAX_PHOTOS;

  return (
    <div>
      <p className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand">Photos</p>
      <p className="mt-0.5 font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
        Minimum 3 photos required (Max {MAX_PHOTOS})
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {canUploadMore && <PhotoUploadTile disabled={isUploading} onFilesSelected={onUpload} />}

        {photos.map((photo, index) => (
          <PhotoThumbnail
            key={photo.id}
            photo={photo}
            index={index}
            isCover={index === 0}
            onRemove={() => onRemove(photo.id)}
            onDragStart={() => {
              dragIndexRef.current = index;
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
          />
        ))}
      </div>

      <p className="mt-2 font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
        Drag to reorder · First photo will be the cover image
      </p>
    </div>
  );
}
