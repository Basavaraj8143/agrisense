# API Contract (Day 2)

## Base
- Base URL (local): `http://localhost:4000`
- Prefix: `/api`
- Content-Type: `application/json` unless file upload endpoint
- Auth: `Authorization: Bearer <jwt>`

## Health

### GET `/api/health`
Purpose: service uptime and version check.

Success `200`
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "service": "backend-node",
    "version": "1.0.0",
    "timestamp": "2026-04-30T10:00:00.000Z"
  }
}
```

## Auth

### POST `/api/auth/register`
Purpose: create a new user account.

Request
```json
{
  "name": "Basava",
  "email": "basava@example.com",
  "password": "StrongPass@123",
  "preferredLanguage": "en"
}
```

Success `201`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Basava",
      "email": "basava@example.com",
      "preferredLanguage": "en"
    },
    "token": "jwt_token"
  }
}
```

### POST `/api/auth/login`
Purpose: authenticate user and issue JWT.

Request
```json
{
  "email": "basava@example.com",
  "password": "StrongPass@123"
}
```

Success `200`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Basava",
      "email": "basava@example.com"
    },
    "token": "jwt_token"
  }
}
```

### GET `/api/auth/me`
Purpose: fetch current authenticated user profile.

Headers:
- `Authorization: Bearer <jwt>`

Success `200`
```json
{
  "success": true,
  "message": "Current user fetched",
  "data": {
    "id": "user_id",
    "name": "Basava",
    "email": "basava@example.com",
    "preferredLanguage": "en"
  }
}
```

## Crop Recommendation

### POST `/api/crop/recommend`
Purpose: validate user inputs, call ML service, store query, return recommendation.

Headers:
- `Authorization: Bearer <jwt>`

Request
```json
{
  "district": "Bagalkot",
  "taluk": "Jamkhandi",
  "soilType": "black",
  "season": "kharif",
  "n": 120,
  "p": 45,
  "k": 160,
  "ph": 6.8
}
```

Success `200`
```json
{
  "success": true,
  "message": "Recommendation generated",
  "data": {
    "queryId": "crop_query_id",
    "primaryCrop": {
      "name": "Cotton",
      "score": 0.86,
      "yieldData": "18 quintals/acre",
      "marketPrice": "₹6,500/qtl"
    },
    "alternatives": [
      {
        "name": "Groundnut",
        "score": 0.78
      }
    ],
    "meta": {
      "source": "ml-service",
      "latencyMs": 421
    }
  }
}
```

## Pest Detection

### POST `/api/pest/detect`
Purpose: upload pest image, call inference provider/ML service, store summary.

Headers:
- `Authorization: Bearer <jwt>`
- `Content-Type: multipart/form-data`

Form Data:
- `image`: file

Success `200`
```json
{
  "success": true,
  "message": "Pest analysis completed",
  "data": {
    "queryId": "pest_query_id",
    "scientificName": "Spodoptera frugiperda",
    "confidencePercent": 91.4,
    "commonNames": "Fall Armyworm",
    "treatmentSummary": "Use pheromone traps and targeted control in early stage.",
    "meta": {
      "source": "ml-service",
      "latencyMs": 689
    }
  }
}
```

## Future Dashboard APIs (Phase 4/5)
- `GET /api/crop/history`
- `GET /api/pest/history`
- `POST /api/plans`
- `PATCH /api/plans/:id`
- `DELETE /api/plans/:id`

