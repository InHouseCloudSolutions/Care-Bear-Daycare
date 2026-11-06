'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { BOOK_STAY_PATH, ROVER_BOOKING_URL } from '@/consts/routes';
import { WEBSITE_INK, WEBSITE_PAGE_BACKGROUND } from '@/consts/website-theme';
import { listSiteReviews } from '@/lib/daycareApi';
import publicPath from '@/utils/publicPath';
import DogHotelInteriorPage from './DogHotelInteriorPage';
import {
  REVIEWS,
  averageStarRating,
  countReviews,
  reviewsFromSiteResponse,
  reviewVerificationLabel,
  sortReviewsNewestFirst,
} from './reviews-data';

const TEAL = WEBSITE_INK;
const TEAL_HOVER = '#082F34';
const ORANGE = '#E87920';
const ORANGE_HOVER = '#CF6818';
const BODY = '#6A625A';
const CARD_BORDER = '#E6DCCF';
const PAPER = '#FFFCF7';

const FEATURED_REVIEW_ID = 'AelVD6oQ';
const STORY_REVIEW_IDS = ['AZ1V37XQ', 'NqO9DVpQ', 'gaD1dDMN'];

const ICON = {
  arrowCream: publicPath('/imgs/reviews/arrow-external-cream.svg'),
  arrowTeal: publicPath('/imgs/reviews/arrow-external-teal.svg'),
  chevronDown: publicPath('/imgs/reviews/chevron-down-teal.svg'),
  chevronUp: publicPath('/imgs/reviews/chevron-up-teal.svg'),
  external: publicPath('/imgs/reviews/external-link-square.svg'),
  quoteCream: publicPath('/imgs/reviews/quote-open-cream.svg'),
  quoteOpen: publicPath('/imgs/reviews/quote-open-teal.svg'),
  quoteClose: publicPath('/imgs/reviews/quote-close-teal.svg'),
  fiveStars: publicPath('/imgs/reviews/rating-five-stars-orange.svg'),
  shield: publicPath('/imgs/reviews/shield-check.svg'),
  starFilled: publicPath('/imgs/reviews/star-filled-orange.svg'),
  starOutline: publicPath('/imgs/reviews/star-outline-orange.svg'),
};

/** Punch lines from the reviews concept. Other reviews are shortened from the quote. */
const CURATED_EXCERPTS = {
  AelVD6oQ: '…the communication could not have been better.',
  AZ1V37XQ: 'He was comfortable so quickly!',
  NqO9DVpQ: '…a tired, happy puppy!',
  gaD1dDMN: 'Will definitely be booking her again…',
};

const reviewShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  stayedOn: PropTypes.string.isRequired,
  dogName: PropTypes.string.isRequired,
  ownerFirstName: PropTypes.string.isRequired,
  stars: PropTypes.number.isRequired,
  quote: PropTypes.string.isRequired,
  photoSrc: PropTypes.string,
  photoAlt: PropTypes.string,
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
    }),
  ),
  source: PropTypes.oneOf(['rover', 'google', 'internal']).isRequired,
});

const eyebrowSx = {
  color: TEAL,
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
};

const displaySx = {
  color: TEAL,
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: 1.08,
};

function reviewPhotos(review) {
  if (Array.isArray(review.photos) && review.photos.length > 0) return review.photos;
  return [{ src: review.photoSrc, alt: review.photoAlt || review.dogName }];
}

function sitePhotoSrc(photoSrc) {
  if (typeof photoSrc !== 'string' || !photoSrc.startsWith('/') || photoSrc.startsWith('//')) {
    return null;
  }
  return publicPath(photoSrc);
}

function normalizedQuote(quote) {
  return quote.replace(/\s+/g, ' ').trim();
}

