/** MUI `lg` = 1200px — marketing form pages use stacked layout below this width. */
export const FORM_PAGE_DESKTOP_BP = 'lg';

/** Matches MUI `theme.breakpoints.down('lg')` — mobile form pages grow with content. */
export const FORM_PAGE_MOBILE_MEDIA = '@media (max-width:1199.95px)';

/** Let form content grow inside the scrollable main region (nav stays fixed above). */
export const FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX = {
  [FORM_PAGE_MOBILE_MEDIA]: {
    flex: 'none',
    minHeight: 'auto',
    maxHeight: 'none',
    height: 'auto',
  },
};

/** Main content below nav scrolls independently on mobile form pages. */
export const FORM_PAGE_MOBILE_MAIN_SCROLL_SX = {
  [FORM_PAGE_MOBILE_MEDIA]: {
    overflowX: 'hidden',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
};

/** Shared dark frosted glass surface for nav overlays */
const NAV_GLASS_SURFACE_SX = {
  background:
    'linear-gradient(145deg, rgba(18,18,20,0.55) 0%, rgba(10,10,12,0.54) 42%, rgba(14,14,16,0.60) 100%)',
  backdropFilter: 'blur(20px) saturate(140%)',
  WebkitBackdropFilter: 'blur(40px) saturate(140%)',
};

/** Light scrim behind gallery mega menu and nav drawer */
export const NAV_GLASS_BACKDROP_COLOR = 'rgba(0,0,0,0.12)';

/** Full-width gallery mega menu — dark frosted glass for white text on light + dark pages */
export const NAV_GALLERY_GLASS_SX = {
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  ...NAV_GLASS_SURFACE_SX,
  boxShadow: [
    '0 12px 40px rgba(0, 0, 0, 0.38)',
    'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    'inset 0 -1px 0 rgba(0, 0, 0, 0.25)',
  ].join(', '),
};

/** Right-anchored nav drawer — same frosted glass as gallery mega menu */
export const NAV_DRAWER_GLASS_SX = {
  ...NAV_GLASS_SURFACE_SX,
  borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: [
    '-12px 0 40px rgba(0, 0, 0, 0.38)',
    'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    'inset 0 -1px 0 rgba(0, 0, 0, 0.25)',
  ].join(', '),
};

/** @deprecated Use NAV_GALLERY_GLASS_SX */
export const HERO_NAV_GALLERY_GLASS_SX = NAV_GALLERY_GLASS_SX;

/** Shared frosted glass surface — panel, fields, and label tabs */
export const GLASS_SURFACE_GRADIENT =
  'linear-gradient(145deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.1) 42%, rgba(255,255,255,0.16) 100%)';
export const GLASS_SURFACE_GRADIENT_DISABLED =
  'linear-gradient(145deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 42%, rgba(255,255,255,0.1) 100%)';
export const GLASS_SURFACE_BACKDROP = 'blur(40px) saturate(180%)';
export const GLASS_SURFACE_BORDER_COLOR = 'rgba(255, 255, 255, 0.38)';

export const GLASS_FIELD_SURFACE_SX = {
  background: GLASS_SURFACE_GRADIENT,
  backdropFilter: GLASS_SURFACE_BACKDROP,
  WebkitBackdropFilter: GLASS_SURFACE_BACKDROP,
};

/** Apple-style liquid glass panel over hero photography */
export const LIQUID_GLASS_PANEL_SX = {
  borderRadius: { xs: '20px', md: '24px' },
  border: `1px solid ${GLASS_SURFACE_BORDER_COLOR}`,
  ...GLASS_FIELD_SURFACE_SX,
  boxShadow: [
    '0 8px 40px rgba(0, 0, 0, 0.28)',
    'inset 0 1px 0 rgba(255, 255, 255, 0.45)',
    'inset 0 -1px 0 rgba(255, 255, 255, 0.1)',
  ].join(', '),
};

/** Label tab flush above the input (bottom of label meets top of field) */
export const GLASS_TAB_LABEL_SX = {
  display: 'block',
  alignSelf: 'flex-start',
  width: 'fit-content',
  maxWidth: '75%',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  px: 1.25,
  py: 0.45,
  mb: '2px',
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  lineHeight: 1.35,
  color: 'rgba(255, 255, 255, 0.88)',
  ...GLASS_FIELD_SURFACE_SX,
  border: `1px solid ${GLASS_SURFACE_BORDER_COLOR}`,
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '10px 10px 0 0',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25)',
  zIndex: 2,
};

