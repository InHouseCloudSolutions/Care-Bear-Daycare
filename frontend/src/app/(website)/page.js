import HomeLandingPage from '@/components/home-landing/HomeLandingPage';
import { homePageJsonLd, pageMetadata } from '@/utils/website-seo';

export const metadata = pageMetadata('/');

export default function HomePage() {
  const jsonLd = homePageJsonLd();
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- JSON-LD from local page metadata
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeLandingPage />
    </>
  );
}
