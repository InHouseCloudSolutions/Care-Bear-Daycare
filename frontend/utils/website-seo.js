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
    absoluteTitle: 'Dog Daycare in Toronto & the GTA | Care Bear Daycare',
    description:
      'Care Bear Daycare offers dog daycare and overnight care in Toronto and the GTA, with a safe backyard made for play. Book a stay, or plan a visit and tell us about your dog.',
  },
  '/about': {
    title: 'About',
    description:
      'Carrie has spent 20 years caring for dogs. She offers dog daycare and overnight care in her Toronto home for the GTA, with a fully fenced backyard, and visits are booked on Rover.',
  },
  '/how-a-stay-works': {
    title: 'How a stay works',
    description:
      'Three simple steps for dog daycare in Toronto and the GTA: meet Carrie at her home, settle in for play and rest, then hear how the stay went.',
  },
  '/care-and-safety': {
    title: 'Care and safety',
    description:
      'Meet Carrie at her Toronto home before a stay. She offers dog daycare and overnight care for the GTA. Dogs have a fully fenced backyard, and emergency care goes to Woodbine Animal Clinic.',
  },
  '/reviews': {
    title: 'Reviews',
    description:
      'Reviews for Care Bear Daycare dog daycare and overnight care in Toronto and the GTA, including verified Rover and Google reviews.',
  },
  '/gallery': {
    title: 'Gallery',
    description:
      'Browse photos from Care Bear Daycare in Toronto and the GTA: dogs at play and the home where Carrie offers dog daycare and overnight care, with a safe backyard for outdoor play.',
  },
  '/contact': {
    title: 'Contact',
    description:
      'Tell us about your dog and the stay you have in mind. Care Bear Daycare will follow up to plan a visit for dog daycare or overnight care in Toronto and the GTA.',
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
 * Host from NEXT_PUBLIC_HOST.
 * Blank while unset or still the previous brand, so path canonicals stay off that domain.
 */
function configuredPublicHost() {
  const origin = (process.env.NEXT_PUBLIC_HOST || '').replace(/\/$/, '');
  if (!origin || /niico/i.test(origin)) return '';
  return origin;
}

/**
 * Origin for non-page URLs such as the sitemap.
 * Blank while NEXT_PUBLIC_HOST is unset or still the previous brand.
 */
export const PUBLIC_SITE_ORIGIN = configuredPublicHost();

/** Public site used when the configured host is blank, local, or the previous brand. */
export const CARE_BEAR_PUBLIC_ORIGIN = 'https://carebeardaycare.ca';

/**
 * Absolute origin for the sitemap and homepage JSON-LD.
 * A real Care Bear host wins. Localhost and the previous brand never do.
 */
export function publicMarketingOrigin() {
  const origin = configuredPublicHost();
  if (!origin || /localhost|127\.0\.0\.1/i.test(origin)) {
    return CARE_BEAR_PUBLIC_ORIGIN;
  }
  return origin;
}

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
 * City and region only: no street address, postal code, or geo.
 * @returns {Record<string, unknown>}
 */
export function homePageJsonLd() {
  const home = WEBSITE_SEO['/'];
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Care Bear Daycare',
    description: home.description,
    url: publicMarketingOrigin(),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Toronto',
      addressRegion: 'ON',
      addressCountry: 'CA',
    },
    areaServed: [
      { '@type': 'City', name: 'Toronto' },
      { '@type': 'AdministrativeArea', name: 'Greater Toronto Area' },
    ],
  };
}
