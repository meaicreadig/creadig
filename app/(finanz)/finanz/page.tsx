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
import { ladeAbos } from "@/lib/finanz/abos"
import { investierbar } from "@/lib/finanz/investment"
import { ladeFinanzKurzlage } from "@/lib/finanz/kurzlage"
import { after } from "next/server"
import { Geschaeftsfelder } from "@/components/finanz/geschaeftsfelder"
import { ladeFelder } from "@/lib/finanz/felder"
import { abgleichFaellig, abgleichStand, fiberoKonfiguriert, gleicheFiberoAb } from "@/lib/finanz/fibero-abgleich"
import { finanzOwnerSeite } from "@/lib/finanz/zugang"
import { ZieleKachel } from "@/components/finanz/ziele"
import { ladeZiele } from "@/lib/finanz/ziele"
import { Diversifikationskachel } from "@/components/finanz/diversifikation"
import { ladeDiversifikation } from "@/lib/finanz/diversifikation"

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
  const { heute, fristen, stand, topf, frei, verlauf, reichweite, hinweise, paragraph19, paragraph19Vorschau } = await berechneLage(db)
  const naechste = fristen.filter((f) => !f.erledigt).slice(0, 3)

  const diesesJahr = heute.slice(0, 4)
  const jahre = [diesesJahr, String(Number(diesesJahr) - 1)]
  const gewaehlt = (await searchParams).jahr
  const jahr = gewaehlt && jahre.includes(gewaehlt) ? gewaehlt : diesesJahr
  const [kurz, abos, entwuerfe] = await Promise.all([
    ladeFinanzKurzlage(db, heute),
    ladeAbos(db).catch(() => []),
    db(`SELECT count(*) AS c FROM fin_dokumente WHERE art = 'rechnung' AND status = 'entwurf'`, []).then((r) => Number(r[0]?.c ?? 0)).catch(() => 0),
  ])
  const zaehle = (sql: string) => db(sql, []).then((r) => Number(r[0]?.c ?? 0)).catch(() => 0)
  const [korb, bankOffen, angebotEntwuerfe] = await Promise.all([
    zaehle(`SELECT count(*) AS c FROM fin_belege WHERE geschaeftsfeld IS NULL AND art = 'beleg' AND NOT archiviert`),
    zaehle(`SELECT count(*) AS c FROM fin_bank_umsaetze WHERE status = 'offen'`),
    zaehle(`SELECT count(*) AS c FROM fin_dokumente WHERE art = 'angebot' AND status = 'entwurf'`),
  ])
  const wartet = [
    { n: angebotEntwuerfe, text: "Angebots-Entwürfe prüfen und senden", href: `${basis}/angebote` },
    { n: entwuerfe, text: "Rechnungs-Entwürfe prüfen und senden", href: `${basis}/rechnungen` },
    { n: kurz.ueberfaellig, text: "überfällige Rechnungen mahnen", href: `${basis}/rechnungen` },
    { n: bankOffen, text: "Bank-Umsätze ohne Zuordnung", href: `${basis}/geldfluss` },
    { n: korb, text: "Belege ohne Geschäftsfeld", href: `${basis}/belege` },
    { n: kurz.naechsteFrist && kurz.naechsteFrist.tage <= 14 ? 1 : 0, text: kurz.naechsteFrist ? `Frist: ${kurz.naechsteFrist.titel} (${kurz.naechsteFrist.tage} T)` : "", href: `${basis}/steuern` },
  ].filter((x) => x.n > 0)
  const inv = investierbar(frei, verlauf)
  const aboJahr = abos.filter((a) => a.aktiv).reduce((sum, a) => sum + a.positionen.reduce((x, p) => x + p.preisCent * p.menge, 0) * (a.intervall === "monat" ? 12 : a.intervall === "quartal" ? 4 : 1), 0)
  const [felder, abgleichsStand, ziele, diversifikation] = await Promise.all([
    ladeFelder(db, jahr),
    abgleichStand(db),
    ladeZiele(db),
    ladeDiversifikation(db, heute),
  ])

  return (
    <FinanzShell aktiv="heute" titel={gruss()} unterzeile="Vorne steht, was dich voranbringt. Der Rest läuft im Hintergrund.">
      <FinanzKompass
        stand={stand}
        frei={frei}
        topf={topf}
        reichweite={reichweite}
        hinweise={hinweise}
        verlauf={verlauf}
        paragraph19={paragraph19}
        paragraph19Vorschau={paragraph19Vorschau}
      />

      <section aria-labelledby="wartet" className="bg-card flex flex-col gap-3 rounded-[2rem] p-6">
        <h2 id="wartet" className="text-lg font-semibold">Wartet auf dich</h2>
        {wartet.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nichts. Alles Vorbereitbare ist erledigt — das System arbeitet im Hintergrund weiter.</p>
        ) : (
          <ul className="flex flex-col">
            {wartet.map((w) => (
              <li key={w.text} className="border-line border-b last:border-0">
                <Link href={w.href} className="hover:bg-background flex items-center justify-between gap-3 rounded-xl px-2 py-3 text-sm">
                  <span>{w.n > 1 || !w.text.startsWith("Frist") ? <strong className="tabular-nums">{w.n}</strong> : null} {w.text}</span>
                  <ArrowRight className="text-muted-foreground size-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="text-muted-foreground text-xs">Zuordnen, Entwürfe, Mahnvorschläge und Abos laufen automatisch. Hier steht nur, was deine Entscheidung braucht.</p>
      </section>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Auf einen Blick">
        <Kachel href={`${basis}/investment`} label="Investierbar" wert={eur(inv.investierbarCent)} fuss="nach Steuern und Reserve" />
        <Kachel
          href={`${basis}/rechnungen`}
          label="Überfällige Rechnungen"
          wert={String(kurz.ueberfaellig)}
          fuss={kurz.ueberfaellig > 0 ? "Mahnvorschläge liegen in deiner Freigabe-Liste" : "alles im Zahlungsziel"}
          warnung={kurz.ueberfaellig > 0}
        />
        <Kachel href={`${basis}/abos`} label="Planbarer Jahresumsatz" wert={eur(aboJahr)} fuss={`${abos.filter((a) => a.aktiv).length} wiederkehrende Rechnungen`} />
        <Kachel href={`${basis}/rechnungen`} label="Entwürfe warten" wert={String(entwuerfe)} fuss="prüfen und mit einem Klick senden" />
      </ul>

      <Geschaeftsfelder bild={felder} stand={abgleichsStand} fiberoAktiv={fiberoKonfiguriert()} basis={basis || "/"} jahre={jahre} />

      <div className="grid gap-5 lg:grid-cols-2">
        <ZieleKachel ziele={ziele} basis={basis || "/"} />
        <Diversifikationskachel bild={diversifikation} />
      </div>

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

function Kachel({ href, label, wert, fuss, warnung }: { href: string; label: string; wert: string; fuss: string; warnung?: boolean }) {
  return (
    <li>
      <Link href={href} className="bg-card hover:bg-card/80 flex h-full flex-col gap-1 rounded-[1.5rem] p-5">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className={`text-2xl font-semibold tabular-nums ${warnung ? "text-destructive" : "text-primary"}`}>{wert}</span>
        <span className="text-muted-foreground text-xs">{fuss}</span>
      </Link>
    </li>
  )
}
