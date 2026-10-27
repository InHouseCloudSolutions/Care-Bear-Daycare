'use client';

import PropTypes from 'prop-types';
import MarketingNavDesktopItem from '@/components/home-landing/MarketingNavDesktopItem';
import useAuthNavItem from './useAuthNavItem';

/** Desktop "Log in" / "Account" nav link, styled like the marketing nav items beside it. */
export default function AuthNavLinks({ underlineColor, color, activeColor }) {
  const item = useAuthNavItem();
  return (
    <MarketingNavDesktopItem
      item={item}
      underlineColor={underlineColor}
      color={color}
      activeColor={activeColor}
    />
  );
}

AuthNavLinks.propTypes = {
  underlineColor: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  activeColor: PropTypes.string.isRequired,
};
