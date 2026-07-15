"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { deleteListing, getListing, updateListing } from "@/api/listingApi";
import { getProduct } from "@/api/productApi";
import { ListingDetailSkeleton } from "@/components/dashboard/ListingDetailSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { formatLocalDateTime } from "@/utils/dateUtils";
import type { Listing, ListingStatus } from "@/types/listing";
import type { Product } from "@/types/product";

const STATUS_LABELS: Record<ListingStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { authFetch } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [bidPriceInput, setBidPriceInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getListing(authFetch, params.id);
        if (cancelled) return;
        setListing(data);
        setBidPriceInput(data.bid_price != null ? String(data.bid_price) : "");
        if (data.product_id) {
          const p = await getProduct(authFetch, data.product_id);
          if (!cancelled) setProduct(p);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [authFetch, params.id]);

  async function handleSaveBidPrice() {
    const value = Number(bidPriceInput);
    if (!value || value <= 0) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await updateListing(authFetch, params.id, { bid_price: value });
      setListing(updated);
      setMessage("Saved.");
      toast("Bid price updated.", "success");
    } catch {
      setMessage("Couldn't save. Try again.");
      toast("Couldn't save. Try again.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!listing) return;
    if (!window.confirm("Delete this listing? This can't be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteListing(authFetch, listing.id);
      toast("Listing deleted.", "success");
      router.push("/dashboard/my-listings");
    } catch {
      toast("Couldn't delete this listing. Try again.", "error");
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div>
        <Link
          href="/dashboard/my-listings"
          className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand hover:underline"
        >
          ‹ Back to My Listings
        </Link>
        <ListingDetailSkeleton />
      </div>
    );
  }

  if (!listing) {
    return <p className="font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">Listing not found.</p>;
  }

  return (
    <div>
      <Link
        href="/dashboard/my-listings"
        className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand hover:underline"
      >
        ‹ Back to My Listings
      </Link>

      <div className="mt-4 rounded-xl border border-ink-on-sand/10 bg-white/50 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold text-ink-on-sand">
            {product?.name ?? "Listing"}
          </h1>
          <span className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-wide text-gold">
            {STATUS_LABELS[listing.status]}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 font-[family-name:var(--font-barlow)] text-sm sm:grid-cols-3">
          <Detail label="Brand" value={product?.brand} />
          <Detail label="Size" value={listing.variant_size} />
          <Detail label="Colorway" value={listing.colorway} />
          <Detail label="Year of Release" value={listing.year_of_release} />
          <Detail label="Style / SKU" value={listing.style_sku} />
          <Detail label="Condition" value={listing.condition_grade} />
          <Detail label="Photos" value={`${listing.photos.length} uploaded`} />
          <Detail label="Auction Start" value={formatLocalDateTime(listing.auction_start_at)} />
        </div>

        {listing.condition_notes && (
          <p className="mt-4 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
            {listing.condition_notes}
          </p>
        )}

        {listing.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {listing.photos.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={photo.url}
                alt=""
                className="aspect-square w-full rounded-md object-cover"
              />
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-ink-on-sand/10 pt-5">
          <p className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand">Bid Price</p>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={bidPriceInput}
              onChange={(e) => setBidPriceInput(e.target.value)}
              className="h-10 w-40 rounded-md border border-ink-on-sand/20 bg-white/60 px-3 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveBidPrice}
              disabled={isSaving}
              className="rounded-md bg-ink-on-sand px-4 py-2 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase text-paper disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            {message && <span className="font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">{message}</span>}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {listing.status === "draft" && (
            <button
              type="button"
              onClick={() => router.push(`/dashboard/create-listing/product?listingId=${listing.id}`)}
              className="rounded-md border border-ink-on-sand/30 px-4 py-2 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase text-ink-on-sand hover:bg-ink-on-sand/5"
            >
              Continue editing in wizard
            </button>
          )}

          {listing.status !== "accepted" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-md border border-red-urgent/30 px-4 py-2 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase text-red-urgent hover:bg-red-urgent/10 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete listing"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-widest text-muted-on-sand">
        {label}
      </p>
      <p className="mt-0.5 text-ink-on-sand">{value || "—"}</p>
    </div>
  );
}
