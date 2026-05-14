import base64
import os
from datetime import datetime

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

API_URL = os.getenv(
    "PEST_PROVIDER_API_URL",
    "https://insect.kindwise.com/api/v1/identification"
    "?details=name,common_names,description_gpt,image",
)
API_KEY = os.getenv("PEST_PROVIDER_API_KEY", "")

app = Flask(__name__)
CORS(app)


def safe_join(value):
    """Safely join list or return string; fallback to 'N/A'."""
    if isinstance(value, list):
        return ", ".join(value)
    if isinstance(value, str):
        return value
    return "N/A"


def safe_image(value):
    """Extract image URL safely."""
    if isinstance(value, dict) and "value" in value:
        return value["value"]
    if isinstance(value, str):
        return value
    return None


@app.route("/")
def home():
    return jsonify({"message": "Flask Pest Detection API is running. Use POST /detect_pest"})


@app.route("/detect_pest", methods=["POST"])
def detect_pest():
    """
    POST /detect_pest
    Accepts: multipart/form-data or JSON with image
    Returns: pest identification result
    """
    try:
        if not API_KEY:
            return jsonify({
                "success": False,
                "error": "Pest provider API key is not configured"
            }), 503

        if "image" in request.files:
            image_file = request.files["image"]
            img_base64 = base64.b64encode(image_file.read()).decode("utf-8")
        elif request.is_json and "image_base64" in request.json:
            img_base64 = request.json["image_base64"]
        else:
            return jsonify({"error": "No image provided"}), 400

        payload = {
            "images": [f"data:image/jpeg;base64,{img_base64}"],
            "latitude": 15.3647,
            "longitude": 75.1240,
            "similar_images": True,
            "datetime": datetime.utcnow().isoformat(),
        }

        headers = {
            "Api-Key": API_KEY,
            "Content-Type": "application/json",
        }

        response = requests.post(API_URL, headers=headers, json=payload)

        if response.status_code not in (200, 201):
            return jsonify({
                "error": "Insect.id API request failed",
                "status_code": response.status_code,
                "message": response.text
            }), response.status_code

        data = response.json()
        suggestion = data["result"]["classification"]["suggestions"][0]
        details = suggestion.get("details", {})

        result = {
            "scientific_name": suggestion.get("name", "Unknown"),
            "confidence_percent": round(suggestion.get("probability", 0) * 100, 2),
            "common_names": safe_join(details.get("common_names")),
            "about": details.get("description_gpt", "No description available."),
            "image_url": safe_image(details.get("image")),
        }

        return jsonify({"success": True, "result": result}), 200

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
