import { alpha } from '@mui/material/styles';
import { WEBSITE_ACCENT, WEBSITE_HEART, WEBSITE_INK } from '@/consts/website-theme';

/** Hairline that reads on cream and on teal charcoal. */
export function hairline(theme, strength = 0.12) {
  return theme.palette.mode === 'dark' ? alpha('#ffffff', strength) : alpha(WEBSITE_INK, strength);
}

const pillBase = {
  borderRadius: 999,
  textTransform: 'none',
  fontWeight: 600,
  letterSpacing: '0.02em',
  px: 2,
  py: 0.75,
  minHeight: 38,
  whiteSpace: 'nowrap',
};

export const accentFilledSx = {
  ...pillBase,
  boxShadow: 'none',
  bgcolor: WEBSITE_ACCENT,
  color: WEBSITE_INK,
  '&:hover': { bgcolor: '#E4A86A', boxShadow: 'none' },
  '&.Mui-disabled': { bgcolor: alpha(WEBSITE_ACCENT, 0.4), color: alpha(WEBSITE_INK, 0.6) },
};

export function neutralPillSx(theme) {
  return {
    ...pillBase,
    color: 'text.primary',
    borderColor: hairline(theme, 0.28),
    '&:hover': { borderColor: WEBSITE_ACCENT, bgcolor: alpha(WEBSITE_ACCENT, 0.08) },
  };
}

export const removeFilledSx = {
  ...pillBase,
  boxShadow: 'none',
  bgcolor: WEBSITE_HEART,
  color: '#FFFCF7',
  '&:hover': { bgcolor: '#B9442A', boxShadow: 'none' },
};

export const dialogPaperSx = {
  borderRadius: '20px',
  bgcolor: 'background.paper',
  backgroundImage: 'none',
};

export function cardSx(theme) {
  return {
    borderRadius: '16px',
    border: '1px solid',
    borderColor: hairline(theme, 0.1),
    bgcolor: 'background.paper',
    backgroundImage: 'none',
    overflow: 'hidden',
  };
}

/** Small round icon button used on photo cards. */
export function cardIconSx(theme) {
  return {
    width: 34,
    height: 34,
    color: 'text.primary',
    border: '1px solid',
    borderColor: hairline(theme, 0.14),
    '&:hover': { borderColor: WEBSITE_ACCENT, bgcolor: alpha(WEBSITE_ACCENT, 0.1) },
    '&.Mui-disabled': { borderColor: 'transparent' },
    '&:focus-visible': { outline: `2px solid ${WEBSITE_ACCENT}`, outlineOffset: 2 },
  };
}

export const visuallyHiddenInputSx = {
  position: 'absolute',
  width: 1,
  height: 1,
  p: 0,
  m: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/** Quiet pill used in the staff page header (theme toggle, Log out, page links). */
export function utilityButtonSx(theme) {
  return {
    borderRadius: 999,
    textTransform: 'none',
    fontWeight: 600,
    letterSpacing: '0.02em',
    color: 'text.primary',
    px: 1.75,
    minHeight: 38,
    border: '1px solid',
    borderColor: hairline(theme, 0.2),
    '&:hover': { borderColor: WEBSITE_ACCENT, bgcolor: alpha(WEBSITE_ACCENT, 0.1) },
  };
}

/** Underlined section tabs shared by the staff pages. */
export function staffTabsSx(theme) {
  return {
    mt: 3,
    minHeight: 48,
    borderBottom: '1px solid',
    borderColor: hairline(theme, 0.12),
    '& .MuiTabs-indicator': {
      bgcolor: WEBSITE_ACCENT,
      height: 3,
      borderRadius: '3px 3px 0 0',
    },
  };
}

export const staffTabSx = {
  minHeight: 48,
  px: 1,
  mr: 3,
  minWidth: 0,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: 15,
  letterSpacing: '0.02em',
  color: 'text.secondary',
  '&.Mui-selected': { color: 'text.primary' },
  '&:hover': { color: 'text.primary' },
  '&.Mui-focusVisible': {
    outline: `2px solid ${WEBSITE_ACCENT}`,
    outlineOffset: -2,
    borderRadius: '8px',
  },
};
