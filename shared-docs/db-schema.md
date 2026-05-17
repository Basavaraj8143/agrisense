# DB Schema

## Database Choice
- Active database: **PostgreSQL**
- Node ORM: **Prisma**
- Reason: stronger relational integrity for auth/history/dashboard data while still supporting semi-structured ML payloads via `JSONB`

## Tables

## 1) `users`
Purpose: authentication and profile.

Fields:
- `id` (UUID primary key)
- `name` (text, required)
- `email` (text, required, unique)
- `password_hash` (text, nullable for Google-only users)
- `auth_provider` (enum: `local|google|hybrid`, default `local`)
- `google_id` (text, nullable, unique)
- `avatar_url` (text, nullable)
- `email_verified` (boolean, default `false`)
- `role` (enum: `user|admin`, default `user`)
- `preferred_language` (enum: `en|hi|kn`, default `en`)
- `phone` (text, nullable)
- `location` (text, nullable)
- `farm_size_acres` (numeric, nullable)
- `default_soil_type` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

Indexes:
- unique: `email`
- unique: `google_id`
- optional: `created_at`

Notes:
- `auth_provider=local`: `password_hash` required.
- `auth_provider=google`: `google_id` required.
- `auth_provider=hybrid`: both local + Google linked to same user.

## 2) `crop_queries`
Purpose: store recommendation requests and output summary.

Fields:
- `id` (UUID primary key)
- `user_id` (UUID foreign key -> `users.id`)
- `input` (`JSONB`, required)
- `result` (`JSONB`, required)
- `meta` (`JSONB`, required)
- `created_at` (timestamp)
- `updated_at` (timestamp)

Expected JSON structure:
- `input`
  - `location`
  - `soilType`
  - `season`
  - `n`
  - `p`
  - `k`
  - `ph`
  - `autofill`
- `result`
  - `primaryCrop`
  - `alternatives`
- `meta`
  - `source`
  - `latencyMs`
  - `requestId`

Indexes:
- compound: `user_id + created_at(desc)`
- optional expression indexes for analytics on `input->location->district` and `input->season`

## 3) `pest_queries`
Purpose: store pest image analysis summary.

Fields:
- `id` (UUID primary key)
- `user_id` (UUID foreign key -> `users.id`)
- `image_url` (text, nullable)
- `image_hash` (text, nullable)
- `result` (`JSONB`, required)
- `provider` (`JSONB`, required)
- `meta` (`JSONB`, required)
- `created_at` (timestamp)
- `updated_at` (timestamp)

Expected JSON structure:
- `result`
  - `scientificName`
  - `confidencePercent`
  - `commonNames`
  - `treatmentSummary`
- `provider`
  - `name`
  - `providerResponseId`
- `meta`
  - `source`
  - `latencyMs`
  - `requestId`

Indexes:
- compound: `user_id + created_at(desc)`
- optional: `image_hash`

## 4) `saved_plans` (future)
Purpose: user dashboard crop plan tracker.

Suggested fields:
- `id` (UUID primary key)
- `user_id` (UUID foreign key)
- `crop_name`
- `status` (`planned|planted|harvested`)
- `district`
- `season`
- `notes`
- `target_date`
- `created_at`
- `updated_at`

## 5) `chat_sessions` and `chat_messages` (optional future)
Suggested for later phases if chat persistence is needed.

## What Not To Store
- Plain text passwords
- Hardcoded API keys
- Raw large binary images in PostgreSQL
- Full third-party response blobs unless needed

## Account Linking Rules
- If a local account exists and Google login comes with same email, do not auto-merge.
- Require explicit account linking verification flow (future endpoint).
- Track provider state via `auth_provider` and presence of `google_id`.

## Data Retention Guidance
- `api_logs`: 7-14 days if added later
- query tables: retain for user history and analytics
- store uploaded images in object storage, not the relational database
