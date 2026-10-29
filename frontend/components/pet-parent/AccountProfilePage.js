'use client';

import Link from 'next/link';
import { Box, Button, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DogHotelInteriorPage from '@/components/dog-hotel/DogHotelInteriorPage';
import { useAuth } from '@/contexts/AuthContext';
import { BOOK_STAY_PATH } from '@/consts/routes';
import { WEBSITE_INK } from '@/consts/website-theme';
import { PRIMARY_BUTTON_SX, SECONDARY_BUTTON_SX } from './pet-parent-styles';
import AccountYouSection from './AccountYouSection';
import AccountDogsSection from './AccountDogsSection';

export default function AccountProfilePage() {
  const { user, logout } = useAuth();

  return (
    <DogHotelInteriorPage
      title="Your account"
      lede={user?.firstName ? `Welcome back, ${user.firstName}.` : undefined}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 1,
        }}
      >
        <Button
          component={Link}
          href={BOOK_STAY_PATH}
          variant="contained"
          sx={{ ...PRIMARY_BUTTON_SX, alignSelf: 'auto' }}
        >
          Book a stay
        </Button>
        <Button variant="outlined" onClick={logout} sx={SECONDARY_BUTTON_SX}>
          Log out
        </Button>
      </Box>
      <AccountYouSection />
      <Divider sx={{ my: { xs: 5, md: 6 }, borderColor: alpha(WEBSITE_INK, 0.12) }} />
      <AccountDogsSection />
    </DogHotelInteriorPage>
  );
}
