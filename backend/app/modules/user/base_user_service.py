from abc import abstractmethod

import bcrypt

from .exceptions import (
    UserValidationError,
    UserAlreadyExistsError,
    UserNotFoundError,
    InvalidCredentialsError,
)
from .interfaces import IUserService

# ── Password hashing ──────────────────────────────────────────────────────────
# Hash directly with the `bcrypt` library instead of passlib.
# passlib (unmaintained since 2020) runs an internal self-test on first use
# that is incompatible with modern bcrypt releases (modern bcrypt raises
# ValueError for >72-byte inputs instead of silently truncating, which
# passlib's self-test doesn't expect — this crashes EVERY signup/login with
# "ValueError: password cannot be longer than 72 bytes" regardless of how
# short the user's actual password is). Calling bcrypt directly sidesteps
# passlib's self-test entirely and removes this whole class of version bugs.

_BCRYPT_MAX_BYTES = 72


def _hash_password(password: str) -> str:
    pw_bytes = password.encode("utf-8")
    if len(pw_bytes) > _BCRYPT_MAX_BYTES:
        raise UserValidationError(
            f"Password must be {_BCRYPT_MAX_BYTES} bytes or fewer."
        )
    return bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")


def _verify_password(password: str, hashed: str) -> bool:
    pw_bytes = password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    try:
        return bcrypt.checkpw(pw_bytes, hashed.encode("utf-8"))
    except ValueError:
        # Malformed/foreign hash format — treat as a non-match, not a crash.
        return False


class BaseUserService(IUserService):
    """
    Template Method base for all user-type services.
    All methods that touch the repository are async because the repo
    now uses AsyncSession with awaited calls.
    Pure utility methods (_serialize, _map_profile) stay synchronous.
    """

    def __init__(self, repo) -> None:
        self._repo = repo

    # ── Abstract hooks ────────────────────────────────────────────────────────

    @property
    @abstractmethod
    def user_type(self) -> str:
        ...

    @abstractmethod
    def _map_profile(self, user) -> dict:
        ...

    # ── Shared auth ───────────────────────────────────────────────────────────

    async def signup(self, data: dict) -> dict:
        name     = data.get("name", "").strip()
        email    = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not name or not email or not password:
            raise UserValidationError("Name, email, and password are required.")

        if await self._repo.get_by_email(email):
            raise UserAlreadyExistsError(
                f"A {self.user_type} account with this email already exists."
            )

        user = await self._repo.create({
            "name":         name,
            "email":        email,
            "password":     _hash_password(password),
            "phone_number": data.get("phone_number", ""),
            "address":      data.get("address", ""),
        })
        return self._serialize(user)

    async def login(self, data: dict) -> dict:
        email    = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            raise UserValidationError("Email and password are required.")

        user = await self._repo.get_by_email(email)
        if not user:
            raise UserNotFoundError(
                f"No {self.user_type} account found with this email."
            )

        if not _verify_password(password, user.password):
            raise InvalidCredentialsError("Incorrect password.")

        return self._serialize(user)

    # ── Shared profile ────────────────────────────────────────────────────────

    async def get_profile(self, user_id: int) -> dict:
        return self._map_profile(await self._repo.get_by_id(user_id))

    async def update_profile(self, user_id: int, data: dict) -> dict:
        user    = await self._repo.get_by_id(user_id)
        updated = await self._repo.update(user, data)
        return self._map_profile(updated)

    async def update_profile_image(self, user_id: int, image_name: str) -> dict:
        user    = await self._repo.get_by_id(user_id)
        updated = await self._repo.update_profile_image(user, image_name)
        return {"profile_image": updated.profile_image}

    # ── Shared serializer (sync — no DB call) ─────────────────────────────────

    def _serialize(self, user) -> dict:
        return {
            "id":        user.id,
            "name":      user.name,
            "email":     user.email,
            "user_type": self.user_type,
        }