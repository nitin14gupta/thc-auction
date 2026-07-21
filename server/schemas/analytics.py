from pydantic import BaseModel


class ActivityEvent(BaseModel):
    type: str
    text: str
    at: str


class ActiveListingPreview(BaseModel):
    id: str
    name: str
    image_url: str | None = None
    price: float | None = None


class OverviewOut(BaseModel):
    active_listings: int
    pending_review: int
    total_earnings: float
    recent_activity: list[ActivityEvent]
    active_listings_preview: list[ActiveListingPreview]


class EarningsPoint(BaseModel):
    period: str
    amount: float


class BidsPoint(BaseModel):
    period: str
    count: int


class ListingPerformanceRow(BaseModel):
    listing_id: str
    product_name: str
    views: int
    watchlisted: int
    bids: int
    conversion_rate: float
    final_price: float | None = None
    vs_market_pct: float | None = None


class SellerAnalyticsOut(BaseModel):
    total_earnings: float
    bids_received: int
    listing_views: int
    watchlisted: int
    earnings_over_time: list[EarningsPoint]
    bids_over_time: list[BidsPoint]
    listing_performance: list[ListingPerformanceRow]


class WatchToggleOut(BaseModel):
    is_watching: bool
    watch_count: int
