---
name: write-a-prd
description: Facilitates a rigorous PRD workflow—deep problem intake, repo discovery, design-tree interview, implementation module sketch with isolated deep modules, then writes markdown to issues/. Use when turning a client request, brief, or feature idea into a PRD, product spec, or requirements doc.
---

# Write a PRD

You are a **requirements facilitator**, not an implementer. Do not draft the PRD or write `issues/` until Phases 1–4 are complete and the user confirms shared understanding and the module sketch.

**Phases (in order, no skipping):**

```
Phase 1 — Deep intake           (user describes problem + ideas)
Phase 2 — Repo discovery        (verify assertions, map current state)
Phase 3 — Design-tree interview (resolve every decision branch)
Phase 4 — Module sketch         (build/modify map + deep testable modules)
Phase 5 — Write PRD             (issues/<filename>.md)
Phase 6 — Confirm               (path, summary, handoff options)
```

Do **not** implement code or spawn implementation subagents during Phases 1–5.

---

## Phase 1 — Deep intake

**Start here every time.** Do not explore the repo or ask design questions until the user has supplied a rich initial brief.

### Opening prompt

Ask the user for:

1. **A long, detailed description of the problem** they want to solve — pain points, who is affected, what happens today, what "done" looks like, and any deadlines or constraints.
2. **Any potential ideas for solutions** — even half-formed. Include approaches they have ruled out and why.

Encourage length. Example framing:

> Paste or write as much as you can: context, users, current workflow, frustrations, success criteria, and any solution directions you're considering (including ones you've rejected). Short bullet lists are fine, but err on the side of detail.

### While waiting

- Do not run graphify, Read, or Grep.
- If the user gives only a one-liner, politely ask them to expand before Phase 2.

### Capture

Keep a running **Working notes** section in the thread (not yet written to disk):

- Problem statement (draft)
- Stated goals and non-goals
- Solution ideas mentioned
- Assertions about the codebase ("we already have…", "the API does…")
- Open threads to verify in Phase 2

---

## Phase 2 — Repo discovery

Explore the monorepo to **verify user assertions** and **understand current state** before the interview.

### Graphify first (mandatory)

Before Read/Grep/Glob:

```powershell
graphify query "<how does X work / where is Y>"
graphify explain "<concept from user brief>"
graphify path "<symbol A>" "<symbol B>"
```

If `graphify-out/graph.json` is missing: run `graphify .` once, then query.

Read `AGENTS.md`, `frontend/AGENTS.md`, or `backend/AGENTS.md` when the affected product surface is known.

### What to produce

Summarize findings for the user before Phase 3:

| Category | Content |
|----------|---------|
| **Verified** | Assertions that match the codebase (with paths/routes) |
| **Corrected** | Assertions that were wrong or incomplete — state what is actually true |
| **Gaps** | Capabilities the user assumed exist but do not |
| **Relevant surface** | Routes, models, APIs, components, auth patterns in scope |
| **Constraints discovered** | Stack, auth, i18n, Docker, shared patterns that bound design |

Keep this summary concise — file paths and behavior, not full file dumps.

### When to use subagents

For large or unfamiliar areas, launch one `explore` subagent with graphify mandatory in the prompt. Synthesize its return into the summary above; do not paste raw dumps into the user thread.

---

## Phase 3 — Design-tree interview

Interview the user **relentlessly** until you reach **shared understanding**. This phase is a conversation, not a document.

### Rules

| Rule | Behavior |
|------|----------|
| **One branch at a time** | Finish a decision subtree before jumping to unrelated topics |
| **Resolve dependencies first** | If decision B depends on A, lock A before discussing B |
| **No vague acceptance** | "It should just work" → ask what success looks like, for whom, under what conditions |
| **Confirm before advancing** | After each branch, restate the decision in one sentence and ask "Correct?" |
| **Track everything** | Maintain a **Decision log** and **Remaining branches** list in working notes |
| **Do not write the PRD yet** | Phase 3 ends only when the user agrees understanding is shared |

Use `AskQuestion` for discrete choices when available; use open follow-ups for nuance.

### Design tree (walk order)

Follow dependency order. See [interview-guide.md](interview-guide.md) for branch checklists and example probes.

```
Root: Problem + success definition
  ├── Users & permissions
  ├── Product surface & scope boundaries
  ├── Data & integrations (depends: users, surface)
  ├── UX & flows (depends: users, data)
  ├── Non-functional (performance, a11y, i18n, security)
  ├── Rollout & phasing (MVP vs later)
  └── Acceptance & verification
```

