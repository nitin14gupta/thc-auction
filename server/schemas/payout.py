from pydantic import BaseModel


class PayoutHistoryRow(BaseModel):
    order_id: str
    listing_id: str
    product_name: str
    product_brand: str | None = None
    image_url: str | None = None
    sale_price: float
    commission: float
    commission_rate_pct: float
    payout_amount: float
    status: str  # "paid" | "processing"
    date: str | None = None


class SellerPayoutsOut(BaseModel):
    pending_payout: float
    pending_count: int
    history: list[PayoutHistoryRow]


class PayoutOut(BaseModel):
    id: str
    seller_id: str
    listing_id: str | None = None
    amount: float
    note: str | None = None
    created_at: str
