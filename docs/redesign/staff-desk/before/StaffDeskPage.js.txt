'use client';

import { useEffect } from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { staffPath } from '@/consts/routes';
import { SECONDARY_BUTTON_SX } from '@/components/pet-parent/pet-parent-styles';
import { staffDeskRedirectPath } from './staff-desk';
import HolidayPanel from './HolidayPanel';
import BookingPanel from './BookingPanel';
import HouseholdPanel from './HouseholdPanel';

export default function StaffDeskPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const redirectPath = staffDeskRedirectPath(user);

  useEffect(() => {
    if (redirectPath) router.replace(redirectPath);
  }, [redirectPath, router]);

  if (!user || redirectPath) return null;

  const greeting = user.firstName ? `Hello, ${user.firstName}.` : null;

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
        <Box>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 600 }}>
            Staff desk
          </Typography>
          {greeting ? (
            <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>{greeting}</Typography>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            component={Link}
            href={staffPath('images')}
            variant="outlined"
            sx={SECONDARY_BUTTON_SX}
          >
            Site images
          </Button>
          <Button variant="outlined" onClick={logout} sx={SECONDARY_BUTTON_SX}>
            Log out
          </Button>
        </Box>
      </Box>

      <HolidayPanel />
      <Divider sx={{ my: { xs: 4, md: 5 } }} />
      <BookingPanel />
      <Divider sx={{ my: { xs: 4, md: 5 } }} />
      <HouseholdPanel />
    </Box>
  );
}
