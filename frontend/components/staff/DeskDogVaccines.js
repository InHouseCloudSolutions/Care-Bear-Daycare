'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  IconButton,
  MenuItem,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { createVaccine, deleteVaccine, formatApiErrors, listVaccines } from '@/lib/daycareApi';
import { RowButton, ToneChip, stackSx } from './DeskParts';
import { VACCINE_KINDS, formatDateRange, vaccineName, vaccineState } from './staff-desk';
import { cardIconSx } from './site-image-styles';

const EMPTY = { kind: 'rabies', label: '', expires_on: '' };

const STATE_TONE = { expired: 'danger', soon: 'accent', ok: 'positive', none: 'muted' };

function expiryText(vaccine) {
  const state = vaccineState(vaccine.expires_on);
  if (state === 'none') return 'No expiry';
  const date = formatDateRange(vaccine.expires_on, vaccine.expires_on);
  return state === 'expired' ? `Expired ${date}` : `Expires ${date}`;
}

/** Vaccine list with add and remove for one dog. Loads when first shown. */
export default function DeskDogVaccines({ dog, token, notify, adding = false, onAddingChange }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const res = await listVaccines(token, dog.id);
    setRows(res.ok && Array.isArray(res.data) ? res.data : []);
    if (!res.ok) setError('Could not load vaccines.');
  }, [token, dog.id]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async event => {
    event.preventDefault();
    if (form.kind === 'other' && !form.label.trim()) {
      setError('Name the vaccine.');
      return;
    }
    setBusy(true);
    setError(null);
    const res = await createVaccine(token, dog.id, {
      kind: form.kind,
      label: form.kind === 'other' ? form.label.trim() : '',
      expires_on: form.expires_on || null,
    });
    setBusy(false);
    if (!res.ok) {
      const { summary, fields } = formatApiErrors(res.data);
      setError(summary || Object.values(fields)[0] || 'Could not add that vaccine.');
      return;
    }
    setForm(EMPTY);
    onAddingChange?.(false);
    await load();
    notify(`Vaccine added for ${dog.name}.`);
  };

  const remove = async vaccine => {
    setError(null);
    const res = await deleteVaccine(token, vaccine.id);
    if (!res.ok && res.status !== 204) {
      setError('Could not remove that vaccine.');
      return;
    }
    await load();
  };

  return (
    <Box>
      {error ? (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}
      {rows === null ? <Skeleton variant="rounded" height={32} sx={{ borderRadius: 2 }} /> : null}
      {rows && rows.length > 0 ? (
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, ...stackSx(1) }}>
          {rows.map(vaccine => (
            <Box
              component="li"
              key={vaccine.id}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 14, minWidth: 92 }}>
                {vaccineName(vaccine)}
              </Typography>
              <ToneChip
                label={expiryText(vaccine)}
                tone={STATE_TONE[vaccineState(vaccine.expires_on)]}
              />
              <Tooltip title={`Remove ${vaccineName(vaccine)}`}>
                <IconButton
                  size="small"
                  aria-label={`Remove ${vaccineName(vaccine)} vaccine`}
                  onClick={() => remove(vaccine)}
                  sx={theme => ({ ...cardIconSx(theme), width: 28, height: 28, ml: 'auto' })}
                >
                  <CloseRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      ) : null}

      {adding ? (
        <Box
          component="form"
          onSubmit={add}
          sx={{
            mt: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            alignItems: 'flex-start',
            '& > .MuiTextField-root': { flex: '1 1 160px', minWidth: 0 },
          }}
        >
          <TextField
            select
            size="small"
            label="Vaccine"
            value={form.kind}
            onChange={event => setForm(prev => ({ ...prev, kind: event.target.value }))}
          >
            {VACCINE_KINDS.map(kind => (
              <MenuItem key={kind.value} value={kind.value}>
                {kind.label}
              </MenuItem>
            ))}
          </TextField>
          {form.kind === 'other' ? (
            <TextField
              size="small"
              label="Vaccine name"
              value={form.label}
              onChange={event => setForm(prev => ({ ...prev, label: event.target.value }))}
            />
          ) : null}
          <TextField
            size="small"
            type="date"
            label="Expires"
            InputLabelProps={{ shrink: true }}
            value={form.expires_on}
            onChange={event => setForm(prev => ({ ...prev, expires_on: event.target.value }))}
          />
          <Box sx={{ display: 'flex', gap: 1, flex: '1 1 100%' }}>
            <RowButton primary type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Add vaccine'}
            </RowButton>
            <RowButton
              onClick={() => {
                setForm(EMPTY);
                onAddingChange?.(false);
              }}
            >
              Cancel
            </RowButton>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

DeskDogVaccines.propTypes = {
  dog: PropTypes.shape({ id: PropTypes.number.isRequired, name: PropTypes.string }).isRequired,
  token: PropTypes.string,
  notify: PropTypes.func.isRequired,
  adding: PropTypes.bool,
  onAddingChange: PropTypes.func,
};
