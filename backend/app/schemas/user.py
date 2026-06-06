from pydantic import BaseModel, EmailStr


# ── Request bodies ────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    user_type:    str          # "customer" | "seller"
    name:         str
    email:        EmailStr
    password:     str
    phone_number: str = ""
    address:      str = ""    # used by both customer (address) and seller (business_address)


class LoginRequest(BaseModel):
    user_type: str             # "customer" | "seller"
    email:     EmailStr
    password:  str


class UpdateProfileRequest(BaseModel):
    name:         str
    phone_number: str = ""
    address:      str = ""


# ── Response payloads ─────────────────────────────────────────────────────────

class AuthUserResponse(BaseModel):
    """Minimal payload returned after signup / login (included in the JWT)."""
    id:        int
    name:      str
    email:     str
    user_type: str


class TokenResponse(BaseModel):
    """Response body for signup and login endpoints."""
    message:      str
    access_token: str
    token_type:   str = "bearer"
    user:         AuthUserResponse


class CustomerProfileResponse(BaseModel):
    id:            int
    user_type:     str
    name:          str
    email:         str
    phone_number:  str
    address:       str
    profile_image: str

    model_config = {"from_attributes": True}  # Enable ORM model compatibility


class SellerProfileResponse(BaseModel):
    id:               int
    user_type:        str
    name:             str
    email:            str
    phone_number:     str
    business_address: str
    profile_image:    str

    model_config = {"from_attributes": True}


class ProfileImageResponse(BaseModel):
    message:       str
    profile_image: str