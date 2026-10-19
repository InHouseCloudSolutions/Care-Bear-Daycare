import { Be_Vietnam_Pro as BeVietnamPro, Newsreader } from 'next/font/google';
import { homeMontserrat } from '@/components/home-landing/home-landing-font';

/**
 * Splash-scoped next/font loaders. Apply `splashFontClassName` on the overlay only —
 * do not put this class on site nav.
 *
 * Weights include Brand v2 needs (Newsreader 400, Be Vietnam 700) so marketing-fonts
 * can reuse these instances instead of creating a second Google font loader.
 */
export const splashNewsreader = Newsreader({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-newsreader',
});

export const splashBeVietnam = BeVietnamPro({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
  variable: '--font-be-vietnam',
});

export const splashFontClassName = [
  splashNewsreader.variable,
  splashBeVietnam.variable,
  homeMontserrat.className,
].join(' ');

export const SPLASH_FONT_BE_VIETNAM = `var(--font-be-vietnam), ${splashBeVietnam.style.fontFamily}, sans-serif`;
export const SPLASH_FONT_NEWSREADER = `var(--font-newsreader), ${splashNewsreader.style.fontFamily}, serif`;
/** Nunito. The export name stays so splash call sites do not rename. */
export const SPLASH_FONT_MONTSERRAT = homeMontserrat.style.fontFamily;
