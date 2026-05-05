from app.shared.exceptions import APIException


class OrderValidationError(APIException):
    def __init__(self, message: str = "Invalid order data"):
        super().__init__(message=message, status_code=400, code="ORDER_VALIDATION_ERROR")


class InsufficientStockError(APIException):
    def __init__(self, message: str = "Insufficient stock"):
        super().__init__(message=message, status_code=400, code="INSUFFICIENT_STOCK")


class OrderNotFoundError(APIException):
    def __init__(self, message: str = "Order not found"):
        super().__init__(message=message, status_code=404, code="ORDER_NOT_FOUND")


class OrderPlacementError(APIException):
    def __init__(self, message: str = "Failed to place order"):
        super().__init__(message=message, status_code=500, code="ORDER_PLACEMENT_FAILED")


class InvalidOrderStatusError(APIException):
    def __init__(self, message: str = "Invalid order status"):
        super().__init__(message=message, status_code=400, code="INVALID_ORDER_STATUS")


class OrderAccessForbiddenError(APIException):
    def __init__(self, message: str = "You are not authorised to update this order"):
        super().__init__(message=message, status_code=403, code="ORDER_ACCESS_FORBIDDEN")