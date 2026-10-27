'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Link as MuiLink, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import GlassFormField from '@/components/design-studio/GlassFormField';
import DogHotelInteriorPage from '@/components/dog-hotel/DogHotelInteriorPage';
import { useAuth } from '@/contexts/AuthContext';
import { ACCOUNT_PATH, LOGIN_PATH } from '@/consts/routes';
import { WEBSITE_INK } from '@/consts/website-theme';
import { formatApiErrors } from '@/lib/daycareApi';
import { FORM_STACK_SX, PRIMARY_BUTTON_SX } from './pet-parent-styles';

const EMPTY_FORM = { email: '', password: '', first_name: '', last_name: '', phone: '' };

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [summaryError, setSummaryError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = field => event => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setSummaryError(null);
    setFieldErrors({});

    const payload = {
      email: form.email.trim(),
      password: form.password,
      ...(form.first_name.trim() && { first_name: form.first_name.trim() }),
      ...(form.last_name.trim() && { last_name: form.last_name.trim() }),
      ...(form.phone.trim() && { phone: form.phone.trim() }),
    };

    const res = await register(payload);
    setSubmitting(false);

    if (!res.ok) {
      const { summary, fields } = formatApiErrors(res.data);
      setSummaryError(summary);
      setFieldErrors(fields);
      return;
    }

    router.push(ACCOUNT_PATH);
  };

  return (
    <DogHotelInteriorPage
      title="Create an account"
      lede="Register to manage your dogs, vaccines, and visit requests."
    >
      {summaryError ? (
        <Alert severity="error" sx={{ mt: 3, maxWidth: 420 }}>
          {summaryError}
        </Alert>
      ) : null}
      <Box component="form" onSubmit={handleSubmit} sx={FORM_STACK_SX}>
        <GlassFormField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          fullWidth
          value={form.email}
          onChange={handleChange('email')}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
        />
        <GlassFormField
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          fullWidth
          value={form.password}
          onChange={handleChange('password')}
          error={Boolean(fieldErrors.password)}
          helperText={fieldErrors.password || 'At least 8 characters.'}
        />
        <GlassFormField
          label="First name"
          name="first_name"
          autoComplete="given-name"
          fullWidth
          value={form.first_name}
          onChange={handleChange('first_name')}
          error={Boolean(fieldErrors.first_name)}
          helperText={fieldErrors.first_name}
        />
        <GlassFormField
          label="Last name"
          name="last_name"
          autoComplete="family-name"
          fullWidth
          value={form.last_name}
          onChange={handleChange('last_name')}
          error={Boolean(fieldErrors.last_name)}
          helperText={fieldErrors.last_name}
        />
        <GlassFormField
          label="Phone"
          type="tel"
          name="phone"
          autoComplete="tel"
          fullWidth
          value={form.phone}
          onChange={handleChange('phone')}
          error={Boolean(fieldErrors.phone)}
          helperText={fieldErrors.phone}
        />
        <Button type="submit" variant="contained" disabled={submitting} sx={PRIMARY_BUTTON_SX}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </Box>
      <Typography component="p" sx={{ mt: 3, color: alpha(WEBSITE_INK, 0.78) }}>
        Already registered?{' '}
        <MuiLink component={Link} href={LOGIN_PATH} color="inherit" underline="always">
          Log in
        </MuiLink>
      </Typography>
    </DogHotelInteriorPage>
  );
}
