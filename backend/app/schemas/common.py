from pydantic import BaseModel


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    """Standard error envelope returned by the global exception handlers."""
    success: bool = False
    error: ErrorDetail


class MessageResponse(BaseModel):
    """Simple success message for endpoints that don't return data. Used for status updates."""
    message: str