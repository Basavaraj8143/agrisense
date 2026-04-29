# Architecture Draft

## Services
- frontend (React, migration target)
- backend-node (Express main API)
- ml-service (Python inference)

## Communication
- Frontend -> Node API over HTTPS JSON
- Node API -> ML service over internal HTTP JSON

## Initial Core APIs
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/crop/recommend
- POST /api/pest/detect
- GET /api/health

