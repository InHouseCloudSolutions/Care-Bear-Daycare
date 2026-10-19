import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, useMediaQuery, useTheme } from '@mui/material';
import {
  FORM_PAGE_DESKTOP_BP,
  GLASS_FORM_PANEL_HORIZONTAL_PAD,
  GLASS_FORM_PANEL_PADDING_SCROLL_PANEL_SX,
  GLASS_FORM_PANEL_WRAPPER_SX,
  GLASS_FORM_SCROLL_BODY_INNER_SX,
  GLASS_FORM_SCROLL_BODY_SX,
  GLASS_FORM_SCROLL_FOOTER_SX,
  GLASS_FORM_SCROLL_FORM_STACK_SX,
  GLASS_FORM_SCROLLBAR_EDGE_PR,
  GLASS_FORM_SCROLL_GUTTER_PR,
  GLASS_FORM_SCROLL_HEADER_SX,
  GLASS_FORM_SCROLL_PANEL_SX,
} from './design-studio-glass';

function useVerticalScrollbar(ref, deps = []) {
  const [hasScrollbar, setHasScrollbar] = useState(false);

  const check = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setHasScrollbar(el.scrollHeight > el.clientHeight + 1);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observeContent = () => {
      check();
      const observer = new ResizeObserver(check);
      observer.observe(el);
      if (el.firstElementChild) {
        observer.observe(el.firstElementChild);
      }
      return observer;
    };

    const observer = observeContent();
    const raf = window.requestAnimationFrame(check);

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [check, ref, ...deps]);

  return hasScrollbar;
}

export default function GlassFormScrollPanel({
  panelSx,
  formSx,
  onSubmit,
  noValidate = true,
  header,
  footer,
  children,
}) {
  const scrollBodyRef = useRef(null);
  const hasScrollbar = useVerticalScrollbar(scrollBodyRef, [children, header, footer]);

  const panelPr = hasScrollbar ? GLASS_FORM_SCROLLBAR_EDGE_PR : GLASS_FORM_PANEL_HORIZONTAL_PAD;
  const contentPr = hasScrollbar ? GLASS_FORM_SCROLL_GUTTER_PR : 0;

  return (
    <Box
      sx={{
        ...panelSx,
        ...GLASS_FORM_SCROLL_PANEL_SX,
        ...GLASS_FORM_PANEL_PADDING_SCROLL_PANEL_SX,
        pr: panelPr,
      }}
    >
      <Stack
        component="form"
        onSubmit={onSubmit}
        noValidate={noValidate}
        spacing={0}
        sx={{
          ...formSx,
          ...GLASS_FORM_SCROLL_FORM_STACK_SX,
        }}
      >
        {header ? <Box sx={{ ...GLASS_FORM_SCROLL_HEADER_SX, pr: contentPr }}>{header}</Box> : null}
        <Box ref={scrollBodyRef} sx={GLASS_FORM_SCROLL_BODY_SX}>
          <Box sx={{ ...GLASS_FORM_SCROLL_BODY_INNER_SX, pr: contentPr }}>{children}</Box>
        </Box>
        {footer ? <Box sx={{ ...GLASS_FORM_SCROLL_FOOTER_SX, pr: contentPr }}>{footer}</Box> : null}
      </Stack>
    </Box>
  );
}

GlassFormScrollPanel.propTypes = {
  panelSx: PropTypes.object,
  formSx: PropTypes.object,
  onSubmit: PropTypes.func,
  noValidate: PropTypes.bool,
  header: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node.isRequired,
};

/** Glass: internal field scroll on desktop; full-height form + page scroll on mobile. */
export function MarketingFormPanel({
  isGlass = false,
  panelSx,
  formSx,
  onSubmit,
  noValidate = true,
  header,
  footer,
  children,
}) {
  const theme = useTheme();
  const isDesktopFormLayout = useMediaQuery(theme.breakpoints.up(FORM_PAGE_DESKTOP_BP));

  if (isGlass && isDesktopFormLayout) {
    return (
      <Box sx={GLASS_FORM_PANEL_WRAPPER_SX}>
        <GlassFormScrollPanel
          panelSx={panelSx}
          formSx={formSx}
          onSubmit={onSubmit}
          noValidate={noValidate}
          header={header}
          footer={footer}
        >
          {children}
        </GlassFormScrollPanel>
      </Box>
    );
  }

  if (isGlass) {
    return (
      <Box sx={GLASS_FORM_PANEL_WRAPPER_SX}>
        <Box sx={panelSx}>
          <Stack
            component="form"
            onSubmit={onSubmit}
            noValidate={noValidate}
            spacing={0}
            sx={formSx}
          >
            {header}
            {children}
            {footer}
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={panelSx}>
      <Stack component="form" onSubmit={onSubmit} noValidate={noValidate} spacing={0} sx={formSx}>
        {header}
        {children}
        {footer}
      </Stack>
    </Box>
  );
}

MarketingFormPanel.propTypes = {
  isGlass: PropTypes.bool,
  panelSx: PropTypes.object,
  formSx: PropTypes.object,
  onSubmit: PropTypes.func,
  noValidate: PropTypes.bool,
  header: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node.isRequired,
};
