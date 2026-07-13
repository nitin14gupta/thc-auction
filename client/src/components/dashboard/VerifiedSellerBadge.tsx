"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

export function VerifiedSellerBadge() {
  const { user } = useAuth();

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-tan px-3 py-1 font-[family-name:var(--font-barlow)] text-[11px] font-semibold uppercase tracking-wide text-ink-on-sand">
        <CheckIcon className="h-3 w-3" />
        Verified seller
      </span>

      <div className="mt-3 flex items-center gap-2.5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
          {user?.avatar_url ? (
            <Image src={user.avatar_url} alt={user.name} fill className="object-cover" sizes="36px" unoptimized />
          ) : (
            <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-bold uppercase text-tan">
              {user?.name?.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <p className="font-[family-name:var(--font-barlow-condensed)] text-sm font-bold uppercase text-paper">
            {user?.name ?? "HYPE Store"}
          </p>
          <div className="flex items-center gap-1 text-gold">
            <StarIcon className="h-3.5 w-3.5" />
            <span className="font-[family-name:var(--font-barlow)] text-xs text-gray-on-dark">4.8</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12.5 10 17l9-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.6-5.8-3.1-5.8 3.1 1.1-6.6-4.8-4.6 6.6-.9 2.9-6Z" />
    </svg>
  );
}
