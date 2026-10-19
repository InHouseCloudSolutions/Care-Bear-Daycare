---
name: scrape-portfolio-images
description: Scrapes niico.com collection and sub-collection images into frontend/public/imgs/nav/portfolio/. Use when migrating portfolio cover, hover carousel, or sub-collection nav images from the legacy site.
---

# Scrape Portfolio Images (niico.com → local)

## When to use

- User asks to scrape portfolio images for a collection (kitchens, bath, custom-millwork, wardrobe)
- Coordinator launches **one subagent per collection** in parallel

## Run (preferred)

```powershell
cd frontend
powershell -File scripts/scrape-portfolio-collection.ps1 -CollectionSlug bath
```

Script writes assets and prints a report. Subagent then updates `PORTFOLIO_COLLECTION_HOVER_SLIDE_COUNTS` in `frontend/consts/portfolio-nav-images.js`.

## Output layout

```
public/imgs/nav/portfolio/{slug}/
  cover.jpg
  hover/slide-1.jpg, slide-2.jpg, …
  {sub-file}.jpg   # see PORTFOLIO_NAV_SUB_COLLECTION_FILES in portfolio-nav-images.js
```

## Sub-collection route → filename

| Collection | Route slug | Local file |
|------------|------------|------------|
| kitchens | `accessories-kitchen` | `accessories.jpg` |
| kitchens | `details-kitchen` | `details-millwork.jpg` |
| bath | `accessories-bath` | `accessories.jpg` |
| bath | `details-bath` | `details-millwork.jpg` |
| custom-millwork | `accessories-custom` | `accessories.jpg` |
| custom-millwork | `details-custom` | `details-millwork.jpg` |
| wardrobe | `accessories-wardrobe` | `accessories.jpg` |
| wardrobe | `details-wardrobe` | `details-millwork.jpg` |

Other sub-routes use the route slug as the filename (e.g. `framed` → `framed.jpg`).

## Image source priority

1. **Cover** — first `collection-image` on `/collections/{slug}`; if empty, first hover candidate or first sub-collection hero
2. **Hover slides** — all unique `collection-image` on collection page, in DOM order; if none, first image from each sub-collection page
3. **Sub-collection files** — first `collection-image` on `/sub-collections/{route-slug}`

Prefer `-p-1080` or `-p-1600` CDN variants when downloading.

## After download

1. Count files in `{slug}/hover/slide-*.jpg`
2. Set `PORTFOLIO_COLLECTION_HOVER_SLIDE_COUNTS.{slug}` to that count in `portfolio-nav-images.js`
3. Report sources (URL → local path) to coordinator

## Parallel coordination

Main agent can launch four `portfolio-scraper` / `shell` subagents:

- `-CollectionSlug kitchens`
- `-CollectionSlug bath`
- `-CollectionSlug custom-millwork`
- `-CollectionSlug wardrobe`

Each subagent touches only its `{slug}/` folder and its hover count key.
