import { useEffect, useRef, useCallback } from 'react';

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Hook for debounced scroll events
 * 
 * @param callback - Function to call on scroll
 * @param delay - Debounce delay in milliseconds (default: 100ms)
 * 
 * @example
 * useScrollDebounced(() => {
 *   console.log('Scrolled!');
 * }, 100);
 */
export function useScrollDebounced(
  callback: (event: Event) => void,
  delay = 100
): void {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const debouncedHandler = debounce((event: Event) => {
      callbackRef.current(event);
    }, delay);

    window.addEventListener('scroll', debouncedHandler, { passive: true });
    return () => window.removeEventListener('scroll', debouncedHandler);
  }, [delay]);
}

/**
 * Hook for debounced value
 * 
 * @param value - Value to debounce
 * @param delay - Debounce delay in milliseconds
 * 
 * @example
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Import statement for useState
 */
import { useState } from 'react';

/**
 * Hook to detect if element is in viewport
 * (For lazy loading)
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);

  return isIntersecting;
}
