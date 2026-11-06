'use client';

import Link from 'next/link';
import PropTypes from 'prop-types';
import { Box, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { WEBSITE_INK } from '@/consts/website-theme';
import { HOME_BRAND, MARKETING_CTA_ORANGE, MARKETING_CTA_ORANGE_HOVER } from './home-landing-data';
import MarketingAccountControl from './MarketingAccountControl';

const bookButtonSx = {
  bgcolor: MARKETING_CTA_ORANGE,
  color: '#fff',
  borderRadius: 999,
  textTransform: 'none',
  fontWeight: 700,
  fontSize: 15,
  letterSpacing: '0.01em',
  px: 2.25,
  py: 0.9,
  whiteSpace: 'nowrap',
  boxShadow: 'none',
  '&:hover': { bgcolor: MARKETING_CTA_ORANGE_HOVER, boxShadow: 'none' },
};

export default function MarketingNavActions({ tone = 'bar' }) {
  const { primaryCta, roverCta } = HOME_BRAND;
  const ink = tone === 'overlay' ? 'rgba(255,255,255,0.92)' : WEBSITE_INK;

  return (
    <>
      {roverCta ? (
        <Box
          component="a"
          href={roverCta.href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: ink,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {roverCta.label}
          <OpenInNewIcon aria-hidden sx={{ fontSize: 15 }} />
        </Box>
      ) : null}
      <Button component={Link} href={primaryCta.href} sx={bookButtonSx}>
        {primaryCta.label}
      </Button>
      <MarketingAccountControl tone={tone} />
    </>
  );
}

MarketingNavActions.propTypes = {
  tone: PropTypes.oneOf(['bar', 'overlay']),
};
