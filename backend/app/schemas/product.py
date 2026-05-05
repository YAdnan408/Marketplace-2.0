from pydantic import BaseModel


# ── Request bodies ────────────────────────────────────────────────────────────

class AddProductRequest(BaseModel):
    name:           str
    description:    str = ""
    price:          float
    stock_quantity: int
    category_id:    int | None = None


class UpdateProductRequest(BaseModel):
    name:           str
    description:    str = ""
    price:          float
    stock_quantity: int
    category_id:    int | None = None


class AddCategoryRequest(BaseModel):
    name:        str
    description: str = ""


# ── Response payloads ─────────────────────────────────────────────────────────

class CategoryResponse(BaseModel):
    id:          int
    name:        str
    description: str

    model_config = {"from_attributes": True}


class ProductResponse(BaseModel):
    id:             int
    name:           str
    description:    str
    price:          float
    stock_quantity: int
    image_name:     str
    category_id:    int | None
    category_name:  str
    seller_id:      int
    seller_name:    str
    seller_email:   str
    seller_image:   str

    model_config = {"from_attributes": True}


class ProductImageResponse(BaseModel):
    message:    str
    product:    dict