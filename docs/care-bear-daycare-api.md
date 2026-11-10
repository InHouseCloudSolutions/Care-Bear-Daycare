# Care Bear Daycare API

Reference for the carebeardaycare.ca app. The API lives on the IHCS backend, not on the daycare site itself. Local base URL: `http://localhost:3033`. Production base URL is whatever host serves this Django API.

All daycare paths below are relative to `{BASE}/api/daycare/`. Auth paths are under `{BASE}/api/auth/`.

JSON for every route except photo and site-image uploads. Send `Content-Type: application/json` on JSON routes. Trailing slashes are required. Field names are **snake_case**. Dates are `YYYY-MM-DD`. Times are `HH:MM:SS`. Money is a decimal string with two places (for example `"35.00"`). There are no card payments.

## Auth

Send the token on every call that is not public:

```
Authorization: Token <key>
```

This is DRF token auth, not `Bearer`.

| Method | Path | Who | Body | Response |
|--------|------|-----|------|----------|
| POST | `/api/auth/token/` | public | `{ "username": "<email>", "password": "<password>" }` | `{ "token": "<key>" }` |
| GET | `/api/auth/me/` | authenticated | — | see below |

`username` is the pet parent's email (stored lowercased).

`GET /api/auth/me/` (camelCase, unlike the daycare API):

```json
{
  "username": "ada@example.com",
  "firstName": "Ada",
  "lastName": "Parent",
  "isStaff": false,
  "isSuperuser": false,
  "appPermissions": []
}
```

Use `isStaff` to choose the staff UI versus the pet-parent UI. A pet parent account is never staff. On the daycare site, staff manage holidays, bookings, and households at `/staff`. A signed-in pet parent who opens `/staff` is sent to `/account`. Pet parents book at `/account/book`.

## Who can call what

| Role | How you know | Can do |
|------|----------------|--------|
| Public | no token | register, submit contact inquiry, list reviews, list site images |
| Pet parent | token, `isStaff: false`, has a profile | own profile, own dogs, own vaccines, own bookings, check availability, read own care updates, own conversation, one review per completed booking |
| Staff | token, `isStaff: true` | everything, including other pet parents |

A pet parent who asks for another parent's dog, booking, or vaccine gets **404**. Missing auth on a protected route is **401**. A pet parent hitting a staff-only route is **403**.

Validation errors are **400** with either a field map (`{ "ends_on": ["..."] }`) or `{ "detail": "..." }`.

## Lists

These list routes return a **JSON array** (not paginated): pet parents, services, dogs, vaccines, bookings, closures, care updates, conversations, extras (catalog and per-booking).

`GET /api/daycare/availability/` returns `{ "days": [...] }`, not a bare array.

`GET /api/daycare/reviews/` is paginated:

```json
{ "count": 1, "next": null, "previous": null, "results": [] }
```

Page size is 50. Use `?page=2`.

## Register and profile

## Contact inquiry (marketing form)

Public **POST** `/api/daycare/contact-inquiries/`. **No token.** Body fields are **snake_case**.

Request:

```json
{
  "name": "Ada Parent",
  "email": "ada@example.com",
  "dog_name": "Pip",
  "topic": "daycare",
  "message": "Is daycare a fit for a shy dog?"
}
```

- `name` — required, max 120 characters (whitespace stripped; cannot be blank).
- `email` — required, valid email (stored lowercased).
- `dog_name` — optional; max 80 characters; omit or send blank/whitespace-only for “not given”.
- `topic` — required; one of `daycare`, `overnight`, `fit`, `other` (labels for humans: Daycare, Overnight care, Finding the right fit, Something else).
- `message` — required, max 4000 characters (whitespace stripped; cannot be blank).

**201** `{ "id": 1 }` — the row is saved first; staff receive email when SMTP succeeds.

**400** — DRF field errors, for example `{ "email": ["Enter a valid email address."] }` or `{ "topic": ["..."] }` for an invalid choice.

