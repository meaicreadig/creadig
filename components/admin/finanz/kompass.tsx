import { Pill } from "@/components/admin/primitives"
import { eur, eurRund, monatKurz } from "@/components/admin/finanz/format"
import type { Hinweis, Monat, Steuertopf } from "@/lib/finanz/rechnen"

const SCHWERE_TEXT = { critical: "Jetzt", attention: "Bald", neutral: "Gut" } as const

export function FinanzKompass({
  stand,
  frei,
  topf,
  reichweite,
  hinweise,
  verlauf,
}: {
  stand: number
  frei: number
  topf: Steuertopf
  reichweite: number | null
  hinweise: Hinweis[]
  verlauf: Monat[]
}) {
  const max = Math.max(1, ...verlauf.flatMap((m) => [m.einCent, m.ausCent]))

  return (
    <section aria-labelledby="kompass" className="grid gap-6 lg:grid-cols-5">
      <div className="tile bg-surface flex flex-col gap-6 p-6 lg:col-span-3">
        <div className="flex flex-col gap-2">
          <h2 id="kompass" className="text-meta text-gold-text">
            Frei verfügbar
          </h2>
          <p
            className={`font-sans text-5xl font-semibold tracking-tight tabular-nums md:text-6xl ${frei < 0 ? "text-destructive" : "text-foreground"}`}
          >
            {eurRund(frei)}
          </p>
          <p className="type-small text-muted-foreground text-pretty">
            Kontostand minus Steuertopf. Dieses Geld gehört wirklich dir.
          </p>
        </div>

        <dl className="border-line grid grid-cols-2 gap-4 border-t pt-5 md:grid-cols-4">
          <Kennzahl titel="Kontostand" wert={eurRund(stand)} />
          <Kennzahl titel="USt offen" wert={eurRund(topf.ustOffenCent)} gold />
          <Kennzahl titel="ESt-Rücklage" wert={eurRund(topf.estRuecklageCent)} gold />
          <Kennzahl titel="Reichweite" wert={reichweite === null ? "–" : `${reichweite.toFixed(1)} Mon.`} />
        </dl>

        <div className="flex flex-col gap-3">
          <p className="text-meta text-muted-foreground">Letzte 6 Monate · Ein / Aus</p>
          <div className="flex h-24 items-end gap-3" role="img" aria-label="Einnahmen und Ausgaben der letzten sechs Monate">
            {verlauf.map((m) => (
              <div key={m.schluessel} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-20 w-full items-end justify-center gap-1">
                  <span
                    className="bg-gold w-1/3 rounded-t-sm"
                    style={{ height: `${Math.max(2, (m.einCent / max) * 100)}%` }}
                    title={`Ein ${eur(m.einCent)}`}
                  />
                  <span
                    className="bg-muted-foreground/40 w-1/3 rounded-t-sm"
                    style={{ height: `${Math.max(2, (m.ausCent / max) * 100)}%` }}
                    title={`Aus ${eur(m.ausCent)}`}
                  />
                </div>
                <span className="text-muted-foreground text-xs">{monatKurz(m.schluessel)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tile bg-surface flex flex-col gap-4 p-6 lg:col-span-2">
        <h2 className="text-subhead text-base">Dein Kompass</h2>
        {hinweise.length === 0 ? (
          <p className="type-small text-muted-foreground text-pretty">
            Alles im grünen Bereich. Trag Einnahmen und Ausgaben ein, dann sagt dir der Kompass, was als Nächstes zählt.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {hinweise.map((h) => (
              <li key={h.text} className="border-line flex flex-col gap-2 border-b pb-3 last:border-0 last:pb-0">
                <Pill severity={h.schwere}>{SCHWERE_TEXT[h.schwere]}</Pill>
                <p className="text-sm leading-relaxed text-pretty">{h.text}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="text-muted-foreground mt-auto pt-2 text-xs leading-relaxed">
          Gewinn {new Date().getFullYear()} bisher: {eur(topf.gewinnJahrCent)} netto
        </p>
      </div>
    </section>
  )
}

function Kennzahl({ titel, wert, gold }: { titel: string; wert: string; gold?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-meta text-muted-foreground">{titel}</dt>
      <dd className={`text-lg font-semibold tabular-nums ${gold ? "text-gold-text" : "text-foreground"}`}>{wert}</dd>
    </div>
  )
}
