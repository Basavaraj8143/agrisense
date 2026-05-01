# Day 02 Log

## Completed
- Created API contract document: `shared-docs/api-contract.md`
- Created DB schema and indexing document: `shared-docs/db-schema.md`
- Created response/error standard: `shared-docs/response-standard.md`
- Finalized feature-wise storage decisions for auth, crop, pest, plans, and optional chat/logs

- Added profile management contract:
  - `GET /api/profile/me`
  - `PATCH /api/profile/me`
  - `PATCH /api/profile/password`
- Added Google Sign-In contract:
  - `POST /api/auth/google`
- Added account-linking safety rules (`AUTH_ACCOUNT_LINK_REQUIRED`)
- Added current production crop flow contract:
  - location mode support (`image_gps`, `manual_location`)
  - soil autofill endpoint and source/confidence tracking

## Ready for Day 3
- Scaffold Node project in `backend-node/`
- Implement middleware baseline:
  - CORS
  - helmet
  - rate-limit
  - morgan
  - centralized error handler
- Implement `/api/health`

## Decision Status (Updated)
- DB decision locked: `MongoDB + Mongoose`
- Validation library: pending final lock (`Joi` vs `Zod`)
- Token strategy: pending final lock (access-only vs access+refresh)
