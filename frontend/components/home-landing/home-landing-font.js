import { Nunito } from 'next/font/google';

/** Nunito for marketing UI. The export name stays so call sites do not rename. */
export const homeMontserrat = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

/** For MUI `createTheme` — drawer portals do not inherit `className` from the shell. */
export const HOME_LANDING_FONT_FAMILY = homeMontserrat.style.fontFamily;
