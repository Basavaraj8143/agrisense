# AgriSense Core Plan (10-15 Days)

## Objective
Rebuild AgriSense into a production-ready portfolio project with:
- Node.js/Express as the main backend
- React as the frontend
- Python retained as a separate ML microservice
- Clean architecture, strong API design, auth, validation, logging, and deployment

This plan is intentionally backend-career focused and interview-ready.

## Target Architecture
- `frontend/` -> React app (Vite + Tailwind or CSS modules)
- `backend-node/` -> Express API (main service)
- `ml-service/` -> Flask/FastAPI microservice for crop recommendation and pest logic
- `shared-docs/` -> API contracts, architecture notes, runbooks

Flow:
1. React calls Node API
2. Node handles auth, validation, business rules, persistence
3. Node calls Python ML service over HTTP where ML inference is needed
4. Node returns clean JSON responses to frontend

## Non-Negotiable Standards
- Environment secrets only in `.env` (never hardcoded)
- Centralized error handler in Node
- Input validation on every write endpoint
- JWT auth with protected routes
- Consistent API response format
- Basic logs (Morgan) + app logs (Winston/Pino)
- README with setup, architecture, and API list

## 14-Day Execution Plan

## Phase 1: Foundation and Design (Day 1-2)

### Day 1 - Project reset and baseline
Tasks:
- Freeze current code in a `legacy` branch for reference.
- Create new working branch for rebuild.
- Create clean folders: `frontend`, `backend-node`, `ml-service`, `docs`.
- Define final tech choices:
  - Node: Express + JWT + bcrypt + Joi/Zod + Mongoose/Prisma
  - DB: MongoDB (faster for MVP) or PostgreSQL (stronger relational story)
  - Frontend: React + Vite

Deliverables:
- New folder structure committed
- Updated root README with high-level roadmap
- No hardcoded secrets in repository

