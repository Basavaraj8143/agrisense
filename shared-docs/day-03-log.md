# Day 03 Log

## Completed
- Initialized Node project in `backend-node/` with `package.json` and lockfile.
- Installed Day 3 middleware stack:
  - `express`
  - `cors`
  - `helmet`
  - `express-rate-limit`
  - `morgan`
  - `dotenv`
  - `nodemon` (dev)
- Added app bootstrap and middleware wiring:
  - `backend-node/src/app.js`
  - `backend-node/src/server.js`
- Added centralized 404 and error handling middleware:
  - `backend-node/src/middlewares/error.middleware.js`
- Added health route:
  - `GET /api/health` in `backend-node/src/routes/health.routes.js`
- Added `.env.example` with baseline runtime configuration.
- Updated backend service README with run instructions.

## Verification Completed
- Node syntax checks passed:
  - `src/app.js`
  - `src/server.js`
  - `src/routes/health.routes.js`
  - `src/middlewares/error.middleware.js`
- Runtime smoke test passed:
  - Started backend on port `4000`
  - Called `GET http://127.0.0.1:4000/api/health`
  - Received success response with service/version/timestamp

## Notes
- Day 3 implementation was scoped to backend foundation only.
- Auth, DB connection, and feature routes are intentionally deferred to Day 4+.
- Existing Day 2 docs remain the source of truth for auth/profile/google/location/autofill contracts.

## Ready for Day 4
- Lock open implementation choices:
  - DB driver: `Mongoose` (locked)
  - Validation: `Joi` vs `Zod`
  - Token model: access only vs access + refresh
- Implement auth foundation:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/google`
  - `GET /api/auth/me`
- Add JWT middleware and password hashing.
- Add request validation and standardized auth error mapping.
