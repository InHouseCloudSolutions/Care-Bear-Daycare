---
name: discovery-phase
description: Runs structured discovery before planning and implementation. Asks clarifying questions, produces Discovery Briefs and plans. Use proactively for new features, bugs without repro, refactors, full-stack work, or ambiguous tasks.
---

# Discovery Phase

Clarify scope like a real dev before writing code.

## When to Use

- New features, bug reports without repro, refactors
- Missing acceptance criteria or unknown affected areas
- Full-stack work or 3+ file changes
- User request is ambiguous

**Skip** for trivial single-file changes with explicit instructions.

## Workflow

```
Task → Triage → Discovery → Discovery Brief → Plan → User confirms → Execute
```

1. **Triage** — is the task clear and trivial? If yes, proceed. If no, enter discovery.
2. **Ask questions** — 1–2 at a time via `AskQuestion`; pick from categories below.
3. **Recon (optional)** — delegate read-only exploration to `frontend-dev`.
4. **Discovery Brief** — fill template below.
5. **Plan** — CreatePlan for medium/large work; inline plan for small scoped tasks.
6. **Confirm** — wait for user approval before implementation on non-trivial work.

## Question Categories

| Category | Ask when unknown |
|----------|------------------|
| **Scope** | Which pages, routes, models, apps? Staff vs marketing vs public? |
| **Behavior** | Expected UX, validation rules, errors, edge cases, redirects |
| **Data** | New vs existing fields? Required/nullable? Migration needed? |
| **Integration** | API path/method, auth (session vs `/t/public/`), email notifications |
| **Constraints** | Form variant, minimal diff, no commits, match existing pattern |

## Discovery Brief Template

```markdown
## Discovery Brief

- **Goal**:
- **Scope**: frontend | backend | full-stack
- **Affected areas**: (paths, models, routes)
- **User answers captured**:
- **Assumptions** (explicit, user-approved if any):
- **Out of scope**:
```

## Plan Template

```markdown
## Plan

### Changes
1. ...

### Test plan
- [ ] ...

### Open risks
- ...
```

## Subagent Recon Brief

When delegating read-only discovery:

```
Goal: Explore [feature area] — read only, no edits.
Return: Domain Findings block (patterns, recommended approach, files to touch, blockers).
Paths: [specific paths if known]
```

## Related Skills

- Public forms → `add-public-form`
- Staff API → `add-drf-endpoint`
- Cross-stack → `full-stack-feature`
- Verification → `run-local-ci`
