import ApiTestPage from '@/components/pet-parent/ApiTestPage';
import { ROBOTS_NOINDEX } from '@/utils/seo';

export const metadata = {
  title: 'API test',
  robots: ROBOTS_NOINDEX,
};

export default function AccountApiTestRoute() {
  return <ApiTestPage />;
}
