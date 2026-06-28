# MedAppoint E2E

Playwright + TypeScript tests for the [MedAppoint](https://light-it-qa-challenge.vercel.app) patient portal.

**Author:** Florencia Polisceni

End-to-end coverage for login, rescheduling an appointment, and updating the patient profile. Tests run against the hosted app and API — no local frontend required.

## Tests

| Spec | Flow | Expected |
|------|------|----------|
| `auth.setup.ts` | UI login, save session | pass |
| `auth-and-navigation.spec.ts` | Login, dashboard, logout redirect | pass |
| `reschedule.spec.ts` | API seed → UI reschedule → verify PUT + list | **fail** (known app bugs) |
| `profile-settings.spec.ts` | Update name/notes → verify PUT + reload | **fail** (known app bugs) |

Reschedule and profile tests intentionally assert correct behaviour. They fail because the hosted app returns wrong data on PUT (stale reschedule values; profile fields merged into `first_name`).

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

Visible browser:

```bash
npm run test:headed
```

Other commands:

```bash
npm run test:ui       # Playwright UI mode
npm run report        # open the HTML report after a run
```

## How auth works

Login runs once in `e2e/auth.setup.ts`. Playwright saves the session to `e2e/.auth/session.json` and reuses it via `storageState`. The auth spec runs in a separate project without that session, so it still exercises the login page from scratch.

Reschedule tests create the appointment via `POST /appointments` first; the spec covers only the UI reschedule flow.

## Project layout

```
e2e/
├── auth.setup.ts
├── fixtures/auth.fixture.ts
├── helpers/
│   ├── api.ts
│   ├── auth-session.ts
│   └── env.ts
├── pages/
│   ├── appointments.page.ts
│   ├── dashboard.page.ts
│   ├── login.page.ts
│   └── profile.page.ts
└── specs/
    ├── auth-and-navigation.spec.ts
    ├── profile-settings.spec.ts
    └── reschedule.spec.ts
```

Locators live in page objects. Selectors use roles, labels, and existing test ids — the app cannot be modified to add new ones.

Tests run serially (`workers: 1`) because they share one patient account.

## Environment

| Variable | Required | Default |
|----------|----------|---------|
| `PATIENT_EMAIL` | yes | — |
| `PATIENT_PASSWORD` | yes | — |
| `BASE_URL` | no | `https://light-it-qa-challenge.vercel.app` |
| `API_URL` | no | `https://qa-challenge-backend.vercel.app/api` |
| `DOCTOR_NAME` | no | `Ana García` |
| `RESCHEDULE_DATE` / `RESCHEDULE_SLOT` | no | `2026-12-01` / `09:00` |

## CI

Tests run on every push and pull request to `main` via [GitHub Actions](.github/workflows/e2e.yml).

Add these repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `PATIENT_EMAIL` | Challenge patient email |
| `PATIENT_PASSWORD` | Challenge patient password (paste as-is, no quotes) |

The workflow installs Chromium, runs the suite, and uploads the HTML report as an artifact. Screenshots and videos are attached when tests fail.

Auth tests pass. Reschedule and profile tests fail until the app bugs are fixed.
