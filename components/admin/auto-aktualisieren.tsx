"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** Lädt die Server-Daten in festem Takt neu, solange ein Hintergrundlauf aktiv ist. */
export function AutoAktualisieren({ sekunden = 8 }: { sekunden?: number }) {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), sekunden * 1000)
    return () => clearInterval(id)
  }, [router, sekunden])
  return null
}
