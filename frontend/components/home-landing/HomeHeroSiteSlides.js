'use client';

import { useEffect, useState } from 'react';
import { listSiteImages } from '@/lib/daycareApi';
import { HomeHeroSlidesProvider } from '@/contexts/HomeHeroSlidesContext';
import { heroSlidesFromSiteImages } from '@/utils/siteImages';
import HomeHeroBackground from './HomeHeroBackground';

/**
 * Loads home slides and hands them to the existing hero provider.
 * A null mapping leaves the provider on the built-in HOME_HERO_SLIDES.
 */
export default function HomeHeroSiteSlides() {
  const [slides, setSlides] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await listSiteImages('home_slide');
      if (cancelled) return;
      const mapped = res.ok ? heroSlidesFromSiteImages(res.data) : null;
      if (mapped) setSlides(mapped);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <HomeHeroSlidesProvider slides={slides || undefined}>
      <HomeHeroBackground />
    </HomeHeroSlidesProvider>
  );
}
