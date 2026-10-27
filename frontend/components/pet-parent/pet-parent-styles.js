/** Shared cream/teal styling tokens for the pet-parent login, register, and account pages. */

import { alpha } from '@mui/material/styles';
import { WEBSITE_INK, WEBSITE_INK_HOVER, WEBSITE_PAPER } from '@/consts/website-theme';

export const SECTION_HEADING_SX = {
  fontWeight: 600,
  letterSpacing: '0.02em',
  fontSize: { xs: '1.25rem', md: '1.5rem' },
  color: WEBSITE_INK,
};

export const CARD_SX = {
  bgcolor: WEBSITE_PAPER,
  border: `1px solid ${alpha(WEBSITE_INK, 0.12)}`,
  borderRadius: 2,
  p: { xs: 2.5, md: 3 },
};

export const FORM_STACK_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  mt: 3,
  maxWidth: 420,
};

export const PRIMARY_BUTTON_SX = {
  bgcolor: WEBSITE_INK,
  color: WEBSITE_PAPER,
  borderRadius: 999,
  textTransform: 'none',
  letterSpacing: '0.04em',
  fontWeight: 600,
  fontSize: { xs: 15, md: 16 },
  px: 3.5,
  py: 1.1,
  boxShadow: 'none',
  alignSelf: 'flex-start',
  '&:hover': {
    bgcolor: WEBSITE_INK_HOVER,
    boxShadow: 'none',
  },
};

export const SECONDARY_BUTTON_SX = {
  textTransform: 'none',
  letterSpacing: '0.02em',
  fontWeight: 600,
  borderRadius: 999,
  borderColor: alpha(WEBSITE_INK, 0.35),
  color: WEBSITE_INK,
  px: 2.5,
  '&:hover': {
    borderColor: WEBSITE_INK,
    bgcolor: alpha(WEBSITE_INK, 0.05),
  },
};
