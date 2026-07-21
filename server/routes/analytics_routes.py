from fastapi import APIRouter, Depends

from routes.auth_routes import get_current_user
from schemas.analytics import OverviewOut, SellerAnalyticsOut
from services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=OverviewOut)
def get_overview(current_user: dict = Depends(get_current_user)):
    return analytics_service.get_seller_overview(current_user["id"])


@router.get("/seller", response_model=SellerAnalyticsOut)
def get_seller_analytics(current_user: dict = Depends(get_current_user)):
    return analytics_service.get_seller_analytics(current_user["id"])
