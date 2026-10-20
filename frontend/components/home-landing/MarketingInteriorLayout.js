import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import {
  FORM_PAGE_DESKTOP_BP,
  FORM_PAGE_MOBILE_MAIN_SCROLL_SX,
  FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX,
  LIQUID_GLASS_SCROLLBAR_SX,
  SHORT_VIEWPORT_MEDIA,
} from '@/components/design-studio/design-studio-glass';
import HomeLandingShell from './HomeLandingShell';
import HomeHeroBackground from './HomeHeroBackground';
import MarketingInteriorNav from './MarketingInteriorNav';
import { LUXURY_GRADIENT_SX } from './home-landing-data';

const formBp = FORM_PAGE_DESKTOP_BP;

/**
 * Shared content spacing below the marketing interior nav bar.
 * Lives on an inner wrapper, not the overflow scroller — bottom padding on
 * the scroller itself is clipped and leaves the footer flush with the viewport.
 */
export const MARKETING_INTERIOR_CONTENT_SX = {
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  px: { xs: 2, sm: 3, md: 6 },
  pt: { xs: 7, md: 10 },
  pb: { xs: 7, md: 10 },
};

/** Centered two-column grid for hero form pages (inside content padding). */
export const MARKETING_INTERIOR_FORM_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', [formBp]: '1fr 1fr' },
  gap: { xs: 3, [formBp]: 4, xl: 5 },
  alignItems: { [formBp]: 'center' },
  width: '100%',
  maxWidth: 1280,
  mx: 'auto',
  minHeight: { [formBp]: 'calc(100dvh - 1rem)' },
};

/** Hero form pages — main fills area below nav (padding lives on MARKETING_FORM_FLEX_SECTION_SX). */
export const MARKETING_FORM_PAGE_CONTENT_SX = {
  flex: '1 1 0',
  minHeight: 0,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  p: 0,
  ...FORM_PAGE_MOBILE_MAIN_SCROLL_SX,
  ...LIQUID_GLASS_SCROLLBAR_SX,
};

/** @deprecated Use MARKETING_FORM_PAGE_CONTENT_SX */
export const MARKETING_FORM_SHORT_CONTENT_SX = MARKETING_FORM_PAGE_CONTENT_SX;

/**
 * Flex section between nav and viewport bottom — top/bottom padding shrinks the form area.
 * Grid + glass panel flex inside this box (not the full viewport height).
 */
export const MARKETING_FORM_FLEX_SECTION_SX = {
  flex: '1 1 0',
  minHeight: 0,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  paddingTop: { xs: '32px', sm: '48px', md: '64px', lg: '128px' },
  paddingBottom: { xs: '32px', sm: '48px', md: '64px', lg: '128px' },
  ...FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX,
};

/** Form grid (no calc(100dvh) minHeight — that bypassed parent padding). */
export const MARKETING_FORM_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', [formBp]: '1fr 1fr' },
  gap: { xs: 3, [formBp]: 4, xl: 5 },
  alignItems: 'stretch',
  width: '100%',
  maxWidth: 1280,
  mx: 'auto',
  flex: '1 1 0',
  minHeight: 0,
  boxSizing: 'border-box',
  ...FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX,
  [SHORT_VIEWPORT_MEDIA]: {
    gridTemplateColumns: '1fr',
    gap: 2,
  },
};

/** Per-page grid overrides (maxWidth, px, gap). */
export const MARKETING_FORM_PAGE_GRID_SX = {};

/** @deprecated Use MARKETING_FORM_PAGE_GRID_SX */
export const MARKETING_FORM_SHORT_GRID_SX = MARKETING_FORM_PAGE_GRID_SX;

export const MARKETING_FORM_HERO_COLUMN_SX = {
  minHeight: 0,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: { xs: 'flex-start', [formBp]: 'center' },
  [SHORT_VIEWPORT_MEDIA]: {
    flexShrink: 0,
  },
};

export const MARKETING_FORM_COLUMN_SX = {
  width: '100%',
  minWidth: 0,
  minHeight: 0,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  ...FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX,
};

export const MARKETING_FORM_COLUMN_INNER_SX = {
  width: '100%',
  maxWidth: { [formBp]: 520, xl: 560 },
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  ...FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX,
  [SHORT_VIEWPORT_MEDIA]: {
    maxWidth: '100%',
  },
};

export default function MarketingInteriorLayout({
  children,
  heroBackground = false,
  heroGradient = false,
  contentSx,
  formGrid = false,
  formGridSx,
}) {
  return (
    <HomeLandingShell shellMode="light">
      <Box
        sx={{
          position: 'relative',
          flex: '1 1 0',
          alignSelf: 'stretch',
          minHeight: 0,
          minWidth: 0,
          width: '100%',
          maxWidth: 'none',
          height: '100%',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {heroGradient || heroBackground ? (
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
            aria-hidden
          >
            {heroGradient ? (
              <Box sx={{ position: 'absolute', inset: 0, ...LUXURY_GRADIENT_SX }} />
            ) : (
              <HomeHeroBackground />
            )}
          </Box>
        ) : null}

        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            flex: '1 1 0',
            width: '100%',
            maxWidth: 'none',
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            overflow: 'hidden',
            ...(!heroBackground && !heroGradient && { bgcolor: 'background.default' }),
          }}
        >
          <MarketingInteriorNav sx={{ flexShrink: 0 }} />
          <Box
            component="main"
            className={formGrid ? undefined : 'marketing-interior-scroll'}
            sx={
              formGrid
                ? [MARKETING_FORM_PAGE_CONTENT_SX, contentSx]
                : {
                    flex: '1 1 0',
                    minHeight: 0,
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    boxSizing: 'border-box',
                  }
            }
          >
            {formGrid ? (
              <Box sx={MARKETING_FORM_FLEX_SECTION_SX}>
                <Box sx={{ ...MARKETING_FORM_GRID_SX, ...formGridSx }}>{children}</Box>
              </Box>
            ) : (
              <Box sx={[MARKETING_INTERIOR_CONTENT_SX, contentSx]}>{children}</Box>
            )}
          </Box>
        </Box>
      </Box>
    </HomeLandingShell>
  );
}

MarketingInteriorLayout.propTypes = {
  children: PropTypes.node.isRequired,
  heroBackground: PropTypes.bool,
  heroGradient: PropTypes.bool,
  contentSx: PropTypes.object,
  formGrid: PropTypes.bool,
  formGridSx: PropTypes.object,
};
