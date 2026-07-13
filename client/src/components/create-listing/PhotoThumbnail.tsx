"use client";

import Image from "next/image";
import type { ListingPhoto } from "@/types/listing";

export function PhotoThumbnail({
  photo,
  index,
  isCover,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  photo: ListingPhoto;
  index: number;
  isCover: boolean;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="group relative aspect-square cursor-grab overflow-hidden rounded-lg border border-ink-on-sand/15 bg-white/40"
    >
      <Image src={photo.url} alt={`Photo ${index + 1}`} fill className="object-cover" sizes="120px" unoptimized />

      <span className="absolute left-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-on-sand/80 px-1 font-[family-name:var(--font-barlow)] text-[10px] font-semibold text-paper">
        {index + 1}
      </span>

      {isCover && (
        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-gold px-2 py-0.5 font-[family-name:var(--font-barlow)] text-[9px] font-semibold uppercase text-ink-on-sand">
          Cover
        </span>
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        <XIcon className="h-3 w-3" />
      </button>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
