# Module sketch guide

Use during **Phase 4** after the design-tree interview. This is **architecture sketching**, not implementation.

---

## Goals

1. Map agreed requirements to **concrete modules** (build new vs modify existing).
2. **Extract deep modules** — pure logic with no UI/framework coupling — so they can be unit-tested in isolation.
3. Present the sketch to the user for confirmation before writing the PRD.

---

## Process

### 1. Re-ground in the repo

Run targeted graphify queries for modules touched by the decision log:

```powershell
graphify query "<feature area> views serializers components"
graphify path "<existing entry>" "<related layer>"
```

Name **existing files** to extend vs **new files** to create. Prefer extending established patterns (`frontend/AGENTS.md`, `backend/AGENTS.md`).

### 2. Layer the sketch

Split by monorepo layer, then by responsibility:

| Layer | Module types |
|-------|----------------|
| **Backend** | models, serializers, services, viewsets, consumers, management commands |
| **Frontend** | route pages, feature components, hooks, API clients, shared UI |
| **Cross-cutting** | middleware, auth guards, env, Docker, migrations |

### 3. Hunt for deep modules (required)

For each feature slice, ask: **what pure logic can leave the framework?**

| Signal | Extract to |
|--------|------------|
| Validation, parsing, formatting | `lib/` or `utils/` with no Django/React imports |
| Business rules, scheduling, diffing | `services/` (backend) or `domain/` (frontend) |
| State machines, eligibility checks | Standalone functions + types |
| HTML/text generation | Template builders testable with string snapshots |

**Deep module criteria:**

- Single clear responsibility
- Dependencies injected or passed as plain data (not globals, not `request`, not hooks)
- Testable with inputs → outputs, no DB/browser unless explicitly an integration test boundary
- Stable API surface (function signature or small class)

Mark each candidate: **Deep (isolated tests)** vs **Shallow (integration/UI tests only)**.

### 4. Draw the dependency graph

```
[Route / ViewSet] → [Orchestrator hook or service] → [Deep module(s)]
                              ↓
                        [API client / Serializer]
```

Orchestrators stay thin; push logic down into deep modules.

### 5. Present and confirm

Share with the user:

- Module table (see template below)
- Mermaid or ASCII dependency diagram
- Which modules are new vs modified
- Proposed test strategy per deep module
- One question if a boundary is ambiguous: "Should X live in backend service or frontend domain?"

**Do not write the PRD until the user confirms the module sketch** (or explicitly defers with noted risk).

---

## Module table template

```markdown
| ID | Module | Layer | Action | Responsibility | Deep? | Test approach | Depends on |
|----|--------|-------|--------|----------------|-------|---------------|------------|
| M-001 | `apps/foo/services/schedule.py` | Backend | Create | Compute next run from rules | Yes | Unit: table-driven cases | — |
| M-002 | `FooScheduleViewSet` | Backend | Modify | HTTP CRUD, delegates to M-001 | No | API integration | M-001 |
| M-003 | `useScheduleEditor` | Frontend | Create | Wire form state to API | No | Component + mock API | M-004 |
| M-004 | `domain/scheduleRules.ts` | Frontend | Create | Client-side preview of rules | Yes | Unit: pure functions | — |
```

**Action:** Create | Modify | Extend

---

## Extraction heuristics

| Instead of… | Extract… |
|-------------|----------|
| Fat viewset with business logic | `services/<feature>.py` + thin views |
| Serializer method doing computation | Shared validator used by serializer and tests |
| 200-line React component | `domain/` pure helpers + thin presentation component |
| Duplicated frontend/backend rules | Document single source of truth; duplicate only if unavoidable, with parallel test vectors |
| WebSocket handler with parsing | `parsers/` or `messages.py` pure functions |

---

## IHCS conventions

| Surface | Prefer |
|---------|--------|
| Django apps | `backend/apps/<app>/services/` for deep logic |
| DRF | Serializers validate shape; services enforce rules |
| Next.js admin (TS) | `domain/` or `lib/` next to feature folder |
| Marketing (JS) | Same pattern; pure `.js` helpers testable with Jest/vitest if added |
| Shared auth | Do not fork — extend middleware / `AdminAuthGuard` |

---

## Anti-patterns

| Avoid | Why |
|-------|-----|
| "One big PR" module with no seams | Untestable, hard to review |
| Deep module that imports MUI or ORM | Not isolated |
| Skipping modify list | Missed regression surfaces |
| Module per file reflex | Prefer cohesion over ceremony |

---

## Phase 4 exit criteria

- [ ] Every P0 requirement maps to at least one module
- [ ] At least one **deep module** identified per non-trivial logic slice (or explicit note why not possible)
- [ ] New vs modify list is repo-grounded (paths, not vague labels)
- [ ] User confirmed sketch or deferred with recorded risk
