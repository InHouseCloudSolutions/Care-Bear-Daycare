const SETTINGS_KEY = 'ck:userSettings';

export function canUseStorage() {
  try {
    if (typeof window === 'undefined') return false;
    const k = '__test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function readSettingsRaw() {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(SETTINGS_KEY);
}

export function writeSettingsRaw(val) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SETTINGS_KEY, val);
}

export function clearSettings() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SETTINGS_KEY);
}

export function readStorageItem(key) {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageItem(key, value) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore write failures (private mode, quota, etc.)
  }
}

export function removeStorageItem(key) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore remove failures
  }
}
