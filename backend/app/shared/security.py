from datetime import datetime, timedelta, timezone

from jose import jwt

from ..config import get_settings

settings = get_settings()


def create_access_token(data: dict) -> str:
    """
    Create a short-lived signed JWT (access token).
    Expiry is controlled by ACCESS_TOKEN_EXPIRE_MINUTES in settings (default 60 min).
    Payload should include at minimum: user_id, user_type, name.
    """
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload["type"] = "access"
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(data: dict) -> str:
    """
    Create a long-lived signed JWT (refresh token).
    Expiry is controlled by REFRESH_TOKEN_EXPIRE_DAYS in settings (default 7 days).
    Payload contains only the minimum identity claims needed to issue a new access token.
    """
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    payload["type"] = "refresh"
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)