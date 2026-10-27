import { Suspense } from 'react';
import LoginPage from '@/components/pet-parent/LoginPage';
import { ROBOTS_NOINDEX } from '@/utils/seo';

export const metadata = {
  title: 'Log in',
  robots: ROBOTS_NOINDEX,
};

export default function LoginRoute() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
