import { UPLOADED_PHOTO_MAX_EDGE } from '@/components/staff/prepare-site-image';

const OUTPUT_QUALITY = 0.85;

/**
 * Cover-fit a photo in a square crop, then apply zoom and pan.
 * Pan is in preview pixels, clamped so the crop never shows empty space.
 * Source fields are the square to copy out of the original image.
 */
export function coverLayout(naturalWidth, naturalHeight, cropSize, zoom, panX, panY) {
  const safeZoom = Math.max(1, zoom);
  const displayScale = (cropSize / Math.min(naturalWidth, naturalHeight)) * safeZoom;
  const displayWidth = naturalWidth * displayScale;
  const displayHeight = naturalHeight * displayScale;
  const limitX = Math.max(0, (displayWidth - cropSize) / 2);
  const limitY = Math.max(0, (displayHeight - cropSize) / 2);
  const clampedX = Math.min(limitX, Math.max(-limitX, panX));
  const clampedY = Math.min(limitY, Math.max(-limitY, panY));
  const left = (cropSize - displayWidth) / 2 + clampedX;
  const top = (cropSize - displayHeight) / 2 + clampedY;
  return {
    displayWidth,
    displayHeight,
    left,
    top,
    panX: clampedX,
    panY: clampedY,
    sourceX: -left / displayScale,
    sourceY: -top / displayScale,
    sourceSize: cropSize / displayScale,
  };
}

function canvasToBlob(canvas, type, quality) {
  if (typeof canvas.convertToBlob === 'function') {
    return canvas.convertToBlob({ type, quality });
  }
  return new Promise(resolve => {
    canvas.toBlob(resolve, type, quality);
  });
}

function makeCanvas(width, height) {
  if (typeof OffscreenCanvas === 'function') return new OffscreenCanvas(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function renamed(name, extension) {
  const stem = (name || 'photo').replace(/\.[^.]+$/, '') || 'photo';
  return `${stem}.${extension}`;
}

/**
 * Copy the framed square out of `image` and return a file ready to upload.
 * @param {CanvasImageSource} image
 * @param {{ sourceX: number, sourceY: number, sourceSize: number }} layout
 * @param {string} sourceName
 */
export async function exportFramedPhoto(image, layout, sourceName) {
  const edge = Math.max(1, Math.min(UPLOADED_PHOTO_MAX_EDGE, Math.round(layout.sourceSize)));
  const canvas = makeCanvas(edge, edge);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not frame that photo.');
  context.drawImage(
    image,
    layout.sourceX,
    layout.sourceY,
    layout.sourceSize,
    layout.sourceSize,
    0,
    0,
    edge,
    edge,
  );

  let blob = await canvasToBlob(canvas, 'image/webp', OUTPUT_QUALITY);
  if (!blob || blob.type !== 'image/webp') {
    blob = await canvasToBlob(canvas, 'image/jpeg', OUTPUT_QUALITY);
  }
  if (!blob) throw new Error('Could not frame that photo.');
  const extension = blob.type === 'image/jpeg' ? 'jpg' : 'webp';
  return new File([blob], renamed(sourceName, extension), {
    type: blob.type,
    lastModified: Date.now(),
  });
}
