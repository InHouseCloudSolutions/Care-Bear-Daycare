import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { WEBSITE_INK } from '@/consts/website-theme';
import AuthNavLinks from '@/components/pet-parent/AuthNavLinks';
import useAuthNavItem from '@/components/pet-parent/useAuthNavItem';
import { useMarketingInteriorNavItems } from './useMarketingNavItems';
import MarketingNavDrawerPanel from './MarketingNavDrawerPanel';
import useMarketingNavDrawerItems from './useMarketingNavDrawerItems';
import MarketingNavDesktopItem from './MarketingNavDesktopItem';
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
  const baseDrawerItems = useMarketingNavDrawerItems(items);
  const authItem = useAuthNavItem();
  const drawerItems = useMemo(() => [...baseDrawerItems, authItem], [baseDrawerItems, authItem]);
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
          boxSizing: 'border-box',
          width: '100%',
          px: HOME_NAV_BAR_PX,
          py: HOME_NAV_BAR_PY,
        }}
      >
        <MarketingWordmark href={logoHref} />

        <Box
          sx={{
            display: HOME_NAV_DESKTOP_DISPLAY,
            alignItems: 'center',
            gap: HOME_NAV_STACK_SPACING,
          }}
        >
          <Stack direction="row" spacing={HOME_NAV_STACK_SPACING} sx={{ alignItems: 'stretch' }}>
            {items.map(item => (
              <MarketingNavDesktopItem
                key={item.label}
                item={item}
                underlineColor={MARKETING_INTERIOR_NAV_LINK_HOVER_UNDERLINE_COLOR}
                color={alpha(WEBSITE_INK, 0.72)}
                activeColor={WEBSITE_INK}
              />
            ))}
            <AuthNavLinks
              underlineColor={MARKETING_INTERIOR_NAV_LINK_HOVER_UNDERLINE_COLOR}
              color={alpha(WEBSITE_INK, 0.72)}
              activeColor={WEBSITE_INK}
            />
          </Stack>
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
