---
name: run-local-ci
description: Runs local lint and test commands matching GitHub Actions CI. Use after implementation, before PRs, or during discovery to confirm repro/fix.
---

# Run Local CI

Commands mirror [`.github/workflows/test-frontend.yml`](.github/workflows/test-frontend.yml).

## Frontend

Working directory: `frontend/`

```bash
corepack enable
yarn install --immutable
yarn lint
```

Optional:

```bash
yarn test
yarn build
```

## When to Run

| Phase | What to run |
|-------|-------------|
| After frontend changes | yarn lint |
| Before PR | full frontend lint |
| During discovery | targeted test to confirm bug repro |

## Reporting

Return to coordinator:

- Pass/fail per check
- Relevant error output (truncated)
- Suggested fix if failure is in changed code
