'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { staffPath } from '@/consts/routes';
import { WEBSITE_ACCENT, WEBSITE_INK } from '@/consts/website-theme';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import { staffDeskRedirectPath } from './staff-desk';
import SiteImageSection from './SiteImageSection';

const BUILT_IN_HOME =
  'The public home page still uses the built-in photos until the first image is saved.';
const BUILT_IN_GALLERY =
  'The public gallery still uses the built-in photos until the first image is saved.';

const PLACEMENTS = [
  {
    placement: 'home_slide',
    label: 'Home page slides',
    headingId: 'staff-home-slides-heading',
    tabId: 'staff-home-slides-tab',
    panelId: 'staff-home-slides-panel',
    emptyMessage: BUILT_IN_HOME,
  },
  {
    placement: 'gallery',
    label: 'Gallery',
    headingId: 'staff-gallery-heading',
    tabId: 'staff-gallery-tab',
    panelId: 'staff-gallery-panel',
    emptyMessage: BUILT_IN_GALLERY,
  },
];

const headerPillSx = {
  borderRadius: 999,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: 14,
  letterSpacing: '0.01em',
  px: 1.75,
  py: 0.7,
  minHeight: 38,
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
  color: 'text.primary',
  borderColor: theme =>
    theme.palette.mode === 'dark' ? alpha('#ffffff', 0.28) : alpha(WEBSITE_INK, 0.28),
  '&:hover': {
    borderColor: WEBSITE_ACCENT,
    bgcolor: alpha(WEBSITE_ACCENT, 0.1),
  },
};

const selectedTabSx = {
  borderColor: WEBSITE_ACCENT,
  color: 'text.primary',
  fontWeight: 700,
  bgcolor: theme => alpha(WEBSITE_ACCENT, theme.palette.mode === 'dark' ? 0.14 : 0.18),
  '&:hover': {
    borderColor: WEBSITE_ACCENT,
    color: 'text.primary',
    bgcolor: theme => alpha(WEBSITE_ACCENT, theme.palette.mode === 'dark' ? 0.2 : 0.26),
  },
};

export default function StaffImagesPage() {
  const { user, logout } = useAuth();
  const { mode, setMode } = useContext(ThemeContext);
  const router = useRouter();
  const redirectPath = staffDeskRedirectPath(user);
  const [placement, setPlacement] = useState('home_slide');
  const tabRefs = useRef([]);
  const isLight = mode === 'light';
  const active = PLACEMENTS.find(item => item.placement === placement) || PLACEMENTS[0];
  const ThemeIcon = isLight ? DarkModeOutlinedIcon : LightModeOutlinedIcon;

  useEffect(() => {
    if (redirectPath) router.replace(redirectPath);
  }, [redirectPath, router]);

  const onTabKeyDown = (event, index) => {
    const last = PLACEMENTS.length - 1;
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') nextIndex = index === 0 ? last : index - 1;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = last;
    else return;

    event.preventDefault();
    setPlacement(PLACEMENTS[nextIndex].placement);
    tabRefs.current[nextIndex]?.focus();
  };

  if (!user || redirectPath) return null;

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        px: { xs: 2, md: 5 },
        py: { xs: 3, md: 4.5 },
      }}
    >
      <Box sx={{ maxWidth: 1080, mx: 'auto', width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.85rem', md: '2.05rem' },
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
              }}
            >
              Site images
            </Typography>
            <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: 15, lineHeight: 1.45 }}>
              Choose the photos visitors see on your site.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button
              component={Link}
              href={staffPath()}
              variant="outlined"
              startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
              sx={headerPillSx}
            >
              Staff desk
            </Button>
            <Button variant="outlined" onClick={logout} sx={headerPillSx}>
              Log out
            </Button>
            <Button
              variant="outlined"
              onClick={() => setMode(isLight ? 'dark' : 'light')}
              startIcon={<ThemeIcon sx={{ fontSize: 18 }} />}
              sx={headerPillSx}
            >
              {isLight ? 'Dark mode' : 'Light mode'}
            </Button>
          </Box>
        </Box>

        <Box
          role="tablist"
          aria-label="Site image sections"
          aria-orientation="horizontal"
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3, mb: 2.5 }}
        >
          {PLACEMENTS.map((item, index) => {
            const selected = item.placement === placement;
            return (
              <Button
                key={item.placement}
                ref={node => {
                  tabRefs.current[index] = node;
                }}
                id={item.tabId}
                role="tab"
                type="button"
                variant="outlined"
                aria-selected={selected}
                aria-controls={item.panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => setPlacement(item.placement)}
                onKeyDown={event => onTabKeyDown(event, index)}
                startIcon={
                  selected ? (
                    <Box
                      aria-hidden
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: WEBSITE_ACCENT,
                      }}
                    />
                  ) : undefined
                }
                sx={[headerPillSx, selected && selectedTabSx]}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        <SiteImageSection
          key={active.placement}
          placement={active.placement}
          title={active.label}
          headingId={active.headingId}
          emptyMessage={active.emptyMessage}
          panelId={active.panelId}
          tabId={active.tabId}
        />
      </Box>
    </Box>
  );
}
