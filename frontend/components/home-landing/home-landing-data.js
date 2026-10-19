import { alpha } from '@mui/material/styles';
import { NAV_DRAWER_GLASS_SX } from '@/components/design-studio/design-studio-glass';
import {
  HOME_NAV_ITEMS_BASE as NAV_HOME,
  MARKETING_INTERIOR_NAV_ITEMS_BASE as NAV_INTERIOR,
} from '@/consts/marketing-nav';
import {
  CONTACT_PATH,
  isExternalHref,
  LOGIN_PATH,
  ROVER_BOOKING_URL,
  staffLoginHref,
  staffPath,
} from '@/consts/routes';
import {
  STAFF_DARK_BACKGROUND,
  WEBSITE_ACCENT,
  WEBSITE_INK,
  WEBSITE_INK_HOVER,
} from '@/consts/website-theme';
import { publicPath } from '@/utils/publicPath';
import { HOME_LANDING_FONT_FAMILY } from './home-landing-font';

export const LOGIN_NAV_LABEL = 'Login';
export const STAFF_NAV_LABEL = 'Staff';
export const LOGOUT_NAV_LABEL = 'Logout';
export const LOGOUT_NAV_HREF = '/logout';

export function withStaffNavItems(items, isAuthenticated) {
  if (isAuthenticated) {
    return [
      ...items,
      { label: STAFF_NAV_LABEL, href: staffPath() },
      { label: LOGOUT_NAV_LABEL, href: LOGOUT_NAV_HREF },
    ];
  }
  return [...items, { label: LOGIN_NAV_LABEL, href: staffLoginHref() }];
}

export const HOME_BRAND = {
  name: 'Care Bear Daycare',
  tagline: 'Overnight care and daycare, with a safe backyard made for play.',
  primaryCta: { label: 'Book a stay', href: ROVER_BOOKING_URL },
  secondaryCta: { label: 'Plan a visit', href: CONTACT_PATH },
};

export const HOME_FOOTER = {
  establishedYear: 2015,
  companyName: 'Care Bear Daycare',
  webCredit: {
    label: 'Powered By In House Cloud Solutions',
    href: 'https://inhousecloudsolutions.com',
  },
};

/** Public social profiles are unpublished until real accounts exist. */
export const HOME_FOOTER_SOCIAL_LINKS = [];

export const HOME_NAV_ITEMS_BASE = NAV_HOME;

/** In-flow nav on scrollable marketing pages. */
export const MARKETING_INTERIOR_NAV_ITEMS_BASE = NAV_INTERIOR;

/** Desktop nav layout — keep in sync across HomeHeroNav and marketing interior pages. */
export const HOME_NAV_BAR_PX = { xs: 2, md: 6 };
export const HOME_NAV_BAR_PY = { xs: 1.5, md: 2 };
export const MEGA_MENU_IMAGE_HEIGHT_SX = { xs: 168, md: 210 };
export const MEGA_MENU_CONTAINER_PY_SX = { xs: 2, md: 2.5 };
export const MEGA_MENU_CARD_TITLE_PY = 1.25;
export const HOME_NAV_STACK_SPACING = 4;
export const HOME_NAV_DESKTOP_DISPLAY = { xs: 'none', xl: 'flex' };
export const HOME_NAV_MOBILE_DISPLAY = { xs: 'inline-flex', xl: 'none' };
export const HOME_NAV_LINK_TYPOGRAPHY_SX = {
  textDecoration: 'none',
  letterSpacing: '0.04em',
  fontSize: 15,
  fontWeight: 600,
};

const normalizeMarketingNavPath = path => {
  const base = (path ?? '').split('?')[0].split('#')[0];
  return base.replace(/\/$/, '') || '/';
};

/** Whether a marketing nav item matches the current route (incl. nested paths). */
export function isMarketingNavLinkActive(pathname, href) {
  if (isExternalHref(href)) return false;

  const path = normalizeMarketingNavPath(pathname);
  const hrefPath = normalizeMarketingNavPath(href);

  if (hrefPath === LOGIN_PATH) {
    return path === LOGIN_PATH;
  }

  if (hrefPath === staffPath()) {
    return path === staffPath() || path.startsWith(`${staffPath()}/`);
  }

  if (hrefPath === '/') {
    return path === '/';
  }

  return path === hrefPath || path.startsWith(`${hrefPath}/`);
}

