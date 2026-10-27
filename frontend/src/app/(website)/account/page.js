import AccountProfilePage from '@/components/pet-parent/AccountProfilePage';
import { ROBOTS_NOINDEX } from '@/utils/seo';

export const metadata = {
  title: 'Your account',
  robots: ROBOTS_NOINDEX,
};

export default function AccountRoute() {
  return <AccountProfilePage />;
}
