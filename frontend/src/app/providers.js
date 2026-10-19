'use client';

import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import SettingsProvider from '@/contexts/SettingsContext';
import DevConsoleSuppressor from '@/components/DevConsoleSuppressor';

export default function Providers({ children }) {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') || 'dark';
    setMode(savedMode);
  }, []);

  useEffect(() => {
    if (mode !== null) {
      localStorage.setItem('themeMode', mode);
    }
  }, [mode]);

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  useEffect(() => {
    import('drag-drop-touch');
    return () => {};
  }, []);

  const themeContextValue = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <AuthProvider>
      <DevConsoleSuppressor />
      <ThemeContext.Provider value={themeContextValue}>
        <SettingsProvider>{children}</SettingsProvider>
      </ThemeContext.Provider>
    </AuthProvider>
  );
}

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};
