import { useState, useEffect } from 'react';

/**
 * Responsive breakpoints matching Tailwind CSS defaults
 */
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Get current device type based on window width
 */
export function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.tablet) return 'mobile';
  if (width < BREAKPOINTS.desktop) return 'tablet';
  return 'desktop';
}

/**
 * Hook to detect current device type
 * 
 * @returns Current device type ('mobile' | 'tablet' | 'desktop')
 * 
 * @example
 * const deviceType = useDeviceType();
 * const isMobile = deviceType === 'mobile';
 */
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => 
    getDeviceType(window.innerWidth)
  );

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
}

/**
 * Hook to check if device is mobile (< 768px)
 */
export function useIsMobile(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'mobile';
}

/**
 * Hook to check if device is tablet (768px - 1024px)
 */
export function useIsTablet(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'tablet';
}

/**
 * Hook to check if device is desktop (> 1024px)
 */
export function useIsDesktop(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'desktop';
}

/**
 * Detect if device is touch-enabled
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - for older browsers
      (navigator.msMaxTouchPoints || 0) > 0
    );
  }, []);

  return isTouch;
}

/**
 * Detect iOS device
 */
export function useIsIOS(): boolean {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);

  return isIOS;
}

/**
 * Hook to track keyboard visibility on mobile
 * (Approximation based on viewport resize)
 */
export function useKeyboardVisible(): boolean {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;

    const initialHeight = window.visualViewport?.height || window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      // Keyboard is likely visible if viewport shrinks by more than 150px
      setIsKeyboardVisible(initialHeight - currentHeight > 150);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport.removeEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isMobile]);

  return isKeyboardVisible;
}
