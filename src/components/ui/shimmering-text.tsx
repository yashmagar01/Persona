"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ShimmeringTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  text: string
  duration?: number
  color?: string
  shimmerColor?: string
  repeat?: boolean
  repeatDelay?: number
  startOnView?: boolean
  once?: boolean
}

export const ShimmeringText = React.forwardRef<
  HTMLSpanElement,
  ShimmeringTextProps
>(
  (
    {
      text,
      duration = 2,
      color = "#6B7280",
      shimmerColor = "#3B82F6",
      repeat = false,
      repeatDelay = 0,
      startOnView = false,
      once = false,
      className,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(!startOnView)
    const [hasAnimated, setHasAnimated] = React.useState(false)
    const elementRef = React.useRef<HTMLSpanElement>(null)

    React.useImperativeHandle(ref, () => elementRef.current!)

    React.useEffect(() => {
      if (!startOnView) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && (!once || !hasAnimated)) {
            setIsVisible(true)
            if (once) setHasAnimated(true)
          } else if (!once) {
            setIsVisible(false)
          }
        },
        { threshold: 0.1 }
      )

      if (elementRef.current) {
        observer.observe(elementRef.current)
      }

      return () => observer.disconnect()
    }, [startOnView, once, hasAnimated])

    const animationDuration = `${duration}s`
    const animationDelay = repeat ? `${repeatDelay}s` : "0s"
    const animationIterationCount = repeat ? "infinite" : "1"

    return (
      <span
        ref={elementRef}
        className={cn(
          "inline-block bg-gradient-to-r bg-clip-text text-transparent",
          isVisible && "animate-shimmer",
          className
        )}
        style={{
          backgroundImage: `linear-gradient(90deg, ${color} 0%, ${shimmerColor} 50%, ${color} 100%)`,
          backgroundSize: "200% 100%",
          animationDuration,
          animationDelay,
          animationIterationCount,
        }}
        {...props}
      >
        {text}
      </span>
    )
  }
)

ShimmeringText.displayName = "ShimmeringText"
