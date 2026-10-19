'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';

/**
 * App Router Emotion SSR registry (MUI documented pattern).
 * Avoids @mui/material-nextjs, which Next webpack cannot resolve with this
 * project's resolve.conditionNames override.
 */
export default function EmotionCacheProvider({ options, children }) {
  const [{ cache, flush }] = useState(() => {
    const emotionCache = createCache(options);
    emotionCache.compat = true;
    const prevInsert = emotionCache.insert;
    let inserted = [];
    emotionCache.insert = (...args) => {
      const serialized = args[1];
      if (emotionCache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flushInserted = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache: emotionCache, flush: flushInserted };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    names.forEach(name => {
      styles += cache.inserted[name];
    });
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        // eslint-disable-next-line react/no-danger -- Emotion SSR style injection
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

EmotionCacheProvider.propTypes = {
  options: PropTypes.shape({
    key: PropTypes.string.isRequired,
    prepend: PropTypes.bool,
  }).isRequired,
  children: PropTypes.node.isRequired,
};
