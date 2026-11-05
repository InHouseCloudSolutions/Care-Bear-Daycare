'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HOME_HERO_FADE_MS, HOME_HERO_SLIDE_MS } from '@/components/home-landing/home-hero-timing';
import { daycareImageSrc } from '@/lib/daycareApi';
import { formatFileSize, siteImageFileProblem } from './site-images';
import {
  SITE_IMAGE_MAX_EDGE,
  SITE_IMAGE_UPLOAD_LIMIT_BYTES,
  prepareSiteImage,
} from './prepare-site-image';
import { accentFilledSx, dialogPaperSx, neutralPillSx, removeFilledSx } from './site-image-styles';
import { DropzoneCopy, PhotoDropzone, displayTitle, mediaAspect, rowShape } from './SiteImageParts';

const ALT_HELPER =
  'Describe the photo for people using screen readers, e.g. “Two golden retrievers playing tug in the yard.”';

function useObjectUrl(file) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      setUrl(null);
      return undefined;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

function DialogHeading({ children, onClose, disabled }) {
  return (
    <DialogTitle
      sx={{ fontWeight: 700, pr: 7, pb: 1, fontSize: '1.2rem', letterSpacing: '0.01em' }}
    >
      {children}
      <IconButton
        aria-label="Close"
        onClick={onClose}
        disabled={disabled}
        sx={{ position: 'absolute', top: 12, right: 12 }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
}

DialogHeading.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

function FileSummary({ file, shape, prepared, preparing }) {
  if (preparing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
        <CircularProgress size={12} color="inherit" />
        <Typography sx={{ fontSize: 12.5 }}>
          {`${formatFileSize(file.size)} · optimizing for the web…`}
        </Typography>
      </Box>
    );
  }
  if (prepared?.optimized) {
    const resized =
      prepared.outputWidth !== prepared.width || prepared.outputHeight !== prepared.height;
    return (
      <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
        <Box component="span" sx={{ color: 'success.main', fontWeight: 700 }}>
          {`${formatFileSize(file.size)} → ${formatFileSize(prepared.file.size)}`}
        </Box>
        {` · ${prepared.outputWidth} × ${prepared.outputHeight}px`}
        {resized ? ` (resized from ${prepared.width} × ${prepared.height})` : ''}
      </Typography>
    );
  }
  return (
    <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
      {[formatFileSize(file.size), shape ? `${shape.width} × ${shape.height}px` : null]
        .filter(Boolean)
        .join(' · ')}
    </Typography>
  );
}

FileSummary.propTypes = {
  file: PropTypes.object.isRequired,
  shape: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number }),
  prepared: PropTypes.shape({
    file: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    outputWidth: PropTypes.number,
    outputHeight: PropTypes.number,
    optimized: PropTypes.bool,
  }),
  preparing: PropTypes.bool,
};

/**
 * Shared file pick for add and replace. Checks type and size, then prepares the
 * upload the same way. Callers own alt text — this hook never reads it.
 */
function usePreparedSiteImageFile(placement) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [shape, setShape] = useState(null);
  const [prepared, setPrepared] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const preparation = useRef(null);
  const previewUrl = useObjectUrl(file);

  const cancel = useCallback(() => {
    preparation.current = null;
  }, []);

  const pick = useCallback(
    next => {
      setFile(next);
      setShape(null);
      setPrepared(null);
      const problem = siteImageFileProblem(next);
      setError(problem ? { message: problem, severity: 'error' } : null);
      if (!next || problem) {
        preparation.current = null;
        setPreparing(false);
        return;
      }
      const job = {};
      preparation.current = job;
      setPreparing(true);
      job.promise = prepareSiteImage(next, SITE_IMAGE_MAX_EDGE[placement]).then(result => {
        if (preparation.current !== job) return result;
        setPrepared(result);
        setPreparing(false);
        if (result.width) setShape({ width: result.width, height: result.height });
        if (result.file.size > SITE_IMAGE_UPLOAD_LIMIT_BYTES) {
          setError({ message: 'Image must be 40 MB or smaller.', severity: 'error' });
        }
        return result;
      });
    },
    [placement],
  );

  const uploadFile = useCallback(async () => {
    if (!file) {
      setError({ message: 'Choose an image.', severity: 'warning' });
      return null;
    }
    const problem = siteImageFileProblem(file);
    if (problem) {
      setError({ message: problem, severity: 'error' });
      return null;
    }
    const result = preparation.current ? await preparation.current.promise : null;
    const upload = result?.file || file;
    if (upload.size > SITE_IMAGE_UPLOAD_LIMIT_BYTES) {
      setError({ message: 'Image must be 40 MB or smaller.', severity: 'error' });
      return null;
    }
    setError(null);
    return upload;
  }, [file]);

  return {
    file,
    error,
    setError,
    shape,
    setShape,
    prepared,
    preparing,
    previewUrl,
    pick,
    cancel,
    uploadFile,
  };
}

