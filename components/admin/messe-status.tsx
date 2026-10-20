"use client"

import { useOptimistic, useState, useTransition } from "react"
import { CalendarCheck, Loader2, RefreshCw, Star, X } from "lucide-react"

import { messeStatusSetzen, radarJetzt } from "@/app/(admin)/admin/messen/actions"
import type { MesseStatus } from "@/lib/messen-radar"

const OPTIONEN: { wert: MesseStatus; text: string; Icon: typeof Star; aktiv: string }[] = [
  { wert: "teilnehmen", text: "Ich nehme teil", Icon: CalendarCheck, aktiv: "bg-primary text-primary-foreground" },
  { wert: "interessiert", text: "Interessiert", Icon: Star, aktiv: "bg-primary/15 text-primary" },
  { wert: "nein", text: "Kein Interesse", Icon: X, aktiv: "bg-muted-foreground/15 text-foreground" },
]

export function MesseStatusWahl({ messeKey, status, name }: { messeKey: string; status: MesseStatus | null; name: string }) {
  const [pending, start] = useTransition()
  const [aktuell, setAktuell] = useOptimistic(status)

  return (
    <div role="group" aria-label={`Status für ${name}`} className="flex flex-wrap gap-1.5">
      {OPTIONEN.map(({ wert, text, Icon, aktiv }) => {
        const an = aktuell === wert
        return (
          <button
            key={wert}
            type="button"
            aria-pressed={an}
            disabled={pending}
            onClick={() =>
              start(async () => {
                const neu = an ? null : wert
                setAktuell(neu)
                await messeStatusSetzen(messeKey, neu)
              })
            }
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              an ? aktiv : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" aria-hidden />
            {text}
          </button>
        )
      })}
    </div>
  )
}

export function RadarKnopf() {
  const [pending, start] = useTransition()
  const [meldung, setMeldung] = useState<string | null>(null)

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setMeldung("Recherche läuft …")
            const r = await radarJetzt()
            setMeldung(r.ok ? `${r.neu ?? 0} neue Messen gefunden` : "Recherche fehlgeschlagen")
          })
        }
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-70"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <RefreshCw className="size-4" aria-hidden />}
        Jetzt neu recherchieren
      </button>
      {meldung && <span className="text-sm text-muted-foreground" aria-live="polite">{meldung}</span>}
    </div>
  )
}
