'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { Alert, Box, Button, InputAdornment, Link, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GlassFormField from '@/components/design-studio/GlassFormField';
import { CONTACT_PATH } from '@/consts/routes';
import {
  WEBSITE_INK,
  WEBSITE_PAGE_BACKGROUND,
  WEBSITE_PAGE_BACKGROUND_MUTED,
  WEBSITE_PAPER,
} from '@/consts/website-theme';
import { formatApiErrors } from '@/lib/daycareApi';
import DogCard from './DogCard';
import DogForm from './DogForm';
import ProfilePhoto from './ProfilePhoto';
import {
  CREAM_FIELDS_SX,
  PRIMARY_BUTTON_SX,
  SECONDARY_BUTTON_SX,
  SECTION_HEADING_SX,
} from './pet-parent-styles';

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
  emergency_name: 'Contact name',
  emergency_phone: 'Contact phone',
};

function profileToForm(petParent) {
  const form = {};
  EDITABLE_FIELDS.forEach(field => {
    form[field] = petParent?.[field] ?? '';
  });
  return form;
}

function photoErrorMessage(res, fallback) {
  const { summary, fields } = formatApiErrors(res?.data);
  return fields.file || summary || fallback;
}

function parentName(petParent) {
  return [petParent?.first_name, petParent?.last_name].filter(Boolean).join(' ');
}

const CARD_SHELL_SX = {
  bgcolor: WEBSITE_PAPER,
  border: `1px solid ${alpha(WEBSITE_INK, 0.12)}`,
  borderRadius: 3,
  p: { xs: 2.5, md: 3.5 },
};

/**
 * Shared pet-parent profile layout for /account and the staff household pane.
 * Callers pass the parent record and save/photo callbacks. This view does not
 * load /daycare/me itself.
 */
