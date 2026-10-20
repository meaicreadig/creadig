import Link from "next/link"

import { ustvaInFristUebernehmen } from "@/app/(finanz)/finanz/actions"
import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { eur, tag } from "@/components/finanz/format"
import { finanzBasis } from "@/lib/finanz/basis"
import { berechneLage } from "@/lib/finanz/lage"
import { finanzDb } from "@/lib/finanz/store"
import { berechneUstVa, zeitraumFuerFrist } from "@/lib/finanz/ustva"
import { finanzOwnerSeite } from "@/lib/finanz/zugang"

export const dynamic = "force-dynamic"
export const metadata = { title: "USt-Voranmeldung" }

export default async function FinanzUstVa({ searchParams }: { searchParams: Promise<{ frist?: string }> }) {
  await finanzOwnerSeite()
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="ustva" titel="USt-Voranmeldung"><OhneSpeicher /></FinanzShell>

  const { einstellungen, buchungen, fristen } = await berechneLage(db)
  const basis = await finanzBasis()

  if (!einstellungen.ustPflichtig) {
    return (
      <FinanzShell aktiv="ustva" titel="USt-Voranmeldung" unterzeile="Nach § 19 UStG fällt keine Umsatzsteuer an — es gibt keine Voranmeldung.">
        <p className="bg-card rounded-[2rem] p-7">
          Solange die Umsatzsteuerpflicht in den <Link className="text-primary underline" href={`${basis}/grundlagen`}>Grundlagen</Link> aus ist, rechnet diese Seite nichts. Die § 19-Ampel auf „Heute“ sagt dir, wann sich das ändert.
        </p>
      </FinanzShell>
    )
  }

  const kandidaten = fristen
    .filter((f) => f.art === "ust" && f.periodeEnde)
    .sort((a, b) => a.faellig.localeCompare(b.faellig))
  const gewaehlt = (await searchParams).frist
  const frist = kandidaten.find((f) => f.id === gewaehlt) ?? kandidaten.find((f) => !f.erledigt) ?? kandidaten.at(-1)
  const zeitraum = frist ? zeitraumFuerFrist(frist, einstellungen.ustRhythmus) : null
  const va = zeitraum ? berechneUstVa(buchungen, zeitraum) : null

  return (
    <FinanzShell aktiv="ustva" titel="USt-Voranmeldung" unterzeile="Die Zahlen in der Reihenfolge des Formulars. Abtippen in ELSTER — übermittelt wird von dir oder deinem Steuerberater.">
      <nav aria-label="Zeitraum" className="flex flex-wrap gap-2">
        {kandidaten.map((f) => (
          <Link
            key={f.id}
            href={`${basis}/steuern/ustva?frist=${encodeURIComponent(f.id)}`}
            aria-current={frist?.id === f.id ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium ${frist?.id === f.id ? "bg-primary text-primary-foreground" : "bg-card text-foreground/75"}`}
          >
            {f.titel}
            {f.erledigt ? " ✓" : ""}
          </Link>
        ))}
      </nav>

      {!va || !frist || !zeitraum ? (
        <p className="bg-card rounded-[2rem] p-7">Es gibt noch keine USt-Frist. Sie wird beim Öffnen von „Heute“ automatisch angelegt.</p>
      ) : (
        <>
          <section className="bg-card flex flex-col gap-5 rounded-[2rem] p-7" aria-labelledby="va-titel">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="va-titel" className="text-lg font-semibold">
                {frist.titel} · {tag(zeitraum.von)} – {tag(zeitraum.bis)}
              </h2>
              <span className="text-muted-foreground text-sm">fällig {tag(frist.faellig)}{frist.erledigt ? " · erledigt" : ""}</span>
            </div>
            <dl className="grid gap-3">
              <Zeile kz="81" label="Steuerpflichtige Umsätze 19 % (Bemessungsgrundlage, volle Euro)" wert={eur(va.kz81Cent)} hinweis={`Umsatzsteuer lt. Buchführung ${eur(va.ust19Cent)}`} />
              <Zeile kz="86" label="Steuerpflichtige Umsätze 7 % (Bemessungsgrundlage, volle Euro)" wert={eur(va.kz86Cent)} hinweis={`Umsatzsteuer lt. Buchführung ${eur(va.ust7Cent)}`} />
              <Zeile kz="66" label="Abziehbare Vorsteuer aus Rechnungen" wert={eur(va.kz66Cent)} hinweis={`${va.anzahl.vorsteuer} Belege`} />
              <Zeile kz="83" label={va.kz83Cent >= 0 ? "Verbleibende Umsatzsteuer-Vorauszahlung" : "Erstattung (Überschuss)"} wert={eur(Math.abs(va.kz83Cent))} stark />
            </dl>
            {va.ohneUstCent > 0 && (
              <p className="type-small text-muted-foreground">Einnahmen ohne USt in dieser Periode: {eur(va.ohneUstCent)} (nicht zugeordnet, siehe Hinweise).</p>
            )}
            {!frist.erledigt && (
              <form action={ustvaInFristUebernehmen} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="frist" value={frist.id} />
                <button type="submit" className="bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold">
                  Zahllast {eur(va.kz83Cent)} in die Frist übernehmen
                </button>
                <span className="text-muted-foreground text-xs">Danach rechnet die Liquidität mit genau diesem Betrag. Erledigt wird die Frist erst, wenn du bezahlt hast.</span>
              </form>
            )}
          </section>
          <section className="bg-card rounded-[2rem] p-7" aria-labelledby="hinweise">
            <h2 id="hinweise" className="mb-3 text-lg font-semibold">Hinweise</h2>
            <ul className="text-muted-foreground flex list-disc flex-col gap-2 ps-5 text-sm">
              {va.hinweise.map((h) => (
                <li key={h}>{h}</li>
              ))}
              <li>Ist-Versteuerung: gezählt wird, was im Zeitraum gebucht (geflossen) ist. Keine Steuerberatung.</li>
            </ul>
          </section>
        </>
      )}
    </FinanzShell>
  )
}

function Zeile({ kz, label, wert, hinweis, stark }: { kz: string; label: string; wert: string; hinweis?: string; stark?: boolean }) {
  return (
    <div className={`flex items-baseline gap-4 rounded-2xl px-4 py-3 ${stark ? "bg-primary/10" : "bg-background"}`}>
      <dt className="text-muted-foreground w-14 shrink-0 font-mono text-sm">Kz {kz}</dt>
      <dd className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4">
        <span>
          {label}
          {hinweis && <span className="text-muted-foreground block text-xs">{hinweis}</span>}
        </span>
        <span className={`tabular-nums ${stark ? "text-xl font-semibold" : "font-medium"}`}>{wert}</span>
      </dd>
    </div>
  )
}
