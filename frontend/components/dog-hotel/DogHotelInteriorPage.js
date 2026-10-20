'use client';

import Link from 'next/link';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MarketingInteriorLayout from '@/components/home-landing/MarketingInteriorLayout';
import { HOME_BRAND, HOME_FOOTER } from '@/components/home-landing/home-landing-data';
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

const footerTextSx = {
  color: alpha(WEBSITE_INK, 0.55),
  letterSpacing: '0.04em',
  fontSize: 12,
};

export default function DogHotelInteriorPage({ title, lede, children }) {
  const year = new Date().getFullYear();
  const { webCredit } = HOME_FOOTER;

  return (
    <MarketingInteriorLayout>
      <Box sx={{ maxWidth: 880, mx: 'auto', width: '100%' }}>
        <Typography component="h1" sx={headingSx}>
          {title}
        </Typography>
        {lede ? (
          <Typography component="p" sx={ledeSx}>
            {lede}
          </Typography>
        ) : null}
        {children}
        <Box
          component="footer"
          sx={{
            mt: { xs: 8, md: 10 },
            pt: { xs: 5, md: 6 },
            pb: { xs: 6, md: 8 },
            borderTop: `1px solid ${alpha(WEBSITE_INK, 0.12)}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 0.75, sm: 1.5 },
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Typography component="p" sx={footerTextSx}>
            © {year} {HOME_BRAND.name}
          </Typography>
          <Typography
            component="span"
            aria-hidden
            sx={{ ...footerTextSx, display: { xs: 'none', sm: 'inline' }, opacity: 0.5 }}
          >
            ·
          </Typography>
          <Box
            component={Link}
            href={webCredit.href}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              ...footerTextSx,
              textDecoration: 'none',
              '&:hover': { color: WEBSITE_INK, textDecoration: 'underline' },
            }}
          >
            {webCredit.label}
          </Box>
        </Box>
      </Box>
    </MarketingInteriorLayout>
  );
}

DogHotelInteriorPage.propTypes = {
  title: PropTypes.string.isRequired,
  lede: PropTypes.string,
  children: PropTypes.node,
};
