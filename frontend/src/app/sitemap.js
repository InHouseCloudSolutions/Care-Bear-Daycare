import { PUBLIC_SITE_ORIGIN, WEBSITE_SEO } from '@/utils/website-seo';

const HOST = (PUBLIC_SITE_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');

function toSitemapEntry(path) {
  return {
    url: path === '/' ? `${HOST}/` : `${HOST}${path}`,
    lastModified: new Date(),
  };
}

/** Live public marketing URLs only. Unpublished millwork paths stay off the sitemap. */
export default function sitemap() {
  return Object.keys(WEBSITE_SEO).map(toSitemapEntry);
}
