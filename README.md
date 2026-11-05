# High Tide QA Automation

Playwright test suite implementing the **QA Test Strategy and Test Case Documentation Standard** (v1.0 + Section 15).
Phase 1 pilot: **Smoke Cartel**, read-only smoke and storefront API checks.

## Rules (from the QA strategy)
- Production: **read-only only**. Browse, search, product pages and cart are allowed; checkout, payment, orders and account changes are not.
- Full order and payment journeys run only in non-production (staging or dev stores), once staging is available.
- Every test title starts with its **Test ID** (e.g. `UI-SC-PDP-001`), matching the test case in Tugboat.
- Tags: `@smoke`, `@p1`, `@api` (filter with `--grep`).

## Structure
| Path | Contents |
|---|---|
| `tests/frontend/` | Browser journeys, run on desktop Chrome and mobile (Pixel 7) |
| `tests/api/` | Public storefront API checks (status, data, response time, negative cases) |
| `helpers/store.ts` | Age gate, popups, store navigation and product lookup helpers |
| `.github/workflows/qa-smoke.yml` | CI: runs on every PR, on push to main, daily at 11:00 UTC and on demand; emails on failure |

## Run locally
```bash
npm install
npx playwright install chromium
npm test                                         # everything
npm run test:smoke                               # smoke only
npm run test:api                                 # API only
SITE_URL=https://www.grasscity.com npm run test:smoke   # another store
npm run report                                   # open the HTML report
```

## CI secrets (GitHub → Settings → Secrets → Actions)
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `QA_ALERT_EMAILS` (comma-separated). Alerts go by email, as agreed in the review.

## Backend (Laravel) tests
Per QA feedback (Section 15), backend business logic, API validation, authorisation and Laravel Passport / OAuth2 tests belong in the **Laravel application repositories** using **PHPUnit or Pest**. This suite covers the storefront (frontend and public APIs).
