# Day 02 Log

## Completed
- Created API contract document: `shared-docs/api-contract.md`
- Created DB schema and indexing document: `shared-docs/db-schema.md`
- Created response/error standard: `shared-docs/response-standard.md`
- Finalized feature-wise storage decisions for auth, crop, pest, plans, and optional chat/logs

## Ready for Day 3
- Scaffold Node project in `backend-node/`
- Implement middleware baseline:
  - CORS
  - helmet
  - rate-limit
  - morgan
  - centralized error handler
- Implement `/api/health`

## Open Decisions (to lock before coding auth)
- DB driver style:
  - Option A: Mongoose
  - Option B: Prisma + MongoDB
- Validation library:
  - Option A: Joi
  - Option B: Zod

