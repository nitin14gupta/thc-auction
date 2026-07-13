import type { apiRequest } from "@/api/apiService";
import type { Product, ProductSearchResult } from "@/types/product";

type AuthFetch = <T>(path: string, options?: Omit<Parameters<typeof apiRequest>[1], "accessToken">) => Promise<T>;

export function searchProducts(authFetch: AuthFetch, query: string, limit = 20, category?: string) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (category) params.set("category", category);
  return authFetch<ProductSearchResult[]>(`/products/search?${params.toString()}`);
}

export function getFeaturedProducts(authFetch: AuthFetch, limit = 8, category?: string) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (category) params.set("category", category);
  return authFetch<ProductSearchResult[]>(`/products/featured?${params.toString()}`);
}

export function getProduct(authFetch: AuthFetch, productId: string) {
  return authFetch<Product>(`/products/${productId}`);
}