### POST `/api/daycare/register/` — public — 201

```json
{
  "email": "ada@example.com",
  "password": "daycare-pass-123",
  "first_name": "Ada",
  "last_name": "Parent",
  "phone": "555-0100"
}
```

`first_name`, `last_name`, and `phone` are optional. Email is stored lowercased and is the login username. Password uses Django's validators (minimum length 8, not entirely numeric, not a common password). Duplicate email is **400** `{ "email": "A user with this email already exists." }`.

Response:

```json
{
  "token": "<key>",
  "pet_parent": {
    "id": 1,
    "email": "ada@example.com",
    "first_name": "Ada",
    "last_name": "Parent",
    "phone": "555-0100",
    "address": "",
    "city": "",
    "emergency_name": "",
    "emergency_phone": "",
    "created_at": "2026-10-27T14:00:00Z",
    "updated_at": "2026-10-27T14:00:00Z"
  }
}
```

### GET, PATCH `/api/daycare/me/` — pet parent

Returns the same `pet_parent` object. PATCH may send `first_name`, `last_name`, `phone`, `address`, `city`, `emergency_name`, `emergency_phone`. Email cannot be changed. Staff with no pet-parent profile get **404**.

### GET, POST `/api/daycare/pet-parents/` — staff

POST creates a household (a pet-parent account). Body: `email` (required), `password` (optional), `first_name`, `last_name`, `phone`, `address`, `city`, `emergency_name`, `emergency_phone`. Response is the `pet_parent` object only (no token). **201**. A duplicate email is **400** `{ "email": "..." }`; a weak password is **400** `{ "password": "..." }`.

Without a `password` the account has no usable password, so that parent cannot sign in until one is set. Public `/register/` still requires a password.

### GET, PATCH `/api/daycare/pet-parents/<id>/` — staff

PATCH may send `first_name`, `last_name`, `phone`, `address`, `city`, `emergency_name`, `emergency_phone`. `email` is read-only and ignored. PUT is **405**.

### POST, DELETE `/api/daycare/pet-parents/<id>/photo/` — staff

Multipart field `file`: JPEG, PNG, WebP, or GIF, up to 40 MB. The API scales the longest edge to 1600 px and stores WebP, the same as a gallery site image. Animated GIFs stay as uploaded. **201** returns the pet parent, including `photo_url`. The image is private; only that parent and staff can read it. DELETE is **204**. A pet parent sets their own photo with `POST /api/daycare/me/photo/` and gets **403** on this route.

## Services

Seeded rows (rate starts at `0.00`, `max_dogs_per_day` is `null` until staff set them):

| slug | name | kind | rate_unit |
|------|------|------|-----------|
| `daycare` | Daycare | `daycare` | `day` |
| `boarding` | Boarding | `boarding` | `night` |
| `walk` | Walk | `walk` | `visit` |
| `drop-in` | Drop-in | `drop_in` | `visit` |

`kind`: `daycare` (same-day or multi-day drop-off), `boarding` (overnight), `walk`, `drop_in`.

`rate_unit`: `day`, `night`, `visit`.

`max_dogs_per_day`: integer, or `null` for no cap. Walk and drop-in use this cap. Daycare and boarding do not; they share the pool under Bookings.

`check_in_from` / `check_in_until` / `check_out_from` / `check_out_until`: optional `HH:MM:SS` windows, or `null`. They are informational except for `check_out_until`, which drives the late-checkout fee (see Bookings). All times are facility-local (`America/Toronto`).

### GET `/api/daycare/services/` — any authenticated user

Active services only. Staff add `?all=1` to include inactive ones.

### POST `/api/daycare/services/` — staff — 201

### GET, PATCH, DELETE `/api/daycare/services/<id>/` — GET any authenticated user; writes staff

Staff can GET an inactive service by id. DELETE of a service that has bookings is **400** `{ "detail": "This service is used by bookings and cannot be deleted." }`.

Service object:

