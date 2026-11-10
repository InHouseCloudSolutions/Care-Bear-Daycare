import {
  LOCAL as DAYCARE_API_MODE_LOCAL,
  MODE_COOKIE as DAYCARE_API_MODE_COOKIE,
  MODE_HEADER as DAYCARE_API_MODE_HEADER,
} from './daycareApiTarget.cjs';

export { DAYCARE_API_MODE_COOKIE, DAYCARE_API_MODE_HEADER, DAYCARE_API_MODE_LOCAL };

export function daycareApiSwitchEnabled() {
  // Dev-only. NODE_ENV is inlined at build time, so a production bundle never
  // shows the chip even when .env sets NEXT_PUBLIC_DAYCARE_API_SWITCH=1.
  return (
    process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DAYCARE_API_SWITCH === '1'
  );
}

/** 'local' or 'production'. Production when the switch is off or storage is empty. */
export function readDaycareApiMode() {
  if (!daycareApiSwitchEnabled() || typeof window === 'undefined') return 'production';
  try {
    return window.localStorage.getItem(DAYCARE_API_MODE_COOKIE) === DAYCARE_API_MODE_LOCAL
      ? DAYCARE_API_MODE_LOCAL
      : 'production';
  } catch {
    return 'production';
  }
}

/** Header for fetch calls that omit cookies. Empty unless the switch is on and mode is local. */
export function daycareApiModeHeaders() {
  if (readDaycareApiMode() !== DAYCARE_API_MODE_LOCAL) return {};
  return { [DAYCARE_API_MODE_HEADER]: DAYCARE_API_MODE_LOCAL };
}

/** Persist the mode for both fetch (localStorage → header) and image loads (cookie). */
export function writeDaycareApiMode(mode) {
  const local = mode === DAYCARE_API_MODE_LOCAL;
  const value = local ? DAYCARE_API_MODE_LOCAL : 'production';
  window.localStorage.setItem(DAYCARE_API_MODE_COOKIE, value);
  document.cookie = local
    ? `${DAYCARE_API_MODE_COOKIE}=${DAYCARE_API_MODE_LOCAL}; Path=/; SameSite=Lax; Max-Age=31536000`
    : `${DAYCARE_API_MODE_COOKIE}=; Path=/; Max-Age=0`;
}
