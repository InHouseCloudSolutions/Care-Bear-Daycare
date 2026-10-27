import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Slide, Stack } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AuthNavLinks from '@/components/pet-parent/AuthNavLinks';
import useAuthNavItem from '@/components/pet-parent/useAuthNavItem';
import { useHomeNavItems } from './useMarketingNavItems';
import MarketingNavDrawerPanel from './MarketingNavDrawerPanel';
import MarketingNavDesktopItem from './MarketingNavDesktopItem';
import MarketingWordmark from './MarketingWordmark';
import useMarketingNavDrawerItems from './useMarketingNavDrawerItems';
import {
  HOME_NAV_BAR_PX,
  HOME_NAV_BAR_PY,
  HOME_NAV_DESKTOP_DISPLAY,
  HOME_NAV_LINK_HOVER_UNDERLINE_COLOR,
  HOME_NAV_MOBILE_DISPLAY,
  HOME_NAV_STACK_SPACING,
} from './home-landing-data';

const HERO_MENU_ICON_SX = { color: 'rgba(255,255,255,0.88)' };

export default function HomeHeroNav({ logoHref = '#top' }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navItems = useHomeNavItems();
  const baseDrawerItems = useMarketingNavDrawerItems(navItems);
  const authItem = useAuthNavItem();
  const drawerItems = useMemo(() => [...baseDrawerItems, authItem], [baseDrawerItems, authItem]);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <Slide direction="down" in timeout={500}>
      <Box
        component="nav"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
              {navItems.map(item => (
                <MarketingNavDesktopItem
                  key={item.label}
                  item={item}
                  underlineColor={HOME_NAV_LINK_HOVER_UNDERLINE_COLOR}
                  color="rgba(255,255,255,0.88)"
                  activeColor="#fff"
                />
              ))}
              <AuthNavLinks
                underlineColor={HOME_NAV_LINK_HOVER_UNDERLINE_COLOR}
                color="rgba(255,255,255,0.88)"
                activeColor="#fff"
              />
            </Stack>
          </Box>

          <IconButton
            aria-label="Open menu"
            onClick={openDrawer}
            sx={{
              display: HOME_NAV_MOBILE_DISPLAY,
              ...HERO_MENU_ICON_SX,
            }}
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
    </Slide>
  );
}

HomeHeroNav.propTypes = {
  logoHref: PropTypes.string,
};
