import { ACCOUNT_PATH } from '@/consts/routes';

/**
 * Where a signed-in visitor should leave the staff desk.
 * Staff stay. Anyone else who is signed in goes to their account.
 * A missing user is left to the auth gate (login), not sent to /account.
 * @param {{ isStaff?: boolean }|null|undefined} user
 * @returns {string|null}
 */
export function staffDeskRedirectPath(user) {
  if (!user) return null;
  if (user.isStaff === true) return null;
  return ACCOUNT_PATH;
}

export const HOLIDAY_KINDS = [
  { value: 'closed', label: 'Closed (no booking)' },
  { value: 'surcharge', label: 'Open with % surcharge' },
];

/**
 * Client check before a holiday is sent. `ends_on` must be on or after `starts_on`.
 * ISO dates compare in calendar order. Surcharge needs a percent from 0–100.
 * @param {{ name?: string, startsOn?: string, endsOn?: string, kind?: string, surchargePercent?: string|number }} fields
 * @returns {string|null}
 */
export function holidayFormError({ name, startsOn, endsOn, kind, surchargePercent } = {}) {
  if (!String(name || '').trim()) return 'Name is required.';
  if (!startsOn || !endsOn) return 'Start and end dates are required.';
  if (endsOn < startsOn) return 'End date must be on or after the start date.';
  if (kind !== 'closed' && kind !== 'surcharge') return 'Choose closed or open with surcharge.';
  if (kind === 'surcharge') {
    const raw = String(surchargePercent ?? '').trim();
    if (raw === '') return 'Surcharge percent is required.';
    const percent = Number(raw);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      return 'Surcharge must be between 0 and 100.';
    }
  }
  return null;
}

/**
 * @param {{ name?: string, startsOn: string, endsOn: string, kind: 'closed'|'surcharge', surchargePercent?: string|number }} fields
 * @returns {{ name: string, starts_on: string, ends_on: string, kind: string, surcharge_percent: number|null }}
 */
export function holidayPayload({ name, startsOn, endsOn, kind, surchargePercent }) {
  return {
    name: String(name || '').trim(),
    starts_on: startsOn,
    ends_on: endsOn,
    kind,
    surcharge_percent: kind === 'surcharge' ? Number(surchargePercent) : null,
  };
}

/** Short label for list chips: "Closed" or "+15% surcharge". */
export function holidayKindLabel(holiday) {
  if (holiday?.kind === 'surcharge') {
    const percent = Number(holiday.surcharge_percent);
    const shown = Number.isFinite(percent) ? percent : '?';
    return `+${shown}% surcharge`;
  }
  return 'Closed';
}

/** Body for staff confirm or decline. */
export function bookingStatusPatch(status) {
  return { status };
}

/**
 * Staff-created stays are confirmed immediately. No override flag.
 * @param {{ petParentId: number|string, serviceId: number|string, dogIds: Array<number|string>, startsOn: string, endsOn: string }} fields
 */
export function staffBookingBody({ petParentId, serviceId, dogIds, startsOn, endsOn }) {
  return {
    pet_parent_id: Number(petParentId),
    service_id: Number(serviceId),
    dogs: dogIds.map(id => Number(id)),
    starts_on: startsOn,
    ends_on: endsOn,
    status: 'confirmed',
  };
}

export function staffBookingFormError({ petParentId, serviceId, dogIds, startsOn, endsOn } = {}) {
  if (petParentId == null || petParentId === '') return 'Choose a household.';
  if (!Array.isArray(dogIds) || dogIds.length === 0) return 'Choose at least one dog.';
  if (serviceId == null || serviceId === '') return 'Choose a service.';
  if (!startsOn || !endsOn) return 'Start and end dates are required.';
  if (endsOn < startsOn) return 'End date must be on or after the start date.';
  return null;
}

/** @param {unknown} data */
export function asRecordList(data) {
  return Array.isArray(data) ? data : null;
}

export function householdLabel(parent) {
  const name = [parent?.first_name, parent?.last_name].filter(Boolean).join(' ');
  return name || parent?.email || `Household ${parent?.id}`;
}

