from datetime import datetime, timezone

from flask import jsonify


class ServiceError(Exception):
    def __init__(self, status_code: int, message: str, code: str, details=None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.code = code
        self.details = details or []


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def success_response(message: str, data: dict, status_code: int = 200, request_id: str | None = None):
    return (
        jsonify(
            {
                "success": True,
                "message": message,
                "data": data,
                "meta": {
                    "requestId": request_id,
                    "timestamp": _timestamp(),
                },
            }
        ),
        status_code,
    )


def error_response(error: ServiceError, request_id: str | None = None, log_error=None):
    if log_error is not None and error.status_code >= 500:
        print(f"Unhandled error: {log_error}")

    return (
        jsonify(
            {
                "success": False,
                "message": error.message,
                "error": {
                    "code": error.code,
                    "details": error.details,
                },
                "meta": {
                    "requestId": request_id,
                    "timestamp": _timestamp(),
                },
            }
        ),
        error.status_code,
    )
