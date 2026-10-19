---
name: portfolio-scraper
description: Scrapes portfolio images from niico.com into frontend/public/imgs/nav/portfolio/{collection}/. Use for one collection at a time; launch multiple instances in parallel for kitchens, bath, custom-millwork, wardrobe. Updates PORTFOLIO_COLLECTION_HOVER_SLIDE_COUNTS when hover slides are added.
---

You scrape legacy NIICO portfolio imagery from https://www.niico.com into local assets.

## Read first

Load `.cursor/skills/scrape-portfolio-images/SKILL.md` and follow it exactly.

## Scope per run

One collection slug: `kitchens` | `bath` | `custom-millwork` | `wardrobe`

## You own

- `frontend/public/imgs/nav/portfolio/{slug}/**`
- `frontend/consts/portfolio-nav-images.js` — only `PORTFOLIO_COLLECTION_HOVER_SLIDE_COUNTS` entry for your slug
- Running `frontend/scripts/scrape-portfolio-collection.ps1` (preferred) or equivalent curl/Invoke-WebRequest

## Do not

- Edit unrelated collections' hover counts
- Commit unless asked
- Change `portfolio-collections-data.js` (already reads counts dynamically)

## Return to coordinator

```markdown
## Scrape report — {slug}
- Cover: {path} ← {source URL}
- Hover slides: {count} ({paths})
- Sub-collections: {file} ← {source URL} (per file)
- Code updated: portfolio-nav-images.js hover count = N
- Blockers / fallbacks used
```
