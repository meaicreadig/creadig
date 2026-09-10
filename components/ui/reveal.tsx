"use client"

import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

/**
 * DIE SEKTIONS-BEWEGUNG — GATE 04.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER VORHER STAND UND WAS ES ANRICHTETE
 * `initial={{ opacity: 0, y: 24 }}`, 0,9 Sekunden, ausgeloest erst 80 Pixel
 * INNERHALB des Blickfelds.
 *
 * Gemessen am 11.09.2026, ohne zu scrollen, 1,2 Sekunden nach dem Laden:
 *
 *   /unternehmen   9.377 px Dokument — davon 7.526 px unsichtbar  (80 %)
 *   /              8.912 px Dokument — davon 4.460 px unsichtbar  (50 %)
 *   /leistungen/…  2.803 px Dokument — davon   695 px unsichtbar  (25 %)
 *
 * Das ist kein Effekt, das ist ein Zustand: Vier Fuenftel einer Seite
 * existieren erst, wenn jemand sie anfaehrt. Der externe Audit hat es als
 * „wirkt wie noch nicht geladen" beschrieben — und genau so liest es sich.
 *
 * Zwei Folgen, die zusammengehoeren:
 *
 *   1. VERTRAUEN. Eine Seite, die sich vor dem Leser aufbaut, wirkt
 *      unfertig. Bei einem Haus, das Systeme baut, ist das die teuerste
 *      Wirkung von allen.
 *
 *   2. MONOTONIE. Vierunddreissig identische Aufblendungen sind selbst die
 *      Gleichfoermigkeit, ueber die der Owner klagt. Wenn jede Sektion auf
 *      dieselbe Art erscheint, sieht jede Sektion gleich aus — unabhaengig
 *      davon, was in ihr steht.
 *
 * ---------------------------------------------------------------------------
 * WAS JETZT GILT
 * Die Deckkraft wird nicht mehr animiert. Der Inhalt ist von der ersten
 * Millisekunde an da und lesbar; bewegt wird nur die Lage — eine Sektion
 * SETZT SICH, sie erscheint nicht.
 *
 * Dazu: 0,9 s → 0,5 s, und der Ausloeser feuert, waehrend das Element ins
 * Bild kommt, statt 80 Pixel danach. Wer zuegig scrollt, sieht die Bewegung
 * gar nicht mehr — und das ist richtig so. Bewegung soll Hierarchie
 * unterstuetzen, nicht Verfuegbarkeit.
 *
 * Was dadurch NICHT verloren geht: die Staffelung. `delay` ordnet weiterhin,
 * was zuerst zur Ruhe kommt — und das ist der Teil, der etwas erklaert.
 *
 * ---------------------------------------------------------------------------
 * REDUZIERTE BEWEGUNG
 * Unveraendert: kein `motion`-Element, kein Transform, nichts. Die Regel war
 * schon vorher richtig.
 */
type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  as?: "div" | "span" | "li" | "section"
}

export function Reveal({ children, className, delay = 0, y = 16, as = "div" }: RevealProps) {
  const reduce = usePrefersReducedMotion()
  const MotionTag = motion[as]

  if (reduce) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={cn(className)}
      initial={{ y }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "0px 0px -5% 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}
