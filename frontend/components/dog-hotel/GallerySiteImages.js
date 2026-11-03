'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import GalleryPage from '@/components/dog-hotel/GalleryPage';
import { listSiteImages } from '@/lib/daycareApi';
import { galleryImagesFromSiteImages } from '@/utils/siteImages';

/**
 * Starts from the server-built gallery. Replaces it only when the API
 * returns at least one image the browser can load.
 */
export default function GallerySiteImages({ images }) {
  const [siteImages, setSiteImages] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await listSiteImages('gallery');
      if (cancelled) return;
      const mapped = res.ok ? galleryImagesFromSiteImages(res.data) : null;
      if (mapped) setSiteImages(mapped);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <GalleryPage images={siteImages || images} />;
}

GallerySiteImages.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string.isRequired,
    }),
  ).isRequired,
};
