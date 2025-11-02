import { useEffect, useRef, useCallback } from 'react';

export interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export interface SwipeOptions {
  threshold?: number; // Minimum distance for swipe (default: 50px)
  velocity?: number; // Minimum velocity (default: 0.3)
}

/**
 * Hook for swipe gesture detection
 * 
 * @param handlers - Swipe direction handlers
 * @param options - Swipe sensitivity options
 * 
 * @example
 * const ref = useSwipe({
 *   onSwipeLeft: () => console.log('Swiped left'),
 *   onSwipeRight: () => console.log('Swiped right'),
 * });
 * 
 * return <div ref={ref}>Swipeable content</div>
 */
export function useSwipe<T extends HTMLElement = HTMLElement>(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
): React.RefObject<T> {
  const {
    threshold = 50,
    velocity = 0.3,
  } = options;

  const elementRef = useRef<T>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;

    // Horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > threshold && velocityX > velocity) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      }
    }
    // Vertical swipe
    else {
      if (Math.abs(deltaY) > threshold && velocityY > velocity) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }
    }

    touchStartRef.current = null;
  }, [handlers, threshold, velocity]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return elementRef;
}

/**
 * Hook for long-press gesture detection
 * 
 * @param callback - Function to call on long press
 * @param duration - Long press duration in milliseconds (default: 500ms)
 * 
 * @example
 * const ref = useLongPress(() => {
 *   console.log('Long pressed!');
 * });
 * 
 * return <button ref={ref}>Long press me</button>
 */
export function useLongPress<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  duration = 500
): React.RefObject<T> {
  const elementRef = useRef<T>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const handleStart = useCallback(() => {
    isLongPressRef.current = false;
    timeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      callback();
    }, duration);
  }, [callback, duration]);

  const handleEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleClick = useCallback((e: MouseEvent | TouchEvent) => {
    // Prevent click if it was a long press
    if (isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mousedown', handleStart);
    element.addEventListener('mouseup', handleEnd);
    element.addEventListener('mouseleave', handleEnd);
    element.addEventListener('touchstart', handleStart, { passive: true });
    element.addEventListener('touchend', handleEnd, { passive: true });
    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('mousedown', handleStart);
      element.removeEventListener('mouseup', handleEnd);
      element.removeEventListener('mouseleave', handleEnd);
      element.removeEventListener('touchstart', handleStart);
      element.removeEventListener('touchend', handleEnd);
      element.removeEventListener('click', handleClick);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleStart, handleEnd, handleClick]);

  return elementRef;
}

/**
 * Hook to detect click/tap outside element
 * 
 * @param callback - Function to call when clicked outside
 * 
 * @example
 * const ref = useClickOutside(() => {
 *   console.log('Clicked outside!');
 * });
 * 
 * return <div ref={ref}>Click outside to close</div>
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (elementRef.current && !elementRef.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [callback]);

  return elementRef;
}

/**
 * Ensure minimum touch target size (44px x 44px - Apple standard)
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Utility to ensure element meets minimum touch target size
 */
export function ensureTouchTarget(size: number = MIN_TOUCH_TARGET): string {
  return `min-w-[${size}px] min-h-[${size}px]`;
}
