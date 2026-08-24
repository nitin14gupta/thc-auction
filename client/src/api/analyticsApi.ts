import type { apiRequest } from "@/api/apiService";
import type { Overview, SellerAnalytics } from "@/types/analytics";

type AuthFetch = <T>(path: string, options?: Omit<Parameters<typeof apiRequest>[1], "accessToken">) => Promise<T>;

const ANALYTICS_CACHE_TTL_MS = 30_000;

export function getOverview(authFetch: AuthFetch) {
  return authFetch<Overview>("/analytics/overview", { cacheTtlMs: ANALYTICS_CACHE_TTL_MS });
}

export function getSellerAnalytics(authFetch: AuthFetch) {
  return authFetch<SellerAnalytics>("/analytics/seller", { cacheTtlMs: ANALYTICS_CACHE_TTL_MS });
}
