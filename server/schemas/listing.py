from typing import Literal

from pydantic import BaseModel, Field

CONDITION_GRADES = ("DS", "VNDS", "USED", "BEAT")
LISTING_STATUSES = ("draft", "pending_review", "accepted", "rejected")

ConditionGrade = Literal["DS", "VNDS", "USED", "BEAT"]


class ListingCreateRequest(BaseModel):
    product_id: str


class ListingUpdateRequest(BaseModel):
    variant_size: str | None = Field(default=None, min_length=1, max_length=100)
    colorway: str | None = Field(default=None, max_length=100)
    year_of_release: str | None = Field(default=None, max_length=20)
    style_sku: str | None = Field(default=None, max_length=100)
    condition_grade: ConditionGrade | None = None
    condition_notes: str | None = Field(default=None, max_length=500)
    bid_price: float | None = Field(default=None, gt=0)
    auction_start_at: str | None = None
    current_step: int | None = Field(default=None, ge=1, le=6)


class ListingReviewRequest(BaseModel):
    action: Literal["accept", "reject"]


class ListingPhotoOut(BaseModel):
    id: str
    url: str
    sort_order: int


class SuggestedBidPrice(BaseModel):
    label: str
    price: float
    discount_pct: float


class ListingOut(BaseModel):
    id: str
    seller_id: str
    product_id: str | None = None
    variant_size: str | None = None
    colorway: str | None = None
    year_of_release: str | None = None
    style_sku: str | None = None
    condition_grade: str | None = None
    condition_notes: str | None = None
    base_price: float | None = None
    bid_price: float | None = None
    auction_start_at: str | None = None
    status: str
    auction_status: str | None = None
    winner_id: str | None = None
    final_price: float | None = None
    sold_at: str | None = None
    current_step: int
    photos: list[ListingPhotoOut] = []
    suggested_bid_prices: list[SuggestedBidPrice] = []
    created_at: str | None = None
    updated_at: str | None = None
    submitted_at: str | None = None
    reviewed_at: str | None = None


class ListingsPage(BaseModel):
    items: list[ListingOut]
    total: int
    page: int
    page_size: int


class ReorderPhotosRequest(BaseModel):
    photo_ids: list[str]


class BrowseProductSummary(BaseModel):
    id: str
    name: str
    brand: str | None = None
    product_type: str | None = None
    price: float | None = None
    image_url: str | None = None


class BrowseListingOut(BaseModel):
    id: str
    variant_size: str | None = None
    condition_grade: str | None = None
    bid_price: float | None = None
    auction_start_at: str | None = None
    auction_status: str | None = None
    close_deadline: str | None = None
    bid_count: int = 0
    product: BrowseProductSummary | None = None


class BrowseListingsPage(BaseModel):
    items: list[BrowseListingOut]
    total: int
    page: int
    page_size: int


class BidOut(BaseModel):
    id: str
    bidder_id: str
    amount: float
    created_at: str


class SellerSummary(BaseModel):
    id: str
    name: str
    avatar_url: str | None = None


class AuctionDetailOut(BaseModel):
    id: str
    product: BrowseProductSummary | None = None
    variant_size: str | None = None
    condition_grade: str | None = None
    condition_notes: str | None = None
    photos: list[ListingPhotoOut] = []
    starting_price: float | None = None
    current_price: float
    min_next_bid: float | None = None
    auction_status: str | None = None
    auction_start_at: str | None = None
    close_deadline: str | None = None
    bids: list[BidOut] = []
    bid_count: int = 0
    winner_id: str | None = None
    final_price: float | None = None
    is_own_listing: bool = False
    view_count: int = 0
    watch_count: int = 0
    is_watching: bool = False
    seller: SellerSummary | None = None


class PlaceBidRequest(BaseModel):
    amount: float = Field(gt=0)
