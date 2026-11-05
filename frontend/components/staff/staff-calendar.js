import { formatDateRange, householdLabel, todayIso } from './staff-desk';

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const HIDDEN_STATUSES = new Set(['declined', 'cancelled']);

/** `day` | `week` | `month`, defaulting to month when the query is missing or unknown. */
export function calendarViewFromQuery(search) {
  const value = new URLSearchParams(String(search || '')).get('view');
  if (value === 'day' || value === 'week' || value === 'month') return value;
  return 'month';
}

/** Inclusive stay coverage. ISO dates compare as YYYY-MM-DD, not as parsed Date values. */
export function stayCoversDay(booking, day) {
  if (!booking?.starts_on || !booking?.ends_on || !day) return false;
  return booking.starts_on <= day && day <= booking.ends_on;
}

export function isShownStay(booking) {
  return Boolean(booking) && !HIDDEN_STATUSES.has(booking.status);
}

/** Stays visible on the calendar that cover `day`, soonest start first. */
export function staysCoveringDay(bookings, day) {
  return (bookings || [])
    .filter(booking => isShownStay(booking) && stayCoversDay(booking, day))
    .sort((a, b) => String(a.starts_on).localeCompare(String(b.starts_on)) || a.id - b.id);
}

export function addDays(date, count) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count);
}

/** Sunday of the week that contains `date`, in local time. */
export function startOfWeek(date) {
  return addDays(date, -date.getDay());
}

export function weekDays(anchor) {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function shiftMonth(anchor, direction) {
  const day = anchor.getDate();
  const target = new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(day, last));
}

/** Move the anchor by one day, one week, or one calendar month. Does not mutate `anchor`. */
export function shiftAnchor(anchor, mode, direction) {
  switch (mode) {
    case 'day':
      return addDays(anchor, direction);
    case 'week':
      return addDays(anchor, direction * 7);
    case 'month':
      return shiftMonth(anchor, direction);
    default: {
      const unexpected = mode;
      throw new Error(`Unexpected calendar mode: ${unexpected}`);
    }
  }
}

/**
 * Every local day in the month of `anchor`, plus leading and trailing days
 * so the grid is whole Sunday–Saturday weeks.
 */
export function monthGrid(anchor) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const endIso = todayIso(addDays(startOfWeek(last), 6));
  const days = [];
  let cursor = startOfWeek(first);
  while (todayIso(cursor) <= endIso) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

/** "November 2026", "Nov 2 – 8, 2026", or "Nov 4, 2026". */
export function periodLabel(anchor, mode) {
  switch (mode) {
    case 'day':
      return formatDateRange(todayIso(anchor), todayIso(anchor));
    case 'week': {
      const days = weekDays(anchor);
      return formatDateRange(todayIso(days[0]), todayIso(days[6]));
    }
    case 'month':
      return `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`;
    default: {
      const unexpected = mode;
      throw new Error(`Unexpected calendar mode: ${unexpected}`);
    }
  }
}

function sameId(left, right) {
  return left === right || String(left) === String(right);
}

export function dogNamesForStay(booking, dogs) {
  const ids = Array.isArray(booking?.dogs) ? booking.dogs : [];
  if (ids.length === 0) return 'Dog';
  return ids
    .map(id => {
      const dog = (dogs || []).find(item => sameId(item.id, id));
      return dog?.name || 'Dog';
    })
    .join(', ');
}

export function staySummary(booking, lists = {}) {
  const parent = (lists.parents || []).find(item => sameId(item.id, booking?.pet_parent_id));
  const service = (lists.services || []).find(item => sameId(item.id, booking?.service_id));
  return {
    dogs: dogNamesForStay(booking, lists.dogs),
    household: parent ? householdLabel(parent) : `Household ${booking?.pet_parent_id ?? ''}`,
    service: service?.name || '',
  };
}
