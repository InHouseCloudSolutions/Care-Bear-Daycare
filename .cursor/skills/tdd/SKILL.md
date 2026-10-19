---
name: tdd
description: Test-driven development with vertical tracer bullets. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", TDD, or wants integration-style tests. Runs Vitest (frontend) or pytest (backend) in tight RED→GREEN→REFACTOR cycles.
---

# Test-Driven Development

## Philosophy

**Core principle**: Tests should verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't.

**Good tests** are integration-style: they exercise real code paths through public APIs. They describe _what_ the system does, not _how_ it does it. A good test reads like a specification — "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

**Bad tests** are coupled to implementation. They mock internal collaborators, test private methods, or verify through external means (like querying a database directly instead of using the interface). The warning sign: your test breaks when you refactor, but behavior hasn't changed. If you rename an internal function and tests fail, those tests were testing implementation, not behavior.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" — treating RED as "write all tests" and GREEN as "write all code."

This produces **crap tests**:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You end up testing the _shape_ of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes — they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle. Because you just wrote the code, you know exactly what behavior matters and how to verify it.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## IHCS test stack

| Layer | Runner | Config | Typical location |
|-------|--------|--------|------------------|
| Frontend lib/utils | Vitest | `frontend/vitest.config.ts` | `frontend/src/**/*.test.ts` |
| Backend | pytest + pytest-django | `backend/pyproject.toml` → `config.settings.test` | `backend/apps/*/tests/` or `tests.py` |

**Run one test file** (PowerShell — chain with `;`, not `&&`):

```powershell
cd frontend; yarn test src/lib/signature-design/compile.test.ts
cd backend; uv run pytest apps/signatures/tests/test_compile.py -q
```

**Run a single test** by name:

```powershell
cd backend; uv run pytest apps/signatures/tests/test_compile.py::CompileDesignTests::test_compile_emits_table_layout -q
cd frontend; yarn test src/lib/signature-design/compile.test.ts -t "emits table layout"
```

After each RED or GREEN step, **run the test** and show the user pass/fail output. Do not claim a cycle is complete without executing the runner.

## Workflow

### 1. Planning

Before writing any code:

1. **Orient** — run `graphify query "<how does X work / where are tests for Y>"` before Read/Grep. Read `frontend/AGENTS.md` or `backend/AGENTS.md` for conventions. If `CONTEXT.md` exists in the area, read it for domain vocabulary.
2. **Confirm scope** with the user (use `AskQuestion` when available):
   - What interface changes are needed?
   - Which behaviors to test (prioritized)?
3. **Deep modules** — for interface design and testability checks, read [codebase-design/SKILL.md](../codebase-design/SKILL.md).
4. **List behaviors** to test (not implementation steps) and get user approval.

Ask: "What should the public interface look like? Which behaviors are most important to test?"

**You can't test everything.** Confirm with the user exactly which behaviors matter most. Focus testing effort on critical paths and complex logic, not every possible edge case.

### 2. Tracer Bullet

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test for first behavior → run runner → test fails
GREEN: Write minimal code to pass → run runner → test passes
```

This is your tracer bullet — proves the path works end-to-end.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → run → fails
GREEN: Minimal code to pass → run → passes
```

Rules:

- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior
- Match existing test style in the target app (e.g. Vitest `describe`/`it`, Django `SimpleTestCase` or `APITestCase`)

### 4. Refactor

After all tests pass, look for [refactor candidates](refactoring.md):

- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] Consider what new code reveals about existing code
- [ ] Run tests after each refactor step

**Never refactor while RED.** Get to GREEN first.

### 5. Finish

- Run the full relevant suite (`yarn test` or `uv run pytest`) before reporting done
- If you changed production code files, run `graphify update .` to refresh the graph

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
[ ] Runner executed and output verified
```

## When tests are not the right tool

Skip or defer TDD when:

- Pure UI/layout parity work (Tailwind → MUI) — use component-parity-qa instead
- One-off config, copy, or migration-only changes with no behavior seam
- User explicitly asked for implementation without tests

Offer TDD for logic, APIs, serializers, compile pipelines, and other behavior with a clear public interface.
