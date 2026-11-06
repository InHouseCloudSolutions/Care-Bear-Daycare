'use client';

import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import HomeLandingFooter from '@/components/home-landing/HomeLandingFooter';
import MarketingInteriorLayout, {
  MARKETING_INTERIOR_FOOTER_BLEED_SX,
} from '@/components/home-landing/MarketingInteriorLayout';
import { WEBSITE_INK } from '@/consts/website-theme';

const headingSx = {
  fontWeight: 600,
  letterSpacing: '0.02em',
  fontSize: { xs: '1.75rem', md: '2.25rem' },
  lineHeight: 1.15,
  color: WEBSITE_INK,
};

const ledeSx = {
  mt: 2,
  maxWidth: 640,
  fontSize: { xs: '1rem', md: '1.125rem' },
  lineHeight: 1.7,
  color: alpha(WEBSITE_INK, 0.78),
};

export default function DogHotelInteriorPage({
  title,
  lede,
  children,
  suppressHeading = false,
  hideFooter = false,
  frameMaxWidth = 880,
  contentSx,
}) {
  return (
    <MarketingInteriorLayout contentSx={contentSx}>
      <Box sx={{ maxWidth: frameMaxWidth, mx: 'auto', width: '100%' }}>
        {suppressHeading ? null : (
          <Typography component="h1" sx={headingSx}>
            {title}
          </Typography>
        )}
        {!suppressHeading && lede ? (
          <Typography component="p" sx={ledeSx}>
            {lede}
          </Typography>
        ) : null}
        {children}
      </Box>
      {hideFooter ? null : (
        <Box sx={MARKETING_INTERIOR_FOOTER_BLEED_SX}>
          <HomeLandingFooter />
        </Box>
      )}
    </MarketingInteriorLayout>
  );
}

DogHotelInteriorPage.propTypes = {
  title: PropTypes.string.isRequired,
  lede: PropTypes.string,
  children: PropTypes.node,
  suppressHeading: PropTypes.bool,
  hideFooter: PropTypes.bool,
  frameMaxWidth: PropTypes.number,
  contentSx: PropTypes.object,
};
