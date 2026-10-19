import AboutPage from '@/components/dog-hotel/AboutPage';
import { pageMetadata } from '@/utils/website-seo';

export const metadata = pageMetadata('/about');

export default function AboutRoute() {
  return <AboutPage />;
}
