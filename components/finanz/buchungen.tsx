import { buchungAnlegen, buchungBestaetigen, buchungStornieren } from "@/app/(finanz)/finanz/actions"
import { AdminField, AdminInput, AdminSelect, Pill, SectionHeader } from "@/components/admin/primitives"
import { eur, tag } from "@/components/finanz/format"
import { Karte } from "@/components/finanz/karte"
import { MehrListe } from "@/components/finanz/mehr-liste"
import { KATEGORIEN, type Buchung } from "@/lib/finanz/rechnen"

const WIEDER = { keine: "", monatlich: "monatlich", quartal: "vierteljährlich", jaehrlich: "jährlich" } as const

export function BuchungErfassen({ heute }: { heute: string }) {
  return (
    <Karte titel="Buchung erfassen" untertitel="Einnahme oder Ausgabe von Hand eintragen">
      <form action={buchungAnlegen} className="bg-card rounded-[2rem] grid grid-cols-2 gap-4 p-5">
        <fieldset className="col-span-2 flex gap-2">
          <legend className="sr-only">Art</legend>
          {(["einnahme", "ausgabe"] as const).map((a) => (
            <label
              key={a}
              className="border-line has-[:checked]:border-gold has-[:checked]:text-gold-text flex flex-1 cursor-pointer items-center justify-center rounded-full border px-3 py-2 text-sm"
            >
              <input type="radio" name="art" value={a} defaultChecked={a === "einnahme"} className="sr-only" />
              {a === "einnahme" ? "Einnahme" : "Ausgabe"}
            </label>
          ))}
        </fieldset>
        <AdminField label="Betrag brutto (€)" htmlFor="b-betrag">
          <AdminInput id="b-betrag" name="betrag" inputMode="decimal" required placeholder="1.190,00" />
        </AdminField>
        <AdminField label="Datum" htmlFor="b-datum">
          <AdminInput id="b-datum" name="datum" type="date" required defaultValue={heute} />
        </AdminField>
        <AdminField label="Kategorie" htmlFor="b-kategorie" className="col-span-2">
          <AdminSelect id="b-kategorie" name="kategorie" required defaultValue="Projekt / Kunde">
            <optgroup label="Einnahmen">
              {KATEGORIEN.einnahme.map((k) => (
                <option key={`e-${k}`} value={k}>
                  {k}
                </option>
              ))}
            </optgroup>
            <optgroup label="Ausgaben">
              {KATEGORIEN.ausgabe
                .filter((k) => !KATEGORIEN.einnahme.includes(k))
                .map((k) => (
                  <option key={`a-${k}`} value={k}>
                    {k}
                  </option>
                ))}
            </optgroup>
          </AdminSelect>
        </AdminField>
        <AdminField label="Kunde / Lieferant" htmlFor="b-gegen" className="col-span-2">
          <AdminInput id="b-gegen" name="gegenpartei" placeholder="z. B. Vercel, IGMG Nord Ruhr" />
        </AdminField>
        <AdminField label="USt" htmlFor="b-ust">
          <AdminSelect id="b-ust" name="ust" defaultValue="19">
            <option value="19">19 %</option>
            <option value="7">7 %</option>
            <option value="0">0 % / steuerfrei</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="Status" htmlFor="b-status">
          <AdminSelect id="b-status" name="status" defaultValue="gebucht">
            <option value="gebucht">bezahlt</option>
            <option value="geplant">erwartet / geplant</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="Wiederholt sich" htmlFor="b-wieder" className="col-span-2">
          <AdminSelect id="b-wieder" name="wiederholung" defaultValue="keine">
            <option value="keine">einmalig</option>
            <option value="monatlich">monatlich</option>
            <option value="quartal">vierteljährlich</option>
            <option value="jaehrlich">jährlich</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="Notiz" htmlFor="b-notiz" className="col-span-2">
          <AdminInput id="b-notiz" name="notiz" placeholder="optional" />
        </AdminField>
        <AdminField label="Nutzungsdauer AfA (Jahre)" htmlFor="b-afa" className="col-span-1">
          <AdminInput id="b-afa" name="afa_jahre" type="number" min={0} max={50} placeholder="z. B. 3" />
        </AdminField>
        <p className="text-muted-foreground col-span-1 self-end pb-2 text-xs leading-relaxed">
          Nur bei Ausgaben: Anlagegut über mehrere Jahre abschreiben statt sofort voll absetzen. Leer lassen für normale, sofort abzugsfähige Kosten.
        </p>
        <button type="submit" className="bg-gold text-background col-span-2 rounded-full px-4 py-2.5 text-sm font-medium">
          Buchen
        </button>
        <p className="text-muted-foreground col-span-2 text-xs leading-relaxed">
          Wird die falsche Art zur Kategorie gewählt, lehnt das System ab. Buchungen werden nie gelöscht, nur storniert. Ob ein Anlagegut
          sofort abzugsfähig ist oder über die Nutzungsdauer abgeschrieben werden muss (GWG-Grenze), entscheidet der Steuerberater.
        </p>
      </form>
    </Karte>
  )
}

