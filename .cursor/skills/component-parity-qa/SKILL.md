---
name: component-parity-qa
description: Verifies visual, behavioral, responsive, and accessibility parity for Tailwind-to-MUI component recreations. Use when validating finished components, reviewing parity quality, or preparing merge-ready component updates.
---

# Component Parity QA

## When to use

Use this skill after implementing or updating a component variant to confirm parity quality before moving on.

## Instructions

1. Validate visual parity across spacing, typography, color, borders, and shadows.
2. Validate behavior parity across hover, focus, active, disabled, and keyboard interactions.
3. Validate responsive parity at relevant breakpoints.
4. Validate accessibility semantics (`aria-*`, roles, focus visibility, tab order).
5. Record pass/fail per category and list actionable fixes.
6. Do not mark complete until all critical checks pass.

## Output format

```markdown
Component: <name>
Reference: <url or source>

QA status:
- Visual: pass|fail
- Behavior: pass|fail
- Responsive: pass|fail
- Accessibility: pass|fail

Fixes needed:
- <itemized fixes or "none">
```

## Utility script

Use `scripts/generate_parity_qa_checklist.py` to produce a reusable markdown checklist:

```bash
python .cursor/skills/component-parity-qa/scripts/generate_parity_qa_checklist.py --name "FeatureCard" --reference "https://example.com"
```
