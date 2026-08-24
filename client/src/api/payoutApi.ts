import type { apiRequest } from "@/api/apiService";
import { clearCache } from "@/api/apiCache";
import type { SellerPayouts } from "@/types/payout";

type AuthFetch = <T>(path: string, options?: Omit<Parameters<typeof apiRequest>[1], "accessToken">) => Promise<T>;

export function getMyPayouts(authFetch: AuthFetch) {
  return authFetch<SellerPayouts>("/payouts/mine", { cacheTtlMs: 30_000 });
}

export async function markOrderPaidOut(authFetch: AuthFetch, orderId: string) {
  const result = await authFetch<{ id: string }>(`/payouts/orders/${orderId}/mark-paid`, { method: "POST" });
  clearCache("/payouts/mine");
  return result;
}
