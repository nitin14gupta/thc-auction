"use client";

import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ListingWizardProvider } from "@/context/ListingWizardContext";
import { Stepper } from "@/components/create-listing/Stepper";

export default function CreateListingLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ListingWizardProvider>
        <div>
          <Link
            href="/dashboard/my-listings"
            className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand hover:underline"
          >
            ‹ Back
          </Link>

          <h1 className="mt-3 font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-ink-on-sand">
            List Your Next Drop
          </h1>
          <p className="mt-1 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
            Start by searching the product you want to sell.
          </p>

          <div className="mt-6">
            <Stepper />
          </div>

          <div className="mt-6">{children}</div>
        </div>
      </ListingWizardProvider>
    </Suspense>
  );
}
