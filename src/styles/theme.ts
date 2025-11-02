/**
 * Theme System - ChatGPT-inspired Design System
 * Production-ready theme configuration for Tailwind CSS
 * Supports dark/light modes with CSS Custom Properties
 */

// ============================================================================
// Color Palette
// ============================================================================

export const colors = {
  dark: {
    // Backgrounds
    bg: {
      primary: '#212121',      // Main chat area
      secondary: '#2f2f2f',    // Message bubbles, cards
      sidebar: '#171717',      // Sidebar navigation
      tertiary: '#1a1a1a',     // Deeper backgrounds
      hover: '#3f3f3f',        // Hover states
      active: '#4a4a4a',       // Active/pressed states
    },
    
    // Text
    text: {
      primary: '#ececec',      // Main text
      secondary: '#b4b4b4',    // Muted text
      tertiary: '#8e8e8e',     // Disabled/placeholder
      inverse: '#212121',      // Text on light backgrounds
    },
    
    // Borders
    border: {
      primary: 'rgba(77, 77, 77, 0.2)',    // Default borders
      secondary: 'rgba(77, 77, 77, 0.1)',  // Subtle dividers
      hover: 'rgba(77, 77, 77, 0.3)',      // Border on hover
      focus: 'rgba(16, 163, 127, 0.4)',    // Focus rings
    },
    
    // Accent & Brand
    accent: {
      primary: '#10a37f',      // ChatGPT green (primary actions)
      secondary: '#74aa9c',    // Softer green variant
      hover: '#0e8c6f',        // Hover state
      light: 'rgba(16, 163, 127, 0.1)', // Subtle backgrounds
    },
    
    // Semantic Colors
    success: '#10a37f',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  light: {
    // Backgrounds
    bg: {
      primary: '#ffffff',
      secondary: '#f7f7f8',
      sidebar: '#f9f9f9',
      tertiary: '#ececec',
      hover: '#e5e5e5',
      active: '#d4d4d4',
    },
    
    // Text
    text: {
      primary: '#212121',
      secondary: '#6e6e80',
      tertiary: '#a0a0a0',
      inverse: '#ffffff',
    },
    
    // Borders
    border: {
      primary: 'rgba(0, 0, 0, 0.1)',
      secondary: 'rgba(0, 0, 0, 0.05)',
      hover: 'rgba(0, 0, 0, 0.15)',
      focus: 'rgba(16, 163, 127, 0.4)',
    },
    
    // Accent & Brand
    accent: {
      primary: '#10a37f',
      secondary: '#19c37d',
      hover: '#0e8c6f',
      light: 'rgba(16, 163, 127, 0.08)',
    },
    
    // Semantic Colors
    success: '#10a37f',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
} as const;

// ============================================================================
// Spacing Scale
// ============================================================================

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
} as const;

// Responsive padding presets
export const padding = {
  mobile: {
    container: 'px-4 py-3',    // 16px horizontal, 12px vertical
    section: 'px-4 py-6',      // 16px horizontal, 24px vertical
    card: 'p-4',               // 16px all sides
  },
  tablet: {
    container: 'md:px-6 md:py-4',
    section: 'md:px-6 md:py-8',
    card: 'md:p-6',
  },
  desktop: {
    container: 'lg:px-8 lg:py-5',
    section: 'lg:px-8 lg:py-12',
    card: 'lg:p-8',
  },
} as const;

// ============================================================================
// Typography Scale
// ============================================================================

export const typography = {
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '0.875rem', // 14px (ChatGPT base)
    md: '0.875rem',   // 14px
    lg: '1rem',       // 16px
    xl: '1.125rem',   // 18px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem',  // 24px
    '4xl': '2rem',    // 32px
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// ============================================================================
// Shadows & Depth
// ============================================================================

export const shadows = {
  // Elevation system (0-5)
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Specific use cases
  card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  
  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// ============================================================================
// Border Radius
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  DEFAULT: '0.5rem', // 8px
  md: '0.5rem',     // 8px (ChatGPT standard)
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',   // Circular
} as const;

// ============================================================================
// Transitions & Animations
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
  },
  
  timing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// Z-Index Layers
// ============================================================================

export const zIndex = {
  base: '0',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
} as const;

// ============================================================================
// CSS Custom Properties Generator
// ============================================================================

export function generateCSSVariables(theme: 'dark' | 'light' = 'dark') {
  const colorPalette = colors[theme];
  
  return {
    // Backgrounds
    '--bg-primary': colorPalette.bg.primary,
    '--bg-secondary': colorPalette.bg.secondary,
    '--bg-sidebar': colorPalette.bg.sidebar,
    '--bg-tertiary': colorPalette.bg.tertiary,
    '--bg-hover': colorPalette.bg.hover,
    '--bg-active': colorPalette.bg.active,
    
    // Text
    '--text-primary': colorPalette.text.primary,
    '--text-secondary': colorPalette.text.secondary,
    '--text-tertiary': colorPalette.text.tertiary,
    '--text-inverse': colorPalette.text.inverse,
    
    // Borders
    '--border-primary': colorPalette.border.primary,
    '--border-secondary': colorPalette.border.secondary,
    '--border-hover': colorPalette.border.hover,
    '--border-focus': colorPalette.border.focus,
    
    // Accent
    '--accent-primary': colorPalette.accent.primary,
    '--accent-secondary': colorPalette.accent.secondary,
    '--accent-hover': colorPalette.accent.hover,
    '--accent-light': colorPalette.accent.light,
    
    // Semantic
    '--color-success': colorPalette.success,
    '--color-warning': colorPalette.warning,
    '--color-error': colorPalette.error,
    '--color-info': colorPalette.info,
  };
}

// ============================================================================
// Tailwind Config Extension
// ============================================================================

export const tailwindThemeExtension = {
  colors: {
    'bg-primary': 'var(--bg-primary)',
    'bg-secondary': 'var(--bg-secondary)',
    'bg-sidebar': 'var(--bg-sidebar)',
    'bg-tertiary': 'var(--bg-tertiary)',
    'bg-hover': 'var(--bg-hover)',
    'bg-active': 'var(--bg-active)',
    
    'text-primary': 'var(--text-primary)',
    'text-secondary': 'var(--text-secondary)',
    'text-tertiary': 'var(--text-tertiary)',
    'text-inverse': 'var(--text-inverse)',
    
    'border-primary': 'var(--border-primary)',
    'border-secondary': 'var(--border-secondary)',
    'border-hover': 'var(--border-hover)',
    'border-focus': 'var(--border-focus)',
    
    'accent': {
      DEFAULT: 'var(--accent-primary)',
      primary: 'var(--accent-primary)',
      secondary: 'var(--accent-secondary)',
      hover: 'var(--accent-hover)',
      light: 'var(--accent-light)',
    },
    
    'success': 'var(--color-success)',
    'warning': 'var(--color-warning)',
    'error': 'var(--color-error)',
    'info': 'var(--color-info)',
  },
  
  spacing,
  fontSize: typography.fontSize,
  fontWeight: typography.fontWeight,
  lineHeight: typography.lineHeight,
  letterSpacing: typography.letterSpacing,
  boxShadow: shadows,
  borderRadius,
  transitionDuration: transitions.duration,
  transitionTimingFunction: transitions.timing,
  zIndex,
};

// ============================================================================
// Component Class Helpers
// ============================================================================

export const componentClasses = {
  // Cards
  card: 'bg-bg-secondary border border-border-primary rounded-md shadow-card',
  cardHover: 'hover:bg-bg-hover hover:border-border-hover transition-colors duration-200',
  
  // Buttons
  buttonPrimary: 'bg-accent text-white hover:bg-accent-hover active:bg-accent-primary rounded-md px-4 py-2 font-medium transition-colors duration-200',
  buttonSecondary: 'bg-bg-secondary text-text-primary hover:bg-bg-hover border border-border-primary rounded-md px-4 py-2 font-medium transition-colors duration-200',
  buttonGhost: 'text-text-primary hover:bg-bg-hover rounded-md px-4 py-2 font-medium transition-colors duration-200',
  
  // Inputs
  input: 'bg-bg-secondary border border-border-primary rounded-md px-3 py-2 text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:ring-2 focus:ring-accent-light outline-none transition-all duration-200',
  textarea: 'bg-bg-secondary border border-border-primary rounded-md px-3 py-2 text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:ring-2 focus:ring-accent-light outline-none resize-none transition-all duration-200',
  
  // Layout
  container: 'mx-auto px-4 md:px-6 lg:px-8',
  section: 'py-6 md:py-8 lg:py-12',
  sidebar: 'bg-bg-sidebar border-r border-border-primary',
  
  // Messages
  messageBubbleUser: 'bg-accent text-white rounded-2xl px-4 py-3 shadow-sm',
  messageBubbleAssistant: 'bg-bg-secondary text-text-primary rounded-2xl px-4 py-3 shadow-sm border border-border-secondary',
  
  // Modals
  modalBackdrop: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[1040]',
  modal: 'bg-bg-primary border border-border-primary rounded-lg shadow-modal z-[1050] max-w-2xl w-full',
  
  // Dropdowns
  dropdown: 'bg-bg-secondary border border-border-primary rounded-md shadow-dropdown py-1',
  dropdownItem: 'px-3 py-2 text-text-primary hover:bg-bg-hover cursor-pointer transition-colors duration-150',
  
  // Misc
  divider: 'border-t border-border-secondary',
  skeleton: 'animate-pulse bg-bg-hover rounded',
  badge: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-light text-accent',
} as const;

// ============================================================================
// Runtime Theme Switcher
// ============================================================================

export function applyTheme(theme: 'dark' | 'light' = 'dark') {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  const vars = generateCSSVariables(theme);
  
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

// ============================================================================
// Breakpoints (for JS usage)
// ============================================================================

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ============================================================================
// Default Export
// ============================================================================

export default {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  transitions,
  zIndex,
  padding,
  componentClasses,
  tailwindThemeExtension,
  generateCSSVariables,
  applyTheme,
  breakpoints,
} as const;