```json
{
  "id": 1,
  "slug": "daycare",
  "name": "Daycare",
  "kind": "daycare",
  "rate": "35.00",
  "rate_unit": "day",
  "max_dogs_per_day": 10,
  "active": true,
  "check_in_from": "07:00:00",
  "check_in_until": "09:30:00",
  "check_out_from": "16:00:00",
  "check_out_until": "18:00:00"
}
```

`slug` must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`.

## Dogs

A dog's feeding, medications, temperament, vet, and `notes` are standing care. They are not care updates.

`sex`: `female`, `male`, `unknown`.

### GET, POST `/api/daycare/dogs/` — owner or staff

Pet parent POST omits `pet_parent_id` (the dog is attached to them). Staff POST must send `pet_parent_id`.

```json
{
  "name": "Bear",
  "breed": "Golden mix",
  "sex": "male",
  "weight_lb": "42.50",
  "birth_date": "2021-04-02",
  "spayed_neutered": true,
  "vet_name": "Main St Vet",
  "vet_phone": "555-0199",
  "medications": "Apoquel with breakfast",
  "feeding": "One cup twice a day",
  "temperament": "Fine with dogs, shy with strangers",
  "good_with_dogs": false,
  "notes": "Needs a crate at night"
}
```

`good_with_dogs` defaults to `false`, including dogs that already exist. Owners and staff can read and write it. `false` means the dog is not social with other dogs. If any dog on a booking is not social, that booking is exclusive on every date it occupies. One non-social dog overrides social siblings.

Response adds `id`, `pet_parent_id`, `created_at`, `updated_at`. `weight_lb` and `birth_date` may be `null`. Text fields default to `""`.

### GET, PATCH, DELETE `/api/daycare/dogs/<id>/` — owner or staff

### POST, DELETE `/api/daycare/dogs/<id>/photo/` — owner or staff

Same file rules as a parent photo. **201** returns the dog, including `photo_url`. The image is public. DELETE is **204**. Another parent's dog is **404**.

## Vaccines

`kind`: `rabies`, `dhpp`, `bordetella`, `other`. For `other`, send `label`.

### GET, POST `/api/daycare/dogs/<dog_id>/vaccines/` — owner or staff

```json
{ "kind": "rabies", "label": "", "expires_on": "2027-01-15" }
```

Response:

```json
{
  "id": 1,
  "dog": 3,
  "kind": "rabies",
  "label": "",
  "expires_on": "2027-01-15",
  "created_at": "2026-10-27T14:00:00Z"
}
```

`expires_on` may be `null`. Expired vaccines do not block a booking.

### GET, PATCH, DELETE `/api/daycare/vaccines/<id>/` — owner or staff

## Closures

Named holiday ranges. Staff manage them on the daycare site at `/staff`. Each has a `kind`:

| `kind` | Effect |
|--------|--------|
| `closed` (default) | Blocks every service, including staff. `surcharge_percent` is always `null`. Confirming or creating an occupying booking on a closed date is **400** `{ "detail": "That date is closed (YYYY-MM-DD)." }`. `override_rules` does not skip it. |
| `surcharge` | Facility stays open. `surcharge_percent` (0–100) is required. Each billed date inside the range is marked up by that percent. Other dates on the same stay stay at the normal rate. When two surcharge ranges cover one date, the higher percent is used for that date. Availability is not `closed`. |

### GET, POST `/api/daycare/closures/` — staff

Lists are a JSON array. POST is **201**.

```json
{
  "id": 1,
  "name": "Christmas",
  "starts_on": "2026-12-24",
  "ends_on": "2026-12-26",
  "kind": "closed",
  "surcharge_percent": null
}
```

`name` is required. `ends_on` must be on or after `starts_on`. Surcharge without a percent is **400**. Closed clears `surcharge_percent`. **400** is a field map or `{ "detail": "..." }`.

### GET, PATCH, DELETE `/api/daycare/closures/<id>/` — staff

DELETE is **204** with an empty body.

## Bookings

One service, one pet parent, one or more of that parent's dogs, over a date window.

`status`: `requested`, `confirmed`, `declined`, `checked_in`, `completed`, `cancelled`.

### GET `/api/daycare/bookings/` — owner or staff

Query (all optional):

| Param | Who | Meaning |
|-------|-----|---------|
| `status` | both | exact status |
| `starts_on` | both | ISO date; matches bookings that **start** that day |
| `pet_parent` | staff | pet parent id |

### POST `/api/daycare/bookings/` — 201

Pet parent:

```json
{
  "service_id": 1,
  "dogs": [3, 4],
  "starts_on": "2026-11-02",
  "ends_on": "2026-11-04",
  "est_checkin_start": null,
  "est_checkin_end": null,
  "est_checkout_start": null,
  "est_checkout_end": null,
  "parent_note": "Pick up after 5"
}
```

`status`, `charge`, and `pet_parent_id` sent by a pet parent are ignored. The booking is stored as `requested`. An inactive service is **400**.

The estimated check-in window (`est_checkin_start`–`est_checkin_end`) and estimated check-out window (`est_checkout_start`–`est_checkout_end`) are optional times. Either side of a window may be blank. When both sides are set, end must be at or after start on the same day, or the request is **400**.

Staff must also send `pet_parent_id` and may send `status`, `charge`, and `override_rules`. If `charge` is omitted, it is computed. A pet parent who sends `override_rules` is ignored.

If this pet parent already has a `requested`, `confirmed`, or `checked_in` booking for the same service and the same `starts_on` and `ends_on`, the dogs are added to that booking instead of creating another row. The response is that booking. See capacity.

### GET, PATCH `/api/daycare/bookings/<id>/`

Pet parent PATCH may only cancel. Body must be `{ "status": "cancelled" }`. Allowed only from `requested` or `confirmed`. Any other status value is **400** and nothing changes. Other fields in that request are ignored.

Staff PATCH may change `service_id`, `dogs`, `status`, dates, times, `parent_note`, `charge`, `checked_in_at`, and `checked_out_at`. Staff may also send `override_rules: true`. That flag is not stored and is not returned. `checked_in_at` and `checked_out_at` sent by a pet parent are ignored.

Booking object (`dogs` is a list of dog ids):

```json
{
  "id": 10,
  "pet_parent_id": 1,
  "service_id": 1,
  "dogs": [3],
  "status": "requested",
  "starts_on": "2026-11-02",
  "ends_on": "2026-11-04",
  "est_checkin_start": null,
  "est_checkin_end": null,
  "est_checkout_start": null,
  "est_checkout_end": null,
  "parent_note": "",
  "charge": "105.00",
  "checked_in_at": null,
  "checked_out_at": null,
  "extras": [],
  "total": "105.00",
  "created_at": "2026-10-27T14:00:00Z",
  "updated_at": "2026-10-27T14:00:00Z"
}
```

`checked_in_at` and `checked_out_at` are `null` until staff set them, or until the status transitions (see below). `extras` lists this booking's billed add-ons, each a `BookingExtra` (see Extras below). `total` is `charge` plus the sum of every `extras[].amount`, both read-only and computed on every read.

#### Check-in, checkout, and the late-checkout fee

When staff PATCH `status` to `checked_in` and `checked_in_at` is still empty, the API stamps `checked_in_at` with the current time. When staff PATCH `status` to `completed` and `checked_out_at` is still empty, the API stamps `checked_out_at` the same way. Staff may also set either timestamp explicitly in the same PATCH or a later one.

Whenever `checked_out_at` changes (explicitly, or by the `completed` auto-stamp), the API recalculates the late-checkout line:

- Only `daycare` and `boarding` services can be late; `walk` and `drop_in` never are.
- The service needs a `check_out_until` time. Without one, there is no late fee.
- "Due" is `ends_on` + `check_out_until` in `America/Toronto`. Any time after that is late; 1 minute late bills a full hour (`ceil(minutes_late / 60)`).
- There must be exactly one **active** `Extra` with `kind: "late_checkout"` in the catalog (see Extras). Without one, no fee is charged even if the stay was late.
- The fee is `hours_late × that Extra's unit_price`, capped at `service.rate × number of dogs on the booking` (one day/night's rate per dog).
- The booking's late line is fully replaced each time: the old line (if any) is deleted and a new one is created from the current catalog entry's `name` and `unit_price`. Editing the catalog price afterward does **not** change lines already on a booking — only the next recalculation does.
- Correcting `checked_out_at` back to on-time removes the line.

