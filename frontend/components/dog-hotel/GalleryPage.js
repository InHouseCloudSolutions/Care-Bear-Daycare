'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { Box, Button, Dialog, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { BOOK_STAY_PATH } from '@/consts/routes';
import { WEBSITE_INK, WEBSITE_PAGE_BACKGROUND } from '@/consts/website-theme';
import publicPath from '@/utils/publicPath';
import DogHotelInteriorPage from './DogHotelInteriorPage';

const TEAL = WEBSITE_INK;
const ORANGE = '#E87920';
const ORANGE_HOVER = '#CF6818';
const BODY = '#6A625A';
const ARROW_CREAM_SRC = publicPath('/imgs/reviews/arrow-external-cream.svg');

const imageShape = PropTypes.shape({
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
});

const eyebrowSx = {
  color: TEAL,
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  m: 0,
};

const displaySx = {
  color: TEAL,
  fontWeight: 700,
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
  m: 0,
};

/**
 * Seven-photo mosaic from the gallery concept:
 * a tall portrait, four squares, then a wide photo beside a portrait.
 * Shorter groups avoid empty cells.
 */
function tilePlacement(index, count) {
  const groupStart = Math.floor(index / 7) * 7;
  const remainder = count - groupStart;
  const local = index - groupStart;
  const featured = { column: '1', row: 'span 2', fill: true };
  const square = column => ({ column, ratio: '1 / 1' });

  if (remainder >= 7 || remainder === 5) {
    const full = [
      featured,
      square('2'),
      square('3'),
      square('2'),
      square('3'),
      { column: '1 / 3', ratio: '2 / 1' },
      { column: '3', fill: true },
    ];
    return full[local];
  }

  if (remainder === 6) {
    if (local < 5) return [featured, square('2'), square('3'), square('2'), square('3')][local];
    return { column: '1 / -1', ratio: '16 / 9' };
  }

  if (remainder === 1) return { column: '1 / -1', ratio: '16 / 9' };
  if (remainder === 2) {
    if (local === 0) return { column: '1 / 3', ratio: '2 / 1' };
    return { column: '3', fill: true };
  }
  if (remainder === 4 && local === 3) return { column: '1 / -1', ratio: '16 / 9' };
  return { column: 'span 1', ratio: '1 / 1' };
}

function photoCountLabel(count) {
  return `${count} ${count === 1 ? 'photo' : 'photos'}`;
}

function photoName(image, index) {
  const alt = typeof image.alt === 'string' ? image.alt.trim() : '';
  return alt || `Photo ${index + 1}`;
}

function CameraIcon() {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      sx={{ width: 22, height: 22, display: 'block', flexShrink: 0 }}
    >
      <path
        d="M8.2 7.2 9.4 5.5h5.2l1.2 1.7H19a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18v-9A1.5 1.5 0 0 1 5 7.2h3.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="13.2" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </Box>
  );
}

function ExpandIcon({ size = 16 }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      sx={{ width: size, height: size, display: 'block' }}
    >
      <path
        d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Box>
  );
}

ExpandIcon.propTypes = {
  size: PropTypes.number,
};

function HeartIcon() {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      sx={{ width: 28, height: 28, display: 'block', mx: 'auto', color: '#fff' }}
    >
      <path
        d="M12 19.4s-6.4-4-6.4-8.1a3.6 3.6 0 0 1 6.4-1.7 3.6 3.6 0 0 1 6.4 1.7c0 4.1-6.4 8.1-6.4 8.1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Box>
  );
}

function GalleryTile({ image, index, placement, onOpen }) {
  const name = photoName(image, index);

  return (
    <Box
      component="li"
      sx={{
        gridColumn: { xs: '1 / -1', md: placement.column },
        gridRow: { xs: 'auto', md: placement.row || 'auto' },
        aspectRatio: { xs: '4 / 3', md: placement.fill ? 'auto' : placement.ratio },
        height: { xs: 'auto', md: placement.fill ? '100%' : 'auto' },
        minWidth: 0,
        minHeight: { md: placement.fill ? 0 : 'auto' },
      }}
    >
      <Box
        component="button"
        type="button"
        onClick={onOpen}
        aria-label={`View full size: ${name}`}
        sx={{
          position: 'relative',
          display: 'block',
          width: '100%',
          height: '100%',
          p: 0,
          border: 0,
          borderRadius: '18px',
          overflow: 'hidden',
          cursor: 'pointer',
          bgcolor: alpha(TEAL, 0.08),
          color: 'inherit',
          font: 'inherit',
          '& img': { transition: 'transform 240ms ease' },
          '&:hover img, &:focus-visible img': { transform: 'scale(1.035)' },
          '&:focus-visible': {
            outline: `3px solid ${TEAL}`,
            outlineOffset: 3,
          },
          '@media (prefers-reduced-motion: reduce)': {
            '& img': { transition: 'none' },
            '&:hover img, &:focus-visible img': { transform: 'none' },
          },
        }}
      >
        <Box
          component="img"
          src={image.src}
          alt=""
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            width: 34,
            height: 34,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 252, 247, 0.94)',
            color: TEAL,
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 1px 4px rgba(11, 36, 40, 0.22)',
          }}
        >
          <ExpandIcon />
        </Box>
      </Box>
    </Box>
  );
}

