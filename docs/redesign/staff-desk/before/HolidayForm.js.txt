'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button } from '@mui/material';
import GlassFormField from '@/components/design-studio/GlassFormField';
import { formatApiErrors } from '@/lib/daycareApi';
import { PRIMARY_BUTTON_SX } from '@/components/pet-parent/pet-parent-styles';
import { holidayFormError, holidayPayload } from './staff-desk';

const DATE_FIELD_PROPS = { InputLabelProps: { shrink: true } };

export default function HolidayForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [startsOn, setStartsOn] = useState(initial?.starts_on ?? '');
  const [endsOn, setEndsOn] = useState(initial?.ends_on ?? '');
  const [localError, setLocalError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [summaryError, setSummaryError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    const clientError = holidayFormError({ name, startsOn, endsOn });
    if (clientError) {
      setLocalError(clientError);
      setSummaryError(null);
      setFieldErrors({});
      return;
    }

    setLocalError(null);
    setSummaryError(null);
    setFieldErrors({});
    setSubmitting(true);
    const res = await onSubmit(holidayPayload({ name, startsOn, endsOn }));
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
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 420 }}
    >
      {localError ? <Alert severity="warning">{localError}</Alert> : null}
      {summaryError ? <Alert severity="error">{summaryError}</Alert> : null}
      <GlassFormField
        label="Name"
        required
        fullWidth
        value={name}
        onChange={event => setName(event.target.value)}
        error={Boolean(fieldErrors.name)}
        helperText={fieldErrors.name}
      />
      <GlassFormField
        label="Start date"
        type="date"
        required
        fullWidth
        value={startsOn}
        onChange={event => setStartsOn(event.target.value)}
        error={Boolean(fieldErrors.starts_on)}
        helperText={fieldErrors.starts_on}
        {...DATE_FIELD_PROPS}
      />
      <GlassFormField
        label="End date"
        type="date"
        required
        fullWidth
        value={endsOn}
        onChange={event => setEndsOn(event.target.value)}
        error={Boolean(fieldErrors.ends_on)}
        helperText={fieldErrors.ends_on}
        {...DATE_FIELD_PROPS}
      />
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button type="submit" variant="contained" disabled={submitting} sx={PRIMARY_BUTTON_SX}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" onClick={onCancel} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}

HolidayForm.propTypes = {
  initial: PropTypes.shape({
    name: PropTypes.string,
    starts_on: PropTypes.string,
    ends_on: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  submitLabel: PropTypes.string.isRequired,
};
