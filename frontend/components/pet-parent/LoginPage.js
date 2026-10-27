'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Box, Button, Link as MuiLink, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import GlassFormField from '@/components/design-studio/GlassFormField';
import DogHotelInteriorPage from '@/components/dog-hotel/DogHotelInteriorPage';
import { useAuth } from '@/contexts/AuthContext';
import { REGISTER_PATH, safeAccountNextPath } from '@/consts/routes';
import { WEBSITE_INK } from '@/consts/website-theme';
import { formatApiErrors } from '@/lib/daycareApi';
import { FORM_STACK_SX, PRIMARY_BUTTON_SX } from './pet-parent-styles';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await login(email.trim(), password);
    setSubmitting(false);

    if (!res.ok) {
      const { summary, fields } = formatApiErrors(res.data);
      setError(summary || fields.password || fields.username || 'Incorrect email or password.');
      return;
    }

    router.push(safeAccountNextPath(searchParams.get('next')));
  };

  return (
    <DogHotelInteriorPage
      title="Log in"
      lede="Sign in to manage your dogs, vaccines, and visit requests."
    >
      {error ? (
        <Alert severity="error" sx={{ mt: 3, maxWidth: 420 }}>
          {error}
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
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
        <GlassFormField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          fullWidth
          value={password}
          onChange={event => setPassword(event.target.value)}
        />
        <Button type="submit" variant="contained" disabled={submitting} sx={PRIMARY_BUTTON_SX}>
          {submitting ? 'Signing in…' : 'Log in'}
        </Button>
      </Box>
      <Typography component="p" sx={{ mt: 3, color: alpha(WEBSITE_INK, 0.78) }}>
        New here?{' '}
        <MuiLink component={Link} href={REGISTER_PATH} color="inherit" underline="always">
          Create an account
        </MuiLink>
      </Typography>
    </DogHotelInteriorPage>
  );
}
