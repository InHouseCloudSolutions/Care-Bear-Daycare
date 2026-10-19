/**
 * Shared helpers for CMS ImageAsset-shaped gallery media.
 * Supports transitional API payloads: plain URL strings or
 * `{ src|imageUrl|fileUrl, alt, photographerCredit }` objects.
 */

export function photographerCreditFrom(value) {
  if (!value || typeof value === 'string') return '';
  const credit = value.photographerCredit ?? value.photographer_credit ?? '';
  return typeof credit === 'string' ? credit.trim() : '';
}

export function galleryMediaSrc(value, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return (
    value.src ?? value.imageUrl ?? value.image_url ?? value.fileUrl ?? value.file_url ?? fallback
  );
}

/**
 * Normalize one gallery entry to `{ src, alt, photographerCredit }`.
 * Returns null when no usable src is present.
 */
export function galleryImageFromApi(entry, { fallbackSrc = '', defaultAlt = '' } = {}) {
  if (!entry && !fallbackSrc) return null;

  if (typeof entry === 'string') {
    const src = entry || fallbackSrc;
    if (!src) return null;
    return { src, alt: defaultAlt, photographerCredit: '' };
  }

  const src = galleryMediaSrc(entry, fallbackSrc);
  if (!src) return null;

  return {
    src,
    alt: entry?.alt ?? entry?.altText ?? entry?.alt_text ?? defaultAlt,
    photographerCredit: photographerCreditFrom(entry),
  };
}

export function galleryImagesFromApi(galleryRaw, options = {}) {
  return (galleryRaw ?? [])
    .map((entry, index) =>
      galleryImageFromApi(entry, {
        ...options,
        defaultAlt: options.defaultAlt ?? options.altForIndex?.(index) ?? '',
      }),
    )
    .filter(Boolean);
}

/** Normalize portfolio / print galleries that may still be string[] during transition. */
export function normalizeGalleryImageList(images, altForIndex) {
  if (!images?.length) return [];
  return images
    .map((entry, index) =>
      galleryImageFromApi(entry, {
        defaultAlt: typeof altForIndex === 'function' ? altForIndex(index) : altForIndex || '',
      }),
    )
    .filter(Boolean);
}
