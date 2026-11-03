'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, Typography } from '@mui/material';
import GlassFormField from '@/components/design-studio/GlassFormField';
import { SECONDARY_BUTTON_SX } from '@/components/pet-parent/pet-parent-styles';
import { useAuth } from '@/contexts/AuthContext';
import {
  createSiteImage,
  daycareImageSrc,
  deleteSiteImage,
  listSiteImages,
  updateSiteImage,
} from '@/lib/daycareApi';
import { compareSiteImageOrder } from '@/utils/siteImages';
import { asRecordList } from './staff-desk';
import { siteImageErrorText, sortOrderSwapPatches } from './site-images';

const PREVIEW_SX = {
  width: 160,
  height: 104,
  objectFit: 'cover',
  borderRadius: 1,
  bgcolor: 'action.hover',
  flexShrink: 0,
};

function imageLabel(row, index) {
  const alt = typeof row.alt === 'string' ? row.alt.trim() : '';
  return alt || `image ${index + 1}`;
}

function SiteImageRow({ row, index, count, disabled, onMove, onRemove, onAltCommit }) {
  const [alt, setAlt] = useState(row.alt ?? '');
  const src = daycareImageSrc(row.image_url);
  const label = imageLabel(row, index);

  useEffect(() => {
    setAlt(row.alt ?? '');
  }, [row.alt]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      {src ? (
        <Box component="img" src={src} alt={row.alt || ''} sx={PREVIEW_SX} />
      ) : (
        <Box sx={{ ...PREVIEW_SX, display: 'grid', placeItems: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', px: 1 }}>
            Preview unavailable
          </Typography>
        </Box>
      )}
      <GlassFormField
        label="Alt text"
        value={alt}
        onChange={event => setAlt(event.target.value)}
        onBlur={() => {
          if (disabled || alt === (row.alt ?? '')) return;
          onAltCommit(row, alt);
        }}
        disabled={disabled}
        fullWidth
        sx={{ flex: '1 1 220px', maxWidth: 420 }}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant="outlined"
          sx={SECONDARY_BUTTON_SX}
          disabled={disabled || index === 0}
          aria-label={`Move up ${label}`}
          onClick={() => onMove(index, -1)}
        >
          Move up
        </Button>
        <Button
          variant="outlined"
          sx={SECONDARY_BUTTON_SX}
          disabled={disabled || index === count - 1}
          aria-label={`Move down ${label}`}
          onClick={() => onMove(index, 1)}
        >
          Move down
        </Button>
        <Button
          variant="outlined"
          sx={SECONDARY_BUTTON_SX}
          disabled={disabled}
          aria-label={`Remove ${label}`}
          onClick={() => onRemove(row)}
        >
          Remove
        </Button>
      </Box>
    </Box>
  );
}

SiteImageRow.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    alt: PropTypes.string,
    image_url: PropTypes.string,
    sort_order: PropTypes.number,
  }).isRequired,
  index: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  onMove: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onAltCommit: PropTypes.func.isRequired,
};

function SiteImageAddForm({ title, disabled, onAdd }) {
  const [file, setFile] = useState(null);
  const [alt, setAlt] = useState('');
  const [localError, setLocalError] = useState(null);
  const fileInput = useRef(null);

  const handleSubmit = async event => {
    event.preventDefault();
    if (!file) {
      setLocalError('Choose an image.');
      return;
    }
    setLocalError(null);
    const saved = await onAdd({ file, alt });
    if (saved) {
      setFile(null);
      setAlt('');
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 420 }}
    >
      {localError ? <Alert severity="warning">{localError}</Alert> : null}
      <Button component="label" variant="outlined" disabled={disabled} sx={SECONDARY_BUTTON_SX}>
        {file ? file.name : 'Choose image'}
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          aria-label={`Choose image for ${title}`}
          disabled={disabled}
          onChange={event => {
            setFile(event.target.files?.[0] || null);
            setLocalError(null);
          }}
        />
      </Button>
      <GlassFormField
        label="Alt text"
        value={alt}
        onChange={event => setAlt(event.target.value)}
        disabled={disabled}
        fullWidth
      />
      <Button type="submit" variant="outlined" disabled={disabled} sx={SECONDARY_BUTTON_SX}>
        Add image
      </Button>
    </Box>
  );
}

