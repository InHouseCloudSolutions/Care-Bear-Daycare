'use client';

import { useEffect, useState } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import GlassFormField from '@/components/design-studio/GlassFormField';
import { useAuth } from '@/contexts/AuthContext';
import { deleteMyPhoto, formatApiErrors, updateMyProfile, uploadMyPhoto } from '@/lib/daycareApi';
import { FORM_STACK_SX, PRIMARY_BUTTON_SX, SECTION_HEADING_SX } from './pet-parent-styles';
import ProfilePhoto from './ProfilePhoto';

const EDITABLE_FIELDS = [
  'first_name',
  'last_name',
  'phone',
  'address',
  'city',
  'emergency_name',
  'emergency_phone',
];

const FIELD_LABELS = {
  first_name: 'First name',
  last_name: 'Last name',
  phone: 'Phone',
  address: 'Address',
  city: 'City',
  emergency_name: 'Emergency contact name',
  emergency_phone: 'Emergency contact phone',
};

function profileToForm(petParent) {
  const form = {};
  EDITABLE_FIELDS.forEach(field => {
    form[field] = petParent?.[field] ?? '';
  });
  return form;
}

function photoErrorMessage(res, fallback) {
  const { summary, fields } = formatApiErrors(res.data);
  return fields.file || summary || fallback;
}

export default function AccountYouSection() {
  const { petParent, token, refreshAuth, user, loading } = useAuth();
  const serverPhotoUrl = petParent?.photo_url ?? null;
  const [form, setForm] = useState(() => profileToForm(petParent));
  const [photoUrl, setPhotoUrl] = useState(serverPhotoUrl);
  const [fieldErrors, setFieldErrors] = useState({});
  const [summaryError, setSummaryError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(profileToForm(petParent));
  }, [petParent]);

  useEffect(() => {
    setPhotoUrl(serverPhotoUrl);
  }, [serverPhotoUrl]);

  const handleChange = field => event => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
    setSaved(false);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setSummaryError(null);
    setFieldErrors({});
    setSaved(false);

    const res = await updateMyProfile(token, form);
    setSubmitting(false);

    if (!res.ok) {
      const { summary, fields } = formatApiErrors(res.data);
      setSummaryError(
        summary ||
          (res.status === 404
            ? 'This account has no pet-parent profile.'
            : 'Could not save your profile.'),
      );
      setFieldErrors(fields);
      return;
    }

    await refreshAuth();
    setSaved(true);
  };

  const handlePhotoUpload = async file => {
    const res = await uploadMyPhoto(token, file);
    if (!res.ok) {
      return photoErrorMessage(res, 'Could not upload that photo.');
    }
    setPhotoUrl(res.data?.photo_url ?? null);
    return null;
  };

  const handlePhotoRemove = async () => {
    const res = await deleteMyPhoto(token);
    if (!res.ok) {
      return photoErrorMessage(res, 'Could not remove that photo.');
    }
    setPhotoUrl(null);
    return null;
  };

  const parentName = [petParent?.first_name, petParent?.last_name].filter(Boolean).join(' ');

  if (!loading && user && !petParent) {
    return (
      <Box component="section">
        <Typography component="h2" sx={SECTION_HEADING_SX}>
          You
        </Typography>
        <Alert severity="info" sx={{ mt: 3, maxWidth: 420 }}>
          Signed in as {user.username}. This account has no pet-parent profile, so these details are
          not saved here.
        </Alert>
      </Box>
    );
  }

  return (
    <Box component="section">
      <Typography component="h2" sx={SECTION_HEADING_SX}>
        You
      </Typography>
      {petParent ? (
        <Box sx={{ mt: 3 }}>
          <ProfilePhoto
            photoUrl={photoUrl}
            token={token}
            name={parentName || 'You'}
            onUpload={handlePhotoUpload}
            onRemove={handlePhotoRemove}
          />
        </Box>
      ) : null}
      <GlassFormField
        label="Email"
        value={petParent?.email ?? ''}
        fullWidth
        disabled
        sx={{ mt: 3, maxWidth: 420 }}
      />
      {summaryError ? (
        <Alert severity="error" sx={{ mt: 2, maxWidth: 420 }}>
          {summaryError}
        </Alert>
      ) : null}
      {saved ? (
        <Alert severity="success" sx={{ mt: 2, maxWidth: 420 }}>
          Saved.
        </Alert>
      ) : null}
      <Box component="form" onSubmit={handleSubmit} sx={FORM_STACK_SX}>
        {EDITABLE_FIELDS.map(field => (
          <GlassFormField
            key={field}
            label={FIELD_LABELS[field]}
            fullWidth
            value={form[field]}
            onChange={handleChange(field)}
            error={Boolean(fieldErrors[field])}
            helperText={fieldErrors[field]}
          />
        ))}
        <Button type="submit" variant="contained" disabled={submitting} sx={PRIMARY_BUTTON_SX}>
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
      </Box>
    </Box>
  );
}
