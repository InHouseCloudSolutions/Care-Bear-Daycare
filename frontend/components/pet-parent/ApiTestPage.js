'use client';

import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DogHotelInteriorPage from '@/components/dog-hotel/DogHotelInteriorPage';
import { useAuth } from '@/contexts/AuthContext';
import { WEBSITE_INK } from '@/consts/website-theme';
import { authMe, getMyProfile, listDogs, listServices } from '@/lib/daycareApi';
import { PRIMARY_BUTTON_SX } from './pet-parent-styles';

const CALLS = [
  { key: 'me', label: 'GET /auth/me/', run: token => authMe(token) },
  { key: 'petParent', label: 'GET /daycare/me/', run: token => getMyProfile(token) },
  { key: 'dogs', label: 'GET /daycare/dogs/', run: token => listDogs(token) },
  { key: 'services', label: 'GET /daycare/services/', run: token => listServices(token) },
];

function ResultBlock({ label, result }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        component="h2"
        sx={{ fontWeight: 600, fontSize: '1.0625rem', color: WEBSITE_INK }}
      >
        {label}
        {result ? ` — ${result.status}` : ''}
      </Typography>
      <Box
        component="pre"
        sx={{
          mt: 1,
          p: 2,
          borderRadius: 1.5,
          overflowX: 'auto',
          fontSize: 13,
          lineHeight: 1.6,
          bgcolor: alpha(WEBSITE_INK, 0.06),
          color: WEBSITE_INK,
        }}
      >
        {result ? JSON.stringify(result.data, null, 2) : 'Not loaded yet.'}
      </Box>
    </Box>
  );
}

ResultBlock.propTypes = {
  label: PropTypes.string.isRequired,
  result: PropTypes.shape({
    status: PropTypes.number,
    data: PropTypes.any,
  }),
};

export default function ApiTestPage() {
  const { token } = useAuth();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const entries = await Promise.all(CALLS.map(async call => [call.key, await call.run(token)]));
    setResults(Object.fromEntries(entries));
    setLoading(false);
  }, [token]);

  return (
    <DogHotelInteriorPage
      title="API test"
      lede="Refresh to check the live daycare API responses for your account."
    >
      <Button onClick={refresh} variant="contained" disabled={loading} sx={PRIMARY_BUTTON_SX}>
        {loading ? 'Refreshing…' : 'Refresh'}
      </Button>
      {CALLS.map(call => (
        <ResultBlock key={call.key} label={call.label} result={results[call.key]} />
      ))}
    </DogHotelInteriorPage>
  );
}
