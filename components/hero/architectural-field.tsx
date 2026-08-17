"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { SignatureMotif } from "@/components/brand/signature-motif"

/**
 * Hero-Hintergrund: creaDIG-Signatur-Motiv (Dreiecks-Mesh) plus perspektivischer
 * Boden und exponentielle Aufwärtskurve. Gold nur als scharfe Hairline.
 */
export function ArchitecturalField() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"])
  const curveY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"])
  const fade = useTransform(scrollYProgress, [0, 0.9], [1, 0])

  // Perspektivischer Boden: Linien, die nach hinten dichter werden.
  const horizon = 46
  const floorLines = Array.from({ length: 16 }, (_, i) => {
    const t = (i + 1) / 16
    return horizon + (100 - horizon) * t * t
  })
  const verticals = Array.from({ length: 25 }, (_, i) => i / 24)

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Signatur-Motiv der Marke: Dreiecks-/Pfeil-Mesh, nach unten verdichtend */}
      <SignatureMotif className="motif-feature absolute inset-0 h-full w-full" />

      <motion.div style={reduce ? undefined : { y: gridY, opacity: fade }} className="absolute inset-0">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Fluchtende Bodenlinien */}
          {floorLines.map((y, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="var(--line-strong)"
              strokeWidth="0.06"
              opacity={0.25 + (i / floorLines.length) * 0.55}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {/* Perspektivische Vertikalen zum Fluchtpunkt */}
          {verticals.map((t, i) => (
            <line
              key={`v-${i}`}
              x1={t * 100}
              y1="100"
              x2={50 + (t - 0.5) * 26}
              y2={horizon}
              stroke="var(--line-strong)"
              strokeWidth="0.06"
              opacity={0.3}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {/* Horizont als scharfe Gold-Hairline */}
          <line
            x1="0"
            x2="100"
            y1={horizon}
            y2={horizon}
            stroke="var(--gold)"
            strokeWidth="0.09"
            opacity="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </motion.div>

      {/* Exponentielle Aufwärtskurve — Wachstum, sichtbar gemacht */}
      <motion.div style={reduce ? undefined : { y: curveY, opacity: fade }} className="absolute inset-0">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
          <motion.path
            d="M 2 96 C 34 95 58 88 74 64 C 86 46 92 24 97 2"
            stroke="var(--gold)"
            strokeWidth="0.18"
            vectorEffect="non-scaling-stroke"
            initial={reduce ? { pathLength: 1, opacity: 0.6 } : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.65 }}
            transition={{ duration: 2.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
          {[
            [34, 95],
            [74, 64],
            [97, 2],
          ].map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r="0.45"
              fill="var(--gold)"
              initial={reduce ? { opacity: 0.7 } : { opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 + i * 0.35 }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Sanfte Auflösung nach unten, damit die Typo führt */}
      <div className="from-background via-background/55 absolute inset-0 bg-gradient-to-b to-transparent" />
      <div className="from-background absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent" />
    </div>
  )
}
