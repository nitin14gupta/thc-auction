"use client";

import { useState, type ReactNode } from "react";

export function DropdownMenu({ children }: { children: (close: () => void) => ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="More actions"
        className="flex h-8 w-8 items-center justify-center rounded-md text-ink-on-sand hover:bg-ink-on-sand/10"
      >
        <DotsIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-md border border-ink-on-sand/15 bg-white py-1 shadow-lg">
            {children(() => setIsOpen(false))}
          </div>
        </>
      )}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  danger,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`block w-full px-3 py-2 text-left font-[family-name:var(--font-barlow)] text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
        danger ? "text-red-urgent hover:bg-red-urgent/10" : "text-ink-on-sand hover:bg-sand"
      }`}
    >
      {children}
    </button>
  );
}

function DotsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}
