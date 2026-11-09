import { useEffect, useState } from 'react';

export interface ViewportMode {
  isMobile: boolean;
  isPortrait: boolean;
  reducedMotion: boolean;
  aspect: number;
}

export function useViewportMode(): ViewportMode {
  const [mode, setMode] = useState<ViewportMode>(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isPortrait: false, reducedMotion: false, aspect: 16 / 9 };
    }
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / Math.max(h, 1);
    return {
      isMobile: w < 1024,
      isPortrait: aspect < 0.95,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      aspect,
    };
  });

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / Math.max(h, 1);
      setMode({
        isMobile: w < 1024,
        isPortrait: aspect < 0.95,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        aspect,
      });
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return mode;
}

