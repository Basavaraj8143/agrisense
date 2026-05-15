import os
from datetime import datetime, timezone
from uuid import uuid4

from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS

from services.crop_service import CropRecommendationService
from services.pest_service import PestDetectionService
from utils.http import ServiceError, error_response, success_response
from utils.validation import validate_crop_request

load_dotenv()

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/ml/*": {
            "origins": os.getenv("ML_CORS_ORIGIN", "*"),
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Request-Id"],
        }
    },
)

service_version = os.getenv("ML_SERVICE_VERSION", "1.0.0")
crop_service = CropRecommendationService()
pest_service = PestDetectionService()


def build_request_id(prefix: str = "ml") -> str:
    return f"{prefix}_{uuid4()}"


@app.route("/ml/health", methods=["GET"])
def health_check():
    request_id = build_request_id("mlhealth")

    return success_response(
        "ML service is healthy",
        {
            "service": "ml-service",
            "version": service_version,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "capabilities": {
                "cropRecommendation": crop_service.is_ready,
                "pestDetection": True,
            },
            "providers": {
                "crop": crop_service.provider_name,
                "pest": pest_service.provider_name,
            },
            "errors": {
                "crop": crop_service.startup_error,
            },
        },
        request_id=request_id,
    )


@app.route("/ml/recommend", methods=["POST"])
def recommend_crop():
    request_id = build_request_id("mlcrop")

    try:
        payload = request.get_json(silent=True)
        if payload is None:
            raise ServiceError(
                400,
                "JSON request body is required",
                "VALIDATION_ERROR",
                [{"field": "body", "issue": "Send a JSON payload"}],
            )

        validated_payload = validate_crop_request(payload)
        result = crop_service.recommend(validated_payload)

        return success_response(
            "Recommendation generated",
            {
                "result": result,
            },
            request_id=request_id,
        )
    except ServiceError as error:
        return error_response(error, request_id=request_id)
    except Exception as error:
        return error_response(
            ServiceError(500, "Internal server error", "INTERNAL_ERROR"),
            request_id=request_id,
            log_error=error,
        )


@app.route("/ml/pest-detect", methods=["POST"])
def detect_pest():
    request_id = build_request_id("mlpest")

    try:
        result = pest_service.detect(
            uploaded_file=request.files.get("image"),
            json_payload=request.get_json(silent=True) if request.is_json else None,
        )

        return success_response(
            "Pest analysis completed",
            {
                "result": result,
            },
            request_id=request_id,
        )
    except ServiceError as error:
        return error_response(error, request_id=request_id)
    except Exception as error:
        return error_response(
            ServiceError(500, "Internal server error", "INTERNAL_ERROR"),
            request_id=request_id,
            log_error=error,
        )


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
