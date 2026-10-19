import { FORGOT_PASSWORD_PATH, LOGIN_PATH, STAFF_PREFIX, isMarketingRoute } from '@/consts/routes';

/** Auth, thank-you, and other public paths that must not be indexed. */
const NON_INDEXABLE_PATHS = new Set([
  LOGIN_PATH,
  FORGOT_PASSWORD_PATH,
  '/logout',
  '/event/thank-you',
]);

/**
 * Public marketing routes safe for search indexing.
 * Mirrors `isMarketingRoute`. Excludes auth, thank-you, staff, and unpublished millwork paths.
 */
export function isIndexablePublicPath(pathname) {
  if (!pathname || typeof pathname !== 'string') {
    return false;
  }
  if (pathname === STAFF_PREFIX || pathname.startsWith(`${STAFF_PREFIX}/`)) {
    return false;
  }
  if (NON_INDEXABLE_PATHS.has(pathname)) {
    return false;
  }
  return isMarketingRoute(pathname);
}

/** Next.js `metadata.robots` — allow indexing. */
export const ROBOTS_INDEX = { index: true, follow: true };

/** Next.js `metadata.robots` — block indexing. */
export const ROBOTS_NOINDEX = { index: false, follow: false };

export function robotsMetadataForPath(pathname) {
  return isIndexablePublicPath(pathname) ? ROBOTS_INDEX : ROBOTS_NOINDEX;
}

export function robotsMetaContent(pathname) {
  if (isIndexablePublicPath(pathname)) {
    return 'index, follow';
  }
  return 'noindex, nofollow';
}
