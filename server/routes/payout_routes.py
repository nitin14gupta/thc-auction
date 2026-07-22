from fastapi import APIRouter, Depends

from routes.auth_routes import get_current_user, require_admin
from schemas.payout import PayoutOut, SellerPayoutsOut
from services import payout_service

router = APIRouter(prefix="/payouts", tags=["payouts"])


@router.get("/mine", response_model=SellerPayoutsOut)
def get_my_payouts(current_user: dict = Depends(get_current_user)):
    return payout_service.get_seller_payouts(current_user["id"])


@router.post("/orders/{order_id}/mark-paid", response_model=PayoutOut)
def mark_order_paid_out(order_id: str, admin_user: dict = Depends(require_admin)):
    return payout_service.mark_order_paid_out(order_id)
