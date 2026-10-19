import Image from 'next/image';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import {
  SPLASH_FONT_MONTSERRAT,
  splashFontClassName,
} from '@/components/loading-screen-fonts';
import { WEBSITE_PAGE_BACKGROUND } from '@/consts/website-theme';

const SPLASH_BG = '#0E272C';
const CREAM = '#FBF4E8';
const MUTED = 'rgba(251,244,232,.62)';
const HAIRLINE = 'rgba(251,244,232,.16)';
const ACCENT = '#D9924F';
const BAR_CREAM = WEBSITE_PAGE_BACKGROUND;
const LOGO_SRC = '/imgs/logos/logo_square.png';

const REDUCE_MOTION = {
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
};

const SPIN_SX = {
  '@keyframes splashSpin': {
    to: { transform: 'rotate(360deg)' },
  },
  animation: 'splashSpin 3.6s linear infinite',
  ...REDUCE_MOTION,
};

/** One fill per load, timed to AppBootGate MIN_SPLASH_MS (2s). */
const BAR_FILL_S = 3;

const BAR_SX = {
  '@keyframes splashBar': {
    '0%': { transform: 'scaleX(0.04)' },
    '70%': { transform: 'scaleX(0.72)' },
    '100%': { transform: 'scaleX(1)' },
  },
  transformOrigin: 'left',
  animation: `splashBar ${BAR_FILL_S}s cubic-bezier(.4,0,.2,1) 1 forwards`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    transform: 'scaleX(1)',
  },
};

const EDGE_BAR_SX = BAR_SX;

const BREATHE_SX = {
  '@keyframes splashBreathe': {
    '0%, 100%': { opacity: 0.5 },
    '50%': { opacity: 1 },
  },
  animation: 'splashBreathe 3s ease-in-out infinite',
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    opacity: 1,
  },
};

/** Inline overlay so first paint is dark even before Emotion CSS arrives. */
const OVERLAY_INLINE_STYLE = {
  position: 'fixed',
  inset: 0,
  background: SPLASH_BG,
};

const MARK_150_INLINE_STYLE = {
  position: 'relative',
  width: 150,
  height: 150,
};

const MARK_68_INLINE_STYLE = {
  position: 'relative',
  width: 68,
  height: 68,
  flexShrink: 0,
};

function QuietCentreSplash() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        gap: '34px',
      }}
    >
      <Box
        style={MARK_150_INLINE_STYLE}
        sx={{
          position: 'relative',
          width: 150,
          height: 150,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `1px solid ${HAIRLINE}`,
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            ...SPIN_SX,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '-2px',
              left: '50%',
              width: 4,
              height: 4,
              ml: '-2px',
              borderRadius: '50%',
              bgcolor: ACCENT,
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <Box
          sx={{
            fontFamily: SPLASH_FONT_MONTSERRAT,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.08em',
            color: CREAM,
            textIndent: '0.42em',
            lineHeight: 1.2,
          }}
        >
          CARE BEAR DAYCARE
        </Box>
        <Box
          sx={{
            width: 180,
            height: 2,
            minHeight: 2,
            bgcolor: HAIRLINE,
            overflow: 'hidden',
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: '100%',
              height: 2,
              minHeight: 2,
              bgcolor: BAR_CREAM,
              ...BAR_SX,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

function EditorialSplash() {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        pt: '34px',
        px: '38px',
        pb: '30px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box style={MARK_68_INLINE_STYLE} sx={{ width: 68, height: 68 }}>
          <Image
            src={LOGO_SRC}
            alt=""
            width={68}
            height={68}
            priority
            style={{ display: 'block', width: 68, height: 68, opacity: 0.9 }}
          />
        </Box>
        <Box
          sx={{
            fontFamily: SPLASH_FONT_MONTSERRAT,
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: '0.08em',
            color: MUTED,
          }}
        >
          DAYCARE
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '22px',
          maxWidth: 640,
        }}
      >
        <Box
          sx={{
            fontFamily: SPLASH_FONT_MONTSERRAT,
            fontWeight: 600,
            fontSize: { xs: 48, sm: 64 },
            lineHeight: 1.18,
            color: CREAM,
            textWrap: 'pretty',
          }}
        >
          A safe place{' '}
          <Box
            component="em"
            sx={{
              fontStyle: 'italic',
              fontFamily: SPLASH_FONT_MONTSERRAT,
              color: ACCENT,
            }}
          >
            to play
          </Box>
        </Box>
        <Box
          sx={{
            fontFamily: SPLASH_FONT_MONTSERRAT,
            fontWeight: 500,
            fontSize: { xs: 16, sm: 20 },
            lineHeight: 1.7,
            color: MUTED,
            ...BREATHE_SX,
          }}
        >
          Overnight care and daycare
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <Box
          sx={{
            fontFamily: SPLASH_FONT_MONTSERRAT,
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: '0.08em',
            color: MUTED,
          }}
        >
          CARE BEAR
        </Box>
      </Box>

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 2,
          bgcolor: HAIRLINE,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            bgcolor: ACCENT,
            ...EDGE_BAR_SX,
          }}
        />
      </Box>
    </Box>
  );
}

export default function AppLoadingScreen({ exiting = false, variant = 'quiet-centre' }) {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={splashFontClassName}
      style={OVERLAY_INLINE_STYLE}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: SPLASH_BG,
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: exiting ? 'none' : 'auto',
      }}
    >
      {variant === 'editorial' ? <EditorialSplash /> : <QuietCentreSplash />}
    </Box>
  );
}

AppLoadingScreen.propTypes = {
  exiting: PropTypes.bool,
  variant: PropTypes.oneOf(['quiet-centre', 'editorial']),
};
