'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Link, Typography } from '@mui/material';
import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { BOOK_STAY_PATH, CARE_AND_SAFETY_PATH, HOW_A_STAY_WORKS_PATH } from '@/consts/routes';
import { WEBSITE_PAGE_BACKGROUND } from '@/consts/website-theme';
import publicPath from '@/utils/publicPath';
import DogHotelInteriorPage from './DogHotelInteriorPage';

const CARRIE_PHOTO_SRC = publicPath('/imgs/CarrieB.png');
const DOGS_PHOTO_SRC = publicPath('/imgs/home/slide-005.jpg');
const HEART_ICON_SRC = publicPath('/imgs/about/heart-experience.svg');
const HOME_ICON_SRC = publicPath('/imgs/about/home-care.svg');
const SHIELD_ICON_SRC = publicPath('/imgs/about/shield-check.svg');
const PAW_ICON_SRC = publicPath('/imgs/about/paw-personal-attention.svg');
const CALENDAR_ICON_SRC = publicPath('/imgs/about/calendar-familiar-routines.svg');
const FENCE_ICON_SRC = publicPath('/imgs/about/fence-backyard.svg');
const ARROW_ICON_SRC = publicPath('/imgs/about/arrow-external.svg');

const TEAL = '#123C38';
const ORANGE = '#E07A2F';
const ORANGE_HOVER = '#C96A22';
const BODY = '#6A625A';
const CARD_BORDER = '#E6DCCF';
const PAPER = '#FFFCF7';

const PRE_STAY_PILLS = ['Daily routines', 'Health needs', 'Triggers', 'Behaviour'];

const TRUST_ITEMS = [
  { label: '20 years caring for dogs', src: HEART_ICON_SRC },
  { label: 'Care in a real home', src: HOME_ICON_SRC },
  { label: 'Rover background checked', src: SHIELD_ICON_SRC },
];

const STAY_CARDS = [
  {
    title: 'Personal attention',
    body: 'Care that takes your dog’s personality and comfort into account.',
    src: PAW_ICON_SRC,
  },
  {
    title: 'Familiar routines',
    body: 'A balance of play, rest, and the everyday habits they know.',
    src: CALENDAR_ICON_SRC,
  },
  {
    title: 'Backyard time',
    body: 'A fully fenced backyard for outdoor play and exploring.',
    src: FENCE_ICON_SRC,
  },
];

const eyebrowSx = {
  color: TEAL,
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
};

const displaySx = {
  color: TEAL,
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: 1.08,
};

const bodySx = {
  color: BODY,
  fontSize: { xs: '1rem', md: '1.0625rem' },
  lineHeight: 1.7,
};

const cardSx = {
  bgcolor: PAPER,
  border: `1px solid ${CARD_BORDER}`,
  borderRadius: '22px',
  px: { xs: 2.5, md: 3 },
  py: { xs: 3, md: 3.5 },
  textAlign: 'center',
  height: '100%',
};

const textLinkSx = {
  color: TEAL,
  fontWeight: 700,
  fontSize: { xs: '0.975rem', md: '1.0625rem' },
  textUnderlineOffset: '3px',
  '&:hover': { color: '#0C2E2B' },
};

function AboutIcon({ src, size }) {
  return (
    <Box
      component="img"
      src={src}
      alt=""
      sx={{ width: size, height: size, display: 'block', flexShrink: 0 }}
    />
  );
}

AboutIcon.propTypes = {
  src: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
};

function BookStayButton() {
  return (
    <Button
      component={NextLink}
      href={BOOK_STAY_PATH}
      endIcon={
        <Box
          component="img"
          src={ARROW_ICON_SRC}
          alt=""
          sx={{ width: 16, height: 16, display: 'block', filter: 'brightness(0) invert(1)' }}
        />
      }
      sx={{
        bgcolor: ORANGE,
        color: '#fff',
        borderRadius: '12px',
        textTransform: 'none',
        fontWeight: 700,
        fontSize: 16,
        px: 2.75,
        py: 1.2,
        boxShadow: 'none',
        '&:hover': {
          bgcolor: ORANGE_HOVER,
          boxShadow: 'none',
        },
      }}
    >
      Book a stay
    </Button>
  );
}

