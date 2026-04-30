# DB Schema (Day 2)

## Database Choice
- Primary recommendation for MVP: **MongoDB**
- Reason: faster iteration for semi-structured ML response payloads

## Collections

## 1) `users`
Purpose: authentication and profile.

Fields:
- `_id` (ObjectId)
- `name` (string, required)
- `email` (string, required, unique, lowercase)
- `passwordHash` (string, nullable for Google-only users)
- `authProvider` (string, enum: `local|google|hybrid`, default `local`)
- `googleId` (string, nullable)
- `avatarUrl` (string, nullable)
- `emailVerified` (boolean, default `false`)
- `role` (string, enum: `user|admin`, default `user`)
- `preferredLanguage` (string, enum: `en|hi|kn`, default `en`)
- `phone` (string, nullable)
- `location` (string, nullable)
- `farmSizeAcres` (number, nullable)
- `defaultSoilType` (string, nullable)
- `createdAt` (date)
- `updatedAt` (date)

Indexes:
- unique: `email`
- sparse unique: `googleId`
- standard: `createdAt` (optional)

Notes:
- `authProvider=local`: `passwordHash` required.
- `authProvider=google`: `googleId` required.
- `authProvider=hybrid`: both local + Google linked to same user.

## 2) `crop_queries`
Purpose: store recommendation requests and output summary.

Fields:
- `_id`
- `userId` (ObjectId, ref `users`, required)
- `input` (object):
  - `location` (object):
    - `mode` (string enum: `image_gps|manual_location`)
    - `lat` (number, nullable)
    - `lng` (number, nullable)
    - `district` (string)
    - `taluk` (string)
  - `soilType` (string)
  - `season` (string)
  - `n` (number)
  - `p` (number)
  - `k` (number)
  - `ph` (number)
  - `autofill` (object):
    - `used` (boolean)
    - `source` (string enum: `taluk_average|district_average|default_fallback|manual`)
- `result` (object):
  - `primaryCrop` (object)
  - `alternatives` (array)
- `meta` (object):
  - `source` (string, example `ml-service`)
  - `latencyMs` (number)
  - `requestId` (string)
- `createdAt`
- `updatedAt`

Indexes:
- compound: `userId + createdAt(desc)`
- optional: `input.location.district + input.season`
- optional geo/analytics: `input.location.lat + input.location.lng`

## 3) `pest_queries`
Purpose: store pest image analysis summary.

Fields:
- `_id`
- `userId` (ObjectId, ref `users`, required)
- `imageUrl` (string, file location/object storage key)
- `imageHash` (string, optional dedupe)
- `result` (object):
  - `scientificName` (string)
  - `confidencePercent` (number)
  - `commonNames` (string)
  - `treatmentSummary` (string)
- `provider` (object):
  - `name` (string)
  - `providerResponseId` (string)
- `meta` (object):
  - `source` (string)
  - `latencyMs` (number)
  - `requestId` (string)
- `createdAt`
- `updatedAt`

Indexes:
- compound: `userId + createdAt(desc)`
- optional: `imageHash`

## 4) `saved_plans`
Purpose: user dashboard crop plan tracker.

Fields:
- `_id`
- `userId` (ObjectId, ref `users`, required)
- `cropName` (string, required)
- `status` (string enum: `planned|planted|harvested`, default `planned`)
- `district` (string, optional)
- `season` (string, optional)
- `notes` (string, optional)
- `targetDate` (date, optional)
- `createdAt`
- `updatedAt`

Indexes:
- compound: `userId + status`
- compound: `userId + createdAt(desc)`

## 5) `chat_sessions` (optional Phase 4)
Fields:
- `_id`
- `userId` (ObjectId, ref `users`)
- `title` (string)
- `createdAt`
- `updatedAt`

Indexes:
- compound: `userId + createdAt(desc)`

## 6) `chat_messages` (optional Phase 4)
Fields:
- `_id`
- `sessionId` (ObjectId, ref `chat_sessions`)
- `role` (string enum: `user|assistant|system`)
- `content` (string)
- `createdAt`

Indexes:
- compound: `sessionId + createdAt`

## 7) `api_logs` (optional)
Purpose: short-retention observability.

Fields:
- `_id`
- `requestId` (string)
- `userId` (ObjectId, nullable)
- `route` (string)
- `method` (string)
- `statusCode` (number)
- `durationMs` (number)
- `createdAt` (date)

Indexes:
- `createdAt`
- optional TTL index (7-14 days)

## What Not To Store
- Plain text passwords
- Hardcoded API keys
- Raw large binary images in MongoDB
- Full third-party response blobs unless needed

## Account Linking Rules
- If a local account exists and Google login comes with same email, do not auto-merge.
- Require explicit account linking verification flow (future endpoint).
- Track provider state via `authProvider` and presence of `googleId`.

## Data Retention Guidance
- `api_logs`: 7-14 days
- `chat_messages`: cap by count (example 50 latest per session) or archive
- query collections: retain for user history and analytics
