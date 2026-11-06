'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useMarketingAccount } from '@/components/pet-parent/useAuthNavItem';
import {
  ACCOUNT_PATH,
  BOOK_STAY_PATH,
  GALLERY_PATH,
  LOGIN_PATH,
  STAFF_PREFIX,
} from '@/consts/routes';
import {
  WEBSITE_INK,
  WEBSITE_PAGE_BACKGROUND,
  WEBSITE_PAGE_BACKGROUND_DARK,
} from '@/consts/website-theme';

/** Stroke on public/imgs/common/orange/*.svg. Local so MARKETING_CTA_ORANGE stays unchanged. */
const TAB_ACTIVE_ORANGE = '#C6601B';

const ICON_SIZE = 28;

const normalize = path => (path ?? '').split('?')[0].split('#')[0].replace(/\/$/, '') || '/';

function isActivePath(pathname, href) {
  const path = normalize(pathname);
  const target = normalize(href);
  return path === target || path.startsWith(`${target}/`);
}

function TabGlyph({ name, active }) {
  const tone = active ? 'orange' : 'teal';
  return (
    <Box
      component="img"
      src={`/imgs/common/${tone}/${name}.svg`}
      alt=""
      aria-hidden
      sx={{ width: ICON_SIZE, height: ICON_SIZE, display: 'block', flexShrink: 0 }}
    />
  );
}

TabGlyph.propTypes = {
  name: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};

const tabSx = active => ({
  flex: '1 1 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.5,
  minWidth: 0,
  py: 1.5,
  textDecoration: 'none',
  color: active ? TAB_ACTIVE_ORANGE : WEBSITE_INK,
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: '-0.015em',
  whiteSpace: 'nowrap',
  '&:focus-visible': {
    outline: `2px solid ${WEBSITE_INK}`,
    outlineOffset: -2,
    borderRadius: 1,
  },
});

export default function MarketingMobileTabBar() {
  const pathname = usePathname() || '/';
  const account = useMarketingAccount();
  const path = normalize(pathname);
  const bookActive = isActivePath(path, BOOK_STAY_PATH);
  const accountActive =
    path === normalize(LOGIN_PATH) || (isActivePath(path, ACCOUNT_PATH) && !bookActive);

  const tabs = [
    {
      key: 'home',
      label: 'Home',
      href: '/',
      active: path === '/',
      icon: 'home',
    },
    {
      key: 'gallery',
      label: 'Gallery',
      href: GALLERY_PATH,
      active: isActivePath(path, GALLERY_PATH),
      icon: 'gallery',
    },
    {
      key: 'book',
      label: 'Book a stay',
      href: BOOK_STAY_PATH,
      active: bookActive,
      icon: 'book-a-stay',
    },
    account.isStaff
      ? {
          key: 'staff',
          label: 'Staff portal',
          href: account.portalHref || STAFF_PREFIX,
          active: isActivePath(path, STAFF_PREFIX),
          icon: 'account',
        }
      : {
          key: 'account',
          label: 'Account',
          href: account.accountHref,
          active: accountActive,
          icon: 'account',
        },
  ];

  return (
    <Box
      component="nav"
      aria-label="Primary"
      sx={{
        display: { xs: 'flex', lg: 'none' },
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        alignItems: 'stretch',
        bgcolor: WEBSITE_PAGE_BACKGROUND,
        borderTop: `1px solid ${WEBSITE_PAGE_BACKGROUND_DARK}`,
        pb: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map(tab => (
        <Box
          key={tab.key}
          component={Link}
          href={tab.href}
          aria-current={tab.active ? 'page' : undefined}
          sx={tabSx(tab.active)}
        >
          <TabGlyph name={tab.icon} active={tab.active} />
          {tab.label}
        </Box>
      ))}
    </Box>
  );
}
