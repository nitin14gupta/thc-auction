export type PayoutRowStatus = "paid" | "processing";

export type PayoutHistoryRow = {
  order_id: string;
  listing_id: string;
  product_name: string;
  product_brand: string | null;
  image_url: string | null;
  sale_price: number;
  commission: number;
  commission_rate_pct: number;
  payout_amount: number;
  status: PayoutRowStatus;
  date: string | null;
};

export type SellerPayouts = {
  pending_payout: number;
  pending_count: number;
  history: PayoutHistoryRow[];
};