const MONAT = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
const monatsName = (schluessel: string) => `${MONAT[Number(schluessel.slice(5, 7)) - 1]} ${schluessel.slice(0, 4)}`

/** Buchungen als Monatskarten: oben Summen, auf Klick die Tabelle. Der laufende Monat ist offen, der Rest zu. */
export function BuchungsListe({ buchungen, heute }: { buchungen: Buchung[]; heute: string }) {
  const je = new Map<string, Buchung[]>()
  for (const b of [...buchungen].sort((a, c) => c.datum.localeCompare(a.datum))) {
    const k = b.datum.slice(0, 7)
    je.set(k, [...(je.get(k) ?? []), b])
  }
  const aktuell = heute.slice(0, 7)
  return (
    <section aria-labelledby="buchungen" className="flex flex-col gap-4">
      <SectionHeader id="buchungen" title="Buchungen" count={`${buchungen.filter((b) => !b.storniert).length} wirksam`} />
      {je.size === 0 && (
        <p className="bg-card type-small text-muted-foreground rounded-[1.75rem] p-5">
          Noch keine Buchungen. Fang mit deinem Kontostand in den Einstellungen unten an, dann trag die festen Kosten ein.
        </p>
      )}
      {[...je.entries()].map(([monat, liste]) => {
        const wirksam = liste.filter((b) => !b.storniert)
        const ein = wirksam.filter((b) => b.art === "einnahme").reduce((s, b) => s + b.bruttoCent, 0)
        const aus = wirksam.filter((b) => b.art === "ausgabe").reduce((s, b) => s + b.bruttoCent, 0)
        return (
          <Karte
            key={monat}
            titel={monatsName(monat)}
            untertitel={`${wirksam.length} Buchungen · +${eur(ein)} · −${eur(aus)}`}
            zahl={`${ein - aus >= 0 ? "+" : "−"}${eur(Math.abs(ein - aus))}`}
            fuss="Saldo brutto"
            offen={monat === aktuell}
          >
            <MehrListe start={12} kinder={liste.map((b) => <BuchungsZeile key={b.id} b={b} heute={heute} />)} />
          </Karte>
        )
      })}
    </section>
  )
}

function BuchungsZeile({ b, heute }: { b: Buchung; heute: string }) {
  return (
    <li className={`border-line flex items-center gap-3 border-b px-1 py-3 last:border-0 ${b.storniert ? "opacity-50" : ""}`}>
      <span className="text-muted-foreground w-20 shrink-0 text-xs tabular-nums">{tag(b.datum)}</span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className={`truncate text-sm ${b.storniert ? "line-through" : ""}`}>{b.gegenpartei ?? b.kategorie}</span>
        <span className="text-muted-foreground truncate text-xs">
          {b.kategorie}
          {b.wiederholung !== "keine" ? ` · ${WIEDER[b.wiederholung]}` : ""}
          {b.afaJahre ? ` · AfA ${b.afaJahre} Jahre` : ""}
          {b.notiz ? ` · ${b.notiz}` : ""}
        </span>
      </div>
      {b.status === "geplant" && !b.storniert && <Pill severity={b.datum < heute ? "critical" : "attention"}>{b.datum < heute ? "überfällig" : "geplant"}</Pill>}
      {b.storniert && <Pill>storniert</Pill>}
      <span className={`w-28 shrink-0 text-end text-sm tabular-nums ${b.art === "einnahme" ? "text-gold-text" : ""}`}>
        {b.art === "einnahme" ? "+" : "−"}
        {eur(b.bruttoCent)}
      </span>
      {!b.storniert && (
        <div className="flex shrink-0 gap-1">
          {b.status === "geplant" && (
            <form action={buchungBestaetigen}>
              <input type="hidden" name="id" value={b.id} />
              <button type="submit" className="text-gold-text hover:bg-gold/10 rounded-full px-2 py-1 text-xs">bezahlt</button>
            </form>
          )}
          <form action={buchungStornieren}>
            <input type="hidden" name="id" value={b.id} />
            <button type="submit" className="text-muted-foreground hover:text-destructive rounded-full px-2 py-1 text-xs">stornieren</button>
          </form>
        </div>
      )}
    </li>
  )
}
