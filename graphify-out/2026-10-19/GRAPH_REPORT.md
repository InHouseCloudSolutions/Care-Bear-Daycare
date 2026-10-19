# Graph Report - doghotel  (2026-10-19)

## Corpus Check
- 141 files · ~462,561 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 818 nodes · 1202 edges · 60 communities (51 shown, 9 thin omitted)
- Extraction: 86% EXTRACTED · 13% INFERRED · 1% AMBIGUOUS · INFERRED: 160 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `resolutions` - 37 edges
2. `scripts` - 15 edges
3. `DogHotelInteriorPage()` - 11 edges
4. `Homepage Slide Photograph` - 11 edges
5. `Small Dog` - 11 edges
6. `HomeHeroBackground()` - 10 edges
7. `HomeHeroNav()` - 10 edges
8. `MarketingInteriorNav()` - 10 edges
9. `pageMetadata()` - 10 edges
10. `Homepage Slide 002 Photograph` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Thin pages` --rationale_for--> `HomePage()`  [INFERRED]
  .cursor/agents/frontend-dev.md → frontend/src/app/(website)/page.js
- `NIICO portfolio collections` --conceptually_related_to--> `normalizeGalleryImageList()`  [INFERRED]
  .cursor/agents/portfolio-scraper.md → frontend/utils/galleryImage.js
- `ES Admin DS Manager Kiosk Roles` --conceptually_related_to--> `Care Bear Daycare README`  [AMBIGUOUS]
  .cursor/skills/write-a-prd/interview-guide.md → README.md
- `pre-commit Prettier` --semantically_similar_to--> `Frontend Lint Job`  [INFERRED] [semantically similar]
  .pre-commit-config.yaml → .github/workflows/test-frontend.yml
- `metadata` --semantically_similar_to--> `Public crawler rules`  [INFERRED] [semantically similar]
  frontend/src/app/(website)/layout.js → frontend/public/robots.txt

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

## Communities (60 total, 9 thin omitted)

### Community 0 - "Marketing Nav Tree"
Cohesion: 0.07
Nodes (51): flattenNavItemsForDrawer(), HOME_NAV_ITEMS_BASE, MARKETING_INTERIOR_NAV_ITEMS_BASE, MARKETING_NAV_TREE, isExternalHref(), ROVER_BOOKING_URL, NAV_GLASS_BACKDROP_COLOR, HOME_LUXURY_DRAWER_PAPER_SX (+43 more)

### Community 1 - "About and Hero Slides"
Cohesion: 0.06
Nodes (44): HomeHeroSlidesContext, HomeHeroSlidesProvider(), useHomeHeroSlides(), AboutPage(), bodySx, CARE_POINTS, CarriePhoto(), sectionHeadingSx (+36 more)

### Community 2 - "Glass Form Surfaces"
Cohesion: 0.07
Nodes (39): FORM_PAGE_DESKTOP_BP, FORM_PAGE_MOBILE_MAIN_SCROLL_SX, FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX, GLASS_FIELD_SURFACE_SX, GLASS_FIELD_WRAPPER_SX, GLASS_FORM_FOOTER_SX, GLASS_FORM_PAIR_STACK_SPACING, GLASS_FORM_PANEL_HORIZONTAL_PAD (+31 more)

### Community 3 - "Public Route Pages"
Cohesion: 0.06
Nodes (27): AboutRoute(), metadata, NotFound(), isHomeRoute(), isMarketingFormRoute(), isMarketingInteriorRoute(), isMarketingRoute(), staffLoginHref() (+19 more)

### Community 4 - "App Layout and SEO"
Cohesion: 0.08
Nodes (31): frontend-dev agent, EmotionCacheProvider(), marketingMetadataHost(), metadata, metadataBaseFromHost(), ogImageUrl(), RootLayout(), shareImageUrl (+23 more)

### Community 5 - "Theme and Robots Meta"
Cohesion: 0.08
Nodes (29): RobotsMeta(), FORGOT_PASSWORD_PATH, isStaffRoute(), LOGIN_PATH, STAFF_PREFIX, Care Bear Daycare logo palette, ThemeContext, RouteThemeShell() (+21 more)

### Community 6 - "Yarn Resolutions"
Cohesion: 0.05
Nodes (37): resolutions, @babel/plugin-transform-modules-systemjs@npm:^7.29.0, baseline-browser-mapping@npm:^2.10.44, brace-expansion@npm:1.1.15, brace-expansion@npm:^1.1.7, brace-expansion@npm:^2.0.1, brace-expansion@npm:2.1.1, brace-expansion@npm:5.0.6 (+29 more)

### Community 7 - "Frontend Dependencies"
Cohesion: 0.06
Nodes (36): dependencies, axios, @azure/storage-blob, date-fns, dayjs, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (+28 more)

### Community 8 - "Discovery and Domain Skills"
Cohesion: 0.10
Nodes (34): Deletion test, Discovery Brief, Discovery Phase, Discovery question categories, Architecture Decision Record, CONTEXT-MAP.md, CONTEXT.md, Domain Modeling (+26 more)

### Community 9 - "App Boot Splash"
Cohesion: 0.10
Nodes (22): AppBootGate(), AppLoadingScreen(), BAR_SX, BREATHE_SX, EditorialSplash(), MARK_150_INLINE_STYLE, MARK_68_INLINE_STYLE, OVERLAY_INLINE_STYLE (+14 more)

### Community 10 - "Lint Dev Dependencies"
Cohesion: 0.08
Nodes (24): devDependencies, css-mediaquery, eslint, eslint-config-airbnb, eslint-config-next, eslint-config-prettier, eslint-plugin-import, eslint-plugin-jest (+16 more)

### Community 11 - "PRD Interview Guide"
Cohesion: 0.13
Nodes (20): Design-Tree Interview Guide, Deferred Decision, Deep Module, Route to Orchestrator to Deep Module, Shallow Orchestrator, Write a PRD, Decision Log, issues/prd-<slug>.md (+12 more)

### Community 12 - "Settings and Storage"
Cohesion: 0.19
Nodes (16): themeMode localStorage, Settings persist only after hydration, SettingsContext, SettingsProvider(), useSettings(), canUseStorage(), clearSettings(), readSettingsRaw() (+8 more)

### Community 13 - "Gallery Image Helpers"
Cohesion: 0.18
Nodes (15): NIICO portfolio collections, PORTFOLIO_COLLECTION_HOVER_SLIDE_COUNTS, portfolio-scraper agent, homeHeroSlideShape, galleryImageFromApi(), galleryImagesFromApi(), galleryMediaSrc(), normalizeGalleryImageList() (+7 more)

### Community 14 - "Brand Marketing Tokens"
Cohesion: 0.17
Nodes (16): Care Bear Daycare Brand Reference, Marketing Layout Grid, LUXURY_GRADIENT_SX, Marketing Color Tokens, Cream Interior Nav, Rejected Millwork Palette, Marketing Interior Scrollbar, Staff Dark Teal Charcoal (+8 more)

### Community 15 - "Small Dog Close-up"
Cohesion: 0.17
Nodes (16): Brown Eyes, Close-up Portrait Framing, Direct Camera Gaze, Small Dog, Black Floppy Ears, Slight Head Tilt, Homepage Hero Photo, Dog Hotel Homepage Hero (+8 more)

### Community 16 - "Beach Running Dog"
Cohesion: 0.18
Nodes (15): Dark Collar and Round Tag, Copper Dog Running Toward Camera, Warm Horizon Light, Lifestyle Gallery Portrait, Ocean, Open Mouth and Tongue, Peach-to-Pale Horizon Sky, Pebble Beach (+7 more)

### Community 17 - "Design It Twice"
Cohesion: 0.19
Nodes (14): In-process dependency, Local-substitutable dependency, Remote but owned ports and adapters, Replace don't layer, True external dependency, Design It Twice, Adapter, Depth (+6 more)

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
Cohesion: 0.27
Nodes (9): Add Public Form, AllowAny public form views, Public form variant, Form variant default vs glass, Thin pages, areRequiredFieldsFilled(), canSubmitRequiredForm(), isRequiredFieldFilled() (+1 more)

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
Cohesion: 0.20
Nodes (10): pre-commit Hooks, pre-commit Prettier, Deploy Next.js Site to Pages, Detect Package Manager, GitHub Pages Base Path, GitHub Pages Next.js Starter Workflow, frontend/out Pages Artifact, Test Frontend Workflow (+2 more)

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
Cohesion: 0.28
Nodes (9): Branch 1 Problem and Success, Branch 2 Users and Permissions, Branch 3 Product Surface and Scope, Branch 4 Data and Integrations, Branch 5 UX and Flows, Branch 6 Non-Functional Requirements, Branch 7 Rollout and Phasing, Branch 8 Acceptance and Verification (+1 more)

### Community 34 - "Docker Compose Dev"
Cohesion: 0.32
Nodes (8): Compose Caddy Reverse Proxy, Compose Frontend Service, Local Docker Compose Dev, Next.js Marketing Stack, Module Sketch Guide, IHCS Module Conventions, Backend Frontend Cross-Cutting Layers, Module Table M-001

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
Cohesion: 0.40
Nodes (5): Frosted Glass Contact Form, Hero Pill Buttons, homeMontserrat Nunito Alias, Nunito Marketing Type, contact@carebeardaycare.ca

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

## Ambiguous Edges - Review These
- `manifest.json` → `Care Bear Daycare logo palette`  [AMBIGUOUS]
  frontend/public/manifest.json · relation: conceptually_related_to
- `ES Admin DS Manager Kiosk Roles` → `Care Bear Daycare README`  [AMBIGUOUS]
  .cursor/skills/write-a-prd/interview-guide.md · relation: conceptually_related_to
- `IHCS Email Signatures Digital Signage` → `Care Bear Daycare Brand Reference`  [AMBIGUOUS]
  .cursor/skills/write-a-prd/interview-guide.md · relation: conceptually_related_to
- `IHCS Module Conventions` → `Next.js Marketing Stack`  [AMBIGUOUS]
  .cursor/skills/write-a-prd/module-sketch.md · relation: conceptually_related_to
- `PRD Product Field` → `Care Bear Daycare Brand Reference`  [AMBIGUOUS]
  .cursor/skills/write-a-prd/template.md · relation: conceptually_related_to
- `NIICO Millwork Pages Identity` → `Care Bear Daycare Brand Reference`  [AMBIGUOUS]
  .github/workflows/nextjs.yml · relation: conceptually_related_to
- `NIICO Millwork Pages Identity` → `Zygoat care-bear-daycare`  [AMBIGUOUS]
  zygoat_settings.yml · relation: conceptually_related_to
- `Brown and White Dog` → `Herding-Type Dog`  [AMBIGUOUS]
  frontend/public/imgs/home/slide-002.jpg · relation: conceptually_related_to
- `Small Dog` → `Small Terrier-Type Dog`  [AMBIGUOUS]
  frontend/public/imgs/home/slide-007.jpg · relation: semantically_similar_to

## Knowledge Gaps
- **277 isolated node(s):** `REDUCE_MOTION`, `SPIN_SX`, `BAR_SX`, `BREATHE_SX`, `OVERLAY_INLINE_STYLE` (+272 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `manifest.json` and `Care Bear Daycare logo palette`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `ES Admin DS Manager Kiosk Roles` and `Care Bear Daycare README`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `IHCS Email Signatures Digital Signage` and `Care Bear Daycare Brand Reference`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `IHCS Module Conventions` and `Next.js Marketing Stack`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `PRD Product Field` and `Care Bear Daycare Brand Reference`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `NIICO Millwork Pages Identity` and `Care Bear Daycare Brand Reference`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `NIICO Millwork Pages Identity` and `Zygoat care-bear-daycare`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._