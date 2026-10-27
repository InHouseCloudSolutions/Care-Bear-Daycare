'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, Checkbox, FormControlLabel, MenuItem } from '@mui/material';
import GlassFormField from '@/components/design-studio/GlassFormField';
import { formatApiErrors } from '@/lib/daycareApi';
import { PRIMARY_BUTTON_SX } from './pet-parent-styles';

const SEX_OPTIONS = ['female', 'male', 'unknown'];

/** Single-line text fields shown between sex and the numeric/date fields. */
const TOP_TEXT_FIELDS = [
  { name: 'breed', label: 'Breed' },
  { name: 'vet_name', label: 'Vet name' },
  { name: 'vet_phone', label: 'Vet phone' },
];

/** Standing-care fields, shown as multi-line text. */
const MULTILINE_FIELDS = [
  { name: 'medications', label: 'Medications' },
  { name: 'feeding', label: 'Feeding' },
  { name: 'temperament', label: 'Temperament' },
  { name: 'notes', label: 'Notes' },
];

function toFormState(dog) {
  return {
    name: dog?.name ?? '',
    breed: dog?.breed ?? '',
    sex: dog?.sex ?? 'unknown',
    weight_lb: dog?.weight_lb ?? '',
    birth_date: dog?.birth_date ?? '',
    spayed_neutered: Boolean(dog?.spayed_neutered),
    vet_name: dog?.vet_name ?? '',
    vet_phone: dog?.vet_phone ?? '',
    medications: dog?.medications ?? '',
    feeding: dog?.feeding ?? '',
    temperament: dog?.temperament ?? '',
    notes: dog?.notes ?? '',
  };
}

/** Add/edit form for a dog. `onSubmit` receives the payload and must return `{ ok, data }`. */
export default function DogForm({ initialDog, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(() => toFormState(initialDog));
  const [fieldErrors, setFieldErrors] = useState({});
  const [summaryError, setSummaryError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = field => event => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleCheckbox = field => event => {
    setForm(prev => ({ ...prev, [field]: event.target.checked }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setSummaryError(null);
    setFieldErrors({});

    const payload = {
      ...form,
      weight_lb: form.weight_lb === '' ? null : form.weight_lb,
      birth_date: form.birth_date === '' ? null : form.birth_date,
    };

    const res = await onSubmit(payload);
    setSubmitting(false);

    if (!res?.ok) {
      const { summary, fields } = formatApiErrors(res?.data);
      setSummaryError(summary);
      setFieldErrors(fields);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {summaryError ? <Alert severity="error">{summaryError}</Alert> : null}
      <GlassFormField
        label="Name"
        required
        fullWidth
        value={form.name}
        onChange={handleChange('name')}
        error={Boolean(fieldErrors.name)}
        helperText={fieldErrors.name}
      />
      <GlassFormField
        select
        label="Sex"
        fullWidth
        value={form.sex}
        onChange={handleChange('sex')}
        error={Boolean(fieldErrors.sex)}
        helperText={fieldErrors.sex}
      >
        {SEX_OPTIONS.map(option => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </GlassFormField>
      {TOP_TEXT_FIELDS.map(field => (
        <GlassFormField
          key={field.name}
          label={field.label}
          fullWidth
          value={form[field.name]}
          onChange={handleChange(field.name)}
          error={Boolean(fieldErrors[field.name])}
          helperText={fieldErrors[field.name]}
        />
      ))}
      <GlassFormField
        label="Weight (lb)"
        type="number"
        fullWidth
        value={form.weight_lb}
        onChange={handleChange('weight_lb')}
        error={Boolean(fieldErrors.weight_lb)}
        helperText={fieldErrors.weight_lb}
      />
      <GlassFormField
        label="Birth date"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        value={form.birth_date}
        onChange={handleChange('birth_date')}
        error={Boolean(fieldErrors.birth_date)}
        helperText={fieldErrors.birth_date}
      />
      <FormControlLabel
        control={
          <Checkbox checked={form.spayed_neutered} onChange={handleCheckbox('spayed_neutered')} />
        }
        label="Spayed / neutered"
      />
      {MULTILINE_FIELDS.map(field => (
        <GlassFormField
          key={field.name}
          label={field.label}
          fullWidth
          multiline
          minRows={2}
          value={form[field.name]}
          onChange={handleChange(field.name)}
          error={Boolean(fieldErrors[field.name])}
          helperText={fieldErrors[field.name]}
        />
      ))}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button type="submit" variant="contained" disabled={submitting} sx={PRIMARY_BUTTON_SX}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
        {onCancel ? (
          <Button onClick={onCancel} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}

DogForm.propTypes = {
  initialDog: PropTypes.shape({
    name: PropTypes.string,
    breed: PropTypes.string,
    sex: PropTypes.string,
    weight_lb: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    birth_date: PropTypes.string,
    spayed_neutered: PropTypes.bool,
    vet_name: PropTypes.string,
    vet_phone: PropTypes.string,
    medications: PropTypes.string,
    feeding: PropTypes.string,
    temperament: PropTypes.string,
    notes: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  submitLabel: PropTypes.string.isRequired,
};
