# Graph Report - doghotel  (2026-10-20)

## Corpus Check
- 120 files · ~914,742 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1100 nodes · 1491 edges · 90 communities (81 shown, 9 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 1% AMBIGUOUS · INFERRED: 162 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `68d771de`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Marketing Nav Tree|Marketing Nav Tree]]
- [[_COMMUNITY_About and Hero Slides|About and Hero Slides]]
- [[_COMMUNITY_Glass Form Surfaces|Glass Form Surfaces]]
- [[_COMMUNITY_Public Route Pages|Public Route Pages]]
- [[_COMMUNITY_App Layout and SEO|App Layout and SEO]]
- [[_COMMUNITY_Theme and Robots Meta|Theme and Robots Meta]]
- [[_COMMUNITY_Yarn Resolutions|Yarn Resolutions]]
- [[_COMMUNITY_Frontend Dependencies|Frontend Dependencies]]
- [[_COMMUNITY_Discovery and Domain Skills|Discovery and Domain Skills]]
- [[_COMMUNITY_App Boot Splash|App Boot Splash]]
- [[_COMMUNITY_Lint Dev Dependencies|Lint Dev Dependencies]]
- [[_COMMUNITY_PRD Interview Guide|PRD Interview Guide]]
- [[_COMMUNITY_Settings and Storage|Settings and Storage]]
- [[_COMMUNITY_Gallery Image Helpers|Gallery Image Helpers]]
- [[_COMMUNITY_Brand Marketing Tokens|Brand Marketing Tokens]]
- [[_COMMUNITY_Small Dog Close-up|Small Dog Close-up]]
- [[_COMMUNITY_Beach Running Dog|Beach Running Dog]]
- [[_COMMUNITY_Design It Twice|Design It Twice]]
- [[_COMMUNITY_Pink Studio Portrait|Pink Studio Portrait]]
- [[_COMMUNITY_Beach Bounding Dog|Beach Bounding Dog]]
- [[_COMMUNITY_Package Scripts|Package Scripts]]
- [[_COMMUNITY_Primary Brand Mark|Primary Brand Mark]]
- [[_COMMUNITY_Coastal Herding Dog|Coastal Herding Dog]]
- [[_COMMUNITY_Public Form Skill|Public Form Skill]]
- [[_COMMUNITY_Pug Studio Portrait|Pug Studio Portrait]]
- [[_COMMUNITY_Blue Studio Bulldog|Blue Studio Bulldog]]
- [[_COMMUNITY_Trail Running Corgi|Trail Running Corgi]]
- [[_COMMUNITY_Homepage Bulldog Portrait|Homepage Bulldog Portrait]]
- [[_COMMUNITY_CI and Pre-commit|CI and Pre-commit]]
- [[_COMMUNITY_Jest and Next Config|Jest and Next Config]]
- [[_COMMUNITY_Patio Puppy Portrait|Patio Puppy Portrait]]
- [[_COMMUNITY_Alternate Logo Lockup|Alternate Logo Lockup]]
- [[_COMMUNITY_Horizontal Ads Logo|Horizontal Ads Logo]]
- [[_COMMUNITY_PRD Interview Branches|PRD Interview Branches]]
- [[_COMMUNITY_Docker Compose Dev|Docker Compose Dev]]
- [[_COMMUNITY_Ads Logo Lockup|Ads Logo Lockup]]
- [[_COMMUNITY_Horizontal Brand Logo|Horizontal Brand Logo]]
- [[_COMMUNITY_Gallery Running Dogs|Gallery Running Dogs]]
- [[_COMMUNITY_Yellow Pug Portrait|Yellow Pug Portrait]]
- [[_COMMUNITY_Square Brand Logo|Square Brand Logo]]
- [[_COMMUNITY_Contact Form Type|Contact Form Type]]
- [[_COMMUNITY_Site Documents Context|Site Documents Context]]
- [[_COMMUNITY_JSConfig Path Alias|JSConfig Path Alias]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Beach Facing Dog|Beach Facing Dog]]
- [[_COMMUNITY_Patio Tulip Puppy|Patio Tulip Puppy]]
- [[_COMMUNITY_Portfolio Scraper Skill|Portfolio Scraper Skill]]
- [[_COMMUNITY_Staff Gallery DataGrid|Staff Gallery DataGrid]]
- [[_COMMUNITY_MUI Component Scaffold|MUI Component Scaffold]]
- [[_COMMUNITY_Domain Findings|Domain Findings]]
- [[_COMMUNITY_Scrollbar Thumb Token|Scrollbar Thumb Token]]
- [[_COMMUNITY_Scrollbar Track Token|Scrollbar Track Token]]
- [[_COMMUNITY_Hero Nav Glass Style|Hero Nav Glass Style]]
- [[_COMMUNITY_Form Short Content Style|Form Short Content Style]]
- [[_COMMUNITY_Form Short Grid Style|Form Short Grid Style]]
- [[_COMMUNITY_Editor Format Settings|Editor Format Settings]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 96|Community 96]]

