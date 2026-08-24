"use client";

import { useState } from "react";
import { toggleWatch } from "@/api/listingApi";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

export function WatchToggleButton({
  listingId,
  isWatching,
  watchCount,
  onToggled,
}: {
  listingId: string;
  isWatching: boolean;
  watchCount: number;
  onToggled: () => void;
}) {
  const { authFetch } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  async function handleClick() {
    setIsSaving(true);
    try {
      await toggleWatch(authFetch, listingId);
      toast(isWatching ? "Removed from watchlist." : "Added to watchlist.", "success");
      onToggled();
    } catch {
      toast("Couldn't update your watchlist. Try again.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSaving}
      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase transition-colors disabled:opacity-50 ${
        isWatching ? "border-gold bg-gold/10 text-gold" : "border-ink-on-sand/20 text-muted-on-sand hover:text-ink-on-sand"
      }`}
    >
      <BookmarkIcon className="h-3.5 w-3.5" filled={isWatching} />
      {isWatching ? "Watching" : "Watch"}
      {watchCount > 0 && <span className="text-[10px] text-muted-on-sand">({watchCount})</span>}
    </button>
  );
}

function BookmarkIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className={className} aria-hidden="true">
      <path d="M6 4h12v16l-6-4-6 4V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