/** @deprecated Labels are in-flow; kept for imports that reference the constant */
export const GLASS_LABEL_TAB_OVERFLOW = 0;

/** Shared horizontal inset for glass form panels */
export const GLASS_FORM_PANEL_HORIZONTAL_PAD = { xs: 2.5, md: 2.25 };

/** Panel padding without horizontal shorthand — scroll panel sets pl/pr explicitly. */
export const GLASS_FORM_PANEL_PADDING_SCROLL_PANEL_SX = {
  pl: GLASS_FORM_PANEL_HORIZONTAL_PAD,
  pb: { xs: 2.5, md: 2.25 },
  pt: { xs: 2, md: 2.25 },
};

/** Panel padding */
export const GLASS_FORM_PANEL_PADDING_SX = {
  ...GLASS_FORM_PANEL_PADDING_SCROLL_PANEL_SX,
  pr: GLASS_FORM_PANEL_HORIZONTAL_PAD,
};

/** Right inset for header/footer/body when the panel's own right padding is collapsed for a scrollbar. */
export const GLASS_FORM_SCROLL_GUTTER_PR = GLASS_FORM_PANEL_HORIZONTAL_PAD;

/** Thin gap between the scrollbar and the panel's right border when scrolling. */
export const GLASS_FORM_SCROLLBAR_EDGE_PR = { xs: 0.75, md: 0.75 };

/** Vertical gap between glass form rows (includes full-width fields) */
export const GLASS_FORM_ROW_SX = {
  mb: { xs: 2, md: 1.75 },
};

/** Gap between paired fields when stacked on mobile — matches row bottom margin on xs */
export const GLASS_FORM_PAIR_STACK_SPACING = { xs: 2, [FORM_PAGE_DESKTOP_BP]: 1.5 };

/** GlassTabTextField outer wrapper — label stacked above input */
export const GLASS_FIELD_WRAPPER_SX = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
};

export const GLASS_FORM_FOOTER_SX = {
  display: 'flex',
  flexDirection: { xs: 'column', [FORM_PAGE_DESKTOP_BP]: 'row' },
  alignItems: { xs: 'flex-start', [FORM_PAGE_DESKTOP_BP]: 'center' },
  justifyContent: 'space-between',
  gap: 1.5,
  mt: 0.25,
};

/** Frosted glass inputs — same transparent surface as the panel */
export const LIQUID_GLASS_FORM_SX = {
  '& .MuiFormControl-root': {
    mt: 0,
    mb: 0,
  },
  '& .MuiOutlinedInput-root': {
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
    background: `${GLASS_SURFACE_GRADIENT} !important`,
    backdropFilter: `${GLASS_SURFACE_BACKDROP} !important`,
    WebkitBackdropFilter: `${GLASS_SURFACE_BACKDROP} !important`,
    color: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '0 12px 12px 12px',
    '&.Mui-disabled': {
      background: `${GLASS_SURFACE_GRADIENT_DISABLED} !important`,
      color: 'rgba(255, 255, 255, 0.5)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.55)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.75)',
      borderWidth: '1px',
    },
    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: 'error.light',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderRadius: '0 12px 12px 12px',
    borderColor: GLASS_SURFACE_BORDER_COLOR,
  },
  '& .MuiOutlinedInput-input, & .MuiOutlinedInput-root textarea': {
    bgcolor: 'transparent',
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.95)',
    py: 1.125,
    fontSize: '0.9375rem',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.55)',
      opacity: 1,
    },
  },
  '& .MuiSelect-select': {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  '& .MuiSelect-icon': {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  '& .MuiFormHelperText-root': {
    mx: 0,
    mt: 0.25,
    mb: 0,
    lineHeight: 1.25,
    color: 'rgba(255, 255, 255, 0.75)',
    '&.Mui-error': {
      color: '#ffcdd2',
    },
  },
  '& .MuiFormControlLabel-label': {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  '& .MuiCheckbox-root': {
    color: 'rgba(255, 255, 255, 0.65)',
    '&.Mui-checked': {
      color: 'common.white',
    },
  },
};

export const LIQUID_GLASS_SUBMIT_BUTTON_SX = {
  borderRadius: '12px',
  bgcolor: '#ffffff',
  color: 'rgba(0, 0, 0, 0.87)',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'none',
  px: 3,
  '&:hover': {
    bgcolor: 'common.white',
  },
  '&.Mui-disabled': {
    bgcolor: 'rgba(255, 255, 255, 0.45)',
    color: 'rgba(0, 0, 0, 0.45)',
  },
};

/** Stack hero above form on very short displays (720p height). */
export const SHORT_VIEWPORT_MEDIA = '@media (max-height: 720px)';

/** Glass panel fills remaining column height; fields scroll between header and footer. */
export const GLASS_FORM_SCROLL_PANEL_SX = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  maxHeight: '100%',
  ...FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX,
};

export const GLASS_FORM_SCROLL_FORM_STACK_SX = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  ...FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX,
};

