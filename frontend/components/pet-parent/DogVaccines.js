'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, MenuItem, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import GlassFormField from '@/components/design-studio/GlassFormField';
import { WEBSITE_INK } from '@/consts/website-theme';
import { createVaccine, deleteVaccine, formatApiErrors, listVaccines } from '@/lib/daycareApi';

const KIND_OPTIONS = ['rabies', 'dhpp', 'bordetella', 'other'];

const EMPTY_FORM = { kind: 'rabies', label: '', expires_on: '' };

function vaccineLabel(vaccine) {
  const name = vaccine.kind === 'other' ? vaccine.label || 'Other' : vaccine.kind;
  return vaccine.expires_on ? `${name} · expires ${vaccine.expires_on}` : name;
}

/** Vaccine list + add/delete for a single dog. */
export default function DogVaccines({ dogId, token }) {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listVaccines(token, dogId);
    setLoading(false);
    if (res.ok) {
      setVaccines(Array.isArray(res.data) ? res.data : []);
    }
  }, [token, dogId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async event => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      kind: form.kind,
      label: form.kind === 'other' ? form.label : '',
      expires_on: form.expires_on || null,
    };
    const res = await createVaccine(token, dogId, payload);
    setSubmitting(false);

    if (!res.ok) {
      const { summary, fields } = formatApiErrors(res.data);
      setError(summary || Object.values(fields)[0] || 'Could not add vaccine.');
      return;
    }
    setForm(EMPTY_FORM);
    setAdding(false);
    load();
  };

  const handleDelete = async vaccineId => {
    const res = await deleteVaccine(token, vaccineId);
    if (res.ok || res.status === 204) load();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          component="h4"
          sx={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: alpha(WEBSITE_INK, 0.65),
          }}
        >
          Vaccines
        </Typography>
        {!adding ? (
          <Button size="small" onClick={() => setAdding(true)} sx={{ textTransform: 'none' }}>
            Add vaccine
          </Button>
        ) : null}
      </Box>

      {!loading && vaccines.length === 0 ? (
        <Typography sx={{ mt: 1, fontSize: 14, color: alpha(WEBSITE_INK, 0.6) }}>
          No vaccines on file.
        </Typography>
      ) : null}

      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          mt: 1,
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {vaccines.map(vaccine => (
          <Box
            component="li"
            key={vaccine.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 14,
              color: WEBSITE_INK,
            }}
          >
            <span>{vaccineLabel(vaccine)}</span>
            <Button
              size="small"
              color="error"
              onClick={() => handleDelete(vaccine.id)}
              sx={{ textTransform: 'none', minWidth: 0 }}
            >
              Remove
            </Button>
          </Box>
        ))}
      </Box>

      {adding ? (
        <Box
          component="form"
          onSubmit={handleAdd}
          sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 320 }}
        >
          {error ? <Alert severity="error">{error}</Alert> : null}
          <GlassFormField
            select
            label="Kind"
            fullWidth
            size="small"
            value={form.kind}
            onChange={event => setForm(prev => ({ ...prev, kind: event.target.value }))}
          >
            {KIND_OPTIONS.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </GlassFormField>
          {form.kind === 'other' ? (
            <GlassFormField
              label="Label"
              fullWidth
              size="small"
              value={form.label}
              onChange={event => setForm(prev => ({ ...prev, label: event.target.value }))}
            />
          ) : null}
          <GlassFormField
            label="Expires on"
            type="date"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            value={form.expires_on}
            onChange={event => setForm(prev => ({ ...prev, expires_on: event.target.value }))}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              type="submit"
              size="small"
              variant="contained"
              disabled={submitting}
              sx={{ textTransform: 'none', borderRadius: 999 }}
            >
              {submitting ? 'Adding…' : 'Add'}
            </Button>
            <Button size="small" onClick={() => setAdding(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

DogVaccines.propTypes = {
  dogId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  token: PropTypes.string,
};
