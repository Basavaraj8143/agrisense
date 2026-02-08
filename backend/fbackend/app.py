from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
from datetime import datetime

# ============================
# CONFIGURATION
# ============================
API_URL = (
    "https://insect.kindwise.com/api/v1/identification"
    "?details=name,common_names,description_gpt,image"
)
API_KEY = "ajFP2K6KvBMeRxzreXU0Mcm2uffebYcveGs9W0shzuDE9JzzNv"  # 🔑 Replace this with your real Insect.id API key

app = Flask(__name__)
CORS(app)  # ✅ Enables cross-origin access from browser frontends

# ============================
# HELPER FUNCTIONS
# ============================
def safe_join(value):
    """Safely join list or return string; fallback to 'N/A'."""
    if isinstance(value, list):
        return ", ".join(value)
    elif isinstance(value, str):
        return value
    else:
        return "N/A"


def safe_image(value):
    """Extract image URL safely."""
    if isinstance(value, dict) and "value" in value:
        return value["value"]
    elif isinstance(value, str):
        return value
    else:
        return None


# ============================
# ROUTES
# ============================

@app.route("/")
def home():
    return jsonify({"message": "✅ Flask Pest Detection API is running! Use POST /detect_pest"})


@app.route("/detect_pest", methods=["POST"])
def detect_pest():
    """
    POST /detect_pest
    Accepts: multipart/form-data or JSON with image
    Returns: pest identification result
    """
    try:
        # === 1️⃣ Get image ===
        if "image" in request.files:
            image_file = request.files["image"]
            img_base64 = base64.b64encode(image_file.read()).decode("utf-8")
        elif request.is_json and "image_base64" in request.json:
            img_base64 = request.json["image_base64"]
        else:
            return jsonify({"error": "No image provided"}), 400

        # === 2️⃣ Prepare payload ===
        payload = {
            "images": [f"data:image/jpeg;base64,{img_base64}"],
            "latitude": 15.3647,
            "longitude": 75.1240,
            "similar_images": True,
            "datetime": datetime.utcnow().isoformat()
        }

        headers = {
            "Api-Key": API_KEY,
            "Content-Type": "application/json"
        }

        # === 3️⃣ Call Insect.id API ===
        response = requests.post(API_URL, headers=headers, json=payload)

        if response.status_code not in (200, 201):
            return jsonify({
                "error": "Insect.id API request failed",
                "status_code": response.status_code,
                "message": response.text
            }), response.status_code

        data = response.json()

        # === 4️⃣ Parse top result ===
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

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================
# MAIN ENTRY POINT
# ============================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
