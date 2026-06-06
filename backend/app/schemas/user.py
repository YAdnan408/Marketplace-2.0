from pydantic import BaseModel, EmailStr


# ── Request bodies ────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    user_type:    str          # "customer" | "seller"
    name:         str
    email:        EmailStr
    password:     str
    phone_number: str = ""
    address:      str = ""    # used by both customer (address) and seller (business_address)
    # Registration details



class LoginRequest(BaseModel):
    user_type: str             # "customer" | "seller"
    email:     EmailStr
    password:  str
    # Login credentials



class UpdateProfileRequest(BaseModel):
    name:         str
    phone_number: str = ""
    address:      str = ""
    # Profile update fields



# ── Response payloads ─────────────────────────────────────────────────────────

class AuthUserResponse(BaseModel):
    """Minimal payload returned after signup / login (included in the JWT)."""
    id:        int
    name:      str
    email:     str
    user_type: str
    # Authenticated user info



class TokenResponse(BaseModel):
    """Response body for signup and login endpoints."""
    message:      str
    access_token: str
    token_type:   str = "bearer"
    user:         AuthUserResponse
    # Token and user data



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

    model_config = {"from_attributes": True}  # Enable ORM model compatibility


class ProfileImageResponse(BaseModel):
    message:       str
    profile_image: str
    # Profile image data