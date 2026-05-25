# Frontend / Backend Gap Audit

Date: 2026-05-25

## Scope

This note captures mismatches between:

- current React frontend expectations
- live Node/ML backend APIs
- documented system contracts in `shared-docs`

## Major Gaps

### 1. API contract is ahead of the live backend

The written contract still describes endpoints that do not exist in the current Node service:

- `POST /api/auth/google`
- `GET /api/profile/me`
- `PATCH /api/profile/me`
- `PATCH /api/profile/password`
- `POST /api/location/resolve`
- `GET /api/soil-profile`

Evidence:

- Contract docs: `shared-docs/api-contract.md`
- Live routes only expose:
  - auth: `register`, `login`, `me`
  - crop: `recommend`, `history`
  - pest: `detect`, `history`

Impact:

- docs and architecture suggest broader product readiness than the running backend actually supports
- frontend/system planning can drift because the contract is not the source of truth right now

### 2. Crop image-assisted location is mostly frontend-only

The crop flow supports image upload, coordinate extraction, OCR fallback, reverse geocoding, and district/taluk autofill in the browser. However, there is no backend location resolution API or soil-profile API behind that workflow.

Impact:

- location assistance is not a reusable backend capability
- behavior depends on browser-side logic only
- other clients cannot reuse the same flow
- the legacy-style “detected place -> soil autofill” journey is still incomplete end to end

### 3. `previousCrop` is collected but not used

The frontend includes `previousCrop` in the crop form and sends it in the request payload. The backend validator does not accept it, and the crop recommendation service does not use it in inference or persistence.

Impact:

- user enters a value that has no effect
- recommendation output can appear smarter than the actual backend logic

### 4. Language selector is UI-only

The shared shell shows a language dropdown, but there is no working frontend change handler and no backend profile-update route to persist the value.

Impact:

- the UI suggests a real preference setting
- the system currently cannot apply or save that setting

### 5. Crop result “Choose this plant” action has no backend flow

The crop results screen presents a selection action, but there is no live route to save a chosen crop plan, convert it into a dashboard entity, or continue that workflow.

Impact:

- frontend exposes an action without a real system outcome
- dashboard integration is only partial

### 6. Soil testing CTA is not connected

The crop screen includes a “Need Soil Testing?” action, but there is no routed React page or backend feature supporting that path.

Impact:

- user sees a product path that does not actually exist
- legacy frontend expectations are only partially ported

### 7. Auth/profile documentation does not match current product reality

The current frontend only uses `register`, `login`, and `me`, which is fine for the MVP. However, the docs still imply Google auth and editable profile management are part of the current system.

Impact:

- testers or recruiters can expect flows that are not implemented
- implementation status is harder to communicate clearly

### 8. Pest backend stores more than the frontend shows

The pest backend persists provider data, request tracing metadata, and image-related details, but the frontend mainly renders the diagnosis summary.

Impact:

- not a bug, but a visibility gap
- useful backend information is currently hidden from users/admin-style views

## Recommended Next Actions

### Must fix

- Align `shared-docs/api-contract.md` with the live backend, or implement the missing endpoints.
- Remove or wire any UI actions that currently have no system outcome.
- Decide whether `previousCrop` should be:
  - supported end to end
  - or removed from the crop form for now

### Should wire next

- Add backend-backed location resolution if crop image assistance is meant to be a true platform feature.
- Add soil-profile autofill support if the old crop flow is still the product benchmark.
- Add profile update endpoints if language and profile settings should remain visible in the UI.

### Docs cleanup

- Mark contract entries as `implemented` vs `planned`.
- Keep frontend behavior notes separate from backend guarantees.
- Treat `shared-docs/api-contract.md` as a maintained source of truth, not a wish list.

## Summary

The core app works at an MVP level, but the biggest mismatch is that the frontend and docs imply a more complete product than the backend currently implements. The most important gaps are around crop assistance, profile/settings flows, and action buttons that are not backed by real APIs.
