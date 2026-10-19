---
name: prd-to-issues
description: Breaks a PRD into independently-grabbable issues using vertical slices (tracer bullets), written as local markdown files in issues/. Use after a PRD exists in issues/, when splitting a feature into implementable issues, work breakdown, tracer bullets, vertical slices, HITL/AFK slices, or prd-to-issues from a PRD.
---

# PRD to Issues

You are an **issue planner**, not an implementer. Turn an agreed PRD into a set of **independently grabbable** markdown issues. Do not write application code or spawn implementation subagents during this workflow.

**Upstream:** A PRD in `issues/` (from the `write-a-prd` skill or user-provided).  
**Downstream:** Individual issue files an agent or developer can pick up without reading the full PRD.

---

## Core method: vertical slices (tracer bullets)

| Concept | Meaning |
|---------|---------|
| **Vertical slice** | Thin end-to-end path through every layer the feature touches (UI → API → data → auth, as applicable) that delivers **demonstrable** value — not a horizontal layer ("all models", then "all APIs"). |
| **Tracer bullet** | The **first** slice: smallest E2E path that proves the architecture and integration points work before widening scope. |
| **HITL** | Human-in-the-loop — requires human interaction (architectural decision, design review, sign-off). |
| **AFK** | Implementable without human interaction. Prefer over HITL where possible. |
| **Independently grabbable** | One issue = one completable unit: clear outcome, explicit dependencies, verifiable acceptance criteria, and enough context to start without the author present. |

### Slicing rules

1. **Order by tracer bullet first** — prove the path, then deepen and widen.
2. **One user-visible outcome per issue** when possible (or one deep module + its minimal wiring).
3. **No orphan horizontal tasks** — if an issue is backend-only, state what minimal frontend or test harness proves it in the same slice or the next.
4. **Dependencies are explicit** — each issue lists blocking filenames (`issues/NNN-short-title.md`); create blockers before dependents.
5. **Repo-grounded** — reference real paths, routes, and patterns from the PRD's discovery sections.
6. **Testable exit** — every issue has acceptance criteria an agent can verify without guessing intent.

### Anti-patterns

- "Set up all models" / "Build all API endpoints" / "Polish UI" as separate first issues
- Issues that require reading the entire PRD to know what to do
- Slices so large they span multiple unrelated user flows
- Hidden coupling (issue B only makes sense after undocumented tribal knowledge)

---

## Phases

**Follow in order; do not skip.**

```
Phase 1 — Locate the PRD
Phase 2 — Explore the codebase (optional)
Phase 3 — Draft vertical slices
Phase 4 — Quiz the user
Phase 5 — creatte the issue files
```

---

## Phase 1 — Locate the PRD

ask the user for the PRD file path ex. 'issues/prd.md'

if the prd is not already in your context window, read it from the file.

### Phase 1 exit criteria

- [ ] User provided PRD path (or confirmed path from prior context)
- [ ] PRD content loaded — in context or read from disk
- [ ] Path recorded in working notes for downstream phases

---

## Phase 2 — Explore the codebase (optional)

if you have not already explored the codebase, do so to understand the current state of the code, use graphify query first, before using grep if context isn't available

### Phase 2 exit criteria

- [ ] Skipped — PRD discovery sections + prior context are sufficient, or codebase already explored this session
- [ ] Or completed — current-state notes captured for slice planning (paths, routes, gaps vs PRD)

---

## Phase 3 — Draft vertical slices

break the prd into **tracer bullet** issues. each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an achitectural decision or a design review. AFK slices can be implemented without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- prefer many thin slices over few thick ones
</vertical-slice-rules>

### Phase 3 deliverable (working notes — not yet on disk)

Draft a slice table internally; present to the user in Phase 4:

| # | Title | Mode | Layers touched | Demo / verify | Depends on | PRD refs |
|---|-------|------|----------------|---------------|------------|----------|
| 001 | … | AFK / HITL | schema, API, UI, tests | … | — | R-001 |

Issue **001** in the draft table is the tracer bullet (receives the first number assigned in this batch).

### Phase 3 exit criteria

- [ ] Every P0 requirement maps to ≥1 slice
- [ ] Each slice is vertical (all layers), not horizontal (one layer)
- [ ] Each slice labeled HITL or AFK; HITL justified where used
- [ ] Dependencies and execution order explicit
- [ ] Draft complete in working notes — **do not write issue files until Phase 4 approval**

---

## Phase 4 — Quiz the user

present the proposed breakdown as a numbered list. for each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories from the PRD this addresses

Ask the user:

- does the granularity feel right? (too coarse / too fine)
- are the dependecy relationships correct?
- should any slices be merged or split further?
- are the correct slices marked as HITL and AFK?

iterate until the user approves the breakdown.

### Phase 4 exit criteria

- [ ] Breakdown presented as numbered list with Title, Type, Blocked by, User stories covered per slice
- [ ] All four quiz questions asked (or user proactively addressed them)
- [ ] User explicitly approved the breakdown (e.g. "yes", "approved", "write them")

---

## Phase 5 — creatte the issue files

for each approved slice, write a markdown file in 'issues/' using the naming pattern 'issues/NNN-short-title.md' (ex. 'issues/001-add-user-auth.md')

number issues starting from the next available number (check what files already exist in 'issues/').

create files in dependenciy order (blockers first) so you can reference real filenames in the "blocked by" field.

Do NOT use 'gh issue create' or any GitHub CLI commands.

### Phase 5 exit criteria

- [ ] Listed existing `issues/` files; assigned numbers from next available
- [ ] One markdown file per approved slice at `issues/NNN-short-title.md`
- [ ] Files created in dependency order; **Blocked by** cites real paths (e.g. `issues/006-add-user-auth.md`)
- [ ] Each file follows [issue-template.md](issue-template.md)
- [ ] No `gh` / GitHub CLI commands used

---

## Output layout

Flat files in `issues/`:

| Pattern | Example |
|---------|---------|
| `issues/NNN-short-title.md` | `issues/001-add-user-auth.md` |

**Numbering:** Start at the next free `NNN` after listing existing `issues/*.md` (PRDs like `issues/prd-*.md` included — do not collide). Assign numbers sequentially as you write, in **dependency order** (blockers first).

**Short title:** Kebab-case, verb-led, outcome-focused (`add-user-auth`, `admin-list-templates`).

Never overwrite existing issue files without user approval — use the next free number or `-v2` suffix.

---

## Issue file format

Use [issue-template.md](issue-template.md). Each issue must stand alone: problem, scope, tasks, acceptance criteria, dependencies, and PRD traceability (requirement / module IDs).

---

## Session checklist

```
PRD → issues session:
- [ ] Phase 1: PRD path confirmed; content loaded
- [ ] Phase 2: Codebase explored or skipped (noted why)
- [ ] Phase 3: Vertical slices drafted (table); tracer bullet = 001
- [ ] Phase 4: User approved breakdown (iterated if needed)
- [ ] Phase 5: Issue files written to issues/NNN-short-title.md (dependency order)
- [ ] User informed: paths, slice count, recommended start issue
```

---

## Additional resources

- Issue markdown template: [issue-template.md](issue-template.md)
- Vertical slice heuristics: [vertical-slices.md](vertical-slices.md)
