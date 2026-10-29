'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { WEBSITE_INK } from '@/consts/website-theme';
import { daycareImageSrc } from '@/lib/daycareApi';
import { PHOTO_BUTTON_SX } from './pet-parent-styles';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;

function initialsFor(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

function photoFileError(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Use a JPEG, PNG, WebP, or GIF.';
  }
  if (file.size > MAX_BYTES) {
    return 'Photo must be 5 MB or smaller.';
  }
  return null;
}

function uploadLabel(busy, hasPhoto) {
  if (busy === 'upload') return 'Uploading…';
  if (hasPhoto) return 'Replace photo';
  return 'Upload photo';
}

/**
 * Loads a daycare image with the auth token and exposes a blob object URL.
 * Parent images are private, so a plain img src cannot send the token.
 * @param {string|null|undefined} photoUrl
 * @param {string|null|undefined} token
 */
function useDaycarePhoto(photoUrl, token) {
  const [objectUrl, setObjectUrl] = useState(null);
  const [loadedKey, setLoadedKey] = useState(null);
  const key = `${token || ''}|${photoUrl || ''}`;

  useEffect(() => {
    const path = daycareImageSrc(photoUrl);
    const controller = new AbortController();
    const holder = { current: null };
    let active = true;

    async function load() {
      if (!path) {
        setObjectUrl(null);
        setLoadedKey(key);
        return;
      }

      const headers = {};
      if (token) headers.Authorization = `Token ${token}`;

      try {
        const response = await fetch(path, {
          headers,
          credentials: 'omit',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Could not load photo');
        const blob = await response.blob();
        const nextUrl = URL.createObjectURL(blob);
        if (!active) {
          URL.revokeObjectURL(nextUrl);
          return;
        }
        holder.current = nextUrl;
        setObjectUrl(nextUrl);
        setLoadedKey(key);
      } catch (error) {
        if (!active || error?.name === 'AbortError') return;
        setObjectUrl(null);
        setLoadedKey(key);
      }
    }

    load();

    return () => {
      active = false;
      controller.abort();
      if (holder.current) URL.revokeObjectURL(holder.current);
    };
  }, [photoUrl, token, key]);

  return loadedKey === key ? objectUrl : null;
}

/** Thumbnail plus upload, replace, and remove for a pet parent or a dog. */
export default function ProfilePhoto({
  photoUrl,
  token,
  name,
  title,
  subtitle,
  onUpload,
  onRemove,
}) {
  const src = useDaycarePhoto(photoUrl, token);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const hasPhoto = Boolean(photoUrl);

  const handleFile = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const clientError = photoFileError(file);
    if (clientError) {
      setError(clientError);
      return;
    }

    setBusy('upload');
    setError(null);
    const message = await onUpload(file);
    setBusy(null);
    if (message) setError(message);
  };

  const handleRemove = async () => {
    setBusy('remove');
    setError(null);
    const message = await onRemove();
    setBusy(null);
    if (message) setError(message);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Avatar
        src={src || undefined}
        alt={name ? `${name} photo` : 'Profile photo'}
        sx={{
          width: 72,
          height: 72,
          bgcolor: alpha(WEBSITE_INK, 0.08),
          color: WEBSITE_INK,
          fontWeight: 600,
          fontSize: 22,
        }}
      >
        {initialsFor(name)}
      </Avatar>
      <Box>
        {title ? (
          <Typography
            component="h3"
            sx={{ fontSize: '1.125rem', fontWeight: 600, color: WEBSITE_INK }}
          >
            {title}
          </Typography>
        ) : null}
        {subtitle ? (
          <Typography
            component="p"
            sx={{ mt: title ? 0.5 : 0, color: alpha(WEBSITE_INK, 0.7), fontSize: 14 }}
          >
            {subtitle}
          </Typography>
        ) : null}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: title || subtitle ? 1 : 0.5 }}>
          <Button component="label" size="small" disabled={Boolean(busy)} sx={PHOTO_BUTTON_SX}>
            {uploadLabel(busy, hasPhoto)}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={handleFile}
              disabled={Boolean(busy)}
            />
          </Button>
          {hasPhoto ? (
            <Button
              size="small"
              color="error"
              onClick={handleRemove}
              disabled={Boolean(busy)}
              sx={{ ...PHOTO_BUTTON_SX, color: 'error.main' }}
            >
              {busy === 'remove' ? 'Removing…' : 'Remove photo'}
            </Button>
          ) : null}
        </Box>
        {error ? (
          <Typography
            component="p"
            role="alert"
            sx={{ mt: 0.5, color: 'error.main', fontSize: 13 }}
          >
            {error}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

ProfilePhoto.propTypes = {
  photoUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  token: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
