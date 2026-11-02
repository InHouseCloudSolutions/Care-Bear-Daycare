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
} = {}) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const pathname = trailingSlash ? withTrailingSlash(normalized) : normalized.replace(/\/+$/, '');
  const url = `${BASE_PATH}${pathname}`;
  const headers = { 'Content-Type': 'application/json' };
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

  return parseResponse(response);
}

/**
 * Multipart upload. Do not set Content-Type — the browser must add the boundary.
 * @param {{ path: string, file: File, token?: string|null }} opts
 * @returns {Promise<{ ok: boolean, status: number, data: unknown }>}
 */
export async function daycareUpload({ path, file, token } = {}) {
  const url = `${BASE_PATH}${withTrailingSlash(path)}`;
  const headers = {};
  if (token) {
    headers.Authorization = `Token ${token}`;
  }
  const body = new FormData();
  body.append('file', file);

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

export const listServices = token =>
  daycareRequest({ method: 'GET', path: '/daycare/services', token });

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

// --- Closures (named holidays) ---

export const listClosures = token =>
  daycareRequest({ method: 'GET', path: '/daycare/closures', token });

export const createClosure = (token, body) =>
  daycareRequest({ method: 'POST', path: '/daycare/closures', token, body });

export const updateClosure = (token, closureId, body) =>
  daycareRequest({ method: 'PATCH', path: `/daycare/closures/${closureId}`, token, body });

export const deleteClosure = (token, closureId) =>
  daycareRequest({ method: 'DELETE', path: `/daycare/closures/${closureId}`, token });

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
