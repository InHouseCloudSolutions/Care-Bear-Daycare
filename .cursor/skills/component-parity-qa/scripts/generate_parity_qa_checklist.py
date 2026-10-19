#!/usr/bin/env python3
import argparse


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate parity QA checklist markdown.")
    parser.add_argument("--name", required=True, help="Component name")
    parser.add_argument("--reference", required=True, help="Reference URL or source note")
    args = parser.parse_args()

    print(f"# QA Checklist: {args.name}\n")
    print(f"Reference: {args.reference}\n")
    print("## Visual")
    print("- [ ] Spacing and layout match")
    print("- [ ] Typography and hierarchy match")
    print("- [ ] Colors, borders, shadows, radius match\n")
    print("## Behavior")
    print("- [ ] Hover state matches")
    print("- [ ] Focus state and focus ring match")
    print("- [ ] Active and disabled states match\n")
    print("## Responsive")
    print("- [ ] Mobile layout matches")
    print("- [ ] Tablet layout matches")
    print("- [ ] Desktop layout matches\n")
    print("## Accessibility")
    print("- [ ] Semantic elements/roles are correct")
    print("- [ ] Keyboard navigation works")
    print("- [ ] ARIA labels/attributes are present where needed")


if __name__ == "__main__":
    main()
