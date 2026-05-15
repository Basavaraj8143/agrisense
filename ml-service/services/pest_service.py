import base64
import hashlib
import os
from datetime import datetime, timezone

import requests

from utils.http import ServiceError


class PestDetectionService:
    def __init__(self) -> None:
        self.provider_name = os.getenv("PEST_PROVIDER", "mock").strip().lower()
        self.provider_url = os.getenv(
            "PEST_PROVIDER_API_URL",
            "https://insect.kindwise.com/api/v1/identification?details=name,common_names,description_gpt,image",
        )
        self.provider_timeout_ms = int(os.getenv("PEST_PROVIDER_TIMEOUT_MS", "10000"))
        self.provider_api_key = os.getenv("PEST_PROVIDER_API_KEY", "")
        self.max_image_bytes = int(os.getenv("PEST_IMAGE_MAX_BYTES", str(5 * 1024 * 1024)))
        self.allowed_mime_types = {"image/jpeg", "image/png", "image/webp"}
        self.mock_catalog = [
            {
                "scientificName": "Spodoptera frugiperda",
                "commonNames": "Fall Armyworm",
                "treatmentSummary": "Use pheromone traps and targeted control in the early larval stage.",
            },
            {
                "scientificName": "Nilaparvata lugens",
                "commonNames": "Brown Planthopper",
                "treatmentSummary": "Reduce standing water and avoid excess nitrogen before using targeted control.",
            },
            {
                "scientificName": "Aphis gossypii",
                "commonNames": "Cotton Aphid",
                "treatmentSummary": "Encourage beneficial insects and use selective aphid management only when pressure persists.",
            },
        ]

    def _decode_json_image(self, json_payload: dict):
        if not json_payload or "image_base64" not in json_payload:
            return None

        raw_value = str(json_payload["image_base64"]).strip()
        mime_type = "image/jpeg"

        if raw_value.startswith("data:") and "," in raw_value:
            header, raw_value = raw_value.split(",", 1)
            if ";" in header:
                mime_type = header[5:].split(";")[0]

        try:
            image_bytes = base64.b64decode(raw_value, validate=True)
        except Exception as error:
            raise ServiceError(
                422,
                "Validation failed",
                "VALIDATION_ERROR",
                [{"field": "image_base64", "issue": f"Invalid base64 image: {error}"}],
            ) from error

        return image_bytes, mime_type

    def _extract_image(self, uploaded_file, json_payload: dict):
        if uploaded_file:
            mime_type = uploaded_file.mimetype or "application/octet-stream"
            image_bytes = uploaded_file.read()
            return image_bytes, mime_type

        decoded = self._decode_json_image(json_payload)
        if decoded:
            return decoded

        raise ServiceError(
            400,
            "Image file is required",
            "VALIDATION_ERROR",
            [{"field": "image", "issue": "Send multipart image or image_base64 JSON"}],
        )

    def _validate_image(self, image_bytes: bytes, mime_type: str) -> None:
        if mime_type not in self.allowed_mime_types:
            raise ServiceError(
                422,
                "Validation failed",
                "VALIDATION_ERROR",
                [{"field": "image", "issue": "Image must be JPEG, PNG, or WebP"}],
            )

        if not image_bytes:
            raise ServiceError(
                422,
                "Validation failed",
                "VALIDATION_ERROR",
                [{"field": "image", "issue": "Image is empty"}],
            )

        if len(image_bytes) > self.max_image_bytes:
            raise ServiceError(
                413,
                "Uploaded image exceeds the allowed size",
                "VALIDATION_ERROR",
                [{"field": "image", "issue": "Upload a smaller image"}],
            )

    @staticmethod
    def _safe_join(value) -> str:
        if isinstance(value, list) and value:
            return ", ".join(value)
        if isinstance(value, str) and value.strip():
            return value.strip()
        return "Unknown"

    @staticmethod
    def _safe_text(*values) -> str:
        for value in values:
            if isinstance(value, str) and value.strip():
                return value.strip()
        return "Treatment guidance unavailable."

    def _detect_mock(self, image_bytes: bytes) -> dict:
        image_hash = hashlib.sha256(image_bytes).hexdigest()
        mock_item = self.mock_catalog[int(image_hash[:8], 16) % len(self.mock_catalog)]
        confidence = 80 + ((int(image_hash[8:12], 16) % 150) / 10)

        return {
            "scientificName": mock_item["scientificName"],
            "confidencePercent": round(confidence, 1),
            "commonNames": mock_item["commonNames"],
            "treatmentSummary": mock_item["treatmentSummary"],
            "imageUrl": None,
            "provider": "mock",
        }

    def _detect_kindwise(self, image_bytes: bytes, mime_type: str) -> dict:
        if not self.provider_api_key:
            raise ServiceError(503, "Pest provider is not configured", "ML_SERVICE_UNAVAILABLE")

        payload = {
            "images": [f"data:{mime_type};base64,{base64.b64encode(image_bytes).decode('utf-8')}"],
            "similar_images": True,
            "datetime": datetime.now(timezone.utc).isoformat(),
        }

        try:
            response = requests.post(
                self.provider_url,
                headers={
                    "Api-Key": self.provider_api_key,
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=self.provider_timeout_ms / 1000,
            )
        except requests.Timeout as error:
            raise ServiceError(503, "Pest provider timed out", "ML_SERVICE_UNAVAILABLE") from error
        except requests.RequestException as error:
            raise ServiceError(503, "Pest provider unavailable", "ML_SERVICE_UNAVAILABLE") from error

        if response.status_code not in (200, 201):
            raise ServiceError(
                503,
                "Pest provider unavailable",
                "ML_SERVICE_UNAVAILABLE",
                [{"field": "provider", "issue": response.text[:240] or f"HTTP {response.status_code}"}],
            )

        payload_json = response.json()
        suggestion = payload_json.get("result", {}).get("classification", {}).get("suggestions", [{}])[0]
        details = suggestion.get("details", {})

        if not suggestion:
            raise ServiceError(503, "Pest provider returned an invalid response", "ML_SERVICE_UNAVAILABLE")

        return {
            "scientificName": suggestion.get("name", "Unknown"),
            "confidencePercent": round(float(suggestion.get("probability", 0)) * 100, 1),
            "commonNames": self._safe_join(details.get("common_names")),
            "treatmentSummary": self._safe_text(details.get("description_gpt"), details.get("description")),
            "imageUrl": details.get("image", {}).get("value")
            if isinstance(details.get("image"), dict)
            else details.get("image"),
            "provider": "kindwise",
        }

    def detect(self, uploaded_file=None, json_payload=None) -> dict:
        image_bytes, mime_type = self._extract_image(uploaded_file, json_payload)
        self._validate_image(image_bytes, mime_type)

        if self.provider_name == "kindwise":
            return self._detect_kindwise(image_bytes, mime_type)

        return self._detect_mock(image_bytes)
