---
name: add-public-form
description: Adds public unauthenticated forms (trade partner, event lead, design studio pattern). Use when creating or modifying marketing/public form pages, /t/public/ or /t/campaigns/public/ endpoints, or lead capture flows.
---

# Add Public Form

Follow existing public-form patterns in this repo.

## Discovery Checklist

Ask before implementing:

- [ ] Single submit or multi-step (like trade partner)?
- [ ] Which URL path? (`/t/public/...` vs `/t/campaigns/public/...`)
- [ ] Form variant: `default` or `glass`?
- [ ] Field validation rules (required, phone format, email)?
- [ ] Email notification on submit? (signals)
- [ ] Redirect after success (external URL vs thank-you page)?
- [ ] Error display pattern (field errors + snackbar)?

## Reference Implementations

| Form | Frontend | Backend |
|------|----------|---------|
| Trade partner (two-step) | `frontend/components/TradePartnerForm.js` | `backend/api/public_views.py`, `public_urls.py` |
| Event lead | `frontend/components/EventLeadForm.js` | `backend/campaigns/` (leads endpoint) |
| Design studio | `frontend/components/DesignStudioForm.js` | `backend/api/public_views.py` |

Tests: `backend/api/tests/test_public_forms.py`

## Frontend Workflow

1. **Thin page** in `frontend/pages/` — `<Head>` metadata + render form component
2. **Form component** in `frontend/components/` — MUI fields, local state, validation display
3. **Submit** via `fetch` (not axios for public forms):
   - Trade/design: `/t/public/<resource>/` POST/PATCH
   - Campaign leads: `/t/campaigns/public/leads/` POST
4. **Error handling** — map API field errors to form state; snackbar for general errors
5. **Variant prop** — support `default` and `glass` if sibling forms do

## Backend Workflow

1. **Model** — add fields in `api/models.py` or `campaigns/models.py`
2. **Migration** — `uv run python manage.py makemigrations`
3. **Serializer** — create/update serializer with validation
4. **View** in `api/public_views.py`:
   ```python
   permission_classes = [AllowAny]
   authentication_classes = []
   ```
5. **URL** in `api/public_urls.py` or `campaigns/urls.py`
6. **Signal** — email notification if other forms use `_send_form_notification`
7. **Tests** — extend `test_public_forms.py`: create, validation errors, two-step flow

## Test Plan

- [ ] POST creates record, returns id
- [ ] Missing required fields return 400 with field errors
- [ ] Two-step flow (if applicable): PATCH step 1, POST step 2
- [ ] Duplicate submission rejected where applicable
- [ ] `yarn lint` on frontend changes
