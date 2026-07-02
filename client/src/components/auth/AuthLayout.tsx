import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sand p-10 lg:flex">
        <Link
          href="/"
          className="relative z-10 font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold tracking-tight text-ink-on-sand"
        >
          HYPE.
        </Link>

        <div className="relative z-10 max-w-sm">
          <p className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-widest text-muted-on-sand">
            {eyebrow}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-4xl font-extrabold uppercase leading-tight text-ink-on-sand">
            {title}
          </h2>
          <p className="mt-3 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand/70">{subtitle}</p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%]">
          <Image
            src="/images/hero-product.png"
            alt=""
            fill
            className="object-contain object-bottom"
            sizes="50vw"
            priority
          />
        </div>
      </div>

      <div className="flex items-center justify-center bg-ink px-6 py-14 sm:px-10">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 block font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold tracking-tight text-paper lg:hidden"
          >
            HYPE.
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
