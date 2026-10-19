import fs from 'fs';
import path from 'path';
import GalleryPage from '@/components/dog-hotel/GalleryPage';
import { pageMetadata } from '@/utils/website-seo';

export const metadata = pageMetadata('/gallery');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

function listGalleryImages() {
  const dir = path.join(process.cwd(), 'public', 'imgs', 'gallery');
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter(name => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map(name => ({
      src: `/imgs/gallery/${name}`,
      alt: 'Care Bear Daycare',
    }));
}

export default function GalleryRoute() {
  return <GalleryPage images={listGalleryImages()} />;
}
