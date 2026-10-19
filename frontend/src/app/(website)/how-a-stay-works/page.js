import HowAStayWorksPage from '@/components/dog-hotel/HowAStayWorksPage';
import { pageMetadata } from '@/utils/website-seo';

export const metadata = pageMetadata('/how-a-stay-works');

export default function HowAStayWorksRoute() {
  return <HowAStayWorksPage />;
}
