from typing import Literal

from pydantic import BaseModel, Field

CONDITION_GRADES = ("DS", "VNDS", "USED", "BEAT")
LISTING_STATUSES = ("draft", "pending_review")

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
    current_step: int | None = Field(default=None, ge=1, le=6)


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
    status: str
    current_step: int
    photos: list[ListingPhotoOut] = []
    suggested_bid_prices: list[SuggestedBidPrice] = []
    created_at: str | None = None
    updated_at: str | None = None
    submitted_at: str | None = None


class ReorderPhotosRequest(BaseModel):
    photo_ids: list[str]
