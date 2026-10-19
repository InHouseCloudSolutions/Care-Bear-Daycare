---
name: full-stack-feature
description: Coordinates frontend and backend work for features spanning both stacks. Use for API contract discovery, parallel subagent delegation, and snake_case to camelCase field mapping.
---

# Full-Stack Feature

Coordinate `frontend-dev` and `backend-dev` for cross-stack work.

## Discovery Checklist

Define the **API contract** before implementation:

- [ ] HTTP method and path (e.g. `GET /api/trade-partner-applications/`)
- [ ] Auth: session cookies (`withCredentials`) or public (`/t/public/`)?
- [ ] Request payload shape (field names, types, required vs optional)
- [ ] Response shape (single object, list, pagination)
- [ ] Error format (field-level vs detail message)
- [ ] Which side owns validation (backend always; frontend mirrors for UX)

## API Contract Template

Include this in the Discovery Brief and both subagent prompts:

```markdown
## API Contract

- **Method / Path**:
- **Auth**: session | public
- **Request**:
  ```json
  { "fieldName": "type" }
  ```
- **Response (success)**:
  ```json
  { "id": 1, "fieldName": "value" }
  ```
- **Response (error)**: field errors object or `{ "detail": "..." }`
```

## Field Naming

| Layer | Convention | Example |
|-------|------------|---------|
| Python model/serializer | snake_case | `email_address` |
| JSON (automatic) | camelCase | `emailAddress` |
| Frontend JS | camelCase | `emailAddress` |

## Delegation Pattern

1. Complete discovery + API contract + user confirmation
2. Launch **backend-dev** and **frontend-dev** in parallel when independent:
   - Backend: model, migration, serializer, view, tests
   - Frontend: page, component, API call, error handling
3. Backend should land first if frontend depends on new endpoint — otherwise parallel is fine if contract is fixed

## Handoff Prompt Template

```
Discovery Brief: [summary]
API Contract: [template above]
Backend task: [specific deliverables]
Frontend task: [specific deliverables]
Constraints: minimal diff, match existing patterns, no commits
Return: summary, files changed, test results, blockers
```

## Verification

After both subagents complete, run `run-local-ci` skill:
- Backend: targeted pytest + ruff
- Frontend: yarn lint

## Related Skills

- Public forms → `add-public-form`
- Staff API only → `add-drf-endpoint`
- Discovery workflow → `discovery-phase`
