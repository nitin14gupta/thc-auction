import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { navLinks } from "@/constants/site";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink">
      <Container className="flex h-[72px] items-center justify-between gap-6">
        <Link
          href="/"
          className="shrink-0 font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold tracking-tight text-paper"
        >
          HYPE.
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link, index) => (
            <Link
              key={link.label}
              href={link.href}
              className={`relative font-[family-name:var(--font-barlow)] text-sm font-medium uppercase tracking-wide transition-colors ${
                index === 0 ? "text-paper" : "text-gray-on-dark hover:text-paper"
              }`}
            >
              {link.label}
              {index === 0 && (
                <span className="absolute -bottom-2 left-0 h-[2px] w-full bg-tan" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 items-center md:flex md:max-w-xs lg:max-w-sm">
          <div className="flex h-10 w-full items-center gap-2 rounded-md border border-white/15 px-3">
            <SearchIcon className="h-4 w-4 shrink-0 text-gray-on-dark" />
            <input
              type="text"
              placeholder="Search auctions, items..."
              className="w-full bg-transparent font-[family-name:var(--font-barlow)] text-sm text-paper placeholder:text-gray-on-dark focus:outline-none"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-5">
          <Link
            href="/login"
            className="hidden font-[family-name:var(--font-barlow)] text-sm font-medium uppercase tracking-wide text-paper sm:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center justify-center rounded-md bg-tan px-5 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-wide text-ink-on-sand transition-colors hover:bg-tan/80"
          >
            Register
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center text-paper lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </Container>
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
