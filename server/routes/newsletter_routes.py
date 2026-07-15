from fastapi import APIRouter

from schemas.newsletter import MessageResponse, NewsletterSubscribeRequest
from services import newsletter_service

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("/subscribe", response_model=MessageResponse)
def subscribe(payload: NewsletterSubscribeRequest):
    is_new = newsletter_service.subscribe(payload.email)
    if is_new:
        return MessageResponse(message="You're subscribed. Watch your inbox for exclusive drops.")
    return MessageResponse(message="You're already subscribed.")