SiteImageAddForm.propTypes = {
  title: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onAdd: PropTypes.func.isRequired,
};

export default function SiteImageSection({ placement, title, headingId, emptyMessage }) {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setLoading(true);
      const res = await listSiteImages(placement);
      if (!quiet) setLoading(false);
      const next = asRecordList(res.data);
      if (!res.ok || !next) {
        setLoadError(siteImageErrorText(res.data, 'Could not load images.'));
        if (!quiet) setRows([]);
        return;
      }
      setLoadError(null);
      setRows([...next].sort(compareSiteImageOrder));
    },
    [placement],
  );

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const handleMove = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const [first, second] = sortOrderSwapPatches(rows[index], rows[target]);
    setActionError(null);
    setPending(true);
    const firstRes = await updateSiteImage(token, first.id, first.body);
    if (!firstRes.ok) {
      setPending(false);
      setActionError(siteImageErrorText(firstRes.data, 'Could not reorder those images.'));
      return;
    }
    const secondRes = await updateSiteImage(token, second.id, second.body);
    if (!secondRes.ok) {
      setActionError(siteImageErrorText(secondRes.data, 'Could not reorder those images.'));
      await load({ quiet: true });
      setPending(false);
      return;
    }
    await load({ quiet: true });
    setPending(false);
  };

  const handleRemove = async row => {
    setActionError(null);
    setPending(true);
    const res = await deleteSiteImage(token, row.id);
    if (!res.ok) {
      setPending(false);
      setActionError(siteImageErrorText(res.data, 'Could not remove that image.'));
      return;
    }
    await load({ quiet: true });
    setPending(false);
  };

  const handleAlt = async (row, alt) => {
    setActionError(null);
    setPending(true);
    const res = await updateSiteImage(token, row.id, { alt, sort_order: row.sort_order });
    setPending(false);
    if (!res.ok) {
      setActionError(siteImageErrorText(res.data, 'Could not save that alt text.'));
      return;
    }
    await load({ quiet: true });
  };

  const handleAdd = async ({ file, alt }) => {
    setActionError(null);
    setPending(true);
    const res = await createSiteImage(token, { file, alt, placement });
    setPending(false);
    if (!res.ok) {
      setActionError(siteImageErrorText(res.data, 'Could not add that image.'));
      return false;
    }
    await load({ quiet: true });
    return true;
  };

  return (
    <Box component="section" aria-labelledby={headingId}>
      <Typography id={headingId} component="h2" variant="h5" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>

      {loadError ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {loadError}
        </Alert>
      ) : null}
      {actionError ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {actionError}
        </Alert>
      ) : null}

      {loading ? (
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading images…</Typography>
      ) : null}

      {!loading && !loadError && rows.length === 0 ? (
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>{emptyMessage}</Typography>
      ) : null}

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rows.map((row, index) => (
          <SiteImageRow
            key={row.id}
            row={row}
            index={index}
            count={rows.length}
            disabled={pending}
            onMove={handleMove}
            onRemove={handleRemove}
            onAltCommit={handleAlt}
          />
        ))}
      </Box>

      {!loading ? <SiteImageAddForm title={title} disabled={pending} onAdd={handleAdd} /> : null}
    </Box>
  );
}

SiteImageSection.propTypes = {
  placement: PropTypes.oneOf(['home_slide', 'gallery']).isRequired,
  title: PropTypes.string.isRequired,
  headingId: PropTypes.string.isRequired,
  emptyMessage: PropTypes.string.isRequired,
};
