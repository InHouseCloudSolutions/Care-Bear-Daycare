import { createContext } from 'react';

// Named export used across the app; default export would force a large import churn.
// eslint-disable-next-line import/prefer-default-export -- shared context pattern
export const ThemeContext = createContext({
  mode: 'light',
  setMode: () => {},
});