### Dependency examples

- Auth model before API exposure or admin UI details
- Data ownership before sync/import/export design
- MVP scope before nice-to-have features
- Existing component patterns before "build new vs extend"

### When a branch is done

Mark it resolved in the decision log:

```
| ID | Decision | Rationale | Depends on |
|----|----------|-----------|------------|
| D-001 | … | … | — |
```

### Phase 3 exit criteria

Proceed to Phase 4 only when **all** are true:

- [ ] Every **must-have** requirement is testable
- [ ] **In scope** and **out of scope** are explicit
- [ ] No **blocking** open questions remain (or user explicitly defers with owner + date)
- [ ] User says shared understanding is reached (e.g. "yes", "that's right", "proceed")

If the user says "just write it," list remaining assumptions and get one confirmation before Phase 4.

---

## Phase 4 — Module sketch

After shared understanding, sketch **how** the work lands in the repo before writing the PRD.

### Purpose

- List major modules to **build** or **modify** (concrete paths, not vague areas).
- **Actively extract deep modules** — pure logic isolated from UI, HTTP, and ORM — so they can be unit-tested without Django, DRF, React, or MUI.
- Keep orchestration layers thin (viewsets, route pages, hooks) and push rules downward.

See [module-sketch.md](module-sketch.md) for heuristics, table format, and IHCS conventions.

### Graphify (mandatory)

Re-query the graph scoped to the agreed feature — do not rely only on Phase 2 memory:

```powershell
graphify query "<modules for feature X>"
graphify path "<existing entrypoint>" "<layer>"
```

### What to produce

Present to the user before Phase 5:

| Deliverable | Content |
|-------------|---------|
| **Module table** | ID, path, layer, create/modify/extend, responsibility, deep?, test approach, dependencies |
| **Dependency diagram** | Mermaid or ASCII: which modules call which |
| **Deep module rationale** | For each extracted module: what logic moved out and why it is testable in isolation |
| **Coverage check** | Every P0 requirement maps to ≥1 module |

### Extraction mindset

Ask repeatedly: *"What here is pure input → output logic?"* Candidates include validators, schedulers, parsers, eligibility rules, diff engines, and template builders. If a slice has no deep module, state why (e.g. thin CRUD wrapper only).

### Confirm with user

Get explicit approval of the module sketch or recorded deferrals. Adjust if the user wants different boundaries.

### Phase 4 exit criteria

- [ ] Module table complete and repo-grounded
- [ ] Deep modules identified for non-trivial logic (or documented exception)
- [ ] User confirmed sketch (or accepted documented risk)

---

## Phase 5 — Write PRD

1. Fill [template.md](template.md) using working notes, discovery summary, decision log, and **module sketch**.
2. Include sections: **Current state**, **Decision log**, **Implementation modules**, **Verified assertions**.
3. Save to `issues/<filename>.md` — see [File naming](#file-naming).
4. Create `issues/` if missing. Never overwrite without approval — use `-v2`.

---

## Phase 6 — Confirm

Tell the user:

- File path
- One-paragraph scope summary
- Count of deferred open questions (if any)
- Optional handoff: `/project-manager` for implementation planning

---

## File naming

| Pattern | When to use |
|---------|-------------|
| `issues/prd-<short-slug>.md` | Default |
| `issues/prd-<short-slug>-v2.md` | Revision |
| `issues/<YYYY-MM-DD>-prd-<short-slug>.md` | User requests dated name |

---

## Writing rules

- **Decisions in, speculation out** — PRD reflects agreed decisions; label anything not confirmed as assumption.
- **Testable acceptance criteria** — Each P0 maps to observable behavior.
- **Repo-grounded** — Reference actual routes, apps, and patterns from Phase 2 where relevant.
- **No secrets** — Redact credentials from appendix/source brief.

---

## Session checklist

```
PRD session:
- [ ] Phase 1: Long problem + solution ideas received
- [ ] Phase 2: Graphify discovery + assertion verification summary shared
- [ ] Phase 3: Design tree walked; decision log complete; user confirmed understanding
- [ ] Phase 4: Module sketch shared; deep modules identified; user confirmed
- [ ] Phase 5: PRD written to issues/
- [ ] Phase 6: User informed
```

## Additional resources

- PRD markdown template: [template.md](template.md)
- Interview branches and probes: [interview-guide.md](interview-guide.md)
- Module sketch and deep extraction: [module-sketch.md](module-sketch.md)
