'use client';

import { useEffect } from 'react';
import publicPath from '@/utils/publicPath';

const JINGLE_SRC = publicPath('/music/cbd-jingle.mp3');

/**
 * Plays the home-page jingle once after the page loads.
 * Browsers often block autoplay, so the first click, tap, or key press starts it instead.
 */
export default function HomePageJingle() {
  useEffect(() => {
    const audio = new Audio(JINGLE_SRC);
    audio.preload = 'auto';
    audio.loop = false;

    let cleaned = false;
    let started = false;

    const removeGestureListeners = () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    };

    const playOnce = () => {
      if (cleaned || started) return;
      started = true;
      audio
        .play()
        .then(() => {
          removeGestureListeners();
        })
        .catch(() => {
          if (cleaned) return;
          started = false;
        });
    };

    function onGesture() {
      playOnce();
    }

    const onPageLoad = () => {
      playOnce();
    };

    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);

    if (document.readyState === 'complete') {
      onPageLoad();
    } else {
      window.addEventListener('load', onPageLoad, { once: true });
    }

    return () => {
      cleaned = true;
      window.removeEventListener('load', onPageLoad);
      removeGestureListeners();
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  return null;
}
