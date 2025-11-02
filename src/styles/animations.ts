/*
  Framer Motion + Tailwind CSS animation library
  - Production-ready variants and transitions
  - Tailwind keyframes/animation extension (exported as tailwindAnimationExtension)
  - Accessible by default: respects prefers-reduced-motion

  Usage (Framer Motion):
    import { motion } from 'framer-motion'
    import { messageVariants, sidebarVariants, interactions, transitions, typingDotStyle } from '@/styles/animations'

    <motion.div
      variants={messageVariants.fadeInUp()}
      initial="hidden"
      animate="visible"
    />

    // Stagger container
    <motion.ul variants={messageVariants.staggerContainer()} initial="hidden" animate="visible">
      <motion.li variants={messageVariants.fadeInUp()} />
      <motion.li variants={messageVariants.fadeInUp()} />
    </motion.ul>

    // Typing dots (100ms stagger)
    <span className="flex gap-1 items-end">
      {[0,1,2].map(i => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-foreground/70 motion-safe:animate-typing-bounce"
          style={typingDotStyle(i, 100)}
        />
      ))}
    </span>

  Usage (Tailwind utilities):
    - motion-safe:animate-fade-in-up
    - motion-safe:animate-slide-in-left
    - motion-safe:animate-fade-in
    - motion-safe:animate-shimmer
    - motion-safe:animate-pulse-2s
    - motion-safe:animate-spin-3s

  Reduced motion:
    - Framer Motion helpers automatically remove transforms/durations when prefers-reduced-motion is on
    - Tailwind utilities should be used with motion-safe: or motion-reduce: as appropriate
*/

import type { Variants, Transition } from 'framer-motion'

// Easing and shared transitions
export const transitions: Record<'standard' | 'slow' | 'instant', Transition> = {
  standard: { duration: 0.15, ease: 'easeInOut' },
  slow: { duration: 0.3, ease: 'easeInOut' },
  instant: { duration: 0.05, ease: 'easeIn' },
}

// Check prefers-reduced-motion safely (SSR-safe)
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Utility to conditionally strip motion
const rm = <T extends Variants>(variants: T, reduced?: boolean): T => {
  const shouldReduce = typeof reduced === 'boolean' ? reduced : prefersReducedMotion()
  if (!shouldReduce) return variants
  // Remove y/x/scale transforms and minimize durations
  const strip = (s: any) => ({
    ...s,
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { ...(s?.transition || {}), duration: 0 }
  })
  const out: any = {}
  for (const key of Object.keys(variants)) out[key] = strip((variants as any)[key])
  return out
}

// 1) Message animations
export const messageVariants = {
  // fadeInUp: opacity 0→1, y 10px→0 (300ms ease-out)
  fadeInUp: (opts?: { reduced?: boolean; distance?: number; duration?: number }): Variants => {
    const distance = opts?.distance ?? 10
    const duration = opts?.duration ?? 0.3
    const v: Variants = {
      hidden: { opacity: 0, y: distance },
      visible: { opacity: 1, y: 0, transition: { duration, ease: 'easeOut' } },
      exit: { opacity: 0, y: distance / 2, transition: { duration: 0.2, ease: 'easeIn' } },
    }
    return rm(v, opts?.reduced)
  },

  // Container with child stagger of 50ms
  staggerContainer: (opts?: { reduced?: boolean; stagger?: number; delayChildren?: number }): Variants => {
    const stagger = opts?.stagger ?? 0.05
    const delayChildren = opts?.delayChildren ?? 0
    const reduced = typeof opts?.reduced === 'boolean' ? opts.reduced : prefersReducedMotion()
    const v: Variants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: reduced ? 0 : stagger,
          delayChildren,
        },
      },
    }
    return v
  },

  // Typing dot (use 3 instances with incremental delay)
  typingDot: (index: number, opts?: { reduced?: boolean; delayStepMs?: number }): Variants => {
    const reduced = typeof opts?.reduced === 'boolean' ? opts.reduced : prefersReducedMotion()
    const delay = (opts?.delayStepMs ?? 100) * index / 1000
    const v: Variants = reduced
      ? {
          initial: { opacity: 0.8 },
          animate: { opacity: 0.3, transition: { duration: 0, repeat: Infinity } },
        }
      : {
          initial: { y: 0, opacity: 0.6 },
          animate: {
            y: [0, -3, 0],
            opacity: [0.6, 1, 0.6],
            transition: { duration: 0.9, ease: 'easeInOut', repeat: Infinity, delay },
          },
        }
    return v
  },
}