## God Nodes (most connected - your core abstractions)
1. `resolutions` - 37 edges
2. `PRD to Issues` - 20 edges
3. `scripts` - 15 edges
4. `Test-Driven Development` - 15 edges
5. `DogHotelInteriorPage()` - 12 edges
6. `Discovery Phase` - 12 edges
7. `Full-Stack Feature` - 11 edges
8. `Write a PRD` - 11 edges
9. `Homepage Slide Photograph` - 11 edges
10. `Small Dog` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Thin pages` --rationale_for--> `HomePage()`  [INFERRED]
  .cursor/agents/frontend-dev.md → frontend/src/app/(website)/page.js
- `NIICO portfolio collections` --conceptually_related_to--> `normalizeGalleryImageList()`  [INFERRED]
  .cursor/agents/portfolio-scraper.md → frontend/utils/galleryImage.js
- `pre-commit Prettier` --semantically_similar_to--> `Frontend Lint Job`  [INFERRED] [semantically similar]
  .pre-commit-config.yaml → .github/workflows/test-frontend.yml
- `metadata` --semantically_similar_to--> `Public crawler rules`  [INFERRED] [semantically similar]
  frontend/src/app/(website)/layout.js → frontend/public/robots.txt
- `frontend-dev agent` --conceptually_related_to--> `RootLayout()`  [INFERRED]
  .cursor/agents/frontend-dev.md → frontend/src/app/layout.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Splash screen boot flow** — components_appbootgate_appbootgate, components_apploadingscreen_apploadingscreen, components_apploadingscreen_quietcentresplash, components_apploadingscreen_editorialsplash, components_loading_screen_fonts_splashfontclassname [EXTRACTED 1.00]
- **Protected route auth redirect** — components_authgateclient_authgateclient, components_authgateclient_authgateclientapp, components_authgateclient_authgateclientpages [EXTRACTED 1.00]
- **Frontend module alias resolution** — frontend_jsconfig_paths, frontend_next_config_config, frontend_jest_config_config, frontend_eslintrc_config [INFERRED 0.85]
- **Shared Marketing Navigation Chrome** — home_landing_homeheronav_homeheronav, home_landing_marketinginteriornav_marketinginteriornav, home_landing_marketingwordmark_marketingwordmark, home_landing_marketingnavdesktopitem_marketingnavdesktopitem, home_landing_marketingnavdrawerpanel_marketingnavdrawerpanel [INFERRED 0.95]
- **Dog Hotel Interior Content Pages** — dog_hotel_aboutpage_aboutpage, dog_hotel_gallerypage_gallerypage, dog_hotel_howastayworkspage_howastayworkspage, dog_hotel_doghotelinteriorpage_doghotelinteriorpage [EXTRACTED 1.00]
- **Frosted Liquid Glass Surface System** — design_studio_design_studio_glass_nav_gallery_glass_sx, design_studio_design_studio_glass_nav_drawer_glass_sx, design_studio_design_studio_glass_liquid_glass_panel_sx, design_studio_design_studio_glass_glass_tab_label_sx, design_studio_glasstabtextfield_glasstabtextfield, home_landing_home_landing_data_home_luxury_drawer_paper_sx [INFERRED 0.85]
- **Public marketing nav tree, drawer, and live routes** — consts_marketing_nav_marketing_nav_tree, consts_marketing_nav_flattennavitemsfordrawer, home_landing_marketing_nav_drawer_buildmobiledraweritems, consts_routes_ismarketingroute, website_layout_websitelayout [EXTRACTED 1.00]
- **Route shell, theme mode, and Care Bear palette** — layouts_routethemeshell_routethemeshell, contexts_themecontext_themecontext, lib_createapptheme_createapptheme, consts_website_theme_care_bear_palette [EXTRACTED 1.00]
- **Staff path prefix, route check, and crawler disallow** — consts_routes_staff_prefix, consts_routes_isstaffroute, public_robots, layouts_routethemeshell_routethemeshell [INFERRED 0.85]
- **Care Bear Daycare public SEO** — website_page_homepage, utils_website_seo_pagemetadata, utils_website_seo_website_seo, utils_website_seo_homepagejsonld, app_sitemap_sitemap, utils_seo_isindexablepublicpath, app_layout_metadata [INFERRED 0.85]
- **Gallery media normalization** — utils_galleryimage_photographercreditfrom, utils_galleryimage_gallerymediasrc, utils_galleryimage_galleryimagefromapi, utils_galleryimage_galleryimagesfromapi, utils_galleryimage_normalizegalleryimagelist [EXTRACTED 1.00]
- **Deep module glossary** — codebase_design_skill_module, codebase_design_skill_interface, codebase_design_skill_seam, codebase_design_skill_adapter, codebase_design_skill_depth, codebase_design_skill_leverage, codebase_design_skill_locality [EXTRACTED 1.00]
- **Architecture review loop** — improve_codebase_architecture_skill_improve_codebase_architecture, improve_codebase_architecture_skill_deletion_test, improve_codebase_architecture_skill_deepening_opportunity, improve_codebase_architecture_html_report_architecture_review, grilling_skill_grilling, domain_modeling_skill_domain_modeling [EXTRACTED 1.00]
- **PRD vertical-slice issue breakdown** — prd_to_issues_skill_prd_to_issues, prd_to_issues_skill_vertical_slice, prd_to_issues_skill_tracer_bullet, prd_to_issues_skill_hitl, prd_to_issues_skill_afk, prd_to_issues_issue_template_issue_template [EXTRACTED 1.00]
- **TDD vertical cycle** — tdd_skill_tdd, tdd_skill_red_green_refactor, tdd_tests_public_interface_tests, tdd_mocking_boundary_mocks, tdd_refactoring_refactor_candidates [EXTRACTED 1.00]
- **PRD Session Phases 1–6** — write_a_prd_skill_phase1_deep_intake, write_a_prd_skill_phase2_repo_discovery, write_a_prd_skill_phase3_design_tree, write_a_prd_skill_phase4_module_sketch, write_a_prd_skill_phase5_write_prd, write_a_prd_skill_phase6_confirm [EXTRACTED 1.00]
- **Care Bear Daycare Marketing System** — brand_reference_marketing_tokens, brand_reference_nunito, brand_reference_hero_buttons, brand_reference_nav, brand_reference_glass_contact, brand_reference_reject_millwork [EXTRACTED 1.00]
- **Care Bear Local Runtime** — readme_local_docker, docker_compose_frontend, docker_compose_caddy, zygoat_settings [INFERRED 0.85]
- **Calm Dog Lifestyle Gallery Slide** — gallery_slide_001_subject, gallery_slide_001_setting, gallery_slide_001_design_role [INFERRED 0.85]
- **Outdoor beach portrait of a panting dog** — gallery_slide_002_photo, gallery_slide_002_dog, gallery_slide_002_beach, gallery_slide_002_ocean [EXTRACTED 1.00]
- **Dog Running Through Surf on a Pebble Beach** — gallery_slide_003_copper_dog, gallery_slide_003_sea_foam, gallery_slide_003_pebble_beach, gallery_slide_003_ocean, gallery_slide_003_pastel_sky [EXTRACTED 1.00]
- **Wet Copper Dog with Collar, White Chest, and Raised Tail** — gallery_slide_003_copper_dog, gallery_slide_003_wet_coat, gallery_slide_003_white_chest, gallery_slide_003_open_mouth, gallery_slide_003_raised_tail, gallery_slide_003_collar_tag [EXTRACTED 1.00]
- **Black Pug in a Knit Sweater Against a Yellow Backdrop** — gallery_slide_004_black_pug, gallery_slide_004_knit_sweater, gallery_slide_004_yellow_backdrop, gallery_slide_004_upward_gaze [EXTRACTED 1.00]
- **Wrinkled Muzzle, Round Eyes, and Folded Ears** — gallery_slide_004_black_pug, gallery_slide_004_wrinkled_muzzle, gallery_slide_004_round_eyes, gallery_slide_004_folded_ears [EXTRACTED 1.00]
- **Two dogs running a sunlit dirt path** — gallery_slide_005_corgi, gallery_slide_005_longhair, gallery_slide_005_dirt_path, gallery_slide_005_golden_hour [EXTRACTED 1.00]
- **Styled French Bulldog Studio Portrait** — gallery_slide_006_french_bulldog, gallery_slide_006_yellow_hoodie, gallery_slide_006_blue_seamless_backdrop, gallery_slide_006_closed_eye_pose [EXTRACTED 1.00]
- **Tricolor Facial Markings** — gallery_slide_007_tricolor_coat, gallery_slide_007_white_blaze, gallery_slide_007_tan_eyebrows, gallery_slide_007_white_chest, gallery_slide_007_floppy_ears, gallery_slide_007_black_nose [EXTRACTED 1.00]
- **Studio Portrait Composition** — gallery_slide_007_dog, gallery_slide_007_blush_backdrop, gallery_slide_007_head_and_chest_crop, gallery_slide_007_direct_gaze [EXTRACTED 1.00]
- **Gallery Marketing Portrait** — gallery_slide_007_dog, gallery_slide_007_studio_portrait, gallery_slide_007_gallery_slide [INFERRED 0.75]
- **Garden Portrait Scene** — home_slide_001_golden_retriever, home_slide_001_tulip, home_slide_001_stone_patio, home_slide_001_wooden_fence, home_slide_001_evergreen_trees [EXTRACTED 1.00]
- **Close beach portrait of a panting dog** — home_slide_002_dog, home_slide_002_beach, home_slide_002_panting, home_slide_002_bokeh [EXTRACTED 1.00]
- **Homepage hero built from the dog portrait** — home_slide_002_photo, home_slide_002_dog, home_slide_002_hero [INFERRED 0.85]
- **Coastal Play Scene** — home_slide_003_dog, home_slide_003_surf, home_slide_003_pebble_beach, home_slide_003_ocean, home_slide_003_warm_horizon [EXTRACTED 1.00]
- **Dog Appearance Cues** — home_slide_003_dog, home_slide_003_open_mouth, home_slide_003_collar_tag, home_slide_003_raised_tail, home_slide_003_white_chest, home_slide_003_wet_coat [EXTRACTED 1.00]
- **Homepage Hero Composition** — home_slide_003_hero_slide, home_slide_003_approach_pose, home_slide_003_playful_mood, home_slide_003_hero_appeal [INFERRED 0.85]
- **Studio Pug Portrait** — home_slide_004_black_pug, home_slide_004_knit_sweater, home_slide_004_yellow_backdrop, home_slide_004_upward_gaze [EXTRACTED 1.00]
- **Two Dogs Running a Sunlit Trail** — home_slide_005_corgi, home_slide_005_long_haired_dog, home_slide_005_dirt_path, home_slide_005_running_toward_camera, home_slide_005_golden_hour_backlight [EXTRACTED 1.00]
- **Warm Active-Stay Emotional Pitch** — home_slide_005_two_dog_companionship, home_slide_005_golden_hour_backlight, home_slide_005_running_toward_camera, home_slide_005_warm_hospitality_mood [INFERRED 0.75]
- **Blue Studio Portrait** — home_slide_006_french_bulldog, home_slide_006_yellow_hoodie, home_slide_006_blue_backdrop, home_slide_006_seated_pose [EXTRACTED 1.00]
- **Dressed Guest Outfit** — home_slide_006_french_bulldog, home_slide_006_yellow_hoodie, home_slide_006_champion_logo, home_slide_006_white_hood [EXTRACTED 1.00]
- **Homepage Hero Composition** — home_slide_006_hero_slide, home_slide_006_seated_pose, home_slide_006_calm_mood, home_slide_006_hero_appeal [INFERRED 0.85]
- **Tricolor Face and Chest Pattern** — home_slide_007_tricolor_coat, home_slide_007_white_blaze, home_slide_007_tan_markings, home_slide_007_white_muzzle, home_slide_007_white_chest, home_slide_007_floppy_ears [EXTRACTED 1.00]
- **Studio Portrait Composition** — home_slide_007_close_up_portrait, home_slide_007_peach_backdrop, home_slide_007_soft_lighting, home_slide_007_direct_gaze, home_slide_007_head_tilt [EXTRACTED 1.00]
- **Homepage Hero Subject** — home_slide_007_hero_photo, home_slide_007_dog, home_slide_007_homepage_hero, home_slide_007_direct_gaze [INFERRED 0.85]
- **Care Bear Daycare Brand Lockup** — logos_logo_care_bear_wordmark, logos_logo_daycare, logos_logo_golden_dog, logos_logo_teddy_bear, logos_logo_red_heart [EXTRACTED 1.00]
- **Logo Color Palette** — logos_logo_dark_teal, logos_logo_white_outline, logos_logo_black_background, logos_logo_golden_brown, logos_logo_cream, logos_logo_red [EXTRACTED 1.00]
- **Dog and Bear Care Scene** — logos_logo_golden_dog, logos_logo_teddy_bear, logos_logo_red_heart, logos_logo_embrace [EXTRACTED 1.00]
- **Care Bear Daycare Brand Lockup** — logos_logo_ads_dog, logos_logo_ads_teddy_bear, logos_logo_ads_heart, logos_logo_ads_wordmark, logos_logo_ads_daycare [EXTRACTED 1.00]
- **Dog Hugging Teddy Bear with Heart** — logos_logo_ads_dog, logos_logo_ads_teddy_bear, logos_logo_ads_heart [EXTRACTED 1.00]
- **Care Bear Daycare Logo Lockup** — logos_logo_alt_mark, logos_logo_alt_care_bear, logos_logo_alt_daycare, logos_logo_alt_dog, logos_logo_alt_teddy_bear, logos_logo_alt_heart [EXTRACTED 1.00]
- **Affectionate Dog and Bear Scene** — logos_logo_alt_dog, logos_logo_alt_teddy_bear, logos_logo_alt_heart, logos_logo_alt_embrace, logos_logo_alt_affection [INFERRED 0.85]
- **Pictorial Mark of Dog, Bear Cub, and Heart** — logos_logo_hori_golden_dog, logos_logo_hori_bear_cub, logos_logo_hori_coral_heart [EXTRACTED 1.00]
- **CareBear Daycare Type Lockup** — logos_logo_hori_carebear_wordmark, logos_logo_hori_daycare, logos_logo_hori_deep_teal [EXTRACTED 1.00]
- **Pictorial Mark of Dog, Bear Cub, and Heart** — logos_logo_hori_ads_golden_dog, logos_logo_hori_ads_bear_cub, logos_logo_hori_ads_coral_heart [EXTRACTED 1.00]
- **CareBear Daycare Type Lockup** — logos_logo_hori_ads_wordmark, logos_logo_hori_ads_daycare, logos_logo_hori_ads_deep_teal [EXTRACTED 1.00]
- **Illustration Left, Type Right Horizontal Lockup** — logos_logo_hori_ads_golden_dog, logos_logo_hori_ads_wordmark, logos_logo_hori_ads_daycare [EXTRACTED 1.00]
- **Pictorial Mark of Dog, Bear Cub, and Heart** — logos_logo_square_golden_dog, logos_logo_square_bear_cub, logos_logo_square_coral_heart [EXTRACTED 1.00]
- **Dog Embracing Bear Cub as Care** — logos_logo_square_golden_dog, logos_logo_square_bear_cub, logos_logo_square_affectionate_care [INFERRED 0.85]

## Communities (90 total, 9 thin omitted)

### Community 0 - "Marketing Nav Tree"
Cohesion: 0.07
Nodes (53): flattenNavItemsForDrawer(), HOME_NAV_ITEMS_BASE, MARKETING_INTERIOR_NAV_ITEMS_BASE, MARKETING_NAV_TREE, isExternalHref(), ROVER_BOOKING_URL, NAV_GLASS_BACKDROP_COLOR, BookStayButton() (+45 more)

### Community 1 - "About and Hero Slides"
Cohesion: 0.05
Nodes (52): AboutRoute(), metadata, HomeHeroSlidesContext, HomeHeroSlidesProvider(), useHomeHeroSlides(), FORM_PAGE_DESKTOP_BP, MarketingFormPanel(), AboutPage() (+44 more)

### Community 2 - "Glass Form Surfaces"
Cohesion: 0.07
Nodes (36): FORM_PAGE_MOBILE_MAIN_SCROLL_SX, FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX, GLASS_FIELD_SURFACE_SX, GLASS_FIELD_WRAPPER_SX, GLASS_FORM_FOOTER_SX, GLASS_FORM_PAIR_STACK_SPACING, GLASS_FORM_PANEL_HORIZONTAL_PAD, GLASS_FORM_PANEL_PADDING_SCROLL_PANEL_SX (+28 more)

### Community 3 - "Public Route Pages"
Cohesion: 0.24
Nodes (8): GalleryRoute(), IMAGE_EXTENSIONS, listGalleryImages(), metadata, Path, main(), _resolve_under_root(), TEMPLATE

### Community 4 - "App Layout and SEO"
Cohesion: 0.07
Nodes (36): frontend-dev agent, Thin pages, EmotionCacheProvider(), marketingMetadataHost(), metadata, metadataBaseFromHost(), OG_IMAGE_PATH, ogImageUrl() (+28 more)

### Community 5 - "Theme and Robots Meta"
Cohesion: 0.35
Nodes (9): RobotsMeta(), isIndexablePublicPath(), NON_INDEXABLE_PATHS, ROBOTS_INDEX, ROBOTS_NOINDEX, robotsMetaContent(), robotsMetadataForPath(), isIndexablePublicPath tests (+1 more)

### Community 6 - "Yarn Resolutions"
Cohesion: 0.05
Nodes (37): resolutions, @babel/plugin-transform-modules-systemjs@npm:^7.29.0, baseline-browser-mapping@npm:^2.10.44, brace-expansion@npm:1.1.15, brace-expansion@npm:^1.1.7, brace-expansion@npm:^2.0.1, brace-expansion@npm:2.1.1, brace-expansion@npm:5.0.6 (+29 more)

### Community 7 - "Frontend Dependencies"
Cohesion: 0.06
Nodes (36): dependencies, axios, @azure/storage-blob, date-fns, dayjs, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (+28 more)

### Community 8 - "Discovery and Domain Skills"
Cohesion: 0.05
Nodes (43): Issue Template, Additional resources, AFK, Anti-patterns, Core method: vertical slices (tracer bullets), HITL, Issue file format, Output layout (+35 more)

### Community 9 - "App Boot Splash"
Cohesion: 0.10
Nodes (22): AppBootGate(), AppLoadingScreen(), BAR_SX, BREATHE_SX, EditorialSplash(), MARK_150_INLINE_STYLE, MARK_68_INLINE_STYLE, OVERLAY_INLINE_STYLE (+14 more)

### Community 10 - "Lint Dev Dependencies"
Cohesion: 0.08
Nodes (24): devDependencies, css-mediaquery, eslint, eslint-config-airbnb, eslint-config-next, eslint-config-prettier, eslint-plugin-import, eslint-plugin-jest (+16 more)

### Community 11 - "PRD Interview Guide"
Cohesion: 0.20
Nodes (10): Additional resources, Capture, File naming, Opening prompt, Phase 1 — Deep intake, Phase 5 — Write PRD, Phase 6 — Confirm, Session checklist (+2 more)

### Community 12 - "Settings and Storage"
Cohesion: 0.19
Nodes (16): themeMode localStorage, Settings persist only after hydration, SettingsContext, SettingsProvider(), useSettings(), canUseStorage(), clearSettings(), readSettingsRaw() (+8 more)

### Community 13 - "Gallery Image Helpers"
Cohesion: 0.18
Nodes (15): NIICO portfolio collections, PORTFOLIO_COLLECTION_HOVER_SLIDE_COUNTS, portfolio-scraper agent, homeHeroSlideShape, galleryImageFromApi(), galleryImagesFromApi(), galleryMediaSrc(), normalizeGalleryImageList() (+7 more)

### Community 14 - "Brand Marketing Tokens"
Cohesion: 0.05
Nodes (47): Frosted Glass Contact Form, Hero Pill Buttons, homeMontserrat Nunito Alias, Marketing Layout Grid, LUXURY_GRADIENT_SX, Marketing Color Tokens, Cream Interior Nav, Nunito Marketing Type (+39 more)

### Community 15 - "Small Dog Close-up"
Cohesion: 0.17
Nodes (16): Brown Eyes, Close-up Portrait Framing, Direct Camera Gaze, Small Dog, Black Floppy Ears, Slight Head Tilt, Homepage Hero Photo, Dog Hotel Homepage Hero (+8 more)

### Community 16 - "Beach Running Dog"
Cohesion: 0.18
Nodes (15): Dark Collar and Round Tag, Copper Dog Running Toward Camera, Warm Horizon Light, Lifestyle Gallery Portrait, Ocean, Open Mouth and Tongue, Peach-to-Pale Horizon Sky, Pebble Beach (+7 more)

### Community 17 - "Design It Twice"
Cohesion: 0.06
Nodes (43): In-process dependency, Local-substitutable dependency, Remote but owned ports and adapters, Replace don't layer, True external dependency, 1. Frame the problem space, 2. Launch subagents, 3. Present and compare (+35 more)

### Community 18 - "Pink Studio Portrait"
Cohesion: 0.16
Nodes (14): Black Nose, Pale Pink Seamless Backdrop, Brown Eyes Toward Camera, Small Tricolor Dog, Floppy Black Ears, Dog Hotel Gallery Slide, Head and Chest Crop, Studio Dog Portrait (+6 more)

### Community 19 - "Beach Bounding Dog"
Cohesion: 0.30
Nodes (14): Forward Bounding Approach Pose, Dark Collar with Round Metal Tag, Wet Copper-Red Dog, Dog Hotel Welcome Appeal, Homepage Slide Photograph, Calm Blue Ocean, Open-Mouth Panting Expression, Multicolored Pebble Shore (+6 more)

### Community 20 - "Package Scripts"
Cohesion: 0.15
Nodes (13): Cypress configuration, scripts, build, dev, fix, lint, prettier, pretty-lint (+5 more)

### Community 21 - "Primary Brand Mark"
Cohesion: 0.32
Nodes (13): Black Background, Care Bear Daycare Brand Mark, Care Bear Script Wordmark, Cream, Dark Teal, DAYCARE Tracked Subtitle, Dog Embracing Bear, Golden Brown (+5 more)

### Community 22 - "Coastal Herding Dog"
Cohesion: 0.27
Nodes (12): Blurred Beach and Ocean Backdrop, Shallow Depth of Field, White Blaze with Brown Patches, Bright Coastal Daylight, Brown and White Dog, One Upright Ear and One Folded Ear, Herding-Type Dog, Dog Hotel Homepage Hero (+4 more)

### Community 23 - "Public Form Skill"
Cohesion: 0.16
Nodes (13): Add Public Form, AllowAny public form views, Backend Workflow, Discovery Checklist, Public form variant, Frontend Workflow, Reference Implementations, Test Plan (+5 more)

### Community 24 - "Pug Studio Portrait"
Cohesion: 0.24
Nodes (10): Black Pug, Folded Black Ears, Marled Cable-Knit Sweater, Gallery Slide 004, Pug, Large Round Eyes, Studio Portrait, Upward Gaze (+2 more)

### Community 25 - "Blue Studio Bulldog"
Cohesion: 0.22
Nodes (10): Solid Blue Seamless Backdrop, Calm Content Expression, Champion C Logo, Seated Closed-Eye Pose, Fawn French Bulldog, Dog Hotel Gallery Slide, Blue Studio Dog Portrait, White Facial Blaze (+2 more)

### Community 26 - "Trail Running Corgi"
Cohesion: 0.33
Nodes (10): Tan-and-White Corgi, Dirt Trail, Eye-Level Framing, Golden Hour Backlight, Homepage Hero Slide 005, Cream Long-Haired Dog, Running Toward Camera, Shallow Depth of Field (+2 more)

### Community 27 - "Homepage Bulldog Portrait"
Cohesion: 0.36
Nodes (10): Solid Blue Studio Backdrop, Calm Pampered Portrait Mood, Champion C Chest Logo, Closed-Eye Resting Expression, Fawn French Bulldog, Dog Hotel Guest Appeal, Homepage Slide Photograph, Front-Facing Seated Pose (+2 more)

### Community 28 - "CI and Pre-commit"
Cohesion: 0.18
Nodes (16): averageStarRating(), countReviews(), REVIEWS, reviewVerificationLabel(), sortReviewsNewestFirst(), newer, older, sameDayLater (+8 more)

### Community 29 - "Jest and Next Config"
Cohesion: 0.22
Nodes (7): Jest configuration, Jest beforeEach environment mocks, createMatchMedia(), config, withImages, withPlugins, Node 23.1 pin

### Community 30 - "Patio Puppy Portrait"
Cohesion: 0.31
Nodes (9): Dark Backdrop, Evergreen Trees, Golden Retriever Puppy, Homepage Hero Photograph, Overcast Sky, Centered Seated Portrait, Stone Paver Patio, Pale Tulip (+1 more)

### Community 31 - "Alternate Logo Lockup"
Cohesion: 0.47
Nodes (9): Affectionate Care Motif, Care Bear Wordmark, DAYCARE Wordmark, Caramel Cartoon Dog, Dog Embracing Bear, Coral Heart, Care Bear Daycare Alternate Logo, Dark Teal Contour and Type (+1 more)

### Community 32 - "Horizontal Ads Logo"
Cohesion: 0.36
Nodes (9): Horizontal Advertising Logo Variant, Affectionate Care, Cream Bear Cub, Coral Heart, DAYCARE Service Line, Deep Teal Brand Color, Golden Spaniel-Style Dog, CareBear Daycare Horizontal Ads Logo (+1 more)

### Community 33 - "PRD Interview Branches"
Cohesion: 0.29
Nodes (7): Confirm with user, Extraction mindset, Graphify (mandatory), Phase 4 exit criteria, Phase 4 — Module sketch, Purpose, What to produce

### Community 34 - "Docker Compose Dev"
Cohesion: 0.33
Nodes (6): 1. Re-ground in the repo, 2. Layer the sketch, 3. Hunt for deep modules (required), 4. Draw the dependency graph, 5. Present and confirm, Process

### Community 35 - "Ads Logo Lockup"
Cohesion: 0.39
Nodes (8): Advertising Logo Variant, DAYCARE Subtitle, Golden Dog Mascot, Coral Heart, Care Bear Daycare Ads Logo Lockup, Navy Outline and Type Color, Cream Teddy Bear, Care Bear Wordmark

### Community 36 - "Horizontal Brand Logo"
Cohesion: 0.54
Nodes (8): Affectionate Care, Cream Bear Cub, CareBear Wordmark, Coral Heart, DAYCARE Service Line, Deep Teal Brand Color, Golden Spaniel-Style Dog, CareBear Daycare Horizontal Logo

### Community 37 - "Gallery Running Dogs"
Cohesion: 0.48
Nodes (7): Tan-and-white corgi in mid-stride, Unpaved dirt path, Golden-hour backlight, Small long-haired tan dog, Gallery slide of two dogs running, Shallow depth of field, Blurred hills and roadside brush

### Community 38 - "Yellow Pug Portrait"
Cohesion: 0.40
Nodes (6): Black Pug, Homepage Hero Photograph, Marled Knit Sweater, Low-Crop Studio Portrait, Upward Gaze, Solid Yellow Studio Backdrop

### Community 39 - "Square Brand Logo"
Cohesion: 0.53
Nodes (6): Affectionate Care, Cream Bear Cub, Coral Heart, Deep Teal Outline, Golden Spaniel-Style Dog, Square Brand Logo

### Community 40 - "Contact Form Type"
Cohesion: 0.33
Nodes (6): Dependency examples, Design tree (walk order), Phase 3 — Design-tree interview, Phase 3 exit criteria, Rules, When a branch is done

### Community 41 - "Site Documents Context"
Cohesion: 0.50
Nodes (4): SiteDocumentsContext, siteDocumentShape, SiteDocumentsProvider(), useSiteDocuments()

### Community 42 - "JSConfig Path Alias"
Cohesion: 0.40
Nodes (4): compilerOptions, baseUrl, paths, @/*

### Community 43 - "Package Metadata"
Cohesion: 0.40
Nodes (4): name, packageManager, private, version

### Community 44 - "Beach Facing Dog"
Cohesion: 0.60
Nodes (5): Sandy beach foreground, Brown-and-white long-haired dog facing the camera, Herding-dog coat and ear set, Blurred turquoise ocean and bright sky, Beach portrait of a brown-and-white dog

### Community 45 - "Patio Tulip Puppy"
Cohesion: 1.00
Nodes (3): Dog Hotel Gallery Lifestyle Portrait, Stone Patio Garden with Fences and Evergreens, Golden Retriever Puppy Holding a Tulip

### Community 46 - "Portfolio Scraper Skill"
Cohesion: 1.00
Nodes (3): PORTFOLIO_COLLECTION_HOVER_SLIDE_COUNTS, Portfolio image layout, Scrape Portfolio Images

### Community 48 - "Staff Gallery DataGrid"
Cohesion: 0.29
Nodes (6): Already converted, Layout, Rows, Staff gallery DataGrid, StaffGalleryDataGrid, Usage

### Community 49 - "MUI Component Scaffold"
Cohesion: 0.29
Nodes (6): create_ts_component_scaffold.py, Instructions, Output format, TypeScript Reusable MUI Components, Utility script, When to use

### Community 60 - "Community 60"
Cohesion: 0.09
Nodes (22): Discovery Brief, Discovery Brief Template, Discovery Phase, Plan Template, Question Categories, Related Skills, Subagent Recon Brief, When to Use (+14 more)

### Community 61 - "Community 61"
Cohesion: 0.50
Nodes (3): DevConsoleSuppressor(), SUPPRESSED, ESLint configuration

### Community 62 - "Community 62"
Cohesion: 0.20
Nodes (9): issues/prd-<slug>.md, Phase 1 Deep Intake, Phase 2 Repo Discovery, Phase 5 Write PRD, Phase 6 Confirm, Working Notes, Writing rules, Current State and Verified Assertions (+1 more)

### Community 63 - "Community 63"
Cohesion: 0.14
Nodes (13): Call-graph collapse, Candidate card, Cross-section (good for layered shallowness), Diagram patterns, Hand-built boxes-and-arrows (when Mermaid's layout fights you), Header, HTML Report Format, Mass diagram (good for "interface as wide as implementation") (+5 more)

### Community 64 - "Community 64"
Cohesion: 0.15
Nodes (13): 1.1 Marketing tokens, 1.2 Staff dark (teal charcoal), 1.3 Semantic colors that are not the brand, 1. Color, 2. Typography, 3.1 Hero buttons, 3.2 Nav, 3.3 Forms (+5 more)

### Community 65 - "Community 65"
Cohesion: 0.50
Nodes (4): Graphify first (mandatory), Phase 2 — Repo discovery, What to produce, When to use subagents

### Community 66 - "Community 66"
Cohesion: 0.20
Nodes (9): FORGOT_PASSWORD_PATH, isStaffRoute(), LOGIN_PATH, STAFF_PREFIX, ThemeContext, RouteThemeShell(), Public crawler rules, metadata (+1 more)

### Community 69 - "Community 69"
Cohesion: 0.25
Nodes (6): isHomeRoute(), isMarketingInteriorRoute(), staffLoginHref(), staffPath(), staffPathSuffix(), withStaffNavItems()

### Community 72 - "Community 72"
Cohesion: 0.22
Nodes (8): 1. In-process, 2. Local-substitutable, 3. Remote but owned (Ports & Adapters), 4. True external (Mock), Deepening, Dependency categories, Seam discipline, Testing strategy: replace, don't layer

### Community 73 - "Community 73"
Cohesion: 0.22
Nodes (8): Codebase Design, Deep vs shallow, Designing for testability, Glossary, Going deeper, Principles, Rejected framings, Relationships

### Community 75 - "Community 75"
Cohesion: 0.15
Nodes (11): Care Bear Daycare logo palette, createAppTheme(), customColors, background_color, description, display, icons, name (+3 more)

### Community 76 - "Community 76"
Cohesion: 0.22
Nodes (8): After download, Image source priority, Output layout, Parallel coordination, Run (preferred), Scrape Portfolio Images (niico.com → local), Sub-collection route → filename, When to use

### Community 77 - "Community 77"
Cohesion: 0.14
Nodes (14): Batching, Branch 1 — Problem and success (root), Branch 2 — Users and permissions, Branch 3 — Product surface and scope, Branch 4 — Data and integrations, Branch 5 — UX and flows, Branch 6 — Non-functional requirements, Branch 7 — Rollout and phasing (+6 more)

### Community 80 - "Community 80"
Cohesion: 0.18
Nodes (8): isMarketingFormRoute(), isMarketingRoute(), bodySx, ContactFormPage(), ContactRoute(), metadata, HowAStayWorksRoute(), metadata

### Community 81 - "Community 81"
Cohesion: 0.29
Nodes (6): ADR Format, Numbering, Optional sections, Template, What qualifies, When to offer an ADR

### Community 82 - "Community 82"
Cohesion: 0.29
Nodes (6): Dependency graph (optional working notes), IHCS monorepo reminders, Ordering patterns, Sizing guide, Tracer bullet checklist, Vertical slice heuristics

### Community 83 - "Community 83"
Cohesion: 0.28
Nodes (8): Deferred Decision, Deep Module, Route to Orchestrator to Deep Module, Shallow Orchestrator, Decision Log, Phase 3 Design-Tree Interview, Phase 4 Module Sketch, P0 P1 P2 Requirements

### Community 84 - "Community 84"
Cohesion: 0.33
Nodes (5): Discovery Phase, Output, Project Conventions, Stack, When Invoked

### Community 85 - "Community 85"
Cohesion: 0.33
Nodes (5): Do not, Read first, Return to coordinator, Scope per run, You own

### Community 86 - "Community 86"
Cohesion: 0.20
Nodes (9): Anti-patterns, Extraction heuristics, Goals, Backend Frontend Cross-Cutting Layers, Module sketch guide, Module Table M-001, Module table template, Phase 4 exit criteria (+1 more)

### Community 87 - "Community 87"
Cohesion: 0.40
Nodes (3): NotFound(), Custom404(), handleBack

### Community 88 - "Community 88"
Cohesion: 0.40
Nodes (4): CONTEXT.md Format, Rules, Single vs multi-context repos, Structure

### Community 93 - "Community 93"
Cohesion: 0.50
Nodes (3): Designing for Mockability, IHCS notes, When to Mock

### Community 94 - "Community 94"
Cohesion: 0.50
Nodes (3): Bad Tests, Good and Bad Tests, Good Tests

## Ambiguous Edges - Review These
- `manifest.json` → `Care Bear Daycare logo palette`  [AMBIGUOUS]
  frontend/public/manifest.json · relation: conceptually_related_to
- `IHCS conventions` → `Stack`  [AMBIGUOUS]
  .cursor/skills/write-a-prd/module-sketch.md · relation: conceptually_related_to
- `BRAND-REFERENCE.md` → `NIICO Millwork Pages Identity`  [AMBIGUOUS]
  .github/workflows/nextjs.yml · relation: conceptually_related_to
- `BRAND-REFERENCE.md` → `IHCS Email Signatures Digital Signage`  [AMBIGUOUS]
  .cursor/skills/write-a-prd/interview-guide.md · relation: conceptually_related_to
- `BRAND-REFERENCE.md` → `PRD Product Field`  [AMBIGUOUS]
  .cursor/skills/write-a-prd/template.md · relation: conceptually_related_to
- `README.md` → `ES Admin DS Manager Kiosk Roles`  [AMBIGUOUS]
  .cursor/skills/write-a-prd/interview-guide.md · relation: conceptually_related_to
- `NIICO Millwork Pages Identity` → `Zygoat care-bear-daycare`  [AMBIGUOUS]
  zygoat_settings.yml · relation: conceptually_related_to
- `Brown and White Dog` → `Herding-Type Dog`  [AMBIGUOUS]
  frontend/public/imgs/home/slide-002.jpg · relation: conceptually_related_to
- `Small Dog` → `Small Terrier-Type Dog`  [AMBIGUOUS]
  frontend/public/imgs/home/slide-007.jpg · relation: semantically_similar_to

## Knowledge Gaps
- **472 isolated node(s):** `REDUCE_MOTION`, `SPIN_SX`, `BAR_SX`, `BREATHE_SX`, `OVERLAY_INLINE_STYLE` (+467 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `manifest.json` and `Care Bear Daycare logo palette`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `IHCS conventions` and `Stack`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `BRAND-REFERENCE.md` and `NIICO Millwork Pages Identity`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `BRAND-REFERENCE.md` and `IHCS Email Signatures Digital Signage`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `BRAND-REFERENCE.md` and `PRD Product Field`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `README.md` and `ES Admin DS Manager Kiosk Roles`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `NIICO Millwork Pages Identity` and `Zygoat care-bear-daycare`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._