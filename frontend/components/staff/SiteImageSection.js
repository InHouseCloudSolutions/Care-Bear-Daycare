'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { Alert, Box, Button, Chip, Snackbar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HOME_HERO_FADE_MS, HOME_HERO_SLIDE_MS } from '@/components/home-landing/home-hero-timing';
import { WEBSITE_ACCENT } from '@/consts/website-theme';
import { useAuth } from '@/contexts/AuthContext';
import {
  createSiteImage,
  deleteSiteImage,
  listSiteImages,
  replaceSiteImage,
  updateSiteImage,
} from '@/lib/daycareApi';
import { compareSiteImageOrder } from '@/utils/siteImages';
import { asRecordList } from './staff-desk';
import { moveRow, reorderPatches, siteImageErrorText, sortOrderSwapPatches } from './site-images';
import { accentFilledSx, hairline, neutralPillSx } from './site-image-styles';
import {
  DropzoneCopy,
  PhotoDropzone,
  SiteImageCard,
  SiteImageGridSkeleton,
  trimmedAlt,
} from './SiteImageParts';
import {
  EditAltDialog,
  PhotoViewerDialog,
  RemoveImageDialog,
  SiteImageAddDialog,
  SiteImageReplaceDialog,
} from './SiteImageDialogs';

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
      return `The rotating banner at the top of the home page. Wide images work best. Slides hold for about ${slideSeconds} seconds, then crossfade over ${fadeSeconds} seconds.`;
    case 'gallery':
      return 'The photo grid on the public Gallery page, shown in this order.';
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

function createdImageId(data) {
  if (!data || typeof data !== 'object') return null;
  const { id } = data;
  if (typeof id === 'number' && Number.isFinite(id)) return id;
  if (typeof id === 'string' && id.trim()) return id;
  return null;
}

function LiveStatus({ live, children }) {
  const Icon = live ? CheckCircleRoundedIcon : InfoOutlinedIcon;
  return (
    <Box
      sx={theme => ({
        mt: 2.5,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        px: 2,
        py: 1.5,
        borderRadius: '14px',
        border: '1px solid',
        borderColor: live ? hairline(theme, 0.1) : alpha(WEBSITE_ACCENT, 0.45),
        bgcolor: live
          ? theme.palette.background.muted || 'action.hover'
          : alpha(WEBSITE_ACCENT, theme.palette.mode === 'dark' ? 0.12 : 0.14),
      })}
    >
      <Icon
        aria-hidden
        sx={{ fontSize: 20, mt: '1px', color: live ? 'success.main' : WEBSITE_ACCENT }}
      />
      <Box sx={{ fontSize: 14, lineHeight: 1.5 }}>{children}</Box>
    </Box>
  );
}

