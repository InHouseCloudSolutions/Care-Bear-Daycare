'use client';

import Link from 'next/link';
import PropTypes from 'prop-types';
import { Button, Stack } from '@mui/material';
import { HOME_BRAND } from '@/components/home-landing/home-landing-data';
import { isExternalHref } from '@/consts/routes';
import { WEBSITE_INK, WEBSITE_INK_HOVER, WEBSITE_PAGE_BACKGROUND } from '@/consts/website-theme';

const primarySx = {
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
};

const roverSx = {
  ...primarySx,
  bgcolor: 'transparent',
  color: WEBSITE_INK,
  borderColor: WEBSITE_INK,
  '&:hover': {
    bgcolor: 'transparent',
    borderColor: WEBSITE_INK_HOVER,
    color: WEBSITE_INK_HOVER,
    boxShadow: 'none',
  },
};

function StayCta({ href, label, variant }) {
  const external = isExternalHref(href);
  return (
    <Button
      component={external ? 'a' : Link}
      href={href}
      variant={variant}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      sx={variant === 'contained' ? primarySx : roverSx}
    >
      {label}
    </Button>
  );
}

StayCta.propTypes = {
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['contained', 'outlined']).isRequired,
};

/** Internal booker plus the Rover profile link. Plan-a-visit stays on its own buttons. */
export default function BookStayActions() {
  const { primaryCta, roverCta } = HOME_BRAND;
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ mt: { xs: 4, md: 5 }, alignItems: { xs: 'stretch', sm: 'center' } }}
    >
      <StayCta href={primaryCta.href} label={primaryCta.label} variant="contained" />
      {roverCta ? <StayCta href={roverCta.href} label={roverCta.label} variant="outlined" /> : null}
    </Stack>
  );
}
