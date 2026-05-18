# Day 10 Log

## Scope
- Completed the Day 10 frontend milestone: auth feature screens and crop recommendation flow.

## What Changed
- Upgraded the React auth screens with backend-aligned validation, session-aware redirects, and clearer protected flow messaging.
- Added route protection for `crop`, `pest`, and `dashboard` so JWT-backed pages now stay behind authenticated access.
- Extended the frontend API client with `POST /api/crop/recommend`.
- Replaced the crop placeholder page with:
  - location mode selection
  - district and taluk inputs
  - optional GPS coordinate inputs
  - soil type and season selectors
  - N, P, K, and pH inputs
  - autofill source marker
  - primary crop + alternatives result rendering
  - backend metadata rendering (`source`, `latencyMs`, `autofillUsed`, `fallbackUsed`)
- Refreshed shell and landing copy to reflect Day 10 instead of Day 9 placeholder state.

## Files Touched
- `frontend/src/App.jsx`
- `frontend/src/components/AppShell.jsx`
- `frontend/src/components/RequireAuth.jsx`
- `frontend/src/lib/api-client.js`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/RegisterPage.jsx`
- `frontend/src/pages/CropPage.jsx`
- `frontend/src/pages/HomePage.jsx`
- `frontend/src/pages/DashboardPage.jsx`
- `frontend/src/styles.css`

## Verification
- Frontend production build should pass with `npm run build`.

## Notes
- Crop history/dashboard data is still intentionally lightweight until Day 11.
- Pest route is now guarded too, even though the dedicated feature polish remains scheduled for Day 11.
