# Design-tree interview guide

Use during **Phase 3**. Pick the next unresolved branch with satisfied dependencies. Ask one focused question (or a small related set), then confirm before moving on.

---

## Branch 1 — Problem and success (root)

**Unlocks:** everything else.

Probe until testable:

- Who feels the pain today? How often?
- What is the cost of not solving this?
- What does success look like in 30/90 days?
- What is explicitly **not** success (scope creep guardrails)?

**Exit:** One-sentence problem statement + measurable goals the user confirms.

---

## Branch 2 — Users and permissions

**Depends on:** Branch 1.

| Question area | Examples |
|---------------|----------|
| Roles | Public visitor, ES admin, DS manager, kiosk player, API consumer? |
| Auth | Existing token flow, new login, SSO, anonymous? |
| Authorization | Who can create/edit/delete/view? Per-tenant or global? |

Cross-check Phase 2: `middleware.ts`, `AdminAuthGuard`, DRF permissions.

**Exit:** Role × permission matrix agreed.

---

## Branch 3 — Product surface and scope

**Depends on:** Branch 1.

| Question area | Examples |
|---------------|----------|
| Product | IHCS marketing site, Email Signatures, Digital Signage, backend-only? |
| MVP | Minimum shippable slice? |
| Out of scope | Features explicitly deferred? |
| Cross-cutting | Shared token, Caddy routes, Docker rebuild needed? |

**Exit:** In-scope / out-of-scope lists confirmed.

---

## Branch 4 — Data and integrations

**Depends on:** Branches 2–3.

| Question area | Examples |
|---------------|----------|
| Data model | New models vs extend existing? Source of truth? |
| Lifecycle | Create, update, delete, soft-delete, audit trail? |
| External systems | Entra, Outlook add-in, WebSockets, third-party APIs? |
| Migration | Backfill, import, export, legacy compatibility? |

Verify against Phase 2 models, serializers, and API routes.

**Exit:** Entity list + integration boundaries agreed.

---

## Branch 5 — UX and flows

**Depends on:** Branches 2–4.

| Question area | Examples |
|---------------|----------|
| Entry points | URL, admin nav, email link, kiosk? |
| Primary flow | Step-by-step happy path |
| Edge cases | Empty, error, loading, offline, permission denied |
| Design | Tailwind reference, Figma, match existing MUI patterns? |
| i18n | IHCS website only — which locales? |

**Exit:** Primary flow numbered; edge cases listed; design reference noted or "match existing."

---

## Branch 6 — Non-functional requirements

**Depends on:** Branches 3–5.

| Area | Probe |
|------|-------|
| Performance | Latency, payload size, concurrent users? |
| Accessibility | WCAG target, keyboard, screen reader? |
| Security | PII, upload validation, rate limits? |
| Reliability | Real-time vs eventual consistency, offline kiosk? |

**Exit:** NFRs stated or explicitly "no special requirements."

---

## Branch 7 — Rollout and phasing

**Depends on:** Branches 3–5.

- MVP vs phase 2 feature split?
- Feature flags, beta users, client sign-off gate?
- Content/assets needed before launch?

**Exit:** Phased delivery table or single-release confirmation.

---

## Branch 8 — Acceptance and verification

**Depends on:** all prior branches.

Convert decisions into checkboxes:

- Manual test scenarios per role
- API contract expectations (method, path, status codes)
- Regression areas (what must not break)

**Exit:** User agrees criteria prove success from Branch 1.

---

## Interview tactics

### Relentless but respectful

- **Dig:** "What happens when X fails?" "Who is notified?" "What's the default?"
- **Contrast:** "You mentioned A and B — which takes precedence when they conflict?"
- **Ground:** "The repo has `<path>` today — extend it or replace it?"
- **Quantify:** "How many?", "How often?", "How long acceptable?"

### Batching

OK to ask 2–3 related questions in one message when they share a dependency (e.g. all auth questions). Do not ask across branches (e.g. auth + i18n + API pagination) in one blob.

### Stuck loops

If the user is unsure:

1. Offer 2–3 concrete options with tradeoffs (from Phase 2 context).
2. Record as **deferred** with owner and whether it blocks MVP.
3. Do not invent a decision — mark assumption in working notes.

### Decision log template

```markdown
| ID | Branch | Decision | Rationale | Depends on |
|----|--------|----------|-----------|------------|
| D-001 | Problem | … | … | — |
| D-002 | Users | … | … | D-001 |
```

After all branches are resolved, proceed to **Phase 4 — Module sketch** in [SKILL.md](SKILL.md).
