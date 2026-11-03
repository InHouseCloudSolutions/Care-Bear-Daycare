'use client';

import { useEffect } from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { staffPath } from '@/consts/routes';
import { SECONDARY_BUTTON_SX } from '@/components/pet-parent/pet-parent-styles';
import { staffDeskRedirectPath } from './staff-desk';
import SiteImageSection from './SiteImageSection';

const BUILT_IN_HOME =
  'The public home page still uses the built-in photos until the first image is saved.';
const BUILT_IN_GALLERY =
  'The public gallery still uses the built-in photos until the first image is saved.';

export default function StaffImagesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const redirectPath = staffDeskRedirectPath(user);

  useEffect(() => {
    if (redirectPath) router.replace(redirectPath);
  }, [redirectPath, router]);

  if (!user || redirectPath) return null;

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography component="h1" variant="h4" sx={{ fontWeight: 600 }}>
          Site images
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button component={Link} href={staffPath()} variant="outlined" sx={SECONDARY_BUTTON_SX}>
            Staff desk
          </Button>
          <Button variant="outlined" onClick={logout} sx={SECONDARY_BUTTON_SX}>
            Log out
          </Button>
        </Box>
      </Box>

      <SiteImageSection
        placement="home_slide"
        title="Home page slides"
        headingId="staff-home-slides-heading"
        emptyMessage={BUILT_IN_HOME}
      />
      <Divider sx={{ my: { xs: 4, md: 5 } }} />
      <SiteImageSection
        placement="gallery"
        title="Gallery"
        headingId="staff-gallery-heading"
        emptyMessage={BUILT_IN_GALLERY}
      />
    </Box>
  );
}
