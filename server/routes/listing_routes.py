from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status

from routes.auth_routes import get_current_user
from schemas.analytics import WatchToggleOut
from schemas.listing import (
    AuctionDetailOut,
    BrowseListingOut,
    BrowseListingsPage,
    ListingCreateRequest,
    ListingOut,
    ListingPhotoOut,
    ListingReviewRequest,
    ListingsPage,
    ListingUpdateRequest,
    PlaceBidRequest,
    ReorderPhotosRequest,
)
from services import analytics_service, listing_service
from utils.image_utils import MAX_UPLOAD_BYTES

router = APIRouter(prefix="/listings", tags=["listings"])


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if not current_user.get("is_admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required.")
    return current_user


@router.post("", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
def create_listing(payload: ListingCreateRequest, current_user: dict = Depends(get_current_user)):
    return listing_service.create_listing(current_user["id"], payload.product_id)


@router.get("/mine", response_model=ListingsPage)
def list_mine(
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
    return listing_service.list_my_listings(current_user["id"], status_filter, page, page_size)


@router.get("/browse", response_model=BrowseListingsPage)
def browse_listings(
    scope: str = Query(default="live", pattern="^(live|upcoming|sold)$"),
    category: str | None = Query(default=None),
    q: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
    return listing_service.browse_listings(current_user["id"], scope, category, q, page, page_size)


@router.get("/{listing_id}/auction", response_model=AuctionDetailOut)
def get_auction_detail(listing_id: str, current_user: dict = Depends(get_current_user)):
    return listing_service.get_auction_detail(current_user["id"], listing_id)


@router.post("/{listing_id}/bids", response_model=AuctionDetailOut)
def place_bid(listing_id: str, payload: PlaceBidRequest, current_user: dict = Depends(get_current_user)):
    return listing_service.place_bid(current_user["id"], listing_id, payload.amount)


@router.post("/{listing_id}/watch", response_model=WatchToggleOut)
def toggle_watch(listing_id: str, current_user: dict = Depends(get_current_user)):
    return analytics_service.toggle_watch(current_user["id"], listing_id)


@router.get("/{listing_id}/related", response_model=list[BrowseListingOut])
def get_related_listings(
    listing_id: str,
    limit: int = Query(default=4, ge=1, le=12),
    current_user: dict = Depends(get_current_user),
):
    return listing_service.get_related_listings(current_user["id"], listing_id, limit)


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: str, current_user: dict = Depends(get_current_user)):
    return listing_service.get_listing(current_user["id"], listing_id)


@router.patch("/{listing_id}", response_model=ListingOut)
def update_listing(listing_id: str, payload: ListingUpdateRequest, current_user: dict = Depends(get_current_user)):
    return listing_service.update_listing(current_user["id"], listing_id, payload.model_dump(exclude_unset=True))


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(listing_id: str, current_user: dict = Depends(get_current_user)):
    listing_service.delete_listing(current_user["id"], listing_id)


@router.post("/{listing_id}/photos", response_model=list[ListingPhotoOut])
async def upload_photos(
    listing_id: str,
    files: list[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user),
):
    uploads = []
    for f in files:
        raw = await f.read()
        if len(raw) > MAX_UPLOAD_BYTES:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, f"{f.filename} exceeds the 8MB limit.")
        uploads.append((raw, f.filename or "photo"))

    return listing_service.add_photos(current_user["id"], listing_id, uploads)


@router.delete("/{listing_id}/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo(listing_id: str, photo_id: str, current_user: dict = Depends(get_current_user)):
    listing_service.delete_photo(current_user["id"], listing_id, photo_id)


@router.patch("/{listing_id}/photos/reorder", response_model=list[ListingPhotoOut])
def reorder_photos(listing_id: str, payload: ReorderPhotosRequest, current_user: dict = Depends(get_current_user)):
    return listing_service.reorder_photos(current_user["id"], listing_id, payload.photo_ids)


@router.post("/{listing_id}/submit", response_model=ListingOut)
def submit_listing(listing_id: str, current_user: dict = Depends(get_current_user)):
    return listing_service.submit_listing(current_user["id"], listing_id)


@router.post("/{listing_id}/review", response_model=ListingOut)
def review_listing(listing_id: str, payload: ListingReviewRequest, admin_user: dict = Depends(require_admin)):
    return listing_service.review_listing(listing_id, payload.action)
