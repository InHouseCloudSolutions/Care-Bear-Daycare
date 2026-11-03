import { HOME_HERO_SLIDE_MS } from '@/components/home-landing/home-hero-timing';
import { galleryImagesFromSiteImages, heroSlidesFromSiteImages } from './siteImages';

const dog = {
  id: 2,
  placement: 'home_slide',
  alt: 'Dog',
  sort_order: 1,
  image_url: '/api/daycare/images/12/',
};

const yard = {
  id: 1,
  placement: 'home_slide',
  alt: 'Yard',
  sort_order: 0,
  image_url: '/api/daycare/images/4/',
};

describe('heroSlidesFromSiteImages', () => {
  it('returns null for an empty list', () => {
    expect(heroSlidesFromSiteImages([])).toBeNull();
  });

  it('returns null for a failed payload', () => {
    expect(heroSlidesFromSiteImages(null)).toBeNull();
    expect(heroSlidesFromSiteImages(undefined)).toBeNull();
    expect(heroSlidesFromSiteImages({ placement: ['Use home_slide or gallery.'] })).toBeNull();
    expect(heroSlidesFromSiteImages({ detail: 'Not found.' })).toBeNull();
  });

  it('returns null when no image url can be shown in the browser', () => {
    expect(
      heroSlidesFromSiteImages([
        { id: 1, alt: 'Remote', sort_order: 0, image_url: 'https://example.com/a.jpg' },
        { id: 2, alt: 'Missing', sort_order: 1 },
      ]),
    ).toBeNull();
  });

  it('maps a usable list into hero slides and keeps the built-in duration', () => {
    expect(heroSlidesFromSiteImages([dog, yard])).toEqual([
      {
        id: 1,
        imageUrl: '/daycare-api/daycare/images/4/',
        alt: 'Yard',
        durationMs: HOME_HERO_SLIDE_MS,
      },
      {
        id: 2,
        imageUrl: '/daycare-api/daycare/images/12/',
        alt: 'Dog',
        durationMs: HOME_HERO_SLIDE_MS,
      },
    ]);
  });

  it('drops entries without a daycare image src and still returns the rest', () => {
    expect(
      heroSlidesFromSiteImages([
        { id: 9, alt: 'Nope', sort_order: 0, image_url: '/imgs/home/slide-001.jpg' },
        dog,
      ]),
    ).toEqual([
      {
        id: 2,
        imageUrl: '/daycare-api/daycare/images/12/',
        alt: 'Dog',
        durationMs: HOME_HERO_SLIDE_MS,
      },
    ]);
  });

  it('uses an empty alt when the API omits one', () => {
    expect(
      heroSlidesFromSiteImages([{ id: 3, sort_order: 0, image_url: '/api/daycare/images/3/' }]),
    ).toEqual([
      {
        id: 3,
        imageUrl: '/daycare-api/daycare/images/3/',
        alt: '',
        durationMs: HOME_HERO_SLIDE_MS,
      },
    ]);
  });
});

describe('galleryImagesFromSiteImages', () => {
  it('returns null for an empty list and a failed payload', () => {
    expect(galleryImagesFromSiteImages([])).toBeNull();
    expect(galleryImagesFromSiteImages({ detail: 'No.' })).toBeNull();
  });

  it('maps a usable list to src and alt in sort order', () => {
    expect(
      galleryImagesFromSiteImages([
        { ...dog, placement: 'gallery' },
        { ...yard, placement: 'gallery', alt: 'Care Bear Daycare' },
      ]),
    ).toEqual([
      { src: '/daycare-api/daycare/images/4/', alt: 'Care Bear Daycare' },
      { src: '/daycare-api/daycare/images/12/', alt: 'Dog' },
    ]);
  });
});