/** Desktop nav link underline — grows left-to-right on hover, flush with navbar bottom. */
export const marketingNavLinkHoverUnderlineSx = (underlineColor, isActive = false) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  alignSelf: 'stretch',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: theme => ({
      xs: theme.spacing(-HOME_NAV_BAR_PY.xs),
      md: theme.spacing(-HOME_NAV_BAR_PY.md),
    }),
    height: '1px',
    backgroundColor: underlineColor,
    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
    transformOrigin: 'left center',
    transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '&:hover::after': {
    transform: 'scaleX(1)',
  },
});

export const HOME_NAV_LINK_HOVER_UNDERLINE_COLOR = '#fff';
export const MARKETING_INTERIOR_NAV_LINK_HOVER_UNDERLINE_COLOR = WEBSITE_INK;

/** Deep teal gradient with a soft caramel glow — drawer, app splash, etc. */
export const LUXURY_GRADIENT_SX = {
  backgroundColor: WEBSITE_INK,
  backgroundImage: [
    `radial-gradient(ellipse 90% 55% at 12% -8%, ${alpha(WEBSITE_ACCENT, 0.22)} 0%, transparent 52%)`,
    `linear-gradient(168deg, #082E34 0%, ${WEBSITE_INK} 32%, ${WEBSITE_INK_HOVER} 68%, ${STAFF_DARK_BACKGROUND} 100%)`,
  ].join(', '),
};

/** Drawer nav item entrance — fade + slide from above, staggered per item. */
export const LUXURY_DRAWER_NAV_ITEM_STAGGER_S = 0.055;
export const LUXURY_DRAWER_NAV_ITEM_DURATION_S = 0.48;
export const LUXURY_DRAWER_NAV_ITEM_ENTER_SX = {
  '@keyframes luxuryDrawerNavItemIn': {
    '0%': { opacity: 0, transform: 'translateY(-14px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
};
export const LUXURY_DRAWER_NAV_ITEM_RESET_SX = {
  opacity: 0,
  transform: 'translateY(-14px)',
};
export const LUXURY_DRAWER_NAV_PRIMARY_TYPOGRAPHY_SX = {
  letterSpacing: '0.04em',
  fontSize: 15,
  fontWeight: 600,
};
export const LUXURY_DRAWER_NAV_SECTION_TYPOGRAPHY_SX = {
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontSize: 12,
  opacity: 0.7,
};
export const LUXURY_DRAWER_NAV_GROUP_TYPOGRAPHY_SX = {
  fontWeight: 600,
  fontSize: 13,
  letterSpacing: '0.05em',
};
export const LUXURY_DRAWER_NAV_SUBLINK_TYPOGRAPHY_SX = {
  fontWeight: 400,
  fontSize: 13,
  letterSpacing: '0.05em',
};

/** Mobile nav drawer — frosted glass (matches gallery mega menu). */
export const HOME_LUXURY_DRAWER_PAPER_SX = {
  width: '100%',
  maxWidth: 280,
  ...NAV_DRAWER_GLASS_SX,
  color: 'common.white',
  fontFamily: HOME_LANDING_FONT_FAMILY,
  '& .MuiListItemButton-root': {
    color: 'rgba(255,255,255,0.88)',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
  },
  '& .MuiListItemText-primary': {
    color: 'inherit',
  },
  '& .MuiSvgIcon-root': {
    color: 'rgba(255,255,255,0.7)',
  },
};

export const HOME_HERO_SLIDE_MS = 3000;

/** Crossfade length — must match `speed` on `HomeHeroBackground` Swiper. */
export const HOME_HERO_FADE_MS = 1400;

/** Local hero backgrounds — `frontend/public/imgs/home/` */
export const HOME_HERO_SLIDES = [
  'slide-001',
  'slide-002',
  'slide-003',
  'slide-004',
  'slide-005',
  'slide-006',
  'slide-007',
].map(name => ({
  id: name,
  imageUrl: publicPath(`/imgs/home/${name}.jpg`),
  alt: 'Dog',
  durationMs: HOME_HERO_SLIDE_MS,
}));