// --- Bookings ---

/** Label and colour tone for each booking status. */
export const BOOKING_STATUS = {
  requested: { label: 'Requested', tone: 'accent' },
  confirmed: { label: 'Confirmed', tone: 'positive' },
  checked_in: { label: 'Checked in', tone: 'positive' },
  completed: { label: 'Completed', tone: 'neutral' },
  declined: { label: 'Declined', tone: 'muted' },
  cancelled: { label: 'Cancelled', tone: 'muted' },
};

export function bookingStatusLabel(status) {
  return BOOKING_STATUS[status]?.label || String(status || 'Unknown');
}

/**
 * Next steps staff can take on a stay, primary action first.
 * @param {string} status
 * @returns {Array<{ status: string, label: string, primary: boolean, done: string }>}
 */
export function bookingActions(status) {
  switch (status) {
    case 'requested':
      return [
        { status: 'confirmed', label: 'Confirm', primary: true, done: 'Stay confirmed' },
        { status: 'declined', label: 'Decline', primary: false, done: 'Request declined' },
      ];
    case 'confirmed':
      return [
        { status: 'checked_in', label: 'Check in', primary: true, done: 'Checked in' },
        { status: 'cancelled', label: 'Cancel stay', primary: false, done: 'Stay cancelled' },
      ];
    case 'checked_in':
      return [{ status: 'completed', label: 'Check out', primary: true, done: 'Checked out' }];
    default:
      return [];
  }
}

export const BOOKING_FILTERS = [
  { value: 'active', label: 'Active', statuses: ['requested', 'confirmed', 'checked_in'] },
  { value: 'requested', label: 'Requests', statuses: ['requested'] },
  { value: 'past', label: 'Past', statuses: ['completed', 'declined', 'cancelled'] },
  { value: 'all', label: 'All', statuses: null },
];

export function bookingMatchesFilter(booking, filterValue) {
  const filter = BOOKING_FILTERS.find(item => item.value === filterValue);
  if (!filter || !filter.statuses) return true;
  return filter.statuses.includes(booking?.status);
}

const STATUS_ORDER = ['requested', 'checked_in', 'confirmed', 'completed', 'declined', 'cancelled'];

/** Requests first, then stays in care, then by start date (soonest first). */
export function sortBookings(bookings) {
  const rank = status => {
    const index = STATUS_ORDER.indexOf(status);
    return index === -1 ? STATUS_ORDER.length : index;
  };
  return [...bookings].sort((a, b) => {
    const byStatus = rank(a.status) - rank(b.status);
    if (byStatus !== 0) return byStatus;
    return String(a.starts_on).localeCompare(String(b.starts_on)) || a.id - b.id;
  });
}

