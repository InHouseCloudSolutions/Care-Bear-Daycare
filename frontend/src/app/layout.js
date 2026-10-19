import PropTypes from 'prop-types';
import '@/styles/globals.css';
import '@/styles/home-landing-hero.css';
import '@/styles/marketing-interior.css';
import '@/styles/website-globals.css';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { publicPath } from '@/utils/publicPath';
import { WEBSITE_SEO } from '@/utils/website-seo';
import EmotionCacheProvider from './EmotionCacheProvider';
import Providers from './providers';

const OG_IMAGE_PATH = publicPath('/imgs/logos/logo_square.png');
const OG_IMAGE_ALT = 'Care Bear Daycare';
const DEFAULT_DESCRIPTION = WEBSITE_SEO['/'].description;

/** Host for absolute metadata. The previous brand host is ignored so public HTML stays off that domain. */
function marketingMetadataHost() {
  const host = process.env.NEXT_PUBLIC_HOST?.replace(/\/$/, '');
  if (!host || /niico/i.test(host)) return '';
  return host;
}

function ogImageUrl() {
  const host = marketingMetadataHost();
  return host ? `${host}${OG_IMAGE_PATH}` : OG_IMAGE_PATH;
}

function metadataBaseFromHost() {
  const host = marketingMetadataHost();
  if (!host || !/^https?:\/\//i.test(host)) return undefined;
  return new URL(host);
}

const shareImageUrl = ogImageUrl();

export const metadata = {
  metadataBase: metadataBaseFromHost(),
  title: {
    default: 'Care Bear Daycare',
    template: '%s | Care Bear Daycare',
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: 'Care Bear Daycare',
  manifest: publicPath('/manifest.json'),
  icons: {
    icon: [{ url: OG_IMAGE_PATH, type: 'image/png', sizes: '1254x1254' }],
    shortcut: [{ url: OG_IMAGE_PATH, type: 'image/png', sizes: '1254x1254' }],
    apple: [{ url: OG_IMAGE_PATH, type: 'image/png', sizes: '1254x1254' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Care Bear Daycare',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'Care Bear Daycare',
    description: DEFAULT_DESCRIPTION,
    images: [{ url: shareImageUrl, alt: OG_IMAGE_ALT }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Care Bear Daycare',
    description: DEFAULT_DESCRIPTION,
    images: [{ url: shareImageUrl, alt: OG_IMAGE_ALT }],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileImage': OG_IMAGE_PATH,
    'msapplication-TileColor': '#000000',
    'background-color': '#000000',
    'screen-orientation': 'portrait',
    'full-screen': 'yes',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === 'production' && (
          <meta
            httpEquiv="Strict-Transport-Security"
            content="max-age=31536000; includeSubDomains"
          />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root layout fonts for App Router */}
        <link
          href="https://fonts.googleapis.com/css2?family=Limelight&family=Oswald:wght@200..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <EmotionCacheProvider options={{ key: 'mui', prepend: true }}>
          <Providers>{children}</Providers>
        </EmotionCacheProvider>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
