---
name: ts-reusable-mui-components
description: Implements reusable TypeScript-first MUI components for Next.js with strict prop typing and predictable APIs. Use when creating or refactoring TS/TSX component implementations before JavaScript parity.
---

# TypeScript Reusable MUI Components

## When to use

Use this skill when building a new component in `ts` or `tsx`, tightening prop contracts, or preparing a canonical implementation for JS parity.

## Instructions

1. Define explicit `Props` type or interface for each exported component.
2. Avoid `any`; use unions, generics, and utility types when needed.
3. Keep component API small and composable.
4. Ensure MUI styling parity is represented through typed props and controlled variants.
5. Export shared prop types if wrappers or composition layers reuse them.
6. Include accessibility-focused props where behavior depends on semantics.

## Output format

```markdown
Component: <name>

Type decisions:
- <prop model and constraints>

API shape:
- <required props>
- <optional props with defaults>

Parity alignment:
- <how TS model supports 1:1 MUI output>
```

## Utility script

Use `scripts/create_ts_component_scaffold.py` to scaffold a typed component shell:

```bash
python .cursor/skills/ts-reusable-mui-components/scripts/create_ts_component_scaffold.py --name "FeatureCard" --out "frontend/components/FeatureCard.tsx"
```
