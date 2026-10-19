'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { robotsMetaContent } from '@/utils/seo';

export default function RobotsMeta() {
  const pathname = usePathname();
  const content = robotsMetaContent(pathname);

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }, [content]);

  return null;
}
