import type { apiRequest } from "@/api/apiService";
import type { SellerPayouts } from "@/types/payout";

type AuthFetch = <T>(path: string, options?: Omit<Parameters<typeof apiRequest>[1], "accessToken">) => Promise<T>;

export function getMyPayouts(authFetch: AuthFetch) {
  return authFetch<SellerPayouts>("/payouts/mine");
}

export function markOrderPaidOut(authFetch: AuthFetch, orderId: string) {
  return authFetch<{ id: string }>(`/payouts/orders/${orderId}/mark-paid`, { method: "POST" });
}
