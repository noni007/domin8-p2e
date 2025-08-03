
import React from 'react';

interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export const useResponsiveLayout = (breakpoints: BreakpointConfig = defaultBreakpoints) => {
  const [screenSize, setScreenSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('landscape');

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setOrientation(height > width ? 'portrait' : 'landscape');
    };

    handleResize(); // Set initial values
    window.addEventListener('resize', handleResize);
    
    // Also listen for orientation changes on mobile
    if ('screen' in window && 'orientation' in window.screen) {
      window.addEventListener('orientationchange', () => {
        setTimeout(handleResize, 100); // Slight delay for orientation change
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if ('screen' in window && 'orientation' in window.screen) {
        window.removeEventListener('orientationchange', handleResize);
      }
    };
  }, []);

  const isMobile = screenSize.width < breakpoints.md;
  const isTablet = screenSize.width >= breakpoints.md && screenSize.width < breakpoints.lg;
  const isDesktop = screenSize.width >= breakpoints.lg;
  const isXLDesktop = screenSize.width >= breakpoints.xl;

  const getGridCols = (mobile: number, tablet: number, desktop: number) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  const getSpacing = (mobile: string, desktop: string) => {
    return isMobile ? mobile : desktop;
  };

  const getFontSize = (mobile: string, desktop: string) => {
    return isMobile ? mobile : desktop;
  };

  return {
    screenSize,
    orientation,
    isMobile,
    isTablet,
    isDesktop,
    isXLDesktop,
    breakpoints,
    getGridCols,
    getSpacing,
    getFontSize,
    // Device detection
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
  };
};
