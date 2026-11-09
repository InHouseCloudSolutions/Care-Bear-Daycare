/**
 * Care Bear Daycare API client.
 *
 * Calls go through the same-origin `/daycare-api/:path*` rewrite (see next.config.js),
 * which proxies to the live IHCS API. The browser never talks to the IHCS host directly,
 * and no cookies are sent — auth is a DRF token header.
 *
 * Reference: docs/care-bear-daycare-api.md
 */

const BASE_PATH = '/daycare-api';

function withTrailingSlash(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

/**
 * @param {Response} response
 * @returns {Promise<{ ok: boolean, status: number, data: unknown }>}
 */
async function parseResponse(response) {
  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  return { ok: response.ok, status: response.status, data };
}

/**
 * @param {{
 *   method?: string,
 *   path: string,
 *   body?: unknown,
 *   token?: string|null,
 *   signal?: AbortSignal,
 *   trailingSlash?: boolean,
 *   asText?: boolean,
 * }} opts
 * @returns {Promise<{ ok: boolean, status: number, data: unknown }>}
 */
export async function daycareRequest({
  method = 'GET',
  path,
  body,
  token,
  signal,
  trailingSlash = true,
  asText = false,
} = {}) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const pathname = trailingSlash ? withTrailingSlash(normalized) : normalized.replace(/\/+$/, '');
  const url = `${BASE_PATH}${pathname}`;
  const headers = {};
  if (!asText) headers['Content-Type'] = 'application/json';
  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      credentials: 'omit',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    // Network failure, timeout, or abort — no HTTP response to read.
    return { ok: false, status: 0, data: null };
  }

  if (asText) {
    const text = await response.text();
    return { ok: response.ok, status: response.status, data: text };
  }

  return parseResponse(response);
}

/**
 * Multipart upload. Do not set Content-Type — the browser must add the boundary.
 * Optional `fields` are extra text parts (site images send `alt` and `placement`).
 * No trailing slash on this URL. Next 308s `/daycare-api/.../` to the slash-less
 * path before the body finishes, and Chrome reports that as ERR_CONNECTION_RESET.
 * The rewrite in next.config.js adds the slash Django requires on the upstream.
 * @param {{ path: string, file: File, token?: string|null, fields?: Record<string, string> }} opts
 * @returns {Promise<{ ok: boolean, status: number, data: unknown }>}
 */
