from fastapi import APIRouter, Depends, Query

from routes.auth_routes import get_current_user
from schemas.order import OrderOut, OrdersPage, RazorpayOrderOut, VerifyPaymentRequest
from services import order_service

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/mine", response_model=OrdersPage)
def list_mine(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
    return order_service.list_my_orders(current_user["id"], page, page_size)


@router.post("/{order_id}/razorpay", response_model=RazorpayOrderOut)
def create_razorpay_order(order_id: str, current_user: dict = Depends(get_current_user)):
    return order_service.create_razorpay_order(current_user["id"], order_id)


@router.post("/{order_id}/verify", response_model=OrderOut)
def verify_payment(order_id: str, payload: VerifyPaymentRequest, current_user: dict = Depends(get_current_user)):
    return order_service.verify_payment(
        current_user["id"],
        order_id,
        payload.razorpay_order_id,
        payload.razorpay_payment_id,
        payload.razorpay_signature,
    )
