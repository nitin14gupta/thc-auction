export type ConditionGrade = "DS" | "VNDS" | "USED" | "BEAT";

export type ListingStatus = "draft" | "pending_review" | "accepted" | "rejected";

export type ListingPhoto = {
  id: string;
  url: string;
  sort_order: number;
};

export type SuggestedBidPrice = {
  label: string;
  price: number;
  discount_pct: number;
};

export type Listing = {
  id: string;
  seller_id: string;
  product_id: string | null;
  variant_size: string | null;
  colorway: string | null;
  year_of_release: string | null;
  style_sku: string | null;
  condition_grade: ConditionGrade | null;
  condition_notes: string | null;
  base_price: number | null;
  bid_price: number | null;
  auction_start_at: string | null;
  status: ListingStatus;
  auction_status: AuctionStatus | null;
  winner_id: string | null;
  final_price: number | null;
  sold_at: string | null;
  current_step: number;
  photos: ListingPhoto[];
  suggested_bid_prices: SuggestedBidPrice[];
  created_at: string | null;
  updated_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
};

export type ListingsPage = {
  items: Listing[];
  total: number;
  page: number;
  page_size: number;
};

export type BrowseProductSummary = {
  id: string;
  name: string;
  brand: string | null;
  product_type: string | null;
  price: number | null;
  image_url: string | null;
};

export type BrowseListing = {
  id: string;
  variant_size: string | null;
  condition_grade: ConditionGrade | null;
  bid_price: number | null;
  auction_start_at: string | null;
  auction_status: AuctionStatus | null;
  close_deadline: string | null;
  bid_count: number;
  product: BrowseProductSummary | null;
};

export type BrowseListingsPage = {
  items: BrowseListing[];
  total: number;
  page: number;
  page_size: number;
};

export type AuctionStatus = "scheduled" | "live" | "sold" | "unsold";

export type AuctionScope = "live" | "upcoming" | "sold";

export type Bid = {
  id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
};

export type AuctionSeller = {
  id: string;
  name: string;
  avatar_url: string | null;
};

export type AuctionDetail = {
  id: string;
  product: BrowseProductSummary | null;
  variant_size: string | null;
  condition_grade: ConditionGrade | null;
  condition_notes: string | null;
  photos: ListingPhoto[];
  starting_price: number | null;
  current_price: number;
  min_next_bid: number | null;
  auction_status: AuctionStatus | null;
  auction_start_at: string | null;
  close_deadline: string | null;
  bids: Bid[];
  bid_count: number;
  winner_id: string | null;
  final_price: number | null;
  is_own_listing: boolean;
  view_count: number;
  watch_count: number;
  is_watching: boolean;
  seller: AuctionSeller | null;
};

export type ListingUpdatePatch = Partial<{
  variant_size: string;
  colorway: string;
  year_of_release: string;
  style_sku: string;
  condition_grade: ConditionGrade;
  condition_notes: string;
  bid_price: number;
  auction_start_at: string;
  current_step: number;
}>;
