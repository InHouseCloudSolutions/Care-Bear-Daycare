import { useCallback } from 'react';
import { Box } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, A11y } from 'swiper/modules';
import CreditedImage from '@/components/website/CreditedImage';
import { useHomeHeroSlides } from '@/contexts/HomeHeroSlidesContext';
import { HOME_HERO_FADE_MS, HOME_HERO_SLIDES } from './home-landing-data';

export default function HomeHeroBackground() {
  const contextSlides = useHomeHeroSlides();
  const slides = contextSlides?.length ? contextSlides : HOME_HERO_SLIDES;

  const handleSlideChange = useCallback(
    swiper => {
      const slide = slides[swiper.realIndex];
      if (!slide || !swiper.params.autoplay) return;
      swiper.params.autoplay.delay = slide.durationMs;
      swiper.autoplay.stop();
      swiper.autoplay.start();
    },
    [slides],
  );

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
      }}
      aria-hidden
    >
      <Swiper
        className="home-hero-swiper"
        modules={[Autoplay, EffectFade, A11y]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={HOME_HERO_FADE_MS}
        loop
        allowTouchMove={false}
        autoplay={{
          delay: slides[0].durationMs,
          disableOnInteraction: false,
        }}
        onSlideChange={handleSlideChange}
        style={{ width: '100%', height: '100%' }}
      >
        {slides.map(slide => (
          <SwiperSlide key={slide.id}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                '--home-zoom-duration': `${slide.durationMs + HOME_HERO_FADE_MS}ms`,
              }}
            >
              <CreditedImage
                src={slide.imageUrl}
                alt={slide.alt || ''}
                photographerCredit={slide.photographerCredit}
                imgClassName="home-hero-bg-image"
                imgStyle={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                sx={{ position: 'absolute', inset: 0 }}
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: `
            linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)),
            linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 30%),
            linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 45%),
            radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.2) 100%)
          `,
        }}
      />
    </Box>
  );
}
