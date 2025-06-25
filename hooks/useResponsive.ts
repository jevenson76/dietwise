import { useState, useEffect } from 'react';

// Breakpoints matching Tailwind's defaults
const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('xs');

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const width = windowSize.width;
    
    if (width >= breakpoints['2xl']) {
      setCurrentBreakpoint('2xl');
    } else if (width >= breakpoints.xl) {
      setCurrentBreakpoint('xl');
    } else if (width >= breakpoints.lg) {
      setCurrentBreakpoint('lg');
    } else if (width >= breakpoints.md) {
      setCurrentBreakpoint('md');
    } else if (width >= breakpoints.sm) {
      setCurrentBreakpoint('sm');
    } else {
      setCurrentBreakpoint('xs');
    }
  }, [windowSize.width]);

  const isMobile = windowSize.width < breakpoints.sm;
  const isTablet = windowSize.width >= breakpoints.sm && windowSize.width < breakpoints.lg;
  const isDesktop = windowSize.width >= breakpoints.lg;
  
  const isSmallScreen = windowSize.width < breakpoints.md;
  const isMediumScreen = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;
  const isLargeScreen = windowSize.width >= breakpoints.lg;

  // Check if current breakpoint is at least the specified breakpoint
  const isAtLeast = (breakpoint: Breakpoint): boolean => {
    return windowSize.width >= breakpoints[breakpoint];
  };

  // Check if current breakpoint is at most the specified breakpoint
  const isAtMost = (breakpoint: Breakpoint): boolean => {
    return windowSize.width < breakpoints[breakpoint];
  };

  // Check if viewport is in portrait orientation
  const isPortrait = windowSize.height > windowSize.width;
  const isLandscape = !isPortrait;

  // Check if it's a touch device
  const isTouchDevice = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return {
    windowSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isAtLeast,
    isAtMost,
    isPortrait,
    isLandscape,
    isTouchDevice,
  };
}

// Hook for conditionally rendering based on breakpoint
export function useBreakpointValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const { currentBreakpoint, windowSize } = useResponsive();
  
  // Start from the current breakpoint and work down to find a value
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  // If no value found, return the smallest defined value
  for (let i = breakpointOrder.length - 1; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
}