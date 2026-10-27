'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ACCOUNT_PATH, LOGIN_PATH } from '@/consts/routes';

/**
 * Marketing nav item for the pet-parent account area.
 * "Log in" when signed out, "Account" when signed in. Kept out of MARKETING_NAV_TREE
 * so it can swap on client auth state without touching the static nav tree or its tests.
 */
export default function useAuthNavItem() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated
    ? { label: 'Account', href: ACCOUNT_PATH }
    : { label: 'Log in', href: LOGIN_PATH };
}
