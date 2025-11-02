// Vitest setup for React Testing Library and DOM polyfills
import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// window.matchMedia mock
if (!('matchMedia' in window)) {
  // @ts-ignore
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}

// ResizeObserver mock
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
// @ts-ignore
global.ResizeObserver = global.ResizeObserver || ResizeObserverMock;

// IntersectionObserver mock
class IntersectionObserverMock {
  constructor() {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}
// @ts-ignore
global.IntersectionObserver = global.IntersectionObserver || IntersectionObserverMock;

// navigator.clipboard mock
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
});

// scrollTo mock (used by MessageList)
window.scrollTo = window.scrollTo || vi.fn();

// Optional: tame framer-motion during tests to avoid animation timing issues
vi.mock('framer-motion', async (importOriginal) => {
  const mod: any = await importOriginal();

  const filterMotionProps = (props: Record<string, any>) => {
    const {
      initial,
      animate,
      exit,
      variants,
      transition,
      whileHover,
      whileTap,
      layout,
      layoutId,
      ...rest
    } = props || {};
    return rest;
  };

  const createMotion = (tag: string) =>
    React.forwardRef<any, any>(({ children, ...props }, ref) =>
      React.createElement(tag, { ...filterMotionProps(props), ref }, children)
    );

  const motionProxy = new Proxy({}, {
    get: (_, key: string) => createMotion(key),
  });

  const AnimatePresence = ({ children }: any) => React.createElement(React.Fragment, {}, children);

  return {
    ...mod,
    motion: motionProxy,
    AnimatePresence,
  };
});

// Element.scrollTo polyfill used by MessageList auto-scroll
if (!(HTMLElement.prototype as any).scrollTo) {
  (HTMLElement.prototype as any).scrollTo = vi.fn();
}

// Element.scrollIntoView polyfill used by ChatSidebar smooth scroll
if (!(HTMLElement.prototype as any).scrollIntoView) {
  (HTMLElement.prototype as any).scrollIntoView = vi.fn();
}

// Keep tests deterministic for timers if needed
// vi.useFakeTimers();

// Mock Radix-based Avatar to avoid layout/effect loops in tests
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, ...props }: any) => React.createElement('div', props, children),
  AvatarImage: (props: any) => React.createElement('img', { alt: '', ...props }),
  AvatarFallback: ({ children, ...props }: any) => React.createElement('span', props, children),
}));

// Disable Zustand persist side-effects in tests to avoid storage event loops
vi.mock('zustand/middleware', async (importOriginal) => {
  // Preserve other exports if any
  const original: any = await importOriginal();
  return {
    ...original,
    persist: (creator: any, _opts: any) => creator,
    createJSONStorage: (_getStorage?: any) => () => {
      // Simple in-memory storage for tests
      const mem = new Map<string, string>();
      return {
        getItem: (name: string) => mem.get(name) ?? null,
        setItem: (name: string, value: string) => {
          mem.set(name, value);
        },
        removeItem: (name: string) => {
          mem.delete(name);
        },
      } as Storage;
    },
  };
});

// Force desktop environment in tests to avoid mobile overlays/gestures changing state
vi.mock('@/hooks/use-responsive', async () => {
  return {
    BREAKPOINTS: { mobile: 0, tablet: 768, desktop: 1024 },
    getDeviceType: (_w: number) => 'desktop',
    useDeviceType: () => 'desktop',
    useIsMobile: () => false,
    useIsTablet: () => false,
    useIsDesktop: () => true,
    useIsTouchDevice: () => false,
    useIsIOS: () => false,
    useKeyboardVisible: () => false,
  } as any;
});

