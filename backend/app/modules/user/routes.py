import os

from fastapi import APIRouter, Response, UploadFile, File
from fastapi.responses import JSONResponse

from app.dependencies import DbSession, CurrentUser, RefreshPayload
from app.shared import allowed_file, get_extension, save_upload
from app.shared.security import create_access_token, create_refresh_token
from app.shared.exceptions import InvalidFileError
from app.config import get_settings

from .customer_repository import CustomerRepository
from .seller_repository import SellerRepository
from .customer_service import CustomerService
from .seller_service import SellerService
from .exceptions import InvalidUserTypeError, UserValidationError

from app.schemas.user import (
    SignupRequest,
    LoginRequest,
    UpdateProfileRequest,
    ProfileImageResponse,
)

settings = get_settings()

router = APIRouter(prefix="/api", tags=["users"])

# ── Cookie settings ───────────────────────────────────────────────────────────
# httponly=True  — JavaScript cannot read the cookie (XSS protection)
# samesite="lax" — Cookie is sent on same-site requests and top-level navigations
# secure=False   — Set to True in production (requires HTTPS)
_COOKIE_OPTS = dict(
    httponly=True,
    samesite="lax",
    # secure=True is required in production (HTTPS). Set to False only for local dev.
    secure=settings.app_env == "production",
)


# ── Dependency wiring ─────────────────────────────────────────────────────────

def _get_service(user_type: str, db):
    if user_type == "customer":
        return CustomerService(CustomerRepository(db))
    if user_type == "seller":
        return SellerService(SellerRepository(db))
    raise InvalidUserTypeError("Invalid account type. Choose customer or seller.")


def _set_auth_cookies(response: Response, user_data: dict) -> None:
    """Issue both tokens as httpOnly cookies on the response."""
    access_token = create_access_token({
        "user_id":   user_data["id"],
        "user_type": user_data["user_type"],
        "name":      user_data["name"],
    })
    refresh_token = create_refresh_token({
        "user_id":   user_data["id"],
        "user_type": user_data["user_type"],
        "name":      user_data["name"],
    })
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.access_token_expire_minutes * 60,
        **_COOKIE_OPTS,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=settings.refresh_token_expire_days * 86400,
        **_COOKIE_OPTS,
    )


# ── Signup ────────────────────────────────────────────────────────────────────

@router.post("/signup", status_code=201)
async def signup(body: SignupRequest, db: DbSession):
    service = _get_service(body.user_type, db)
    result  = await service.signup(body.model_dump())

    response = JSONResponse(
        status_code=201,
        content={"message": "Account created successfully", "user": result},
    )
    _set_auth_cookies(response, result)
    return response


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", status_code=200)
async def login(body: LoginRequest, db: DbSession):
    service = _get_service(body.user_type, db)
    result  = await service.login(body.model_dump())

    response = JSONResponse(
        status_code=200,
        content={"message": "Login successful", "user": result},
    )
    _set_auth_cookies(response, result)
    return response


# ── Refresh ───────────────────────────────────────────────────────────────────
# Called automatically by the frontend when an access token expires (401).
# Issues a fresh access token cookie using the long-lived refresh token.

@router.post("/refresh", status_code=200)
async def refresh_token(payload: RefreshPayload):
    """
    Read the refresh token cookie, verify it, and issue a new access token cookie.
    The refresh token cookie is left untouched (it keeps its original expiry).
    """
    new_access = create_access_token({
        "user_id":   payload["user_id"],
        "user_type": payload["user_type"],
        "name":      payload["name"],
    })
    response = JSONResponse(
        status_code=200,
        content={"message": "Token refreshed"},
    )
    response.set_cookie(
        key="access_token",
        value=new_access,
        max_age=settings.access_token_expire_minutes * 60,
        **_COOKIE_OPTS,
    )
    return response


# ── Logout ────────────────────────────────────────────────────────────────────

@router.post("/logout", status_code=200)
async def logout():
    """Clear both auth cookies."""
    response = JSONResponse(
        status_code=200,
        content={"message": "Logged out successfully"},
    )
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response


# ── Session check ─────────────────────────────────────────────────────────────

@router.get("/me", status_code=200)
async def me(current_user: CurrentUser):
    return {
        "id":        current_user["user_id"],
        "name":      current_user["name"],
        "user_type": current_user["user_type"],
    }


# ── Profile: Get ──────────────────────────────────────────────────────────────

@router.get("/profile", status_code=200)
async def get_profile(current_user: CurrentUser, db: DbSession):
    service = _get_service(current_user["user_type"], db)
    return await service.get_profile(current_user["user_id"])


# ── Profile: Update ───────────────────────────────────────────────────────────

@router.put("/profile", status_code=200)
async def update_profile(
    body: UpdateProfileRequest,
    current_user: CurrentUser,
    db: DbSession,
):
    if not body.name.strip():
        raise UserValidationError("Name is required.")

    service = _get_service(current_user["user_type"], db)
    updated = await service.update_profile(current_user["user_id"], body.model_dump())
    return {"message": "Profile updated successfully", "profile": updated}


# ── Profile: Upload image ─────────────────────────────────────────────────────

@router.post("/profile/image", response_model=ProfileImageResponse, status_code=200)
async def upload_profile_image(
    current_user: CurrentUser,
    db: DbSession,
    image: UploadFile = File(...),
):
    if not image.filename:
        raise InvalidFileError("No image file provided.")

    if not allowed_file(image.filename):
        raise InvalidFileError("Invalid file type. Allowed: png, jpg, jpeg, gif, webp.")

    user_id   = current_user["user_id"]
    user_type = current_user["user_type"]
    ext        = get_extension(image.filename)
    image_name = f"{user_type}_{user_id}_avatar.{ext}"

    upload_folder = os.path.join(settings.upload_dir, "profile_images")
    stored_path = save_upload(image.file, upload_folder, image_name)

    service = _get_service(user_type, db)
    await service.update_profile_image(user_id, stored_path)

    return ProfileImageResponse(
        message="Profile image updated successfully",
        profile_image=stored_path,
    )