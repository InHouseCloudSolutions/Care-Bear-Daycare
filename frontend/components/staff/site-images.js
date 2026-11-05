import { formatApiErrors } from '@/lib/daycareApi';

export const SITE_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

/**
 * The same summary-or-field text the other staff panels show for a 400 body.
 * @param {unknown} data
 * @param {string} fallback
 */
export function siteImageErrorText(data, fallback) {
  const { summary, fields } = formatApiErrors(data);
  const fieldText = Object.values(fields).filter(Boolean).join(' ');
  return summary || fieldText || fallback;
}

/**
 * PATCH bodies that exchange `sort_order` on two rows. Alt text stays put.
 * @param {{ id: number|string, alt?: string, sort_order?: number }} row
 * @param {{ id: number|string, alt?: string, sort_order?: number }} other
 */
export function sortOrderSwapPatches(row, other) {
  return [
    { id: row.id, body: { alt: row.alt ?? '', sort_order: other.sort_order } },
    { id: other.id, body: { alt: other.alt ?? '', sort_order: row.sort_order } },
  ];
}

/**
 * A copy of `rows` with the item at `from` moved to `to`.
 * @template T
 * @param {T[]} rows
 * @param {number} from
 * @param {number} to
 * @returns {T[]}
 */
export function moveRow(rows, from, to) {
  const next = [...rows];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * PATCH bodies for a drag that moves one row several places.
 * The existing sort_order slots are reused in their current order; only rows whose
 * slot changes are patched. Missing or duplicate sort orders fall back to 0..n-1.
 * @param {{ id: number|string, alt?: string, sort_order?: number }[]} rows sorted rows
 * @param {number} from
 * @param {number} to
 */
export function reorderPatches(rows, from, to) {
  const current = rows.map(row => row.sort_order);
  const usable =
    current.every(value => typeof value === 'number' && Number.isFinite(value)) &&
    new Set(current).size === current.length;
  const slots = usable ? current : rows.map((_, index) => index);
  const next = moveRow(rows, from, to);
  return next
    .map((row, index) => ({ row, sortOrder: slots[index] }))
    .filter(({ row, sortOrder }) => row.sort_order !== sortOrder)
    .map(({ row, sortOrder }) => ({
      id: row.id,
      body: { alt: row.alt ?? '', sort_order: sortOrder },
    }));
}

/**
 * A short message when a picked file can't be uploaded, or null when it can.
 * @param {File|null} file
 */
export function siteImageFileProblem(file) {
  if (!file) return null;
  if (file.type && !SITE_IMAGE_ACCEPT.split(',').includes(file.type)) {
    return 'Upload a JPEG, PNG, WEBP, or GIF.';
  }
  return null;
}

/** "2.4 MB" / "640 KB" */
export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
