import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { WEBSITE_INK } from '@/consts/website-theme';
import { useMarketingInteriorNavItems } from './useMarketingNavItems';
import MarketingNavDrawerPanel from './MarketingNavDrawerPanel';
import useMarketingNavDrawerItems from './useMarketingNavDrawerItems';
import MarketingNavDesktopItem from './MarketingNavDesktopItem';
import MarketingNavActions from './MarketingNavActions';
import MarketingWordmark from './MarketingWordmark';
import {
  HOME_NAV_BAR_PX,
  HOME_NAV_BAR_PY,
  HOME_NAV_DESKTOP_DISPLAY,
  HOME_NAV_MOBILE_DISPLAY,
  HOME_NAV_STACK_SPACING,
  MARKETING_INTERIOR_NAV_LINK_HOVER_UNDERLINE_COLOR,
} from './home-landing-data';

const navItemShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  inset: PropTypes.bool,
});

export default function MarketingInteriorNav({ logoHref = '/', items: itemsProp, sx }) {
  const defaultItems = useMarketingInteriorNavItems();
  const items = itemsProp ?? defaultItems;
  const drawerItems = useMarketingNavDrawerItems(items);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <Box
      component="nav"
      sx={{
        position: 'relative',
        boxSizing: 'border-box',
        zIndex: 10,
        flexShrink: 0,
        alignSelf: 'stretch',
        width: '100%',
        maxWidth: 'none',
        margin: 0,
        borderBottom: '1px solid',
        borderColor: alpha(WEBSITE_INK, 0.12),
        bgcolor: 'background.default',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          boxSizing: 'border-box',
          width: '100%',
          px: HOME_NAV_BAR_PX,
          py: HOME_NAV_BAR_PY,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { lg: 3, xl: 5 }, minWidth: 0 }}>
          <MarketingWordmark href={logoHref} />
          <Box
            sx={{
              display: HOME_NAV_DESKTOP_DISPLAY,
              alignItems: 'center',
              gap: HOME_NAV_STACK_SPACING,
              minWidth: 0,
            }}
          >
            {items.map(item => (
              <MarketingNavDesktopItem
                key={item.label}
                item={item}
                underlineColor={MARKETING_INTERIOR_NAV_LINK_HOVER_UNDERLINE_COLOR}
                color={WEBSITE_INK}
                activeColor={WEBSITE_INK}
              />
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            display: HOME_NAV_DESKTOP_DISPLAY,
            alignItems: 'center',
            gap: 2.25,
            flexShrink: 0,
          }}
        >
          <MarketingNavActions tone="bar" />
        </Box>

        <IconButton
          aria-label="Open menu"
          onClick={openDrawer}
          sx={{ display: HOME_NAV_MOBILE_DISPLAY, color: WEBSITE_INK }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      <MarketingNavDrawerPanel
        open={drawerOpen}
        onOpen={openDrawer}
        onClose={closeDrawer}
        items={drawerItems}
      />
    </Box>
  );
}

MarketingInteriorNav.propTypes = {
  logoHref: PropTypes.string,
  items: PropTypes.arrayOf(navItemShape),
  sx: PropTypes.object,
};
