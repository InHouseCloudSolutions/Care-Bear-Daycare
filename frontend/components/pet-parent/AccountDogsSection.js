'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { createDog, listDogs } from '@/lib/daycareApi';
import { SECTION_HEADING_SX } from './pet-parent-styles';
import DogCard from './DogCard';
import DogForm from './DogForm';

export default function AccountDogsSection() {
  const { token } = useAuth();
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [adding, setAdding] = useState(false);

  const loadDogs = useCallback(async () => {
    setLoading(true);
    const res = await listDogs(token);
    setLoading(false);
    if (!res.ok) {
      setLoadError('Could not load your dogs.');
      return;
    }
    setLoadError(null);
    setDogs(Array.isArray(res.data) ? res.data : []);
  }, [token]);

  useEffect(() => {
    if (token) loadDogs();
  }, [token, loadDogs]);

  const handleCreate = async payload => {
    const res = await createDog(token, payload);
    if (res.ok) {
      setAdding(false);
      await loadDogs();
    }
    return res;
  };

  return (
    <Box component="section">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography component="h2" sx={SECTION_HEADING_SX}>
          Dogs
        </Typography>
        {!adding ? (
          <Button
            onClick={() => setAdding(true)}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 999 }}
          >
            Add a dog
          </Button>
        ) : null}
      </Box>

      {loadError ? (
        <Alert severity="error" sx={{ mt: 2, maxWidth: 480 }}>
          {loadError}
        </Alert>
      ) : null}

      {adding ? (
        <Box sx={{ mt: 3, maxWidth: 480 }}>
          <DogForm
            onSubmit={handleCreate}
            onCancel={() => setAdding(false)}
            submitLabel="Add dog"
          />
        </Box>
      ) : null}

      {!loading && dogs.length === 0 && !adding ? (
        <Typography sx={{ mt: 3, color: 'text.secondary' }}>
          No dogs yet. Add your first dog above.
        </Typography>
      ) : null}

      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {dogs.map(dog => (
          <DogCard key={dog.id} dog={dog} token={token} onChanged={loadDogs} />
        ))}
      </Box>
    </Box>
  );
}
