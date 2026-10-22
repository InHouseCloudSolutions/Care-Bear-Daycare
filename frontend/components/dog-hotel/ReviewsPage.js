'use client';

import Link from 'next/link';
import PropTypes from 'prop-types';
import { Box, Button, Link as MuiLink, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HOME_BRAND } from '@/components/home-landing/home-landing-data';
import { isExternalHref, ROVER_BOOKING_URL } from '@/consts/routes';
import {
  WEBSITE_ACCENT,
  WEBSITE_INK,
  WEBSITE_INK_HOVER,
  WEBSITE_PAGE_BACKGROUND,
} from '@/consts/website-theme';
import publicPath from '@/utils/publicPath';
import DogHotelInteriorPage from './DogHotelInteriorPage';
import {
  REVIEWS,
  averageStarRating,
  countReviews,
  reviewVerificationLabel,
  sortReviewsNewestFirst,
} from './reviews-data';

const bodySx = {
  maxWidth: 640,
  fontSize: { xs: '1rem', md: '1.125rem' },
  lineHeight: 1.7,
  color: alpha(WEBSITE_INK, 0.78),
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

function ReviewPhoto({ review }) {
  const photos = reviewPhotos(review);
  const count = photos.length;
  const columns = count >= 2;
  const packed = count >= 3;

  const frameSx = {
    width: '100%',
    minWidth: 0,
    bgcolor: alpha(WEBSITE_INK, 0.06),
    display: 'block',
    objectFit: 'cover',
    aspectRatio: { xs: packed ? 'auto' : '1 / 1', sm: '1 / 1' },
    height: { xs: packed ? '100%' : 'auto', sm: 'auto' },
    minHeight: 0,
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1,
        width: '100%',
        gridTemplateColumns: { xs: columns ? '1fr 1fr' : '1fr', sm: '1fr' },
        gridTemplateRows: { xs: packed ? '1fr 1fr' : 'auto', sm: 'auto' },
        aspectRatio: { xs: packed ? '1 / 1' : 'auto', sm: 'auto' },
      }}
    >
      {photos.map((photo, index) => {
        const src = sitePhotoSrc(photo.src);
        const alt = photo.alt || review.dogName;
        const key = `${src || 'empty'}-${index}`;
        if (!src) {
          return <Box key={key} role="img" aria-label="No photo provided" sx={frameSx} />;
        }
        return <Box key={key} component="img" src={src} alt={alt} sx={frameSx} />;
      })}
    </Box>
  );
}

ReviewPhoto.propTypes = {
  review: reviewShape.isRequired,
};

function StarRating({ stars }) {
  const filled = Math.min(5, Math.max(0, Math.round(stars)));
  return (
    <Box
      component="p"
      role="img"
      aria-label={`${stars} out of 5 stars`}
      sx={{ m: 0, mt: 1.25, fontSize: 18, lineHeight: 1, letterSpacing: '0.08em' }}
    >
      <Box component="span" aria-hidden sx={{ color: WEBSITE_ACCENT }}>
        {'★'.repeat(filled)}
      </Box>
      <Box component="span" aria-hidden sx={{ color: alpha(WEBSITE_INK, 0.28) }}>
        {'☆'.repeat(5 - filled)}
      </Box>
    </Box>
  );
}

StarRating.propTypes = {
  stars: PropTypes.number.isRequired,
};

function ReviewCard({ review }) {
  const verificationLabel = reviewVerificationLabel(review.source);
  return (
    <Box
      component="li"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' },
        gap: { xs: 2, sm: 3 },
        py: 3,
        borderTop: `1px solid ${alpha(WEBSITE_INK, 0.12)}`,
      }}
    >
      <ReviewPhoto review={review} />
      <Box>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 600,
            letterSpacing: '0.02em',
            lineHeight: 1.2,
            color: WEBSITE_INK,
          }}
        >
          {review.dogName}
        </Typography>
        <Typography component="p" sx={{ m: 0, mt: 0.5, color: alpha(WEBSITE_INK, 0.78) }}>
          {review.ownerFirstName}
        </Typography>
        <StarRating stars={review.stars} />
        <Typography
          component="blockquote"
          sx={{
            m: 0,
            mt: 1.5,
            maxWidth: 560,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            color: alpha(WEBSITE_INK, 0.78),
          }}
        >
          {review.quote}
        </Typography>
        {verificationLabel ? (
          <Typography
            component="p"
            sx={{
              m: 0,
              mt: 1.5,
              fontSize: 13,
              letterSpacing: '0.04em',
              color: alpha(WEBSITE_INK, 0.55),
            }}
          >
            {verificationLabel}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

ReviewCard.propTypes = {
  review: reviewShape.isRequired,
};

function BookStayButton() {
  const { href, label } = HOME_BRAND.primaryCta;
  const external = isExternalHref(href);
  return (
    <Button
      component={external ? 'a' : Link}
      href={href}
      variant="contained"
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      sx={{
        mt: { xs: 5, md: 6 },
        alignSelf: 'flex-start',
        bgcolor: WEBSITE_INK,
        color: WEBSITE_PAGE_BACKGROUND,
        borderRadius: 999,
        textTransform: 'none',
        letterSpacing: '0.04em',
        fontWeight: 600,
        fontSize: { xs: 15, md: 16 },
        px: 3.5,
        py: 1.25,
        boxShadow: 'none',
        '&:hover': {
          bgcolor: WEBSITE_INK_HOVER,
          boxShadow: 'none',
        },
      }}
    >
      {label}
    </Button>
  );
}

export default function ReviewsPage() {
  const count = countReviews(REVIEWS);
  const average = averageStarRating(REVIEWS);
  const reviews = sortReviewsNewestFirst(REVIEWS);

  return (
    <DogHotelInteriorPage
      title="Reviews"
      lede="What owners say about dog daycare and overnight stays in Toronto and the GTA."
    >
      <Box sx={{ mt: 2, maxWidth: 640 }}>
        {count > 0 ? (
          <Typography component="p" sx={bodySx}>
            {`${count} ${count === 1 ? 'review' : 'reviews'}, averaging ${average.toFixed(1)} stars.`}
          </Typography>
        ) : (
          <Typography component="p" sx={bodySx}>
            Reviews copied from Carrie’s public Rover profile will be listed here.
          </Typography>
        )}
        <MuiLink
          href={ROVER_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          underline="always"
          sx={{ display: 'inline-block', mt: 1.5, fontSize: { xs: '1rem', md: '1.0625rem' } }}
        >
          Rover profile
        </MuiLink>
      </Box>
      {reviews.length > 0 ? (
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 4 }}>
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </Box>
      ) : null}
      <BookStayButton />
    </DogHotelInteriorPage>
  );
}