function SiteImageFileChooser({
  title,
  placement,
  file,
  previewUrl,
  shape,
  onShape,
  prepared,
  preparing,
  disabled,
  onFile,
}) {
  const tallForSlides = placement === 'home_slide' && shape && shape.width / shape.height < 1.3;
  const inputLabel = `Choose image for ${title}`;

  if (file) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {previewUrl ? (
          <Box
            component="img"
            src={previewUrl}
            alt=""
            onLoad={event =>
              onShape({
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              })
            }
            sx={{
              width: '100%',
              aspectRatio: mediaAspect(placement),
              objectFit: 'cover',
              borderRadius: '14px',
              display: 'block',
              bgcolor: 'action.hover',
            }}
          />
        ) : null}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontWeight: 600, fontSize: 14 }}>
              {file.name}
            </Typography>
            <FileSummary file={file} shape={shape} prepared={prepared} preparing={preparing} />
          </Box>
          <PhotoDropzone
            inputLabel={inputLabel}
            disabled={disabled}
            onFile={onFile}
            sx={theme => ({
              ...neutralPillSx(theme),
              flexDirection: 'row',
              border: '1px solid',
              borderColor: alpha(theme.palette.text.primary, 0.28),
              bgcolor: 'transparent',
              fontSize: 14,
              gap: 0.75,
            })}
          >
            <SwapHorizIcon sx={{ fontSize: 18 }} />
            Replace
          </PhotoDropzone>
        </Box>
        {tallForSlides ? (
          <Alert severity="info" sx={{ mt: 0.5 }}>
            This photo is taller than the home page banner, so the top and bottom will be cropped. A
            landscape photo will look better.
          </Alert>
        ) : null}
      </Box>
    );
  }

  return (
    <PhotoDropzone
      inputLabel={inputLabel}
      disabled={disabled}
      onFile={onFile}
      sx={{ py: 5, px: 2 }}
    >
      <DropzoneCopy />
      {placement === 'home_slide' ? (
        <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
          Wide, landscape photos work best for the home page banner.
        </Typography>
      ) : null}
    </PhotoDropzone>
  );
}

SiteImageFileChooser.propTypes = {
  title: PropTypes.string.isRequired,
  placement: PropTypes.oneOf(['home_slide', 'gallery']).isRequired,
  file: PropTypes.object,
  previewUrl: PropTypes.string,
  shape: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number }),
  onShape: PropTypes.func.isRequired,
  prepared: FileSummary.propTypes.prepared,
  preparing: PropTypes.bool,
  disabled: PropTypes.bool,
  onFile: PropTypes.func.isRequired,
};

function DialogSubtitle({ children }) {
  return (
    <Typography
      component="span"
      sx={{ display: 'block', color: 'text.secondary', fontSize: 14, fontWeight: 500 }}
    >
      {children}
    </Typography>
  );
}

DialogSubtitle.propTypes = { children: PropTypes.node };

function DialogFormActions({ onClose, disabled, pendingLabel, idleLabel }) {
  return (
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
      <Button
        type="submit"
        variant="contained"
        disabled={disabled}
        startIcon={disabled ? <CircularProgress size={16} color="inherit" /> : null}
        sx={accentFilledSx}
      >
        {disabled ? pendingLabel : idleLabel}
      </Button>
    </DialogActions>
  );
}

DialogFormActions.propTypes = {
  onClose: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  pendingLabel: PropTypes.string.isRequired,
  idleLabel: PropTypes.string.isRequired,
};

