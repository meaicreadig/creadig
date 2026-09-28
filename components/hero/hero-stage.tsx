"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

/**
 * HERO-BUEHNE — die rechte Haelfte, die bisher leer stand (28.09.2026).
 *
 * Der Satz „Wir bauen, was andere nicht sehen." hatte nichts, worauf er
 * zeigen konnte. Hier stehen jetzt zwei Systeme, die tatsaechlich laufen —
 * meAI und FIBERO —, als echte Bildschirme, nicht als Illustration.
 *
 * PLATZHALTER MIT ABSICHT: Die spaetere Higgsfield-Arbeit ersetzt genau
 * diese Komponente. Wer sie tauscht, aendert nur `HeroStage`; der Hero
 * selbst und sein Raster bleiben unberuehrt.
 */

const EASE = [0.22, 1, 0.36, 1] as const

const screens = [
  { src: "/works/fibero.jpg", name: "FIBERO", label: "Map Center" },
  { src: "/works/meai.jpg", name: "meAI", label: "Betrieb · Heute" },
] as const

function Screen({ src, name, label, priority }: { src: string; name: string; label: string; priority?: boolean }) {
  return (
    <figure className="border-line bg-card overflow-hidden rounded-md border shadow-2xl shadow-black/30">
      <figcaption className="border-line flex items-center justify-between gap-3 border-b px-3.5 py-2.5">
        <span className="eyebrow text-foreground">{name}</span>
        <span className="text-muted-foreground flex items-center gap-2 font-mono text-xs">
          <span aria-hidden="true" className="bg-gold size-1.5 rounded-full" />
          {label}
        </span>
      </figcaption>
      <div className="relative aspect-[3/2]">
        <Image
          src={src}
          alt={`${name} — ${label}`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 36vw, 50vw"
          className="object-cover"
        />
      </div>
    </figure>
  )
}

export function HeroStage() {
  const reduce = usePrefersReducedMotion()

  return (
    <div className="relative aspect-[5/4] w-full">
      <motion.div
        className="absolute top-0 right-0 w-[78%]"
        initial={reduce ? undefined : { y: 18 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
      >
        <Screen {...screens[0]} />
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 w-[80%]"
        initial={reduce ? undefined : { y: 28 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay: 0.32, ease: EASE }}
      >
        <Screen {...screens[1]} priority />
      </motion.div>
    </div>
  )
}

export function HeroStageCompact() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {screens.map((s) => (
        <Screen key={s.src} {...s} />
      ))}
    </div>
  )
}
