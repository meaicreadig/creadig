import { Logo } from "@/components/brand/logo"
import {
  berechne,
  DOK_TEXT,
  formatDatum,
  formatEuro,
  formatMenge,
  LAENDER,
  positionNetto,
  type SteuerModus,
} from "@/lib/finanz/auftraege/rechnen"
import type { Dokument, Firma } from "@/lib/finanz/auftraege/store"

/**
 * Das Papier selbst — eine Darstellung für Vorschau, Kundenlink und Druck/PDF.
 * Festgeschriebene Dokumente zeigen ihren Schnappschuss (Summen, Absender),
 * Entwürfe rechnen live mit den aktuellen Grundlagen.
 */
export function DokumentBlatt({ d, firma, modus }: { d: Dokument; firma: Firma; modus: SteuerModus }) {
  const T = DOK_TEXT[d.sprache]
  const f = d.absender ?? firma
  const m = d.steuerModus ?? modus
  const summen = d.summen ?? berechne(d.positionen, d.rabattProzent, m)
  const name = d.art === "angebot" ? T.angebot : d.art === "storno" ? T.storno : T.rechnung
  const land = LAENDER.find((l) => l.code === d.kunde.land)
  const hinweis = T.hinweis[m]
  const geld = (c: number) => formatEuro(c, d.sprache)

  const meta: [string, string][] = [
    [T.nummer, d.nummer ? `${d.nummer}${d.art === "angebot" && d.version > 1 ? ` · ${T.version} ${d.version}` : ""}` : "—"],
    [T.datum, formatDatum(d.datum, d.sprache)],
  ]
  if (d.art === "angebot" && d.gueltigBis) meta.push([T.gueltig, formatDatum(d.gueltigBis, d.sprache)])
  if (d.art === "rechnung" && d.faelligAm) meta.push([T.faellig, formatDatum(d.faelligAm, d.sprache)])
  if (d.leistungszeitraum) meta.push([T.leistung, d.leistungszeitraum])

  return (
    <article
      lang={d.sprache}
      className="bg-card text-foreground mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-[2rem] p-6 shadow-sm sm:p-12 print:max-w-none print:rounded-none print:p-0 print:shadow-none"
    >
      <header className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo variant="dark" className="h-7 w-auto" />
          <p className="text-muted-foreground text-xs font-medium tracking-wide">System-Haus für digitale Betriebe</p>
        </div>
        <address className="text-muted-foreground text-sm leading-relaxed not-italic sm:text-right">
          <span className="text-foreground font-semibold">{f.name}</span>
          <br />
          {f.inhaber}
          {f.strasse && (
            <>
              <br />
              {f.strasse}
              <br />
              {f.plzOrt}
            </>
          )}
          {f.email && (
            <>
              <br />
              {f.email}
            </>
          )}
        </address>
      </header>

      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <address className="text-sm leading-relaxed not-italic">
          {d.kunde.firma && <span className="font-semibold">{d.kunde.firma}<br /></span>}
          {d.kunde.name && <>{d.kunde.name}<br /></>}
          {d.kunde.strasse && <>{d.kunde.strasse}<br /></>}
          {d.kunde.plzOrt}
          {land && land.code !== "DE" && <><br />{land.label}</>}
          {d.kunde.ustId && (
            <span className="text-muted-foreground mt-2 block text-xs">
              {T.ihreUstid}: {d.kunde.ustId}
            </span>
          )}
        </address>
        <dl className="bg-background grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 self-start rounded-2xl px-5 py-4 text-sm">
          {meta.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-medium tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">{name}</p>
        {d.titel && <h2 className="font-sans text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{d.titel}</h2>}
        {d.einleitung && <p className="text-muted-foreground max-w-3xl leading-relaxed whitespace-pre-line text-pretty">{d.einleitung}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-separate border-spacing-y-1.5 text-sm">
          <caption className="sr-only">{name}</caption>
          <thead>
            <tr className="text-muted-foreground text-left text-xs">
              <th scope="col" className="w-10 px-3 pb-2 font-medium">{T.pos}</th>
              <th scope="col" className="px-3 pb-2 font-medium">{T.beschreibung}</th>
              <th scope="col" className="px-3 pb-2 text-right font-medium">{T.menge}</th>
              <th scope="col" className="px-3 pb-2 text-right font-medium">{T.preis}</th>
              <th scope="col" className="px-3 pb-2 text-right font-medium">{T.betrag}</th>
            </tr>
          </thead>
          <tbody>
            {d.positionen.map((p, i) => {
              const aus = p.optional && !p.gewaehlt
              return (
                <tr key={i} className={aus ? "text-muted-foreground" : ""}>
                  <td className="bg-background rounded-l-2xl px-3 py-3 align-top tabular-nums">{i + 1}</td>
                  <td className="bg-background px-3 py-3 align-top">
                    <span className="font-medium">{p.titel}</span>
                    {p.optional && (
                      <span className="bg-secondary text-secondary-foreground ms-2 rounded-full px-2 py-0.5 text-xs font-medium">
                        {T.optional}
                      </span>
                    )}
                    {p.beschreibung && <p className="text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">{p.beschreibung}</p>}
                  </td>
                  <td className="bg-background px-3 py-3 text-right align-top whitespace-nowrap tabular-nums">
                    {formatMenge(p.menge, d.sprache)} {p.einheit}
                  </td>
                  <td className="bg-background px-3 py-3 text-right align-top whitespace-nowrap tabular-nums">{geld(p.preisCent)}</td>
                  <td className="bg-background rounded-r-2xl px-3 py-3 text-right align-top font-medium whitespace-nowrap tabular-nums">
                    {geld(positionNetto(p))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-muted-foreground flex max-w-sm flex-col gap-2 text-sm leading-relaxed">
          {hinweis && <p className="text-foreground font-medium">{hinweis}</p>}
          {summen.optionalCent > 0 && (
            <p>
              {T.optionalSumme}: {geld(summen.optionalCent)}
            </p>
          )}
        </div>
        <dl className="flex w-full flex-col gap-1.5 text-sm sm:w-80">
          {summen.rabattCent !== 0 && (
            <>
              <Zeile k={T.zwischen} v={geld(summen.zwischenCent)} />
              <Zeile k={`${T.rabatt} ${formatMenge(d.rabattProzent, d.sprache)} %`} v={`− ${geld(summen.rabattCent)}`} />
            </>
          )}
          <Zeile k={T.netto} v={geld(summen.nettoCent)} />
          {summen.gruppen
            .filter((g) => g.satz > 0)
            .map((g) => (
              <Zeile key={g.satz} k={`${T.ust} ${g.satz} %`} v={geld(g.ustCent)} />
            ))}
          <div className="bg-primary text-primary-foreground mt-2 flex items-baseline justify-between gap-4 rounded-2xl px-5 py-4">
            <dt className="font-medium">{T.gesamt}</dt>
            <dd className="font-sans text-xl font-semibold tabular-nums">{geld(summen.bruttoCent)}</dd>
          </div>
        </dl>
      </div>

      {(d.art === "rechnung" || d.schluss) && (
        <div className="flex flex-col gap-3 text-sm leading-relaxed">
          {d.art === "rechnung" && d.faelligAm && (
            <p>
              {T.zahlung} <strong className="tabular-nums">{formatDatum(d.faelligAm, d.sprache)}</strong>.
            </p>
          )}
          {d.schluss && <p className="text-muted-foreground whitespace-pre-line">{d.schluss}</p>}
        </div>
      )}

      <footer className="bg-background text-muted-foreground grid gap-4 rounded-2xl p-5 text-xs leading-relaxed sm:grid-cols-3">
        <p>
          <span className="text-foreground font-medium">{f.name}</span>
          <br />
          {T.inhaber}: {f.inhaber}
          {f.web && (
            <>
              <br />
              {f.web.replace(/^https?:\/\//, "")}
            </>
          )}
        </p>
        <p>
          {f.steuernummer && (
            <>
              {T.steuernr}: {f.steuernummer}
              <br />
            </>
          )}
          {f.ustId && (
            <>
              {T.ustid}: {f.ustId}
            </>
          )}
        </p>
        {f.iban && (
          <p>
            <span className="text-foreground font-medium">{T.bank}</span>
            <br />
            {f.bank && <>{f.bank}<br /></>}
            IBAN {f.iban.replace(/(.{4})/g, "$1 ").trim()}
            {f.bic && <><br />BIC {f.bic}</>}
          </p>
        )}
      </footer>
    </article>
  )
}

function Zeile({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  )
}
