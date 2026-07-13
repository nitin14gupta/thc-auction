export type ConditionGrade = "DS" | "VNDS" | "USED" | "BEAT";

export type ListingStatus = "draft" | "pending_review";

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
  status: ListingStatus;
  current_step: number;
  photos: ListingPhoto[];
  suggested_bid_prices: SuggestedBidPrice[];
  created_at: string | null;
  updated_at: string | null;
  submitted_at: string | null;
};

export type ListingUpdatePatch = Partial<{
  variant_size: string;
  colorway: string;
  year_of_release: string;
  style_sku: string;
  condition_grade: ConditionGrade;
  condition_notes: string;
  bid_price: number;
  current_step: number;
}>;
