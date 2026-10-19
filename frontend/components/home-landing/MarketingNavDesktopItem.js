'use client';

import PropTypes from 'prop-types';
import MarketingNavDesktopLink from './MarketingNavDesktopLink';

const navItemShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
});

export default function MarketingNavDesktopItem({ item, underlineColor, color, activeColor }) {
  return (
    <MarketingNavDesktopLink
      item={item}
      underlineColor={underlineColor}
      color={color}
      activeColor={activeColor}
    />
  );
}

MarketingNavDesktopItem.propTypes = {
  item: navItemShape.isRequired,
  underlineColor: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  activeColor: PropTypes.string.isRequired,
};
