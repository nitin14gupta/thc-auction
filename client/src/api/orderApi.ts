import type { apiRequest } from "@/api/apiService";
import type { Order, OrdersPage, RazorpayOrder } from "@/types/order";

type AuthFetch = <T>(path: string, options?: Omit<Parameters<typeof apiRequest>[1], "accessToken">) => Promise<T>;

export function listMyOrders(authFetch: AuthFetch, page = 1, pageSize = 10) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  return authFetch<OrdersPage>(`/orders/mine?${params.toString()}`);
}

export function createRazorpayOrder(authFetch: AuthFetch, orderId: string) {
  return authFetch<RazorpayOrder>(`/orders/${orderId}/razorpay`, { method: "POST" });
}

export function verifyPayment(
  authFetch: AuthFetch,
  orderId: string,
  payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
) {
  return authFetch<Order>(`/orders/${orderId}/verify`, { method: "POST", body: payload });
}