/** Today's date as `YYYY-MM-DD` in the browser's time zone. */
export function todayIso(now = new Date()) {
  const pad = value => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Dogs in care on `day`: checked in, or confirmed with a range covering that day. */
export function dogsInCareOn(bookings, day) {
  const ids = new Set();
  bookings.forEach(booking => {
    const covers = booking.starts_on <= day && booking.ends_on >= day;
    if (booking.status === 'checked_in' || (booking.status === 'confirmed' && covers)) {
      (booking.dogs || []).forEach(id => ids.add(id));
    }
  });
  return ids.size;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function splitIso(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/**
 * Short, readable date range: "Nov 20 – 22, 2026", "Dec 30, 2026 – Jan 2, 2027", "Nov 4, 2026".
 * Falls back to the raw values when they are not ISO dates.
 */
export function formatDateRange(startsOn, endsOn) {
  const a = splitIso(startsOn);
  const b = splitIso(endsOn || startsOn);
  if (!a || !b) return [startsOn, endsOn].filter(Boolean).join(' – ');
  const monthDay = d => `${MONTHS[d.month - 1]} ${d.day}`;
  if (startsOn === (endsOn || startsOn)) return `${monthDay(a)}, ${a.year}`;
  if (a.year !== b.year) return `${monthDay(a)}, ${a.year} – ${monthDay(b)}, ${b.year}`;
  if (a.month === b.month) return `${monthDay(a)} – ${b.day}, ${a.year}`;
  return `${monthDay(a)} – ${monthDay(b)}, ${a.year}`;
}

/** Whole days from `startsOn` to `endsOn`, inclusive. */
export function daySpan(startsOn, endsOn) {
  const a = splitIso(startsOn);
  const b = splitIso(endsOn);
  if (!a || !b) return null;
  const ms = Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day);
  return Math.round(ms / 86400000) + 1;
}

/** "$35.00", or "—" when the value is missing or not a number. */
export function moneyLabel(value) {
  if (value == null || value === '') return '—';
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '—';
}

/** Facility-friendly local display: "Nov 2, 2026, 7:05 AM". Null when empty or unparsable. */
export function formatTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/** An ISO timestamp as `<input type="datetime-local">` text, in the browser's time zone. */
export function timestampInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/** Inverse of `timestampInputValue`: local input text back to an ISO string, or null when blank. */
export function timestampPayloadValue(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Form state for the "correct times" dialog, seeded from the booking's current stamps. */
export function timestampFormState(booking) {
  return {
    checkedInAt: timestampInputValue(booking?.checked_in_at),
    checkedOutAt: timestampInputValue(booking?.checked_out_at),
  };
}

export function timestampFormError({ checkedInAt, checkedOutAt } = {}) {
  if (checkedInAt && checkedOutAt && checkedOutAt < checkedInAt) {
    return 'Checkout time must be on or after check-in.';
  }
  return null;
}

export function timestampPayload(form) {
  return {
    checked_in_at: timestampPayloadValue(form.checkedInAt),
    checked_out_at: timestampPayloadValue(form.checkedOutAt),
  };
}

// --- Households ---

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const HOUSEHOLD_FIELDS = [
  'first_name',
  'last_name',
  'phone',
  'address',
  'city',
  'emergency_name',
  'emergency_phone',
];

export function householdFormState(parent) {
  const state = { email: parent?.email ?? '', password: '' };
  HOUSEHOLD_FIELDS.forEach(field => {
    state[field] = parent?.[field] ?? '';
  });
  return state;
}

/** Client check before a household is created or saved. */
export function householdFormError(form, { isNew } = {}) {
  if (isNew) {
    const email = String(form?.email || '').trim();
    if (!email) return 'Email is required.';
    if (!EMAIL_RE.test(email)) return 'Enter a valid email address.';
  }
  const named = String(form?.first_name || '').trim() || String(form?.last_name || '').trim();
  if (!named) return 'Add at least a first or last name.';
  return null;
}

/** Body for POST (new) or PATCH (existing). Email and password only go on create. */
export function householdPayload(form, { isNew } = {}) {
  const body = {};
  HOUSEHOLD_FIELDS.forEach(field => {
    body[field] = String(form?.[field] ?? '').trim();
  });
  if (isNew) {
    body.email = String(form?.email || '')
      .trim()
      .toLowerCase();
    if (form?.password) body.password = form.password;
  }
  return body;
}

/** Case-insensitive match on name, email, phone, city, or any dog's name. */
export function householdMatches(parent, query, dogs = []) {
  const needle = String(query || '')
    .trim()
    .toLowerCase();
  if (!needle) return true;
  const haystack = [
    parent?.first_name,
    parent?.last_name,
    parent?.email,
    parent?.phone,
    parent?.city,
    ...dogs.filter(dog => dog.pet_parent_id === parent?.id).map(dog => dog.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

export function householdInitials(parent) {
  const first = String(parent?.first_name || '').trim();
  const last = String(parent?.last_name || '').trim();
  const letters = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return (
    letters ||
    String(parent?.email || '?')
      .charAt(0)
      .toUpperCase()
  );
}

// --- Services ---

export const SERVICE_KINDS = [
  { value: 'daycare', label: 'Daycare', unit: 'day' },
  { value: 'boarding', label: 'Boarding', unit: 'night' },
  { value: 'walk', label: 'Walk', unit: 'visit' },
  { value: 'drop_in', label: 'Drop-in', unit: 'visit' },
];

export const RATE_UNITS = [
  { value: 'day', label: 'per day' },
  { value: 'night', label: 'per night' },
  { value: 'visit', label: 'per visit' },
];

export function serviceKindLabel(kind) {
  return SERVICE_KINDS.find(item => item.value === kind)?.label || kind;
}

export function rateLabel(service) {
  const unit = RATE_UNITS.find(item => item.value === service?.rate_unit)?.label || '';
  const rate = Number(service?.rate);
  const money = Number.isFinite(rate) ? `$${rate.toFixed(2)}` : '—';
  return unit ? `${money} ${unit}` : money;
}

/** Lowercase letters, numbers and single hyphens, as the API requires. */
export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

/** Optional, informational check-in/check-out windows on a service. */
export const SERVICE_TIME_FIELDS = [
  'check_in_from',
  'check_in_until',
  'check_out_from',
  'check_out_until',
];

/** "07:00:00" (or "07:00") -> "07:00" for a `type="time"` input. "" when empty or unparsable. */
function toTimeInput(value) {
  const match = /^(\d{2}):(\d{2})/.exec(String(value || ''));
  return match ? `${match[1]}:${match[2]}` : '';
}

/** "07:00" -> "07:00:00" for the API. Blank -> null. */
function toTimePayload(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;
  return trimmed.length === 5 ? `${trimmed}:00` : trimmed;
}

function parseTimeOfDay(value) {
  const match = /^(\d{2}):(\d{2})/.exec(String(value || ''));
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

/** "7:00 AM" from "07:00:00" or "07:00". Null when unparsable. */
export function formatTimeOfDay(value) {
  const parsed = parseTimeOfDay(value);
  if (!parsed) return null;
  const period = parsed.hour >= 12 ? 'PM' : 'AM';
  const hour12 = parsed.hour % 12 === 0 ? 12 : parsed.hour % 12;
  return `${hour12}:${String(parsed.minute).padStart(2, '0')} ${period}`;
}

/** "7:00 AM – 10:00 AM", one side alone, or null when neither end is set. */
export function formatWindow(from, until) {
  const a = formatTimeOfDay(from);
  const b = formatTimeOfDay(until);
  if (a && b) return `${a} – ${b}`;
  return a || b || null;
}

export function serviceFormState(service) {
  const state = {
    name: service?.name ?? '',
    slug: service?.slug ?? '',
    kind: service?.kind ?? 'daycare',
    rate: service?.rate ?? '',
    rate_unit: service?.rate_unit ?? 'day',
    max_dogs_per_day: service?.max_dogs_per_day ?? '',
    active: service ? Boolean(service.active) : true,
  };
  SERVICE_TIME_FIELDS.forEach(field => {
    state[field] = toTimeInput(service?.[field]);
  });
  return state;
}

export function serviceFormError(form) {
  if (!String(form?.name || '').trim()) return 'Name is required.';
  if (!slugify(form?.slug || form?.name)) return 'Add a short web name (slug).';
  const rate = String(form?.rate ?? '').trim();
  if (rate === '' || !Number.isFinite(Number(rate)) || Number(rate) < 0) {
    return 'Rate must be zero or more.';
  }
  const cap = String(form?.max_dogs_per_day ?? '').trim();
  if (cap !== '' && (!Number.isInteger(Number(cap)) || Number(cap) < 1)) {
    return 'Daily cap must be a whole number of at least 1, or blank for no cap.';
  }
  return null;
}

export function servicePayload(form) {
  const cap = String(form?.max_dogs_per_day ?? '').trim();
  const payload = {
    name: String(form.name).trim(),
    slug: slugify(form.slug || form.name),
    kind: form.kind,
    rate: Number(form.rate).toFixed(2),
    rate_unit: form.rate_unit,
    max_dogs_per_day: cap === '' ? null : Number(cap),
    active: Boolean(form.active),
  };
  SERVICE_TIME_FIELDS.forEach(field => {
    payload[field] = toTimePayload(form?.[field]);
  });
  return payload;
}

// --- Extras ---

export const EXTRA_KINDS = [
  { value: 'item', label: 'Item' },
  { value: 'late_checkout', label: 'Late checkout fee' },
];

export function extraKindLabel(kind) {
  return EXTRA_KINDS.find(item => item.value === kind)?.label || kind;
}

export function extraFormState(extra) {
  return {
    name: extra?.name ?? '',
    unit_price: extra?.unit_price ?? '',
    kind: extra?.kind ?? 'item',
    active: extra ? Boolean(extra.active) : true,
  };
}

export function extraFormError(form) {
  if (!String(form?.name || '').trim()) return 'Name is required.';
  const price = String(form?.unit_price ?? '').trim();
  if (price === '' || !Number.isFinite(Number(price)) || Number(price) < 0) {
    return 'Unit price must be zero or more.';
  }
  if (form?.kind !== 'item' && form?.kind !== 'late_checkout') return 'Choose a kind.';
  return null;
}

export function extraPayload(form) {
  return {
    name: String(form.name).trim(),
    unit_price: Number(form.unit_price).toFixed(2),
    kind: form.kind,
    active: Boolean(form.active),
  };
}

// --- Booking extra lines ---

/** Form state for adding one catalog item to a booking. */
export function bookingExtraFormState() {
  return { extraId: '', quantity: '1' };
}

export function bookingExtraFormError({ extraId, quantity } = {}) {
  if (extraId == null || extraId === '') return 'Choose an item.';
  const qty = String(quantity ?? '').trim();
  if (qty === '' || !Number.isInteger(Number(qty)) || Number(qty) < 1) {
    return 'Quantity must be a whole number of at least 1.';
  }
  return null;
}

export function bookingExtraPayload({ extraId, quantity }) {
  return { extra_id: Number(extraId), quantity: Number(quantity) };
}

/** "Poop bags × 2 — $10.00" (no "× n" for a single unit). */
export function bookingExtraLineLabel(line) {
  const qty = Number(line?.quantity) || 1;
  const desc = line?.description || 'Extra';
  const qtyPart = qty > 1 ? ` × ${qty}` : '';
  return `${desc}${qtyPart} — ${moneyLabel(line?.amount)}`;
}

/** "3 yrs", "8 mos", or null, from a `YYYY-MM-DD` birth date. */
export function dogAge(birthDate, now = new Date()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(birthDate || ''));
  if (!match) return null;
  let months =
    (now.getFullYear() - Number(match[1])) * 12 + (now.getMonth() + 1 - Number(match[2]));
  if (now.getDate() < Number(match[3])) months -= 1;
  if (months < 0) return null;
  if (months < 12) return `${months} mo${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  return `${years} yr${years === 1 ? '' : 's'}`;
}

/** One-line description of a dog: "Beagle · Female · 24 lb · 3 yrs". */
export function dogSummary(dog) {
  const sex =
    dog?.sex && dog.sex !== 'unknown' ? dog.sex[0].toUpperCase() + dog.sex.slice(1) : null;
  const weight =
    dog?.weight_lb != null && dog.weight_lb !== '' ? `${Number(dog.weight_lb)} lb` : null;
  return [dog?.breed || 'Breed not set', sex, weight, dogAge(dog?.birth_date)]
    .filter(Boolean)
    .join(' · ');
}

export const VACCINE_KINDS = [
  { value: 'rabies', label: 'Rabies' },
  { value: 'dhpp', label: 'DHPP' },
  { value: 'bordetella', label: 'Bordetella' },
  { value: 'other', label: 'Other' },
];

export function vaccineName(vaccine) {
  if (vaccine?.kind === 'other') return vaccine.label || 'Other';
  return VACCINE_KINDS.find(item => item.value === vaccine?.kind)?.label || vaccine?.kind;
}

/** 'expired', 'soon' (within 30 days), 'ok', or 'none' when there is no expiry date. */
export function vaccineState(expiresOn, today = todayIso()) {
  if (!expiresOn) return 'none';
  if (expiresOn < today) return 'expired';
  const soon = new Date(`${today}T00:00:00`);
  soon.setDate(soon.getDate() + 30);
  return expiresOn <= todayIso(soon) ? 'soon' : 'ok';
}
