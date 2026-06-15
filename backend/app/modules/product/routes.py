import os

from fastapi import APIRouter, UploadFile, File

from app.dependencies import DbSession, CurrentUser, CurrentSeller
from app.shared import allowed_file, get_extension, save_upload
from app.shared.exceptions import InvalidFileError
from app.config import get_settings

from .product_repository import ProductRepository
from .category_repository import CategoryRepository
from .product_service import ProductService

from app.schemas.product import (
    AddProductRequest,
    UpdateProductRequest,
    AddCategoryRequest,
)

settings = get_settings()

router = APIRouter(prefix="/api/products", tags=["products"])


# ── Dependency wiring ─────────────────────────────────────────────────────────

def _get_service(db) -> ProductService:
    return ProductService(ProductRepository(db), CategoryRepository(db))


# ── Categories ────────────────────────────────────────────────────────────────

@router.get("/categories", status_code=200)
async def get_categories(db: DbSession):
    return await _get_service(db).get_categories()


@router.post("/categories", status_code=201)
async def add_category(body: AddCategoryRequest, _current_user: CurrentUser, db: DbSession):
    return await _get_service(db).add_category(body.name, body.description)


# ── Customer: Browse all products ─────────────────────────────────────────────

@router.get("/", status_code=200)
async def get_all_products(db: DbSession, current_user: CurrentUser):
    service = _get_service(db)
    if current_user["user_type"] == "seller":
        return await service.get_seller_products(current_user["user_id"])
    return await service.get_all_products()


# ── Product detail ────────────────────────────────────────────────────────────

@router.get("/{product_id}", status_code=200)
async def get_product_detail(product_id: int, _current_user: CurrentUser, db: DbSession):
    return await _get_service(db).get_product_detail(product_id)


# ── Seller: Add product ───────────────────────────────────────────────────────

@router.post("/", status_code=201)
async def add_product(body: AddProductRequest, current_seller: CurrentSeller, db: DbSession):
    product = await _get_service(db).add_product(current_seller["user_id"], body.model_dump())
    return {"message": "Product added successfully.", "product": product}


# ── Seller: Update product ────────────────────────────────────────────────────

@router.put("/{product_id}", status_code=200)
async def update_product(
    product_id: int,
    body: UpdateProductRequest,
    current_seller: CurrentSeller,
    db: DbSession,
):
    updated = await _get_service(db).update_product(
        current_seller["user_id"], product_id, body.model_dump()
    )
    return {"message": "Product updated successfully.", "product": updated}


# ── Seller: Delete product ────────────────────────────────────────────────────

@router.delete("/{product_id}", status_code=200)
async def delete_product(product_id: int, current_seller: CurrentSeller, db: DbSession):
    return await _get_service(db).delete_product(current_seller["user_id"], product_id)


# ── Seller: Upload product image ──────────────────────────────────────────────

@router.post("/{product_id}/image", status_code=200)
async def upload_product_image(
    product_id: int,
    current_seller: CurrentSeller,
    db: DbSession,
    image: UploadFile = File(...),
):
    if not image.filename:
        raise InvalidFileError("No image file provided.")

    if not allowed_file(image.filename):
        raise InvalidFileError("Invalid file type. Allowed: png, jpg, jpeg, gif, webp.")

    ext        = get_extension(image.filename)
    image_name = f"product_{product_id}_{current_seller['user_id']}.{ext}"

    upload_folder = os.path.join(settings.upload_dir, "product_images")
    stored_path = save_upload(image.file, upload_folder, image_name)

    updated = await _get_service(db).update_product_image(
        current_seller["user_id"], product_id, stored_path
    )
    return {"message": "Product image uploaded successfully.", "product": updated}