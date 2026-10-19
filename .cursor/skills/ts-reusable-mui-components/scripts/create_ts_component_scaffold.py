#!/usr/bin/env python3
import argparse
from pathlib import Path


TEMPLATE = """import { Box } from "@mui/material";
import type { ReactNode } from "react";

export interface {name}Props {{
  children?: ReactNode;
}}

export function {name}({{ children }}: {name}Props) {{
  return <Box>{{children}}</Box>;
}}
"""


def _resolve_under_root(path: str, root: Path) -> Path:
    normalized = path.replace("\\", "/")
    if ".." in normalized.split("/"):
        raise SystemExit("Path must not contain parent segments (..)")
    if Path(path).is_absolute():
        raise SystemExit("Absolute paths are not allowed")
    root_resolved = root.resolve()
    resolved = (root_resolved / path).resolve()
    if root_resolved not in resolved.parents and resolved != root_resolved:
        raise SystemExit(f"Path must be under {root_resolved}")
    return resolved


def main() -> None:
    parser = argparse.ArgumentParser(description="Create TSX component scaffold.")
    parser.add_argument("--name", required=True, help="Component name, e.g. FeatureCard")
    parser.add_argument("--out", required=True, help="Output file path, e.g. frontend/components/FeatureCard.tsx")
    args = parser.parse_args()

    out_path = _resolve_under_root(args.out, Path.cwd())
    out_path.parent.mkdir(parents=True, exist_ok=True)
    content = TEMPLATE.format(name=args.name)
    out_path.write_text(content, encoding="utf-8")
    print(f"Created {out_path}")


if __name__ == "__main__":
    main()
