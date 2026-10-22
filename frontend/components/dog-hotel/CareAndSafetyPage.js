'use client';

import { Box, Link, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ROVER_BOOKING_URL } from '@/consts/routes';
import { WEBSITE_INK } from '@/consts/website-theme';
import DogHotelInteriorPage from './DogHotelInteriorPage';

const bodySx = {
  maxWidth: 640,
  fontSize: { xs: '1rem', md: '1.0625rem' },
  lineHeight: 1.75,
  color: alpha(WEBSITE_INK, 0.78),
};

const sectionHeadingSx = {
  fontWeight: 600,
  letterSpacing: '0.02em',
  fontSize: { xs: '1.25rem', md: '1.5rem' },
  lineHeight: 1.2,
  color: WEBSITE_INK,
};

const sectionBoxSx = {
  mt: { xs: 5, md: 6 },
};

const listSx = {
  m: 0,
  mt: 2,
  pl: 2.25,
  maxWidth: 640,
  color: alpha(WEBSITE_INK, 0.78),
  '& li': { mb: 1.25, lineHeight: 1.6 },
  '& li:last-of-type': { mb: 0 },
};

const listItemSx = {
  fontSize: { xs: '1rem', md: '1.0625rem' },
};

const CARE_STANDARDS = [
  {
    key: 'meet',
    body: (
      <>
        The meet-and-greet is at Carrie’s home, inside or in the backyard, so you can see the space
        and whether she and your dog are a good fit. Bookings are still through{' '}
        <Link
          href={ROVER_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          underline="always"
        >
          Rover
        </Link>
        . Routines and the day plan are set with you and your dog in a discovery session.
      </>
    ),
  },
  {
    key: 'open-mind',
    body: 'Carrie considers your needs and requests for your dog with an open mind.',
  },
  {
    key: 'home',
    body: 'Care is in her home. She is home full time, except for grocery shopping or small errands. Dogs are not left alone longer than you instruct. They typically free-roam, unless you say a crate is necessary.',
  },
  {
    key: 'yard',
    body: 'The backyard is fully fenced, with no escape gaps. Dogs are free to roam it.',
  },
  {
    key: 'capacity',
    body: 'She takes up to three dogs at a time, with an exception for dogs from the same family.',
  },
  {
    key: 'packing',
    body: 'Bring anything that would make your dog more comfortable. Examples include food, medications, a bed, toys, poop bags, or treats.',
  },
  {
    key: 'needs',
    body: 'She will discuss your dog’s needs, including medications, within reason.',
  },
  {
    key: 'puppies',
    body: 'Puppies are welcome, with an extra cost for the extra care they need.',
  },
  {
    key: 'experience',
    body: 'Carrie has spent 20 years caring for dogs, and she has completed a Rover background check.',
  },
];

const DAY_STEPS = [
  {
    title: 'Drop-off',
    body: 'Drop-off and pickup are typically 7:30 a.m. to 9:00 p.m., and she will make special arrangements.',
  },
  {
    title: 'Play, rest, and meals',
    body: 'Meals, play, and rest follow the plan you made with Carrie in the discovery session.',
  },
  {
    title: 'Updates during the stay',
    body: 'Carrie sends a daily update when you ask for one.',
  },
  {
    title: 'Pickup',
    body: 'At pickup, she shares how your dog settled in and anything helpful to know for next time.',
  },
];

export default function CareAndSafetyPage() {
  return (
    <DogHotelInteriorPage
      title="Care and safety"
      lede="How Carrie prepares for a stay in her Toronto home—and what you can expect from the meet through pickup."
    >
      <Box sx={sectionBoxSx}>
        <Typography component="h2" sx={sectionHeadingSx}>
          Care standards
        </Typography>
        <Box component="ul" sx={listSx}>
          {CARE_STANDARDS.map(item => (
            <Typography key={item.key} component="li" sx={listItemSx}>
              {item.body}
            </Typography>
          ))}
        </Box>
      </Box>

      <Box sx={sectionBoxSx}>
        <Typography component="h2" sx={sectionHeadingSx}>
          A day here
        </Typography>
        <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, mt: 2 }}>
          {DAY_STEPS.map((step, index) => (
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
                  component="h3"
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
      </Box>

      <Box sx={sectionBoxSx}>
        <Typography component="h2" sx={sectionHeadingSx}>
          If something goes wrong
        </Typography>
        <Typography component="p" sx={{ ...bodySx, mt: 2 }}>
          If something unexpected happens, Carrie reaches you by text, email, or phone. For
          emergency care, she uses Woodbine Animal Clinic, 1905 Danforth Ave, Toronto, ON M4C 1J5.
        </Typography>
      </Box>

      <Box sx={sectionBoxSx}>
        <Typography component="h2" sx={sectionHeadingSx}>
          Who this stay is for
        </Typography>
        <Typography component="p" sx={{ ...bodySx, mt: 2 }}>
          A good fit is a multi-dog household, or a dog that works well with other dogs. There are
          no breed or size limits within reason.
        </Typography>
      </Box>
    </DogHotelInteriorPage>
  );
}
