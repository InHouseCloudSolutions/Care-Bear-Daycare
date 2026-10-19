/**
 * Public-folder URL for a root-absolute path.
 * `next/image` and `next/link` already apply `basePath`. Raw `<img>` src values do not.
 * Absolute http(s), data, and blob URLs are returned unchanged.
 * @param {string} path
 * @returns {string}
 */
export function publicPath(path) {
  if (!path || /^(?:[a-z]+:|\/\/)/i.test(path)) return path;
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalized}`;
}
