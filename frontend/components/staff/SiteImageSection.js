'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import GlassFormField from '@/components/design-studio/GlassFormField';
import { HOME_HERO_FADE_MS, HOME_HERO_SLIDE_MS } from '@/components/home-landing/home-hero-timing';
import {
  WEBSITE_ACCENT,
  WEBSITE_HEART,
  WEBSITE_INK,
  WEBSITE_PAGE_BACKGROUND_DARK,
} from '@/consts/website-theme';
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

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

const rowShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  alt: PropTypes.string,
  image_url: PropTypes.string,
  sort_order: PropTypes.number,
});

const dialogPaperSx = {
  borderRadius: '16px',
  bgcolor: 'background.paper',
  backgroundImage: 'none',
};

const thumbSx = {
  width: 56,
  height: 40,
  borderRadius: '8px',
  objectFit: 'cover',
  flexShrink: 0,
  bgcolor: 'action.hover',
};

const indexBadgeSx = {
  width: 28,
  height: 28,
  borderRadius: '8px',
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  border: '1px solid',
  borderColor: 'divider',
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1,
};

const previewMediaSx = {
  width: '100%',
  aspectRatio: '16 / 10',
  borderRadius: '12px',
  bgcolor: 'action.hover',
};

const orderButtonSx = {
  color: WEBSITE_ACCENT,
  border: '1px solid',
  borderColor: theme =>
    theme.palette.mode === 'dark' ? alpha('#ffffff', 0.14) : alpha(WEBSITE_INK, 0.14),
  borderRadius: '8px',
  p: 0.35,
  '&.Mui-disabled': {
    color: 'text.disabled',
    borderColor: 'transparent',
  },
};

const selectButtonSx = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 1.25,
  py: 0.85,
  pl: 1,
  pr: 0.5,
  border: 0,
  margin: 0,
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  borderRadius: '10px',
  '&:focus-visible': {
    outline: `2px solid ${WEBSITE_ACCENT}`,
    outlineOffset: 2,
  },
};

function neutralPillSx(theme) {
  const dark = theme.palette.mode === 'dark';
  return {
    borderRadius: 999,
    textTransform: 'none',
    fontWeight: 600,
    px: 1.75,
    py: 0.7,
    minHeight: 36,
    color: 'text.primary',
    borderColor: dark ? alpha('#ffffff', 0.28) : alpha(WEBSITE_INK, 0.28),
    '&:hover': {
      borderColor: WEBSITE_ACCENT,
      bgcolor: alpha(WEBSITE_ACCENT, 0.08),
    },
  };
}

function accentOutlinedSx(theme) {
  const dark = theme.palette.mode === 'dark';
  return {
    borderRadius: 999,
    textTransform: 'none',
    fontWeight: 600,
    px: 1.75,
    py: 0.7,
    minHeight: 36,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    borderColor: WEBSITE_ACCENT,
    color: dark ? WEBSITE_ACCENT : WEBSITE_INK,
    '&:hover': {
      borderColor: WEBSITE_ACCENT,
      bgcolor: alpha(WEBSITE_ACCENT, 0.12),
    },
  };
}

const accentFilledSx = {
  borderRadius: 999,
  textTransform: 'none',
  fontWeight: 700,
  px: 2,
  py: 0.7,
  minHeight: 36,
  boxShadow: 'none',
  bgcolor: WEBSITE_ACCENT,
  color: WEBSITE_INK,
  '&:hover': {
    bgcolor: WEBSITE_ACCENT,
    boxShadow: 'none',
    filter: 'brightness(1.05)',
  },
};

const removePillSx = {
  borderRadius: 999,
  textTransform: 'none',
  fontWeight: 600,
  px: 1.75,
  py: 0.7,
  minHeight: 36,
  borderColor: WEBSITE_HEART,
  color: WEBSITE_HEART,
  '&:hover': {
    borderColor: WEBSITE_HEART,
    bgcolor: alpha(WEBSITE_HEART, 0.1),
  },
};

function surfaceCardSx(theme) {
  const dark = theme.palette.mode === 'dark';
  return {
    borderRadius: '16px',
    border: '1px solid',
    borderColor: dark ? alpha('#ffffff', 0.08) : WEBSITE_PAGE_BACKGROUND_DARK,
    bgcolor: theme.palette.background.muted || theme.palette.background.paper,
    p: { xs: 1.5, sm: 2 },
    minWidth: 0,
  };
}

