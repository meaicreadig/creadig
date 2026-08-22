"use client"

import { motion, useReducedMotion } from "framer-motion"

/**
 * ARCHETYP C, Bewegung — die Maskenfahrt (VIS-2).
 *
 * ---------------------------------------------------------------------------
 * WARUM
 * Die Seite hatte genau eine Mikro-Interaktion, die sie überall benutzte: die
 * Gold-Haarlinie, die auf Hover von links nach rechts wächst. Dieselbe Geste
 * lag auf den Ebenen-Kacheln, den Produkt-Kacheln, dem Angebot, der Logo-Wand
 * und den Kontaktkarten. Der magnetische Knopf ist die zweite, aber er sitzt
 * nur auf CTAs. Zwischen Hero und Fußzeile passiert beim Scrollen also nichts,
 * was den Blick hält — und genau das liest sich als „statisch".
 *
 * Hier ist die dritte, und sie gehört bewusst dem Bild: Beim Eintritt ins Bild
 * fährt eine Maske von unten weg und gibt die Abbildung frei, während diese
 * aus einer leichten Übergröße in ihre Lage zurückkommt. Das ist keine
 * Animation um der Animation willen — es ist die Geste, die dem Beweis (der
 * gezeigten Arbeit) einen Auftritt gibt, den eine Kachel nicht hat.
 *
 * ---------------------------------------------------------------------------
 * REGELN
 *   - Läuft EINMAL (`once: true`) — eine Fahrt, die sich beim Zurückscrollen
 *     wiederholt, wird beim zweiten Mal zur Nervensäge.
 *   - `useReducedMotion` schaltet sie vollständig ab; dann steht das Bild
 *     einfach da. Kein halber Zustand, keine unsichtbare Maske.
 *   - Kein Blur, kein Schatten, kein Farbverlauf: Die Marke arbeitet mit
 *     Kante und Fläche, nicht mit Effekt.
 */
export function ImageUnveil({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="h-full w-full"
        initial={{ scale: 1.08 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