### Dates and charge

| kind | dates | units |
|------|--------|--------|
| `daycare` | `ends_on` on or after `starts_on` | inclusive day count |
| `boarding` | `ends_on` after `starts_on` (checkout morning). Same day is **400** | number of nights (`ends_on - starts_on`) |
| `walk`, `drop_in` | `ends_on` must equal `starts_on`. `est_checkin_start`, `est_checkin_end`, `est_checkout_start`, and `est_checkout_end` optional | 1 |

`charge` is the per-day, per-night, or per-visit amount after the dog-count discount: `rate × dogs` for one dog, 15% off for two, 20% off for three or more. `total` is the sum of that amount on each billed date, plus extras. A billed date inside a `kind=surcharge` closure is multiplied by `(1 + percent / 100)` before the sum is quantized to cents. Dates outside the closure are not marked up. Boarding bills nights (`starts_on` through the day before `ends_on`); the checkout morning is not a billed date. Staff who send `charge` skip the peak markup and the total is that custom amount times the unit count.

### Capacity and double-booking

Daycare and boarding share one pool. Walks and drop-ins do not: they keep `max_dogs_per_day` on their own service and do not take a family slot.

Only `confirmed` and `checked_in` hold a date. `requested` does not. A pet-parent POST is stored as `requested` and does not run these rules, so the day stays open for other families. Rules run when a booking becomes or already is occupying: staff create or confirm, and when dogs are added to an occupying booking.

