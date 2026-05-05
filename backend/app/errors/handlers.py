import traceback

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.shared.exceptions import APIException


def handle_api_exception(_request: Request, exc: APIException) -> JSONResponse:
    """
    Handles all expected domain errors (subclasses of APIException).
    Returns the same structured error envelope used in the Flask version:
        { "success": false, "error": { "code": "...", "message": "..." } }

    Registered first so domain errors are caught before the generic handler.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
            },
        },
    )


def handle_unexpected_error(_request: Request, exc: Exception) -> JSONResponse:
    """
    Catch-all for any unhandled exception.
    Logs the full traceback (replace print with a proper logger in production).
    Returns a generic 500 so internal details are never exposed to the client.
    """
    print(traceback.format_exc())

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "Something went wrong",
            },
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    """
    Register both handlers on the FastAPI app instance.
    Called once from main.py during startup — equivalent to Flask's
    register_error_handlers(app).

    Order matters: APIException is registered first so its handler takes
    priority over the generic Exception handler for all domain errors.
    """
    app.add_exception_handler(APIException, handle_api_exception)
    app.add_exception_handler(Exception, handle_unexpected_error)