export default function ClientProfileView({
  showPageHeader = false,
  embedded = false,
  actions = null,
  petParent = null,
  missingProfile = false,
  signedInName = '',
  token,
  onSaveProfile,
  onProfileSaved,
  onUploadPhoto,
  onRemovePhoto,
  dogs = [],
  dogsLoading = false,
  dogsError = null,
  onCreateDog,
  onDogsChanged,
  onDogCreated,
  onRequestRemoveDog,
  onNotify,
  below = null,
  showHelp = true,
}) {
  const [form, setForm] = useState(() => profileToForm(petParent));
  const [photoUrl, setPhotoUrl] = useState(petParent?.photo_url ?? null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [summaryError, setSummaryError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setForm(profileToForm(petParent));
  }, [petParent]);

  useEffect(() => {
    setPhotoUrl(petParent?.photo_url ?? null);
  }, [petParent?.photo_url, petParent?.id]);

  const handleChange = field => event => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
    setSaved(false);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!petParent || !onSaveProfile) return;
    setSubmitting(true);
    setSummaryError(null);
    setFieldErrors({});
    setSaved(false);

    const res = await onSaveProfile(form);
    setSubmitting(false);

    if (!res?.ok) {
      const { summary, fields } = formatApiErrors(res?.data);
      setSummaryError(
        summary ||
          (res?.status === 404
            ? 'This account has no pet-parent profile.'
            : 'Could not save your profile.'),
      );
      setFieldErrors(fields);
      return;
    }

    if (onProfileSaved) await onProfileSaved(res.data);
    setSaved(true);
  };

  const handlePhotoUpload = async file => {
    const res = await onUploadPhoto(file);
    if (!res?.ok) return photoErrorMessage(res, 'Could not upload that photo.');
    setPhotoUrl(res.data?.photo_url ?? null);
    return null;
  };

  const handlePhotoRemove = async () => {
    const res = await onRemovePhoto();
    if (!res?.ok && res?.status !== 204) {
      return photoErrorMessage(res, 'Could not remove that photo.');
    }
    setPhotoUrl(null);
    return null;
  };

  const handleCreateDog = async payload => {
    const res = await onCreateDog(payload);
    if (res?.ok) {
      setAdding(false);
      if (onDogsChanged) await onDogsChanged();
      onDogCreated?.(res.data);
    }
    return res;
  };

  const field = name => (
    <GlassFormField
      key={name}
      label={FIELD_LABELS[name]}
      fullWidth
      value={form[name]}
      onChange={handleChange(name)}
      error={Boolean(fieldErrors[name])}
      helperText={fieldErrors[name]}
    />
  );

  const body = (
    <Box>
      {showPageHeader || actions ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
          }}
        >
          {showPageHeader ? (
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component="p"
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  color: WEBSITE_INK,
                }}
              >
                MY ACCOUNT
              </Typography>
              <Typography
                component="h1"
                sx={{
                  mt: 0.75,
                  fontWeight: 650,
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  lineHeight: 1.1,
                  color: WEBSITE_INK,
                }}
              >
                Your account
              </Typography>
              <Typography
                component="p"
                sx={{ mt: 1, fontSize: { xs: 15, md: 16 }, color: alpha(WEBSITE_INK, 0.62) }}
              >
                Manage your details, dogs, and vaccine records.
              </Typography>
            </Box>
          ) : (
            <Box />
          )}
          {actions ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, justifyContent: 'flex-end' }}>
              {actions}
            </Box>
          ) : null}
        </Box>
      ) : null}

      {missingProfile ? (
        <Alert severity="info" sx={{ mb: 3, maxWidth: 560 }}>
          Signed in as {signedInName || 'this account'}. This account has no pet-parent profile, so
          these details are not saved here.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ ...CREAM_FIELDS_SX }}>
          <Box component="section" aria-label="Parent details" sx={CARD_SHELL_SX}>
            <Typography component="h2" sx={SECTION_HEADING_SX}>
              Parent details
            </Typography>
            <Typography sx={{ mt: 0.5, mb: 2.5, fontSize: 14.5, color: alpha(WEBSITE_INK, 0.6) }}>
              Keep your contact information up to date.
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' },
                gap: { xs: 2.5, sm: 3 },
                alignItems: 'start',
              }}
            >
              <ProfilePhoto
                variant="account"
                photoUrl={photoUrl}
                token={token}
                name={parentName(petParent) || 'You'}
                onUpload={handlePhotoUpload}
                onRemove={handlePhotoRemove}
              />
              <Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  {field('first_name')}
                  {field('last_name')}
                  <GlassFormField
                    label="Email"
                    value={petParent?.email ?? ''}
                    fullWidth
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon
                            sx={{ fontSize: 18, color: alpha(WEBSITE_INK, 0.45) }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {field('phone')}
                  {field('address')}
                  {field('city')}
                </Box>
                <Typography
                  component="h3"
                  sx={{
                    mt: 3,
                    mb: 1.5,
                    pt: 2.5,
                    borderTop: `1px solid ${alpha(WEBSITE_INK, 0.1)}`,
                    fontWeight: 700,
                    fontSize: 16,
                    color: WEBSITE_INK,
                  }}
                >
                  Emergency contact
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  {field('emergency_name')}
                  {field('emergency_phone')}
                </Box>
              </Box>
            </Box>
            {summaryError ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {summaryError}
              </Alert>
            ) : null}
            {saved ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                Saved.
              </Alert>
            ) : null}
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Typography sx={{ fontSize: 14, color: alpha(WEBSITE_INK, 0.55) }}>
                Save updates to your parent details.
              </Typography>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !petParent}
                sx={{ ...PRIMARY_BUTTON_SX, alignSelf: 'auto' }}
              >
                {submitting ? 'Saving…' : 'Save changes'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Box component="section" sx={{ mt: { xs: 4, md: 5 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="h2" sx={SECTION_HEADING_SX}>
                Your dogs
              </Typography>
              <Box
                component="span"
                sx={{
                  minWidth: 26,
                  px: 1,
                  py: 0.15,
                  borderRadius: 999,
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: WEBSITE_INK,
                  bgcolor: WEBSITE_PAGE_BACKGROUND_MUTED,
                }}
              >
                {dogs.length}
              </Box>
            </Box>
            <Typography sx={{ mt: 0.5, fontSize: 14.5, color: alpha(WEBSITE_INK, 0.6) }}>
              Profiles and vaccine details for each dog.
            </Typography>
          </Box>
          {onCreateDog && !adding ? (
            <Button
              type="button"
              variant="outlined"
              onClick={() => setAdding(true)}
              sx={SECONDARY_BUTTON_SX}
            >
              + Add dog
            </Button>
          ) : null}
        </Box>

        {dogsError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {dogsError}
          </Alert>
        ) : null}

        {adding ? (
          <Box sx={{ mt: 2.5, maxWidth: 560, ...CREAM_FIELDS_SX }}>
            <DogForm
              onSubmit={handleCreateDog}
              onCancel={() => setAdding(false)}
              submitLabel="Add dog"
            />
          </Box>
        ) : null}

        {!dogsLoading && dogs.length === 0 && !adding ? (
          <Typography sx={{ mt: 2.5, color: alpha(WEBSITE_INK, 0.6) }}>
            {onCreateDog ? 'No dogs yet. Add your first dog above.' : 'No dogs yet.'}
          </Typography>
        ) : null}

        <Box
          sx={{
            mt: 2.5,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          {dogs.map(dog => (
            <DogCard
              key={dog.id}
              dog={dog}
              token={token}
              onChanged={onDogsChanged}
              onRequestRemove={onRequestRemoveDog}
              onNotify={onNotify}
            />
          ))}
        </Box>
      </Box>

      {showHelp ? (
        <Box
          sx={{
            mt: { xs: 4, md: 5 },
            px: 2.5,
            py: 2,
            borderRadius: 3,
            bgcolor: WEBSITE_PAGE_BACKGROUND_MUTED,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: WEBSITE_INK,
          }}
        >
          <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 22 }} />
          <Typography sx={{ fontSize: 15 }}>
            Need help updating your details?{' '}
            <Link
              component={NextLink}
              href={CONTACT_PATH}
              underline="always"
              sx={{ fontWeight: 700, color: WEBSITE_INK }}
            >
              Contact Carrie →
            </Link>
          </Typography>
        </Box>
      ) : null}

      {below ? <Box sx={{ mt: { xs: 4, md: 5 } }}>{below}</Box> : null}
    </Box>
  );

  if (!embedded) return body;

  return (
    <Box
      sx={{
        bgcolor: WEBSITE_PAGE_BACKGROUND,
        color: WEBSITE_INK,
        borderRadius: 3,
        p: { xs: 2, md: 3 },
      }}
    >
      {body}
    </Box>
  );
}

ClientProfileView.propTypes = {
  showPageHeader: PropTypes.bool,
  embedded: PropTypes.bool,
  actions: PropTypes.node,
  petParent: PropTypes.object,
  missingProfile: PropTypes.bool,
  signedInName: PropTypes.string,
  token: PropTypes.string,
  onSaveProfile: PropTypes.func,
  onProfileSaved: PropTypes.func,
  onUploadPhoto: PropTypes.func,
  onRemovePhoto: PropTypes.func,
  dogs: PropTypes.arrayOf(PropTypes.object),
  dogsLoading: PropTypes.bool,
  dogsError: PropTypes.string,
  onCreateDog: PropTypes.func,
  onDogsChanged: PropTypes.func,
  onDogCreated: PropTypes.func,
  onRequestRemoveDog: PropTypes.func,
  onNotify: PropTypes.func,
  below: PropTypes.node,
  showHelp: PropTypes.bool,
};