function rowFrameSx(selected) {
  return theme => {
    const dark = theme.palette.mode === 'dark';
    const idleBorder = dark ? alpha('#ffffff', 0.1) : alpha(WEBSITE_INK, 0.12);
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 0.25,
      borderRadius: '12px',
      border: '1px solid',
      borderColor: selected ? WEBSITE_ACCENT : idleBorder,
      boxShadow: selected ? `inset 0 0 0 1px ${WEBSITE_ACCENT}` : 'none',
      bgcolor: selected ? alpha(WEBSITE_ACCENT, dark ? 0.16 : 0.1) : 'transparent',
      pr: 0.5,
      transition: 'border-color 140ms ease, background-color 140ms ease',
      '&:hover': {
        borderColor: WEBSITE_ACCENT,
      },
    };
  };
}

function trimmedAlt(row) {
  return typeof row.alt === 'string' ? row.alt.trim() : '';
}

function imageLabel(row, index) {
  return trimmedAlt(row) || `image ${index + 1}`;
}

function displayTitle(row, index) {
  return trimmedAlt(row) || `Photo ${index + 1}`;
}

function formatSeconds(ms) {
  const rounded = Math.round(ms / 100) / 10;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(1);
}

function placementHint(placement) {
  const slideSeconds = formatSeconds(HOME_HERO_SLIDE_MS);
  const fadeSeconds = formatSeconds(HOME_HERO_FADE_MS);
  switch (placement) {
    case 'home_slide':
      return `Wide images work best. Slides hold for about ${slideSeconds} seconds, then crossfade over ${fadeSeconds} seconds.`;
    case 'gallery':
      return 'Set the order photos appear in the public gallery grid.';
    default: {
      const unexpected = placement;
      throw new Error(`Unexpected site image placement: ${unexpected}`);
    }
  }
}

function photoCountLabel(count) {
  if (count === 1) return '1 photo';
  return `${count} photos`;
}

function sameId(left, right) {
  return left === right || String(left) === String(right);
}

function resolveSelection(sorted, currentId, pending) {
  if (sorted.length === 0) return null;

  if (pending && pending.kind === 'id') {
    const match = sorted.find(row => sameId(row.id, pending.id));
    if (match) return match.id;
  }

  if (pending && (pending.kind === 'last' || pending.fallback === 'last')) {
    return sorted[sorted.length - 1].id;
  }

  if (currentId != null) {
    const current = sorted.find(row => sameId(row.id, currentId));
    if (current) return current.id;
  }

  return sorted[0].id;
}

function createdImageId(data) {
  if (!data || typeof data !== 'object') return null;
  const { id } = data;
  if (typeof id === 'number' && Number.isFinite(id)) return id;
  if (typeof id === 'string' && id.trim()) return id;
  return null;
}

