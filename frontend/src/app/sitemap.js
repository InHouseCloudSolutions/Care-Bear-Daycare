import { publicMarketingOrigin, WEBSITE_SEO } from '@/utils/website-seo';

export const dynamic = 'force-static';

const HOST = publicMarketingOrigin().replace(/\/$/, '');

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
