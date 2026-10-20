"use client"

import { useEffect, useState } from "react"

/** Echtzeit-Uhr für „frisch“/„live“: tickt alle 30 s, damit Pulse und Linien von selbst verschwinden. Vor dem ersten Tick null (hydrationssicher). */
export function useJetzt(): number | null {
  const [jetzt, setJetzt] = useState<number | null>(null)
  useEffect(() => {
    setJetzt(Date.now())
    const id = setInterval(() => setJetzt(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])
  return jetzt
}
