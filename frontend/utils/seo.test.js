/**
 * @jest-environment node
 */

import {
  isIndexablePublicPath,
  robotsMetaContent,
  robotsMetadataForPath,
  ROBOTS_INDEX,
  ROBOTS_NOINDEX,
} from './seo';

describe('isIndexablePublicPath', () => {
  it('indexes home and the live Care Bear Daycare pages', () => {
    expect(isIndexablePublicPath('/')).toBe(true);
    expect(isIndexablePublicPath('/about')).toBe(true);
    expect(isIndexablePublicPath('/how-a-stay-works')).toBe(true);
    expect(isIndexablePublicPath('/reviews')).toBe(true);
    expect(isIndexablePublicPath('/gallery')).toBe(true);
    expect(isIndexablePublicPath('/contact')).toBe(true);
  });

  it('does not index unpublished millwork paths', () => {
    expect(isIndexablePublicPath('/the-brand')).toBe(false);
    expect(isIndexablePublicPath('/our-process')).toBe(false);
    expect(isIndexablePublicPath('/collections')).toBe(false);
    expect(isIndexablePublicPath('/collections/kitchens')).toBe(false);
    expect(isIndexablePublicPath('/sub-collections/the-limerick')).toBe(false);
    expect(isIndexablePublicPath('/portfolio/kitchens')).toBe(false);
    expect(isIndexablePublicPath('/news/some-article')).toBe(false);
    expect(isIndexablePublicPath('/blogs/some-post')).toBe(false);
    expect(isIndexablePublicPath('/print/some-pub')).toBe(false);
    expect(isIndexablePublicPath('/design-studio')).toBe(false);
    expect(isIndexablePublicPath('/trade-partner')).toBe(false);
    expect(isIndexablePublicPath('/event/form')).toBe(false);
    expect(isIndexablePublicPath('/event/form/spring-open-house')).toBe(false);
    expect(isIndexablePublicPath('/book-online')).toBe(false);
  });

  it('does not index staff, auth, or thank-you', () => {
    expect(isIndexablePublicPath('/staff')).toBe(false);
    expect(isIndexablePublicPath('/staff/cms')).toBe(false);
    expect(isIndexablePublicPath('/login')).toBe(false);
    expect(isIndexablePublicPath('/forgot-password')).toBe(false);
    expect(isIndexablePublicPath('/logout')).toBe(false);
    expect(isIndexablePublicPath('/event/thank-you')).toBe(false);
    expect(isIndexablePublicPath('/book-online/action')).toBe(false);
  });
});

describe('robots helpers', () => {
  it('returns index/follow strings and Next robots objects', () => {
    expect(robotsMetaContent('/')).toBe('index, follow');
    expect(robotsMetaContent('/login')).toBe('noindex, nofollow');
    expect(robotsMetadataForPath('/about')).toEqual(ROBOTS_INDEX);
    expect(robotsMetadataForPath('/staff/docs')).toEqual(ROBOTS_NOINDEX);
  });
});
