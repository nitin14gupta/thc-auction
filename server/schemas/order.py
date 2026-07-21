from pydantic import BaseModel


class OrderProductSummary(BaseModel):
    id: str
    name: str
    brand: str | None = None
    image_url: str | None = None


class OrderOut(BaseModel):
    id: str
    listing_id: str
    buyer_id: str
    amount: float
    status: str
    payment_deadline: str
    razorpay_order_id: str | None = None
    razorpay_payment_id: str | None = None
    created_at: str
    paid_at: str | None = None
    product: OrderProductSummary | None = None


class OrdersPage(BaseModel):
    items: list[OrderOut]
    total: int
    page: int
    page_size: int


class RazorpayOrderOut(BaseModel):
    razorpay_order_id: str
    amount: float
    currency: str
    key_id: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
