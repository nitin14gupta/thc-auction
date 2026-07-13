from fastapi import APIRouter, Depends, Query

from routes.auth_routes import get_current_user
from schemas.product import ProductOut, ProductSearchResult
from services import product_service

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/featured", response_model=list[ProductSearchResult])
def featured(
    limit: int = Query(default=8, ge=1, le=50),
    category: str | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    return product_service.get_featured_products(limit, category)


@router.get("/search", response_model=list[ProductSearchResult])
def search(
    q: str = Query(default=""),
    limit: int = Query(default=20, ge=1, le=50),
    category: str | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    return product_service.search_products(q, limit, category)


@router.get("/{product_id}", response_model=ProductOut)
def detail(product_id: str, current_user: dict = Depends(get_current_user)):
    return product_service.get_product(product_id)