function CarriePhoto() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setLoaded(true);
    image.src = CARRIE_PHOTO_SRC;
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '22px',
        overflow: 'hidden',
        bgcolor: TEAL,
        aspectRatio: '5 / 4',
        width: '100%',
      }}
    >
      {loaded ? (
        <Box
          component="img"
          src={CARRIE_PHOTO_SRC}
          alt="Carrie Baron holding a small dog"
          sx={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 18%',
          }}
        />
      ) : (
        <Box role="img" aria-label="Portrait of Carrie" sx={{ width: '100%', height: '100%' }} />
      )}
      <Box
        sx={{
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 14,
          bgcolor: 'rgba(255, 252, 247, 0.95)',
          borderRadius: '14px',
          px: 2,
          py: 1.25,
          boxShadow: '0 10px 24px rgba(18, 60, 56, 0.14)',
        }}
      >
        <Typography
          component="p"
          sx={{ color: TEAL, fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}
        >
          Carrie Baron
        </Typography>
        <Typography
          component="p"
          sx={{ color: BODY, fontSize: '0.875rem', lineHeight: 1.4, mt: 0.25 }}
        >
          Owner & Dog Boarding Specialist
        </Typography>
      </Box>
    </Box>
  );
}

function TrustItem({ label, src, divider }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.25,
        px: 2,
        py: { xs: 1.75, md: 0.5 },
        borderBottom: { xs: divider ? `1px solid ${CARD_BORDER}` : 'none', md: 'none' },
        borderRight: { md: divider ? `1px solid ${CARD_BORDER}` : 'none' },
      }}
    >
      <AboutIcon src={src} size={26} />
      <Typography component="span" sx={{ color: TEAL, fontWeight: 600, fontSize: '0.975rem' }}>
        {label}
      </Typography>
    </Box>
  );
}

TrustItem.propTypes = {
  label: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  divider: PropTypes.bool,
};

function StayCard({ title, body, src }) {
  return (
    <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AboutIcon src={src} size={64} />
      <Typography
        component="h3"
        sx={{ ...displaySx, fontSize: '1.15rem', letterSpacing: 0, mt: 1.75 }}
      >
        {title}
      </Typography>
      <Typography component="p" sx={{ ...bodySx, fontSize: '0.975rem', mt: 1.25 }}>
        {body}
      </Typography>
    </Box>
  );
}

StayCard.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

