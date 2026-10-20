"use client"

import { useOptimistic, useState, useTransition } from "react"
import { CalendarCheck, Loader2, RefreshCw, Star, X } from "lucide-react"

import { messeStatusSetzen, radarJetzt } from "@/app/(admin)/admin/messen/actions"
import { SegmentedControl, type SegmentedOption } from "@/components/admin/primitives"
import type { MesseStatus } from "@/lib/messen-radar"

const OPTIONEN: readonly SegmentedOption<MesseStatus>[] = [
  { value: "teilnehmen", label: "Ich nehme teil", icon: CalendarCheck, activeClassName: "bg-primary text-primary-foreground" },
  { value: "interessiert", label: "Interessiert", icon: Star, activeClassName: "bg-primary/15 text-primary" },
  { value: "nein", label: "Kein Interesse", icon: X, activeClassName: "bg-muted-foreground/15 text-foreground" },
]

export function MesseStatusWahl({ messeKey, status, name }: { messeKey: string; status: MesseStatus | null; name: string }) {
  const [pending, start] = useTransition()
  const [aktuell, setAktuell] = useOptimistic(status)

  return (
    <SegmentedControl
      ariaLabel={`Status für ${name}`}
      value={aktuell}
      disabled={pending}
      options={OPTIONEN}
      onChange={(wert, warAktiv) =>
        start(async () => {
          const neu = warAktiv ? null : wert
          setAktuell(neu)
          await messeStatusSetzen(messeKey, neu)
        })
      }
    />
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
