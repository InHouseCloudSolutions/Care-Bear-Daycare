'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { createClosure, deleteClosure, listClosures, updateClosure } from '@/lib/daycareApi';
import { SECONDARY_BUTTON_SX } from '@/components/pet-parent/pet-parent-styles';
import { asRecordList } from './staff-desk';
import HolidayForm from './HolidayForm';

export default function HolidayPanel() {
  const { token } = useAuth();
  const [closures, setClosures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadClosures = useCallback(async () => {
    setLoading(true);
    const res = await listClosures(token);
    setLoading(false);
    const rows = asRecordList(res.data);
    if (!res.ok || !rows) {
      setLoadError('Could not load holidays.');
      setClosures([]);
      return;
    }
    setLoadError(null);
    setClosures(rows);
  }, [token]);

  useEffect(() => {
    if (token) loadClosures();
  }, [token, loadClosures]);

  const handleCreate = async payload => {
    const res = await createClosure(token, payload);
    if (res.ok) {
      setAdding(false);
      await loadClosures();
    }
    return res;
  };

  const handleUpdate = async (closure, payload) => {
    const res = await updateClosure(token, closure.id, payload);
    if (res.ok) {
      setEditingId(null);
      await loadClosures();
    }
    return res;
  };

  const handleDelete = async closure => {
    setActionError(null);
    const res = await deleteClosure(token, closure.id);
    if (!res.ok) {
      setActionError('Could not remove that holiday.');
      return;
    }
    if (editingId === closure.id) setEditingId(null);
    await loadClosures();
  };

  const editing = closures.find(closure => closure.id === editingId) || null;

  return (
    <Box component="section" aria-labelledby="staff-holidays-heading">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          id="staff-holidays-heading"
          component="h2"
          variant="h5"
          sx={{ fontWeight: 600 }}
        >
          Holidays
        </Typography>
        {!adding && !editing ? (
          <Button
            variant="outlined"
            onClick={() => setAdding(true)}
            sx={{ textTransform: 'none', borderRadius: 999 }}
          >
            Add a holiday
          </Button>
        ) : null}
      </Box>

      {loadError ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {loadError}
        </Alert>
      ) : null}
      {actionError ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {actionError}
        </Alert>
      ) : null}

      {adding ? (
        <Box sx={{ mt: 3 }}>
          <HolidayForm
            onSubmit={handleCreate}
            onCancel={() => setAdding(false)}
            submitLabel="Add holiday"
          />
        </Box>
      ) : null}

      {loading ? (
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading holidays…</Typography>
      ) : null}

      {!loading && !loadError && closures.length === 0 && !adding ? (
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>No holidays yet.</Typography>
      ) : null}

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {closures.map(closure =>
          editing && editing.id === closure.id ? (
            <HolidayForm
              key={closure.id}
              initial={closure}
              onSubmit={payload => handleUpdate(closure, payload)}
              onCancel={() => setEditingId(null)}
              submitLabel="Save holiday"
            />
          ) : (
            <Box
              key={closure.id}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              <Typography>
                {closure.name} · {closure.starts_on} – {closure.ends_on}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  sx={SECONDARY_BUTTON_SX}
                  onClick={() => {
                    setAdding(false);
                    setEditingId(closure.id);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  sx={SECONDARY_BUTTON_SX}
                  aria-label={`Remove ${closure.name}`}
                  onClick={() => handleDelete(closure)}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          ),
        )}
      </Box>
    </Box>
  );
}
