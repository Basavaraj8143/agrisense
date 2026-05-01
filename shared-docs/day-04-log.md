# Day 04 Log

## Completed
- Implemented register/login flow with password hashing (`bcryptjs`).
- Added JWT token generation utility.
- Implemented auth middleware for bearer token verification.
- Added protected route `GET /api/auth/me`.
- Added payload validation for auth requests using `zod`.
- Added MongoDB connection bootstrap via Mongoose.

## Files Added/Updated
- `backend-node/src/controllers/auth.controller.js`
- `backend-node/src/routes/auth.routes.js`
- `backend-node/src/middlewares/auth.middleware.js`
- `backend-node/src/middlewares/validate.middleware.js`
- `backend-node/src/validators/auth.validators.js`
- `backend-node/src/models/user.model.js`
- `backend-node/src/utils/token.js`
- `backend-node/src/utils/http-error.js`
- `backend-node/src/db/connect.js`
- `backend-node/src/app.js`
- `backend-node/src/server.js`
- `backend-node/.env.example`

## Verification Completed
- Syntax checks passed for all Day 4 auth files.
- Runtime smoke check:
  - `GET /api/health` returns success.
  - `POST /api/auth/register` returns `503 SERVICE_UNAVAILABLE` when DB is unreachable.

## Notes
- Auth endpoints are fully wired and ready.
- To complete register/login success path, run MongoDB or set a reachable `MONGO_URI`.
- Current behavior intentionally degrades gracefully if DB is down.

## Ready for Day 5
- Start crop recommendation Node endpoint (`POST /api/crop/recommend`).
- Persist crop query request + response summary in `crop_queries`.
- Keep response contract aligned with `shared-docs/api-contract.md`.
