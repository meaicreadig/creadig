import { FileText, Paperclip } from "lucide-react"

import { zuordnen } from "@/app/(finanz)/finanz/belege/actions"
import { GESCHAEFTSFELDER, type Beleg, type BelegeUebersicht } from "@/lib/finanz/belege"
import { eur, tag } from "@/components/finanz/format"

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
  return (
    <div className="flex flex-col gap-8">
      {daten.korbHaendler.length > 0 && (
        <section aria-labelledby="haendler-titel" className="bg-card flex flex-col gap-4 rounded-3xl p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-1">
            <h2 id="haendler-titel" className="text-xl font-semibold tracking-tight">
              Schnell zuordnen
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">Ein Klick ordnet alle offenen Belege eines Händlers zu.</p>
          </div>
          <ul className="divide-border flex flex-col divide-y">
            {daten.korbHaendler.map((h) => (
              <li key={h.haendler} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{h.haendler}</span>
                  <span className="text-muted-foreground text-sm">
                    {h.anzahl} Belege · {eur(h.bruttoCent)}
                  </span>
                </div>
                <FeldKnoepfe haendler={h.haendler} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="korb-titel" className="bg-card flex flex-col gap-2 rounded-3xl p-6 shadow-sm md:p-8">
        <h2 id="korb-titel" className="text-xl font-semibold tracking-tight">
          Eingangskorb
        </h2>
        {daten.korb.length === 0 ? (
          <p className="text-muted-foreground py-4 leading-relaxed">
            {daten.gesamt === 0 ? "Noch keine Belege. Starten Sie oben den Umzug aus fibero." : "Alles zugeordnet. Der Korb ist leer."}
          </p>
        ) : (
          <ul className="divide-border flex flex-col divide-y">
            {daten.korb.map((b) => (
              <BelegZeile key={b.id} b={b} basis={basis} />
            ))}
          </ul>
        )}
        {daten.korbAnzahl > daten.korb.length && (
          <p className="text-muted-foreground text-sm">Es werden die neuesten {daten.korb.length} von {daten.korbAnzahl} angezeigt.</p>
        )}
      </section>

      {daten.zugeordnet.length > 0 && (
        <section aria-labelledby="zu-titel" className="bg-card flex flex-col gap-2 rounded-3xl p-6 shadow-sm md:p-8">
          <h2 id="zu-titel" className="text-xl font-semibold tracking-tight">
            Zuletzt zugeordnet
          </h2>
          <ul className="divide-border flex flex-col divide-y">
            {daten.zugeordnet.map((b) => (
              <BelegZeile key={b.id} b={b} basis={basis} zugeordnet />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