The API does not reject past dates or dates far in the future.

#### Shared pool (daycare and boarding)

On each date the booking occupies:

- At most two pet parents. A third family is **400**.
- On a shared date, each family brings at most 2 dogs (4 dogs in total).
- 3 or more dogs from one pet parent take the date exclusively. That is allowed when nobody else is on it, and it blocks every other family.
- The same pet parent is one family. Dogs are summed across that parent's daycare and boarding bookings on the date. Two bookings from one household are not two families.

If any dog on a booking has `good_with_dogs: false`, that booking is exclusive for every date it occupies.

Occupied dates:

- Daycare occupies `starts_on` through `ends_on`, inclusive.
- Social boarding (every dog `good_with_dogs`) occupies `starts_on` through the day before `ends_on`. Checkout stays free.
- If any dog on a boarding booking is not social, that booking also occupies `ends_on`, so the next dog cannot check in while they leave.

A full or exclusive date is **400** `{ "detail": "That date is booked (YYYY-MM-DD)." }`. The message does not name other families, dogs, or social flags.

#### Walk and drop-in

If `max_dogs_per_day` is set, an occupying walk or drop-in is **400** when `starts_on` would exceed that service's own cap. `null` means no cap. These bookings do not count toward the daycare and boarding pool. They occupy `starts_on`.

#### Closures

`kind=closed` ranges block every service, including staff. See Closures above. `override_rules` does not skip them. **400** `{ "detail": "That date is closed (YYYY-MM-DD)." }`. `kind=surcharge` does not block; it only affects charge (see Dates and charge).

#### Same dog

A dog cannot be on two `confirmed` or `checked_in` bookings whose occupied dates overlap, even across services. The second confirm is **400**. `override_rules` does not skip this. Occupied dates include a non-social boarding checkout day.

#### Staff override

Staff may send `override_rules: true` on booking POST or PATCH. That skips the family, social, and `max_dogs_per_day` rules. It does not skip closures or the same-dog overlap check. Pet parents may send the field; it is ignored. The flag is not stored and is not returned.

