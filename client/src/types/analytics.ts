export type ActivityEvent = {
  type: string;
  text: string;
  at: string;
};

export type ActiveListingPreview = {
  id: string;
  name: string;
  image_url: string | null;
  price: number | null;
};

export type Overview = {
  active_listings: number;
  pending_review: number;
  total_earnings: number;
  recent_activity: ActivityEvent[];
  active_listings_preview: ActiveListingPreview[];
};

export type EarningsPoint = {
  period: string;
  amount: number;
};

export type BidsPoint = {
  period: string;
  count: number;
};

export type ListingPerformanceRow = {
  listing_id: string;
  product_name: string;
  views: number;
  watchlisted: number;
  bids: number;
  conversion_rate: number;
  final_price: number | null;
  vs_market_pct: number | null;
};

export type SellerAnalytics = {
  total_earnings: number;
  bids_received: number;
  listing_views: number;
  watchlisted: number;
  earnings_over_time: EarningsPoint[];
  bids_over_time: BidsPoint[];
  listing_performance: ListingPerformanceRow[];
};
