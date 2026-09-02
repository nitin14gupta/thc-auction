"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/constants/site";
import { useAuth } from "@/hooks/useAuth";

// NOTE: deliberately does not touch Lenis (see SmoothScroll provider). Calling
// lenis.stop() while its touch listeners stay attached is what caused the
// mobile menu to freeze the whole page to touch input — the RAF loop that
// would apply scroll position was paused, but Lenis kept intercepting
// touchmove, so nothing responded until the menu was closed again. Locking
// scroll with plain CSS on <html>/<body> avoids that entirely.

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes (link click, back/forward, etc.)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    if (!isMenuOpen) return;
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [isMenuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-ink/70 via-ink/40 to-transparent backdrop-blur-md">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="flex h-16 items-center sm:h-[72px]">
          <Link
            href="/"
            className="shrink-0 font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold tracking-tight text-paper"
          >
            HYPE.
          </Link>

          <DesktopNav pathname={pathname} />

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 lg:flex lg:max-w-sm xl:max-w-md">
              <div className="flex h-10 w-full items-center gap-2 rounded-[85px] border border-[#aaaaaa]/30 px-3">
                <SearchIcon className="h-4 w-4 shrink-0 text-gray-on-dark" />
                <input
                  type="text"
                  placeholder="Search auctions, items..."
                  className="w-full bg-transparent font-[family-name:var(--font-barlow)] text-sm text-[#f9f0e9] placeholder:text-gray-on-dark focus:outline-none"
                />
              </div>
            </div>

            <Link
              href="/sell-with-us"
              className="hidden h-9 items-center justify-center gap-2 rounded-[85px] bg-[#f9f0e9] px-5 text-sm font-semibold uppercase tracking-wide text-[#000000] transition-colors duration-200 hover:bg-[#f9f0e9]/80 lg:inline-flex"
            >
              Sell With Us
            </Link>

            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              aria-label={isAuthenticated ? "Go to dashboard" : "Sign in"}
              className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#f9f0e9] bg-[#f9f0e9] text-[#000000] transition-colors hover:border-[#f9f0e9]"
            >
              {isAuthenticated && user?.avatar_url ? (
                <Image src={user.avatar_url} alt={user.name} fill className="object-cover" sizes="36px" unoptimized />
              ) : isAuthenticated ? (
                <span className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase text-ink">
                  {user?.name?.charAt(0)}
                </span>
              ) : (
                <UserIcon className="h-[18px] w-[18px]" />
              )}
            </Link>

            <button
              type="button"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center text-paper lg:hidden"
            >
              {isMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/40 lg:hidden sm:top-[72px]"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <MobileMenu isOpen={isMenuOpen} pathname={pathname} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
      {navLinks.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.label}
            href={link.href}
            className={`relative font-[family-name:var(--font-barlow)] text-sm font-medium uppercase tracking-wide transition-colors ${
              isActive ? "text-paper" : "text-gray-on-dark hover:text-paper"
            }`}
          >
            {link.label}
            {isActive && <span className="absolute -bottom-2 left-0 h-[2px] w-full bg-tan" />}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileMenu({ isOpen, pathname, onClose }: { isOpen: boolean; pathname: string; onClose: () => void }) {
  return (
    <div
      id="mobile-nav-menu"
      className={`fixed inset-x-0 top-16 z-50 max-h-[calc(100svh-4rem)] origin-top overflow-y-auto border-t border-white/10 bg-ink/95 pb-6 pt-4 backdrop-blur-md transition-all duration-200 sm:top-[72px] sm:max-h-[calc(100svh-72px)] lg:hidden ${
        isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
        <div className="mb-4 flex items-center gap-2 rounded-[85px] border border-[#aaaaaa]/30 px-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-gray-on-dark" />
          <input
            type="text"
            placeholder="Search auctions, items..."
            className="h-10 w-full bg-transparent font-[family-name:var(--font-barlow)] text-sm text-[#f9f0e9] placeholder:text-gray-on-dark focus:outline-none"
          />
        </div>

        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className={`rounded-md px-3 py-2.5 font-[family-name:var(--font-barlow)] text-sm font-medium uppercase tracking-wide transition-colors ${
                  isActive ? "bg-white/5 text-paper" : "text-gray-on-dark hover:bg-white/5 hover:text-paper"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/sell-with-us"
            onClick={onClose}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[85px] bg-[#f9f0e9] text-sm font-semibold uppercase tracking-wide text-[#000000] transition-colors duration-200 hover:bg-[#f9f0e9]/80"
          >
            Sell With Us
          </Link>
        </nav>
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
