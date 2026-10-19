'use client';

import { useEffect, useState } from 'react';
import { Box, Link, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ROVER_BOOKING_URL } from '@/consts/routes';
import { WEBSITE_INK, WEBSITE_PAGE_BACKGROUND } from '@/consts/website-theme';
import { publicPath } from '@/utils/publicPath';
import DogHotelInteriorPage from './DogHotelInteriorPage';

const CARRIE_PHOTO_SRC = publicPath('/imgs/about/carrie.jpg');
const DOGS_PHOTO_SRC = publicPath('/imgs/home/slide-005.jpg');

const CARE_POINTS = [
  'Personalized care based on your dog’s needs',
  'Familiar routines that help them settle in',
  'A safe backyard for outdoor play',
];

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

function CarriePhoto() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setLoaded(true);
    image.src = CARRIE_PHOTO_SRC;
  }, []);

  if (!loaded) {
    return (
      <Box
        role="img"
        aria-label="Portrait of Carrie"
        sx={{
          aspectRatio: '4 / 5',
          width: '100%',
          bgcolor: WEBSITE_INK,
          color: WEBSITE_PAGE_BACKGROUND,
          display: 'flex',
          alignItems: 'flex-end',
          p: 2.5,
        }}
      >
        <Typography
          component="span"
          sx={{
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Carrie
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={CARRIE_PHOTO_SRC}
      alt="Carrie"
      sx={{
        display: 'block',
        width: '100%',
        aspectRatio: '4 / 5',
        objectFit: 'cover',
        bgcolor: WEBSITE_INK,
      }}
    />
  );
}

export default function AboutPage() {
  return (
    <DogHotelInteriorPage title="About">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(220px, 280px) 1fr' },
          gap: { xs: 3, md: 5 },
          alignItems: 'center',
          mt: { xs: 3, md: 4 },
        }}
      >
        <CarriePhoto />
        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Carrie
          </Typography>
          <Typography component="p" sx={{ ...bodySx, mt: 2 }}>
            Carrie brings a thoughtful, attentive approach to her work with dogs, providing daycare
            and overnight care in her home. Her hands-on experience caring for dogs has shaped her
            focus on understanding each dog as an individual—their personality, routines, comfort
            level, and the support they need while their owner is away.
          </Typography>
          <Typography component="p" sx={{ ...bodySx, mt: 2 }}>
            She takes time to learn about each dog before their stay, including any triggers, health
            needs, or challenging behaviours. This helps her prepare, make informed care decisions,
            and tailor the experience to the dog’s needs. Throughout each visit, Carrie pays close
            attention to how they settle in, balancing play, rest, and personal attention to help
            them feel secure and comfortable.
          </Typography>
          <Box
            component="ul"
            sx={{
              m: 0,
              mt: 2.5,
              pl: 2.25,
              maxWidth: 640,
              color: alpha(WEBSITE_INK, 0.78),
              '& li': { mb: 1, lineHeight: 1.6 },
              '& li:last-of-type': { mb: 0 },
            }}
          >
            {CARE_POINTS.map(point => (
              <Typography
                key={point}
                component="li"
                sx={{ fontSize: { xs: '1rem', md: '1.0625rem' } }}
              >
                {point}
              </Typography>
            ))}
            <Typography component="li" sx={{ fontSize: { xs: '1rem', md: '1.0625rem' } }}>
              Daycare and overnight bookings through{' '}
              <Link
                href={ROVER_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="always"
              >
                Rover
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        component="img"
        src={DOGS_PHOTO_SRC}
        alt="Dogs playing outdoors"
        sx={{
          display: 'block',
          width: '100%',
          height: { xs: 220, md: 340 },
          objectFit: 'cover',
          mt: { xs: 6, md: 8 },
        }}
      />

      <Typography component="p" sx={{ ...bodySx, mt: { xs: 3, md: 4 } }}>
        At Care Bear Daycare, we believe every dog deserves to feel safe, comfortable, and cared for
        while their people are away. Carrie provides daycare and overnight care in her home, with a
        backyard where dogs can enjoy outdoor play in a safe, welcoming environment.
      </Typography>
      <Typography component="p" sx={{ ...bodySx, mt: 2 }}>
        Every dog is unique, and getting to know yours helps us tailor their stay to their
        individual needs. Before their visit, we ask you to share their routines, preferences,
        health needs, triggers, and any challenging behaviours. Whether your dog experiences
        separation anxiety, guards food or toys, or feels uncomfortable around other dogs, honest,
        detailed information helps us prepare and provide the right care. Knowing these things in
        advance helps prevent avoidable surprises and creates a better experience for everyone.
      </Typography>
      <Typography component="p" sx={{ ...bodySx, mt: 2 }}>
        From their first visit to each return stay, we pay close attention to how your dog settles
        in, what helps them feel at ease, and the balance of play, rest, and attention they need.
        Our goal is to make Care Bear Daycare a familiar, reassuring place for your dog—and give you
        confidence while you’re apart.
      </Typography>
      <Typography component="p" sx={{ ...bodySx, mt: 2 }}>
        Daycare and overnight stays are booked through{' '}
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
      </Typography>
    </DogHotelInteriorPage>
  );
}
