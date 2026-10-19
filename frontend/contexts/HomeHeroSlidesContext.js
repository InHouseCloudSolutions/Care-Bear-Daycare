'use client';

import { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { HOME_HERO_SLIDES } from '@/components/home-landing/home-landing-data';

const HomeHeroSlidesContext = createContext(HOME_HERO_SLIDES);

const homeHeroSlideShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  imageUrl: PropTypes.string.isRequired,
  alt: PropTypes.string,
  photographerCredit: PropTypes.string,
  durationMs: PropTypes.number,
});

export function HomeHeroSlidesProvider({ slides, children }) {
  const value = useMemo(() => {
    if (!slides?.length) return HOME_HERO_SLIDES;
    return slides;
  }, [slides]);

  return <HomeHeroSlidesContext.Provider value={value}>{children}</HomeHeroSlidesContext.Provider>;
}

HomeHeroSlidesProvider.propTypes = {
  slides: PropTypes.arrayOf(homeHeroSlideShape),
  children: PropTypes.node.isRequired,
};

export function useHomeHeroSlides() {
  return useContext(HomeHeroSlidesContext);
}