function SiteImageRow({ row, index, count, selected, disabled, onSelect, onMove }) {
  const src = daycareImageSrc(row.image_url);
  const label = imageLabel(row, index);
  const title = displayTitle(row, index);

  return (
    <Box sx={rowFrameSx(selected)}>
      <Box
        component="button"
        type="button"
        onClick={() => onSelect(row.id)}
        aria-pressed={selected}
        sx={selectButtonSx}
      >
        <Box aria-hidden sx={indexBadgeSx}>
          {index + 1}
        </Box>
        {src ? <Box component="img" src={src} alt="" sx={thumbSx} /> : <Box sx={thumbSx} />}
        <Typography noWrap sx={{ fontWeight: 700, fontSize: 14, minWidth: 0 }}>
          {title}
        </Typography>
      </Box>
      <IconButton
        type="button"
        size="small"
        aria-label={`Move up ${label}`}
        disabled={disabled || index === 0}
        onClick={() => onMove(index, -1)}
        sx={orderButtonSx}
      >
        <KeyboardArrowUpIcon fontSize="small" />
      </IconButton>
      <IconButton
        type="button"
        size="small"
        aria-label={`Move down ${label}`}
        disabled={disabled || index === count - 1}
        onClick={() => onMove(index, 1)}
        sx={orderButtonSx}
      >
        <KeyboardArrowDownIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

SiteImageRow.propTypes = {
  row: rowShape.isRequired,
  index: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
};

function SiteImagePreview({ row, index, count, disabled, onEdit, onRemove }) {
  const src = daycareImageSrc(row.image_url);
  const title = displayTitle(row, index);
  const alt = trimmedAlt(row);
  const label = imageLabel(row, index);

  return (
    <Box sx={surfaceCardSx}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 1,
          mb: 1.5,
        }}
      >
        <Typography component="h3" sx={{ fontWeight: 700, fontSize: 15 }}>
          Image preview
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 13, whiteSpace: 'nowrap' }}>
          {`${index + 1} of ${count}`}
        </Typography>
      </Box>
      {src ? (
        <Box
          component="img"
          src={src}
          alt=""
          sx={{ ...previewMediaSx, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Box
          sx={{
            ...previewMediaSx,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary', px: 2, textAlign: 'center' }}>
            Preview unavailable
          </Typography>
        </Box>
      )}
      <Typography sx={{ mt: 1.5, fontWeight: 700, fontSize: 16, wordBreak: 'break-word' }}>
        {title}
      </Typography>
      <Typography sx={{ mt: 1.25, color: 'text.secondary', fontSize: 12, fontWeight: 700 }}>
        Alt text
      </Typography>
      <Typography
        sx={{
          mt: 0.5,
          fontSize: 14,
          lineHeight: 1.45,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: alt ? 'text.primary' : 'text.secondary',
        }}
      >
        {alt || 'No alt text yet.'}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        <Button
          type="button"
          variant="outlined"
          disabled={disabled}
          startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />}
          onClick={onEdit}
          sx={neutralPillSx}
        >
          Edit alt text
        </Button>
        <Button
          type="button"
          variant="outlined"
          disabled={disabled}
          startIcon={<DeleteOutlineIcon sx={{ fontSize: 18 }} />}
          aria-label={`Remove ${label}`}
          onClick={() => onRemove(row)}
          sx={removePillSx}
        >
          Remove
        </Button>
      </Box>
    </Box>
  );
}

SiteImagePreview.propTypes = {
  row: rowShape.isRequired,
  index: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

function SiteImageAddDialog({ title, open, disabled, onClose, onAdd }) {
  const [file, setFile] = useState(null);
  const [alt, setAlt] = useState('');
  const [localError, setLocalError] = useState(null);
  const fileInput = useRef(null);

  useEffect(() => {
    if (open) return;
    setFile(null);
    setAlt('');
    setLocalError(null);
    if (fileInput.current) fileInput.current.value = '';
  }, [open]);

  const handleSubmit = async event => {
    event.preventDefault();
    if (!file) {
      setLocalError({ message: 'Choose an image.', severity: 'warning' });
      return;
    }
    setLocalError(null);
    const message = await onAdd({ file, alt });
    if (message) {
      setLocalError({ message, severity: 'error' });
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={disabled ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>New image</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {localError ? <Alert severity={localError.severity}>{localError.message}</Alert> : null}
          <Button component="label" variant="outlined" disabled={disabled} sx={neutralPillSx}>
            {file ? file.name : 'Choose image'}
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPT}
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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={disabled}
            sx={neutralPillSx}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={disabled} sx={accentFilledSx}>
            Add image
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

SiteImageAddDialog.propTypes = {
  title: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

function EditAltDialog({ open, initialAlt, disabled, error, onClose, onSave }) {
  const [alt, setAlt] = useState(initialAlt);

  useEffect(() => {
    if (open) setAlt(initialAlt);
  }, [open, initialAlt]);

  return (
    <Dialog
      open={open}
      onClose={disabled ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Edit alt text</DialogTitle>
      <Box
        component="form"
        onSubmit={event => {
          event.preventDefault();
          onSave(alt);
        }}
      >
        <DialogContent sx={{ pt: 1 }}>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <GlassFormField
            label="Alt text"
            value={alt}
            onChange={event => setAlt(event.target.value)}
            disabled={disabled}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={disabled}
            sx={neutralPillSx}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={disabled} sx={accentFilledSx}>
            Save alt text
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

EditAltDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  initialAlt: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default function SiteImageSection({
  placement,
  title,
  headingId,
  emptyMessage,
  panelId,
  tabId,
}) {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [pending, setPending] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editError, setEditError] = useState(null);
  const pendingSelectRef = useRef(null);

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setLoading(true);
      const res = await listSiteImages(placement);
      if (!quiet) setLoading(false);
      const next = asRecordList(res.data);
      if (!res.ok || !next) {
        pendingSelectRef.current = null;
        setLoadError(siteImageErrorText(res.data, 'Could not load images.'));
        if (!quiet) {
          setRows([]);
          setSelectedId(null);
        }
        return null;
      }
      setLoadError(null);
      const sorted = [...next].sort(compareSiteImageOrder);
      const queuedSelection = pendingSelectRef.current;
      pendingSelectRef.current = null;
      setRows(sorted);
      setSelectedId(current => resolveSelection(sorted, current, queuedSelection));
      return sorted;
    },
    [placement],
  );

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const handleSelect = id => {
    setSelectedId(id);
  };

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
    const index = rows.findIndex(item => sameId(item.id, row.id));
    const neighbor = index >= 0 ? rows[index + 1] || rows[index - 1] || null : null;
    setActionError(null);
    setPending(true);
    const res = await deleteSiteImage(token, row.id);
    if (!res.ok) {
      setPending(false);
      setActionError(siteImageErrorText(res.data, 'Could not remove that image.'));
      return;
    }
    if (sameId(selectedId, row.id) && neighbor) {
      pendingSelectRef.current = { kind: 'id', id: neighbor.id };
    }
    await load({ quiet: true });
    setPending(false);
  };

  const handleAltSave = async alt => {
    if (!editRow) return;
    setEditError(null);
    setPending(true);
    const res = await updateSiteImage(token, editRow.id, {
      alt,
      sort_order: editRow.sort_order,
    });
    if (!res.ok) {
      setPending(false);
      setEditError(siteImageErrorText(res.data, 'Could not save that alt text.'));
      return;
    }
    setEditRow(null);
    await load({ quiet: true });
    setPending(false);
  };

  const handleAdd = async ({ file, alt }) => {
    setActionError(null);
    setPending(true);
    const res = await createSiteImage(token, { file, alt, placement });
    if (!res.ok) {
      setPending(false);
      return siteImageErrorText(res.data, 'Could not add that image.');
    }
    const createdId = createdImageId(res.data);
    pendingSelectRef.current =
      createdId != null ? { kind: 'id', id: createdId, fallback: 'last' } : { kind: 'last' };
    await load({ quiet: true });
    setPending(false);
    return null;
  };

  const selectedIndex = rows.findIndex(row => sameId(row.id, selectedId));
  const selectedRow = selectedIndex >= 0 ? rows[selectedIndex] : null;
  const showRows = !loading && rows.length > 0 && selectedRow;

  return (
    <Box
      component="section"
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      aria-busy={loading || undefined}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.25 }}>
            <Typography
              id={headingId}
              component="h2"
              sx={{ fontWeight: 700, fontSize: { xs: '1.35rem', sm: '1.6rem' }, lineHeight: 1.2 }}
            >
              {title}
            </Typography>
            {!loading ? (
              <Box
                component="span"
                sx={theme => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: 999,
                  px: 1.15,
                  py: 0.35,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                  color: 'text.secondary',
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? alpha('#ffffff', 0.06)
                      : alpha(WEBSITE_INK, 0.06),
                })}
              >
                {photoCountLabel(rows.length)}
              </Box>
            ) : null}
          </Box>
          <Typography
            sx={{
              mt: 1,
              color: 'text.secondary',
              fontSize: 14,
              lineHeight: 1.5,
              maxWidth: 640,
            }}
          >
            {placementHint(placement)}
          </Typography>
        </Box>
        <Button
          type="button"
          variant="outlined"
          disabled={pending}
          aria-haspopup="dialog"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          onClick={() => {
            setEditRow(null);
            setEditError(null);
            setAddOpen(true);
          }}
          sx={accentOutlinedSx}
        >
          New image
        </Button>
      </Box>

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
        <Typography
          sx={{ mt: 2.5, color: 'text.secondary', fontSize: 15, lineHeight: 1.5, maxWidth: 640 }}
        >
          {emptyMessage}
        </Typography>
      ) : null}

      {showRows ? (
        <Box
          sx={{
            mt: 2.5,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1.05fr)' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Box sx={surfaceCardSx}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 1,
                flexWrap: 'wrap',
                mb: 1.5,
              }}
            >
              <Typography component="h3" sx={{ fontWeight: 700, fontSize: 15 }}>
                Visitor order
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                First photo appears first
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {rows.map((row, index) => (
                <SiteImageRow
                  key={row.id}
                  row={row}
                  index={index}
                  count={rows.length}
                  selected={sameId(row.id, selectedId)}
                  disabled={pending}
                  onSelect={handleSelect}
                  onMove={handleMove}
                />
              ))}
            </Box>
          </Box>
          <SiteImagePreview
            row={selectedRow}
            index={selectedIndex}
            count={rows.length}
            disabled={pending}
            onEdit={() => {
              setAddOpen(false);
              setEditError(null);
              setEditRow(selectedRow);
            }}
            onRemove={handleRemove}
          />
        </Box>
      ) : null}

      <SiteImageAddDialog
        title={title}
        open={addOpen}
        disabled={pending}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />
      <EditAltDialog
        open={Boolean(editRow)}
        initialAlt={typeof editRow?.alt === 'string' ? editRow.alt : ''}
        disabled={pending}
        error={editError}
        onClose={() => {
          setEditRow(null);
          setEditError(null);
        }}
        onSave={handleAltSave}
      />
    </Box>
  );
}

SiteImageSection.propTypes = {
  placement: PropTypes.oneOf(['home_slide', 'gallery']).isRequired,
  title: PropTypes.string.isRequired,
  headingId: PropTypes.string.isRequired,
  emptyMessage: PropTypes.string.isRequired,
  panelId: PropTypes.string.isRequired,
  tabId: PropTypes.string.isRequired,
};
