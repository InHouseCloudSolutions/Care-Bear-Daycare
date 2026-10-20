/**
 * Public Rover reviews copied onto this site.
 * `stayedOn` is a sort key only. Launch with an empty list — do not invent reviews.
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} stayedOn YYYY-MM-DD
 * @property {string} dogName
 * @property {string} ownerFirstName
 * @property {number} stars 1–5
 * @property {string} quote
 * @property {string|null} photoSrc site path only, never a Rover or stock URL
 * @property {string|null} photoAlt
 */

/** @type {Review[]} */
export const REVIEWS = [];

/** Newest stay first. Equal dates keep their original order. */
export function sortReviewsNewestFirst(reviews) {
  return [...reviews].sort((a, b) => b.stayedOn.localeCompare(a.stayedOn));
}

export function countReviews(reviews) {
  return reviews.length;
}

/** One decimal place, or null when there are no reviews. */
export function averageStarRating(reviews) {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, review) => sum + review.stars, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}
