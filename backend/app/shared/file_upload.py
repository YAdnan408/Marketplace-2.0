import os
import cloudinary
import cloudinary.uploader
from ..config import get_settings

settings = get_settings()

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

if settings.cloudinary_url:
    cloudinary.config(cloudinary_url=settings.cloudinary_url)


def allowed_file(filename: str) -> bool:
    """Return True if the file's extension is in the allowed set."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_extension(filename: str) -> str:
    """Return the lowercase extension of a filename (without the dot)."""
    return filename.rsplit(".", 1)[1].lower()


def save_upload(file, upload_folder: str, filename: str) -> str:
    """
    Save an uploaded file object to upload_folder/filename or Cloudinary.
    Returns the saved filename or Cloudinary URL.
    """
    if settings.cloudinary_url:
        # Upload to Cloudinary
        # We use the filename as the public_id (without extension)
        public_id = os.path.splitext(filename)[0]
        folder = os.path.basename(upload_folder)
        result = cloudinary.uploader.upload(
            file,
            public_id=public_id,
            folder=f"marketplace/{folder}",
            overwrite=True
        )
        return result.get("secure_url")

    # Local storage fallback
    os.makedirs(upload_folder, exist_ok=True)
    dest = os.path.join(upload_folder, filename)
    with open(dest, "wb") as out:
        out.write(file.read())
    return filename
