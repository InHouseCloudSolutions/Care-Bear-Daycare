import ReviewsPage from '@/components/dog-hotel/ReviewsPage';
import { pageMetadata } from '@/utils/website-seo';

export const metadata = pageMetadata('/reviews');

export default function ReviewsRoute() {
  return <ReviewsPage />;
}
