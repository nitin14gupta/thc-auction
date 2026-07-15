"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteListing, listMyListings } from "@/api/listingApi";
import { ListingRowSkeleton } from "@/components/dashboard/ListingRowSkeleton";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import type { Listing, ListingStatus } from "@/types/listing";

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<ListingStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default function MyListingsPage() {
  const { authFetch } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await listMyListings(authFetch, undefined, page, PAGE_SIZE);
        if (!cancelled) {
          setListings(data.items);
          setTotal(data.total);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authFetch, page]);

  async function handleDelete(listing: Listing) {
    if (!window.confirm("Delete this listing? This can't be undone.")) return;
    setDeletingId(listing.id);
    try {
      await deleteListing(authFetch, listing.id);
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
      setTotal((prev) => Math.max(0, prev - 1));
      toast("Listing deleted.", "success");
    } catch {
      toast("Couldn't delete this listing. Try again.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-ink-on-sand">
          My Listings
        </h1>
        <Link
          href="/dashboard/create-listing"
          className="rounded-md bg-ink-on-sand px-4 py-2 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase text-paper"
        >
          + New Listing
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ListingRowSkeleton key={i} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <p className="mt-8 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
          You haven&apos;t created any listings yet.
        </p>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex items-center justify-between rounded-lg border border-ink-on-sand/10 bg-white/40 px-5 py-4"
              >
                <div>
                  <p className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand">
                    {listing.style_sku || listing.id}
                  </p>
                  <p className="font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
                    {listing.condition_grade ?? "No condition set"} · Step {listing.current_step}/6 ·{" "}
                    {STATUS_LABELS[listing.status]}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {listing.status === "draft" && (
                    <Link
                      href={`/dashboard/create-listing/product?listingId=${listing.id}`}
                      className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-wide text-gold hover:underline"
                    >
                      Continue draft
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/my-listings/${listing.id}`}
                    className="rounded-md border border-ink-on-sand/30 px-3 py-1.5 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase text-ink-on-sand hover:bg-ink-on-sand/5"
                  >
                    View
                  </Link>
                  <DropdownMenu>
                    {(close) => (
                      <DropdownMenuItem
                        danger
                        disabled={listing.status === "accepted" || deletingId === listing.id}
                        onClick={() => {
                          close();
                          handleDelete(listing);
                        }}
                      >
                        {deletingId === listing.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
