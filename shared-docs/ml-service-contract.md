# ML Service Contract (Day 7)

## Base
- Base URL (local): `http://localhost:5000`
- Prefix: `/ml`

## GET `/ml/health`
Purpose: service readiness and capability check.

Success `200`
```json
{
  "success": true,
  "message": "ML service is healthy",
  "data": {
    "service": "ml-service",
    "version": "1.0.0",
    "timestamp": "2026-05-15T08:00:00.000000+00:00",
    "capabilities": {
      "cropRecommendation": true,
      "pestDetection": true
    },
    "providers": {
      "crop": "crop-model",
      "pest": "mock"
    }
  },
  "meta": {
    "requestId": "mlhealth_xxx",
    "timestamp": "2026-05-15T08:00:00.000000+00:00"
  }
}
```

## POST `/ml/recommend`
Purpose: generate crop recommendations from validated agronomy inputs.

Request
```json
{
  "location": {
    "mode": "manual_location",
    "district": "Bagalkot",
    "taluk": "Bagalkot"
  },
  "soilType": "black",
  "season": "kharif",
  "n": 120,
  "p": 45,
  "k": 160,
  "ph": 6.8,
  "autofill": {
    "used": true,
    "source": "district_average"
  }
}
```

Success `200`
```json
{
  "success": true,
  "message": "Recommendation generated",
  "data": {
    "result": {
      "primaryCrop": {
        "name": "Cotton",
        "score": 0.86,
        "yieldData": "18.0 quintals/acre",
        "marketPrice": "Rs 6,500/qtl"
      },
      "alternatives": [
        {
          "name": "Groundnut",
          "score": 0.79,
          "yieldData": "9.0 quintals/acre",
          "marketPrice": "Rs 5,800/qtl"
        }
      ],
      "meta": {
        "source": "crop-model",
        "modelPath": "crop_recommender.pkl",
        "regionMatchFound": true
      }
    }
  },
  "meta": {
    "requestId": "mlcrop_xxx",
    "timestamp": "2026-05-15T08:00:00.000000+00:00"
  }
}
```

Validation/Error:
- `400` when request body is missing or malformed JSON
- `422` for invalid field values
- `503` when model assets are unavailable

## POST `/ml/pest-detect`
Purpose: analyze a pest image and return normalized detection output.

Input modes:
- `multipart/form-data` with `image`
- JSON with `image_base64`

Success `200`
```json
{
  "success": true,
  "message": "Pest analysis completed",
  "data": {
    "result": {
      "scientificName": "Spodoptera frugiperda",
      "confidencePercent": 91.4,
      "commonNames": "Fall Armyworm",
      "treatmentSummary": "Use pheromone traps and targeted control in the early larval stage.",
      "imageUrl": null,
      "provider": "mock"
    }
  },
  "meta": {
    "requestId": "mlpest_xxx",
    "timestamp": "2026-05-15T08:00:00.000000+00:00"
  }
}
```

Validation/Error:
- `400` when no image is supplied
- `413` when image exceeds configured size
- `422` for invalid MIME type or bad base64 input
- `503` when external pest provider is unavailable or times out
