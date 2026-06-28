# MedAppoint E2E

Playwright + TypeScript tests for the [MedAppoint](https://light-it-qa-challenge.vercel.app) patient portal.

**Author:** Florencia Polisceni

The suite covers four flows: login/logout, booking from the dashboard, rescheduling an existing appointment, and updating the patient profile. Everything runs against the hosted app and API — no local frontend needed.

**NOTE** 3 tests WILL fail, as they represent **existing bugs**

## Setup

Node 18+ and the challenge patient credentials.

```bash
cp .env.example .env
npm install
npx playwright install chromium
```

Edit `.env` with your email and password. If the password contains `#`, wrap it in quotes.

## Run

```bash
npm test
```

Run the full suite with a visible browser (setup + auth + all three flows):

```bash
npm run test:headed
```

Other commands:

```bash
npm run test:ui       # Playwright UI mode (not the same as headed)
npm run report        # open the HTML report after a run
```

If Chrome does not appear, run `npx playwright install chromium` first. On macOS the window may open behind Cursor — look for "Google Chrome for Testing" in the Dock.

## How auth works

Login happens once in `e2e/auth.setup.ts` (real UI login). Playwright saves the session to `e2e/.auth/session.json` and reuses it for the rest of the suite via `storageState`. The auth spec runs in a separate project without that session, so it still tests the login page from scratch.

For reschedule tests, the appointment is created through the API first; the test only covers the UI part of rescheduling.

## Layout

```
e2e/
├── auth.setup.ts
├── fixtures/       # shared test fixture + API helper
├── helpers/        # env, API client, session token
├── pages/          # page objects
└── specs/          # test files
```

Tests use page objects for locators. Since we can't add `data-testid` to the app, selectors rely on roles, labels, and the few existing test ids.

Runs are serial (`workers: 1`) because all tests share the same patient account.

## Environment

| Variable | Required | Default |
|----------|----------|---------|
| `PATIENT_EMAIL` | yes | — |
| `PATIENT_PASSWORD` | yes | — |
| `BASE_URL` | no | `https://light-it-qa-challenge.vercel.app` |
| `API_URL` | no | `https://qa-challenge-backend.vercel.app/api` |
| `BOOK_DOCTOR_NAME` | no | `Ana García` |
| `BOOK_DATE` / `BOOK_SLOT` | no | `2027-01-01` / `09:00` |
| `RESCHEDULE_DATE` / `RESCHEDULE_SLOT` | no | `2026-12-01` / `09:00` |

## CI

Tests run automatically on every push and pull request to `main` via [GitHub Actions](.github/workflows/e2e.yml).

Before the first run, add these repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `PATIENT_EMAIL` | Challenge patient email |
| `PATIENT_PASSWORD` | Challenge patient password (paste as-is, no quotes) |

The workflow installs Chromium, runs the full suite, and uploads the HTML report as an artifact on every run. Screenshots and videos are saved when tests fail.

**Note:** Three tests currently fail due to known bugs in the hosted app (date display, reschedule PUT, profile PUT). Auth tests pass. The pipeline will report those failures until the app is fixed.