export function SiteImageAddDialog({
  title,
  placement,
  open,
  initialFile,
  disabled,
  onClose,
  onAdd,
}) {
  const [alt, setAlt] = useState('');
  const {
    file,
    error,
    setError,
    shape,
    setShape,
    prepared,
    preparing,
    previewUrl,
    pick,
    cancel,
    uploadFile,
  } = usePreparedSiteImageFile(placement);

  useEffect(() => {
    if (!open) {
      cancel();
      return;
    }
    setAlt('');
    pick(initialFile || null);
  }, [open, initialFile, cancel, pick]);

  const handleSubmit = async event => {
    event.preventDefault();
    const upload = await uploadFile();
    if (!upload) return;
    const message = await onAdd({ file: upload, alt });
    if (message) {
      setError({ message, severity: 'error' });
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={disabled ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogHeading onClose={onClose} disabled={disabled}>
        Add a photo
        <DialogSubtitle>{title}</DialogSubtitle>
      </DialogHeading>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error ? <Alert severity={error.severity}>{error.message}</Alert> : null}
          <SiteImageFileChooser
            title={title}
            placement={placement}
            file={file}
            previewUrl={previewUrl}
            shape={shape}
            onShape={setShape}
            prepared={prepared}
            preparing={preparing}
            disabled={disabled}
            onFile={pick}
          />
          <TextField
            label="Alt text"
            value={alt}
            onChange={event => setAlt(event.target.value)}
            disabled={disabled}
            helperText={ALT_HELPER}
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogFormActions
          onClose={onClose}
          disabled={disabled}
          pendingLabel="Uploading…"
          idleLabel="Add image"
        />
      </Box>
    </Dialog>
  );
}

SiteImageAddDialog.propTypes = {
  title: PropTypes.string.isRequired,
  placement: PropTypes.oneOf(['home_slide', 'gallery']).isRequired,
  open: PropTypes.bool.isRequired,
  initialFile: PropTypes.object,
  disabled: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export function SiteImageReplaceDialog({ title, placement, row, disabled, onClose, onReplace }) {
  const open = Boolean(row);
  const {
    file,
    error,
    setError,
    shape,
    setShape,
    prepared,
    preparing,
    previewUrl,
    pick,
    cancel,
    uploadFile,
  } = usePreparedSiteImageFile(placement);

  useEffect(() => {
    if (!open) {
      cancel();
      return;
    }
    pick(null);
  }, [open, cancel, pick]);

  const handleSubmit = async event => {
    event.preventDefault();
    const upload = await uploadFile();
    if (!upload) return;
    const message = await onReplace(upload);
    if (message) {
      setError({ message, severity: 'error' });
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={disabled ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogHeading onClose={onClose} disabled={disabled}>
        Replace photo
        <DialogSubtitle>{title}</DialogSubtitle>
      </DialogHeading>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error ? <Alert severity={error.severity}>{error.message}</Alert> : null}
          <SiteImageFileChooser
            title={title}
            placement={placement}
            file={file}
            previewUrl={previewUrl}
            shape={shape}
            onShape={setShape}
            prepared={prepared}
            preparing={preparing}
            disabled={disabled}
            onFile={pick}
          />
        </DialogContent>
        <DialogFormActions
          onClose={onClose}
          disabled={disabled}
          pendingLabel="Uploading…"
          idleLabel="Replace image"
        />
      </Box>
    </Dialog>
  );
}

SiteImageReplaceDialog.propTypes = {
  title: PropTypes.string.isRequired,
  placement: PropTypes.oneOf(['home_slide', 'gallery']).isRequired,
  row: rowShape,
  disabled: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onReplace: PropTypes.func.isRequired,
};

export function EditAltDialog({ row, placement, disabled, error, onClose, onSave }) {
  const [alt, setAlt] = useState('');
  const open = Boolean(row);
  const src = row ? daycareImageSrc(row.image_url) : null;

  useEffect(() => {
    if (row) setAlt(typeof row.alt === 'string' ? row.alt : '');
  }, [row]);

  return (
    <Dialog
      open={open}
      onClose={disabled ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogHeading onClose={onClose} disabled={disabled}>
        Edit alt text
      </DialogHeading>
      <Box
        component="form"
        onSubmit={event => {
          event.preventDefault();
          onSave(alt);
        }}
      >
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {src ? (
            <Box
              component="img"
              src={src}
              alt=""
              sx={{
                width: '100%',
                aspectRatio: mediaAspect(placement),
                objectFit: 'cover',
                borderRadius: '14px',
                display: 'block',
              }}
            />
          ) : null}
          <TextField
            label="Alt text"
            value={alt}
            onChange={event => setAlt(event.target.value)}
            disabled={disabled}
            helperText={ALT_HELPER}
            fullWidth
            multiline
            minRows={2}
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
  row: rowShape,
  placement: PropTypes.oneOf(['home_slide', 'gallery']).isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export function RemoveImageDialog({ row, index, placement, isLast, disabled, onClose, onConfirm }) {
  const open = Boolean(row);
  const src = row ? daycareImageSrc(row.image_url) : null;
  const where = placement === 'home_slide' ? 'home page' : 'gallery';

  return (
    <Dialog
      open={open}
      onClose={disabled ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogHeading onClose={onClose} disabled={disabled}>
        Remove this photo?
      </DialogHeading>
      <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {src ? (
          <Box
            component="img"
            src={src}
            alt=""
            sx={{
              width: '100%',
              aspectRatio: mediaAspect(placement),
              objectFit: 'cover',
              borderRadius: '14px',
            }}
          />
        ) : null}
        {row ? (
          <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>
            {displayTitle(row, index)}
          </Typography>
        ) : null}
        <Typography sx={{ color: 'text.secondary', fontSize: 14, lineHeight: 1.5 }}>
          {`It comes off the public ${where} right away. This can't be undone.`}
          {isLast ? ` With no photos left, the ${where} goes back to the built-in photos.` : ''}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          disabled={disabled}
          sx={neutralPillSx}
        >
          Keep it
        </Button>
        <Button
          type="button"
          variant="contained"
          disabled={disabled}
          onClick={() => onConfirm(row)}
          sx={removeFilledSx}
        >
          Remove photo
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RemoveImageDialog.propTypes = {
  row: rowShape,
  index: PropTypes.number,
  placement: PropTypes.oneOf(['home_slide', 'gallery']).isRequired,
  isLast: PropTypes.bool,
  disabled: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

/**
 * Large view of the photos in visitor order. For home slides it can play the
 * slideshow with the same hold and crossfade timing as the public hero.
 */
export function PhotoViewerDialog({ rows, placement, startIndex, autoplay, onClose }) {
  const open = startIndex != null;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const count = rows.length;
  const isSlide = placement === 'home_slide';

  useEffect(() => {
    if (!open) return;
    setIndex(Math.min(startIndex, Math.max(0, count - 1)));
    setPlaying(Boolean(autoplay) && isSlide);
  }, [open, startIndex, autoplay, isSlide, count]);

  useEffect(() => {
    if (!open || !playing || count < 2) return undefined;
    const timer = setInterval(
      () => setIndex(current => (current + 1) % count),
      HOME_HERO_SLIDE_MS + HOME_HERO_FADE_MS,
    );
    return () => clearInterval(timer);
  }, [open, playing, count]);

  const step = delta => {
    setPlaying(false);
    setIndex(current => (current + delta + count) % count);
  };

  const current = rows[index];

  return (
    <Dialog
      open={open && count > 0}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { ...dialogPaperSx, bgcolor: '#0E272C', color: '#FBF4E8' } }}
      onKeyDown={event => {
        if (event.key === 'ArrowRight') step(1);
        if (event.key === 'ArrowLeft') step(-1);
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, pt: 2, pb: 1.5 }}>
        <Typography sx={{ fontWeight: 700, flex: 1 }}>
          {isSlide ? 'Home page slideshow' : 'Gallery'}
          <Typography component="span" sx={{ ml: 1, opacity: 0.7, fontSize: 14 }}>
            {count ? `${index + 1} of ${count}` : ''}
          </Typography>
        </Typography>
        {isSlide && count > 1 ? (
          <Button
            onClick={() => setPlaying(value => !value)}
            startIcon={playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
            sx={{ ...accentFilledSx, minHeight: 34, py: 0.5 }}
          >
            {playing ? 'Pause' : 'Play'}
          </Button>
        ) : null}
        <IconButton aria-label="Close" onClick={onClose} sx={{ color: 'inherit' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          position: 'relative',
          mx: 2.5,
          mb: 2,
          aspectRatio: isSlide ? '16 / 7' : '4 / 3',
          maxHeight: '72vh',
          borderRadius: '14px',
          overflow: 'hidden',
          bgcolor: '#082E34',
        }}
      >
        {rows.map((row, rowIndex) => {
          const src = daycareImageSrc(row.image_url);
          if (!src) return null;
          return (
            <Box
              key={row.id}
              component="img"
              src={src}
              alt={rowIndex === index ? row.alt || '' : ''}
              aria-hidden={rowIndex !== index}
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: isSlide ? 'cover' : 'contain',
                opacity: rowIndex === index ? 1 : 0,
                transition: `opacity ${isSlide ? HOME_HERO_FADE_MS : 250}ms ease`,
              }}
            />
          );
        })}
        {count > 1
          ? [
              { delta: -1, label: 'Previous photo', Icon: ChevronLeftIcon, side: { left: 12 } },
              { delta: 1, label: 'Next photo', Icon: ChevronRightIcon, side: { right: 12 } },
            ].map(({ delta, label, Icon, side }) => (
              <IconButton
                key={label}
                aria-label={label}
                onClick={() => step(delta)}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  ...side,
                  color: '#FFFCF7',
                  bgcolor: alpha('#0E272C', 0.55),
                  backdropFilter: 'blur(6px)',
                  '&:hover': { bgcolor: alpha('#0E272C', 0.8) },
                }}
              >
                <Icon />
              </IconButton>
            ))
          : null}
      </Box>
      <Typography sx={{ px: 2.5, pb: 2.5, opacity: current?.alt ? 0.85 : 0.55, fontSize: 14 }}>
        {current?.alt?.trim() || 'No alt text yet.'}
      </Typography>
    </Dialog>
  );
}

PhotoViewerDialog.propTypes = {
  rows: PropTypes.arrayOf(rowShape).isRequired,
  placement: PropTypes.oneOf(['home_slide', 'gallery']).isRequired,
  startIndex: PropTypes.number,
  autoplay: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};
