"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

export function VerifiedSellerBadge() {
  const { user } = useAuth();

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      {user?.is_verified && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-tan px-3 py-1 font-[family-name:var(--font-barlow)] text-[11px] font-semibold uppercase tracking-wide text-ink-on-sand">
          <CheckIcon className="h-3 w-3" />
          Verified seller
        </span>
      )}

      <div className={`flex items-center gap-2.5 ${user?.is_verified ? "mt-3" : ""}`}>
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
