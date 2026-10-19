'use client';

import { Box, Link, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ROVER_BOOKING_URL } from '@/consts/routes';
import { WEBSITE_INK } from '@/consts/website-theme';
import DogHotelInteriorPage from './DogHotelInteriorPage';

const STEPS = [
  {
    title: 'Meet',
    body: (
      <>
        Connect with Carrie to discuss your dates and your dog’s routines, personality, health
        needs, triggers, and behaviours. These details help her prepare a stay tailored to them.
        Bookings are arranged through{' '}
        <Link
          href={ROVER_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          underline="always"
        >
          Rover
        </Link>
        .
      </>
    ),
  },
  {
    title: 'Settle in',
    body: 'Your dog joins Carrie in her home, with time for backyard play, rest, and personal attention. She follows their routines as closely as possible and pays attention to what helps them feel comfortable.',
  },
  {
    title: 'Head home',
    body: 'At pickup, Carrie shares how your dog settled in and how their stay went, including anything helpful to know for their next visit.',
  },
];

export default function HowAStayWorksPage() {
  return (
    <DogHotelInteriorPage
      title="How a stay works"
      lede="Three simple steps, from getting to know your dog to welcoming them home."
    >
      <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, mt: 4 }}>
        {STEPS.map((step, index) => (
          <Box
            component="li"
            key={step.title}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 2,
              py: 2.5,
              borderTop: `1px solid ${alpha(WEBSITE_INK, 0.12)}`,
            }}
          >
            <Typography
              component="span"
              sx={{
                letterSpacing: '0.06em',
                fontSize: 13,
                fontWeight: 600,
                color: alpha(WEBSITE_INK, 0.45),
              }}
            >
              {`0${index + 1}`}
            </Typography>
            <Box>
              <Typography
                component="h2"
                sx={{
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  color: WEBSITE_INK,
                }}
              >
                {step.title}
              </Typography>
              <Typography
                component="p"
                sx={{ mt: 1, maxWidth: 560, lineHeight: 1.7, color: alpha(WEBSITE_INK, 0.78) }}
              >
                {step.body}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </DogHotelInteriorPage>
  );
}
