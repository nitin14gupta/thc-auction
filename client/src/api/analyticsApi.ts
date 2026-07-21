import type { apiRequest } from "@/api/apiService";
import type { Overview, SellerAnalytics } from "@/types/analytics";

type AuthFetch = <T>(path: string, options?: Omit<Parameters<typeof apiRequest>[1], "accessToken">) => Promise<T>;

export function getOverview(authFetch: AuthFetch) {
  return authFetch<Overview>("/analytics/overview");
}

export function getSellerAnalytics(authFetch: AuthFetch) {
  return authFetch<SellerAnalytics>("/analytics/seller");
}
