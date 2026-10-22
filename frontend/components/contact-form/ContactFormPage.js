'use client';

import { Link, Typography } from '@mui/material';
import DogHotelInteriorPage from '@/components/dog-hotel/DogHotelInteriorPage';

const CONTACT_EMAIL = 'contact@carebeardaycare.ca';
const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('daycare consultation')}`;

const bodySx = {
  maxWidth: 640,
  mt: { xs: 3, md: 4 },
  fontSize: { xs: '1rem', md: '1.0625rem' },
  lineHeight: 1.75,
  color: 'rgba(10,10,10,0.78)',
};

export default function ContactFormPage() {
  return (
    <DogHotelInteriorPage
      title="Contact"
      lede="Tell us about your dog and the stay you have in mind. We will follow up to plan a visit for dog daycare in Toronto and the GTA."
    >
      <Typography component="p" sx={bodySx}>
        Email{' '}
        <Link href={CONTACT_MAILTO} color="inherit" underline="always">
          {CONTACT_EMAIL}
        </Link>
        .
      </Typography>
    </DogHotelInteriorPage>
  );
}
