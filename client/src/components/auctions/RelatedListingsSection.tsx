"use client";

import { useEffect, useState } from "react";
import { getRelatedListings } from "@/api/listingApi";
import { useAuth } from "@/hooks/useAuth";
import { AuctionListingCard } from "@/components/auctions/AuctionListingCard";
import type { AuctionScope, BrowseListing } from "@/types/listing";

function toScope(status: BrowseListing["auction_status"]): AuctionScope | null {
  if (status === "live") return "live";
  if (status === "scheduled") return "upcoming";
  return null;
}

export function RelatedListingsSection({ listingId }: { listingId: string }) {
  const { authFetch } = useAuth();
  const [items, setItems] = useState<BrowseListing[]>([]);

  useEffect(() => {
    let cancelled = false;
    getRelatedListings(authFetch, listingId)
      .then((data) => !cancelled && setItems(data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [authFetch, listingId]);

  if (items.length === 0) return null;

  return (
    <div className="mt-14">
      <h2 className="mb-4 font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase tracking-tight text-ink-on-sand">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
        {items.map((item) => {
          const scope = toScope(item.auction_status);
          if (!scope) return null;
          return <AuctionListingCard key={item.id} listing={item} scope={scope} />;
        })}
      </div>
    </div>
  );
}
