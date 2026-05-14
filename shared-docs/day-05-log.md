# Day 05 Log

## Completed
- Added protected crop recommendation endpoint: `POST /api/crop/recommend`
- Added request validation for location, soil type, season, NPK, pH, and autofill metadata
- Added crop query persistence with MongoDB model and indexes
- Added local rule-based recommendation service for Day 5 so the Node layer returns stable normalized output before ML-service integration on Day 8
- Reused shared DB availability guard for auth and crop flows

## Files Added/Updated
- `backend-node/src/controllers/crop.controller.js`
- `backend-node/src/routes/crop.routes.js`
- `backend-node/src/services/crop-recommendation.service.js`
- `backend-node/src/validators/crop.validators.js`
- `backend-node/src/models/crop-query.model.js`
- `backend-node/src/utils/ensure-db-connected.js`
- `backend-node/src/controllers/auth.controller.js`
- `backend-node/src/app.js`

## Verification Completed
- Node syntax check passed for backend source files
- Recommendation service smoke check passed with Day 5 sample payload:
  - primary crop: `Cotton`
  - alternatives: `Maize`, `Groundnut`, `Sugarcane`

## Notes
- `data.meta.source` currently returns `node-rules` to reflect the temporary Day 5 inference path honestly.
- Legacy frontend aliases like `rubi`, `overlapped`, `other`, and `clayey` are normalized by the validator to reduce integration friction.
- Successful recommendation requests are stored in `crop_queries` with input, result summary, latency, and request ID.

## Ready for Day 6
- Add `POST /api/pest/detect` with upload middleware
- Introduce pest inference service abstraction
- Persist pest query summaries with provider metadata
limit reached!