# API Response and Error Standard (Day 2)

## Goals
- Keep responses predictable
- Make frontend integration simple
- Make debugging easier with request IDs

## Success Response Shape
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {},
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-04-30T10:00:00.000Z"
  }
}
```

Rules:
- `success` must always be boolean.
- `message` should be concise and user-safe.
- `data` contains endpoint payload.
- `meta.requestId` should be logged server-side for tracing.

## Error Response Shape
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "issue": "Invalid email format"
      }
    ]
  },
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-04-30T10:00:00.000Z"
  }
}
```

Rules:
- Never expose stack traces in production responses.
- Use stable `error.code` values.
- Keep `details` useful for frontend forms.

## HTTP Status Code Mapping
- `200` OK -> read and successful operations
- `201` Created -> resource created (register, plan create)
- `400` Bad Request -> malformed input
- `401` Unauthorized -> no/invalid token
- `403` Forbidden -> token valid but no permission
- `404` Not Found -> resource missing
- `409` Conflict -> duplicate email, state conflict
- `422` Unprocessable Entity -> validation errors
- `429` Too Many Requests -> rate limit
- `500` Internal Server Error -> unexpected backend issue
- `503` Service Unavailable -> ML service/provider unavailable

## Standard Error Codes
- `VALIDATION_ERROR`
- `AUTH_REQUIRED`
- `AUTH_INVALID_TOKEN`
- `AUTH_FORBIDDEN`
- `RESOURCE_NOT_FOUND`
- `CONFLICT_DUPLICATE`
- `RATE_LIMITED`
- `ML_SERVICE_UNAVAILABLE`
- `INTERNAL_ERROR`

## Endpoint-Specific Notes
- `/api/auth/*`: never return password hash.
- `/api/crop/recommend`: include inference metadata (`source`, `latencyMs`) in `data.meta`.
- `/api/pest/detect`: include safe confidence summary; do not return raw vendor secrets.

## Logging Linkage
- Generate `requestId` per request (middleware).
- Include `requestId` in API response and server logs.
- Log shape:
  - `requestId`, `userId`, `route`, `statusCode`, `durationMs`

