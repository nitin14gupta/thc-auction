import Image from "next/image";
import Link from "next/link";
import type { ActiveListingPreview } from "@/types/analytics";

export function ActiveListingsPreviewGrid({ listings }: { listings: ActiveListingPreview[] }) {
  if (listings.length === 0) {
    return (
      <p className="font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
        No active listings right now.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/dashboard/my-listings/${listing.id}`}
          className="overflow-hidden rounded-lg border border-ink-on-sand/10 bg-white/40"
        >
          <div className="relative aspect-square w-full bg-sand">
            {listing.image_url && (
              <Image src={listing.image_url} alt={listing.name} fill className="object-cover" sizes="140px" unoptimized />
            )}
            <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 font-[family-name:var(--font-barlow)] text-[9px] font-semibold uppercase text-paper">
              Live
            </span>
          </div>
          <div className="p-2.5">
            <p className="truncate font-[family-name:var(--font-barlow)] text-xs font-medium text-ink-on-sand">
              {listing.name}
            </p>
            {listing.price != null && (
              <p className="mt-0.5 font-[family-name:var(--font-barlow-condensed)] text-sm font-bold text-ink-on-sand">
                ₹{listing.price.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
