from utils.http import ServiceError

SUPPORTED_SEASONS = {"kharif", "rabi", "zaid", "whole_year"}
SUPPORTED_SOIL_TYPES = {
    "alluvial",
    "black",
    "clay",
    "laterite",
    "loamy",
    "mixed",
    "red",
    "sandy",
    "silty",
}
SOIL_ALIASES = {
    "black cotton": "black",
    "black_cotton": "black",
    "clayey": "clay",
    "other": "mixed",
}
SEASON_ALIASES = {
    "summer": "zaid",
    "rubi": "rabi",
    "overlapped": "whole_year",
}
AUTOFILL_SOURCES = {"taluk_average", "district_average", "default_fallback", "manual"}


def _fail(details):
    raise ServiceError(422, "Validation failed", "VALIDATION_ERROR", details)


def _require_object(value, field_name: str) -> dict:
    if not isinstance(value, dict):
        _fail([{"field": field_name, "issue": "Expected an object"}])
    return value


def _normalize_string(value, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        _fail([{"field": field_name, "issue": "This field is required"}])
    return value.strip().lower()


def _normalize_number(value, field_name: str, minimum: float, maximum: float) -> float:
    if not isinstance(value, (int, float)):
        _fail([{"field": field_name, "issue": "Expected a number"}])

    numeric_value = float(value)
    if numeric_value < minimum or numeric_value > maximum:
        _fail([{"field": field_name, "issue": f"Must be between {minimum} and {maximum}"}])

    return numeric_value


def validate_crop_request(payload: dict) -> dict:
    if not isinstance(payload, dict):
        _fail([{"field": "body", "issue": "Expected a JSON object"}])

    location = _require_object(payload.get("location"), "location")
    mode = _normalize_string(location.get("mode"), "location.mode")
    if mode not in {"image_gps", "manual_location"}:
        _fail([{"field": "location.mode", "issue": "Must be image_gps or manual_location"}])

    normalized_location = {
        "mode": mode,
        "district": _normalize_string(location.get("district"), "location.district"),
        "taluk": _normalize_string(location.get("taluk") or location.get("taluq"), "location.taluk"),
    }

    if mode == "image_gps":
        normalized_location["lat"] = _normalize_number(location.get("lat"), "location.lat", -90, 90)
        normalized_location["lng"] = _normalize_number(location.get("lng"), "location.lng", -180, 180)
    else:
        normalized_location["lat"] = None
        normalized_location["lng"] = None

    soil_type = SOIL_ALIASES.get(_normalize_string(payload.get("soilType"), "soilType"), None) or _normalize_string(
        payload.get("soilType"), "soilType"
    )
    if soil_type not in SUPPORTED_SOIL_TYPES:
        _fail([{"field": "soilType", "issue": "Unsupported soil type"}])

    season = SEASON_ALIASES.get(_normalize_string(payload.get("season"), "season"), None) or _normalize_string(
        payload.get("season"), "season"
    )
    if season not in SUPPORTED_SEASONS:
        _fail([{"field": "season", "issue": "Unsupported season"}])

    normalized_payload = {
        "location": normalized_location,
        "soilType": soil_type,
        "season": season,
        "n": _normalize_number(payload.get("n"), "n", 0, 300),
        "p": _normalize_number(payload.get("p"), "p", 0, 300),
        "k": _normalize_number(payload.get("k"), "k", 0, 300),
        "ph": _normalize_number(payload.get("ph"), "ph", 0, 14),
    }

    if "autofill" in payload:
        autofill = _require_object(payload.get("autofill"), "autofill")
        source = _normalize_string(autofill.get("source"), "autofill.source")
        if source not in AUTOFILL_SOURCES:
            _fail([{"field": "autofill.source", "issue": "Unsupported autofill source"}])
        if not isinstance(autofill.get("used"), bool):
            _fail([{"field": "autofill.used", "issue": "Expected a boolean"}])

        normalized_payload["autofill"] = {
            "used": autofill["used"],
            "source": source,
        }

    return normalized_payload
