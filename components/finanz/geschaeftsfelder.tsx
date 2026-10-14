import Link from "next/link"

import { eurRund } from "@/components/finanz/format"
import type { FelderBild } from "@/lib/finanz/felder"
import type { AbgleichStand } from "@/lib/finanz/fibero-abgleich"

const ZEIT = new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Berlin" })

function Kennzahl({ label, wert, hinweis, warnung }: { label: string; wert: string; hinweis?: string; warnung?: boolean }) {
  return (
    <div className="bg-card flex flex-col gap-2 rounded-[2rem] p-6">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={`font-sans text-3xl font-semibold tabular-nums ${warnung ? "text-destructive" : "text-primary"}`}>{wert}</span>
      {hinweis ? <span className="text-muted-foreground text-xs">{hinweis}</span> : null}
    </div>
  )
}

export function Geschaeftsfelder({
  bild,
  stand,
  basis,
  jahre,
}: {
  bild: FelderBild
  stand: AbgleichStand
  basis: string
  jahre: string[]
}) {
  const ergebnis = bild.summe.einCent - bild.summe.ausCent
  const maxEin = Math.max(1, ...bild.felder.map((f) => f.einCent))
  const fehler = stand.ergebnis
    ? Object.entries(stand.ergebnis).filter(([, t]) => t.fehler)
    : []
  const namen: Record<string, string> = { rechnungen: "Ausgangsrechnungen", subunternehmer: "Subunternehmer", belege: "Belege" }

  return (
    <section aria-labelledby="felder-titel" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="felder-titel" className="text-xl font-semibold">Geschäftsfelder {bild.jahr}</h2>
          <p className="text-muted-foreground text-sm">Netto, ohne Stornos. Jede Zahl kommt aus dem Hauptbuch.</p>
        </div>
        <nav aria-label="Jahr wählen" className="bg-card flex gap-1 rounded-full p-1">
          {jahre.map((j) => (
            <Link
              key={j}
              href={`${basis}?jahr=${j}`}
              aria-current={j === bild.jahr ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${j === bild.jahr ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {j}
            </Link>
          ))}
        </nav>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kennzahl label="Einnahmen" wert={eurRund(bild.summe.einCent)} />
        <Kennzahl label="Ausgaben" wert={eurRund(bild.summe.ausCent)} />
        <Kennzahl label="Ergebnis vor Steuern" wert={eurRund(ergebnis)} warnung={ergebnis < 0} />
        <Kennzahl
          label="Rechnungen offen"
          wert={eurRund(bild.offen.bruttoCent)}
          hinweis={`${bild.offen.anzahl} ${bild.offen.anzahl === 1 ? "Rechnung" : "Rechnungen"} noch nicht bezahlt (brutto)`}
          warnung={bild.offen.anzahl > 0}
        />
      </div>

      <div className="bg-card flex flex-col gap-1 rounded-[2rem] p-3 sm:p-4">
        {bild.felder.length === 0 ? (
          <p className="text-muted-foreground p-4">Für {bild.jahr} gibt es noch keine Buchungen.</p>
        ) : (
          bild.felder.map((f) => {
            const e = f.einCent - f.ausCent
            return (
              <div key={f.key} className="hover:bg-background flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-medium">{f.label}</span>
                    <span className="text-muted-foreground text-xs tabular-nums">{f.anzahl} Buchungen</span>
                  </div>
                  <div className="bg-background h-2 overflow-hidden rounded-full" aria-hidden>
                    <div className="bg-primary h-full rounded-full" style={{ width: `${Math.round((f.einCent / maxEin) * 100)}%` }} />
                  </div>
                </div>
                <dl className="grid grid-cols-3 gap-4 text-sm sm:w-96">
                  <div className="flex flex-col">
                    <dt className="text-muted-foreground text-xs">Ein</dt>
                    <dd className="tabular-nums">{eurRund(f.einCent)}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-muted-foreground text-xs">Aus</dt>
                    <dd className="tabular-nums">{eurRund(f.ausCent)}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-muted-foreground text-xs">Ergebnis</dt>
                    <dd className={`font-semibold tabular-nums ${e < 0 ? "text-destructive" : "text-primary"}`}>{eurRund(e)}</dd>
                  </div>
                </dl>
              </div>
            )
          })
        )}
      </div>

      <div className="text-muted-foreground flex flex-col gap-2 px-2 text-sm">
        <p>
          fibero {stand.laufAt ? `abgeglichen ${ZEIT.format(new Date(stand.laufAt))}` : "noch nicht abgeglichen"}
          {stand.ergebnis
            ? ` · ${Object.entries(stand.ergebnis)
                .filter(([, t]) => !t.fehler)
                .map(([k, t]) => `${t.anzahl} ${namen[k] ?? k}`)
                .join(" · ")}`
            : ""}
          {" · läuft automatisch"}
        </p>
        {fehler.length > 0 ? (
          <p className="text-destructive">
            Nicht gelesen: {fehler.map(([k, t]) => `${namen[k] ?? k} (${t.fehler})`).join(", ")}
          </p>
        ) : null}
      </div>
    </section>
  )
}
