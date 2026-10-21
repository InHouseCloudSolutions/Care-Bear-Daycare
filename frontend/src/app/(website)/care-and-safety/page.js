import CareAndSafetyPage from '@/components/dog-hotel/CareAndSafetyPage';
import { pageMetadata } from '@/utils/website-seo';

export const metadata = pageMetadata('/care-and-safety');

export default function CareAndSafetyRoute() {
  return <CareAndSafetyPage />;
}
