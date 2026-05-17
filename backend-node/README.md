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

## Day 6 pest detection
- Protected pest detection endpoint: `POST /api/pest/detect`
- Multipart image upload handling with in-memory validation
- Configurable pest provider abstraction:
  - `mock`
  - `kindwise`
  - `ml-service`
- Pest query persistence with provider metadata and image hash logging

## Day 8 ml-service wiring
- Crop and pest flows call `ml-service` over HTTP
- Shared request IDs are forwarded with `X-Request-Id`
- Retry and timeout behavior is configurable through environment variables
- Crop recommendations fall back to Node rule logic if `ml-service` is unavailable
- Pest detection returns a graceful `503` message if `ml-service` cannot be reached

## Database
- Primary database: PostgreSQL
- ORM: Prisma
- Schema source: `prisma/schema.prisma`

## Run locally
```bash
npm install
npx prisma migrate dev --name init_postgres
npm run prisma:generate
npm run dev
```

Server starts on `http://localhost:4000` by default.

For full auth flow, set `.env` values from `.env.example`, ensure PostgreSQL is reachable, and use a valid `DATABASE_URL`.
