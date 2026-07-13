from pydantic import BaseModel


class ProductVariantOut(BaseModel):
    id: str
    size: str | None = None
    shipping_mode: str | None = None
    sale_price: float | None = None
    compare_at_price: float | None = None


class ProductImageOut(BaseModel):
    url: str
    name: str | None = None
    alt: str | None = None
    sort_order: int | None = None


class ProductSearchResult(BaseModel):
    id: str
    name: str
    brand: str | None = None
    product_type: str | None = None
    price: float | None = None
    image_url: str | None = None


class ProductOut(BaseModel):
    id: str
    name: str
    brand: str | None = None
    product_type: str | None = None
    product_category: str | None = None
    sku: str | None = None
    price: float | None = None
    compare_at_price: float | None = None
    currency: str = "INR"
    description: str | None = None
    images: list[ProductImageOut] = []
    variants: list[ProductVariantOut] = []
