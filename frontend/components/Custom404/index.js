'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { staffPath } from '@/consts/routes';

const Custom404 = () => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [seconds, setSeconds] = React.useState(5);
  const didNavigate = React.useRef(false);

  const homePath = pathname.startsWith('/staff') ? staffPath() : '/';

  const handleBack = React.useCallback(() => {
    if (didNavigate.current) return;
    didNavigate.current = true;
    router.replace(homePath);
  }, [router, homePath]);

  React.useEffect(() => {
    router.prefetch(homePath);

    const tick = setInterval(() => {
      setSeconds(s => (s > 0 ? s - 1 : 0));
    }, 1000);

    const timeout = setTimeout(handleBack, 5000);

    return () => {
      clearInterval(tick);
      clearTimeout(timeout);
    };
  }, [handleBack, router, homePath]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100dvh',
        textAlign: 'center',
        p: 3,
        gap: 1.5,
      }}
    >
      <Typography variant="h1">404</Typography>
      <Typography variant="h3" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="h5">We can’t seem to find the page you’re looking for.</Typography>

      <Typography
        variant="body1"
        sx={{ mt: 1 }}
        aria-live="polite"
        aria-atomic="true"
        color="error"
      >
        Redirecting to home in <strong>{seconds}</strong>…
      </Typography>

      <Button variant="contained" color="primary" onClick={handleBack} sx={{ mt: 2 }}>
        Go to Home now
      </Button>
    </Box>
  );
};

export default Custom404;
