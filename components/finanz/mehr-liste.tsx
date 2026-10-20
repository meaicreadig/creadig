"use client"

import { useState, type ReactNode } from "react"

/**
 * Zeigt die ersten `start` Einträge, der Rest hängt hinter „Mehr anzeigen“.
 * Keine Seite wächst mehr ins Unendliche — die Liste bleibt eine Karte.
 */
export function MehrListe({ kinder, start = 10, schritt = 25, als: Tag = "ul" }: { kinder: ReactNode[]; start?: number; schritt?: number; als?: "ul" | "div" }) {
  const [n, setN] = useState(start)
  const sichtbar = kinder.slice(0, n)
  const rest = kinder.length - sichtbar.length
  return (
    <>
      <Tag className="flex flex-col">{sichtbar}</Tag>
      {rest > 0 && (
        <button
          type="button"
          onClick={() => setN(n + schritt)}
          className="text-gold-text hover:bg-gold/10 mt-2 self-start rounded-full px-4 py-2 text-sm font-medium"
        >
          Mehr anzeigen ({rest} weitere)
        </button>
      )}
    </>
  )
}
