"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { navLinks } from "@/constants/site";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-8 lg:px-10">
        <div className="flex h-[72px] items-center">
          <Link
            href="/"
            className="shrink-0 font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold tracking-tight text-paper"
          >
            HYPE.
          </Link>

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

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 md:flex md:max-w-xs lg:max-w-sm">
              <div className="flex h-10 w-full items-center gap-2 rounded-[85px] border border-[#aaaaaa]/30 px-3">
                <SearchIcon className="h-4 w-4 shrink-0 text-gray-on-dark" />
                <input
                  type="text"
                  placeholder="Search auctions, items..."
                  className="w-full bg-transparent font-[family-name:var(--font-barlow)] text-sm text-[#f9f0e9] placeholder:text-gray-on-dark focus:outline-none"
                />
              </div>
            </div>

            <a
              href="/sell-with-us"
              className="hidden sm:inline-flex h-9 px-5 items-center justify-center gap-2 rounded-[85px] bg-[#f9f0e9] text-[#000000] text-sm font-semibold uppercase tracking-wide transition-colors duration-200 hover:bg-[#f9f0e9]/80"
            >
              Sell With Us
            </a>

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
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center text-paper lg:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
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
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
