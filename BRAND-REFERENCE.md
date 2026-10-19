# Care Bear Daycare — Brand Reference

Design-system reference for mockups. Values below match the live marketing theme.

**Brand in one line:** warm, playful daycare — cream paper, deep teal ink, caramel accent, a little coral.

---

## 1. Color

Source: `frontend/consts/website-theme.js`, `frontend/lib/createAppTheme.js`,
`frontend/components/home-landing/home-landing-data.js`.

### 1.1 Marketing tokens

| Token | Hex | Role |
|---|---|---|
| `WEBSITE_PAGE_BACKGROUND` | `#FBF4E8` | Page background. Lifted bear cream. |
| `WEBSITE_PAGE_BACKGROUND_MUTED` | `#F3E6D2` | Muted surface, inset sections. |
| `WEBSITE_PAGE_BACKGROUND_DARK` | `#E4D0B4` | Borders, scrollbar thumb. |
| `WEBSITE_SCROLLBAR_THUMB_HOVER` | `#D4BC9C` | Scrollbar thumb hover. |
| `WEBSITE_INK` | `#0B3C43` | Wordmark teal. Primary text, nav, button ink. |
| `WEBSITE_INK_HOVER` | `#14525C` | Teal hover. Light primary. |
| Teal pressed | `#082E34` | Primary dark. Deep end of the hero gradient. |
| `WEBSITE_ACCENT` | `#D9924F` | Caramel (dog fur). Secondary main. |
| Caramel light / dark | `#E4A86A` / `#C47A38` | Secondary light and dark. |
| `WEBSITE_HEART` | `#CF5133` | Coral heart. Spare accent, not a fill for large surfaces. |
| `WEBSITE_PAPER` | `#FFFCF7` | Cards and paper on light marketing routes. |
| Cream on teal | `#FBF4E8` | Primary contrast text. Same hex as the page background. |

Body copy on cream uses the ink at reduced alpha: about `0.78` for paragraphs, `0.55` for footer micro-copy, `0.12` for hairlines.

### 1.2 Staff dark (teal charcoal)

| Token | Hex | Role |
|---|---|---|
| `STAFF_DARK_BACKGROUND` | `#0E272C` | Dark page background. |
| `STAFF_DARK_PAPER` | `#122E34` | Dark cards. |
| `STAFF_DARK_SURFACE_MUTED` | `#16353B` | Muted dark surface. |
| `STAFF_DARK_SURFACE_ELEVATED` | `#1E454C` | Elevated dark surface. |
| `STAFF_LIGHT_SURFACE_ELEVATED` | `#F7EBDC` | Staff light cards. |

Dark-mode MUI primary is a light teal (`main #9FD4DE`, `light #6FB8C4`, `dark #D7EEF2`, contrast `#0E272C`). Dark secondary is light caramel (`main #F0C48A`, contrast `#0E272C`).

**Teal gradient** (`LUXURY_GRADIENT_SX`) — same two-layer structure as before, retinted:

```css
background-color: #0B3C43;
background-image:
  radial-gradient(ellipse 90% 55% at 12% -8%, rgba(217,146,79,0.22) 0%, transparent 52%),
  linear-gradient(168deg, #082E34 0%, #0B3C43 32%, #14525C 68%, #0E272C 100%);
```

### 1.3 Semantic colors that are not the brand

Error, warning, success, and info stay on their existing MUI hues. The Tailwind chip set
(`red` through `stone`) is for status chips and data grids. Do not use those hues on marketing pages.

---

## 2. Typography

**Nunito** via `next/font/google`, weights **400, 500, 600, 700**, `display: swap`.
Loaded in `frontend/components/home-landing/home-landing-font.js`.

The export is still named `homeMontserrat`, and `HOME_LANDING_FONT_FAMILY` / `SPLASH_FONT_MONTSERRAT` still point at it. The face is Nunito.

| Style | Case | Weight | Tracking | Size |
|---|---|---|---|---|
| Interior page heading | sentence | 600 | `0.02em` | `1.75rem` → `2.25rem` |
| Section heading | sentence | 600 | `0.02em` | `1.25rem` → `1.5rem` |
| Hero tagline | as written | 500 | `0.04em` | ~`1rem` |
| Nav link | as written | 600 | `0.04em` | `15px` |
| Drawer nav item | as written | 600 | `0.04em` | `15px` |
| Eyebrow / drawer section | uppercase | 600 | `0.06em` | `12–13px` |
| Hero button | as written | 600 | `0.04em` | `15–16px` |
| Footer micro-copy | as written | 400–600 | `0.04em`–`0.06em` | `12px` |

Uppercase is for small eyebrows only. Headings and buttons are not forced uppercase. If a label is already uppercase in the data, leave the string and keep the tracking tight.

---

## 3. Components

### 3.1 Hero buttons

Source: `heroCtaSx` in `HomeLandingPage.js`.

Outlined pills over photography: `border-radius: 999`, `font-weight: 600`, `letter-spacing: 0.04em`, `text-transform: none`, padding about `10px 28px`, white text, border `rgba(255,255,255,0.88)`. Hover fills `rgba(255,255,255,0.12)` and brightens the border.

### 3.2 Nav

Interior nav sits on cream with ink links. Hover underline is a 1px line that grows left to right (`0.35s`). Underline color is white on the hero and `WEBSITE_INK` on interior pages. Desktop nav starts at `xl`.

The logo is a full-color PNG on transparency (`/imgs/logos/logo.png` on the hero, `/imgs/logos/logo_hori.png` in the nav). Do not invert, brightness-filter, or flatten it to one color.

### 3.3 Forms

Contact still uses the frosted glass panel over photography (`design-studio-glass.js`). Leave that treatment alone. It is not the daycare page style.

### 3.4 Scrollbar

Thin cream scrollbar on marketing interior pages. Track `#FBF4E8`, thumb `#E4D0B4`, hover `#D4BC9C`, radius `100px`. Keep the CSS variables in `frontend/styles/marketing-interior.css` in sync with `WEBSITE_SCROLLBAR_*`.

---

## 4. Layout notes that still hold

- Spacing is the MUI 8px grid.
- Breakpoints: `xs 0`, `sm 600`, `md 900`, `lg 1200`, `xl 1536`.
- Desktop nav appears at `xl`. Form pages go two-column at `lg`.
- Nav padding: `16px` / `48px` horizontal, `12px` / `16px` vertical.
- Interior content max width is about `880px`.

---

## 5. Do / don't

**Do**

- Use cream `#FBF4E8` for page backgrounds and `#FFFCF7` for cards.
- Set text and nav in deep teal `#0B3C43`.
- Use caramel `#D9924F` as the accent and coral `#CF5133` sparingly.
- Set marketing UI in Nunito. Buttons are pills at weight 600.
- Keep the logo in full color.

**Don't**

- Bring back the millwork palette (taupe `#DBD1C0`, near-black `#0a0a0a`, warm brown charcoal).
- Wide-track uppercase headings or square marketing buttons.
- Invert or desaturate the Care Bear logo.
- Use the Tailwind chip hues as brand colors.
- Restyle glass form fields to match the pill-button treatment.
