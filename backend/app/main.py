from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging

from .config import get_settings
from .errors import register_exception_handlers

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


def create_app() -> FastAPI:
    logger.info("Initializing Marketplace API...")
    app = FastAPI(
        title="Marketplace API",
        description="FastAPI backend for the Marketplace project",
        version="1.0.0",
        docs_url="/docs" if settings.app_env != "production" else None,
        redoc_url="/redoc" if settings.app_env != "production" else None,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    # allow_credentials=True is REQUIRED for httpOnly cookies to be sent
    # cross-origin. When this is True, allow_origins cannot be ["*"] —
    # it must be explicit origin URLs.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Static file serving ───────────────────────────────────────────────────
    app.mount(
        "/uploads",
        StaticFiles(directory=settings.upload_dir),
        name="uploads",
    )

    # ── Global exception handlers ─────────────────────────────────────────────
    register_exception_handlers(app)

    # ── Routers ───────────────────────────────────────────────────────────────
    from .modules.user.routes import router as user_router
    from .modules.product.routes import router as product_router
    from .modules.order.routes import router as order_router

    app.include_router(user_router)
    app.include_router(product_router)
    app.include_router(order_router)

    return app


app = create_app()