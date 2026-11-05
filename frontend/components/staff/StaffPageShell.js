'use client';

import { useContext } from 'react';
import PropTypes from 'prop-types';
import { Box, Breadcrumbs, Button, IconButton, Link, Tooltip, Typography } from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NextLink from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import { utilityButtonSx } from './site-image-styles';

/**
 * Frame shared by every staff page: one scroll area, a centred column,
 * breadcrumb + theme toggle + Log out, then the page title.
 * The inner column is the only flex child of the scroll area, so it never shrinks
 * and the page always scrolls when it is taller than the window.
 */
export default function StaffPageShell({ crumbs, title, subtitle, actions, children }) {
  const { logout } = useAuth();
  const { mode, setMode } = useContext(ThemeContext);
  const isLight = mode === 'light';
  const ThemeIcon = isLight ? DarkModeOutlinedIcon : LightModeOutlinedIcon;
  const themeLabel = isLight ? 'Switch to dark mode' : 'Switch to light mode';

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        px: { xs: 2, md: 5 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1180, mx: 'auto', width: '100%', flexShrink: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Breadcrumbs
            aria-label="Breadcrumb"
            separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
            sx={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.04em' }}
          >
            {crumbs.map((crumb, index) =>
              crumb.href && index < crumbs.length - 1 ? (
                <Link
                  key={crumb.label}
                  component={NextLink}
                  href={crumb.href}
                  underline="hover"
                  color="text.secondary"
                  sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <Typography
                  key={crumb.label}
                  color="text.primary"
                  aria-current="page"
                  sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}
                >
                  {crumb.label}
                </Typography>
              ),
            )}
          </Breadcrumbs>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {actions}
            <Tooltip title={themeLabel}>
              <IconButton
                aria-label={themeLabel}
                onClick={() => setMode(isLight ? 'dark' : 'light')}
                sx={theme => ({ ...utilityButtonSx(theme), px: 0, width: 38, height: 38 })}
              >
                <ThemeIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>
            <Button
              onClick={logout}
              startIcon={<LogoutRoundedIcon sx={{ fontSize: 18 }} />}
              sx={utilityButtonSx}
            >
              Log out
            </Button>
          </Box>
        </Box>

        <Typography
          component="h1"
          sx={{
            mt: { xs: 2, md: 2.5 },
            fontWeight: 600,
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            letterSpacing: '0.02em',
            lineHeight: 1.15,
          }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: 15, lineHeight: 1.5 }}>
            {subtitle}
          </Typography>
        ) : null}

        {children}
      </Box>
    </Box>
  );
}

StaffPageShell.propTypes = {
  crumbs: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, href: PropTypes.string }),
  ).isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  children: PropTypes.node,
};
