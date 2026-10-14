"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, CircleAlert, Loader2, RefreshCw } from "lucide-react"

import { kopierlauf, type LaufAntwort } from "@/app/(finanz)/finanz/belege/actions"
import type { Abgleich, Kennzahlen } from "@/lib/finanz/belege"
import { eur } from "@/components/finanz/format"

const ZEILEN: { key: keyof Kennzahlen; label: string; wert: (v: number) => string }[] = [
  { key: "belege", label: "Belege", wert: String },
  { key: "archiviert", label: "davon archiviert", wert: String },
  { key: "mitDatei", label: "Belege mit Datei", wert: String },
  { key: "dateien", label: "Dateien", wert: String },
  { key: "bytes", label: "Speicher", wert: (v) => `${(v / 1048576).toFixed(1)} MB` },
  { key: "bruttoCent", label: "Summe brutto (aktiv)", wert: eur },
  { key: "vorsteuerCent", label: "Vorsteuer (aktiv)", wert: eur },
]

export function Kopierlauf({ bereit, letzter }: { bereit: boolean; letzter: Abgleich | null }) {
  const router = useRouter()
  const [stand, setStand] = useState<LaufAntwort | null>(null)
  const [laeuft, setLaeuft] = useState(false)
  const stopp = useRef(false)

  async function starte(modus: "start" | "fehler") {
    setLaeuft(true)
    stopp.current = false
    let r = await kopierlauf(modus)
    setStand(r)
    while (r.phase === "dateien" && !stopp.current) {
      r = await kopierlauf("weiter")
      setStand(r)
    }
    setLaeuft(false)
    router.refresh()
  }

  const ergebnis: Abgleich | null =
    stand?.phase === "fertig" ? { soll: stand.soll, ist: stand.ist, stimmt: stand.stimmt, fertigAt: null } : letzter
  const fehlerDateien = stand?.phase === "dateien" ? stand.fehler : 0
  const anteil = stand?.phase === "dateien" && stand.gesamt > 0 ? Math.round((stand.kopiert / stand.gesamt) * 100) : 0

  return (
    <section aria-labelledby="lauf-titel" className="bg-card flex flex-col gap-5 rounded-3xl p-6 shadow-sm md:p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex flex-col gap-1">
          <h2 id="lauf-titel" className="text-xl font-semibold tracking-tight">
            Umzug aus fibero
          </h2>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed text-pretty">
            fibero wird nur gelesen. Jede Datei wird kopiert und per Prüfsumme bestätigt. Erneut ausführen ist sicher – es entsteht nichts doppelt, Ihre Zuordnungen bleiben.
          </p>
        </div>
        {bereit ? (
          <button
            type="button"
            disabled={laeuft}
            onClick={() => starte("start")}
            className="bg-primary text-primary-foreground inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60"
          >
            {laeuft ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <RefreshCw className="size-4" aria-hidden />}
            {laeuft ? "Kopiere …" : letzter ? "Erneut abgleichen" : "Umzug starten"}
          </button>
        ) : (
          <p className="text-muted-foreground bg-muted max-w-xs rounded-2xl p-4 text-sm leading-relaxed">
            Noch nicht verbunden: Zugang zu fibero und Dateispeicher fehlen.
          </p>
        )}
      </div>

      {stand?.phase === "dateien" && (
        <div className="flex flex-col gap-2" aria-live="polite">
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${anteil}%` }} />
          </div>
          <p className="text-muted-foreground text-sm">
            {stand.kopiert} von {stand.gesamt} Dateien kopiert{fehlerDateien > 0 ? ` · ${fehlerDateien} mit Fehler` : ""}
          </p>
        </div>
      )}

      {stand?.phase === "fehler" && (
        <p role="alert" className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-2xl p-4 text-sm">
          <CircleAlert className="size-4 shrink-0" aria-hidden /> {stand.meldung}
        </p>
      )}

      {ergebnis && (
        <div className="flex flex-col gap-3">
          <p
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
              ergebnis.stimmt ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
            }`}
          >
            {ergebnis.stimmt ? <Check className="size-4" aria-hidden /> : <CircleAlert className="size-4" aria-hidden />}
            {ergebnis.stimmt ? "Abgleich stimmt auf den Cent" : "Abgleich weicht ab"}
            {ergebnis.fertigAt ? ` · ${ergebnis.fertigAt}` : ""}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-left">
                  <th className="py-2 font-medium">Kennzahl</th>
                  <th className="py-2 text-right font-medium">fibero</th>
                  <th className="py-2 text-right font-medium">Finanz</th>
                </tr>
              </thead>
              <tbody>
                {ZEILEN.map((z) => {
                  const gleich = ergebnis.soll[z.key] === ergebnis.ist[z.key]
                  return (
                    <tr key={z.key}>
                      <td className="py-1.5">{z.label}</td>
                      <td className="py-1.5 text-right font-mono tabular-nums">{z.wert(ergebnis.soll[z.key])}</td>
                      <td className={`py-1.5 text-right font-mono tabular-nums ${gleich ? "" : "text-destructive font-semibold"}`}>
                        {z.wert(ergebnis.ist[z.key])}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {!ergebnis.stimmt && bereit && !laeuft && (
            <button type="button" onClick={() => starte("fehler")} className="text-primary w-fit text-sm font-semibold underline-offset-4 hover:underline">
              Fehlgeschlagene Dateien erneut versuchen
            </button>
          )}
        </div>
      )}
    </section>
  )
}
