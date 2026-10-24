"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Loader2, MessageCircle, X } from "lucide-react"

import { dockLaden, dockStand, type DockKarte } from "@/app/(admin)/admin/assistent/actions"
import { AssistentChat } from "@/components/admin/assistent-chat"
import type { EminFrage } from "@/lib/assistent/fragen"
import type { Nachricht } from "@/lib/assistent/store"

/**
 * Das Team auf jeder Admin-Seite (24.10.2026). Emin: „Hangi sayfada olursam
 * olayım o chat'i görüyor olmam lazım.“ Unten rechts ein Knopf; ein Punkt mit
 * Zahl zeigt offene Fragen. Das Fenster hat zwei Reiter: „Fragen an dich“ und
 * „Team-Chat“. Es ist der EINE Chat – auf /admin/assistent steht kein zweiter mehr.
 */
export function AssistentDock() {
  const pfad = usePathname()
  const [offen, setOffen] = useState(false)
  const [zahl, setZahl] = useState(0)
  const [daten, setDaten] = useState<{ verlauf: Nachricht[]; fragen: EminFrage[]; karten: DockKarte[]; rest: number; seite: string | null } | null>(null)
  const [laedt, setLaedt] = useState(false)

  useEffect(() => {
    let aus = false
    const hole = () => dockStand().then((s) => !aus && setZahl(s.fragen + s.karten)).catch(() => null)
    void hole()
    const t = setInterval(hole, 120_000)
    return () => {
      aus = true
      clearInterval(t)
    }
  }, [])

  useEffect(() => {
    if (!offen) return
    const zu = (e: KeyboardEvent) => e.key === "Escape" && setOffen(false)
    window.addEventListener("keydown", zu)
    return () => window.removeEventListener("keydown", zu)
  }, [offen])

  const oeffnen = useCallback(async () => {
    setOffen(true)
    setLaedt(true)
    try {
      setDaten(await dockLaden(pfad))
    } finally {
      setLaedt(false)
    }
  }, [pfad])

  return (
    <>
      {offen ? (
        <div
          role="dialog"
          aria-label="Dein Team"
          className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-24 sm:h-[min(42rem,calc(100dvh-8rem))] sm:w-[26rem] sm:rounded-3xl"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Dein Team</span>
              <span className="text-xs text-muted-foreground [overflow-wrap:anywhere]">
                {daten?.seite ? `Aylin sieht: ${daten.seite.length > 70 ? `${daten.seite.slice(0, 70)}…` : daten.seite}` : "Aylin und die KI-Kollegen · auf jeder Seite"}
              </span>
            </span>
            <button type="button" onClick={() => setOffen(false)} aria-label="Fenster schließen" className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            {laedt || !daten ? (
              <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground" role="status">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Lädt …
              </p>
            ) : (
              <AssistentChat start={daten.verlauf} rest={daten.rest} fragen={daten.fragen} karten={daten.karten} modus="dock" onFragenZahl={setZahl} pfad={pfad} />
            )}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => (offen ? setOffen(false) : void oeffnen())}
        aria-expanded={offen}
        aria-label={zahl ? `Dein Team – ${zahl} warten auf dich (Fragen und Entscheidungen)` : "Dein Team – Chat öffnen"}
        className={`fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:outline-none sm:right-6 sm:bottom-6 ${offen ? "max-sm:hidden" : ""}`}
      >
        {offen ? <X className="size-6" aria-hidden="true" /> : <MessageCircle className="size-6" aria-hidden="true" />}
        {zahl && !offen ? (
          <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-60 motion-reduce:hidden" aria-hidden="true" />
            <span className="relative flex size-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">{zahl}</span>
          </span>
        ) : null}
      </button>
    </>
  )
}
