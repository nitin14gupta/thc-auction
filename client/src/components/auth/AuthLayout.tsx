import Image from "next/image";
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
      <div className="relative hidden flex-col items-center justify-center gap-4 bg-[#e5dace] lg:flex">
        <Image src="/images/HYPE.svg" alt="HYPE." width={300} height={90} priority />
        <Image src="/images/THE HYPE COMPANY.svg" alt="THE HYPE COMPANY" width={240} height={45} className="-ml-12" />
      </div>

      <div className="flex items-center justify-center bg-ink px-6 py-14 sm:px-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
