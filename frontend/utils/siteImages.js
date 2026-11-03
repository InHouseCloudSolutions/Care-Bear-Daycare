import { HOME_HERO_SLIDE_MS } from '@/components/home-landing/home-hero-timing';
import { daycareImageSrc } from '@/lib/daycareApi';

// A successful site-images array becomes the shapes the public pages already use.
// Null means the page should keep its built-in photos.

/**
 * @param {{ sort_order?: number, id?: number|string }} a
 * @param {{ sort_order?: number, id?: number|string }} b
 */
export function compareSiteImageOrder(a, b) {
  const rank = value => {
    const order = Number(value?.sort_order);
    return Number.isFinite(order) ? order : 0;
  };
  const byOrder = rank(a) - rank(b);
  if (byOrder !== 0) return byOrder;
  const aId = Number(a?.id);
  const bId = Number(b?.id);
  if (Number.isFinite(aId) && Number.isFinite(bId)) return aId - bId;
  return 0;
}

function usableSiteImages(data) {
  if (!Array.isArray(data)) return null;
  const rows = data
    .filter(item => item && typeof item === 'object')
    .map(item => {
      const src = daycareImageSrc(item.image_url);
      if (!src) return null;
      const id = typeof item.id === 'number' || typeof item.id === 'string' ? item.id : src;
      return {
        id,
        alt: typeof item.alt === 'string' ? item.alt : '',
        sort_order: item.sort_order,
        src,
      };
    })
    .filter(Boolean)
    .sort(compareSiteImageOrder);
  return rows.length ? rows : null;
}

/**
 * Home hero slides. Duration stays the built-in slide time.
 * @param {unknown} data
 * @returns {Array<{ id: number|string, imageUrl: string, alt: string, durationMs: number }>|null}
 */
export function heroSlidesFromSiteImages(data) {
  const rows = usableSiteImages(data);
  if (!rows) return null;
  return rows.map(row => ({
    id: row.id,
    imageUrl: row.src,
    alt: row.alt,
    durationMs: HOME_HERO_SLIDE_MS,
  }));
}

/**
 * Gallery images for GalleryPage.
 * @param {unknown} data
 * @returns {Array<{ src: string, alt: string }>|null}
 */
export function galleryImagesFromSiteImages(data) {
  const rows = usableSiteImages(data);
  if (!rows) return null;
  return rows.map(row => ({
    src: row.src,
    alt: row.alt,
  }));
}
