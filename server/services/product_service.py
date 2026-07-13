import random

from fastapi import HTTPException, status

from db.config import get_supabase_client

SEARCH_COLUMNS = "id, name, brand, product_type, price, images"
DETAIL_COLUMNS = (
    "id, name, brand, product_type, product_category, sku, price, "
    "compare_at_price, currency, description, images"
)


def _first_image_url(images: list | None) -> str | None:
    if not images:
        return None
    sorted_images = sorted(images, key=lambda i: i.get("sort_order") or 0)
    return sorted_images[0].get("url")


def _to_search_result(row: dict) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "brand": row.get("brand"),
        "product_type": row.get("product_type"),
        "price": row.get("price"),
        "image_url": _first_image_url(row.get("images")),
    }


def get_featured_products(limit: int = 8, category: str | None = None) -> list[dict]:
    db = get_supabase_client()
    query = db.table("products").select(SEARCH_COLUMNS).order("rating", desc=True)
    if category:
        query = query.eq("product_type", category)
    res = query.limit(max(limit * 5, 50)).execute()
    rows = res.data or []
    sample = random.sample(rows, k=min(limit, len(rows))) if rows else []
    return [_to_search_result(r) for r in sample]


def search_products(query: str, limit: int = 20, category: str | None = None) -> list[dict]:
    if not query or not query.strip():
        return get_featured_products(limit, category)

    q = query.strip()
    db = get_supabase_client()
    request = (
        db.table("products")
        .select(SEARCH_COLUMNS)
        .or_(f"name.ilike.%{q}%,brand.ilike.%{q}%,sku.ilike.%{q}%")
    )
    if category:
        request = request.eq("product_type", category)
    res = request.limit(limit).execute()
    return [_to_search_result(r) for r in (res.data or [])]


def get_product(product_id: str) -> dict:
    db = get_supabase_client()
    res = db.table("products").select(DETAIL_COLUMNS).eq("id", product_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    product = res.data[0]

    variants_res = (
        db.table("product_variants")
        .select("id, size, shipping_mode, sale_price, compare_at_price")
        .eq("product_id", product_id)
        .execute()
    )
    product["variants"] = variants_res.data or []
    product["images"] = product.get("images") or []
    return product
