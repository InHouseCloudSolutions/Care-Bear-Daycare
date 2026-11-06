'use client';

import { Box, Button, Link, Typography } from '@mui/material';
import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { BOOK_STAY_PATH } from '@/consts/routes';
import { WEBSITE_PAGE_BACKGROUND } from '@/consts/website-theme';
import publicPath from '@/utils/publicPath';
import DogHotelInteriorPage from './DogHotelInteriorPage';

const DOGS_PHOTO_SRC = publicPath('/imgs/home/slide-005.jpg');
const HEART_ICON_SRC = publicPath('/imgs/safety/heart-experience.svg');
const SHIELD_ICON_SRC = publicPath('/imgs/safety/shield-check.svg');
const HOME_ICON_SRC = publicPath('/imgs/safety/home-care.svg');
const DOGS_GROUP_ICON_SRC = publicPath('/imgs/safety/dogs-small-group.svg');
const HOME_HEART_ICON_SRC = publicPath('/imgs/safety/home-heart.svg');
const FENCE_ICON_SRC = publicPath('/imgs/safety/fence-backyard.svg');
const PAW_COMFORT_ICON_SRC = publicPath('/imgs/safety/paw-comfort.svg');
const SPEECH_ICON_SRC = publicPath('/imgs/safety/speech-needs.svg');
const PUPPY_ICON_SRC = publicPath('/imgs/safety/puppy-welcome.svg');
const BAG_ICON_SRC = publicPath('/imgs/safety/bag-paw-packing.svg');
const CHECK_ICON_SRC = publicPath('/imgs/safety/check-packing.svg');
const PHONE_ICON_SRC = publicPath('/imgs/safety/phone-contact.svg');
const ARROW_CREAM_SRC = publicPath('/imgs/safety/arrow-external-cream.svg');
const ARROW_DOWN_SRC = publicPath('/imgs/safety/arrow-down.svg');
const TIMELINE_01_SRC = publicPath('/imgs/safety/timeline-01.svg');
const TIMELINE_02_SRC = publicPath('/imgs/safety/timeline-02.svg');
const TIMELINE_03_SRC = publicPath('/imgs/safety/timeline-03.svg');
const TIMELINE_04_SRC = publicPath('/imgs/safety/timeline-04.svg');

const TEAL = '#123C38';
const ORANGE = '#E07A2F';
const ORANGE_HOVER = '#C96A22';
const BODY = '#6A625A';
const CARD_BORDER = '#E6DCCF';
const PAPER = '#FFFCF7';
const CREAM = '#FFFCF7';

const TRUST_ITEMS = [
  { label: '20 years caring for dogs', src: HEART_ICON_SRC },
  { label: 'Care in Carrie’s home', src: HOME_ICON_SRC },
  { label: 'Rover background checked', src: SHIELD_ICON_SRC },
];

const DETAIL_CARDS = [
  {
    title: 'A small group',
    body: 'Up to three dogs at a time, with exceptions for dogs from the same family.',
    src: DOGS_GROUP_ICON_SRC,
  },
  {
    title: 'A familiar home',
    body: 'Carrie is home full time, apart from short errands. Time alone and crate use are agreed with you.',
    src: HOME_HEART_ICON_SRC,
  },
  {
    title: 'Room to explore',
    body: 'A fully fenced backyard, with space for dogs to roam.',
    src: FENCE_ICON_SRC,
  },
];

const FIT_ROWS = [
  {
    title: 'Comfort around other dogs',
    body: 'Best suited to dogs who enjoy a shared home.',
    src: PAW_COMFORT_ICON_SRC,
  },
  {
    title: 'Needs discussed together',
    body: 'Share health needs, medications, triggers, and behaviours.',
    src: SPEECH_ICON_SRC,
  },
  {
    title: 'Puppies welcome',
    body: 'Additional care comes with an extra charge.',
    note: 'Breed and size are discussed individually.',
    src: PUPPY_ICON_SRC,
  },
];

const DAY_STEPS = [
  {
    title: 'Drop-off',
    body: 'Usually 7:30 a.m.–9:00 p.m. Special arrangements can be discussed.',
    src: TIMELINE_01_SRC,
  },
  {
    title: 'Play, rest & meals',
    body: 'Your dog’s day follows the plan made with Carrie.',
    src: TIMELINE_02_SRC,
  },
  {
    title: 'Updates on request',
    body: 'Ask Carrie for a daily update during the stay.',
    src: TIMELINE_03_SRC,
  },
  {
    title: 'Pickup',
    body: 'Hear how your dog settled in, plus notes for next time.',
    src: TIMELINE_04_SRC,
  },
];

const PACKING_ITEMS = [
  'Usual food',
  'Medications',
  'Bed or blanket',
  'Favourite toys',
  'Poop bags',
  'Treats',
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
  height: '100%',
};

const textLinkSx = {
  color: TEAL,
  fontWeight: 700,
  fontSize: { xs: '0.975rem', md: '1.0625rem' },
  textUnderlineOffset: '3px',
  '&:hover': { color: '#0C2E2B' },
};

const roverButtonSx = {
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
};

