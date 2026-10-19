import { readSettingsRaw, writeSettingsRaw } from './safeStorage';

export const DEFAULT_SETTINGS = {
  version: 1,
  sponsorBgColor: '#e5e7eb',
  timerDelaySecs: 4,
};

function migrate(obj) {
  if (!obj || typeof obj !== 'object') return DEFAULT_SETTINGS;

  // v1
  if (obj.version === 1) {
    return {
      version: 1,
      sponsorBgColor:
        typeof obj.sponsorBgColor === 'string' && obj.sponsorBgColor.trim()
          ? obj.sponsorBgColor
          : DEFAULT_SETTINGS.sponsorBgColor,
      timerDelaySecs:
        Number.isFinite(Number(obj.timerDelaySecs)) && Number(obj.timerDelaySecs) > 0
          ? Number(obj.timerDelaySecs)
          : DEFAULT_SETTINGS.timerDelaySecs,
    };
  }

  // Unknown -> reset
  return DEFAULT_SETTINGS;
}

export function loadSettings() {
  try {
    const raw = readSettingsRaw();
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  try {
    writeSettingsRaw(JSON.stringify(settings));
  } catch {
    // ignore write failures (private mode, etc.)
  }
}
