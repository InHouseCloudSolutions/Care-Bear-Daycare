/**
 * @jest-environment node
 */

import {
  averageStarRating,
  countReviews,
  reviewVerificationLabel,
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

describe('averageStarRating', () => {
  it('returns null when there are no reviews', () => {
    expect(averageStarRating([])).toBeNull();
  });

  it('averages every rating to one decimal', () => {
    expect(averageStarRating([older, newer])).toBe(4.5);
    expect(averageStarRating([older, newer, sameDayLater])).toBe(3.7);
  });
});
