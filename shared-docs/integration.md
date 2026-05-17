# Node <-> ML Integration (Day 8)

## Services
- Node API local base: `http://localhost:4000`
- ML service local base: `http://localhost:5000`

## Integration Paths
- `POST /api/crop/recommend` -> `POST /ml/recommend`
- `POST /api/pest/detect` -> `POST /ml/pest-detect`

## Correlation IDs
- Node generates or reuses `X-Request-Id` for every incoming request
- The same request ID is forwarded from Node to `ml-service`
- Node responses include `meta.requestId`
- Node logs include request IDs for retries, fallback activation, and upstream calls

## Timeout and Retry Policy
- `ML_SERVICE_TIMEOUT_MS`: per-attempt timeout
- `ML_SERVICE_RETRY_COUNT`: number of retries after the initial attempt for retryable failures
- `ML_SERVICE_RETRY_DELAY_MS`: pause between retry attempts
- Retryable failures:
  - network errors
  - timeouts
  - upstream `5xx` responses

## Fallback Behavior
- Crop recommendation:
  - preferred path is `ml-service`
  - if `ml-service` is unavailable, Node falls back to the local rule-based recommender
  - response message changes to reflect fallback usage
- Pest detection:
  - preferred path is `ml-service`
  - if `ml-service` is unavailable, Node returns `503 ML_SERVICE_UNAVAILABLE`
  - error message is user-safe and advises retrying later

## Required Node Env
```env
ML_SERVICE_BASE_URL=http://127.0.0.1:5000
ML_SERVICE_CROP_PATH=/ml/recommend
ML_SERVICE_PEST_PATH=/ml/pest-detect
ML_SERVICE_TIMEOUT_MS=10000
ML_SERVICE_RETRY_COUNT=1
ML_SERVICE_RETRY_DELAY_MS=250
```
