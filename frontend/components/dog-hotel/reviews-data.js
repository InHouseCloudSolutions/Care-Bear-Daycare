/**
 * Public reviews for Carrie B.
 * source is rover, google, or internal. Only rover and google are shown as verified.
 * stayedOn is the date on the review, and is a sort key only.
 * Dog photos are saved under public/imgs/reviews. Replace those files with your own photos later.
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} stayedOn YYYY-MM-DD
 * @property {string} dogName
 * @property {string} ownerFirstName
 * @property {number} stars 1–5
 * @property {string} quote
 * @property {string|null} photoSrc site path only, never a Rover or stock URL
 * @property {string|null} photoAlt
 * @property {{src: string, alt: string}[]=} photos extra dogs on the same stay
 * @property {'rover'|'google'|'internal'} source rover and google are verified; internal is an in-house survey or note
 */

/** @type {Record<'rover'|'google'|'internal', string|null>} */
const VERIFICATION_LABELS = {
  rover: 'Verified Rover client',
  google: 'Verified Google review',
  internal: null,
};

/** Badge copy for Rover and Google. Internal reviews are not tagged. */
export function reviewVerificationLabel(source) {
  return VERIFICATION_LABELS[source] ?? null;
}

/** @type {Review[]} */
export const REVIEWS = [
  {
    source: 'rover',
    id: 'AelVD6oQ',
    stayedOn: '2026-09-28',
    dogName: 'Buddy',
    ownerFirstName: 'Glenn',
    stars: 5,
    quote:
      'Carrie was exactly what we were looking for. While we were away the communication could not have been better.',
    photoSrc: '/imgs/reviews/buddy.jpg',
    photoAlt: 'Buddy',
  },
  {
    source: 'rover',
    id: 'gVavvlON',
    stayedOn: '2026-08-21',
    dogName: 'Cletus & Juice & Bullet',
    ownerFirstName: 'April',
    stars: 5,
    quote:
      'Lovely lady, my three dogs never go with anyone it was their first time, we are from Dawson creek visiting family and wanted to go to the African lion safari definitely would book her again and again!',
    photoSrc: '/imgs/reviews/cletus.jpg',
    photoAlt: 'Cletus',
    photos: [
      { src: '/imgs/reviews/cletus.jpg', alt: 'Cletus' },
      { src: '/imgs/reviews/juice.jpg', alt: 'Juice' },
      { src: '/imgs/reviews/bullet.jpg', alt: 'Bullet' },
    ],
  },
  {
    source: 'rover',
    id: 'NqO9DVpQ',
    stayedOn: '2026-08-13',
    dogName: 'Koko',
    ownerFirstName: 'Kirsten',
    stars: 5,
    quote:
      'Carrie took such good care of Koko for the evening. It was so nice to come home to a tired, happy puppy! Thank you!',
    photoSrc: '/imgs/reviews/koko.jpg',
    photoAlt: 'Koko',
  },
  {
    source: 'rover',
    id: 'gaD1dDMN',
    stayedOn: '2026-07-16',
    dogName: 'Hazel',
    ownerFirstName: 'Lori',
    stars: 5,
    quote: 'Carrie took the best care of Hazel! Will definitely be booking her again 🐶♥️',
    photoSrc: '/imgs/reviews/hazel.jpg',
    photoAlt: 'Hazel',
  },
  {
    source: 'rover',
    id: 'gxdzov1g',
    stayedOn: '2026-06-18',
    dogName: 'Jade & Pearl',
    ownerFirstName: 'Bella',
    stars: 5,
    quote:
      'She was so sweet and took wonderful care of my two dogs. She always kept me updated, and I felt completely at ease knowing they were in good hands. I would definitely use her again!',
    photoSrc: '/imgs/reviews/jade.jpg',
    photoAlt: 'Jade',
    photos: [
      { src: '/imgs/reviews/jade.jpg', alt: 'Jade' },
      { src: '/imgs/reviews/pearl.jpg', alt: 'Pearl' },
    ],
  },
  {
    source: 'rover',
    id: 'AZ1V37XQ',
    stayedOn: '2026-05-04',
    dogName: 'Finn',
    ownerFirstName: 'Rebecca & Philip',
    stars: 5,
    quote: 'Carrie was great with Finn. He was comfortable so quickly!',
    photoSrc: '/imgs/reviews/finn.jpg',
    photoAlt: 'Finn',
  },
  {
    source: 'rover',
    id: 'NbnpDp1N',
    stayedOn: '2026-04-29',
    dogName: 'Oliver',
    ownerFirstName: 'Katrina',
    stars: 5,
    quote:
      'I can tell my super energetic (and noisy) Aussie Shepherd had a great 1st stay with Carrie!',
    photoSrc: '/imgs/reviews/oliver.jpg',
    photoAlt: 'Oliver',
  },
  {
    source: 'rover',
    id: 'APzq8wEg',
    stayedOn: '2026-04-09',
    dogName: 'Lexi',
    ownerFirstName: 'Kate',
    stars: 5,
    quote:
      'Carrie was great! She was super communicative and took amazing care of my dog Lexi, who was recovering from a recent surgery. Would definitely book again!',
    photoSrc: '/imgs/reviews/lexi.jpg',
    photoAlt: 'Lexi',
  },
  {
    source: 'rover',
    id: 'g2lvGM4A',
    stayedOn: '2026-04-07',
    dogName: 'Ksana',
    ownerFirstName: 'Grace',
    stars: 5,
    quote:
      'Carrie was absolutely lovely and communicative. I completely felt our dog was in safe and caring hands over the long weekend and would not hesitate to recommend Carrie!',
    photoSrc: '/imgs/reviews/ksana.jpg',
    photoAlt: 'Ksana',
  },
  {
    source: 'rover',
    id: 'gR1ObeWN',
    stayedOn: '2026-02-27',
    dogName: 'Peaches & Clementine',
    ownerFirstName: 'Alex',
    stars: 5,
    quote:
      'Carrie was absolutely wonderful with our two dogs! She took such great care of them for the day and gave us total peace of mind while we were away. It’s clear she genuinely loves animals and pays attention to the little details that make a difference. Our dogs were happy, relaxed, and clearly well cared for when we got home. We wouldn’t hesitate to book her again and highly recommend her to anyone looking for a reliable and caring dog sitter.',
    photoSrc: '/imgs/reviews/peaches.jpg',
    photoAlt: 'Peaches',
    photos: [
      { src: '/imgs/reviews/peaches.jpg', alt: 'Peaches' },
      { src: '/imgs/reviews/clementine.jpg', alt: 'Clementine' },
    ],
  },
];

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
