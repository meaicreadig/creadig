"use client"

import { useEffect, useState } from "react"

/**
 * „Bewegung reduzieren" — selbst gelesen statt geerbt.
 *
 * ---------------------------------------------------------------------------
 * WARUM NICHT `useReducedMotion` AUS FRAMER-MOTION
 * Sechs Komponenten fragten die Vorliebe über `useReducedMotion()` ab und
 * lieferten bei `true` eine ruhige Fassung — die Abschnitte ohne Einblenden,
 * das Bild ohne Vorhang, der Knopf ohne Magnet. Nachgemessen in Chrome mit
 * gesetztem `prefers-reduced-motion: reduce` (framer-motion 13.1.0) war das
 * Ergebnis das Gegenteil:
 *
 *   window.matchMedia("(prefers-reduced-motion: reduce)").matches   →  true
 *   useReducedMotion()                                              →  falsy
 *
 * Damit rendert `Reveal` weiter die bewegte Fassung mit `initial={{opacity:0}}`
 * — und framer-motion führt die Einblendung wegen derselben Vorliebe nicht
 * aus. Die Abschnitte bleiben auf `opacity: 0` stehen. Gemessen: 7 unsichtbare
 * Blöcke auf einer Leistungsseite, 33 auf `/leistungen`. Für jeden Besucher
 * mit dieser Systemeinstellung — Menschen mit Migräne, Schwindel oder
 * vestibulären Beschwerden, also genau die, für die die Einstellung gedacht
 * ist — war die Seite über weite Strecken LEER.
 *
 * Diese Datei liest die Medienabfrage selbst. Kein Umweg, kein fremdes
 * Standardverhalten, und sie hört auf Änderungen zur Laufzeit.
 *
 * Der Startwert ist `false`: Server und erster Client-Render müssen
 * übereinstimmen, sonst warnt React vor abweichendem Markup. Die Korrektur
 * kommt sofort nach dem Mounten, vor jeder Bewegung, die ein Mensch bemerken
 * könnte.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduce(query.matches)

    const onChange = (event: MediaQueryListEvent) => setReduce(event.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  return reduce
}
