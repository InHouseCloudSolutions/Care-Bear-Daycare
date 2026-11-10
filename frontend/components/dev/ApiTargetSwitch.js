'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import {
  daycareApiSwitchEnabled,
  readDaycareApiMode,
  writeDaycareApiMode,
} from '@/lib/daycareApiTarget';

export default function ApiTargetSwitch() {
  // readDaycareApiMode() is 'production' on the server and follows localStorage
  // in the browser. Reading it in useState hydrates aria-pressed to the wrong value.
  const [mode, setMode] = useState(null);

  useEffect(() => {
    setMode(readDaycareApiMode());
  }, []);

  if (!daycareApiSwitchEnabled() || mode == null) return null;

  const choose = next => {
    writeDaycareApiMode(next);
    setMode(next);
    window.location.reload();
  };

  return (
    <Box
      role="group"
      aria-label="API target"
      sx={{
        position: 'fixed',
        right: 12,
        // Sit just above the mobile tab bar (about 72px, plus the home-indicator inset).
        bottom: { xs: 'calc(84px + env(safe-area-inset-bottom, 0px))', lg: 12 },
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1,
        py: 0.5,
        borderRadius: 999,
        bgcolor: 'rgba(20, 24, 28, 0.92)',
        color: 'common.white',
      }}
    >
      <Typography sx={{ fontSize: 12, pr: 0.5 }}>API</Typography>
      <Button
        size="small"
        aria-pressed={mode === 'local'}
        onClick={() => choose('local')}
        sx={{ color: 'inherit', fontSize: 12, minWidth: 0, px: 1 }}
      >
        Local
      </Button>
      <Button
        size="small"
        aria-pressed={mode === 'production'}
        onClick={() => choose('production')}
        sx={{ color: 'inherit', fontSize: 12, minWidth: 0, px: 1 }}
      >
        Production
      </Button>
    </Box>
  );
}
