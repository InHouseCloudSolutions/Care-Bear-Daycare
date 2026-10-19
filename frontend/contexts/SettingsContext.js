import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/utils/settings';

export const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  setBgColor: () => {},
  setTimerDelaySecs: () => {},
  resetSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export default function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false); // <- block saving until true

  // Load once on mount
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setHydrated(true); // enable persistence AFTER we have the user's settings
  }, []);

  // Persist only after hydration (prevents overwriting user settings with defaults)
  useEffect(() => {
    if (!hydrated) return; // <- guard
    saveSettings(settings);
  }, [settings, hydrated]);

  const setBgColor = useCallback(
    color => {
      setSettings(prev => {
        const next = {
          ...prev,
          sponsorBgColor: color && color.trim() ? color : DEFAULT_SETTINGS.sponsorBgColor,
        };
        if (hydrated) saveSettings(next); // <- only save if hydrated
        return next;
      });
    },
    [hydrated],
  );

  const setTimerDelaySecs = useCallback(
    secs => {
      setSettings(prev => {
        const n = Number(secs);
        const next = {
          ...prev,
          timerDelaySecs: Number.isFinite(n) && n > 0 ? n : prev.timerDelaySecs,
        };
        if (hydrated) saveSettings(next); // <- only save if hydrated
        return next;
      });
    },
    [hydrated],
  );

  const resetSettings = useCallback(() => {
    if (hydrated) saveSettings(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
  }, [hydrated]);

  const value = useMemo(
    () => ({ settings, setBgColor, setTimerDelaySecs, resetSettings }),
    [settings, setBgColor, setTimerDelaySecs, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
