'use client';

import { useState } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { Box, Divider, IconButton, Menu, MenuItem } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useMarketingAccount } from '@/components/pet-parent/useAuthNavItem';
import { WEBSITE_INK, WEBSITE_PAGE_BACKGROUND_DARK, WEBSITE_PAPER } from '@/consts/website-theme';
import { HOME_LANDING_FONT_FAMILY } from './home-landing-font';

export function MarketingInitialsBadge({ initials, size = 40 }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: WEBSITE_PAGE_BACKGROUND_DARK,
        color: WEBSITE_INK,
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        fontSize: size < 36 ? 11 : 13,
        letterSpacing: '0.02em',
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {initials}
    </Box>
  );
}

MarketingInitialsBadge.propTypes = {
  initials: PropTypes.string.isRequired,
  size: PropTypes.number,
};

const menuItemSx = {
  py: 1.25,
  px: 2,
  gap: 1.5,
  color: WEBSITE_INK,
  fontWeight: 600,
  fontSize: 15,
  '&:hover': { bgcolor: alpha(WEBSITE_INK, 0.04) },
};

export default function MarketingAccountControl({ tone = 'bar' }) {
  const { isAuthenticated, name, email, initials, accountHref, logout } = useMarketingAccount();
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);
  const ink = tone === 'overlay' ? 'rgba(255,255,255,0.92)' : WEBSITE_INK;

  if (!isAuthenticated) {
    return (
      <Box
        component={Link}
        href={accountHref}
        sx={{
          color: ink,
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        Log in
      </Box>
    );
  }

  return (
    <>
      <IconButton
        aria-label={`Account menu for ${name}`}
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : 'false'}
        aria-controls={open ? 'marketing-account-menu' : undefined}
        onClick={event => setAnchor(event.currentTarget)}
        sx={{ p: 0 }}
      >
        <MarketingInitialsBadge initials={initials} />
      </IconButton>
      <Menu
        id="marketing-account-menu"
        anchorEl={anchor}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 280,
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(11, 60, 67, 0.14)',
            bgcolor: WEBSITE_PAPER,
            fontFamily: HOME_LANDING_FONT_FAMILY,
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.75 }}>
          <MarketingInitialsBadge initials={initials} />
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ color: WEBSITE_INK, fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
              {name}
            </Box>
            {email ? (
              <Box
                sx={{
                  color: alpha(WEBSITE_INK, 0.62),
                  fontSize: 13,
                  lineHeight: 1.3,
                  mt: 0.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {email}
              </Box>
            ) : null}
          </Box>
        </Box>
        <Divider sx={{ borderColor: alpha(WEBSITE_INK, 0.1) }} />
        <MenuItem component={Link} href={accountHref} onClick={close} sx={menuItemSx}>
          <PersonOutlineIcon fontSize="small" />
          <Box component="span" sx={{ flex: 1 }}>
            Your account
          </Box>
          <ChevronRightIcon fontSize="small" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            close();
            logout();
          }}
          sx={menuItemSx}
        >
          <LogoutIcon fontSize="small" />
          Log out
        </MenuItem>
      </Menu>
    </>
  );
}

MarketingAccountControl.propTypes = {
  tone: PropTypes.oneOf(['bar', 'overlay']),
};
