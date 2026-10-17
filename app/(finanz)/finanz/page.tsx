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
import { after } from "next/server"
import { Geschaeftsfelder } from "@/components/finanz/geschaeftsfelder"
import { ladeFelder } from "@/lib/finanz/felder"
import { abgleichFaellig, abgleichStand, fiberoKonfiguriert, gleicheFiberoAb } from "@/lib/finanz/fibero-abgleich"
import { finanzOwnerSeite } from "@/lib/finanz/zugang"

export const dynamic = "force-dynamic"
export const metadata = { title: "Heute" }

function gruss() {
  const h = Number(new Intl.DateTimeFormat("de-DE", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(new Date()))
  return h < 11 ? "Guten Morgen." : h < 18 ? "Guten Tag." : "Guten Abend."
}

export default async function FinanzHeute({ searchParams }: { searchParams: Promise<{ jahr?: string }> }) {
  await finanzOwnerSeite()
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="heute" titel={gruss()}><OhneSpeicher /></FinanzShell>

  const abgleich = await abgleichFaellig(db).catch(() => ({ sofort: false, faellig: false }))
  if (abgleich.sofort) await gleicheFiberoAb(db).catch(() => null)
  else if (abgleich.faellig) after(() => gleicheFiberoAb(db).catch(() => null))

  const basis = await finanzBasis()
  const { heute, fristen, stand, topf, frei, verlauf, reichweite, hinweise, paragraph19 } = await berechneLage(db)
  const naechste = fristen.filter((f) => !f.erledigt).slice(0, 3)

  const diesesJahr = heute.slice(0, 4)
  const jahre = [diesesJahr, String(Number(diesesJahr) - 1)]
  const gewaehlt = (await searchParams).jahr
  const jahr = gewaehlt && jahre.includes(gewaehlt) ? gewaehlt : diesesJahr
  const [felder, abgleichsStand] = await Promise.all([ladeFelder(db, jahr), abgleichStand(db)])

  return (
    <FinanzShell aktiv="heute" titel={gruss()} unterzeile="Vorne steht, was dich voranbringt. Der Rest läuft im Hintergrund.">
      <FinanzKompass stand={stand} frei={frei} topf={topf} reichweite={reichweite} hinweise={hinweise} verlauf={verlauf} paragraph19={paragraph19} />

      <Geschaeftsfelder bild={felder} stand={abgleichsStand} fiberoAktiv={fiberoKonfiguriert()} basis={basis || "/"} jahre={jahre} />

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