function reviewExcerpt(review) {
  const curated = CURATED_EXCERPTS[review.id];
  if (curated) return curated;
  const text = normalizedQuote(review.quote);
  if (text.length <= 88) return text;
  const slice = text.slice(0, 88);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > 40 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trim()}…`;
}

function arrangeReviews(sorted) {
  if (sorted.length === 0) return { featured: null, stories: [], more: [] };

  const featured = sorted.find(review => review.id === FEATURED_REVIEW_ID) || sorted[0];
  const remaining = sorted.filter(review => review.id !== featured.id);
  const stories = STORY_REVIEW_IDS.map(id => remaining.find(review => review.id === id)).filter(
    Boolean,
  );

  remaining.forEach(review => {
    if (stories.length >= 3) return;
    if (!stories.some(story => story.id === review.id)) stories.push(review);
  });

  const visible = new Set([featured.id, ...stories.map(story => story.id)]);
  const more = sorted.filter(review => !visible.has(review.id));
  return { featured, stories, more };
}

function ReviewIcon({ src, size }) {
  return (
    <Box
      component="img"
      src={src}
      alt=""
      sx={{ width: size, height: size, display: 'block', flexShrink: 0 }}
    />
  );
}

ReviewIcon.propTypes = {
  src: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
};

function StarRating({ stars, height }) {
  const filled = Math.min(5, Math.max(0, Math.round(stars)));
  const label = `${stars} out of 5 stars`;

  if (filled === 5) {
    return (
      <Box
        component="img"
        src={ICON.fiveStars}
        alt={label}
        sx={{ display: 'block', height, width: 'auto' }}
      />
    );
  }

  return (
    <Box role="img" aria-label={label} sx={{ display: 'flex', gap: 0.25 }}>
      {Array.from({ length: 5 }, (_, index) => (
        <ReviewIcon
          key={index}
          src={index < filled ? ICON.starFilled : ICON.starOutline}
          size={height}
        />
      ))}
    </Box>
  );
}

StarRating.propTypes = {
  stars: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

function ReviewCover({ review, aspectRatio }) {
  const photo = reviewPhotos(review)[0];
  const src = photo ? sitePhotoSrc(photo.src) : null;
  const alt = photo?.alt || review.dogName;

  return (
    <Box
      sx={{
        borderRadius: '18px',
        overflow: 'hidden',
        bgcolor: '#EFE6D8',
        aspectRatio,
        width: '100%',
      }}
    >
      {src ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Box role="img" aria-label="No photo provided" sx={{ width: '100%', height: '100%' }} />
      )}
    </Box>
  );
}

ReviewCover.propTypes = {
  review: reviewShape.isRequired,
  aspectRatio: PropTypes.string.isRequired,
};

function ExtraPhotos({ review }) {
  const extras = reviewPhotos(review).slice(1);
  if (extras.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
      {extras.map((photo, index) => {
        const src = sitePhotoSrc(photo.src);
        const alt = photo.alt || review.dogName;
        const key = `${src || 'empty'}-${index}`;
        if (!src) return null;
        return (
          <Box
            key={key}
            component="img"
            src={src}
            alt={alt}
            sx={{
              width: 72,
              height: 72,
              objectFit: 'cover',
              borderRadius: '12px',
              display: 'block',
            }}
          />
        );
      })}
    </Box>
  );
}

ExtraPhotos.propTypes = {
  review: reviewShape.isRequired,
};

function QuoteText({ text, featured }) {
  return (
    <Typography
      component="blockquote"
      sx={{
        m: 0,
        color: TEAL,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: featured ? 1.25 : 1.3,
        fontSize: featured ? { xs: '1.45rem', md: '1.85rem' } : { xs: '1.15rem', md: '1.28rem' },
      }}
    >
      {featured ? (
        <>
          <Box
            component="img"
            src={ICON.quoteOpen}
            alt=""
            sx={{
              width: 32,
              height: 32,
              display: 'inline-block',
              mr: 1,
              verticalAlign: '-0.2em',
            }}
          />
          {`${text} `}
          <Box
            component="img"
            src={ICON.quoteClose}
            alt=""
            sx={{
              width: 26,
              height: 26,
              display: 'inline-block',
              verticalAlign: '-0.15em',
            }}
          />
        </>
      ) : (
        `“${text}”`
      )}
    </Typography>
  );
}

QuoteText.propTypes = {
  text: PropTypes.string.isRequired,
  featured: PropTypes.bool,
};

function VerifiedBadge({ source, boxed }) {
  const label = reviewVerificationLabel(source);
  if (!label) return null;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        color: TEAL,
        border: boxed ? `1px solid ${CARD_BORDER}` : 'none',
        borderRadius: 999,
        px: boxed ? 1.25 : 0,
        py: boxed ? 0.6 : 0,
        bgcolor: boxed ? PAPER : 'transparent',
      }}
    >
      <ReviewIcon src={ICON.shield} size={boxed ? 18 : 16} />
      <Typography component="span" sx={{ fontSize: boxed ? 13 : 13.5, fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}

VerifiedBadge.propTypes = {
  source: PropTypes.oneOf(['rover', 'google', 'internal']).isRequired,
  boxed: PropTypes.bool,
};

function ReadFullReview({ expanded, onToggle, shown }) {
  if (!shown) return null;
  return (
    <Box
      component="button"
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      sx={{
        mt: 1.75,
        p: 0,
        border: 0,
        background: 'none',
        cursor: 'pointer',
        color: TEAL,
        font: 'inherit',
        fontWeight: 700,
        fontSize: '0.975rem',
        textDecoration: 'underline',
        textUnderlineOffset: '3px',
        '&:hover': { color: TEAL_HOVER },
      }}
    >
      {expanded ? 'Hide full review' : 'Read full review'}
    </Box>
  );
}

ReadFullReview.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  shown: PropTypes.bool.isRequired,
};

function RoverTextLink({ label }) {
  return (
    <Box
      component="a"
      href={ROVER_BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        color: TEAL,
        fontWeight: 700,
        fontSize: '1rem',
        textDecoration: 'underline',
        textUnderlineOffset: '3px',
        '&:hover': { color: TEAL_HOVER },
      }}
    >
      {label}
      <ReviewIcon src={ICON.arrowTeal} size={16} />
    </Box>
  );
}

RoverTextLink.propTypes = {
  label: PropTypes.string.isRequired,
};

function RatingSummary({ average, count }) {
  const reviewWord = count === 1 ? 'review' : 'reviews';

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: '#EFE3D0',
        borderRadius: '22px',
        px: { xs: 3, md: 4 },
        pt: { xs: 3.5, md: 4 },
        pb: { xs: 3, md: 3.5 },
        overflow: 'hidden',
      }}
    >
      <Box
        component="img"
        src={ICON.quoteCream}
        alt=""
        sx={{
          position: 'absolute',
          top: 18,
          right: 20,
          width: 72,
          height: 72,
          display: 'block',
        }}
      />
      <StarRating stars={average} height={22} />
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1.75, color: TEAL }}>
        <Typography
          component="p"
          sx={{
            m: 0,
            fontSize: { xs: '3.5rem', md: '4.25rem' },
            fontWeight: 700,
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
          }}
        >
          {average.toFixed(1)}
        </Typography>
        <Typography component="span" sx={{ fontSize: '1.5rem', fontWeight: 600, color: BODY }}>
          / 5
        </Typography>
      </Box>
      <Typography
        component="p"
        sx={{ m: 0, mt: 1.75, color: TEAL, fontWeight: 700, fontSize: '1.05rem' }}
      >
        {`Average across ${count} ${reviewWord}`}
      </Typography>
      <Typography component="p" sx={{ m: 0, mt: 0.75, color: BODY, fontSize: '0.95rem' }}>
        Based on the reviews displayed here.
      </Typography>
    </Box>
  );
}

RatingSummary.propTypes = {
  average: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
};

function BookStayButton() {
  return (
    <Button
      component={NextLink}
      href={BOOK_STAY_PATH}
      endIcon={<ReviewIcon src={ICON.arrowCream} size={16} />}
      sx={{
        bgcolor: ORANGE,
        color: '#fff',
        borderRadius: '12px',
        textTransform: 'none',
        fontWeight: 700,
        fontSize: 16,
        px: 2.5,
        py: 1.15,
        boxShadow: 'none',
        '&:hover': { bgcolor: ORANGE_HOVER, boxShadow: 'none' },
      }}
    >
      Book a stay
    </Button>
  );
}

function ReviewCopy({ review, expanded, featured }) {
  const excerpt = reviewExcerpt(review);
  const full = normalizedQuote(review.quote);
  const text = expanded ? full : excerpt;

  return (
    <Box>
      <Typography component="p" sx={{ ...eyebrowSx, letterSpacing: '0.14em' }}>
        {expanded ? 'Full review' : 'Review excerpt'}
      </Typography>
      <Box sx={{ mt: 1 }}>
        <QuoteText text={text} featured={featured} />
      </Box>
      {expanded ? <ExtraPhotos review={review} /> : null}
    </Box>
  );
}

ReviewCopy.propTypes = {
  review: reviewShape.isRequired,
  expanded: PropTypes.bool.isRequired,
  featured: PropTypes.bool,
};

function FeaturedReview({ review, expanded, onToggle }) {
  const excerpt = reviewExcerpt(review);
  const full = normalizedQuote(review.quote);

  return (
    <Box
      component="article"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(240px, 0.9fr) minmax(0, 1.2fr)' },
        gap: { xs: 2.5, md: 4 },
        alignItems: 'center',
        bgcolor: PAPER,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: '24px',
        p: { xs: 2, md: 2.5 },
        position: 'relative',
      }}
    >
      <ReviewCover review={review} aspectRatio="5 / 4" />
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
          }}
        >
          <StarRating stars={review.stars} height={22} />
          <VerifiedBadge source={review.source} boxed />
        </Box>
        <ReviewCopy review={review} expanded={expanded} featured />
        <Typography
          component="p"
          sx={{ m: 0, mt: 2, color: TEAL, fontWeight: 700, fontSize: '1.05rem' }}
        >
          {review.dogName}
        </Typography>
        <Typography component="p" sx={{ m: 0, mt: 0.35, color: BODY, fontSize: '0.95rem' }}>
          {review.ownerFirstName}
          {review.dogName ? ` · ${review.dogName}'s owner` : ''}
        </Typography>
        <ReadFullReview expanded={expanded} onToggle={onToggle} shown={excerpt !== full} />
      </Box>
    </Box>
  );
}

