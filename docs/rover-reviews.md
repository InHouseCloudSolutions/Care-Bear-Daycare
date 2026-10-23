# Rover reviews — notes for a later fetch

The `/reviews` page still reads the static list in `frontend/components/dog-hotel/reviews-data.js`. Do not wire a live fetch until the response shape is confirmed.

## Profile

Carrie's public profile is `https://www.rover.com/sit/carrib24913`.

Every Rover link on the site uses `ROVER_BOOKING_URL` in `frontend/consts/routes.js`.

## API

Rover's app exposes a route index at `https://www.rover.com/api/v7/`. That index is not a published partner API, and it can change without notice.

The key belongs in `ROVER_API_KEY` inside `frontend/.env.local` (gitignored). See `frontend/.env.example` for the variable name. Do not commit the value, and do not prefix it with `NEXT_PUBLIC_` — the browser must not receive it.

A later spike should look only for this sitter's public reviews (likely under the person or full sitter profile). Trainer, grooming, and location-SEO review routes are different products.

## Latest static entry

Marco and Sia, owner first name L, stay date 23 Oct 2026, is the newest entry in `reviews-data.js`. Photos are `frontend/public/imgs/reviews/marco.bmp` and `sia.bmp`.
