'use client';

import { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, GlobalStyles } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '@/lib/createAppTheme';
import { ThemeContext } from '@/contexts/ThemeContext';
import {
  HOME_LANDING_FONT_FAMILY,
  homeMontserrat,
} from '@/components/home-landing/home-landing-font';
import AppBootGate from '@/components/AppBootGate';
import AuthGateClient from '@/components/AuthGateClient';
import RobotsMeta from '@/components/RobotsMeta';

export default function RouteThemeShell({ children, variant = 'website' }) {
  const { mode } = useContext(ThemeContext);
  const isStaff = variant === 'staff';
  const isFullViewportPage = variant === 'website' || variant === 'apps';
  const muiMode = isStaff ? mode ?? 'dark' : 'light';
  const themeReady = isStaff ? mode !== null : true;

  useEffect(() => {
    const rootClass = 'marketing-interior-page';
    if (isFullViewportPage) {
      document.documentElement.classList.add(rootClass);
    } else {
      document.documentElement.classList.remove(rootClass);
    }
    return () => document.documentElement.classList.remove(rootClass);
  }, [isFullViewportPage]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.colorScheme = muiMode;
    if (isStaff) root.dataset.staffMode = muiMode;
    return () => {
      root.style.colorScheme = '';
      delete root.dataset.staffMode;
    };
  }, [muiMode, isStaff]);

  const theme = useMemo(
    () => createAppTheme(muiMode, { staffTypography: isStaff }),
    [muiMode, isStaff],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isStaff ? (
        // The server renders the staff baseline in dark mode before the saved mode is known,
        // and that <style> tag stays in the page. This rule only matches the mode the client
        // set on <html>, and outranks the plain `body` rule, so body colours follow the toggle.
        <GlobalStyles
          styles={{
            [`html[data-staff-mode="${muiMode}"] body`]: {
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
            },
          }}
        />
      ) : null}
      <RobotsMeta />
      <Box
        className={isStaff ? homeMontserrat.className : undefined}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isFullViewportPage ? 'stretch' : undefined,
          width: '100%',
          maxWidth: 'none',
          minWidth: 0,
          height: '100dvh',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          overflow: isFullViewportPage || isStaff ? 'hidden' : undefined,
          ...(isFullViewportPage && { overflowX: 'hidden' }),
          ...(isStaff && { fontFamily: HOME_LANDING_FONT_FAMILY }),
        }}
      >
        <AppBootGate
          themeReady={themeReady}
          waitForAuth={isStaff}
          enableSplash
          splashVariant={isStaff ? 'editorial' : 'quiet-centre'}
        >
          <AuthGateClient protectedPrefixes={['/staff', '/account']}>
            {isStaff ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                  minWidth: 0,
                  width: '100%',
                  overflow: 'hidden',
                  '& > *': {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    minWidth: 0,
                    width: '100%',
                  },
                }}
              >
                {children}
              </Box>
            ) : (
              children
            )}
          </AuthGateClient>
        </AppBootGate>
      </Box>
    </ThemeProvider>
  );
}

RouteThemeShell.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['website', 'apps', 'staff']),
};
