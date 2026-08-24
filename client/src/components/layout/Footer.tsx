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
        </div>

        <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.heading}>
              <p className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-widest text-gray-on-dark">
                {column.heading}
              </p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-[family-name:var(--font-barlow)] text-sm text-paper/90 transition-colors hover:text-tan"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
