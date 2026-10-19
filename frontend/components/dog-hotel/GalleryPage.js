'use client';

import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { WEBSITE_INK } from '@/consts/website-theme';
import DogHotelInteriorPage from './DogHotelInteriorPage';

export default function GalleryPage({ images }) {
  const canLoop = images.length > 1;

  return (
    <DogHotelInteriorPage title="Gallery" lede="Photos from Care Bear Daycare.">
      {images.length > 0 ? (
        <Box
          sx={{
            mt: 4,
            '& .swiper': {
              width: '100%',
              pb: '2rem',
            },
            '& .swiper-button-prev, & .swiper-button-next': {
              color: '#fff',
              width: 40,
              height: 40,
              mt: 0,
              top: 'calc(50% - 1rem)',
              '&::after': {
                fontSize: 18,
                fontWeight: 700,
                textShadow: '0 1px 6px rgba(0, 0, 0, 0.45)',
              },
            },
            '& .swiper-pagination-bullet': {
              bgcolor: alpha(WEBSITE_INK, 0.28),
              opacity: 1,
            },
            '& .swiper-pagination-bullet-active': {
              bgcolor: WEBSITE_INK,
            },
          }}
        >
          <Swiper
            modules={[Navigation, Pagination, A11y]}
            navigation
            pagination={{ clickable: true }}
            loop={canLoop}
            slidesPerView={1}
            spaceBetween={0}
            a11y={{
              prevSlideMessage: 'Previous photo',
              nextSlideMessage: 'Next photo',
            }}
          >
            {images.map(image => (
              <SwiperSlide key={image.src}>
                <Box
                  component="img"
                  src={image.src}
                  alt={image.alt}
                  sx={{
                    display: 'block',
                    width: '100%',
                    aspectRatio: '4 / 3',
                    objectFit: 'cover',
                    bgcolor: alpha(WEBSITE_INK, 0.06),
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      ) : null}
    </DogHotelInteriorPage>
  );
}

GalleryPage.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string.isRequired,
    }),
  ).isRequired,
};
