# Day 11 Log

## Scope
- Completed the frontend MVP milestone: pest upload flow, dashboard history, and UI state polishing.

## What Changed
- Added protected history read endpoints:
  - `GET /api/crop/history`
  - `GET /api/pest/history`
- Extended the frontend API client for:
  - multipart pest upload
  - crop history reads
  - pest history reads
- Replaced the pest placeholder page with:
  - real image upload
  - client-side file validation
  - image preview
  - live ML-backed pest analysis result rendering
  - recent pest history list
- Replaced the lightweight dashboard with live recent crop and pest history cards.
- Added more complete loading, error, and empty states across protected flows.
- Updated home/footer copy to reflect Day 11 completion.

## Files Touched
- `backend-node/src/controllers/crop.controller.js`
- `backend-node/src/controllers/pest.controller.js`
- `backend-node/src/routes/crop.routes.js`
- `backend-node/src/routes/pest.routes.js`
- `frontend/src/lib/api-client.js`
- `frontend/src/pages/PestPage.jsx`
- `frontend/src/pages/DashboardPage.jsx`
- `frontend/src/pages/HomePage.jsx`
- `frontend/src/components/AppShell.jsx`
- `frontend/src/styles.css`

## Verification
- `node --check` across `backend-node/src`
- `npm run build` in `frontend`

## Notes
- Dashboard remains intentionally recent-history focused rather than fully analytical.
- Day 12 can now focus on tests, unhappy paths, and bug hardening against a feature-complete frontend MVP.
