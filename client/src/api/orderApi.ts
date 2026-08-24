import type { apiRequest } from "@/api/apiService";
import { clearCache } from "@/api/apiCache";
import type { Order, OrdersPage, RazorpayOrder } from "@/types/order";

type AuthFetch = <T>(path: string, options?: Omit<Parameters<typeof apiRequest>[1], "accessToken">) => Promise<T>;

export function listMyOrders(authFetch: AuthFetch, page = 1, pageSize = 10) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  // Short TTL — orders carry a live payment countdown, so this stays fresh
  // enough to matter while still avoiding refetch-on-every-render churn.
  return authFetch<OrdersPage>(`/orders/mine?${params.toString()}`, { cacheTtlMs: 15_000 });
}

export function createRazorpayOrder(authFetch: AuthFetch, orderId: string) {
  return authFetch<RazorpayOrder>(`/orders/${orderId}/razorpay`, { method: "POST" });
}

export async function verifyPayment(
  authFetch: AuthFetch,
  orderId: string,
  payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
) {
  const order = await authFetch<Order>(`/orders/${orderId}/verify`, { method: "POST", body: payload });
  clearCache("/orders/mine");
  return order;
}
