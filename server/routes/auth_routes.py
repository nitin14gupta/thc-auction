from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.config import settings
from schemas.auth import (
    AccessTokenResponse,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResetPasswordRequest,
    UserOut,
    VerifyOtpRequest,
    VerifyOtpResponse,
)
from services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])
bearer_scheme = HTTPBearer(auto_error=False)


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=settings.REFRESH_TOKEN_COOKIE_NAME, path="/")


def _access_token_response(access_token: str, user: dict) -> AccessTokenResponse:
    return AccessTokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserOut(id=user["id"], name=user["name"], email=user["email"]),
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if not credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated.")
    return auth_service.get_current_user(credentials.credentials)


@router.post("/register", response_model=AccessTokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response):
    user = auth_service.register_user(payload.name, payload.email, payload.password)
    access_token, refresh_token = auth_service.issue_token_pair(user["id"])
    _set_refresh_cookie(response, refresh_token)
    return _access_token_response(access_token, user)


@router.post("/login", response_model=AccessTokenResponse)
def login(payload: LoginRequest, response: Response):
    user = auth_service.authenticate_user(payload.email, payload.password)
    access_token, refresh_token = auth_service.issue_token_pair(user["id"])
    _set_refresh_cookie(response, refresh_token)
    return _access_token_response(access_token, user)


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get(settings.REFRESH_TOKEN_COOKIE_NAME)
    if not refresh_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated.")

    access_token, new_refresh_token, user = auth_service.rotate_refresh_token(refresh_token)
    _set_refresh_cookie(response, new_refresh_token)
    return _access_token_response(access_token, user)


@router.post("/logout", response_model=MessageResponse)
def logout(request: Request, response: Response):
    refresh_token = request.cookies.get(settings.REFRESH_TOKEN_COOKIE_NAME)
    if refresh_token:
        auth_service.revoke_refresh_token(refresh_token)
    _clear_refresh_cookie(response)
    return MessageResponse(message="Logged out.")


@router.get("/me", response_model=UserOut)
def me(current_user: dict = Depends(get_current_user)):
    return UserOut(id=current_user["id"], name=current_user["name"], email=current_user["email"])


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest):
    auth_service.request_password_reset(payload.email)
    return MessageResponse(message="If that email exists, a reset code has been sent.")


@router.post("/verify-otp", response_model=VerifyOtpResponse)
def verify_otp(payload: VerifyOtpRequest):
    reset_token = auth_service.verify_password_reset_otp(payload.email, payload.otp)
    return VerifyOtpResponse(reset_token=reset_token)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest):
    auth_service.reset_password(payload.reset_token, payload.new_password)
    return MessageResponse(message="Password updated. You can now log in.")
