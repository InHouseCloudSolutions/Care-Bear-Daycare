'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, Chip, MenuItem, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GlassFormField from '@/components/design-studio/GlassFormField';
import { vaccineName, vaccineState, todayIso } from '@/components/staff/staff-desk';
import { WEBSITE_INK, WEBSITE_PAGE_BACKGROUND_MUTED } from '@/consts/website-theme';
import { createVaccine, deleteVaccine, formatApiErrors, listVaccines } from '@/lib/daycareApi';
import { CREAM_FIELDS_SX, SECONDARY_BUTTON_SX } from './pet-parent-styles';

const KIND_OPTIONS = [
  { value: 'rabies', label: 'Rabies' },
  { value: 'dhpp', label: 'DHPP' },
  { value: 'bordetella', label: 'Bordetella' },
  { value: 'other', label: 'Other' },
];

const EMPTY_FORM = { kind: 'rabies', label: '', expires_on: '' };

function recordsChip(vaccines) {
  if (vaccines.length === 0) return 'No records added';
  const today = todayIso();
  if (vaccines.some(vaccine => vaccineState(vaccine.expires_on, today) === 'expired')) {
    return 'Expired';
  }
  if (vaccines.some(vaccine => vaccineState(vaccine.expires_on, today) === 'soon')) {
    return 'Expiring soon';
  }
  return `${vaccines.length} on file`;
}

function vaccineLine(vaccine) {
  const name = vaccineName(vaccine);
  return vaccine.expires_on ? `${name} · expires ${vaccine.expires_on}` : name;
}

/** Vaccine list + add/delete for a single dog. */
export default function DogVaccines({ dogId, token, dogName, onNotify }) {
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
    if (dogName) onNotify?.(`Vaccine added for ${dogName}.`);
    load();
  };

  const handleDelete = async vaccineId => {
    const res = await deleteVaccine(token, vaccineId);
    if (res.ok || res.status === 204) load();
  };

  return (
    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(WEBSITE_INK, 0.1)}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <DescriptionOutlinedIcon sx={{ fontSize: 20, color: WEBSITE_INK }} />
          <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: WEBSITE_INK }}>
            Vaccine records
          </Typography>
        </Box>
        {!loading ? (
          <Chip
            size="small"
            label={recordsChip(vaccines)}
            sx={{
              height: 26,
              bgcolor: WEBSITE_PAGE_BACKGROUND_MUTED,
              color: alpha(WEBSITE_INK, 0.72),
              fontWeight: 650,
              borderRadius: 999,
            }}
          />
        ) : null}
      </Box>

      {!loading && vaccines.length === 0 ? (
        <Typography sx={{ mt: 1.25, fontSize: 14, color: alpha(WEBSITE_INK, 0.55) }}>
          No vaccine records on file.
        </Typography>
      ) : null}

      {vaccines.length > 0 ? (
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            m: 0,
            mt: 1.25,
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
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
                gap: 1,
                fontSize: 14,
                color: WEBSITE_INK,
              }}
            >
              <span>{vaccineLine(vaccine)}</span>
              <Button
                type="button"
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
      ) : null}

      {adding ? (
        <Box
          component="form"
          onSubmit={handleAdd}
          sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, ...CREAM_FIELDS_SX }}
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
              <MenuItem key={option.value} value={option.value}>
                {option.label}
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
            <Button
              type="button"
              size="small"
              onClick={() => setAdding(false)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Button
          type="button"
          variant="outlined"
          fullWidth
          onClick={() => setAdding(true)}
          sx={{ ...SECONDARY_BUTTON_SX, mt: 1.75 }}
        >
          + Add vaccine
        </Button>
      )}
    </Box>
  );
}

DogVaccines.propTypes = {
  dogId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  token: PropTypes.string,
  dogName: PropTypes.string,
  onNotify: PropTypes.func,
};
