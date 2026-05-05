from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_settings
from .database import get_db

settings = get_settings()

# ── Database session ──────────────────────────────────────────────────────────

DbSession = Annotated[AsyncSession, Depends(get_db)]


# ── Token decoder ─────────────────────────────────────────────────────────────

def _decode_jwt(token: str | None, expected_type: str) -> dict:
    """
    Decode and validate a JWT string.
    Raises 401 if missing, invalid, expired, or the wrong token type.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Login required"},
        )
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        if payload.get("type") != expected_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "UNAUTHORIZED", "message": "Invalid token type"},
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Invalid or expired token"},
        )


# ── Auth dependencies ─────────────────────────────────────────────────────────
# Token is now read from an httpOnly cookie named "access_token".
# The browser sends it automatically — no Authorization header needed.

async def get_current_user(
    access_token: str | None = Cookie(default=None),
) -> dict:
    """
    Read the access JWT from the httpOnly cookie and return its payload.
    Raises 401 if the cookie is missing or the token is invalid.
    Payload contains: user_id, user_type, name.
    """
    return _decode_jwt(access_token, expected_type="access")


async def get_refresh_payload(
    refresh_token: str | None = Cookie(default=None),
) -> dict:
    """
    Read the refresh JWT from the httpOnly cookie and return its payload.
    Used only by the /api/refresh endpoint.
    """
    return _decode_jwt(refresh_token, expected_type="refresh")


async def get_current_seller(
    current_user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    if current_user.get("user_type") != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "Seller access required"},
        )
    return current_user


async def get_current_customer(
    current_user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    if current_user.get("user_type") != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "Customer access required"},
        )
    return current_user


# ── Annotated shorthand types ─────────────────────────────────────────────────

CurrentUser     = Annotated[dict, Depends(get_current_user)]
CurrentSeller   = Annotated[dict, Depends(get_current_seller)]
CurrentCustomer = Annotated[dict, Depends(get_current_customer)]
RefreshPayload  = Annotated[dict, Depends(get_refresh_payload)]