LiveStatus.propTypes = {
  live: PropTypes.bool,
  children: PropTypes.node,
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [pending, setPending] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addFile, setAddFile] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [editError, setEditError] = useState(null);
  const [replaceRow, setReplaceRow] = useState(null);
  const [removeRow, setRemoveRow] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [notice, setNotice] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const highlightTimer = useRef(null);

  const isSlide = placement === 'home_slide';
  const where = isSlide ? 'home page' : 'gallery';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setLoading(true);
      const res = await listSiteImages(placement);
      if (!quiet) setLoading(false);
      const next = asRecordList(res.data);
      if (!res.ok || !next) {
        setLoadError(siteImageErrorText(res.data, 'Could not load images.'));
        if (!quiet) setRows([]);
        return null;
      }
      setLoadError(null);
      const sorted = [...next].sort(compareSiteImageOrder);
      setRows(sorted);
      return sorted;
    },
    [placement],
  );

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  useEffect(() => () => clearTimeout(highlightTimer.current), []);

  const flash = id => {
    clearTimeout(highlightTimer.current);
    setHighlightId(id);
    highlightTimer.current = setTimeout(() => setHighlightId(null), 2400);
  };

  const sendPatches = async patches => {
    for (const patch of patches) {
      // Sequential on purpose: each row's sort_order must land before the next.
      // eslint-disable-next-line no-await-in-loop
      const res = await updateSiteImage(token, patch.id, patch.body);
      if (!res.ok) return res;
    }
    return null;
  };

  const reorder = async (from, to) => {
    if (from === to || to < 0 || to >= rows.length) return;
    const patches =
      Math.abs(from - to) === 1
        ? sortOrderSwapPatches(rows[from], rows[to])
        : reorderPatches(rows, from, to);
    const moved = rows[from];
    setActionError(null);
    setPending(true);
    setRows(current => moveRow(current, from, to));
    const failed = await sendPatches(patches);
    if (failed) {
      setActionError(siteImageErrorText(failed.data, 'Could not reorder those images.'));
    } else {
      setNotice('Order saved');
      flash(moved.id);
    }
    await load({ quiet: true });
    setPending(false);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || sameId(active.id, over.id)) return;
    const from = rows.findIndex(row => sameId(row.id, active.id));
    const to = rows.findIndex(row => sameId(row.id, over.id));
    if (from >= 0 && to >= 0) reorder(from, to);
  };

  const handleRemove = async row => {
    setActionError(null);
    setPending(true);
    const res = await deleteSiteImage(token, row.id);
    if (!res.ok) {
      setPending(false);
      setRemoveRow(null);
      setActionError(siteImageErrorText(res.data, 'Could not remove that image.'));
      return;
    }
    setRemoveRow(null);
    await load({ quiet: true });
    setPending(false);
    setNotice('Photo removed');
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
    const savedId = editRow.id;
    setEditRow(null);
    await load({ quiet: true });
    setPending(false);
    setNotice('Alt text saved');
    flash(savedId);
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
    const sorted = await load({ quiet: true });
    setPending(false);
    setNotice(`Photo added to the ${where}`);
    const fallback = sorted && sorted.length ? sorted[sorted.length - 1].id : null;
    flash(createdId ?? fallback);
    return null;
  };

  const handleReplace = async file => {
    if (!replaceRow) return 'Could not replace that image.';
    const savedId = replaceRow.id;
    setActionError(null);
    setPending(true);
    const res = await replaceSiteImage(token, savedId, file);
    if (!res.ok) {
      setPending(false);
      return siteImageErrorText(res.data, 'Could not replace that image.');
    }
    await load({ quiet: true });
    setPending(false);
    setNotice('Photo replaced');
    flash(savedId);
    return null;
  };

  const openAdd = (file = null) => {
    setEditRow(null);
    setEditError(null);
    setReplaceRow(null);
    setAddFile(file);
    setAddOpen(true);
  };

  const missingAltCount = rows.filter(row => !trimmedAlt(row)).length;
  const hasRows = !loading && rows.length > 0;
  const isEmpty = !loading && !loadError && rows.length === 0;
  const removeIndex = removeRow ? rows.findIndex(row => sameId(row.id, removeRow.id)) : -1;

  return (
    <Box
      component="section"
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      aria-busy={loading || undefined}
      sx={{ pt: 3 }}
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
        <Box sx={{ minWidth: 0, flex: '1 1 360px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.25 }}>
            <Typography
              id={headingId}
              component="h2"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                letterSpacing: '0.02em',
              }}
            >
              {title}
            </Typography>
            {!loading ? (
              <Chip
                size="small"
                label={photoCountLabel(rows.length)}
                sx={theme => ({
                  fontWeight: 700,
                  fontSize: 12,
                  color: 'text.secondary',
                  bgcolor: hairline(theme, 0.07),
                })}
              />
            ) : null}
          </Box>
          <Typography
            sx={{
              mt: 0.75,
              color: 'text.secondary',
              fontSize: 14,
              lineHeight: 1.55,
              maxWidth: 620,
            }}
          >
            {placementHint(placement)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {isSlide && rows.length > 0 ? (
            <Button
              type="button"
              variant="outlined"
              startIcon={<PlayArrowRoundedIcon />}
              onClick={() => setViewer({ index: 0, autoplay: true })}
              sx={neutralPillSx}
            >
              Preview slideshow
            </Button>
          ) : null}
          <Button
            type="button"
            variant="contained"
            disabled={pending}
            aria-haspopup="dialog"
            startIcon={<AddIcon />}
            onClick={() => openAdd()}
            sx={accentFilledSx}
          >
            New image
          </Button>
        </Box>
      </Box>

      {loadError ? (
        <Alert severity="error" sx={{ mt: 2.5 }}>
          {loadError}
        </Alert>
      ) : null}
      {actionError ? (
        <Alert severity="error" sx={{ mt: 2.5 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      ) : null}

      {isEmpty ? (
        <LiveStatus live={false}>
          <Typography sx={{ fontSize: 14, lineHeight: 1.5 }}>{emptyMessage}</Typography>
        </LiveStatus>
      ) : null}
      {hasRows ? (
        <LiveStatus live>
          <Typography component="span" sx={{ fontSize: 14, fontWeight: 600 }}>
            {`Visitors see these ${photoCountLabel(rows.length)} on the ${where}, in this order.`}
          </Typography>{' '}
          <Typography component="span" sx={{ fontSize: 14, color: 'text.secondary' }}>
            Drag a photo to change the order. Changes save right away.
          </Typography>
          {missingAltCount > 0 ? (
            <Typography sx={{ fontSize: 13.5, mt: 0.5, color: 'text.secondary' }}>
              {missingAltCount === 1
                ? '1 photo still needs alt text.'
                : `${missingAltCount} photos still need alt text.`}
            </Typography>
          ) : null}
        </LiveStatus>
      ) : null}

      {isEmpty ? (
        <PhotoDropzone
          inputLabel={`Add a photo to ${title}`}
          disabled={pending}
          onFile={file => openAdd(file)}
          sx={{ mt: 2.5, py: { xs: 6, md: 9 }, px: 2 }}
        >
          <DropzoneCopy />
          <Typography sx={{ color: 'text.secondary', fontSize: 13, maxWidth: 420, mt: 0.5 }}>
            {`Your first photo replaces the built-in ${where} photos.`}
          </Typography>
        </PhotoDropzone>
      ) : null}

      {loading || hasRows ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rows.map(row => row.id)} strategy={rectSortingStrategy}>
            <Box
              component={loading ? 'ul' : 'ol'}
              aria-label={loading ? undefined : `${title} in visitor order`}
              sx={{
                mt: 2.5,
                mb: 0,
                p: 0,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              {loading ? (
                <SiteImageGridSkeleton placement={placement} />
              ) : (
                rows.map((row, index) => (
                  <SiteImageCard
                    key={row.id}
                    row={row}
                    index={index}
                    placement={placement}
                    disabled={pending}
                    highlighted={highlightId != null && sameId(highlightId, row.id)}
                    onView={at => setViewer({ index: at, autoplay: false })}
                    onEdit={target => {
                      setAddOpen(false);
                      setReplaceRow(null);
                      setEditError(null);
                      setEditRow(target);
                    }}
                    onReplace={target => {
                      setAddOpen(false);
                      setEditRow(null);
                      setEditError(null);
                      setReplaceRow(target);
                    }}
                    onRemove={setRemoveRow}
                  />
                ))
              )}
              {hasRows ? (
                <Box component="li" sx={{ listStyle: 'none', display: 'flex' }}>
                  <PhotoDropzone
                    inputLabel={`Add a photo to ${title}`}
                    disabled={pending}
                    onFile={file => openAdd(file)}
                    sx={{ flex: 1, minHeight: 200, px: 2, py: 3 }}
                  >
                    <DropzoneCopy compact />
                  </PhotoDropzone>
                </Box>
              ) : null}
            </Box>
          </SortableContext>
        </DndContext>
      ) : null}

      <SiteImageAddDialog
        title={title}
        placement={placement}
        open={addOpen}
        initialFile={addFile}
        disabled={pending}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />
      <SiteImageReplaceDialog
        title={title}
        placement={placement}
        row={replaceRow}
        disabled={pending}
        onClose={() => setReplaceRow(null)}
        onReplace={handleReplace}
      />
      <EditAltDialog
        row={editRow}
        placement={placement}
        disabled={pending}
        error={editError}
        onClose={() => {
          setEditRow(null);
          setEditError(null);
        }}
        onSave={handleAltSave}
      />
      <RemoveImageDialog
        row={removeRow}
        index={Math.max(removeIndex, 0)}
        placement={placement}
        isLast={rows.length === 1}
        disabled={pending}
        onClose={() => setRemoveRow(null)}
        onConfirm={handleRemove}
      />
      <PhotoViewerDialog
        rows={rows}
        placement={placement}
        startIndex={viewer ? viewer.index : null}
        autoplay={Boolean(viewer?.autoplay)}
        onClose={() => setViewer(null)}
      />
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={2600}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') setNotice(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setNotice(null)}
          sx={{ borderRadius: 999, fontWeight: 600, alignItems: 'center' }}
        >
          {notice}
        </Alert>
      </Snackbar>
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
