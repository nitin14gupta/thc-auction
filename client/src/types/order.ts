export type OrderStatus = "pending_payment" | "paid" | "expired" | "cancelled";

export type OrderProductSummary = {
  id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
};

export type Order = {
  id: string;
  listing_id: string;
  buyer_id: string;
  amount: number;
  status: OrderStatus;
  payment_deadline: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  paid_at: string | null;
  product: OrderProductSummary | null;
};

export type OrdersPage = {
  items: Order[];
  total: number;
  page: number;
  page_size: number;
};

export type RazorpayOrder = {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
};
