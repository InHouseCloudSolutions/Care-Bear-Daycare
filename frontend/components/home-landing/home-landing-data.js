import { alpha } from '@mui/material/styles';
import {
  HOME_NAV_ITEMS_BASE as NAV_HOME,
  MARKETING_INTERIOR_NAV_ITEMS_BASE as NAV_INTERIOR,
} from '@/consts/marketing-nav';
import {
  BOOK_STAY_PATH,
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
  WEBSITE_PAGE_BACKGROUND,
} from '@/consts/website-theme';
import publicPath from '@/utils/publicPath';
import { HOME_HERO_FADE_MS, HOME_HERO_SLIDE_MS } from './home-hero-timing';
import { HOME_LANDING_FONT_FAMILY } from './home-landing-font';

export { HOME_HERO_FADE_MS, HOME_HERO_SLIDE_MS };

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
  tagline: 'Overnight care and daycare in Toronto and the GTA, with a safe backyard made for play.',
  primaryCta: { label: 'Book a stay', href: BOOK_STAY_PATH },
  secondaryCta: { label: 'Plan a visit', href: CONTACT_PATH },
  roverCta: { label: 'See us on Rover', href: ROVER_BOOKING_URL, external: true },
};

export const HOME_FOOTER = {
  establishedYear: 2015,
  companyName: 'Care Bear Daycare',
  serviceLine: 'Home-based daycare & overnight care',
  placeLine: 'Toronto · Greater Toronto Area',
  contactEmail: 'contact@carebeardaycare.ca',
  webCredit: {
    label: 'Powered by In House Cloud Solutions',
    href: 'https://inhousecloudsolutions.com',
  },
};

/** Orange used by the marketing page CTAs (About, Care & safety). */
export const MARKETING_CTA_ORANGE = '#E07A2F';
export const MARKETING_CTA_ORANGE_HOVER = '#C96A22';

/** Public social profiles are unpublished until real accounts exist. */
export const HOME_FOOTER_SOCIAL_LINKS = [];

export const HOME_NAV_ITEMS_BASE = NAV_HOME;

/** In-flow nav on scrollable marketing pages. */
export const MARKETING_INTERIOR_NAV_ITEMS_BASE = NAV_INTERIOR;

/** Desktop nav layout — keep in sync across HomeHeroNav and marketing interior pages. */
export const HOME_NAV_BAR_PX = { xs: 2, md: 3, xl: 5 };
export const HOME_NAV_BAR_PY = { xs: 1.5, md: 1.75 };
export const MEGA_MENU_IMAGE_HEIGHT_SX = { xs: 168, md: 210 };
export const MEGA_MENU_CONTAINER_PY_SX = { xs: 2, md: 2.5 };
export const MEGA_MENU_CARD_TITLE_PY = 1.25;
export const HOME_NAV_STACK_SPACING = 2.5;
export const HOME_NAV_DESKTOP_DISPLAY = { xs: 'none', lg: 'flex' };
export const HOME_NAV_MOBILE_DISPLAY = { xs: 'inline-flex', lg: 'none' };
export const HOME_NAV_LINK_TYPOGRAPHY_SX = {
  textDecoration: 'none',
  letterSpacing: '0.01em',
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

/** Short centered underline under the label. Active stays visible; hover previews it. */
export const marketingNavLinkHoverUnderlineSx = (underlineColor, isActive = false) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  alignSelf: 'center',
  py: 0.75,
  '&::after': {
    content: '""',
    position: 'absolute',
    left: '50%',
    bottom: 2,
    width: 22,
    height: 2,
    borderRadius: 1,
    backgroundColor: underlineColor,
    transform: isActive ? 'translateX(-50%) scaleX(1)' : 'translateX(-50%) scaleX(0)',
    transformOrigin: 'center',
    transition: 'transform 0.25s ease',
  },
  '&:hover::after': {
    transform: 'translateX(-50%) scaleX(1)',
  },
});

export const HOME_NAV_LINK_HOVER_UNDERLINE_COLOR = '#fff';
export const MARKETING_INTERIOR_NAV_LINK_HOVER_UNDERLINE_COLOR = MARKETING_CTA_ORANGE;

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

/** Mobile nav drawer — cream panel, most of the viewport on a phone. */
export const HOME_LUXURY_DRAWER_PAPER_SX = {
  width: 'min(420px, 88vw)',
  bgcolor: WEBSITE_PAGE_BACKGROUND,
  color: WEBSITE_INK,
  fontFamily: HOME_LANDING_FONT_FAMILY,
  backgroundImage: 'none',
  display: 'flex',
  flexDirection: 'column',
};

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
