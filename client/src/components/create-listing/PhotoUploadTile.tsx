"use client";

import { useRef, useState } from "react";

const MAX_FILE_BYTES = 8 * 1024 * 1024;

export function PhotoUploadTile({
  disabled,
  onFilesSelected,
}: {
  disabled?: boolean;
  onFilesSelected: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const valid = Array.from(fileList).filter((f) => f.size <= MAX_FILE_BYTES);
    if (valid.length > 0) onFilesSelected(valid);
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-center transition-colors ${
        isDragging ? "border-gold bg-gold/10" : "border-ink-on-sand/25 bg-white/30"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <UploadIcon className="h-5 w-5 text-muted-on-sand" />
      <span className="font-[family-name:var(--font-barlow)] text-xs font-medium text-ink-on-sand">
        Upload Photos
      </span>
      <span className="font-[family-name:var(--font-barlow)] text-[10px] text-muted-on-sand">
        or drag &amp; drop
      </span>
      <span className="font-[family-name:var(--font-barlow)] text-[10px] text-muted-on-sand">JPG, PNG up to 8MB</span>
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 16V4M12 4 7 9M12 4l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
