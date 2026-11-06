'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Button, IconButton, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import {
  SITE_IMAGE_UPLOAD_LIMIT_BYTES,
  UPLOADED_PHOTO_MAX_EDGE,
  prepareSiteImage,
} from '@/components/staff/prepare-site-image';
import { WEBSITE_INK, WEBSITE_PAGE_BACKGROUND_DARK, WEBSITE_PAPER } from '@/consts/website-theme';
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
  {
    photoUrl,
    token,
    name,
    title,
    subtitle,
    onUpload,
    onRemove,
    showControls = true,
    variant = 'inline',
  },
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

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      hidden
      aria-label={`Photo file for ${name || 'profile'}`}
      onChange={handleFile}
      disabled={Boolean(busy)}
    />
  );

  const frameDialog = (
    <PhotoFrameDialog
      file={frameFile}
      onCancel={() => setFrameFile(null)}
      onSave={handleFrameSave}
    />
  );

  const errorText = error ? (
    <Typography component="p" role="alert" sx={{ mt: 0.5, color: 'error.main', fontSize: 13 }}>
      {error}
    </Typography>
  ) : null;

  if (variant === 'account' || variant === 'dog') {
    const isDog = variant === 'dog';
    const size = isDog ? 76 : 112;
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isDog ? 'flex-start' : 'center',
          width: isDog ? size : 128,
          flexShrink: 0,
        }}
      >
        <Box sx={{ position: 'relative', width: size, height: size }}>
          <Avatar
            src={src || undefined}
            variant={isDog ? 'rounded' : 'circular'}
            alt={name ? `${name} photo` : 'Profile photo'}
            sx={{
              width: size,
              height: size,
              borderRadius: isDog ? '14px' : '50%',
              bgcolor: WEBSITE_PAGE_BACKGROUND_DARK,
              color: WEBSITE_INK,
              fontWeight: 650,
              fontSize: isDog ? 20 : 32,
            }}
          >
            {initialsFor(name)}
          </Avatar>
          <IconButton
            type="button"
            aria-label={namedAction('Photo camera', name)}
            disabled={Boolean(busy)}
            onClick={() => inputRef.current?.click()}
            sx={{
              position: 'absolute',
              right: isDog ? -6 : -2,
              bottom: isDog ? -6 : -2,
              width: 30,
              height: 30,
              bgcolor: WEBSITE_PAPER,
              color: WEBSITE_INK,
              border: `1px solid ${alpha(WEBSITE_INK, 0.16)}`,
              '&:hover': { bgcolor: WEBSITE_PAPER },
            }}
          >
            <PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
        {fileInput}
        {variant === 'account' ? (
          <>
            <Button
              type="button"
              disabled={Boolean(busy)}
              aria-label={namedAction(busy === 'upload' ? 'Uploading photo' : 'Change photo', name)}
              onClick={() => inputRef.current?.click()}
              sx={{
                mt: 1.25,
                px: 0.5,
                minWidth: 0,
                textTransform: 'none',
                textDecoration: 'underline',
                color: WEBSITE_INK,
                fontWeight: 650,
                fontSize: 14,
              }}
            >
              {busy === 'upload' ? 'Uploading…' : 'Change photo'}
            </Button>
            {hasPhoto ? (
              <Button
                type="button"
                color="error"
                onClick={handleRemove}
                disabled={Boolean(busy)}
                aria-label={namedAction(
                  busy === 'remove' ? 'Removing photo' : 'Remove photo',
                  name,
                )}
                sx={{
                  px: 0.5,
                  minWidth: 0,
                  textTransform: 'none',
                  color: 'error.main',
                  fontSize: 13,
                }}
              >
                {busy === 'remove' ? 'Removing…' : 'Remove photo'}
              </Button>
            ) : null}
          </>
        ) : null}
        {isDog && busy ? (
          <Typography component="p" sx={{ mt: 0.5, color: 'text.secondary', fontSize: 13 }}>
            {busy === 'upload' ? 'Uploading…' : 'Removing…'}
          </Typography>
        ) : null}
        {errorText}
        {frameDialog}
      </Box>
    );
  }

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
        {fileInput}
        {showControls ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: title || subtitle ? 1 : 0.5 }}>
            <Button
              type="button"
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
                type="button"
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
        {errorText}
      </Box>
      {frameDialog}
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
  variant: PropTypes.oneOf(['inline', 'account', 'dog']),
};

export default ProfilePhoto;
