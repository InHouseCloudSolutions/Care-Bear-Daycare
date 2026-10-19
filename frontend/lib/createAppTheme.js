import { createTheme } from '@mui/material/styles';
import { HOME_LANDING_FONT_FAMILY } from '@/components/home-landing/home-landing-font';
import {
  STAFF_DARK_BACKGROUND,
  STAFF_DARK_PAPER,
  STAFF_DARK_SURFACE_ELEVATED,
  STAFF_DARK_SURFACE_MUTED,
  STAFF_LIGHT_SURFACE_ELEVATED,
  WEBSITE_ACCENT,
  WEBSITE_INK,
  WEBSITE_INK_HOVER,
  WEBSITE_PAGE_BACKGROUND,
  WEBSITE_PAGE_BACKGROUND_DARK,
  WEBSITE_PAGE_BACKGROUND_MUTED,
  WEBSITE_PAPER,
  WEBSITE_SCROLLBAR_THUMB,
  WEBSITE_SCROLLBAR_THUMB_HOVER,
  WEBSITE_SCROLLBAR_TRACK,
} from '@/consts/website-theme';

const customColors = {
  light: {
    primary: {
      light: WEBSITE_INK_HOVER,
      main: WEBSITE_INK,
      dark: '#082E34',
      contrastText: WEBSITE_PAGE_BACKGROUND,
    },
    secondary: {
      light: '#E4A86A',
      main: WEBSITE_ACCENT,
      dark: '#C47A38',
      contrastText: WEBSITE_INK,
    },
    error: {
      light: '#dc2626',
      main: '#b91c1c',
      dark: '#991b1b',
      contrastText: '#fff',
    },
    warning: {
      light: '#ea580c',
      main: '#c2410c',
      dark: '#9a3412',
      contrastText: '#fff',
    },
    info: {
      light: '#0e7490',
      main: '#155e75',
      dark: '#164e63',
      contrastText: '#fff',
    },
    success: {
      light: '#15803d',
      main: '#166534',
      dark: '#14532d',
      contrastText: '#fff',
    },
    red: {
      light: '#fee2e2',
      main: '#fecaca',
      dark: '#fca5a5',
      contrastText: '#000',
    },
    darkred: {
      light: '#dc2626',
      main: '#b91c1c',
      dark: '#991b1b',
      contrastText: '#fff',
    },
    orange: {
      light: '#ffedd5',
      main: '#fed7aa',
      dark: '#fdba74',
      contrastText: '#000',
    },
    amber: {
      light: '#fef3c7',
      main: '#fde68a',
      dark: '#fcd34d',
      contrastText: '#000',
    },
    yellow: {
      light: '#fef9c3',
      main: '#fef08a',
      dark: '#fde047',
      contrastText: '#000',
    },
    lime: {
      light: '#ecfccb',
      main: '#d9f99d',
      dark: '#bef264',
      contrastText: '#000',
    },
    green: {
      light: '#dcfce7',
      main: '#bbf7d0',
      dark: '#86efac',
      contrastText: '#000',
    },
    emerald: {
      light: '#d1fae5',
      main: '#a7f3d0',
      dark: '#6ee7b7',
      contrastText: '#000',
    },
    teal: {
      light: '#ccfbf1',
      main: '#99f6e4',
      dark: '#5eead4',
      contrastText: '#000',
    },
    cyan: {
      light: '#cffafe',
      main: '#a5f3fc',
      dark: '#67e8f9',
      contrastText: '#000',
    },
    sky: {
      light: '#e0f2fe',
      main: '#bae6fd',
      dark: '#7dd3fc',
      contrastText: '#000',
    },
    blue: {
      light: '#dbeafe',
      main: '#bfdbfe',
      dark: '#93c5fd',
      contrastText: '#000',
    },
    indigo: {
      light: '#e0e7ff',
      main: '#c7d2fe',
      dark: '#a5b4fc',
      contrastText: '#000',
    },
    violet: {
      light: '#ede9fe',
      main: '#ddd6fe',
      dark: '#c4b5fd',
      contrastText: '#000',
    },
    purple: {
      light: '#f3e8ff',
      main: '#e9d5ff',
      dark: '#d8b4fe',
      contrastText: '#000',
    },
    fuchsia: {
      light: '#fae8ff',
      main: '#f5d0fe',
      dark: '#f0abfc',
      contrastText: '#000',
    },
    pink: {
      light: '#fce7f3',
      main: '#fbcfe8',
      dark: '#f9a8d4',
      contrastText: '#000',
    },
    rose: {
      light: '#ffe4e6',
      main: '#fecdd3',
      dark: '#fda4af',
      contrastText: '#000',
    },
    slate: {
      light: '#f1f5f9',
      main: '#e2e8f0',
      dark: '#cbd5e1',
      contrastText: '#000',
    },
    gray: {
      light: '#f3f4f6',
      main: '#e5e7eb',
      dark: '#d1d5db',
      contrastText: '#000',
    },
    zinc: {
      light: '#f4f4f5',
      main: '#e4e4e7',
      dark: '#d4d4d8',
      contrastText: '#000',
    },
    neutral: {
      light: '#f5f5f5',
      main: '#e5e5e5',
      dark: '#d4d4d4',
      contrastText: '#000',
    },
    stone: {
      light: '#f5f5f4',
      main: '#e7e5e4',
      dark: '#d6d3d1',
      contrastText: '#000',
    },
  },
  dark: {
    primary: {
      light: '#6FB8C4',
      main: '#9FD4DE',
      dark: '#D7EEF2',
      contrastText: STAFF_DARK_BACKGROUND,
    },
    secondary: {
      light: '#F0C48A',
      main: '#F0C48A',
      dark: WEBSITE_ACCENT,
      contrastText: STAFF_DARK_BACKGROUND,
    },
    error: {
      light: '#fee2e2',
      main: '#fecaca',
      dark: '#fca5a5',
      contrastText: '#000',
    },
    warning: {
      light: '#ffedd5',
      main: '#fed7aa',
      dark: '#fdba74',
      contrastText: '#000',
    },
    info: {
      light: '#cffafe',
      main: '#a5f3fc',
      dark: '#67e8f9',
      contrastText: '#000',
    },
    success: {
      light: '#dcfce7',
      main: '#bbf7d0',
      dark: '#86efac',
      contrastText: '#000',
    },
    red: {
      light: '#fee2e2',
      main: '#fecaca',
      dark: '#fca5a5',
      contrastText: '#000',
    },
    darkred: {
      light: '#dc2626',
      main: '#b91c1c',
      dark: '#991b1b',
      contrastText: '#fff',
    },
    orange: {
      light: '#ffedd5',
      main: '#fed7aa',
      dark: '#fdba74',
      contrastText: '#000',
    },
    amber: {
      light: '#fef3c7',
      main: '#fde68a',
      dark: '#fcd34d',
      contrastText: '#000',
    },
    yellow: {
      light: '#fef9c3',
      main: '#fef08a',
      dark: '#fde047',
      contrastText: '#000',
    },
    lime: {
      light: '#ecfccb',
      main: '#d9f99d',
      dark: '#bef264',
      contrastText: '#000',
    },
    green: {
      light: '#dcfce7',
      main: '#bbf7d0',
      dark: '#86efac',
      contrastText: '#000',
    },
    emerald: {
      light: '#d1fae5',
      main: '#a7f3d0',
      dark: '#6ee7b7',
      contrastText: '#000',
    },
    teal: {
      light: '#ccfbf1',
      main: '#99f6e4',
      dark: '#5eead4',
      contrastText: '#000',
    },
    cyan: {
      light: '#cffafe',
      main: '#a5f3fc',
      dark: '#67e8f9',
      contrastText: '#000',
    },
    sky: {
      light: '#e0f2fe',
      main: '#bae6fd',
      dark: '#7dd3fc',
      contrastText: '#000',
    },
    blue: {
      light: '#dbeafe',
      main: '#bfdbfe',
      dark: '#93c5fd',
      contrastText: '#000',
    },
    indigo: {
      light: '#e0e7ff',
      main: '#c7d2fe',
      dark: '#a5b4fc',
      contrastText: '#000',
    },
    violet: {
      light: '#ede9fe',
      main: '#ddd6fe',
      dark: '#c4b5fd',
      contrastText: '#000',
    },
    purple: {
      light: '#f3e8ff',
      main: '#e9d5ff',
      dark: '#d8b4fe',
      contrastText: '#000',
    },
    fuchsia: {
      light: '#fae8ff',
      main: '#f5d0fe',
      dark: '#f0abfc',
      contrastText: '#000',
    },
    pink: {
      light: '#fce7f3',
      main: '#fbcfe8',
      dark: '#f9a8d4',
      contrastText: '#000',
    },
    rose: {
      light: '#ffe4e6',
      main: '#fecdd3',
      dark: '#fda4af',
      contrastText: '#000',
    },
    slate: {
      light: '#f1f5f9',
      main: '#e2e8f0',
      dark: '#cbd5e1',
      contrastText: '#000',
    },
    gray: {
      light: '#f3f4f6',
      main: '#e5e7eb',
      dark: '#d1d5db',
      contrastText: '#000',
    },
    zinc: {
      light: '#f4f4f5',
      main: '#e4e4e7',
      dark: '#d4d4d8',
      contrastText: '#000',
    },
    neutral: {
      light: '#f5f5f5',
      main: '#e5e5e5',
      dark: '#d4d4d4',
      contrastText: '#000',
    },
    stone: {
      light: '#f5f5f4',
      main: '#e7e5e4',
      dark: '#d6d3d1',
      contrastText: '#000',
    },
  },
};

