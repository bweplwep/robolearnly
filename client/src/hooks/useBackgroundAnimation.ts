import { useEffect, useState } from 'react';

export const useBackgroundAnimation = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Проверка на мобильное устройство
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Проверка настроек доступности
    const checkMotionPreference = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReduceMotion(mediaQuery.matches);
      
      mediaQuery.addEventListener('change', (e) => {
        setReduceMotion(e.matches);
      });
    };

    checkMobile();
    checkMotionPreference();

    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return {
    isMobile,
    reduceMotion,
    shouldAnimate: !isMobile && !reduceMotion,
    particleCount: isMobile ? 30 : reduceMotion ? 40 : 60,
    connectionDistance: isMobile ? 80 : reduceMotion ? 90 : 100,
    particleSpeed: reduceMotion ? 0.1 : 0.3,
  };
};