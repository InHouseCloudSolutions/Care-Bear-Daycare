/**
 * @jest-environment node
 */

import { buildShareMetadata, homePageJsonLd, pageMetadata } from './website-seo';

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
  it('sets the homepage title for Care Bear Daycare with a path canonical', () => {
    const meta = pageMetadata('/');
    expect(meta.title).toEqual({ absolute: 'Care Bear Daycare' });
    expect(meta.description).toContain('safe backyard made for play');
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
    expect(meta.description).not.toMatch(/suites/i);
  });

  it('returns empty object for unknown paths', () => {
    expect(pageMetadata('/not-a-real-path')).toEqual({});
  });
});

describe('homePageJsonLd', () => {
  it('describes Care Bear Daycare as lodging, without a claimed city', () => {
    const jsonLd = homePageJsonLd();
    expect(jsonLd).toMatchObject({
      '@type': 'LodgingBusiness',
      name: 'Care Bear Daycare',
    });
    expect(jsonLd.url).toBeUndefined();
    expect(jsonLd.address).toBeUndefined();
    expect(jsonLd.areaServed).toBeUndefined();
    expect(JSON.stringify(jsonLd)).not.toMatch(/niico|vaughan|toronto|millwork|kitchen/i);
  });
});
