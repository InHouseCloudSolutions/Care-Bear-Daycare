'use client';

// Add substrings of error messages you want hidden in dev here.
const SUPPRESSED = ['cense key.'];

// Must run synchronously at module load — MUI X fires console.error during
// React's render/useMemo phase, before any useEffect can intercept it.
/* eslint-disable no-console -- dev-only: filter known console.error noise */
if (typeof window !== 'undefined') {
  const original = console.error.bind(console);
  console.error = (...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (SUPPRESSED.some(p => msg.includes(p))) return;
    original(...args);
  };
}
/* eslint-enable no-console */

export default function DevConsoleSuppressor() {
  return null;
}
