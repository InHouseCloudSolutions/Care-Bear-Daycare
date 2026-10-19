import { useEffect, useMemo, Suspense } from 'react';
import PropTypes from 'prop-types';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useRouter as usePagesRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { LOGIN_PATH } from '@/consts/routes';

/**
 * AuthGateClient (App Router)
 * - Redirects unauthenticated users to /login?next=... on protected routes
 * - Protected when pathname equals or starts with one of `protectedPrefixes`
 */
function AuthGateClientApp({ children, fallback = null, protectedPrefixes = ['/staff'] }) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isProtected = useMemo(() => {
    const path = pathname.replace(/\/+$/, '');
    return protectedPrefixes.some(prefix => {
      const p = (prefix || '').replace(/\/+$/, '');
      return path === p || path.startsWith(`${p}/`);
    });
  }, [pathname, protectedPrefixes]);

  useEffect(() => {
    if (loading) return;
    if (!isProtected) return;
    if (!user) {
      const qs = searchParams.toString();
      const nextPath = pathname + (qs ? `?${qs}` : '');
      router.replace(`${LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`);
    }
  }, [user, loading, isProtected, pathname, searchParams, router]);

  if (loading && isProtected) return fallback;
  if (!user && isProtected) return null;

  return children;
}

AuthGateClientApp.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  protectedPrefixes: PropTypes.arrayOf(PropTypes.string),
};

function AuthGateClientPages({ children, fallback = null, protectedPrefixes = ['/staff'] }) {
  const router = usePagesRouter();
  const pathname = router.pathname || '';
  const { user, loading } = useAuth();

  const isProtected = useMemo(() => {
    const path = pathname.replace(/\/+$/, '');
    return protectedPrefixes.some(prefix => {
      const p = (prefix || '').replace(/\/+$/, '');
      return path === p || path.startsWith(`${p}/`);
    });
  }, [pathname, protectedPrefixes]);

  useEffect(() => {
    if (loading || !router.isReady) return;
    if (!isProtected) return;
    if (!user) {
      const qs = router.asPath.includes('?') ? router.asPath.slice(router.asPath.indexOf('?')) : '';
      const nextPath = pathname + qs;
      router.replace(`${LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`);
    }
  }, [user, loading, isProtected, pathname, router]);

  if (loading && isProtected) return fallback;
  if (!user && isProtected) return null;

  return children;
}

AuthGateClientPages.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  protectedPrefixes: PropTypes.arrayOf(PropTypes.string),
};

function AuthGateClient({ children, fallback = null, protectedPrefixes = ['/staff'] }) {
  return (
    <Suspense fallback={fallback}>
      <AuthGateClientApp fallback={fallback} protectedPrefixes={protectedPrefixes}>
        {children}
      </AuthGateClientApp>
    </Suspense>
  );
}

AuthGateClient.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  protectedPrefixes: PropTypes.arrayOf(PropTypes.string),
};

AuthGateClient.displayName = 'AuthGateClient';

export { AuthGateClientPages };
export default AuthGateClient;
