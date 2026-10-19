import { useMemo } from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  STAFF_DARK_BACKGROUND,
  STAFF_DARK_PAPER,
  WEBSITE_INK,
  WEBSITE_PAGE_BACKGROUND,
  WEBSITE_PAPER,
} from '@/consts/website-theme';
import { HOME_LANDING_FONT_FAMILY, homeMontserrat } from './home-landing-font';

function createLandingTheme(shellMode) {
  const isDark = shellMode === 'dark';
  return createTheme({
    palette: {
      mode: shellMode,
      background: {
        default: isDark ? STAFF_DARK_BACKGROUND : WEBSITE_PAGE_BACKGROUND,
        paper: isDark ? STAFF_DARK_PAPER : WEBSITE_PAPER,
      },
      common: {
        white: '#ffffff',
      },
    },
    typography: {
      fontFamily: HOME_LANDING_FONT_FAMILY,
    },
  });
}

export default function HomeLandingShell({ children, shellMode = 'dark' }) {
  const landingTheme = useMemo(() => createLandingTheme(shellMode), [shellMode]);
  const isDark = shellMode === 'dark';

  return (
    <ThemeProvider theme={landingTheme}>
      <CssBaseline />
      <Box
        className={homeMontserrat.className}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          alignSelf: 'stretch',
          minHeight: 0,
          minWidth: 0,
          width: '100%',
          maxWidth: 'none',
          height: '100%',
          maxHeight: '100dvh',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
          bgcolor: isDark ? STAFF_DARK_BACKGROUND : 'background.default',
          color: isDark ? 'common.white' : WEBSITE_INK,
          fontFamily: HOME_LANDING_FONT_FAMILY,
        }}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
}

HomeLandingShell.propTypes = {
  children: PropTypes.node.isRequired,
  shellMode: PropTypes.oneOf(['dark', 'light']),
};
