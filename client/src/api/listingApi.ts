import type { apiRequest } from "@/api/apiService";
import { clearCache } from "@/api/apiCache";
import type {
  AuctionDetail,
  AuctionScope,
  BrowseListing,
  BrowseListingsPage,
  Listing,
  ListingsPage,
  ListingUpdatePatch,
  ListingPhoto,
} from "@/types/listing";

type AuthFetch = <T>(path: string, options?: Omit<Parameters<typeof apiRequest>[1], "accessToken">) => Promise<T>;

// Cache windows for data that isn't required to be second-fresh. Live
// auction data (browseListings scope="live", getAuctionDetail) is
// deliberately excluded below — bidding needs the real current state.
const BROWSE_CACHE_TTL_MS = 60_000;
const RELATED_CACHE_TTL_MS = 60_000;
const WATCHLIST_CACHE_TTL_MS = 30_000;
const MY_LISTINGS_CACHE_TTL_MS = 30_000;
const LISTING_CACHE_TTL_MS = 30_000;

export async function createListing(authFetch: AuthFetch, productId: string) {
  const listing = await authFetch<Listing>("/listings", { method: "POST", body: { product_id: productId } });
  clearCache("/listings/mine");
  return listing;
}

export async function updateListing(authFetch: AuthFetch, listingId: string, patch: ListingUpdatePatch) {
  const listing = await authFetch<Listing>(`/listings/${listingId}`, { method: "PATCH", body: patch });
  clearCache("/listings/mine");
  clearCache(`/listings/${listingId}`);
  return listing;
}

export function getListing(authFetch: AuthFetch, listingId: string) {
  return authFetch<Listing>(`/listings/${listingId}`, { cacheTtlMs: LISTING_CACHE_TTL_MS });
}

export function listMyListings(authFetch: AuthFetch, status?: string, page = 1, pageSize = 10) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (status) params.set("status", status);
  return authFetch<ListingsPage>(`/listings/mine?${params.toString()}`, { cacheTtlMs: MY_LISTINGS_CACHE_TTL_MS });
}

export function uploadListingPhotos(authFetch: AuthFetch, listingId: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return authFetch<ListingPhoto[]>(`/listings/${listingId}/photos`, { method: "POST", body: formData });
}

export function deleteListingPhoto(authFetch: AuthFetch, listingId: string, photoId: string) {
  return authFetch<void>(`/listings/${listingId}/photos/${photoId}`, { method: "DELETE" });
}

export function reorderListingPhotos(authFetch: AuthFetch, listingId: string, photoIds: string[]) {
  return authFetch<ListingPhoto[]>(`/listings/${listingId}/photos/reorder`, {
    method: "PATCH",
    body: { photo_ids: photoIds },
  });
}

export async function submitListing(authFetch: AuthFetch, listingId: string) {
  const listing = await authFetch<Listing>(`/listings/${listingId}/submit`, { method: "POST" });
  clearCache("/listings/mine");
  clearCache(`/listings/${listingId}`);
  return listing;
}

export async function deleteListing(authFetch: AuthFetch, listingId: string) {
  await authFetch<void>(`/listings/${listingId}`, { method: "DELETE" });
  clearCache("/listings/mine");
  clearCache(`/listings/${listingId}`);
}

export function browseListings(
  authFetch: AuthFetch,
  scope: AuctionScope,
  category?: string,
  q?: string,
  page = 1,
  pageSize = 12
) {
  const params = new URLSearchParams({ scope, page: String(page), page_size: String(pageSize) });
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  // Live listings change second to second (new bids, closes) — never cache
  // those. Upcoming/sold are comparatively static, so cache them.
  const cacheTtlMs = scope === "live" ? undefined : BROWSE_CACHE_TTL_MS;
  return authFetch<BrowseListingsPage>(`/listings/browse?${params.toString()}`, { cacheTtlMs });
}

export function getAuctionDetail(authFetch: AuthFetch, listingId: string) {
  // Never cached — this is the live bidding state (current price, bid
  // history) regardless of which scope the listing was browsed from.
  return authFetch<AuctionDetail>(`/listings/${listingId}/auction`);
}

export function placeBid(authFetch: AuthFetch, listingId: string, amount: number) {
  return authFetch<AuctionDetail>(`/listings/${listingId}/bids`, { method: "POST", body: { amount } });
}

export function getRelatedListings(authFetch: AuthFetch, listingId: string, limit = 4) {
  return authFetch<BrowseListing[]>(`/listings/${listingId}/related?limit=${limit}`, { cacheTtlMs: RELATED_CACHE_TTL_MS });
}

export async function toggleWatch(authFetch: AuthFetch, listingId: string) {
  const result = await authFetch<{ is_watching: boolean; watch_count: number }>(`/listings/${listingId}/watch`, {
    method: "POST",
  });
  // The watched flag on browse/watchlist cards is now stale wherever this
  // listing appears — cheaper to drop the whole cache than track every page.
  clearCache("/listings/browse");
  clearCache("/listings/watchlist");
  clearCache(`/listings/${listingId}`);
  return result;
}

export function getWatchlist(authFetch: AuthFetch, page = 1, pageSize = 12) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  return authFetch<BrowseListingsPage>(`/listings/watchlist?${params.toString()}`, { cacheTtlMs: WATCHLIST_CACHE_TTL_MS });
}
