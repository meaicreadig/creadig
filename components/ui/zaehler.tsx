"use client"

import { animate } from "framer-motion"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

/**
 * Eine Kennzahl, die zu ihrem Wert hinzählt.
 *
 * Beim harten Laden steht der echte Wert von der ersten Millisekunde an da —
 * dieselbe Regel wie in `Reveal`: Inhalt erscheint nicht, er ist da. Server
 * und Hydration rendern deshalb den Endwert; ein Hochzählen von 0 hieße,
 * erst die richtige Zahl zu zeigen, dann eine falsche, dann wieder die richtige.
 *
 * Gezählt wird, wenn die Zahl im Client neu entsteht (Navigation im System),
 * sich ändert (Jahr, Szenario, nach einer Aktion) oder beim Laden noch
 * unterhalb des Blickfelds lag — dann zählt sie, sobald sie ins Bild kommt.
 * Dort sah sie vorher niemand, also flackert nichts.
 *
 * 23.10.2026: Ohne den letzten Fall sah der Owner auf /admin keine Bewegung:
 * Das Cockpit-Band liegt unter der Zentrale, und nach dem Login wird hart geladen.
 *
 * Reduzierte Bewegung: kein Zählen, der Wert springt. Die Vorliebe wird
 * direkt gelesen, nicht über `useReducedMotion` (siehe lib/use-prefers-reduced-motion.ts).
 * Screenreader hören nur den Endwert, nie die Zwischenstände.
 */
const nie = () => () => {}

const ruhig = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

export function Zaehler({
  wert,
  waehrung = false,
  nachkomma = 0,
  intl = "de-DE",
  className,
}: {
  /** In der angezeigten Einheit (Euro, nicht Cent). */
  wert: number
  waehrung?: boolean
  nachkomma?: number
  intl?: string
  className?: string
}) {
  /* false während Server-Render und Hydration, true bei einem frischen Client-Mount. */
  const imClient = useSyncExternalStore(nie, () => true, () => false)
  const [anzeige, setAnzeige] = useState(() => (imClient && !ruhig() ? 0 : wert))
  const letzter = useRef(anzeige)
  const ref = useRef<HTMLSpanElement>(null)
  const [sichtbar, setSichtbar] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    /* Hart geladen, aber noch nicht im Bild: unsichtbar auf 0, beim Hinscrollen zählen. */
    if (letzter.current !== 0 && !ruhig() && el.getBoundingClientRect().top > window.innerHeight) {
      letzter.current = 0
      setAnzeige(0)
    }
    const beobachter = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return
      setSichtbar(true)
      beobachter.disconnect()
    })
    beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [])

  useEffect(() => {
    if (!sichtbar || letzter.current === wert) return
    if (ruhig()) {
      letzter.current = wert
      setAnzeige(wert)
      return
    }
    const steuerung = animate(letzter.current, wert, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        letzter.current = v
        setAnzeige(v)
      },
    })
    return () => steuerung.stop()
  }, [wert, sichtbar])

  const format = new Intl.NumberFormat(intl, {
    ...(waehrung ? { style: "currency", currency: "EUR" } : {}),
    minimumFractionDigits: nachkomma,
    maximumFractionDigits: nachkomma,
  })
  return (
    <span ref={ref} className={className}>
      <span aria-hidden>{format.format(anzeige)}</span>
      <span className="sr-only">{format.format(wert)}</span>
    </span>
  )
}
