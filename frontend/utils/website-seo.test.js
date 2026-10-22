/**
 * @jest-environment node
 */

import {
  buildShareMetadata,
  CARE_BEAR_PUBLIC_ORIGIN,
  homePageJsonLd,
  pageMetadata,
  publicMarketingOrigin,
} from './website-seo';

describe('buildShareMetadata', () => {
  it('sets bare title, description, OG/Twitter, and canonical', () => {
    const meta = buildShareMetadata({
      title: 'News & Media',
      description: 'Latest updates',
      path: '/news',
    });
    expect(meta.title).toBe('News & Media');
    expect(meta.description).toBe('Latest updates');
    expect(meta.alternates).toEqual({ canonical: '/news' });
    expect(meta.openGraph).toMatchObject({
      title: 'News & Media | Care Bear Daycare',
      description: 'Latest updates',
      type: 'website',
    });
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'News & Media | Care Bear Daycare',
      description: 'Latest updates',
    });
  });

  it('uses absolute title for home without double template suffix', () => {
    const meta = buildShareMetadata({
      absoluteTitle: 'Care Bear Daycare',
      description: 'Home description',
      path: '/',
      ogImage: '/imgs/logos/logo_square.png',
    });
    expect(meta.title).toEqual({ absolute: 'Care Bear Daycare' });
    expect(meta.openGraph.images).toEqual([
      { url: '/imgs/logos/logo_square.png', alt: 'Care Bear Daycare' },
    ]);
    expect(meta.alternates).toEqual({ canonical: '/' });
  });
});

describe('pageMetadata', () => {
  it('sets the homepage title for dog daycare in Toronto and the GTA', () => {
    const meta = pageMetadata('/');
    expect(meta.title).toEqual({
      absolute: 'Dog Daycare in Toronto & the GTA | Care Bear Daycare',
    });
    expect(meta.description).toMatch(/dog daycare/i);
    expect(meta.description).toMatch(/Toronto/);
    expect(meta.description).toMatch(/GTA/);
    expect(meta.description).toContain('safe backyard made for play');
    expect(meta.description).not.toMatch(/\bbest\b/i);
    expect(meta.alternates).toEqual({ canonical: '/' });
    expect(meta.openGraph.images).toEqual([
      { url: '/imgs/logos/logo_square.png', alt: 'Care Bear Daycare' },
    ]);
    expect(meta.openGraph.url).toBeUndefined();
    expect(JSON.stringify(meta)).not.toMatch(/niico/i);
  });

  it('returns share metadata with canonical for known paths', () => {
    const meta = pageMetadata('/about');
    expect(meta.title).toBe('About');
    expect(meta.alternates).toEqual({ canonical: '/about' });
    expect(meta.description).toContain('Carrie');
    expect(meta.description).toMatch(/Toronto|GTA/);
    expect(meta.description).not.toMatch(/suites/i);
  });

  it('returns empty object for unknown paths', () => {
    expect(pageMetadata('/not-a-real-path')).toEqual({});
  });
});

describe('publicMarketingOrigin', () => {
  const originalHost = process.env.NEXT_PUBLIC_HOST;

  afterEach(() => {
    if (originalHost === undefined) {
      delete process.env.NEXT_PUBLIC_HOST;
    } else {
      process.env.NEXT_PUBLIC_HOST = originalHost;
    }
  });

  it('uses a Care Bear host and falls back off localhost', () => {
    delete process.env.NEXT_PUBLIC_HOST;
    expect(publicMarketingOrigin()).toBe(CARE_BEAR_PUBLIC_ORIGIN);

    process.env.NEXT_PUBLIC_HOST = 'http://localhost:3000';
    expect(publicMarketingOrigin()).toBe(CARE_BEAR_PUBLIC_ORIGIN);

    process.env.NEXT_PUBLIC_HOST = 'https://carebeardaycare.ca';
    expect(publicMarketingOrigin()).toBe('https://carebeardaycare.ca');

    process.env.NEXT_PUBLIC_HOST = 'https://www.niico.com';
    expect(publicMarketingOrigin()).toBe(CARE_BEAR_PUBLIC_ORIGIN);
  });
});

describe('homePageJsonLd', () => {
  it('describes Care Bear Daycare with a city-level address and service area', () => {
    const jsonLd = homePageJsonLd();
    expect(jsonLd).toMatchObject({
      '@type': 'LodgingBusiness',
      name: 'Care Bear Daycare',
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
    });
    expect(jsonLd.address.streetAddress).toBeUndefined();
    expect(jsonLd.address.postalCode).toBeUndefined();
    expect(jsonLd.geo).toBeUndefined();
    expect(jsonLd.url).toMatch(/^https:\/\/carebeardaycare\.ca\/?$/);
    expect(JSON.stringify(jsonLd)).not.toMatch(/niico|vaughan|millwork|kitchen/i);
    expect(JSON.stringify(jsonLd)).not.toMatch(/localhost/i);
  });
});
