import { eur, eurRund, monatKurz } from "@/components/finanz/format"
import type { Hinweis, Monat, Steuertopf } from "@/lib/finanz/rechnen"

const SCHWERE = {
  critical: { text: "Jetzt", punkt: "bg-destructive" },
  attention: { text: "Bald", punkt: "bg-amber-500" },
  neutral: { text: "Gut", punkt: "bg-primary" },
} as const

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
    <section aria-labelledby="kompass" className="grid gap-5 lg:grid-cols-5">
      <div className="bg-card relative flex flex-col gap-8 overflow-hidden rounded-[2rem] p-7 shadow-sm md:p-9 lg:col-span-3">
        <div className="relative flex flex-col gap-2">
          <h2 id="kompass" className="text-muted-foreground text-sm font-medium">
            Frei verfügbar
          </h2>
          <p className="text-primary font-sans text-5xl font-semibold tracking-tight tabular-nums md:text-7xl">{eurRund(frei)}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">Kontostand minus Steuertopf – dieses Geld gehört wirklich dir.</p>
        </div>

        <dl className="relative grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4">
          <Kennzahl titel="Kontostand" wert={eurRund(stand)} />
          <Kennzahl titel="USt offen" wert={eurRund(topf.ustOffenCent)} />
          <Kennzahl titel="ESt-Rücklage" wert={eurRund(topf.estRuecklageCent)} />
          <Kennzahl titel="Reichweite" wert={reichweite === null ? "–" : `${reichweite.toFixed(1)} Mon.`} />
        </dl>

        <div className="relative flex h-24 items-end gap-3" role="img" aria-label="Einnahmen und Ausgaben der letzten sechs Monate">
          {verlauf.map((m) => (
            <div key={m.schluessel} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-20 w-full items-end justify-center gap-1">
                <span className="bg-primary w-1/3 rounded-full" style={{ height: `${Math.max(4, (m.einCent / max) * 100)}%` }} title={`Ein ${eur(m.einCent)}`} />
                <span className="bg-primary/25 w-1/3 rounded-full" style={{ height: `${Math.max(4, (m.ausCent / max) * 100)}%` }} title={`Aus ${eur(m.ausCent)}`} />
              </div>
              <span className="text-muted-foreground text-xs">{monatKurz(m.schluessel)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card flex flex-col gap-5 rounded-[2rem] p-7 lg:col-span-2">
        <h2 className="text-lg font-semibold">Was jetzt zählt</h2>
        {hinweise.length === 0 ? (
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Alles im grünen Bereich. Trag Einnahmen und Ausgaben ein, dann sagt dir der Kompass, was als Nächstes zählt.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {hinweise.map((h) => (
              <li key={h.text} className="flex gap-3">
                <span className={`mt-2 size-2 shrink-0 rounded-full ${SCHWERE[h.schwere].punkt}`} aria-hidden />
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs font-medium">{SCHWERE[h.schwere].text}</span>
                  <p className="leading-relaxed text-pretty">{h.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-muted-foreground mt-auto text-sm">
          Gewinn {new Date().getFullYear()} bisher: <span className="text-foreground font-semibold tabular-nums">{eur(topf.gewinnJahrCent)}</span> netto
        </p>
      </div>
    </section>
  )
}

function Kennzahl({ titel, wert }: { titel: string; wert: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground text-xs font-medium">{titel}</dt>
      <dd className="text-lg font-semibold tabular-nums">{wert}</dd>
    </div>
  )
}