FeaturedReview.propTypes = {
  review: reviewShape.isRequired,
  expanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

function StoryCard({ review, expanded, onToggle }) {
  const excerpt = reviewExcerpt(review);
  const full = normalizedQuote(review.quote);

  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: PAPER,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: '22px',
        p: 1.75,
        height: '100%',
      }}
    >
      <ReviewCover review={review} aspectRatio="4 / 3" />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, px: 0.75, pt: 1.75, pb: 0.75 }}>
        <StarRating stars={review.stars} height={18} />
        <Box sx={{ mt: 1.5 }}>
          <ReviewCopy review={review} expanded={expanded} />
        </Box>
        <Typography
          component="h3"
          sx={{ ...displaySx, fontSize: '1.2rem', letterSpacing: 0, mt: 1.75 }}
        >
          {review.dogName}
        </Typography>
        <Typography component="p" sx={{ m: 0, mt: 0.35, color: BODY }}>
          {review.ownerFirstName}
        </Typography>
        <Box sx={{ mt: 1.25 }}>
          <VerifiedBadge source={review.source} />
        </Box>
        <Box sx={{ mt: 'auto' }}>
          <ReadFullReview expanded={expanded} onToggle={onToggle} shown={excerpt !== full} />
        </Box>
      </Box>
    </Box>
  );
}

