export const STAFF_PREFIX = '/staff';

export const isExternalHref = href => /^https?:\/\//i.test(href);

export const DESIGN_STUDIO_PATH = '/design-studio';
export const TRADE_PARTNER_PATH = '/trade-partner';
export const EVENT_FORM_PATH = '/event/form';
export const LOGIN_PATH = '/login';
export const REGISTER_PATH = '/register';
export const ACCOUNT_PATH = '/account';
export const ACCOUNT_API_TEST_PATH = '/account/api-test';
export const FORGOT_PASSWORD_PATH = '/forgot-password';

/** Safe post-login redirect: only paths under ACCOUNT_PATH, else the account root. */
export function safeAccountNextPath(next) {
  if (typeof next !== 'string' || !next.startsWith(ACCOUNT_PATH)) return ACCOUNT_PATH;
  return next;
}

export const THE_BRAND_PATH = '/the-brand';
export const OUR_PROCESS_PATH = '/our-process';
export const TRADE_PATH = '/trade';
export const PORTFOLIO_PATH = '/portfolio';

export function portfolioSlugPath(slug) {
  return `${PORTFOLIO_PATH}/${slug}`;
}
export const BOOK_ONLINE_PATH = '/book-online';
export const BOOK_ONLINE_ACTION_PATH = '/book-online/action';
/** Legacy Acuity URL (unused). Internal booker is BOOK_ONLINE_PATH. */
export const BOOK_ONLINE_EXTERNAL_URL = 'https://app.acuityscheduling.com/schedule/12e07076';
export const COLLECTIONS_PATH = '/collections';
export const SUB_COLLECTIONS_PATH = '/sub-collections';

/** Future route once sub-collections are backed by API (e.g. /collections/kitchens/the-limerick). */
export function collectionSubCollectionPath(collectionSlug, subCollectionSlug) {
  return `${COLLECTIONS_PATH}/${collectionSlug}/${subCollectionSlug}`;
}
export const STUDIO_PATH = '/studio';
export const NEWS_PATH = '/news';
export const LOOKBOOKS_PATH = '/lookbooks';
export const PRINT_PATH = '/print';
export const BLOGS_PATH = '/blogs';
export const CAREERS_PATH = '/careers';
export const CONTACT_PATH = '/contact';
export const ABOUT_PATH = '/about';
export const HOW_A_STAY_WORKS_PATH = '/how-a-stay-works';
export const CARE_AND_SAFETY_PATH = '/care-and-safety';
export const REVIEWS_PATH = '/reviews';
export const GALLERY_PATH = '/gallery';
/** Carrie's Rover profile. Every Rover link on the site uses this URL. */
export const ROVER_BOOKING_URL = 'https://www.rover.com/sit/carrib24913';
export const BOUTIQUE_DEVELOPERS_PATH = '/boutique-development-home-builders';

export function boutiqueDevelopersSlugPath(slug) {
  return `${BOUTIQUE_DEVELOPERS_PATH}/${slug}`;
}
export const PRODUCT_MANUALS_PATH = '/product-manuals';

export function productManualSlugPath(slug) {
  return `${PRODUCT_MANUALS_PATH}/${slug}`;
}
export const DEALERS_PATH = '/dealers';

function staffPathSuffix(path) {
  if (path.startsWith('/')) return path;
  if (path) return `/${path}`;
  return '';
}

export const staffPath = (path = '') => `${STAFF_PREFIX}${staffPathSuffix(path)}`;

export const staffLoginHref = () => `${LOGIN_PATH}?next=${encodeURIComponent(staffPath())}`;

export function isHomeRoute(pathname) {
  return pathname === '/';
}

export function isStaffRoute(pathname) {
  return pathname.startsWith(STAFF_PREFIX);
}

/** Live public marketing pages. Unpublished millwork paths are not included. */
export function isMarketingRoute(pathname) {
  return (
    pathname === '/' ||
    pathname === ABOUT_PATH ||
    pathname === HOW_A_STAY_WORKS_PATH ||
    pathname === CARE_AND_SAFETY_PATH ||
    pathname === REVIEWS_PATH ||
    pathname === GALLERY_PATH ||
    pathname === CONTACT_PATH
  );
}

export function isMarketingInteriorRoute(pathname) {
  return isMarketingRoute(pathname) && !isHomeRoute(pathname);
}

/** Live public form page. Auth screens stay reachable but are not marketing pages. */
export function isMarketingFormRoute(pathname) {
  return pathname === CONTACT_PATH;
}
