/**
 * Shrinks a staff photo in the browser before upload so a 20 MB phone picture
 * goes up as a few hundred KB. The API resizes again, so this is only about
 * upload speed; anything the browser can't handle is sent as-is.
 */

/** Longest edge, in pixels. Keep in sync with PHOTO_MAX_EDGE and SITE_IMAGE_MAX_EDGE. */
export const UPLOADED_PHOTO_MAX_EDGE = 1600;
export const SITE_IMAGE_MAX_EDGE = { home_slide: 2400, gallery: UPLOADED_PHOTO_MAX_EDGE };

/** The API's hard cap on the uploaded file. */
export const SITE_IMAGE_UPLOAD_LIMIT_BYTES = 40 * 1024 * 1024;

const QUALITY = 0.85;

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
 * @param {File} file
 * @param {number} maxEdge
 * @returns {Promise<{ file: File, width: number|null, height: number|null,
 *   outputWidth: number|null, outputHeight: number|null, optimized: boolean }>}
 */
export async function prepareSiteImage(file, maxEdge) {
  const untouched = {
    file,
    width: null,
    height: null,
    outputWidth: null,
    outputHeight: null,
    optimized: false,
  };
  // Animated GIFs would lose their animation on a canvas.
  if (file.type === 'image/gif') return untouched;
  if (typeof createImageBitmap !== 'function') return untouched;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return untouched;
  }

  try {
    const { width, height } = bitmap;
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const outputWidth = Math.max(1, Math.round(width * scale));
    const outputHeight = Math.max(1, Math.round(height * scale));
    const canvas = makeCanvas(outputWidth, outputHeight);
    const context = canvas.getContext('2d');
    if (!context) return { ...untouched, width, height };
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, outputWidth, outputHeight);

    let blob = await canvasToBlob(canvas, 'image/webp', QUALITY);
    // Some browsers can't encode WebP and quietly hand back PNG.
    if (!blob || blob.type !== 'image/webp') {
      const fallback = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      blob = await canvasToBlob(canvas, fallback, QUALITY);
    }
    const measured = { ...untouched, width, height, outputWidth: width, outputHeight: height };
    if (!blob) return measured;
    // Already small and not resized: keep the original if re-encoding didn't help.
    if (scale === 1 && blob.size >= file.size) return measured;

    const extension = blob.type.split('/')[1] === 'jpeg' ? 'jpg' : blob.type.split('/')[1];
    return {
      file: new File([blob], renamed(file.name, extension), {
        type: blob.type,
        lastModified: Date.now(),
      }),
      width,
      height,
      outputWidth,
      outputHeight,
      optimized: true,
    };
  } finally {
    bitmap.close?.();
  }
}
