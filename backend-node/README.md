# backend-node

Node/Express main backend service for AgriSense rebuild.

## Day 3 baseline
- Express app with security and utility middleware
- Global rate limiting
- Centralized 404 and error middleware
- Health endpoint: `GET /api/health`

## Day 4 auth and security
- Register/login with `bcryptjs` password hashing
- JWT generation with protected route middleware
- Auth endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (protected)
- Payload validation using `zod`

## Run locally
```bash
npm install
npm run dev
```

Server starts on `http://localhost:4000` by default.

For full auth flow, set `.env` values from `.env.example` and ensure MongoDB is reachable.
