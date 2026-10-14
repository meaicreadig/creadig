import { SectionHeader } from "@/components/admin/primitives"
import { eur, eurRund, tag } from "@/components/finanz/format"
import type { Bewegung, Woche } from "@/lib/finanz/rechnen"

export function LiquiditaetsBand({
  wochen,
  topfCent,
  bewegungen,
}: {
  wochen: Woche[]
  topfCent: number
  bewegungen: Bewegung[]
}) {
  const max = Math.max(1, topfCent, ...wochen.map((w) => Math.abs(w.standCent)))
  const tief = wochen.reduce((a, w) => (w.standCent < a.standCent ? w : a), wochen[0])
  const topfHoehe = (topfCent / max) * 100

  return (
    <section aria-labelledby="liquiditaet" className="flex flex-col gap-4">
      <SectionHeader
        id="liquiditaet"
        title="Liquidität · nächste 13 Wochen"
        count={tief ? `Tiefpunkt ${eurRund(tief.standCent)} am ${tag(tief.bis)}` : undefined}
      />
      <div className="bg-card rounded-[2rem] flex flex-col gap-4 p-6">
        <div className="relative flex h-44 items-end gap-1.5" role="img" aria-label="Erwarteter Kontostand je Woche">
          {topfCent > 0 && (
            <div
              className="border-gold pointer-events-none absolute inset-x-0 border-t border-dashed"
              style={{ bottom: `${topfHoehe}%` }}
            >
              <span className="text-gold-text bg-surface absolute -top-3 end-0 px-1 text-xs">Steuertopf {eurRund(topfCent)}</span>
            </div>
          )}
          {wochen.map((w) => {
            const h = Math.max(2, (Math.abs(w.standCent) / max) * 100)
            const negativ = w.standCent < 0
            const unterTopf = !negativ && w.standCent < topfCent
            return (
              <div
                key={w.bis}
                className={`flex-1 rounded-t-sm ${negativ ? "bg-destructive" : unterTopf ? "bg-gold/50" : "bg-gold"}`}
                style={{ height: `${h}%` }}
                title={`bis ${tag(w.bis)}: ${eur(w.standCent)} (+${eur(w.einCent)} / −${eur(w.ausCent)})`}
              />
            )
          })}
        </div>
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>heute</span>
          <span>+13 Wochen</span>
        </div>

        {bewegungen.length > 0 ? (
          <ul className="border-line grid gap-x-8 gap-y-2 border-t pt-4 text-sm md:grid-cols-2">
            {bewegungen.slice(0, 8).map((b, i) => (
              <li key={`${b.datum}-${i}`} className="flex items-baseline justify-between gap-3">
                <span className="text-muted-foreground w-20 shrink-0 tabular-nums">{tag(b.datum)}</span>
                <span className="min-w-0 flex-1 truncate">{b.titel}</span>
                <span className={`tabular-nums ${b.cent < 0 ? "text-muted-foreground" : "text-gold-text"}`}>
                  {b.cent > 0 ? "+" : ""}
                  {eur(b.cent)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="type-small text-muted-foreground border-line border-t pt-4">
            Noch nichts geplant. Trag erwartete Einnahmen und feste Kosten als „geplant“ oder „monatlich“ ein – dann zeigt das Band, wohin dein Konto läuft.
          </p>
        )}
      </div>
    </section>
  )
}
