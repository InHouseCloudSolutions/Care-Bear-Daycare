'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { HOME_LANDING_FONT_FAMILY } from '@/components/home-landing/home-landing-font';
import MarketingInteriorLayout from '@/components/home-landing/MarketingInteriorLayout';
import { WEBSITE_ACCENT, WEBSITE_INK, WEBSITE_PAGE_BACKGROUND } from '@/consts/website-theme';
import { STAY_WORLD } from './scroll-forge/stay-world-config';

const INK_SOFT = '#4E6A70';

export default function HowAStayWorksPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let api = null;
    let cancelled = false;

    root.style.setProperty('--sf-bg', WEBSITE_PAGE_BACKGROUND);
    root.style.setProperty('--sf-ink', WEBSITE_INK);
    root.style.setProperty('--sf-ink-soft', INK_SOFT);
    root.style.setProperty('--sf-accent', WEBSITE_ACCENT);
    root.style.setProperty('--sf-font-display', HOME_LANDING_FONT_FAMILY);
    root.style.setProperty('--sf-font-body', HOME_LANDING_FONT_FAMILY);

    import('./scroll-forge/world-engine').then(({ mountScrollForge }) => {
      if (cancelled || !rootRef.current) return;
      const scroller = rootRef.current.closest('.marketing-interior-scroll');
      api = mountScrollForge(rootRef.current, {
        ...STAY_WORLD,
        scroller: scroller || undefined,
      });
    });

    return () => {
      cancelled = true;
      if (api) api.destroy();
    };
  }, []);

  return (
    <MarketingInteriorLayout contentSx={{ p: 0 }}>
      <Box
        ref={rootRef}
        sx={{ width: '100%', minHeight: '100%', bgcolor: WEBSITE_PAGE_BACKGROUND }}
      />
    </MarketingInteriorLayout>
  );
}
