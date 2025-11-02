/**
 * useTheme Hook
 * Runtime theme management for ChatGPT-style theming
 */

import { useEffect } from 'react';
import { applyTheme, generateCSSVariables } from '../styles/theme';

export type Theme = 'dark' | 'light' | 'system';

export function useTheme(initialTheme: Theme = 'dark') {
  useEffect(() => {
    const resolveTheme = (): 'dark' | 'light' => {
      if (initialTheme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return initialTheme;
    };

    const theme = resolveTheme();
    applyTheme(theme);

    // Listen for system theme changes
    if (initialTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [initialTheme]);
}

export default useTheme;
