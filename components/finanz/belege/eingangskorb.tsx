import { FileCheck2, FileText, Paperclip } from "lucide-react"

import { zuordnen } from "@/app/(finanz)/finanz/belege/actions"
import { GESCHAEFTSFELDER, type Beleg, type BelegeUebersicht } from "@/lib/finanz/belege"
import { eur, tag } from "@/components/finanz/format"
import { Karte } from "@/components/finanz/karte"
import { MehrListe } from "@/components/finanz/mehr-liste"

const FELD_LABEL = Object.fromEntries(GESCHAEFTSFELDER.map((g) => [g.key, g.label]))

function FeldKnoepfe({ ids, haendler }: { ids?: string[]; haendler?: string }) {
  return (
    <form action={zuordnen} className="flex flex-wrap gap-1.5">
      {ids?.map((id) => <input key={id} type="hidden" name="id" value={id} />)}
      {haendler && <input type="hidden" name="haendler" value={haendler} />}
      {GESCHAEFTSFELDER.map((g) => (
        <button
          key={g.key}
          type="submit"
          name="feld"
          value={g.key}
          className="bg-muted text-foreground hover:bg-primary hover:text-primary-foreground rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
        >
          {g.label}
        </button>
      ))}
    </form>
  )
}

function BelegZeile({ b, basis, zugeordnet }: { b: Beleg; basis: string; zugeordnet?: boolean }) {
  const titel = b.art === "lose_datei" ? (b.dateiName ?? "Datei ohne Beleg") : b.haendler || "(ohne Händler)"
  return (
    <li className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="bg-muted text-muted-foreground mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full">
          {b.art === "lose_datei" ? <Paperclip className="size-4" aria-hidden /> : <FileText className="size-4" aria-hidden />}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{titel}</span>
          <span className="text-muted-foreground text-sm">
            {[b.datum ? tag(b.datum) : "ohne Datum", b.kategorie, b.archiviert ? "archiviert" : null, b.art === "lose_datei" ? "Datei ohne Beleg-Zeile" : null]
              .filter(Boolean)
              .join(" · ")}
          </span>
          {b.erechnung && (
            <span className="text-primary mt-0.5 flex items-center gap-1.5 text-xs font-medium">
              <FileCheck2 className="size-3.5 shrink-0" aria-hidden />
              E-Rechnung ({b.erechnung.format.toUpperCase()}){b.erechnung.nummer ? ` · Nr. ${b.erechnung.nummer}` : ""}
              {b.erechnung.iban ? ` · IBAN ${b.erechnung.iban}` : ""}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 md:items-end">
        <div className="flex items-center gap-3">
          {b.art === "beleg" && <span className="font-mono text-sm tabular-nums">{eur(b.bruttoCent)}</span>}
          {b.hatDatei && (
            <a
              href={`${basis}/belege/datei/${encodeURIComponent(b.id)}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary text-sm font-semibold underline-offset-4 hover:underline"
            >
              Ansehen
            </a>
          )}
        </div>
        {zugeordnet ? (
          <form action={zuordnen} className="flex items-center gap-2">
            <input type="hidden" name="id" value={b.id} />
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
              {b.zuordnungQuelle === "ki" ? "KI · " : b.zuordnungQuelle === "verlauf" ? "automatisch · " : ""}
              {b.geschaeftsfeld ? FELD_LABEL[b.geschaeftsfeld] : ""}
            </span>
            <button type="submit" name="feld" value="korb" className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline">
              zurück in den Korb
            </button>
          </form>
        ) : (
          <FeldKnoepfe ids={[b.id]} />
        )}
      </div>
    </li>
  )
}

export function Eingangskorb({ daten, basis }: { daten: BelegeUebersicht; basis: string }) {
  const korbSumme = daten.korb.reduce((x, b) => x + b.bruttoCent, 0)
  return (
    <div className="flex flex-col gap-4">
      <Karte
        titel="Noch ohne Geschäftsfeld"
        untertitel="Bekannte Händler ordnet das System selbst zu. Hier steht nur, was neu oder unsicher ist."
        zahl={String(daten.korbAnzahl)}
        fuss={daten.korb.length ? eur(korbSumme) : "alles zugeordnet"}
        warnung={daten.korbAnzahl > 0}
        offen={daten.korbAnzahl > 0}
      >
        {daten.korbHaendler.length > 0 && (
          <div className="bg-background flex flex-col gap-3 rounded-2xl p-4">
            <p className="text-sm font-medium">Schnell zuordnen – ein Klick für alle Belege eines Händlers</p>
            <MehrListe
              start={4}
              kinder={daten.korbHaendler.map((h) => (
                <li key={h.haendler} className="border-line flex flex-col gap-2 border-b py-3 last:border-0 md:flex-row md:items-center md:justify-between">
                  <span className="text-sm">
                    <strong>{h.haendler}</strong> · {h.anzahl} Belege · {eur(h.bruttoCent)}
                  </span>
                  <FeldKnoepfe haendler={h.haendler} />
                </li>
              ))}
            />
          </div>
        )}
        {daten.korb.length === 0 ? (
          <p className="text-muted-foreground py-4 text-sm">{daten.gesamt === 0 ? "Noch keine Belege. Starten Sie unten den Umzug aus fibero oder laden Sie einen Beleg hoch." : "Alles zugeordnet. Der Korb ist leer."}</p>
        ) : (
          <MehrListe start={8} kinder={daten.korb.map((b) => <BelegZeile key={b.id} b={b} basis={basis} />)} />
        )}
        {daten.korbAnzahl > daten.korb.length && <p className="text-muted-foreground text-sm">Es werden die neuesten {daten.korb.length} von {daten.korbAnzahl} angezeigt.</p>}
      </Karte>

      {GESCHAEFTSFELDER.map((g) => {
        const zeilen = daten.zugeordnet.filter((b) => b.geschaeftsfeld === g.key)
        const kennzahl = daten.felder.find((f) => f.key === g.key)
        if (!kennzahl || kennzahl.anzahl === 0) return null
        const auto = zeilen.filter((b) => b.zuordnungQuelle === "verlauf" || b.zuordnungQuelle === "ki").length
        return (
          <Karte key={g.key} titel={g.label} untertitel={`${kennzahl.anzahl} Belege${auto ? ` · ${auto} automatisch zugeordnet` : ""}`} zahl={eur(kennzahl.bruttoCent)} fuss="brutto">
            <MehrListe start={10} kinder={zeilen.map((b) => <BelegZeile key={b.id} b={b} basis={basis} zugeordnet />)} />
          </Karte>
        )
      })}
    </div>
  )
}
