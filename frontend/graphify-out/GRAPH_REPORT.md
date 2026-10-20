# Graph Report - frontend  (2026-10-19)

## Corpus Check
- 82 files · ~446,864 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 480 nodes · 591 edges · 55 communities (33 shown, 22 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c1c0fb15`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]

## God Nodes (most connected - your core abstractions)
1. `resolutions` - 37 edges
2. `scripts` - 10 edges
3. `isExternalHref()` - 7 edges
4. `MarketingNavDesktopLink()` - 6 edges
5. `isMarketingNavLinkActive()` - 6 edges
6. `staffPath()` - 6 edges
7. `canUseStorage()` - 6 edges
8. `DogHotelInteriorPage()` - 5 edges
9. `useMarketingNavDrawerItems()` - 5 edges
10. `isIndexablePublicPath()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Custom404()` --calls--> `staffPath()`  [INFERRED]
  components/Custom404/index.js → consts/routes.js
- `sitePhotoSrc()` --calls--> `publicPath()`  [INFERRED]
  components/dog-hotel/ReviewsPage.js → utils/publicPath.js
- `BookStayButton()` --calls--> `isExternalHref()`  [INFERRED]
  components/dog-hotel/ReviewsPage.js → consts/routes.js
- `HeroCta()` --calls--> `isExternalHref()`  [INFERRED]
  components/home-landing/HomeLandingPage.js → consts/routes.js
- `externalLinkProps()` --calls--> `isExternalHref()`  [INFERRED]
  components/home-landing/LuxuryNavDrawerList.js → consts/routes.js

## Import Cycles
- None detected.

## Communities (55 total, 22 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (35): FORM_PAGE_MOBILE_MAIN_SCROLL_SX, FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX, GLASS_FIELD_SURFACE_SX, GLASS_FIELD_WRAPPER_SX, GLASS_FORM_FOOTER_SX, GLASS_FORM_PAIR_STACK_SPACING, GLASS_FORM_PANEL_HORIZONTAL_PAD, GLASS_FORM_PANEL_PADDING_SCROLL_PANEL_SX (+27 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (37): resolutions, @babel/plugin-transform-modules-systemjs@npm:^7.29.0, baseline-browser-mapping@npm:^2.10.44, brace-expansion@npm:1.1.15, brace-expansion@npm:^1.1.7, brace-expansion@npm:^2.0.1, brace-expansion@npm:2.1.1, brace-expansion@npm:5.0.6 (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (36): dependencies, axios, @azure/storage-blob, date-fns, dayjs, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (+28 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (26): HOME_LUXURY_DRAWER_PAPER_SX, HOME_NAV_BAR_PX, HOME_NAV_BAR_PY, HOME_NAV_DESKTOP_DISPLAY, HOME_NAV_ITEMS_BASE, HOME_NAV_MOBILE_DISPLAY, MARKETING_INTERIOR_NAV_ITEMS_BASE, MARKETING_INTERIOR_NAV_LINK_HOVER_UNDERLINE_COLOR (+18 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (24): devDependencies, css-mediaquery, eslint, eslint-config-airbnb, eslint-config-next, eslint-config-prettier, eslint-plugin-import, eslint-plugin-jest (+16 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (10): flattenNavItemsForDrawer(), MARKETING_NAV_TREE, isHomeRoute(), isMarketingInteriorRoute(), isMarketingRoute(), staffLoginHref(), staffPath(), staffPathSuffix() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (10): bodySx, CARE_POINTS, CARRIE_PHOTO_SRC, DOGS_PHOTO_SRC, sectionHeadingSx, DogHotelInteriorPage(), footerTextSx, headingSx (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.20
Nodes (12): averageStarRating(), countReviews(), REVIEWS, sortReviewsNewestFirst(), newer, older, sameDayLater, bodySx (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (14): name, packageManager, private, scripts, build, dev, fix, lint (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (11): HOME_BRAND, HOME_FOOTER, HOME_FOOTER_SOCIAL_LINKS, footerLinkSx, footerTextSx, HomeLandingFooter(), SOCIAL_ICONS, socialIconButtonSx (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.21
Nodes (9): publicPath(), buildShareMetadata(), homePageJsonLd(), OG_IMAGE_PATH, pageMetadata(), PUBLIC_SITE_ORIGIN, WEBSITE_SEO, HomePage() (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.21
Nodes (9): EmotionCacheProvider(), marketingMetadataHost(), metadata, metadataBaseFromHost(), OG_IMAGE_PATH, ogImageUrl(), shareImageUrl, viewport (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.23
Nodes (9): LUXURY_DRAWER_NAV_GROUP_TYPOGRAPHY_SX, LUXURY_DRAWER_NAV_ITEM_ENTER_SX, LUXURY_DRAWER_NAV_ITEM_RESET_SX, LUXURY_DRAWER_NAV_PRIMARY_TYPOGRAPHY_SX, LUXURY_DRAWER_NAV_SECTION_TYPOGRAPHY_SX, LUXURY_DRAWER_NAV_SUBLINK_TYPOGRAPHY_SX, MEGA_MENU_CONTAINER_PY_SX, MEGA_MENU_IMAGE_HEIGHT_SX (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.24
Nodes (11): isExternalHref(), BookStayButton(), HOME_NAV_LINK_TYPOGRAPHY_SX, isMarketingNavLinkActive(), marketingNavLinkHoverUnderlineSx(), normalizeMarketingNavPath(), HeroCta(), externalLinkProps() (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.17
Nodes (10): LUXURY_GRADIENT_SX, MARKETING_FORM_COLUMN_INNER_SX, MARKETING_FORM_COLUMN_SX, MARKETING_FORM_FLEX_SECTION_SX, MARKETING_FORM_GRID_SX, MARKETING_FORM_HERO_COLUMN_SX, MARKETING_FORM_PAGE_CONTENT_SX, MARKETING_FORM_PAGE_GRID_SX (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.32
Nodes (10): canUseStorage(), clearSettings(), readSettingsRaw(), readStorageItem(), writeSettingsRaw(), writeStorageItem(), DEFAULT_SETTINGS, loadSettings() (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.20
Nodes (6): AppBootGate(), AuthGateClientApp(), AuthGateClientPages(), AuthContext, EMPTY_AUTH, useAuth()

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (7): BAR_SX, BREATHE_SX, MARK_150_INLINE_STYLE, MARK_68_INLINE_STYLE, OVERLAY_INLINE_STYLE, REDUCE_MOTION, SPIN_SX

### Community 18 - "Community 18"
Cohesion: 0.36
Nodes (7): RobotsMeta(), isIndexablePublicPath(), NON_INDEXABLE_PATHS, ROBOTS_INDEX, ROBOTS_NOINDEX, robotsMetaContent(), robotsMetadataForPath()

### Community 19 - "Community 19"
Cohesion: 0.36
Nodes (7): galleryImageFromApi(), galleryImagesFromApi(), galleryMediaSrc(), normalizeGalleryImageList(), photographerCreditFrom(), CreditedImage(), watermarkSx

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (5): HomeHeroSlidesContext, homeHeroSlideShape, useHomeHeroSlides(), HOME_HERO_SLIDES, HomeHeroBackground()

### Community 23 - "Community 23"
Cohesion: 0.50
Nodes (4): GalleryRoute(), IMAGE_EXTENSIONS, listGalleryImages(), metadata

### Community 25 - "Community 25"
Cohesion: 0.40
Nodes (4): compilerOptions, baseUrl, paths, @/*

### Community 28 - "Community 28"
Cohesion: 0.50
Nodes (3): splashBeVietnam, splashFontClassName, splashNewsreader

### Community 30 - "Community 30"
Cohesion: 0.50
Nodes (3): config, withImages, withPlugins

## Knowledge Gaps
- **231 isolated node(s):** `REDUCE_MOTION`, `SPIN_SX`, `BAR_SX`, `BREATHE_SX`, `OVERLAY_INLINE_STYLE` (+226 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `isExternalHref()` connect `Community 13` to `Community 5`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `BookStayButton()` connect `Community 13` to `Community 7`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `isMarketingNavLinkActive()` connect `Community 13` to `Community 12`, `Community 5`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `isExternalHref()` (e.g. with `BookStayButton()` and `isMarketingNavLinkActive()`) actually correct?**
  _`isExternalHref()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `REDUCE_MOTION`, `SPIN_SX`, `BAR_SX` to the rest of the system?**
  _231 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06707317073170732 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._