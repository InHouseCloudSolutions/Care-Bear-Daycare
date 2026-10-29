/**
 * @jest-environment node
 */

import {
  averageStarRating,
  countReviews,
  mapSiteReview,
  reviewVerificationLabel,
  reviewsFromSiteResponse,
  sortReviewsNewestFirst,
} from './reviews-data';

const older = {
  id: 'older',
  stayedOn: '2024-03-02',
  dogName: 'Ada',
  ownerFirstName: 'Sam',
  stars: 5,
  quote: 'Exact quote.',
  photoSrc: null,
  photoAlt: null,
};

const newer = {
  id: 'newer',
  stayedOn: '2025-11-18',
  dogName: 'Bea',
  ownerFirstName: 'Jo',
  stars: 4,
  quote: 'Another exact quote.',
  photoSrc: '/imgs/reviews/bea.jpg',
  photoAlt: 'Bea in the yard',
};

const sameDayLater = {
  id: 'same-day-later',
  stayedOn: '2025-11-18',
  dogName: 'Cleo',
  ownerFirstName: 'Alex',
  stars: 2,
  quote: 'Low rating stays in the list.',
  photoSrc: null,
  photoAlt: null,
};

describe('reviewVerificationLabel', () => {
  it('tags Rover and Google reviews and leaves internal reviews untagged', () => {
    expect(reviewVerificationLabel('rover')).toBe('Verified Rover client');
    expect(reviewVerificationLabel('google')).toBe('Verified Google review');
    expect(reviewVerificationLabel('internal')).toBeNull();
    expect(reviewVerificationLabel(undefined)).toBeNull();
  });
});

describe('sortReviewsNewestFirst', () => {
  it('sorts newest stay first without dropping low ratings', () => {
    const sorted = sortReviewsNewestFirst([older, newer, sameDayLater]);
    expect(sorted.map(review => review.id)).toEqual(['newer', 'same-day-later', 'older']);
  });

  it('keeps equal stay dates in their original order and does not mutate the input', () => {
    const input = [newer, sameDayLater];
    const sorted = sortReviewsNewestFirst(input);
    expect(sorted.map(review => review.id)).toEqual(['newer', 'same-day-later']);
    expect(input.map(review => review.id)).toEqual(['newer', 'same-day-later']);
    expect(sorted).not.toBe(input);
  });

  it('returns an empty list unchanged', () => {
    expect(sortReviewsNewestFirst([])).toEqual([]);
  });
});

describe('countReviews', () => {
  it('counts every review, including low ratings', () => {
    expect(countReviews([older, newer, sameDayLater])).toBe(3);
  });

  it('is zero for an empty list', () => {
    expect(countReviews([])).toBe(0);
  });
});

describe('mapSiteReview', () => {
  const fallback = [older];

  it('maps a site-reviews row and drops empty photos', () => {
    expect(
      mapSiteReview({
        id: 'marco-sia-2026-10-23',
        source: 'rover',
        stayed_on: '2026-10-23',
        dog_name: 'Marco & Sia',
        owner_first_name: 'L',
        stars: 5,
        quote: 'Exact quote.',
        photo_src: '',
        photo_alt: null,
        photos: [
          { src: '/imgs/reviews/marco.bmp', alt: 'Marco' },
          { src: '', alt: 'skipped' },
        ],
      }),
    ).toEqual({
      id: 'marco-sia-2026-10-23',
      source: 'rover',
      stayedOn: '2026-10-23',
      dogName: 'Marco & Sia',
      ownerFirstName: 'L',
      stars: 5,
      quote: 'Exact quote.',
      photoSrc: null,
      photoAlt: null,
      photos: [{ src: '/imgs/reviews/marco.bmp', alt: 'Marco' }],
    });
  });

  it('ignores rows missing id or quote', () => {
    expect(mapSiteReview({ quote: 'No id' })).toBeNull();
    expect(mapSiteReview({ id: 'no-quote' })).toBeNull();
    expect(mapSiteReview(null)).toBeNull();
  });

  it('keeps the fallback when the response failed or mapped to nothing', () => {
    const apiReview = {
      id: 'api-1',
      source: 'google',
      stayed_on: '2026-01-02',
      dog_name: 'Nia',
      owner_first_name: 'Pat',
      stars: 4,
      quote: 'From the API.',
      photo_src: null,
      photo_alt: '',
    };

    expect(reviewsFromSiteResponse(fallback, { ok: false, status: 0, data: null })).toBe(fallback);
    expect(reviewsFromSiteResponse(fallback, { ok: false, status: 500, data: [] })).toBe(fallback);
    expect(reviewsFromSiteResponse(fallback, { ok: true, status: 200, data: [] })).toBe(fallback);
    expect(
      reviewsFromSiteResponse(fallback, { ok: true, status: 200, data: [{ quote: 'x' }] }),
    ).toBe(fallback);
    expect(reviewsFromSiteResponse(fallback, null)).toBe(fallback);
    expect(reviewsFromSiteResponse(fallback, { ok: true, status: 200, data: [apiReview] })).toEqual(
      [
        {
          id: 'api-1',
          source: 'google',
          stayedOn: '2026-01-02',
          dogName: 'Nia',
          ownerFirstName: 'Pat',
          stars: 4,
          quote: 'From the API.',
          photoSrc: null,
          photoAlt: null,
        },
      ],
    );
  });
});

describe('averageStarRating', () => {
  it('returns null when there are no reviews', () => {
    expect(averageStarRating([])).toBeNull();
  });

  it('averages every rating to one decimal', () => {
    expect(averageStarRating([older, newer])).toBe(4.5);
    expect(averageStarRating([older, newer, sameDayLater])).toBe(3.7);
  });
});
