/**
 * Care Bear Daycare palette, sampled from the logo.
 * Cream paper, deep teal ink, caramel accent, a little coral.
 */

/** Nav bar, footer shell, page background. Lifted bear cream. */
export const WEBSITE_PAGE_BACKGROUND = '#FBF4E8';

/** Muted cream — footer link columns, elevated inset sections. */
export const WEBSITE_PAGE_BACKGROUND_MUTED = '#F3E6D2';

/** Dark cream — borders, footer bottom strip, subtle hierarchy. */
export const WEBSITE_PAGE_BACKGROUND_DARK = '#E4D0B4';

/** Wordmark teal — primary text and ink fills on cream. */
export const WEBSITE_INK = '#0B3C43';

/** Teal hover. */
export const WEBSITE_INK_HOVER = '#14525C';

/** Caramel accent from the dog's fur. */
export const WEBSITE_ACCENT = '#D9924F';

/** Coral from the heart. */
export const WEBSITE_HEART = '#CF5133';

/** Cards and paper sheets. */
export const WEBSITE_PAPER = '#FFFCF7';

/**
 * Cream scrollbars (website + staff light).
 * Mirrored as --website-scrollbar-* in styles/marketing-interior.css.
 */
export const WEBSITE_SCROLLBAR_TRACK = WEBSITE_PAGE_BACKGROUND;
export const WEBSITE_SCROLLBAR_THUMB = WEBSITE_PAGE_BACKGROUND_DARK;
export const WEBSITE_SCROLLBAR_THUMB_HOVER = '#D4BC9C';

/** Staff dark mode — teal charcoal (inverse of the wordmark, not warm brown). */
export const STAFF_DARK_BACKGROUND = '#0E272C';
export const STAFF_DARK_SURFACE_MUTED = '#16353B';
export const STAFF_DARK_SURFACE_ELEVATED = '#1E454C';

/** Staff dark cards. */
export const STAFF_DARK_PAPER = '#122E34';

/**
 * Staff light mode — warmer elevated cream.
 * Page default stays WEBSITE_PAGE_BACKGROUND;
 * muted/border reuse WEBSITE_PAGE_BACKGROUND_MUTED / _DARK.
 */
export const STAFF_LIGHT_SURFACE_ELEVATED = '#F7EBDC';