#### Adding dogs to the same stay

POST with the same pet parent, service, `starts_on`, and `ends_on` as an existing `requested`, `confirmed`, or `checked_in` booking adds the dogs onto that booking (the union) instead of creating a second row. The response is that booking (**201**). Status stays as it was. `parent_note`, `est_checkin_start`, `est_checkin_end`, `est_checkout_start`, and `est_checkout_end` update when they are sent.

If the booking is occupying, the rules run again for the combined dogs unless staff send `override_rules`. When they pass, the new dogs count immediately and the status is unchanged. When they fail, nothing changes and the response is **400**.

A different date range creates a new booking. The household still counts as one family for capacity.

If staff send `charge`, the merged booking uses that charge. Otherwise charge is recomputed from the combined dog count.

### GET `/api/daycare/availability/` — pet parent or staff

Query (all required):

| Param | Meaning |
|-------|---------|
| `service_id` | service id |
| `dogs` | comma-separated dog ids |
| `from` | ISO date, inclusive |
| `to` | ISO date, inclusive |

Dogs must belong to the caller. Staff may ask about any household, and every id in `dogs` must belong to that same pet parent. A window longer than 370 days is cut to the first 370 days starting at `from`.

```json
{
  "days": [
    { "date": "2026-11-02", "state": "open", "reason": null }
  ]
}
```

`state` is `open`, `joinable`, `unavailable`, or `closed`.

`reason` is `null`, `booked`, or `closed`.

Each date is a one-day probe for the selected dogs and service. Daycare uses `starts_on` = `ends_on` = that date. Boarding uses `starts_on` = that date and `ends_on` = the next day. A non-social checkout extension is part of those occupied dates.

- `closed` — a `kind=closed` closure range includes that date. `reason` is `closed`. Surcharge holidays do not produce `closed`.
- `open` — the probe would be accepted, and no other family is on the dates it occupies. `reason` is `null`.
- `joinable` — the probe would be accepted, and exactly one other social family (1 or 2 dogs, all `good_with_dogs`) is already on the shared pool for those dates. The selected dogs must themselves be 1 or 2 dogs, all `good_with_dogs`. `reason` is `null`.
- `unavailable` — the probe is rejected because of other dogs. `reason` is `booked`.

The payload does not include other owners, dog names, or social flags. If a non-social boarding probe is rejected because the checkout date is closed, the start date is `unavailable` with `reason` `closed`. The checkout date itself is `closed`.

## Care updates

What happened during a booking. Separate from the dog's standing care fields.

### GET `/api/daycare/bookings/<booking_id>/care-updates/` — owner or staff

### POST — staff only — 201

Allowed when the booking is `confirmed`, `checked_in`, or `completed`.

```json
{
  "potty": true,
  "food": true,
  "play": false,
  "meds_given": true,
  "body": "Ate dinner and took Apoquel."
}
```

All booleans default to `false`. `body` may be `""`.

```json
{
  "id": 1,
  "booking": 10,
  "author": 2,
  "author_name": "Chris C.",
  "potty": true,
  "food": true,
  "play": false,
  "meds_given": true,
  "body": "Ate dinner and took Apoquel.",
  "created_at": "2026-11-02T18:00:00Z"
}
```