StoryCard.propTypes = {
  review: reviewShape.isRequired,
  expanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(REVIEWS);
  const [showAll, setShowAll] = useState(false);
  const [openIds, setOpenIds] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    listSiteReviews({ signal: controller.signal }).then(response => {
      if (!active) return;
      setReviews(reviewsFromSiteResponse(REVIEWS, response));
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const count = countReviews(reviews);
  const average = averageStarRating(reviews);
  const { featured, stories, more } = arrangeReviews(sortReviewsNewestFirst(reviews));
  const storyCards = showAll ? [...stories, ...more] : stories;

  function toggleReview(id) {
    setOpenIds(current =>
      current.includes(id) ? current.filter(openId => openId !== id) : [...current, id],
    );
  }

  return (
    <DogHotelInteriorPage
      title="Happy dogs. Reassured owners."
      suppressHeading
      frameMaxWidth={1120}
      contentSx={{ bgcolor: WEBSITE_PAGE_BACKGROUND }}
    >
      <Box
        component="header"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.15fr) minmax(280px, 0.78fr)' },
          gap: { xs: 4, md: 5 },
          alignItems: 'center',
        }}
      >
        <Box sx={{ maxWidth: 640 }}>
          <Typography component="p" sx={eyebrowSx}>
            Reviews
          </Typography>
          <Typography
            component="h1"
            sx={{ ...displaySx, fontSize: { xs: '2.6rem', md: '3.5rem' }, mt: 1.5 }}
          >
            Happy dogs.
            <Box component="br" />
            Reassured owners.
          </Typography>
          <Typography
            component="p"
            sx={{
              color: BODY,
              fontSize: { xs: '1rem', md: '1.0625rem' },
              lineHeight: 1.6,
              mt: 2,
              maxWidth: 460,
            }}
          >
            A look at what owners share about daycare and overnight stays with Carrie.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: { xs: 2, sm: 3 },
              mt: 3,
            }}
          >
            <BookStayButton />
            <RoverTextLink label="Visit Rover profile" />
          </Box>
        </Box>
        {average != null ? <RatingSummary average={average} count={count} /> : null}
      </Box>

      {featured ? (
        <Box component="section" sx={{ mt: { xs: 6, md: 8 } }}>
          <Typography component="p" sx={eyebrowSx}>
            An owner’s perspective
          </Typography>
          <Box sx={{ mt: 2 }}>
            <FeaturedReview
              review={featured}
              expanded={openIds.includes(featured.id)}
              onToggle={() => toggleReview(featured.id)}
            />
          </Box>
        </Box>
      ) : (
        <Typography component="p" sx={{ color: BODY, mt: 6, maxWidth: 560, lineHeight: 1.7 }}>
          Reviews copied from Carrie’s public Rover profile will be listed here.
        </Typography>
      )}

      {storyCards.length > 0 ? (
        <Box component="section" sx={{ mt: { xs: 6, md: 8 } }}>
          <Typography
            component="h2"
            sx={{
              ...displaySx,
              fontSize: { xs: '1.85rem', md: '2.35rem' },
              textAlign: 'center',
            }}
          >
            More stories from their people.
          </Typography>
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              mt: { xs: 3, md: 4 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 2, md: 2.5 },
              alignItems: 'stretch',
            }}
          >
            {storyCards.map(review => (
              <StoryCard
                key={review.id}
                review={review}
                expanded={openIds.includes(review.id)}
                onToggle={() => toggleReview(review.id)}
              />
            ))}
          </Box>
          {more.length > 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, md: 4 } }}>
              <Button
                type="button"
                variant="outlined"
                aria-expanded={showAll}
                onClick={() => setShowAll(open => !open)}
                endIcon={<ReviewIcon src={showAll ? ICON.chevronUp : ICON.chevronDown} size={16} />}
                sx={{
                  borderColor: TEAL,
                  color: TEAL,
                  borderRadius: 999,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.75,
                  py: 1,
                  '&:hover': { borderColor: TEAL, bgcolor: 'transparent' },
                }}
              >
                {showAll ? 'Show fewer reviews' : `Show all ${count} reviews`}
              </Button>
            </Box>
          ) : null}
        </Box>
      ) : null}

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: '18px',
          bgcolor: PAPER,
          px: { xs: 2.25, md: 3 },
          py: { xs: 2, md: 2.25 },
          mt: { xs: 4, md: 5 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <ReviewIcon src={ICON.external} size={28} />
          <Box>
            <Typography component="p" sx={{ m: 0, color: TEAL, fontWeight: 700 }}>
              Read more on Rover
            </Typography>
            <Typography component="p" sx={{ m: 0, mt: 0.35, color: BODY, fontSize: '0.95rem' }}>
              Visit Carrie’s profile for review and booking details.
            </Typography>
          </Box>
        </Box>
        <RoverTextLink label="Visit Rover profile" />
      </Box>

      <Box
        component="section"
        sx={{
          bgcolor: TEAL,
          borderRadius: '24px',
          color: '#fff',
          textAlign: 'center',
          px: { xs: 3, md: 6 },
          py: { xs: 6, md: 7 },
          mt: { xs: 3, md: 3.5 },
        }}
      >
        <Typography
          component="h2"
          sx={{
            color: '#fff',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}
        >
          Ready to meet Carrie?
        </Typography>
        <Typography
          component="p"
          sx={{
            color: 'rgba(255, 255, 255, 0.82)',
            fontSize: { xs: '1rem', md: '1.0625rem' },
            lineHeight: 1.6,
            mt: 1.5,
          }}
        >
          Let’s talk about your dog and plan a stay that feels right.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <BookStayButton />
        </Box>
      </Box>
    </DogHotelInteriorPage>
  );
}