export default function AboutPage() {
  return (
    <DogHotelInteriorPage
      title="About"
      suppressHeading
      frameMaxWidth={1160}
      contentSx={{ bgcolor: WEBSITE_PAGE_BACKGROUND }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.22fr) minmax(0, 0.78fr)' },
          gap: { xs: 4, md: 5 },
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography component="p" sx={eyebrowSx}>
            About Care Bear Daycare
          </Typography>
          <Typography
            component="h1"
            sx={{
              ...displaySx,
              fontSize: { xs: '2.25rem', sm: '2.6rem', md: '2.35rem', lg: '2.7rem' },
              mt: 1.75,
            }}
          >
            Meet Carrie.
            <Box component="span" sx={{ display: 'block' }}>
              Your dog’s home away from home.
            </Box>
          </Typography>
          <Typography component="p" sx={{ ...bodySx, maxWidth: 520, mt: 2.5 }}>
            With 20 years of experience caring for dogs, Carrie offers daycare and overnight stays
            in her Toronto home. Personal attention. Familiar routines. Care shaped around your dog.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: { xs: 2, sm: 3 },
              mt: 3.5,
            }}
          >
            <BookStayButton />
            <Link
              component={NextLink}
              href={HOW_A_STAY_WORKS_PATH}
              underline="always"
              sx={textLinkSx}
            >
              How a stay works
            </Link>
          </Box>
        </Box>
        <CarriePhoto />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          mt: { xs: 4, md: 5.5 },
          bgcolor: PAPER,
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: '18px',
          py: { xs: 0.5, md: 2.25 },
        }}
      >
        {TRUST_ITEMS.map((item, index) => (
          <TrustItem
            key={item.label}
            label={item.label}
            src={item.src}
            divider={index < TRUST_ITEMS.length - 1}
          />
        ))}
      </Box>

      <Box component="section" sx={{ mt: { xs: 8, md: 11 }, textAlign: 'center' }}>
        <Typography component="h2" sx={{ ...displaySx, fontSize: { xs: '2rem', md: '2.6rem' } }}>
          A stay that feels familiar.
        </Typography>
        <Typography component="p" sx={{ ...bodySx, mt: 1.5 }}>
          Room to play, time to rest, and attention along the way.
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 2, md: 2.5 },
            mt: { xs: 3.5, md: 4.5 },
            textAlign: 'left',
          }}
        >
          {STAY_CARDS.map(card => (
            <StayCard key={card.title} title={card.title} body={card.body} src={card.src} />
          ))}
        </Box>
      </Box>

      <Box
        component="section"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(0, 0.95fr)' },
          gap: { xs: 3.5, md: 6 },
          alignItems: 'center',
          mt: { xs: 7, md: 10 },
        }}
      >
        <Box
          component="img"
          src={DOGS_PHOTO_SRC}
          alt="A corgi and a small dog running outdoors"
          sx={{
            display: 'block',
            width: '100%',
            aspectRatio: '16 / 11',
            objectFit: 'cover',
            objectPosition: 'center 40%',
            borderRadius: '22px',
            bgcolor: TEAL,
          }}
        />
        <Box>
          <Typography component="p" sx={eyebrowSx}>
            Before their stay
          </Typography>
          <Typography
            component="h2"
            sx={{ ...displaySx, fontSize: { xs: '2rem', md: '2.55rem' }, mt: 1.5 }}
          >
            Good care starts with knowing your dog.
          </Typography>
          <Typography component="p" sx={{ ...bodySx, mt: 2 }}>
            Tell Carrie about your dog’s routines, health needs, triggers, and behaviours. Sharing
            the details helps her prepare and decide whether the stay is a good fit.
          </Typography>
          <Box
            component="ul"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              listStyle: 'none',
              m: 0,
              mt: 2.5,
              p: 0,
            }}
          >
            {PRE_STAY_PILLS.map(label => (
              <Typography
                key={label}
                component="li"
                sx={{
                  border: `1px solid ${CARD_BORDER}`,
                  borderRadius: 999,
                  color: TEAL,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  lineHeight: 1,
                  px: 1.75,
                  py: 1,
                }}
              >
                {label}
              </Typography>
            ))}
          </Box>
          <Link
            component={NextLink}
            href={CARE_AND_SAFETY_PATH}
            underline="always"
            sx={{
              ...textLinkSx,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              mt: 2.75,
            }}
          >
            Explore care & safety
            <AboutIcon src={ARROW_ICON_SRC} size={16} />
          </Link>
        </Box>
      </Box>

      <Box
        component="section"
        sx={{
          bgcolor: TEAL,
          borderRadius: '24px',
          color: '#fff',
          textAlign: 'center',
          px: { xs: 3, md: 6 },
          py: { xs: 6, md: 8 },
          mt: { xs: 7, md: 10 },
        }}
      >
        <Typography
          component="h2"
          sx={{
            color: '#fff',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            fontSize: { xs: '2rem', md: '2.6rem' },
          }}
        >
          Let’s get to know your dog.
        </Typography>
        <Typography
          component="p"
          sx={{
            color: 'rgba(255, 255, 255, 0.82)',
            fontSize: { xs: '1rem', md: '1.0625rem' },
            lineHeight: 1.6,
            mt: 1.5,
          }}
        >
          Daycare and overnight stays in Toronto.
        </Typography>
        <Box sx={{ mt: 3.5 }}>
          <BookStayButton />
        </Box>
      </Box>
    </DogHotelInteriorPage>
  );
}
