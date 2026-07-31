import Link from "next/link";
import { footerBrand, footerColumns } from "@/constants/site";

export function Footer() {
  return (
    <footer className="bg-ink px-6 py-14 md:px-10 xl:px-16">
      <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
        <div className="max-w-xs">
          <p className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight text-paper">
            {footerBrand.name}
          </p>
          <p className="mt-3 font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
            {footerBrand.tagline}
          </p>
          <p className="mt-6 font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
            {footerBrand.copyright}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <InstagramIcon className="h-5 w-5 text-paper" />
            <XIcon className="h-4 w-4 text-paper" />
            <YoutubeIcon className="h-5 w-5 text-paper" />
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.heading}>
              <p className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-widest text-gray-on-dark">
                {column.heading}
              </p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="font-[family-name:var(--font-barlow)] text-sm text-paper/90 transition-colors hover:text-tan"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
          <p className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-widest text-gray-on-dark">
            Download The App
          </p>
          <p className="mt-3 font-[family-name:var(--font-barlow)] text-sm text-paper/90">Coming Soon</p>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex h-10 w-36 items-center gap-2 rounded-md border border-white/20 px-3">
              <AppleIcon className="h-4 w-4 text-paper" />
              <span className="font-[family-name:var(--font-barlow)] text-xs text-paper/90">App Store</span>
            </div>
            <div className="flex h-10 w-36 items-center gap-2 rounded-md border border-white/20 px-3">
              <PlayIcon className="h-4 w-4 text-paper" />
              <span className="font-[family-name:var(--font-barlow)] text-xs text-paper/90">Google Play</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4 3h3.5l4.2 5.8L16.8 3H20l-6.7 8.4L20.4 21H16.9l-4.6-6.3L7 21H3.8l7.1-8.9L4 3Z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.5 12.3c0-2 1.6-3 1.7-3.1-.9-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2-1.4 2.5-.4 6.3 1 8.3.7 1 1.5 2.1 2.6 2 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2 .6-.9.9-1.7.9-1.8-.1 0-2.1-.8-2.1-3.1v-.6ZM14.8 6c.6-.7 1-1.7.9-2.6-.8 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.5.9.1 1.9-.5 2.5-1.2Z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M5 3.5v17l14-8.5-14-8.5Z" />
    </svg>
  );
}