GalleryTile.propTypes = {
  image: imageShape.isRequired,
  index: PropTypes.number.isRequired,
  placement: PropTypes.shape({
    column: PropTypes.string.isRequired,
    row: PropTypes.string,
    ratio: PropTypes.string,
    fill: PropTypes.bool,
  }).isRequired,
  onOpen: PropTypes.func.isRequired,
};

function LightboxControl({ label, onClick, sx, children }) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={label}
      onClick={onClick}
      sx={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: 0,
        p: 0,
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        bgcolor: 'rgba(255, 252, 247, 0.94)',
        color: TEAL,
        font: 'inherit',
        fontSize: 22,
        fontWeight: 700,
        lineHeight: 1,
        '&:hover': { bgcolor: '#fff' },
        '&:focus-visible': { outline: `3px solid ${ORANGE}`, outlineOffset: 2 },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

LightboxControl.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  sx: PropTypes.object,
  children: PropTypes.node.isRequired,
};

function PhotoLightbox({ images, index, onClose, onIndex }) {
  const image = index != null ? images[index] : null;
  const several = images.length > 1;

  useEffect(() => {
    if (index == null || !several) return undefined;

    function onKey(event) {
      if (event.key === 'ArrowRight') onIndex((index + 1) % images.length);
      if (event.key === 'ArrowLeft') onIndex((index - 1 + images.length) % images.length);
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, index, onIndex, several]);

  return (
    <Dialog
      open={image != null}
      onClose={onClose}
      maxWidth={false}
      aria-labelledby="gallery-lightbox-title"
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          m: { xs: 1.5, md: 3 },
          maxWidth: 'none',
          overflow: 'visible',
        },
      }}
      BackdropProps={{
        sx: { bgcolor: 'rgba(8, 32, 36, 0.84)' },
      }}
    >
      {image ? (
        <Box sx={{ position: 'relative', maxWidth: 'min(1080px, 92vw)' }}>
          <Typography
            id="gallery-lightbox-title"
            sx={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
            }}
          >
            {photoName(image, index)}
          </Typography>
          <Box
            component="img"
            src={image.src}
            alt={photoName(image, index)}
            sx={{
              display: 'block',
              maxWidth: 'min(1080px, 92vw)',
              maxHeight: '82vh',
              width: 'auto',
              height: 'auto',
              borderRadius: '16px',
              bgcolor: '#102E32',
            }}
          />
          <LightboxControl
            label="Close photo"
            onClick={onClose}
            sx={{ position: 'absolute', top: 12, right: 12 }}
          >
            ×
          </LightboxControl>
          {several ? (
            <LightboxControl
              label="Previous photo"
              onClick={() => onIndex((index - 1 + images.length) % images.length)}
              sx={{
                position: 'absolute',
                top: '50%',
                left: { xs: 8, md: -22 },
                transform: 'translateY(-50%)',
              }}
            >
              ‹
            </LightboxControl>
          ) : null}
          {several ? (
            <LightboxControl
              label="Next photo"
              onClick={() => onIndex((index + 1) % images.length)}
              sx={{
                position: 'absolute',
                top: '50%',
                right: { xs: 8, md: -22 },
                transform: 'translateY(-50%)',
              }}
            >
              ›
            </LightboxControl>
          ) : null}
          <Typography
            component="p"
            sx={{ m: 0, mt: 1.25, color: 'rgba(255,252,247,0.88)', textAlign: 'center' }}
          >
            {`${index + 1} of ${images.length}`}
          </Typography>
        </Box>
      ) : null}
    </Dialog>
  );
}

PhotoLightbox.propTypes = {
  images: PropTypes.arrayOf(imageShape).isRequired,
  index: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
  onClose: PropTypes.func.isRequired,
  onIndex: PropTypes.func.isRequired,
};