/**
 * @param {'light' | 'dark'} muiMode
 * @param {{ staffTypography?: boolean }} [options]
 */
// eslint-disable-next-line import/prefer-default-export -- shared theme factory
export function createAppTheme(muiMode, { staffTypography = false } = {}) {
  const selectedColors = customColors[muiMode === 'light' ? 'light' : 'dark'];
  const isLight = muiMode === 'light';

  const built = createTheme({
    palette: {
      mode: muiMode,
      ...selectedColors,
      ...(isLight && {
        text: {
          primary: WEBSITE_INK,
        },
        background: {
          default: WEBSITE_PAGE_BACKGROUND,
          paper: staffTypography ? STAFF_LIGHT_SURFACE_ELEVATED : WEBSITE_PAPER,
          muted: WEBSITE_PAGE_BACKGROUND_MUTED,
          dark: WEBSITE_PAGE_BACKGROUND_DARK,
        },
      }),
      ...(!isLight && {
        background: {
          default: STAFF_DARK_BACKGROUND,
          paper: STAFF_DARK_PAPER,
          muted: STAFF_DARK_SURFACE_MUTED,
          dark: STAFF_DARK_SURFACE_ELEVATED,
        },
      }),
    },
    ...(staffTypography && {
      typography: {
        fontFamily: HOME_LANDING_FONT_FAMILY,
      },
      components: {
        // Staff light: same cream scrollbars as marketing-interior.css.
        // Dark mode keeps browser defaults (color-scheme: dark).
        ...(isLight && {
          MuiCssBaseline: {
            styleOverrides: `
              html {
                --website-scrollbar-track: ${WEBSITE_SCROLLBAR_TRACK};
                --website-scrollbar-thumb: ${WEBSITE_SCROLLBAR_THUMB};
                --website-scrollbar-thumb-hover: ${WEBSITE_SCROLLBAR_THUMB_HOVER};
              }
              * {
                scrollbar-width: thin;
                scrollbar-color: var(--website-scrollbar-thumb) var(--website-scrollbar-track);
              }
              *::-webkit-scrollbar {
                width: 10px;
              }
              *::-webkit-scrollbar-button {
                display: none;
                height: 0;
                width: 0;
              }
              *::-webkit-scrollbar-track {
                background: var(--website-scrollbar-track);
              }
              *::-webkit-scrollbar-thumb {
                background-color: var(--website-scrollbar-thumb);
                border: 2px solid var(--website-scrollbar-track);
                border-radius: 100px;
              }
              *::-webkit-scrollbar-thumb:hover {
                background-color: var(--website-scrollbar-thumb-hover);
              }
            `,
          },
        }),
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
        MuiCard: {
          defaultProps: {
            elevation: 0,
          },
          styleOverrides: {
            root: ({ theme }) => ({
              backgroundImage: 'none',
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.background.dark,
            }),
          },
        },
      },
    }),
  });

  built.palette.default =
    muiMode === 'light'
      ? {
          light: built.palette.grey[600],
          main: built.palette.grey[700],
          dark: built.palette.grey[800],
          contrastText: built.palette.text.primary,
        }
      : {
          light: built.palette.grey[600],
          main: built.palette.grey[700],
          dark: built.palette.grey[800],
          contrastText: built.palette.text.primary,
        };

  return built;
}
