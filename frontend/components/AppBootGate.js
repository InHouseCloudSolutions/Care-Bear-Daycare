import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import AppLoadingScreen from '@/components/AppLoadingScreen';

const MIN_SPLASH_MS = 2000;
const SPLASH_FADE_MS = 550;

/**
 * Holds the splash until theme, navigation, auth (when requested), and a
 * minimum hold have elapsed, then fades out while children mount underneath.
 * Marketing hard loads use splash without waiting on session; staff waits on auth.
 */
export default function AppBootGate({
  children,
  themeReady,
  navigationReady = true,
  waitForAuth = false,
  enableSplash = false,
  splashVariant = 'quiet-centre',
}) {
  const { loading: authLoading } = useAuth();
  const isReady = themeReady && navigationReady && (!waitForAuth || !authLoading);

  const [showSplash, setShowSplash] = useState(enableSplash);
  const [exiting, setExiting] = useState(false);
  const [minHoldElapsed, setMinHoldElapsed] = useState(!enableSplash);

  useEffect(() => {
    if (!enableSplash) return undefined;
    const holdTimer = window.setTimeout(() => setMinHoldElapsed(true), MIN_SPLASH_MS);
    return () => window.clearTimeout(holdTimer);
  }, [enableSplash]);

  useEffect(() => {
    if (!enableSplash || !isReady || !minHoldElapsed || exiting) return undefined;
    setExiting(true);
    return undefined;
  }, [enableSplash, isReady, minHoldElapsed, exiting]);

  useEffect(() => {
    if (!exiting) return undefined;
    const hideTimer = window.setTimeout(() => setShowSplash(false), SPLASH_FADE_MS);
    return () => window.clearTimeout(hideTimer);
  }, [exiting]);

  if (!enableSplash) {
    return children;
  }

  return (
    <>
      {showSplash && <AppLoadingScreen exiting={exiting} variant={splashVariant} />}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
          minWidth: 0,
          minHeight: 0,
          opacity: showSplash && !exiting ? 0 : 1,
          transition: 'opacity 0.45s ease 0.08s',
        }}
      >
        {children}
      </Box>
    </>
  );
}

AppBootGate.propTypes = {
  children: PropTypes.node.isRequired,
  themeReady: PropTypes.bool.isRequired,
  navigationReady: PropTypes.bool,
  waitForAuth: PropTypes.bool,
  enableSplash: PropTypes.bool,
  splashVariant: PropTypes.oneOf(['quiet-centre', 'editorial']),
};
