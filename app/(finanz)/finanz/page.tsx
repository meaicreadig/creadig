import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { FinanzKompass } from "@/components/finanz/kompass"
import { FinanzAssistent } from "@/components/finanz/assistent"
import { eur, tag } from "@/components/finanz/format"
import { finanzBasis } from "@/lib/finanz/basis"
import { berechneLage } from "@/lib/finanz/lage"
import { stufe } from "@/lib/finanz/rechnen"
import { finanzDb } from "@/lib/finanz/store"

export const dynamic = "force-dynamic"
export const metadata = { title: "Heute" }

function gruss() {
  const h = Number(new Intl.DateTimeFormat("de-DE", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(new Date()))
  return h < 11 ? "Guten Morgen." : h < 18 ? "Guten Tag." : "Guten Abend."
}

export default async function FinanzHeute() {
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="heute" titel={gruss()}><OhneSpeicher /></FinanzShell>

  const basis = await finanzBasis()
  const { heute, fristen, stand, topf, frei, verlauf, reichweite, hinweise } = await berechneLage(db)
  const naechste = fristen.filter((f) => !f.erledigt).slice(0, 3)

  return (
    <FinanzShell aktiv="heute" titel={gruss()} unterzeile="Vorne steht, was dich voranbringt. Der Rest läuft im Hintergrund.">
      <FinanzKompass stand={stand} frei={frei} topf={topf} reichweite={reichweite} hinweise={hinweise} verlauf={verlauf} />

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <FinanzAssistent />
        </div>
        <section aria-labelledby="fristen-kurz" className="bg-card flex flex-col gap-4 rounded-[2rem] p-7 lg:col-span-2">
          <h2 id="fristen-kurz" className="text-lg font-semibold">Finanzamt</h2>
          {naechste.length === 0 ? (
            <p className="text-muted-foreground">Keine offenen Fristen.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {naechste.map((f) => {
                const s = stufe(f, heute)
                const spaet = s.stufe === "ueberfaellig" || s.stufe === "eskalation"
                return (
                  <li key={f.id} className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${spaet ? "bg-destructive/10" : "bg-background"}`}>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{f.titel}</span>
                      <span className="text-muted-foreground text-xs">fällig {tag(f.faellig)}{f.betragCent ? ` · ${eur(f.betragCent)}` : ""}</span>
                    </div>
                    <span className={`shrink-0 text-sm font-semibold tabular-nums ${spaet ? "text-destructive" : "text-primary"}`}>
                      {s.tage < 0 ? `${-s.tage} T über` : s.tage === 0 ? "heute" : `${s.tage} T`}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          <Link href={`${basis}/steuern`} className="text-primary mt-auto flex items-center gap-1.5 text-sm font-semibold">
            Alle Steuern & Fristen <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      </div>
    </FinanzShell>
  )
}
