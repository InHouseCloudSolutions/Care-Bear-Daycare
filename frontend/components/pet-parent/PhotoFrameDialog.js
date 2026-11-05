'use client';

import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Typography,
} from '@mui/material';
import { coverLayout, exportFramedPhoto } from './frame-photo';

const CROP = 280;
const MIN_ZOOM_PERCENT = 100;
const MAX_ZOOM_PERCENT = 400;

/**
 * Social-style avatar frame. The circle is the preview; the saved file is the
 * square inside that circle, so a round avatar crops to the face.
 */
export default function PhotoFrameDialog({ file, onCancel, onSave }) {
  const imageRef = useRef(null);
  const dragRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [natural, setNatural] = useState(null);
  const [zoomPercent, setZoomPercent] = useState(MIN_ZOOM_PERCENT);
  const zoom = zoomPercent / 100;
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setNatural(null);
    setZoomPercent(MIN_ZOOM_PERCENT);
    setPan({ x: 0, y: 0 });
    setError(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const layout = natural
    ? coverLayout(natural.width, natural.height, CROP, zoom, pan.x, pan.y)
    : null;

  const handleLoad = event => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) {
      setError('Could not read that photo.');
      return;
    }
    setNatural({ width: naturalWidth, height: naturalHeight });
  };

  const handlePointerDown = event => {
    if (!layout) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
  };

  const handlePointerMove = event => {
    if (!dragRef.current || !natural) return;
    const next = coverLayout(
      natural.width,
      natural.height,
      CROP,
      zoom,
      dragRef.current.panX + (event.clientX - dragRef.current.x),
      dragRef.current.panY + (event.clientY - dragRef.current.y),
    );
    setPan({ x: next.panX, y: next.panY });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleZoom = (_event, value) => {
    const nextPercent = Array.isArray(value) ? value[0] : value;
    setZoomPercent(nextPercent);
    if (!natural) return;
    const next = coverLayout(natural.width, natural.height, CROP, nextPercent / 100, pan.x, pan.y);
    setPan({ x: next.panX, y: next.panY });
  };

  const handleSave = async () => {
    if (!layout || !imageRef.current) return;
    setSaving(true);
    setError(null);
    try {
      const framed = await exportFramedPhoto(imageRef.current, layout, file.name);
      await onSave(framed);
    } catch {
      setError('Could not frame that photo.');
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={Boolean(file)}
      onClose={saving ? undefined : onCancel}
      aria-labelledby="frame-photo-title"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id="frame-photo-title">Frame photo</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 2 }}>
          Drag the photo and zoom until the face sits in the circle. This square is what we save.
        </Typography>
        <Box
          role="application"
          aria-label="Photo frame. Drag to reposition."
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          sx={{
            position: 'relative',
            width: CROP,
            height: CROP,
            mx: 'auto',
            overflow: 'hidden',
            touchAction: 'none',
            cursor: layout ? 'grab' : 'default',
            bgcolor: 'action.hover',
            borderRadius: '50%',
          }}
        >
          {previewUrl ? (
            <Box
              component="img"
              ref={imageRef}
              src={previewUrl}
              alt=""
              draggable={false}
              onLoad={handleLoad}
              sx={{
                position: 'absolute',
                maxWidth: 'none',
                userSelect: 'none',
                width: layout ? layout.displayWidth : CROP,
                height: layout ? layout.displayHeight : CROP,
                left: layout ? layout.left : 0,
                top: layout ? layout.top : 0,
              }}
            />
          ) : null}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: 'common.white',
              pointerEvents: 'none',
            }}
          />
        </Box>
        <Typography id="frame-photo-zoom" sx={{ mt: 2, fontSize: 13, fontWeight: 600 }}>
          Zoom
        </Typography>
        <Slider
          aria-labelledby="frame-photo-zoom"
          getAriaValueText={value => `${value}%`}
          value={zoomPercent}
          min={MIN_ZOOM_PERCENT}
          max={MAX_ZOOM_PERCENT}
          step={1}
          disabled={!natural || saving}
          onChange={handleZoom}
          sx={{ display: 'block', width: '100%', mt: 1 }}
        />
        {error ? (
          <Typography role="alert" sx={{ color: 'error.main', fontSize: 13 }}>
            {error}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!layout || saving}
          sx={{ textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
        >
          {saving ? 'Saving…' : 'Save photo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

PhotoFrameDialog.propTypes = {
  file: PropTypes.shape({ name: PropTypes.string }),
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
