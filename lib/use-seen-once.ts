"use client"

import { useEffect, useRef, useState } from "react"

/**
 * „Einmal gesehen" — fuer den EINEN Zustandswechsel einer Sektion.
 *
 * `Reveal` blendet ein, weiss danach aber nichts mehr; `usePrefersReducedMotion`
 * kennt den Blick nicht. Beides reicht fuer einen Wechsel, der genau einmal
 * und erst im Blickfeld passieren soll, nicht aus — deshalb dieser Hook.
 *
 * `bereit` ist erst nach der Hydration `true`. Bis dahin rendert der Aufrufer
 * den Endzustand: Ohne JavaScript (und im Server-HTML) steht das Bild
 * vollstaendig da, nie leer.
 */
export function useSeenOnce<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null)
  const [bereit, setBereit] = useState(false)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") {
      setSeen(true)
      return
    }
    setBereit(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return { ref, seen, bereit }
}
