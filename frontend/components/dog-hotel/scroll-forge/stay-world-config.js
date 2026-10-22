import { CONTACT_PATH, ROVER_BOOKING_URL } from '@/consts/routes';
import publicPath from '@/utils/publicPath';

const CARD_HEIGHT = 7.05;

/**
 * Head-on zoom onto a cut-out illustration whose centre sits on the scene origin.
 * Scroll eases in from `from`, settles at `via`, and finishes closer at `to`.
 */
const ARRIVAL = {
  from: [0, 0.35, 20],
  via: [0, 0.15, 14.5],
  to: [0, 0, 11.2],
  lookAt: [0, 0, 0],
};

function card(src) {
  return {
    type: 'diorama',
    src: publicPath(src),
    at: [0, -CARD_HEIGHT / 2, 0],
    height: CARD_HEIGHT,
    aspect: 1536 / 1024,
  };
}

const SLIDE_ACCENT = '#1E6A78';

export const STAY_PALETTE = {
  primary: '#1E6A78',
  secondary: '#3E8F6E',
  accent: '#D9924F',
  dark: '#0B3C43',
  light: '#FBF4E8',
  ground: '#FBF4E8',
  water: '#7EB8C9',
  foliage: '#5E9A62',
  metal: '#8AA0A6',
  wood: '#C4A574',
  glass: '#C5DDE6',
};

export const STAY_WORLD = {
  hint: 'Scroll to fly to the next step',
  snap: true,
  snapDuration: 2200,
  rail: false,
  palette: STAY_PALETTE,
  sky: { top: '#C9DFF0', bottom: '#FBF4E8' },
  seed: 21,
  gap: 22,
  turn: 0,
  drift: 0,
  flyLift: 0.85,
  fov: 42,
  exposure: 1.02,
  shadows: false,
  clouds: false,
  islandRadius: 8,
  diveScroll: 1.6,
  connScroll: 1.05,
  sections: [
    {
      id: 'meet',
      label: 'Meet',
      accent: SLIDE_ACCENT,
      eyebrow: '01  ·  The visit',
      title: 'Meet',
      body: 'The meet-and-greet is at Carrie’s home in Toronto, inside or in the backyard. You can see the space and whether it is the right fit. The care plan is made then, with you and your dog. Bookings are arranged through Rover.',
      tags: ["At Carrie's home", 'Care plan together'],
      scroll: 1.8,
      linger: 0.42,
      camera: ARRIVAL,
      scene: {
        island: false,
        props: [card('/imgs/stays/1meet.png')],
      },
    },
    {
      id: 'settle',
      label: 'Settle in',
      accent: SLIDE_ACCENT,
      eyebrow: '02  ·  The stay',
      title: 'Settle in',
      body: 'Your dog joins Carrie in her home, with time for backyard play, rest, and personal attention. She follows their routines as closely as possible and pays attention to what helps them feel comfortable.',
      tags: ['Backyard play', 'Their routines'],
      scroll: 1.6,
      linger: 0.36,
      camera: ARRIVAL,
      scene: {
        island: false,
        props: [card('/imgs/stays/2settle.png')],
      },
    },
    {
      id: 'home',
      label: 'Head home',
      accent: SLIDE_ACCENT,
      eyebrow: '03  ·  Pickup',
      title: 'Head home',
      body: 'At pickup, Carrie shares how your dog settled in and how their stay went, including anything helpful to know for their next visit.',
      tags: ['How they settled'],
      scroll: 2.05,
      linger: 0.5,
      camera: ARRIVAL,
      cta: {
        primary: { label: 'Book a stay', href: ROVER_BOOKING_URL, external: true },
        secondary: { label: 'Plan a visit', href: CONTACT_PATH },
      },
      scene: {
        island: false,
        props: [card('/imgs/stays/3home.png')],
      },
    },
  ],
};
