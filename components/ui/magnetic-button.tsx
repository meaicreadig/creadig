"use client"

import { useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

type MagneticButtonProps = {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: "primary" | "ghost"
  className?: string
  ariaLabel?: string
  target?: string
}

export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  ariaLabel,
  target,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null)
  const reduce = useReducedMotion()
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  function handleMove(event: React.MouseEvent<HTMLElement>) {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const relX = event.clientX - (rect.left + rect.width / 2)
    const relY = event.clientY - (rect.top + rect.height / 2)
    setOffset({ x: relX * 0.16, y: relY * 0.22 })
  }

  const base = cn(
    "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden",
    // Großzügige Fläche, damit die CTAs neben der riesigen Display-Typo bestehen.
    "px-9 py-5 text-[0.9375rem] tracking-wide transition-colors duration-500",
    variant === "primary"
      ? "bg-ink text-background"
      : "border border-line-strong bg-transparent text-foreground hover:border-gold",
    className,
  )

  const inner = (
    <>
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="absolute inset-0 -translate-y-full bg-gradient-to-br from-gold-soft to-gold transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
        />
      )}
      <span
        className={cn(
          "relative z-10 flex items-center gap-2.5",
          variant === "primary" && "transition-colors duration-500 group-hover:text-ink",
        )}
      >
        {children}
      </span>
    </>
  )

  const motionProps = {
    onMouseMove: handleMove,
    onMouseLeave: () => setOffset({ x: 0, y: 0 }),
    animate: { x: offset.x, y: offset.y },
    transition: { type: "spring" as const, stiffness: 220, damping: 18, mass: 0.4 },
  }

  if (href) {
    return (
      <motion.a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
        className={base}
        {...motionProps}
      >
        {inner}
      </motion.a>
    )
  }

  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={base}
      {...motionProps}
    >
      {inner}
    </motion.button>
  )
}