// Useful inline style for typing dots with Tailwind animation utilities
export const typingDotStyle = (index: number, stepMs = 100): React.CSSProperties => ({
  animationDelay: `${index * stepMs}ms`,
}) as any

// 2) Sidebar animations
export const sidebarVariants = {
  // slide via x position
  slideInLeft: (opts?: { reduced?: boolean; distance?: number }): Variants => {
    const distance = opts?.distance ?? 20
    const v: Variants = {
      hidden: { x: -distance, opacity: 0 },
      visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
      exit: { x: -distance / 2, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
    }
    return rm(v, opts?.reduced)
  },

  // expand width 0 → 260px (layout-costly; prefer x when possible)
  expandWidth: (opts?: { reduced?: boolean; width?: number }): Variants => {
    const width = opts?.width ?? 260
    const v: Variants = {
      hidden: { width: 0, opacity: 0 },
      visible: { width, opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
      exit: { width: 0, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
    }
    return rm(v, opts?.reduced)
  },

  fadeIn: (opts?: { reduced?: boolean; duration?: number }): Variants => {
    const duration = opts?.duration ?? 0.2
    const v: Variants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration, ease: 'easeOut' } },
      exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
    }
    return rm(v, opts?.reduced)
  },
}

// 3) Button interactions (use with whileHover / whileTap)
export const interactions = {
  hoverScale: { scale: 1.05, transition: { duration: 0.15, ease: 'easeInOut' } as Transition },
  pressScale: { scale: 0.95, transition: { duration: 0.1, ease: 'easeIn' } as Transition },
}

// 4) Loading states (Framer helpers)
export const loadingAnimations = {
  pulse: (opts?: { reduced?: boolean; duration?: number }) => {
    const reduced = typeof opts?.reduced === 'boolean' ? opts.reduced : prefersReducedMotion()
    const duration = opts?.duration ?? 2
    if (reduced) return { opacity: 1 }
    return { opacity: [0.6, 1, 0.6], transition: { duration, ease: 'easeInOut', repeat: Infinity } as Transition }
  },
  spin: (opts?: { reduced?: boolean; duration?: number }) => {
    const reduced = typeof opts?.reduced === 'boolean' ? opts.reduced : prefersReducedMotion()
    const duration = opts?.duration ?? 3
    if (reduced) return { rotate: 0 }
    return { rotate: 360, transition: { duration, ease: 'linear', repeat: Infinity } as Transition }
  },
  // Shimmer is provided as Tailwind CSS utility; see tailwindAnimationExtension
}

// 5) Tailwind keyframes/animations extension
export const tailwindAnimationExtension = {
  keyframes: {
    'fade-in-up': {
      '0%': { opacity: '0', transform: 'translateY(10px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    'fade-in': {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    'slide-in-left': {
      '0%': { transform: 'translateX(-20px)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    // Typing bounce for a single dot; stagger via animation-delay inline style
    'typing-bounce': {
      '0%, 80%, 100%': { transform: 'translateY(0)', opacity: '0.6' },
      '40%': { transform: 'translateY(-3px)', opacity: '1' },
    },
    // Gradient shimmer (background-size should be 200% 100%)
    shimmer: {
      '0%': { backgroundPosition: '200% 0' },
      '100%': { backgroundPosition: '-200% 0' },
    },
  },
  animation: {
    'fade-in-up': 'fade-in-up 0.3s ease-out both',
    'fade-in': 'fade-in 0.2s ease-out both',
    'slide-in-left': 'slide-in-left 0.3s ease-in-out both',
    'typing-bounce': 'typing-bounce 0.9s ease-in-out infinite',
    shimmer: 'shimmer 1.5s linear infinite',
    'pulse-2s': 'pulse 2s ease-in-out infinite', // Tailwind core keyframes: pulse
    'spin-3s': 'spin 3s linear infinite',       // Tailwind core keyframes: spin
  },
}

// Convenience class maps for common UI elements (Tailwind)
export const animationClasses = {
  message: {
    fadeInUp: 'motion-safe:animate-fade-in-up',
  },
  sidebar: {
    slideInLeft: 'motion-safe:animate-slide-in-left',
    fadeIn: 'motion-safe:animate-fade-in',
  },
  typing: {
    dot: 'motion-safe:animate-typing-bounce',
  },
  loading: {
    shimmer: 'motion-safe:animate-shimmer bg-[length:200%_100%]',
    pulse: 'motion-safe:animate-pulse-2s',
    spin: 'motion-safe:animate-spin-3s',
  },
}

export type AnimationClasses = typeof animationClasses
