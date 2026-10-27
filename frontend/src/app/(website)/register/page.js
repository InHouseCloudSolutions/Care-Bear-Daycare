import RegisterPage from '@/components/pet-parent/RegisterPage';
import { ROBOTS_NOINDEX } from '@/utils/seo';

export const metadata = {
  title: 'Create an account',
  robots: ROBOTS_NOINDEX,
};

export default function RegisterRoute() {
  return <RegisterPage />;
}
