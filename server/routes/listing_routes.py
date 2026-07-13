from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status

from routes.auth_routes import get_current_user
from schemas.listing import (
    ListingCreateRequest,
    ListingOut,
    ListingPhotoOut,
    ListingUpdateRequest,
    ReorderPhotosRequest,
)
from services import listing_service
from utils.image_utils import MAX_UPLOAD_BYTES

router = APIRouter(prefix="/listings", tags=["listings"])


@router.post("", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
def create_listing(payload: ListingCreateRequest, current_user: dict = Depends(get_current_user)):
    return listing_service.create_listing(current_user["id"], payload.product_id)


@router.get("/mine", response_model=list[ListingOut])
def list_mine(status_filter: str | None = Query(default=None, alias="status"), current_user: dict = Depends(get_current_user)):
    return listing_service.list_my_listings(current_user["id"], status_filter)


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: str, current_user: dict = Depends(get_current_user)):
    return listing_service.get_listing(current_user["id"], listing_id)


@router.patch("/{listing_id}", response_model=ListingOut)
def update_listing(listing_id: str, payload: ListingUpdateRequest, current_user: dict = Depends(get_current_user)):
    return listing_service.update_listing(current_user["id"], listing_id, payload.model_dump(exclude_unset=True))


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
