"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navLinks } from "@/constants/site";
import { useAuth } from "@/hooks/useAuth";

// Two things made the old mobile menu feel "hung":
//   1. It called lenis.stop()/start() — Lenis keeps its touch listeners
//      attached even when stopped, so touch input got captured and dropped
//      instead of doing anything, which reads as a frozen page.
//   2. Its panel used backdrop-blur-md across almost the full viewport
//      height. backdrop-filter is notoriously expensive to repaint on
//      mid/low-range Android GPUs — over a large area it drops frames badly
//      enough to feel like a hang, especially while scrolling the panel.
// This version never touches Lenis, and the mobile overlay is a solid color
// (no blur) rendered only while open — nothing expensive sits in the DOM
// when the menu is closed.

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useScrollLock(isMenuOpen);

  useEffect(() => {
    if (!isMenuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  // Slightly darkens/solidifies the header once the page has scrolled, so
  // it stays legible over any hero content without looking like a hard cut.
  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function runSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/live?q=${encodeURIComponent(trimmed)}` : "/live");
    setIsMenuOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 ${
        isScrolled ? "bg-ink/90" : "bg-gradient-to-b from-ink/70 via-ink/40 to-transparent"
      }`}
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="flex h-16 items-center sm:h-[72px]">
          <Link
            href="/"
            className="shrink-0 font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold tracking-tight text-paper transition-opacity hover:opacity-80"
          >
            HYPE.
          </Link>

          <DesktopNav pathname={pathname} />

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <form onSubmit={runSearch} className="hidden items-center gap-2 lg:flex lg:max-w-sm xl:max-w-md">
              <div className="flex h-10 w-full items-center gap-2 rounded-[85px] border border-[#aaaaaa]/30 px-3 transition-colors focus-within:border-[#aaaaaa]/60">
                <button
                  type="submit"
                  aria-label="Search"
                  className="flex shrink-0 items-center justify-center text-gray-on-dark transition-colors hover:text-paper"
                >
                  <SearchIcon className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search auctions, items..."
                  className="w-full bg-transparent font-[family-name:var(--font-barlow)] text-sm text-[#f9f0e9] placeholder:text-gray-on-dark focus:outline-none"
                />
              </div>
            </form>

            <Link
              href="/sell-with-us"
              className="hidden h-9 items-center justify-center gap-2 rounded-[85px] bg-[#f9f0e9] px-5 text-sm font-semibold uppercase tracking-wide text-[#000000] transition-all duration-200 hover:scale-[1.03] hover:bg-[#f9f0e9]/80 lg:inline-flex"
            >
              Sell With Us
            </Link>

            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              aria-label={isAuthenticated ? "Go to dashboard" : "Sign in"}
              className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#f9f0e9] bg-[#f9f0e9] text-[#000000] transition-transform duration-200 hover:scale-105"
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

      {/* Portaled to <body>: the header's backdrop-blur makes it a containing
          block for `position: fixed` descendants (a CSS filter/backdrop-filter
          side effect), so a fixed full-screen menu nested inside it would be
          sized against the header's own box instead of the viewport. */}
      {isMenuOpen &&
        isMounted &&
        createPortal(
          <MobileMenu pathname={pathname} query={query} setQuery={setQuery} onSearch={runSearch} onClose={() => setIsMenuOpen(false)} />,
          document.body
        )}
    </header>
  );
}

// Locks background scroll for the duration the mobile menu is open, the
// iOS-safe way: plain `overflow: hidden` alone does NOT reliably stop touch
// scroll in Safari on iOS. Pinning the body with `position: fixed` at its
// current scroll offset does, and restoring scrollTo on close puts the page
// back exactly where it was.
function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
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
            className={`group relative py-1 font-[family-name:var(--font-barlow)] text-sm font-medium uppercase tracking-wide transition-colors ${
              isActive ? "text-paper" : "text-gray-on-dark hover:text-paper"
            }`}
          >
            {link.label}
            <span
              className={`absolute -bottom-1 left-0 h-[2px] w-full origin-left bg-tan transition-transform duration-200 ease-out ${
                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}

// Full-screen solid overlay, only mounted while open — nothing sits in the
// DOM (or repaints on scroll) when the menu is closed.
function MobileMenu({
  pathname,
  query,
  setQuery,
  onSearch,
  onClose,
}: {
  pathname: string;
  query: string;
  setQuery: (value: string) => void;
  onSearch: (e: FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div
      id="mobile-nav-menu"
      role="dialog"
      aria-modal="true"
      className="animate-menu-in fixed inset-0 z-[100] flex flex-col bg-ink lg:hidden"
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:h-[72px] sm:px-6">
        <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold tracking-tight text-paper">
          HYPE.
        </span>
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center text-paper"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 sm:px-6">
        <form onSubmit={onSearch} className="mb-5 flex items-center gap-2 rounded-[85px] border border-[#aaaaaa]/30 px-3">
          <button type="submit" aria-label="Search" className="flex shrink-0 items-center justify-center text-gray-on-dark">
            <SearchIcon className="h-4 w-4" />
          </button>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search auctions, items..."
            className="h-11 w-full bg-transparent font-[family-name:var(--font-barlow)] text-sm text-[#f9f0e9] placeholder:text-gray-on-dark focus:outline-none"
          />
        </form>

        <nav className="flex flex-col gap-1">
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                style={{ animationDelay: `${i * 30}ms` }}
                className={`animate-menu-item-in rounded-md px-3 py-3 font-[family-name:var(--font-barlow)] text-base font-medium uppercase tracking-wide transition-colors ${
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
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[85px] bg-[#f9f0e9] text-sm font-semibold uppercase tracking-wide text-[#000000] transition-colors duration-200 hover:bg-[#f9f0e9]/80"
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
