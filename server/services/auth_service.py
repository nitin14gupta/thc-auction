from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from jwt import PyJWTError

from core.config import settings
from core.security import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_token,
    generate_otp,
    hash_otp,
    hash_password,
    hash_token,
    verify_password,
)
from db.config import get_supabase_client
from services.email_service import send_otp_email


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _user_public(user: dict) -> dict:
    return {"id": user["id"], "name": user["name"], "email": user["email"]}


def get_user_by_email(email: str) -> dict | None:
    db = get_supabase_client()
    res = db.table("users").select("*").eq("email", email.lower()).limit(1).execute()
    return res.data[0] if res.data else None


def get_user_by_id(user_id: str) -> dict | None:
    db = get_supabase_client()
    res = db.table("users").select("*").eq("id", user_id).limit(1).execute()
    return res.data[0] if res.data else None


def register_user(name: str, email: str, password: str) -> dict:
    if get_user_by_email(email):
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")

    db = get_supabase_client()
    res = (
        db.table("users")
        .insert({"name": name, "email": email.lower(), "password_hash": hash_password(password)})
        .execute()
    )
    return res.data[0]


def authenticate_user(email: str, password: str) -> dict:
    user = get_user_by_email(email)
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")
    if not user.get("is_active", True):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This account has been disabled.")
    return user


def issue_token_pair(user_id: str) -> tuple[str, str]:
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)

    db = get_supabase_client()
    expires_at = _now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db.table("refresh_tokens").insert(
        {
            "user_id": user_id,
            "token_hash": hash_token(refresh_token),
            "expires_at": expires_at.isoformat(),
        }
    ).execute()

    return access_token, refresh_token


def rotate_refresh_token(refresh_token: str) -> tuple[str, str, dict]:
    """Validate + revoke the presented refresh token and issue a fresh pair.

    Rotation-on-use means a stolen-and-replayed refresh token is immediately
    detectable (it will already be revoked when the real user's client tries it).
    """
    try:
        payload = decode_token(refresh_token, "refresh")
    except PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired session.")

    user_id = payload["sub"]
    token_hash = hash_token(refresh_token)

    db = get_supabase_client()
    res = (
        db.table("refresh_tokens")
        .select("*")
        .eq("token_hash", token_hash)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    stored = res.data[0] if res.data else None
    if not stored or stored["revoked"]:
        # Possible token reuse/theft — revoke every session for this user to be safe.
        db.table("refresh_tokens").update({"revoked": True}).eq("user_id", user_id).execute()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired session.")

    db.table("refresh_tokens").update({"revoked": True}).eq("id", stored["id"]).execute()

    user = get_user_by_id(user_id)
    if not user or not user.get("is_active", True):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired session.")

    access_token, new_refresh_token = issue_token_pair(user_id)
    return access_token, new_refresh_token, user


def revoke_refresh_token(refresh_token: str) -> None:
    try:
        payload = decode_token(refresh_token, "refresh")
    except PyJWTError:
        return
    db = get_supabase_client()
    db.table("refresh_tokens").update({"revoked": True}).eq(
        "token_hash", hash_token(refresh_token)
    ).eq("user_id", payload["sub"]).execute()


def get_current_user(access_token: str) -> dict:
    try:
        payload = decode_token(access_token, "access")
    except PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token.")

    user = get_user_by_id(payload["sub"])
    if not user or not user.get("is_active", True):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token.")
    return user


def request_password_reset(email: str) -> None:
    user = get_user_by_email(email)
    if not user:
        # Don't reveal whether the email exists.
        return

    otp = generate_otp()
    db = get_supabase_client()
    expires_at = _now() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    db.table("password_reset_otps").insert(
        {
            "user_id": user["id"],
            "otp_hash": hash_otp(otp),
            "expires_at": expires_at.isoformat(),
        }
    ).execute()

    send_otp_email(user["email"], user["name"], otp)


def verify_password_reset_otp(email: str, otp: str) -> str:
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code.")

    db = get_supabase_client()
    res = (
        db.table("password_reset_otps")
        .select("*")
        .eq("user_id", user["id"])
        .eq("used", False)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    record = res.data[0] if res.data else None

    if not record or datetime.fromisoformat(record["expires_at"]) < _now():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code.")

    if record["attempts"] >= 5:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many attempts. Request a new code.")

    if record["otp_hash"] != hash_otp(otp):
        db.table("password_reset_otps").update({"attempts": record["attempts"] + 1}).eq(
            "id", record["id"]
        ).execute()
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code.")

    db.table("password_reset_otps").update({"used": True}).eq("id", record["id"]).execute()

    return create_reset_token(user["id"], user["email"])


def reset_password(reset_token: str, new_password: str) -> None:
    try:
        payload = decode_token(reset_token, "reset")
    except PyJWTError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset link.")

    user_id = payload["sub"]
    db = get_supabase_client()
    db.table("users").update(
        {"password_hash": hash_password(new_password), "updated_at": _now().isoformat()}
    ).eq("id", user_id).execute()

    # Reset password -> log out every existing session for safety.
    db.table("refresh_tokens").update({"revoked": True}).eq("user_id", user_id).execute()
