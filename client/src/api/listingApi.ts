import type { apiRequest } from "@/api/apiService";
import type { Listing, ListingsPage, ListingUpdatePatch, ListingPhoto } from "@/types/listing";

type AuthFetch = <T>(path: string, options?: Omit<Parameters<typeof apiRequest>[1], "accessToken">) => Promise<T>;

export function createListing(authFetch: AuthFetch, productId: string) {
  return authFetch<Listing>("/listings", { method: "POST", body: { product_id: productId } });
}

export function updateListing(authFetch: AuthFetch, listingId: string, patch: ListingUpdatePatch) {
  return authFetch<Listing>(`/listings/${listingId}`, { method: "PATCH", body: patch });
}

export function getListing(authFetch: AuthFetch, listingId: string) {
  return authFetch<Listing>(`/listings/${listingId}`);
}

export function listMyListings(authFetch: AuthFetch, status?: string, page = 1, pageSize = 10) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (status) params.set("status", status);
  return authFetch<ListingsPage>(`/listings/mine?${params.toString()}`);
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

export function submitListing(authFetch: AuthFetch, listingId: string) {
  return authFetch<Listing>(`/listings/${listingId}/submit`, { method: "POST" });
}

export function deleteListing(authFetch: AuthFetch, listingId: string) {
  return authFetch<void>(`/listings/${listingId}`, { method: "DELETE" });
}
