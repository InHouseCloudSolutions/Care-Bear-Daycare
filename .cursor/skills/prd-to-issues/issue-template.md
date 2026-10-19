# Issue Template

Copy into `issues/NNN-short-title.md`. Replace bracketed placeholders.

```markdown
# [Slice title — outcome-focused]

| Field | Value |
|-------|-------|
| **PRD** | [issues/prd-<slug>.md] |
| **File** | issues/NNN-short-title.md |
| **Slice** | Tracer bullet / Vertical slice |
| **Mode** | AFK / HITL |
| **Status** | Ready |
| **Blocked by** | [— or issues/006-add-user-auth.md] |
| **User stories** | [PRD user story IDs or titles this slice covers] |
| **Blocks** | [issues/NNN-short-title.md, … or —] |
| **Product** | [IHCS website / Email Signatures / Digital Signage / Cross-cutting] |

---

## Outcome

[One paragraph: what is demonstrably true when this issue is done? Who can see or verify it?]

---

## Why this slice

[How this fits the tracer-bullet / vertical-slice strategy. What path or risk it proves.]

---

## Scope

### In scope

- [Concrete deliverable 1]
- [Concrete deliverable 2]

### Out of scope

- [Deferred to later issues — cite filenames e.g. issues/008-…]

---

## PRD traceability

| PRD ref | Mapping |
|---------|---------|
| R-001 | [How this slice satisfies it, fully or partially] |
| M-001 | [Modules touched] |
| D-001 | [Relevant decisions] |

---

## Implementation notes

[Repo-grounded hints: paths, routes, patterns, auth. Enough for a grabber to orient without re-reading the PRD.]

### Suggested touchpoints

- **Frontend:** [routes, components]
- **Backend:** [apps, models, APIs]
- **Other:** [migrations, WebSocket, env, Docker]

---

## Tasks

- [ ] [Ordered, concrete task]
- [ ] [Next task]

---

## Acceptance criteria

- [ ] [Observable, verifiable criterion]
- [ ] [Criterion 2]
- [ ] [No regressions to …]

---

## Verification hints

[How to verify locally: URL, API call, test command, docker-compose note. No secrets.]

---

## Open questions

| # | Question | Blocking? |
|---|----------|-----------|
| 1 | [Only if unresolved; else omit section] | No |
```
