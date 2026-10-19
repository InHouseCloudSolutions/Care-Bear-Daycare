# PRD Template

Copy this structure into `issues/<filename>.md` after **Phases 3–4** are complete. Replace bracketed placeholders.

```markdown
# [Feature or initiative title]

| Field | Value |
|-------|-------|
| **Client** | [Client or internal stakeholder name] |
| **Status** | Draft — agreed in PRD session |
| **Author** | [Agent / user name] |
| **Date** | [YYYY-MM-DD] |
| **Product** | [IHCS website / Email Signatures / Digital Signage / Cross-cutting / Other] |

---

## Executive summary

[2–4 sentences: what we are building, for whom, and the primary business outcome.]

---

## Background and problem

### Context

[Why this request exists — current pain, opportunity, or trigger.]

### Problem statement

[One clear sentence — confirmed in Phase 3.]

### Goals

- [Goal 1 — measurable or observable]
- [Goal 2]

### Non-goals

- [What this initiative explicitly does not aim to do]

---

## Current state (repo discovery)

[From Phase 2 — how the system works today in scope of this PRD.]

### Verified assertions

| User assertion | Verdict | Evidence |
|----------------|---------|----------|
| [e.g. "We have template CRUD"] | Confirmed / Corrected / Not found | [paths, routes, models] |

### Relevant codebase surface

- **Frontend:** [routes, components, patterns]
- **Backend:** [apps, models, APIs, auth]
- **Other:** [WebSockets, add-in, Docker, env]

### Gaps vs desired end state

- [What does not exist yet that this PRD requires]

---

## Decision log

[From Phase 3 — agreed decisions only.]

| ID | Area | Decision | Rationale |
|----|------|----------|-----------|
| D-001 | [Branch] | [What we agreed] | [Why] |

---

## Implementation modules

[From Phase 4 — confirmed module sketch.]

### Module map

| ID | Module | Layer | Action | Responsibility | Deep? | Test approach | Depends on |
|----|--------|-------|--------|----------------|-------|---------------|------------|
| M-001 | `[path]` | Backend / Frontend / Cross-cutting | Create / Modify / Extend | [One line] | Yes / No | [Unit / integration / UI] | [M-00x or —] |

### Dependency diagram

```mermaid
flowchart TD
  [Entrypoint] --> [Orchestrator]
  [Orchestrator] --> [DeepModule]
```

[Or ASCII equivalent.]

### Deep modules (isolated test targets)

| Module | Extracted logic | Why isolated | Example test cases |
|--------|-----------------|--------------|-------------------|
| M-001 | [Pure function responsibility] | [No framework imports] | [Case 1, case 2] |

### Requirement → module traceability

| Requirement | Modules |
|-------------|---------|
| R-001 | M-001, M-002 |

---

## Users and stakeholders

| Role | Needs | Permissions |
|------|-------|-------------|
| [e.g. End user] | [Primary need] | [View / edit / admin] |

---

## Requirements

### Must have (P0)

| ID | Requirement | Rationale | Decision ref |
|----|-------------|-----------|--------------|
| R-001 | [Specific, testable requirement] | [Tied to goal] | D-00x |

### Should have (P1)

| ID | Requirement | Rationale | Decision ref |
|----|-------------|-----------|--------------|
| R-101 | | | |

### Could have (P2)

| ID | Requirement | Rationale | Decision ref |
|----|-------------|-----------|--------------|
| R-201 | | | |

---

## User flows and experience

### Primary flow

1. [Step]
2. [Step]
3. [Step]

### Edge cases and errors

- [Empty state, validation failure, permission denied, offline, etc.]

### Content and design notes

- [Copy tone, branding, accessibility, responsive behavior, reference links]

---

## Acceptance criteria

- [ ] [Criterion 1 — verifiable without ambiguity]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

---

## Scope

### In scope

- [Deliverable or behavior included in this PRD]

### Out of scope

- [Explicit exclusions — confirmed in interview]

### Future considerations

- [Deferred items from Phase 3]

---

## Dependencies and constraints

| Type | Detail |
|------|--------|
| **Technical** | [Stack, integrations, APIs, auth — grounded in repo] |
| **Content** | [Assets, copy, legal review] |
| **Operational** | [Hosting, deployment, training] |
| **Timeline** | [Milestones or deadlines, or TBD] |

---

## Success metrics

| Metric | Target | How measured |
|--------|--------|--------------|
| [e.g. Task completion rate] | [Agreed or TBD] | [Analytics, user test, client sign-off] |

---

## Assumptions

- [Only items not explicitly confirmed but required for coherence]

---

## Open questions

| # | Question | Owner | Blocking? | Target date |
|---|----------|-------|-----------|-------------|
| 1 | [Deferred in interview] | [Client / IHCS] | [Yes / No] | [Optional] |

---

## Appendix

### Source brief

[Summarize or paste original Phase 1 input. Redact sensitive data.]

### Revision history

| Date | Version | Change |
|------|---------|--------|
| [YYYY-MM-DD] | 1.0 | Initial draft after PRD session |
```
