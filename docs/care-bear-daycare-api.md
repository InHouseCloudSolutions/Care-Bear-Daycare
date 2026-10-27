# Care Bear Daycare API

Reference for the carebeardaycare.ca app. The API lives on the IHCS backend, not on the daycare site itself. Local base URL: `http://localhost:3033`. Production base URL is whatever host serves this Django API.

All daycare paths below are relative to `{BASE}/api/daycare/`. Auth paths are under `{BASE}/api/auth/`.

JSON only. Send `Content-Type: application/json`. Trailing slashes are required. Field names are **snake_case**. Dates are `YYYY-MM-DD`. Times are `HH:MM:SS`. Money is a decimal string with two places (for example `"35.00"`). There are no card payments and no photo uploads.

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

Use `isStaff` to choose the staff UI versus the pet-parent UI. A pet parent account is never staff.

## Who can call what

| Role | How you know | Can do |
|------|----------------|--------|
| Public | no token | register, list reviews |
| Pet parent | token, `isStaff: false`, has a profile | own profile, own dogs, own vaccines, own bookings, read own care updates, own conversation, one review per completed booking |
| Staff | token, `isStaff: true` | everything, including other pet parents |

A pet parent who asks for another parent's dog, booking, or vaccine gets **404**. Missing auth on a protected route is **401**. A pet parent hitting a staff-only route is **403**.

Validation errors are **400** with either a field map (`{ "ends_on": ["..."] }`) or `{ "detail": "..." }`.

## Lists

These list routes return a **JSON array** (not paginated): pet parents, services, dogs, vaccines, bookings, care updates, conversations.

`GET /api/daycare/reviews/` is paginated:

```json
{ "count": 1, "next": null, "previous": null, "results": [] }
```

Page size is 50. Use `?page=2`.

## Register and profile

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

POST body matches register (`email`, `password`, `first_name`, `last_name`, `phone`). Response is the `pet_parent` object only (no token). **201**.

### GET `/api/daycare/pet-parents/<id>/` — staff

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

`max_dogs_per_day`: integer, or `null` for no cap.

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
  "active": true
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
  "notes": "Needs a crate at night"
}
```

Response adds `id`, `pet_parent_id`, `created_at`, `updated_at`. `weight_lb` and `birth_date` may be `null`. Text fields default to `""`.

### GET, PATCH, DELETE `/api/daycare/dogs/<id>/` — owner or staff

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
  "starts_at": null,
  "ends_at": null,
  "parent_note": "Pick up after 5"
}
```

`status`, `charge`, and `pet_parent_id` sent by a pet parent are ignored. The booking is stored as `requested`. An inactive service is **400**.

Staff must also send `pet_parent_id` and may send `status` and `charge`. If `charge` is omitted, it is computed.

### GET, PATCH `/api/daycare/bookings/<id>/`

Pet parent PATCH may only cancel. Body must be `{ "status": "cancelled" }`. Allowed only from `requested` or `confirmed`. Any other status value is **400** and nothing changes. Other fields in that request are ignored.

Staff PATCH may change `service_id`, `dogs`, `status`, dates, times, `parent_note`, and `charge`.

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
  "starts_at": null,
  "ends_at": null,
  "parent_note": "",
  "charge": "105.00",
  "created_at": "2026-10-27T14:00:00Z",
  "updated_at": "2026-10-27T14:00:00Z"
}
```

### Dates and charge

| kind | dates | units |
|------|--------|--------|
| `daycare` | `ends_on` on or after `starts_on` | inclusive day count |
| `boarding` | `ends_on` after `starts_on` (checkout morning). Same day is **400** | number of nights (`ends_on - starts_on`) |
| `walk`, `drop_in` | `ends_on` must equal `starts_on`. `starts_at` / `ends_at` optional | 1 |

`charge = rate × units × number of dogs`, unless staff send `charge`.

### Capacity and double-booking

Only `confirmed` and `checked_in` hold a spot. `requested` does not.

- Daycare occupies every date from `starts_on` through `ends_on`.
- Boarding occupies each night from `starts_on` up to but not including `ends_on`.
- Walk and drop-in occupy `starts_on`.

If `max_dogs_per_day` is set, confirming (or staff creating already `confirmed` / `checked_in`) fails with **400** when any of those dates would exceed the cap. The count is dogs, not bookings.

A dog also cannot be on two `confirmed` or `checked_in` bookings whose occupied dates overlap, even across services. The second confirm is **400**.

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
  "potty": true,
  "food": true,
  "play": false,
  "meds_given": true,
  "body": "Ate dinner and took Apoquel.",
  "created_at": "2026-11-02T18:00:00Z"
}
```

`author` is the staff user's id. A pet parent POST is **403**.

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

## Browser calls from carebeardaycare.ca

Production CORS allows `https://carebeardaycare.ca` and `https://www.carebeardaycare.ca`. Call the API host from the browser with the `Authorization` header. Do not send cookies for these routes.

Local dev allows every origin.

## Not in this API

Photos, card payments, invoices, vaccine-expiry blocking, and a second login endpoint. Django admin for staff data entry is `{BASE}/api/admin/` and is separate from this JSON API.
