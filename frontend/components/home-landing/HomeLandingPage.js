'use client';

import Link from 'next/link';
import PropTypes from 'prop-types';
import { Box, Button, Stack, Typography } from '@mui/material';
import { isExternalHref } from '@/consts/routes';
import publicPath from '@/utils/publicPath';
import HomeLandingShell from './HomeLandingShell';
import HomeHeroBackground from './HomeHeroBackground';
import HomeHeroNav from './HomeHeroNav';
import HomeLandingFooter from './HomeLandingFooter';
import { HOME_BRAND } from './home-landing-data';

const HERO_LOGO_SRC = publicPath('/imgs/logos/logo.png');

const heroCtaSx = {
  color: 'common.white',
  border: '1.5px solid rgba(255, 255, 255, 0.88)',
  borderRadius: 999,
  textTransform: 'none',
  letterSpacing: '0.04em',
  fontSize: { xs: 15, md: 16 },
  fontWeight: 600,
  px: 3.5,
  py: 1.25,
  width: { xs: '100%', md: 'auto' },
  minWidth: { md: 200 },
  '&:hover': {
    border: '1.5px solid #fff',
    bgcolor: 'rgba(255, 255, 255, 0.12)',
  },
};

function HeroCta({ href, children }) {
  const external = isExternalHref(href);
  return (
    <Button
      component={external ? 'a' : Link}
      href={href}
      variant="outlined"
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      sx={heroCtaSx}
    >
      {children}
    </Button>
  );
}

HeroCta.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

/** Legibility over the hero photography. */
const heroTextLegibility = {
  color: 'common.white',
  textShadow: [
    '-0.5px -0.5px 0 rgba(0, 0, 0, 0.75)',
    '0.5px -0.5px 0 rgba(0, 0, 0, 0.75)',
    '-0.5px 0.5px 0 rgba(0, 0, 0, 0.75)',
    '0.5px 0.5px 0 rgba(0, 0, 0, 0.75)',
    '0 0 2px rgba(0, 0, 0, 0.6)',
    '0 2px 10px rgba(0, 0, 0, 0.45)',
  ].join(', '),
};

export default function HomeLandingPage() {
  return (
    <HomeLandingShell>
      <Box
        component="main"
        sx={{
          position: 'relative',
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          color: 'common.white',
        }}
      >
        <HomeHeroBackground />

        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
          }}
        >
          <HomeHeroNav logoHref="#top" />

          <Box
            id="top"
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 2,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            <Box sx={{ textAlign: 'center', width: 'min(92vw, 440px)' }}>
              <Box component="h1" sx={{ m: 0, lineHeight: 0 }}>
                <Box
                  component="img"
                  src={HERO_LOGO_SRC}
                  alt={HOME_BRAND.name}
                  sx={{
                    display: 'block',
                    width: 'min(78vw, 440px)',
                    height: 'auto',
                    maxWidth: '100%',
                    mx: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </Box>

              <Typography
                component="p"
                sx={{
                  ...heroTextLegibility,
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  fontSize: { xs: 'clamp(0.8rem, 2.4vw, 1rem)', md: '1.05rem' },
                  maxWidth: 'min(92vw, 28rem)',
                  mx: 'auto',
                  mt: 2,
                  lineHeight: 1.6,
                }}
              >
                {HOME_BRAND.tagline}
              </Typography>

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', md: 'center' }}
                justifyContent="center"
                sx={{ mt: 3, width: '100%', pointerEvents: 'auto' }}
              >
                <HeroCta href={HOME_BRAND.primaryCta.href}>{HOME_BRAND.primaryCta.label}</HeroCta>
                <HeroCta href={HOME_BRAND.secondaryCta.href}>
                  {HOME_BRAND.secondaryCta.label}
                </HeroCta>
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 2,
            }}
          >
            <HomeLandingFooter />
          </Box>
        </Box>
      </Box>
    </HomeLandingShell>
  );
}
