'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import DogForm from '@/components/pet-parent/DogForm';
import { dogsForHousehold } from '@/components/pet-parent/booking-dates';
import { SECONDARY_BUTTON_SX } from '@/components/pet-parent/pet-parent-styles';
import { createDog, listDogs, listPetParents, updateDog } from '@/lib/daycareApi';
import { asRecordList, householdLabel } from './staff-desk';

export default function HouseholdPanel() {
  const { token } = useAuth();
  const [parents, setParents] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [parentsRes, dogsRes] = await Promise.all([listPetParents(token), listDogs(token)]);
    setLoading(false);
    const parentRows = asRecordList(parentsRes.data);
    const dogRows = asRecordList(dogsRes.data);
    const failed = [];
    if (!parentsRes.ok || !parentRows) failed.push('households');
    if (!dogsRes.ok || !dogRows) failed.push('dogs');
    setParents(parentRows || []);
    setDogs(dogRows || []);
    setLoadError(failed.length ? `Could not load ${failed.join(', ')}.` : null);
  }, [token]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const selectedDogs = useMemo(
    () => (selectedId == null ? [] : dogsForHousehold(dogs, selectedId)),
    [dogs, selectedId],
  );

  const handleCreate = async payload => {
    const res = await createDog(token, { ...payload, pet_parent_id: selectedId });
    if (res.ok) {
      setAdding(false);
      await load();
    }
    return res;
  };

  const handleUpdate = async (dog, payload) => {
    const res = await updateDog(token, dog.id, payload);
    if (res.ok) {
      setEditingId(null);
      await load();
    }
    return res;
  };

  return (
    <Box component="section" aria-labelledby="staff-households-heading">
      <Typography
        id="staff-households-heading"
        component="h2"
        variant="h5"
        sx={{ fontWeight: 600 }}
      >
        Households
      </Typography>

      {loadError ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {loadError}
        </Alert>
      ) : null}
      {loading ? (
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading households…</Typography>
      ) : null}
      {!loading && !loadError && parents.length === 0 ? (
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>No households yet.</Typography>
      ) : null}

      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {parents.map(parent => (
          <Button
            key={parent.id}
            variant={selectedId === parent.id ? 'contained' : 'outlined'}
            sx={selectedId === parent.id ? undefined : SECONDARY_BUTTON_SX}
            onClick={() => {
              setSelectedId(parent.id);
              setAdding(false);
              setEditingId(null);
            }}
          >
            {householdLabel(parent)}
          </Button>
        ))}
      </Box>

      {selectedId != null ? (
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography component="h3" variant="h6" sx={{ fontWeight: 600 }}>
              Dogs
            </Typography>
            {!adding && editingId == null ? (
              <Button
                variant="outlined"
                sx={{ textTransform: 'none', borderRadius: 999 }}
                onClick={() => {
                  setEditingId(null);
                  setAdding(true);
                }}
              >
                Add a dog
              </Button>
            ) : null}
          </Box>

          {adding ? (
            <Box sx={{ mt: 2, maxWidth: 480 }}>
              <DogForm
                onSubmit={handleCreate}
                onCancel={() => setAdding(false)}
                submitLabel="Add dog"
              />
            </Box>
          ) : null}

          {!loading && selectedDogs.length === 0 && !adding ? (
            <Typography sx={{ mt: 2, color: 'text.secondary' }}>
              This household has no dogs yet.
            </Typography>
          ) : null}

          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedDogs.map(dog =>
              editingId === dog.id ? (
                <Box key={dog.id} sx={{ maxWidth: 480 }}>
                  <DogForm
                    initialDog={dog}
                    onSubmit={payload => handleUpdate(dog, payload)}
                    onCancel={() => setEditingId(null)}
                    submitLabel="Save dog"
                  />
                </Box>
              ) : (
                <Box
                  key={dog.id}
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                  }}
                >
                  <Typography>
                    {dog.name} · {dog.breed || 'Breed not set'} · {dog.sex || 'unknown'} ·{' '}
                    {dog.good_with_dogs ? 'Good with other dogs' : 'Not good with other dogs'}
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={SECONDARY_BUTTON_SX}
                    onClick={() => {
                      setAdding(false);
                      setEditingId(dog.id);
                    }}
                  >
                    Edit
                  </Button>
                </Box>
              ),
            )}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