export const GLASS_FORM_SCROLL_HEADER_SX = {
  flexShrink: 0,
};

/** Frosted pill scrollbar for glass panels (WebKit + Firefox). */
export const LIQUID_GLASS_SCROLLBAR_SX = {
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(255, 255, 255, 0.45) transparent',
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-button': {
    display: 'none',
    height: 0,
    width: 0,
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
    marginBlock: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    background:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.52) 0%, rgba(255, 255, 255, 0.2) 100%)',
    borderRadius: '100px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: ['inset 0 1px 0 rgba(255, 255, 255, 0.55)', '0 1px 4px rgba(0, 0, 0, 0.12)'].join(
      ', ',
    ),
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.68) 0%, rgba(255, 255, 255, 0.34) 100%)',
  },
  '&::-webkit-scrollbar-thumb:active': {
    background:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.44) 100%)',
  },
  '&::-webkit-scrollbar-corner': {
    background: 'transparent',
  },
};

export const GLASS_FORM_SCROLL_BODY_SX = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  boxSizing: 'border-box',
  pr: 0,
  ...LIQUID_GLASS_SCROLLBAR_SX,
  ...FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX,
  [FORM_PAGE_MOBILE_MEDIA]: {
    flex: 'none',
    minHeight: 'auto',
    maxHeight: 'none',
    height: 'auto',
    overflowY: 'visible',
    pr: GLASS_FORM_PANEL_HORIZONTAL_PAD,
  },
};

/** Content inset inside the scroll body when the panel right padding is collapsed. */
export const GLASS_FORM_SCROLL_BODY_INNER_SX = {
  boxSizing: 'border-box',
};

export const GLASS_FORM_SCROLL_FOOTER_SX = {
  flexShrink: 0,
  pt: 0.5,
};

/** Root wrapper so the glass form fills the marketing form column. */
export const GLASS_FORM_ROOT_SX = {
  width: '100%',
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  ...FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX,
};

/** Wraps the glass panel so it fills remaining column height. */
export const GLASS_FORM_PANEL_WRAPPER_SX = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  ...FORM_PAGE_MOBILE_NATURAL_HEIGHT_SX,
};

/** Dark halo for white menu headings over variable / bright photography */
export const GLASS_MENU_TEXT_SHADOW = [
  '-0.5px -0.5px 0 rgba(0, 0, 0, 0.75)',
  '0.5px -0.5px 0 rgba(0, 0, 0, 0.75)',
  '-0.5px 0.5px 0 rgba(0, 0, 0, 0.75)',
  '0.5px 0.5px 0 rgba(0, 0, 0, 0.75)',
  '0 0 2px rgba(0, 0, 0, 0.6)',
  '0 2px 10px rgba(0, 0, 0, 0.45)',
].join(', ');

/** Softer shadow for sub-links — keeps body text bright white, not gray */
export const GLASS_MENU_SUB_LINK_TEXT_SHADOW = [
  '0 1px 3px rgba(0, 0, 0, 0.55)',
  '0 2px 8px rgba(0, 0, 0, 0.4)',
].join(', ');

export const heroTextLegibility = {
  color: 'common.white',
  textShadow: GLASS_MENU_TEXT_SHADOW,
};
