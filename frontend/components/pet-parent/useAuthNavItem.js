'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ACCOUNT_PATH, LOGIN_PATH } from '@/consts/routes';

function personName(record) {
  if (!record) return '';
  const joined = [record.first_name, record.last_name].filter(Boolean).join(' ').trim();
  if (joined) return joined;
  if (record.name) return String(record.name).trim();
  return '';
}

export function initialsForName(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    const word = parts[0].replace(/@.*/, '');
    return word.slice(0, 2).toUpperCase();
  }
  return parts
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

/**
 * Signed-in pet parent identity for the marketing account menu, drawer, and tab.
 */
export function useMarketingAccount() {
  const { isAuthenticated, user, petParent, logout, loading } = useAuth();
  const name =
    personName(petParent) ||
    personName(user) ||
    (user?.username ? String(user.username) : '') ||
    'Account';
  const email = petParent?.email || user?.email || '';

  return {
    isAuthenticated,
    loading,
    name: isAuthenticated ? name : '',
    email: isAuthenticated ? email : '',
    initials: isAuthenticated ? initialsForName(name === 'Account' && email ? email : name) : '',
    accountHref: isAuthenticated ? ACCOUNT_PATH : LOGIN_PATH,
    logout,
  };
}

/**
 * Marketing nav item for the pet-parent account area.
 * "Log in" when signed out, "Account" when signed in. Kept out of MARKETING_NAV_TREE
 * so it can swap on client auth state without touching the static nav tree or its tests.
 */
export default function useAuthNavItem() {
  const { isAuthenticated, accountHref } = useMarketingAccount();
  return isAuthenticated
    ? { label: 'Account', href: accountHref }
    : { label: 'Log in', href: accountHref };
}
