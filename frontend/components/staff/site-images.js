import { formatApiErrors } from '@/lib/daycareApi';

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
