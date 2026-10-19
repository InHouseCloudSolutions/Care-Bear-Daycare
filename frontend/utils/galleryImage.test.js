/**
 * @jest-environment node
 */

import {
  galleryImageFromApi,
  galleryImagesFromApi,
  galleryMediaSrc,
  normalizeGalleryImageList,
  photographerCreditFrom,
} from './galleryImage';

describe('photographerCreditFrom', () => {
  it('reads camelCase and snake_case', () => {
    expect(photographerCreditFrom({ photographerCredit: ' Ada ' })).toBe('Ada');
    expect(photographerCreditFrom({ photographer_credit: 'Ben' })).toBe('Ben');
  });

  it('returns empty for strings and missing values', () => {
    expect(photographerCreditFrom('/img.jpg')).toBe('');
    expect(photographerCreditFrom(null)).toBe('');
    expect(photographerCreditFrom({})).toBe('');
  });
});

describe('galleryMediaSrc', () => {
  it('supports string and object shapes', () => {
    expect(galleryMediaSrc('/a.jpg')).toBe('/a.jpg');
    expect(galleryMediaSrc({ src: '/b.jpg' })).toBe('/b.jpg');
    expect(galleryMediaSrc({ imageUrl: '/c.jpg' })).toBe('/c.jpg');
    expect(galleryMediaSrc({ file_url: '/d.jpg' })).toBe('/d.jpg');
  });
});

describe('galleryImageFromApi / galleryImagesFromApi', () => {
  it('normalizes transitional string galleries', () => {
    expect(galleryImagesFromApi(['/a.jpg', '/b.jpg'])).toEqual([
      { src: '/a.jpg', alt: '', photographerCredit: '' },
      { src: '/b.jpg', alt: '', photographerCredit: '' },
    ]);
  });

  it('preserves credit and alt on object entries', () => {
    expect(
      galleryImageFromApi({
        src: '/x.jpg',
        alt: 'Kitchen',
        photographerCredit: 'Casey',
      }),
    ).toEqual({
      src: '/x.jpg',
      alt: 'Kitchen',
      photographerCredit: 'Casey',
    });
  });
});

describe('normalizeGalleryImageList', () => {
  it('accepts mixed string and object entries', () => {
    expect(
      normalizeGalleryImageList(
        ['/a.jpg', { src: '/b.jpg', alt: 'B', photographerCredit: 'Dana' }],
        index => `Image ${index + 1}`,
      ),
    ).toEqual([
      { src: '/a.jpg', alt: 'Image 1', photographerCredit: '' },
      { src: '/b.jpg', alt: 'B', photographerCredit: 'Dana' },
    ]);
  });
});
