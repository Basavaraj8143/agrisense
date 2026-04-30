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

### POST `/api/auth/google`
Purpose: sign in/up using Google ID token from frontend.

Request
```json
{
  "idToken": "google_id_token_from_client"
}
```

Success `200`
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Basava",
      "email": "basava@example.com",
      "avatarUrl": "https://...",
      "authProvider": "google"
    },
    "token": "jwt_token"
  }
}
```

Conflict `409` (email already exists as local account, no implicit link)
```json
{
  "success": false,
  "message": "Account exists with email/password. Link required.",
  "error": {
    "code": "AUTH_ACCOUNT_LINK_REQUIRED"
  }
}
```

## Profile

### GET `/api/profile/me`
Purpose: fetch complete user profile for settings/dashboard.

Headers:
- `Authorization: Bearer <jwt>`

Success `200`
```json
{
  "success": true,
  "message": "Profile fetched",
  "data": {
    "id": "user_id",
    "name": "Basava",
    "email": "basava@example.com",
    "avatarUrl": "https://...",
    "preferredLanguage": "en",
    "phone": "+91xxxxxxxxxx",
    "location": "Bagalkot",
    "farmSizeAcres": 4.5,
    "defaultSoilType": "black"
  }
}
```

### PATCH `/api/profile/me`
Purpose: update editable profile fields.

Headers:
- `Authorization: Bearer <jwt>`

Request
```json
{
  "name": "Basava R",
  "preferredLanguage": "kn",
  "phone": "+91xxxxxxxxxx",
  "location": "Jamkhandi",
  "farmSizeAcres": 5.0,
  "defaultSoilType": "alluvial"
}
```

Success `200`
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "id": "user_id",
    "name": "Basava R",
    "preferredLanguage": "kn"
  }
}
```

### PATCH `/api/profile/password`
Purpose: change password for local users.

Headers:
- `Authorization: Bearer <jwt>`

Request
```json
{
  "currentPassword": "OldStrongPass@123",
  "newPassword": "NewStrongPass@123"
}
```

Success `200`
```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": {}
}
```

Forbidden `403` for Google-only account:
```json
{
  "success": false,
  "message": "Password change is not available for Google-only accounts",
  "error": {
    "code": "AUTH_PASSWORD_NOT_APPLICABLE"
  }
}
```

## Crop Recommendation

### POST `/api/location/resolve`
Purpose: resolve location from either uploaded GPS-tagged image flow or manual coordinates.

Headers:
- `Authorization: Bearer <jwt>`

Request (image/ocr/gps resolved on client, then posted)
```json
{
  "mode": "image_gps",
  "lat": 16.154062,
  "lng": 75.658530,
  "district": "Bagalkot",
  "taluk": "Bagalakote taluk"
}
```

Request (manual location mode)
```json
{
  "mode": "manual_location",
  "district": "Bagalkot",
  "taluk": "Jamkhandi"
}
```

Success `200`
```json
{
  "success": true,
  "message": "Location resolved",
  "data": {
    "mode": "image_gps",
    "lat": 16.154062,
    "lng": 75.65853,
    "district": "Bagalkot",
    "taluk": "Bagalakote taluk"
  }
}
```

### GET `/api/soil-profile?district={district}&taluk={taluk}`
Purpose: auto-fill regional NPK and pH defaults.

Headers:
- `Authorization: Bearer <jwt>`

Success `200`
```json
{
  "success": true,
  "message": "Soil profile fetched",
  "data": {
    "N": 130,
    "P": 45,
    "K": 170,
    "ph": 7,
    "source": "district_average",
    "confidence": "medium"
  }
}
```

### POST `/api/crop/recommend`
Purpose: validate user inputs, call ML service, store query, return recommendation.

Headers:
- `Authorization: Bearer <jwt>`

Request
```json
{
  "location": {
    "mode": "image_gps",
    "lat": 16.154062,
    "lng": 75.658530,
    "district": "Bagalkot",
    "taluk": "Bagalakote taluk"
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
      "latencyMs": 421,
      "autofillUsed": true
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

## Auth/Account Security Rules
- Never trust Google profile data without verifying `idToken` server-side.
- Verify token audience against your Google client ID.
- Do not auto-link local and Google accounts with same email silently.
- Return `409 AUTH_ACCOUNT_LINK_REQUIRED` and add explicit linking flow later.
- Do not return `passwordHash` in any response.