### Day 2 - API and DB design
Tasks:
- Define entities: `User`, `CropQuery`, `PestQuery`, optional `SavedPlan`.
- Draft API endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/crop/recommend`
  - `POST /api/pest/detect`
  - `GET /api/health`
- Define response/error schema.
- Write DB schema and indexing plan.

Deliverables:
- `docs/api-contract.md`
- `docs/db-schema.md`
- `docs/architecture.md`

---

## Phase 2: Backend Core (Day 3-6)

### Day 3 - Express core setup
Tasks:
- Initialize Node project (`backend-node/package.json`).
- Setup folder architecture:
  - `src/routes`
  - `src/controllers`
  - `src/services`
  - `src/middlewares`
  - `src/models`
  - `src/utils`
- Add CORS, JSON parser, helmet, rate limit, morgan.
- Add centralized error middleware.

Deliverables:
- Running server with `/api/health`
- Shared error format in place

### Day 4 - Auth and security
Tasks:
- Implement register/login with bcrypt password hashing.
- Add JWT generation and auth middleware.
- Add protected route (`GET /api/auth/me`).
- Add validation for auth payloads.

Deliverables:
- Working auth flow with testable endpoints
- Token-based protected routes working

### Day 5 - Crop recommendation API (Node layer)
Tasks:
- Create `POST /api/crop/recommend` in Node.
- Validate request payload (district/taluk/soil/season/NPK/pH).
- Persist request/response summary for audit and dashboard.
- Return normalized output (top crop + alternatives + metadata).

Deliverables:
- Stable crop endpoint contract
- DB save for recommendations

### Day 6 - Pest detection API (Node layer)
Tasks:
- Create `POST /api/pest/detect` in Node with file upload middleware.
- Add service abstraction for external pest/ML inference.
- Remove any hardcoded keys; all from `.env`.
- Store pest query logs (optional image URL/hash + result summary).

Deliverables:
- Stable pest endpoint contract
- Zero hardcoded secrets

---

## Phase 3: ML Microservice Integration (Day 7-8)

### Day 7 - Python service cleanup
Tasks:
- Move relevant Python logic into `ml-service/`.
- Expose explicit endpoints:
  - `POST /ml/recommend`
  - `POST /ml/pest-detect` (if kept in Python)
  - `GET /ml/health`
- Add request/response schema checks.
- Add timeout handling and predictable error JSON.

Deliverables:
- Independently runnable ML service
- Health route and clear contract

### Day 8 - Node <-> Python service wiring
Tasks:
- Node calls ML service via axios/fetch with timeout + retry policy.
- Add graceful fallback messaging when ML service is unavailable.
- Add integration logs with correlation IDs.

Deliverables:
- End-to-end recommendation flow (React -> Node -> Python -> Node -> React ready)
- Integration documented in `docs/integration.md`

---

## Phase 4: React Frontend Rebuild (Day 9-11)

### Day 9 - React foundation
Tasks:
- Initialize React app with routing.
- Build shared layout, navbar, footer, and app shell.
- Setup API client utility and auth token handling.

Deliverables:
- Navigable React app with clean structure

### Day 10 - Feature screens (auth + crop)
Tasks:
- Build Register/Login pages.
- Build crop recommendation form with client-side validation.
- Connect to Node APIs.
- Render primary + alternative crop cards using new API shape.

Deliverables:
- Working auth + crop user flow

### Day 11 - Pest + dashboard + polishing
Tasks:
- Build pest upload/analyze page.
- Build simple user dashboard (recent recommendations/queries).
- Add loading/error/empty states.
- Ensure responsive behavior mobile + desktop.

Deliverables:
- Feature-complete frontend MVP

---

## Phase 5: Quality, Deployment, Portfolio Readiness (Day 12-14)

### Day 12 - Testing and bug hardening
Tasks:
- Backend tests for auth and core API routes.
- Validate unhappy paths:
  - invalid payloads
  - missing token
  - ML service timeout
- Fix high-priority bugs from test pass.

Deliverables:
- Stable backend behavior with major edge cases covered

### Day 13 - Deployment and environment strategy
Tasks:
- Deploy Node backend (Render/Railway/Fly/VM).
- Deploy Python service separately.
- Deploy React frontend (Vercel/Netlify).
- Configure environment variables and CORS origins properly.

Deliverables:
- Live URLs for frontend, Node API, and ML service
- Production `.env` matrix documented

### Day 14 - Documentation + interview packaging
Tasks:
- Final README with:
  - Architecture diagram
  - Setup instructions
  - API list
  - Demo credentials/test flow
- Add short `DECISIONS.md`:
  - Why Node as main backend
  - Why microservice split
  - Known tradeoffs
- Record short demo script (optional but highly recommended).

Deliverables:
- Professional project handoff quality
- Resume-ready talking points

---

## Buffer Days (Day 15 Optional)
Use this day only for:
- Unexpected deployment blockers
- Regression fixes
- Minor UX improvements
- Extra tests and monitoring tweaks

Do not add new features on buffer day.

## Daily Checklist (Use Every Day)
- Define top 3 tasks before coding
- Commit in small logical units
- Run endpoint tests before closing day
- Update `CHANGELOG.md` with completed items
- Note blockers and next-day priorities

## Exit Criteria (Project Done Definition)
Project is considered complete only when all are true:
1. Auth works end-to-end with protected APIs.
2. Crop and pest flows work from React through Node (and Python where needed).
3. No hardcoded API keys/secrets in codebase.
4. Core API routes have validation and structured errors.
5. App is deployed and accessible publicly.
6. README and architecture docs are complete and understandable.

## Risk Register + Mitigation
- Risk: ML service instability
  - Mitigation: timeout, retries, fallback responses, health checks.
- Risk: Scope creep
  - Mitigation: lock MVP features by Day 2, use Day 15 as bug-only.
- Risk: Deployment misconfiguration
  - Mitigation: environment matrix and staged deploy checklist.
- Risk: Auth bugs/security gaps
  - Mitigation: strict validation, hashed passwords, token middleware tests.

## Suggested Commit Milestones
- `feat: initialize monorepo structure and architecture docs`
- `feat: setup express server with middleware and error handling`
- `feat: implement auth with jwt and protected route`
- `feat: add crop recommendation api and persistence`
- `feat: add pest detection api with secure config`
- `feat: integrate node service with python ml microservice`
- `feat: build react auth and crop workflow`
- `feat: build pest workflow and user dashboard`
- `chore: deployment configs and production env setup`
- `docs: finalize architecture, api, and setup guides`

## Final Outcome (What You Can Tell Recruiters)
"Built AgriSense as a microservice-oriented full-stack platform: React frontend, Node/Express primary backend with JWT auth and validation, and Python ML inference service integrated over HTTP; deployed all services with production-grade configuration and documentation."
