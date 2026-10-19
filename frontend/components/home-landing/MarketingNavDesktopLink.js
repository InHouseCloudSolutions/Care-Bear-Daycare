'use client';

import Link from 'next/link';
import PropTypes from 'prop-types';
import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';
import { isExternalHref } from '@/consts/routes';
import {
  HOME_NAV_LINK_TYPOGRAPHY_SX,
  isMarketingNavLinkActive,
  marketingNavLinkHoverUnderlineSx,
} from './home-landing-data';

const externalLinkProps = href =>
  isExternalHref(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};

const navItemShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
});

export default function MarketingNavDesktopLink({ item, underlineColor, color, activeColor }) {
  const pathname = usePathname();
  const active = isMarketingNavLinkActive(pathname, item.href);
  const external = isExternalHref(item.href);

  return (
    <Box
      component={external ? 'a' : Link}
      href={item.href}
      {...externalLinkProps(item.href)}
      aria-current={active ? 'page' : undefined}
      sx={{
        ...HOME_NAV_LINK_TYPOGRAPHY_SX,
        ...marketingNavLinkHoverUnderlineSx(underlineColor, active),
        color: active ? activeColor : color,
        '&:hover': { color: activeColor },
      }}
    >
      {item.label}
    </Box>
  );
}

MarketingNavDesktopLink.propTypes = {
  item: navItemShape.isRequired,
  underlineColor: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  activeColor: PropTypes.string.isRequired,
};