export async function daycareUpload({ path, file, token, fields } = {}) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE_PATH}${normalized.replace(/\/+$/, '')}`;
  const headers = {};
  if (token) {
    headers.Authorization = `Token ${token}`;
  }
  const body = new FormData();
  body.append('file', file);
  if (fields) {
    Object.entries(fields).forEach(([key, value]) => {
      if (value != null) body.append(key, String(value));
    });
  }

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'omit',
      body,
    });
  } catch {
    return { ok: false, status: 0, data: null };
  }

  return parseResponse(response);
}

/**
 * `photo_url` from the API is `/api/daycare/images/<id>/`. The browser loads it
 * through the `/daycare-api` rewrite.
 * @param {unknown} photoUrl
 * @returns {string|null}
 */
export function daycareImageSrc(photoUrl) {
  if (typeof photoUrl !== 'string' || !photoUrl.startsWith('/api/')) return null;
  return `${BASE_PATH}${photoUrl.slice('/api'.length)}`;
}

/**
 * Turns a 400 response body into a field-error map plus an optional summary line.
 * Body is either `{ "<field>": ["msg", ...] }` or `{ "detail": "msg" }`.
 * @param {unknown} data
 * @returns {{ summary: string|null, fields: Record<string, string> }}
 */
export function formatApiErrors(data) {
  if (!data || typeof data !== 'object') {
    return { summary: null, fields: {} };
  }
  if (typeof data.detail === 'string') {
    return { summary: data.detail, fields: {} };
  }

  const fields = {};
  let summary = null;
  Object.entries(data).forEach(([field, value]) => {
    const text = Array.isArray(value) ? value.join(' ') : String(value);
    if (field === 'non_field_errors') {
      summary = text;
    } else {
      fields[field] = text;
    }
  });
  return { summary, fields };
}

// --- Auth ---

export const authLogin = (username, password) =>
  daycareRequest({ method: 'POST', path: '/auth/token', body: { username, password } });

export const authMe = token => daycareRequest({ method: 'GET', path: '/auth/me', token });

// --- Pet-parent profile ---

export const registerPetParent = payload =>
  daycareRequest({ method: 'POST', path: '/daycare/register', body: payload });

export const getMyProfile = token => daycareRequest({ method: 'GET', path: '/daycare/me', token });

export const updateMyProfile = (token, body) =>
  daycareRequest({ method: 'PATCH', path: '/daycare/me', token, body });

export const uploadMyPhoto = (token, file) =>
  daycareUpload({ path: '/daycare/me/photo', file, token });

export const deleteMyPhoto = token =>
  daycareRequest({ method: 'DELETE', path: '/daycare/me/photo', token });

// --- Dogs ---

export const listDogs = token => daycareRequest({ method: 'GET', path: '/daycare/dogs', token });

export const listPetParents = token =>
  daycareRequest({ method: 'GET', path: '/daycare/pet-parents', token });

/** Staff-created household. `password` is optional; without one the parent cannot sign in yet. */
export const createPetParent = (token, body) =>
  daycareRequest({ method: 'POST', path: '/daycare/pet-parents', token, body });

/** Staff edit of a household's contact details. Email is read-only. */
export const updatePetParent = (token, petParentId, body) =>
  daycareRequest({ method: 'PATCH', path: `/daycare/pet-parents/${petParentId}`, token, body });

/** Staff delete. Removes the login, dogs, and stays. **204**. */
export const deletePetParent = (token, petParentId) =>
  daycareRequest({ method: 'DELETE', path: `/daycare/pet-parents/${petParentId}`, token });

/** Staff photo for a household. The image stays private to that parent and staff. */
export const uploadPetParentPhoto = (token, petParentId, file) =>
  daycareUpload({ path: `/daycare/pet-parents/${petParentId}/photo`, file, token });

export const deletePetParentPhoto = (token, petParentId) =>
  daycareRequest({
    method: 'DELETE',
    path: `/daycare/pet-parents/${petParentId}/photo`,
    token,
  });

export const createDog = (token, body) =>
  daycareRequest({ method: 'POST', path: '/daycare/dogs', token, body });

export const updateDog = (token, dogId, body) =>
  daycareRequest({ method: 'PATCH', path: `/daycare/dogs/${dogId}`, token, body });

export const deleteDog = (token, dogId) =>
  daycareRequest({ method: 'DELETE', path: `/daycare/dogs/${dogId}`, token });

export const uploadDogPhoto = (token, dogId, file) =>
  daycareUpload({ path: `/daycare/dogs/${dogId}/photo`, file, token });

export const deleteDogPhoto = (token, dogId) =>
  daycareRequest({ method: 'DELETE', path: `/daycare/dogs/${dogId}/photo`, token });

// --- Vaccines ---

export const listVaccines = (token, dogId) =>
  daycareRequest({ method: 'GET', path: `/daycare/dogs/${dogId}/vaccines`, token });

export const createVaccine = (token, dogId, body) =>
  daycareRequest({ method: 'POST', path: `/daycare/dogs/${dogId}/vaccines`, token, body });

export const deleteVaccine = (token, vaccineId) =>
  daycareRequest({ method: 'DELETE', path: `/daycare/vaccines/${vaccineId}`, token });

// --- Services ---

/**
 * Bookable services. Staff pass `{ all: true }` so hidden services stay on the desk
 * and can be turned back on (`?all=1`). Pet parents omit it and only see active ones.
 * @param {string} token
 * @param {{ all?: boolean }} [opts]
 */
export function listServices(token, { all = false } = {}) {
  if (!all) {
    return daycareRequest({ method: 'GET', path: '/daycare/services', token });
  }
  return daycareRequest({
    method: 'GET',
    path: '/daycare/services/?all=1',
    token,
    trailingSlash: false,
  });
}

export const createService = (token, body) =>
  daycareRequest({ method: 'POST', path: '/daycare/services', token, body });

export const updateService = (token, serviceId, body) =>
  daycareRequest({ method: 'PATCH', path: `/daycare/services/${serviceId}`, token, body });

/** 400 `{ detail }` when bookings use the service. */
export const deleteService = (token, serviceId) =>
  daycareRequest({ method: 'DELETE', path: `/daycare/services/${serviceId}`, token });

/**
 * Open, joinable, unavailable, and closed days for one service and dog set.
 * `from` and `to` are inclusive ISO dates. `dogs` is comma-separated ids.
 * The slash stays before the query string; trailingSlash is off so it is not appended after the query.
 * @param {string} token
 * @param {{ serviceId: number|string, dogIds: Array<number|string>, from: string, to: string }} query
 */
export function getAvailability(token, { serviceId, dogIds, from, to }) {
  const dogs = dogIds.join(',');
  const query = [
    `service_id=${encodeURIComponent(serviceId)}`,
    `dogs=${dogs}`,
    `from=${encodeURIComponent(from)}`,
    `to=${encodeURIComponent(to)}`,
  ].join('&');
  return daycareRequest({
    method: 'GET',
    path: `/daycare/availability/?${query}`,
    token,
    trailingSlash: false,
  });
}

/** Pet-parent stay request. 200 and 201 are both success. Staff POST includes `pet_parent_id`. */
export const createBooking = (token, body) =>
  daycareRequest({ method: 'POST', path: '/daycare/bookings', token, body });

/**
 * Staff see every stay. Optional `status` and `petParentId` (`pet_parent` query).
 * @param {string} token
 * @param {{ status?: string, petParentId?: number|string }} [filters]
 */
export function listBookings(token, { status, petParentId } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (petParentId != null && petParentId !== '') {
    params.set('pet_parent', String(petParentId));
  }
  const query = params.toString();
  if (!query) {
    return daycareRequest({ method: 'GET', path: '/daycare/bookings', token });
  }
  return daycareRequest({
    method: 'GET',
    path: `/daycare/bookings/?${query}`,
    token,
    trailingSlash: false,
  });
}

export const updateBooking = (token, bookingId, body) =>
  daycareRequest({ method: 'PATCH', path: `/daycare/bookings/${bookingId}`, token, body });

/**
 * Staff-only HTML for one stay. The body is `text/html`, so it is returned as a
 * string in `data` rather than parsed as JSON. The token stays on the Authorization header.
 * `kind`: `request-client` | `request-staff` | `confirmed-client` | `invoice`.
 * @param {string} token
 * @param {number|string} bookingId
 * @param {string} kind
 */
export const fetchBookingPreview = (token, bookingId, kind) =>
  daycareRequest({
    method: 'GET',
    path: `/daycare/bookings/${bookingId}/previews/${kind}`,
    token,
    asText: true,
    // Next 308s a trailing slash before the rewrite. The slash-less path is what
    // the rewrite turns into the Django URL, and it keeps the staff token.
    trailingSlash: false,
  });

// --- Extras catalog ---

export const listExtras = token =>
  daycareRequest({ method: 'GET', path: '/daycare/extras', token });

export const createExtra = (token, body) =>
  daycareRequest({ method: 'POST', path: '/daycare/extras', token, body });

export const updateExtra = (token, extraId, body) =>
  daycareRequest({ method: 'PATCH', path: `/daycare/extras/${extraId}`, token, body });

/** Catalog delete. Lines already on a booking keep their snapshot. */
export const deleteExtra = (token, extraId) =>
  daycareRequest({ method: 'DELETE', path: `/daycare/extras/${extraId}`, token });

// --- Booking extra lines ---

export const listBookingExtras = (token, bookingId) =>
  daycareRequest({ method: 'GET', path: `/daycare/bookings/${bookingId}/extras`, token });

/** Staff only. `{ extra_id, quantity }`; `kind: "late_checkout"` extras are rejected (system-only). */
export const addBookingExtra = (token, bookingId, body) =>
  daycareRequest({ method: 'POST', path: `/daycare/bookings/${bookingId}/extras`, token, body });

/** Staff only, item lines only. Removing a late-checkout line is rejected — correct `checked_out_at` instead. */
export const deleteBookingExtra = (token, bookingId, lineId) =>
  daycareRequest({
    method: 'DELETE',
    path: `/daycare/bookings/${bookingId}/extras/${lineId}`,
    token,
  });

// --- Closures (named holidays) ---

export const listClosures = token =>
  daycareRequest({ method: 'GET', path: '/daycare/closures', token });

export const createClosure = (token, body) =>
  daycareRequest({ method: 'POST', path: '/daycare/closures', token, body });

export const updateClosure = (token, closureId, body) =>
  daycareRequest({ method: 'PATCH', path: `/daycare/closures/${closureId}`, token, body });

export const deleteClosure = (token, closureId) =>
  daycareRequest({ method: 'DELETE', path: `/daycare/closures/${closureId}`, token });

// --- Site images (home slides and gallery) ---

/**
 * Public photos for one placement (`home_slide` or `gallery`). No token.
 * The slash stays before the query string; trailingSlash is off so it is not appended after the query.
 * @param {'home_slide'|'gallery'} placement
 */
export function listSiteImages(placement) {
  return daycareRequest({
    method: 'GET',
    path: `/daycare/site-images/?placement=${encodeURIComponent(placement)}`,
    trailingSlash: false,
  });
}

/**
 * Staff upload. Multipart fields are `file`, `alt`, and `placement`.
 * The server assigns `sort_order` (one past the max for that placement).
 * @param {string} token
 * @param {{ file: File, alt?: string, placement: 'home_slide'|'gallery' }} fields
 */
export function createSiteImage(token, { file, alt, placement }) {
  return daycareUpload({
    path: '/daycare/site-images',
    file,
    token,
    fields: { alt: alt ?? '', placement },
  });
}

/**
 * Staff photo swap. Multipart field is `file` only — alt text and sort order stay put.
 * @param {string} token
 * @param {number|string} imageId
 * @param {File} file
 */
export function replaceSiteImage(token, imageId, file) {
  return daycareUpload({
    path: `/daycare/site-images/${imageId}/photo`,
    file,
    token,
  });
}

/** Staff edit. `placement` is read-only; send `{ alt, sort_order }` only. */
export const updateSiteImage = (token, imageId, body) =>
  daycareRequest({ method: 'PATCH', path: `/daycare/site-images/${imageId}`, token, body });

export const deleteSiteImage = (token, imageId) =>
  daycareRequest({ method: 'DELETE', path: `/daycare/site-images/${imageId}`, token });

// --- Public site reviews ---

const SITE_REVIEWS_TIMEOUT_MS = 8000;

/**
 * Public reviews for the marketing site. No token.
 * Browser path is `/daycare-api/daycare/site-reviews` (no trailing slash — Caddy 308s one).
 * The Next rewrite appends the slash on the Django upstream.
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<{ ok: boolean, status: number, data: unknown }>}
 */
export async function listSiteReviews({ signal } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SITE_REVIEWS_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', abortFromCaller, { once: true });
  }

  try {
    return await daycareRequest({
      method: 'GET',
      path: '/daycare/site-reviews',
      signal: controller.signal,
      trailingSlash: false,
    });
  } finally {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener('abort', abortFromCaller);
  }
}

// --- Public contact (marketing) ---

/** Marketing contact form. No token. Expect **201** `{ id }`. */
export const submitContactInquiry = body =>
  daycareRequest({ method: 'POST', path: '/daycare/contact-inquiries', body });
