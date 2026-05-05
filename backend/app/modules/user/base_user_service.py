from abc import abstractmethod

from passlib.context import CryptContext

from .exceptions import (
    UserValidationError,
    UserAlreadyExistsError,
    UserNotFoundError,
    InvalidCredentialsError,
)
from .interfaces import IUserService

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
            "password":     _pwd_context.hash(password),
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

        if not _pwd_context.verify(password, user.password):
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