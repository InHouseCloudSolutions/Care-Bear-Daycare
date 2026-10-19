/**
 * Public marketing SEO for Care Bear Daycare.
 * Bare titles rely on the root layout template: `%s | Care Bear Daycare`.
 * Home uses absoluteTitle so the template is not applied.
 */

import publicPath from './publicPath';

const OG_IMAGE_PATH = publicPath('/imgs/logos/logo_square.png');
const OG_IMAGE_ALT = 'Care Bear Daycare';

export const WEBSITE_SEO = {
  '/': {
    absoluteTitle: 'Care Bear Daycare',
    description:
      'Care Bear Daycare offers overnight care and daycare for dogs, with a safe backyard made for play. Book a stay, or plan a visit and tell us about your dog.',
  },
  '/about': {
    title: 'About',
    description:
      'Carrie provides daycare and overnight care in her home, with a safe backyard for outdoor play. Care follows each dog’s needs, and visits are booked on Rover.',
  },
  '/how-a-stay-works': {
    title: 'How a stay works',
    description:
      'Three simple steps, from getting to know your dog to welcoming them home: meet Carrie, settle into her home for play and rest, then hear how the stay went.',
  },
  '/gallery': {
    title: 'Gallery',
    description:
      'Browse photos from Care Bear Daycare: dogs at play and the home where Carrie offers daycare and overnight care, with a safe backyard for outdoor play.',
  },
  '/contact': {
    title: 'Contact',
    description:
      'Tell us about your dog and the stay you have in mind. Care Bear Daycare will follow up to plan a visit for daycare or overnight care in Carrie’s home.',
  },
};

/**
 * Shared Open Graph / Twitter / canonical metadata for marketing pages.
 * Pass bare `title` so the layout template can suffix the document title, or `absoluteTitle` for home.
 * Open Graph and Twitter titles include `| Care Bear Daycare` here, because an explicit share title is not templated.
 * @param {{ title?: string, description?: string, ogImage?: string, absoluteTitle?: string, path?: string }} opts
 */
export function buildShareMetadata({ title, description, ogImage, absoluteTitle, path }) {
  const displayTitle = absoluteTitle || `${title} | Care Bear Daycare`;
  const openGraph = {
    title: displayTitle,
    description,
    type: 'website',
  };
  const twitter = {
    card: 'summary_large_image',
    title: displayTitle,
    description,
  };

  if (ogImage) {
    const image = { url: ogImage, alt: OG_IMAGE_ALT };
    openGraph.images = [image];
    twitter.images = [image];
  }

  const metadata = {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    openGraph,
    twitter,
  };

  if (path != null && path !== '') {
    metadata.alternates = { canonical: path };
  }

  return metadata;
}

/**
 * Origin for non-page URLs such as the sitemap.
 * Blank while NEXT_PUBLIC_HOST is unset or still the previous brand, so public
 * metadata stays on path canonicals until a Care Bear Daycare domain exists.
 */
export const PUBLIC_SITE_ORIGIN = (() => {
  const origin = (process.env.NEXT_PUBLIC_HOST || '').replace(/\/$/, '');
  if (!origin || /niico/i.test(origin)) return '';
  return origin;
})();

/**
 * Next.js metadata for a static marketing path in WEBSITE_SEO.
 * Canonicals stay as paths. An absolute URL is not emitted from the previous brand host.
 * @param {string} path route path e.g. '/' or '/about'
 */
export function pageMetadata(path) {
  const entry = WEBSITE_SEO[path];
  if (!entry) {
    return {};
  }
  return buildShareMetadata({ ...entry, path, ogImage: OG_IMAGE_PATH });
}

/**
 * Homepage business details for crawlers.
 * `url` is omitted until a Care Bear Daycare domain exists.
 * @returns {Record<string, unknown>}
 */
export function homePageJsonLd() {
  const home = WEBSITE_SEO['/'];
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Care Bear Daycare',
    description: home.description,
  };
}
