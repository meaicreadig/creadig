import { Search } from "lucide-react"

import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { Kopierlauf } from "@/components/finanz/belege/kopierlauf"
import { Eingangskorb } from "@/components/finanz/belege/eingangskorb"
import { BelegUpload } from "@/components/finanz/belege/upload"
import { eurRund } from "@/components/finanz/format"
import { finanzDb } from "@/lib/finanz/store"
import { finanzBasis } from "@/lib/finanz/basis"
import { GESCHAEFTSFELDER, belegeSchema, belegUploadBereit, ladeBelege, letzterAbgleich } from "@/lib/finanz/belege"
import { belegKiBereit } from "@/lib/finanz/beleg-ki"
import { kopierlaufBereit } from "@/lib/finanz/kopierlauf-fibero"
import { finanzOwnerSeite } from "@/lib/finanz/zugang"

export const dynamic = "force-dynamic"
export const maxDuration = 60
export const metadata = { title: "Belege" }

export default async function FinanzBelege({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await finanzOwnerSeite()
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="belege" titel="Belege"><OhneSpeicher /></FinanzShell>
  await belegeSchema(db)

  const q = (await searchParams).q?.trim().slice(0, 80) || null
  const [daten, letzter, basis] = await Promise.all([ladeBelege(db, q), letzterAbgleich(db, "fibero"), finanzBasis()])
  const zugeordnet = daten.gesamt - daten.korbAnzahl

  return (
    <FinanzShell
      aktiv="belege"
      titel="Belege"
      unterzeile="Alle Eingangs- und Ausgabenbelege an einem Ort. Jeder Beleg bekommt sein Geschäftsfeld – so trennt sich Glasfaser, IT, Software und Handel sauber."
    >
      <section aria-label="Stand" className="bg-card flex flex-col gap-6 rounded-[2rem] p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-sm font-medium">Im Eingangskorb</span>
            <span className="text-primary font-sans text-5xl font-semibold tracking-tight tabular-nums">{daten.korbAnzahl}</span>
          </div>
          <span className="text-muted-foreground text-sm">
            {zugeordnet} von {daten.gesamt} zugeordnet
          </span>
        </div>
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${daten.gesamt ? Math.round((zugeordnet / daten.gesamt) * 100) : 0}%` }}
          />
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {daten.felder.map((f) => (
            <li key={f.key} className="bg-background flex flex-col gap-0.5 rounded-2xl p-3">
              <span className="text-muted-foreground text-xs">{GESCHAEFTSFELDER.find((g) => g.key === f.key)?.label}</span>
              <span className="font-semibold tabular-nums">{eurRund(f.bruttoCent)}</span>
              <span className="text-muted-foreground text-xs">{f.anzahl} Belege</span>
            </li>
          ))}
        </ul>
      </section>

      <form role="search" className="bg-card flex items-center gap-3 rounded-full px-5 py-3 shadow-sm">
        <Search className="text-muted-foreground size-4 shrink-0" aria-hidden />
        <label htmlFor="beleg-suche" className="sr-only">
          Belege durchsuchen
        </label>
        <input
          id="beleg-suche"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Händler, Kategorie oder Dateiname"
          className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
        />
      </form>

      <BelegUpload bereit={belegUploadBereit()} kiBereit={belegKiBereit()} />
      <Eingangskorb daten={daten} basis={basis} />
      <Kopierlauf bereit={kopierlaufBereit()} letzter={letzter} />
    </FinanzShell>
  )
}