function scrollToDayAtAGlance() {
  document.getElementById('day-at-a-glance')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function SafetyIcon({ src, size }) {
  return (
    <Box
      component="img"
      src={src}
      alt=""
      sx={{ width: size, height: size, display: 'block', flexShrink: 0 }}
    />
  );
}

SafetyIcon.propTypes = {
  src: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
};

function BookStayButton() {
  return (
    <Button
      component={NextLink}
      href={BOOK_STAY_PATH}
      endIcon={<SafetyIcon src={ARROW_CREAM_SRC} size={16} />}
      sx={roverButtonSx}
    >
      Book a stay
    </Button>
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
      <SafetyIcon src={src} size={26} />
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

function DetailCard({ title, body, src }) {
  return (
    <Box sx={{ ...cardSx, textAlign: 'left' }}>
      <SafetyIcon src={src} size={56} />
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

DetailCard.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

function FitRow({ title, body, note, src }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75 }}>
      <Box sx={{ pt: 0.25 }}>
        <SafetyIcon src={src} size={40} />
      </Box>
      <Box>
        <Typography component="h3" sx={{ ...displaySx, fontSize: '1.05rem', letterSpacing: 0 }}>
          {title}
        </Typography>
        <Typography component="p" sx={{ ...bodySx, fontSize: '0.975rem', mt: 0.5 }}>
          {body}
        </Typography>
        {note ? (
          <Typography
            component="p"
            sx={{ ...bodySx, fontSize: '0.9rem', fontStyle: 'italic', mt: 0.75 }}
          >
            {note}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

FitRow.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  note: PropTypes.string,
  src: PropTypes.string.isRequired,
};

function DayStep({ title, body, src, connector }) {
  return (
    <Box component="li" sx={{ textAlign: { xs: 'left', md: 'center' }, position: 'relative' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: { xs: 'flex-start', md: 'center' },
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <SafetyIcon src={src} size={48} />
        </Box>
        {connector ? (
          <Box
            aria-hidden
            sx={theme => ({
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              zIndex: 0,
              top: 23,
              left: '50%',
              width: `calc(100% + ${theme.spacing(2.5)})`,
              height: 2,
              bgcolor: ORANGE,
            })}
          />
        ) : null}
      </Box>
      <Typography
        component="h3"
        sx={{ ...displaySx, fontSize: '1.05rem', letterSpacing: 0, mt: 1.75 }}
      >
        {title}
      </Typography>
      <Typography component="p" sx={{ ...bodySx, fontSize: '0.95rem', mt: 1 }}>
        {body}
      </Typography>
    </Box>
  );
}

DayStep.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  connector: PropTypes.bool,
};

function PackingItem({ label }) {
  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <SafetyIcon src={CHECK_ICON_SRC} size={18} />
      <Typography component="span" sx={{ color: TEAL, fontWeight: 600, fontSize: '0.975rem' }}>
        {label}
      </Typography>
    </Box>
  );
}

PackingItem.propTypes = {
  label: PropTypes.string.isRequired,
};

export default function CareAndSafetyPage() {
  return (
    <DogHotelInteriorPage
      title="Care and safety"
      suppressHeading
      frameMaxWidth={1160}
      contentSx={{ bgcolor: WEBSITE_PAGE_BACKGROUND }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(0, 0.95fr)' },
          gap: { xs: 4, md: 5 },
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography component="p" sx={eyebrowSx}>
            Care & safety
          </Typography>
          <Typography
            component="h1"
            sx={{
              ...displaySx,
              fontSize: { xs: '2.15rem', sm: '2.45rem', md: '2.5rem', lg: '2.75rem' },
              mt: 1.75,
            }}
          >
            Thoughtful care.
            <Box component="span" sx={{ display: 'block' }}>
              Every step of their stay.
            </Box>
          </Typography>
          <Typography component="p" sx={{ ...bodySx, mt: 2.5 }}>
            A home setting, a plan made together, and clear expectations—from the first meet to
            pickup.
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
              href="#day-at-a-glance"
              underline="always"
              onClick={scrollToDayAtAGlance}
              sx={{
                ...textLinkSx,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              Explore the care plan
              <SafetyIcon src={ARROW_DOWN_SRC} size={16} />
            </Link>
          </Box>
        </Box>
        <Box>
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
          <Typography
            component="p"
            sx={{ color: BODY, fontSize: '0.8rem', lineHeight: 1.4, textAlign: 'right', mt: 1.25 }}
          >
            Dog daycare & overnight care · Toronto
          </Typography>
        </Box>
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

      <Box component="section" sx={{ mt: { xs: 8, md: 11 } }}>
        <Typography
          component="h2"
          sx={{ ...displaySx, fontSize: { xs: '2rem', md: '2.6rem' }, textAlign: 'center' }}
        >
          Small details. Thoughtful care.
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 2, md: 2.5 },
            mt: { xs: 3.5, md: 4.5 },
          }}
        >
          {DETAIL_CARDS.map(card => (
            <DetailCard key={card.title} title={card.title} body={card.body} src={card.src} />
          ))}
        </Box>
      </Box>

      <Box
        component="section"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 0.95fr) minmax(0, 1.05fr)' },
          gap: { xs: 4, md: 6 },
          alignItems: 'center',
          mt: { xs: 7, md: 10 },
        }}
      >
        <Box>
          <Typography component="p" sx={eyebrowSx}>
            Before the first stay
          </Typography>
          <Typography
            component="h2"
            sx={{ ...displaySx, fontSize: { xs: '2rem', md: '2.45rem' }, mt: 1.5 }}
          >
            A good stay starts with a good fit.
          </Typography>
          <Typography component="p" sx={{ ...bodySx, mt: 2, maxWidth: 460 }}>
            Meet Carrie at her home, inside or in the backyard. Together, you’ll discuss your dog’s
            routine and make a care plan.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2.75, md: 3.25 } }}>
          {FIT_ROWS.map(row => (
            <FitRow
              key={row.title}
              title={row.title}
              body={row.body}
              note={row.note}
              src={row.src}
            />
          ))}
        </Box>
      </Box>

      <Box
        component="section"
        id="day-at-a-glance"
        sx={{ mt: { xs: 8, md: 11 }, scrollMarginTop: { xs: 16, md: 24 } }}
      >
        <Typography
          component="h2"
          sx={{ ...displaySx, fontSize: { xs: '2rem', md: '2.6rem' }, textAlign: 'center' }}
        >
          A day here, at a glance.
        </Typography>
        <Box
          component="ol"
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
            gap: { xs: 3.5, md: 2.5 },
            mt: { xs: 3.5, md: 4.5 },
          }}
        >
          {DAY_STEPS.map((step, index) => (
            <DayStep
              key={step.title}
              title={step.title}
              body={step.body}
              src={step.src}
              connector={index < DAY_STEPS.length - 1}
            />
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 2, md: 2.5 },
          mt: { xs: 6, md: 8 },
          alignItems: 'stretch',
        }}
      >
        <Box
          sx={{
            ...cardSx,
            height: 'auto',
            alignSelf: 'stretch',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SafetyIcon src={BAG_ICON_SRC} size={48} />
          <Typography
            component="h2"
            sx={{ ...displaySx, fontSize: { xs: '1.65rem', md: '1.85rem' }, mt: 2 }}
          >
            Pack a little familiarity.
          </Typography>
          <Typography component="p" sx={{ ...bodySx, mt: 1.25 }}>
            Bring what helps your dog feel at home.
          </Typography>
          <Box
            component="ul"
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: 'repeat(3, auto)',
              gridAutoFlow: 'column',
              columnGap: 2,
              rowGap: 1.5,
              listStyle: 'none',
              m: 0,
              mt: 2.5,
              p: 0,
            }}
          >
            {PACKING_ITEMS.map(label => (
              <PackingItem key={label} label={label} />
            ))}
          </Box>
          <Typography component="p" sx={{ ...bodySx, fontSize: '0.875rem', mt: 2.5 }}>
            Discuss medication needs with Carrie before the stay.
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: TEAL,
            borderRadius: '22px',
            color: CREAM,
            px: { xs: 2.5, md: 3.5 },
            py: { xs: 3, md: 3.5 },
            height: 'auto',
            alignSelf: 'stretch',
          }}
        >
          <SafetyIcon src={PHONE_ICON_SRC} size={40} />
          <Typography
            component="h2"
            sx={{
              color: CREAM,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              fontSize: { xs: '1.65rem', md: '1.85rem' },
              mt: 2,
            }}
          >
            If something unexpected happens
          </Typography>
          <Typography
            component="p"
            sx={{
              color: 'rgba(255, 252, 247, 0.82)',
              fontSize: '1.02rem',
              lineHeight: 1.6,
              mt: 1.5,
            }}
          >
            Carrie will contact you by text, email, or phone.
          </Typography>
          <Typography
            component="p"
            sx={{
              color: 'rgba(255, 252, 247, 0.7)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.14em',
              mt: 3,
            }}
          >
            VETERINARY CONTACT
          </Typography>
          <Typography
            component="p"
            sx={{ color: CREAM, fontWeight: 700, fontSize: '1.05rem', mt: 1.25 }}
          >
            Woodbine Animal Clinic
          </Typography>
          <Typography
            component="p"
            sx={{ color: 'rgba(255, 252, 247, 0.86)', fontSize: '0.975rem', mt: 0.5 }}
          >
            1905 Danforth Ave, Toronto, ON M4C 1J5
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 3, md: 4 },
          mt: { xs: 7, md: 9 },
        }}
      >
        <Box sx={{ maxWidth: 560 }}>
          <Typography component="h2" sx={{ ...displaySx, fontSize: { xs: '2rem', md: '2.45rem' } }}>
            Let’s plan their stay.
          </Typography>
          <Typography component="p" sx={{ ...bodySx, mt: 1.5 }}>
            Start with a conversation about your dog and the care they need.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            gap: 1.25,
          }}
        >
          <BookStayButton />
        </Box>
      </Box>
    </DogHotelInteriorPage>
  );
}
