/** Inclusive ISO date helpers for the pet-parent stay calendar. Dates are local, not UTC. */

export const CLOSED_RANGE_MESSAGE = 'The daycare is closed that day. Pick another range or date.';
export const BOOKED_RANGE_MESSAGE = 'That day is already booked. Pick another range or date.';
export const BOARDING_SAME_DAY_MESSAGE = 'Checkout must be after the start date.';
export const VISIT_RANGE_MESSAGE = 'Walks and drop-ins are one day. Pick a single date.';

export function isVisitKind(kind) {
  return kind === 'walk' || kind === 'drop_in';
}

/** Screen-reader phrase for one availability state. */
export function dayStatePhrase(state) {
  if (state === 'closed') return 'the daycare is closed';
  if (state === 'unavailable') return 'already booked';
  if (state === 'joinable') return 'joinable';
  if (state === 'open') return 'open';
  return 'unavailable';
}

/** Short calendar caption. Open days stay unlabeled. */
export function dayStateCaption(state) {
  if (state === 'closed') return 'Closed';
  if (state === 'unavailable') return 'Booked';
  if (state === 'joinable') return 'Join';
  return '';
}

export function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** `true` when `iso` is before the local calendar day of `today`. */
export function isPastIsoDate(iso, today = new Date()) {
  return iso < formatIsoDate(today);
}

export function parseIsoDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function monthBounds(year, monthIndex) {
  const from = new Date(year, monthIndex, 1);
  const to = new Date(year, monthIndex + 1, 0);
  return { from: formatIsoDate(from), to: formatIsoDate(to) };
}

export function eachIsoDate(start, end) {
  if (end < start) return [];
  const dates = [];
  const cursor = parseIsoDate(start);
  const last = parseIsoDate(end);
  while (cursor <= last) {
    dates.push(formatIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function monthsBetween(start, end) {
  const [startDate, endDate] = [start, end].sort();
  const cursor = parseIsoDate(startDate);
  cursor.setDate(1);
  const last = parseIsoDate(endDate);
  const months = [];
  while (cursor.getFullYear() < last.getFullYear() || cursor.getMonth() <= last.getMonth()) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

/**
 * Why a start/end pair cannot be kept. `null` means the inclusive range is bookable.
 * Missing days count as booked so an incomplete calendar cannot confirm a stay.
 * @param {string} start
 * @param {string} end
 * @param {Record<string, { state?: string }>} dayMap
 * @param {string} kind
 * @returns {string|null}
 */
export function rangeBlockMessage(start, end, dayMap, kind) {
  if (isVisitKind(kind) && end !== start) return VISIT_RANGE_MESSAGE;
  if (kind === 'boarding' && end <= start) return BOARDING_SAME_DAY_MESSAGE;
  const infos = eachIsoDate(start, end).map(date => dayMap[date]);
  const blocked = infos.filter(
    info => !info || (info.state !== 'open' && info.state !== 'joinable'),
  );
  if (!blocked.length) return null;
  if (blocked.some(info => info?.state === 'closed')) return CLOSED_RANGE_MESSAGE;
  return BOOKED_RANGE_MESSAGE;
}
