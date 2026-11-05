'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  SITE_IMAGE_UPLOAD_LIMIT_BYTES,
  UPLOADED_PHOTO_MAX_EDGE,
  prepareSiteImage,
} from '@/components/staff/prepare-site-image';
import { daycareImageSrc } from '@/lib/daycareApi';
import PhotoFrameDialog from './PhotoFrameDialog';
import { PHOTO_BUTTON_SX } from './pet-parent-styles';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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
  if (file.size > SITE_IMAGE_UPLOAD_LIMIT_BYTES) {
    return 'Photo must be 40 MB or smaller.';
  }
  return null;
}

function uploadLabel(busy, hasPhoto) {
  if (busy === 'upload') return 'Uploading…';
  if (hasPhoto) return 'Replace photo';
  return 'Upload photo';
}

function namedAction(label, name) {
  return name ? `${label} for ${name}` : label;
}

/**
 * Loads a daycare image with the auth token and exposes a blob object URL.
 * Parent images are private, so a plain img src cannot send the token.
 * @param {string|null|undefined} photoUrl
 * @param {string|null|undefined} token
 */
export function useDaycarePhoto(photoUrl, token) {
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
const ProfilePhoto = forwardRef(function ProfilePhoto(
  { photoUrl, token, name, title, subtitle, onUpload, onRemove, showControls = true },
  ref,
) {
  const src = useDaycarePhoto(photoUrl, token);
  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [frameFile, setFrameFile] = useState(null);
  const hasPhoto = Boolean(photoUrl);

  const handleFile = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const clientError = photoFileError(file);
    if (clientError) {
      setError(clientError);
      return;
    }

    setError(null);
    setFrameFile(file);
  };

  const handleFrameSave = async framed => {
    setBusy('upload');
    const prepared = await prepareSiteImage(framed, UPLOADED_PHOTO_MAX_EDGE);
    const message = await onUpload(prepared.file);
    setBusy(null);
    setFrameFile(null);
    if (message) setError(message);
  };

  const handleRemove = async () => {
    setBusy('remove');
    setError(null);
    const message = await onRemove();
    setBusy(null);
    if (message) setError(message);
  };

  useImperativeHandle(ref, () => ({
    openFilePicker() {
      inputRef.current?.click();
    },
    remove() {
      return handleRemove();
    },
  }));

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Avatar
        src={src || undefined}
        alt={name ? `${name} photo` : 'Profile photo'}
        sx={theme => ({
          width: 72,
          height: 72,
          bgcolor: alpha(theme.palette.text.primary, 0.12),
          color: 'text.primary',
          fontWeight: 600,
          fontSize: 22,
        })}
      >
        {initialsFor(name)}
      </Avatar>
      <Box>
        {title ? (
          <Typography
            component="h3"
            sx={{ fontSize: '1.125rem', fontWeight: 600, color: 'text.primary' }}
          >
            {title}
          </Typography>
        ) : null}
        {subtitle ? (
          <Typography
            component="p"
            sx={{ mt: title ? 0.5 : 0, color: 'text.secondary', fontSize: 14 }}
          >
            {subtitle}
          </Typography>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          aria-label={`Photo file for ${name || 'profile'}`}
          onChange={handleFile}
          disabled={Boolean(busy)}
        />
        {showControls ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: title || subtitle ? 1 : 0.5 }}>
            <Button
              size="small"
              disabled={Boolean(busy)}
              aria-label={namedAction(
                busy === 'upload' ? 'Uploading photo' : uploadLabel(busy, hasPhoto),
                name,
              )}
              onClick={() => inputRef.current?.click()}
              sx={PHOTO_BUTTON_SX}
            >
              {uploadLabel(busy, hasPhoto)}
            </Button>
            {hasPhoto ? (
              <Button
                size="small"
                color="error"
                onClick={handleRemove}
                disabled={Boolean(busy)}
                aria-label={namedAction(
                  busy === 'remove' ? 'Removing photo' : 'Remove photo',
                  name,
                )}
                sx={{ ...PHOTO_BUTTON_SX, color: 'error.main' }}
              >
                {busy === 'remove' ? 'Removing…' : 'Remove photo'}
              </Button>
            ) : null}
          </Box>
        ) : null}
        {!showControls && busy ? (
          <Typography component="p" sx={{ mt: 0.5, color: 'text.secondary', fontSize: 13 }}>
            {busy === 'upload' ? 'Uploading…' : 'Removing…'}
          </Typography>
        ) : null}
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
      <PhotoFrameDialog
        file={frameFile}
        onCancel={() => setFrameFile(null)}
        onSave={handleFrameSave}
      />
    </Box>
  );
});

ProfilePhoto.propTypes = {
  photoUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  token: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  showControls: PropTypes.bool,
};

export default ProfilePhoto;
