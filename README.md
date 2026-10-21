# Care Bear Daycare

Marketing site for Care Bear Daycare, a small boarding hotel for dogs. The public pages cover overnight suites, supervised daycare, and outdoor play. Stays are booked on Rover, and visit requests go out by email.

## Public pages

| Path | Page |
| --- | --- |
| `/` | Home |
| `/about` | About |
| `/how-a-stay-works` | How a stay works |
| `/care-and-safety` | Care and safety |
| `/gallery` | Gallery |
| `/contact` | Contact |

Before tightening Care and safety copy with hard numbers (capacity, vaccines, vet, certifications), ask Carrie the questions in [docs/carrie-care-rules-questions.md](docs/carrie-care-rules-questions.md).

**Book a stay** opens the Rover profile (`ROVER_BOOKING_URL` in `frontend/consts/routes.js`). That URL is a placeholder until the real profile is set.

**Contact** opens a mail message to `contact@carebeardaycare.ca` with the subject "daycare consultation".

## Stack

- **Frontend:** Next.js 15 (App Router), React 18, MUI 5, Yarn 4
- **Local runtime:** Docker Compose, with Caddy in front of the Next.js container

## Local development

Docker and Docker Compose are enough to run the site.

```bash
docker compose up --build --remove-orphans
```

Then open [http://127.0.0.1:3010](http://127.0.0.1:3010).

Stop the stack with:

```bash
docker compose down
```

The frontend container runs `yarn dev` on port 3000. Caddy publishes it on port 3010.

To work outside Docker:

```bash
cd frontend && yarn install && yarn dev
```

## Layout

- `frontend/` — Next.js app. Marketing pages live under `frontend/src/app/(website)/`.
- `docker-compose.yml` and `Caddyfile` — local reverse proxy and the frontend service.

## License

BSD 3-Clause. See `LICENSE`.
