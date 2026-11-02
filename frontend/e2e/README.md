# Dog Hotel browser suite

Playwright walks the site the way a visitor does. Each `test.step` is one checkpoint. The HTML report lists those steps in order.

Run this against the Dog Hotel Docker site at `http://127.0.0.1:3010`. Do not point it at production.

## What each file covers

| File | What it checks | Creates accounts |
| --- | --- | --- |
| `marketing.spec.js` | Home, About, How a stay works, Care and safety, Reviews, Gallery, Contact, and the signed-out Book a stay redirect | No |
| `auth-gates.spec.js` | Signed-out `/account`, `/account/book`, and `/staff` go to login. The home Login link targets `/staff`. | No |
| `pet-parent-journey.spec.js` | Register, profile, dog, vaccine, stay request, signed-in `/staff` (404 until a staff screen exists), logout, login | Yes |

The stay request is stored as requested. Staff confirmation, capacity, and messaging are covered by the API tests in the website repo: `backend/apps/daycare/tests/`.

## Safety

`docker-compose.yml` sets `DAYCARE_API_ORIGIN` to `https://inhousecloudsolutions.com` when that variable is unset. Registration would then create a real production account. The journey test refuses to run until you set `E2E_CONFIRM_LOCAL_API=1` after pointing the Dog Hotel container at a local API.

## Commands

From `frontend/`:

```powershell
yarn test:e2e
```

Marketing and auth-gate tests only:

```powershell
yarn playwright test e2e/marketing.spec.js e2e/auth-gates.spec.js
```

Full journey, local API only:

```powershell
$env:E2E_CONFIRM_LOCAL_API = '1'
yarn test:e2e:journey
```

Override the site address with `PLAYWRIGHT_BASE_URL` when it is not `http://127.0.0.1:3010`.

API suite (website repo, separate from this browser suite):

```powershell
cd backend
uv run pytest apps/daycare/tests -q
```