export default function GalleryPage({ images }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const count = images.length;

  return (
    <DogHotelInteriorPage
      title="Small moments. Big personalities."
      suppressHeading
      frameMaxWidth={1120}
      contentSx={{ bgcolor: WEBSITE_PAGE_BACKGROUND }}
    >
      <Box
        component="header"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.2fr) minmax(220px, 0.7fr)' },
          gap: { xs: 3, md: 6 },
          alignItems: 'center',
        }}
      >
        <Box sx={{ maxWidth: 640 }}>
          <Typography component="p" sx={eyebrowSx}>
            Gallery
          </Typography>
          <Typography
            component="h1"
            sx={{ ...displaySx, fontSize: { xs: '2.7rem', sm: '3.4rem', md: '4rem' }, mt: 1.5 }}
          >
            Small moments.
            <Box component="br" />
            Big personalities.
          </Typography>
        </Box>
        <Box sx={{ maxWidth: 320, justifySelf: { md: 'end' } }}>
          <Typography
            component="p"
            sx={{
              m: 0,
              color: BODY,
              fontSize: { xs: '1.02rem', md: '1.125rem' },
              lineHeight: 1.55,
            }}
          >
            A few favourite faces and moments from our photo collection.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, color: TEAL }}>
            <CameraIcon />
            <Typography component="p" sx={{ m: 0, fontWeight: 700, fontSize: '1.02rem' }}>
              {photoCountLabel(count)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        component="section"
        aria-label="The gallery"
        sx={{
          mt: { xs: 4, md: 5 },
          pt: { xs: 3, md: 3.5 },
          borderTop: `1px solid ${alpha(TEAL, 0.14)}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'baseline' },
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Typography
            component="h2"
            sx={{ ...displaySx, fontSize: { xs: '1.65rem', md: '1.85rem' } }}
          >
            The gallery
          </Typography>
          {count > 0 ? (
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: alpha(TEAL, 0.72) }}
            >
              <ExpandIcon size={15} />
              <Typography component="p" sx={{ m: 0, fontSize: '0.95rem' }}>
                Select a photo to view full size
              </Typography>
            </Box>
          ) : null}
        </Box>

        {count > 0 ? (
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              mt: { xs: 2.5, md: 3 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: count === 1 ? '1fr' : '1.28fr 1fr 1fr' },
              gap: { xs: 1.5, md: 1.75 },
              alignItems: 'stretch',
            }}
          >
            {images.map((image, index) => (
              <GalleryTile
                key={`${image.src}-${index}`}
                image={image}
                index={index}
                placement={tilePlacement(index, count)}
                onOpen={() => setActiveIndex(index)}
              />
            ))}
          </Box>
        ) : (
          <Typography
            component="p"
            sx={{ m: 0, mt: 3, color: BODY, maxWidth: 460, lineHeight: 1.6 }}
          >
            Photos from the daycare will appear here.
          </Typography>
        )}
      </Box>

      <PhotoLightbox
        images={images}
        index={activeIndex != null && images[activeIndex] ? activeIndex : null}
        onClose={() => setActiveIndex(null)}
        onIndex={setActiveIndex}
      />

      <Box
        component="section"
        sx={{
          bgcolor: TEAL,
          borderRadius: '24px',
          color: '#fff',
          textAlign: 'center',
          px: { xs: 3, md: 6 },
          py: { xs: 6, md: 7 },
          mt: { xs: 4, md: 5 },
        }}
      >
        <HeartIcon />
        <Typography
          component="h2"
          sx={{
            color: '#fff',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            fontSize: { xs: '2rem', md: '2.6rem' },
            mt: 1.5,
          }}
        >
          Ready to meet Carrie?
        </Typography>
        <Typography
          component="p"
          sx={{
            color: 'rgba(255, 255, 255, 0.82)',
            fontSize: { xs: '1rem', md: '1.0625rem' },
            lineHeight: 1.6,
            mt: 1.5,
          }}
        >
          Let’s talk about your dog and their next stay.
        </Typography>
        <Button
          component={NextLink}
          href={BOOK_STAY_PATH}
          endIcon={
            <Box
              component="img"
              src={ARROW_CREAM_SRC}
              alt=""
              sx={{ width: 16, height: 16, display: 'block' }}
            />
          }
          sx={{
            mt: 3,
            bgcolor: ORANGE,
            color: '#fff',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 16,
            px: 2.75,
            py: 1.2,
            boxShadow: 'none',
            '&:hover': { bgcolor: ORANGE_HOVER, boxShadow: 'none' },
          }}
        >
          Book a stay
        </Button>
      </Box>
    </DogHotelInteriorPage>
  );
}

GalleryPage.propTypes = {
  images: PropTypes.arrayOf(imageShape).isRequired,
};
