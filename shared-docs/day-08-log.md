# Day 08 Log

## Completed
- Rewired Node crop recommendation flow to call `ml-service` over HTTP
- Rewired Node pest detection flow to call `ml-service` over HTTP
- Added shared request context middleware with `X-Request-Id` propagation
- Added ML service client with timeout, retry, and upstream error mapping
- Added crop fallback to Node rule-based recommendations when `ml-service` is unavailable
- Added graceful pest outage messaging for `ml-service` downtime
- Added Node/ML integration documentation

## Files Added/Updated
- `backend-node/src/middlewares/request-context.middleware.js`
- `backend-node/src/utils/logger.js`
- `backend-node/src/utils/ml-service-client.js`
- `backend-node/src/controllers/crop.controller.js`
- `backend-node/src/services/crop-recommendation.service.js`
- `backend-node/src/controllers/pest.controller.js`
- `backend-node/src/services/pest-inference.service.js`
- `backend-node/src/app.js`
- `backend-node/src/middlewares/error.middleware.js`
- `backend-node/.env.example`
- `backend-node/README.md`
- `shared-docs/integration.md`

## Verification Completed
- Node syntax check passed for backend source files
- HTTP integration smoke checks passed against a local stub ML server for:
  - crop success path
  - crop fallback path
  - pest success path

## Notes
- Crop fallback continues to use the Day 5 rule-based recommender so the endpoint remains available during ML outages
- Pest detection intentionally does not silently fall back to a different provider at the Node layer in Day 8
- The `ml-service` contract remains the source of truth for upstream request/response shapes

## Ready for Day 9
- Initialize the React app foundation
- Add routing, app shell, and shared API client setup