`author` is the staff user's id. `author_name` is read-only and is not accepted on POST. It is the given name, a space, and the first letter of the family name uppercased with a period (`Chris Cross` → `Chris C.`). Both names are stripped first; the initial is the first character of the stripped family name (`O'Brien` → `O.`). A blank family name returns the given name only (`Chris`); a blank given name returns the family name only (`Cross`); both blank returns `""`. A pet parent POST is **403**.

## Extras

A catalog of billable add-ons (`Extra`), and the line items staff attach to a booking (`BookingExtra`, returned nested as `extras` on the booking — see Bookings).

`kind`: `item` (a regular catalog add-on, e.g. "Bath", "Nail trim") or `late_checkout` (the system-generated late fee — see Bookings). At most one **active** `Extra` may have `kind: "late_checkout"`.

### GET, POST `/api/daycare/extras/` — staff, not paginated

```json
{ "name": "Bath", "unit_price": "25.00", "active": true, "kind": "item" }
```

Response adds `id`:

```json
{ "id": 1, "name": "Bath", "unit_price": "25.00", "active": true, "kind": "item" }
```

Creating or activating a second `kind: "late_checkout"` row while another is active is **400** `{ "active": "Another active late checkout fee already exists. Deactivate it first." }`.

### GET, PATCH, DELETE `/api/daycare/extras/<id>/` — staff

Editing `unit_price` only affects future `BookingExtra` lines; existing lines keep the price they were created with.

### GET, POST `/api/daycare/bookings/<booking_id>/extras/` — owner or staff (POST staff only)

GET returns a JSON array of that booking's `BookingExtra` lines (same access as care updates: the owning pet parent or staff).

POST body:

```json
{ "extra_id": 1, "quantity": 1 }
```

`quantity` defaults to `1`. The line snapshots the catalog's `name` and `unit_price` at creation time. Posting an `extra_id` whose `kind` is `late_checkout` is **400** — that line is system-only and cannot be added here. Response (**201**) is the `BookingExtra`:

```json
{
  "id": 5,
  "extra_id": 1,
  "description": "Bath",
  "quantity": 1,
  "unit_price": "25.00",
  "amount": "25.00",
  "kind": "item",
  "created_at": "2026-11-02T18:00:00Z"
}
```

`extra_id` is `null` if the catalog `Extra` is later deleted; `description`, `unit_price`, and `amount` are unaffected (they are a snapshot).

### DELETE `/api/daycare/bookings/<booking_id>/extras/<id>/` — staff — 204

Only `kind: "item"` lines can be deleted this way. Deleting a `kind: "late_checkout"` line is **400** `{ "detail": "The late checkout fee is managed automatically." }` — correct the booking's `checked_out_at` instead.

## Messages

One conversation per pet parent. It is created the first time it is read or a message is sent.

### GET `/api/daycare/conversation/` — pet parent

```json
{
  "id": 1,
  "pet_parent_id": 1,
  "email": "ada@example.com",
  "first_name": "Ada",
  "created_at": "2026-10-27T14:00:00Z",
  "messages": [
    {
      "id": 1,
      "conversation": 1,
      "sender_id": 5,
      "booking_id": 10,
      "body": "Bear settled in fine.",
      "created_at": "2026-11-02T18:05:00Z"
    }
  ]
}
```

`booking_id` is `null` when the message is not about a booking. `sender_id` is the user id (staff or pet parent).

### POST `/api/daycare/messages/` — pet parent — 201

```json
{ "body": "What time should I pick up?", "booking_id": 10 }
```

`booking_id` is optional and must be that pet parent's booking.

### GET `/api/daycare/conversations/` — staff

Array **without** messages:

```json
{
  "id": 1,
  "pet_parent_id": 1,
  "email": "ada@example.com",
  "first_name": "Ada",
  "created_at": "2026-10-27T14:00:00Z"
}
```

### GET `/api/daycare/conversations/<pet_parent_id>/` — staff

Same shape as `GET /conversation/`, including `messages`.

### POST `/api/daycare/conversations/<pet_parent_id>/messages/` — staff — 201

```json
{ "body": "Pickup is 5pm.", "booking_id": 10 }
```

## Reviews

One review per booking. Only after status is `completed`. Rating is an integer **1–5**.

### POST `/api/daycare/bookings/<booking_id>/review/` — owning pet parent — 201

```json
{ "rating": 5, "body": "Bear came home tired and happy." }
```

`body` may be `""`. A second review, or a review before completion, is **400**.

Create response:

```json
{
  "id": 1,
  "booking": 10,
  "rating": 5,
  "body": "Bear came home tired and happy.",
  "created_at": "2026-11-05T15:00:00Z"
}
```

### GET `/api/daycare/reviews/` — public, paginated

```json
{
  "id": 1,
  "rating": 5,
  "body": "Bear came home tired and happy.",
  "created_at": "2026-11-05T15:00:00Z",
  "dog_names": ["Bear"],
  "pet_parent_first_name": "Ada",
  "booking_id": 10
}
```

`dog_names` are the first word of each dog's name. Newest first.

### DELETE `/api/daycare/reviews/<id>/` — staff — 204

## Site reviews

Public marketing reviews for the Care Bear Daycare website. This list is separate from the booking reviews above. Staff edit these rows in Django admin. There is no create, update, or delete route.

`photo_src`, `photo_alt`, and each `photos` entry are site paths such as `/imgs/reviews/marco.bmp`, not uploaded files. The website falls back to its bundled list if this call fails.

### GET `/api/daycare/site-reviews/` — public, not paginated

`AllowAny`. The response is a JSON array (not a paginated object), newest `stayed_on` first. `id` is the string external id, not the integer primary key. Empty `photo_src` and `photo_alt` are `null`.

```json
{
  "id": "marco-sia-2026-10-23",
  "source": "rover",
  "stayed_on": "2026-10-23",
  "dog_name": "Marco & Sia",
  "owner_first_name": "L",
  "stars": 5,
  "quote": "We’re so grateful to Carrie…",
  "photo_src": "/imgs/reviews/marco.bmp",
  "photo_alt": "Marco",
  "photos": [
    { "src": "/imgs/reviews/marco.bmp", "alt": "Marco" },
    { "src": "/imgs/reviews/sia.bmp", "alt": "Sia" }
  ]
}
```

`source` is `rover`, `google`, or `internal`. When a review has several dogs, `photos` lists each one. When it has a single photo path and no `photos` array was stored, `photos` is one item built from that path.

## Site images

Public photos for the home hero (`home_slide`) and the gallery (`gallery`). Staff add, reorder, and edit alt text at `/staff/images`. Until a placement has at least one image, the website keeps the photos it ships with. A failed request does the same.

```json
{
  "id": 1,
  "placement": "home_slide",
  "alt": "Dog",
  "sort_order": 0,
  "image_url": "/api/daycare/images/12/"
}
```

`image_url` is a public file URL. `sort_order` starts at 0 and is assigned on create (one past the current max for that placement).

### GET `/api/daycare/site-images/?placement=home_slide` — public

Also `placement=gallery`. No token. The response is a JSON array (not a paginated object). An invalid placement is **400** `{ "placement": ["Use home_slide or gallery."] }`.

### POST `/api/daycare/site-images/` — staff — 201

Multipart, not JSON. Fields are `file`, `alt`, and `placement`. The staff page shrinks large photos in the browser before upload. The API accepts up to 40 MB, then scales the image (2400 px longest edge for slides, 1600 px for gallery) and stores it as WebP. A file it can't read comes back as a validation error.

### PATCH `/api/daycare/site-images/<id>/` — staff

JSON `{ "alt": "Dog", "sort_order": 1 }`. `placement` is read-only and ignored if sent.

### DELETE `/api/daycare/site-images/<id>/` — staff — 204

Anonymous writes are **401**. Pet-parent writes are **403**.

## Browser calls from carebeardaycare.ca

Production CORS allows `https://carebeardaycare.ca` and `https://www.carebeardaycare.ca`. Call the API host from the browser with the `Authorization` header. Do not send cookies for these routes.

Local dev allows every origin.

## Not in this API

Card payments, a printable invoice document, vaccine-expiry blocking, and a second login endpoint. The late-checkout fee and catalog extras compute a `total` on the booking; they do not create a payable invoice. Holidays, bookings, households, and site images are managed at `/staff` on the daycare site through the routes above. Django admin remains at `{BASE}/api/admin/` for other staff data and is separate from this JSON API.
