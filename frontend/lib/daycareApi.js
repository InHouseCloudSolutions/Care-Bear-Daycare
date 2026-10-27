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
 * @param {{ method?: string, path: string, body?: unknown, token?: string|null }} opts
 * @returns {Promise<{ ok: boolean, status: number, data: unknown }>}
 */
export async function daycareRequest({ method = 'GET', path, body, token } = {}) {
  const url = `${BASE_PATH}${withTrailingSlash(path)}`;
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
    });
  } catch {
    // Network failure (offline, proxy down, etc.) — no HTTP response to read.
    return { ok: false, status: 0, data: null };
  }

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

export const authLogin = (email, password) =>
  daycareRequest({ method: 'POST', path: '/auth/token', body: { username: email, password } });

export const authMe = token => daycareRequest({ method: 'GET', path: '/auth/me', token });

// --- Pet-parent profile ---

export const registerPetParent = payload =>
  daycareRequest({ method: 'POST', path: '/daycare/register', body: payload });

export const getMyProfile = token => daycareRequest({ method: 'GET', path: '/daycare/me', token });

export const updateMyProfile = (token, body) =>
  daycareRequest({ method: 'PATCH', path: '/daycare/me', token, body });

// --- Dogs ---

export const listDogs = token => daycareRequest({ method: 'GET', path: '/daycare/dogs', token });

export const createDog = (token, body) =>
  daycareRequest({ method: 'POST', path: '/daycare/dogs', token, body });

export const updateDog = (token, dogId, body) =>
  daycareRequest({ method: 'PATCH', path: `/daycare/dogs/${dogId}`, token, body });

export const deleteDog = (token, dogId) =>
  daycareRequest({ method: 'DELETE', path: `/daycare/dogs/${dogId}`, token });

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
