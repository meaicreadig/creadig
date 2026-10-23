import Link from "next/link"

import { SectionHeader } from "@/components/admin/primitives"
import { eur, eurRund, tag } from "@/components/finanz/format"
import type { Bewegung, Szenario, Woche } from "@/lib/finanz/rechnen"

const SZ_LABEL: Record<Szenario, string> = { vorsichtig: "Vorsichtig", erwartet: "Erwartet", optimistisch: "Mit Pipeline" }
const SZ_HINWEIS: Record<Szenario, string> = {
  vorsichtig: "Nur Gebuchtes und Geplantes, dazu die Steuerzahlungen. Überfälliges und Chancen zählen nicht.",
  erwartet: "Dazu überfällige Forderungen, die mit gut drei Wochen Verzug eingehen.",
  optimistisch: "Dazu gewichtete Verkaufschancen (Angebot 30 %, Verhandlung 50 %) — eine Schätzung, kein Geld.",
}

export function LiquiditaetsBand({
  wochen,
  topfCent,
  bewegungen,
  szenarien,
  aktiv = "vorsichtig",
  basis = "",
}: {
  wochen: Woche[]
  topfCent: number
  bewegungen: Bewegung[]
  szenarien?: Record<Szenario, { wochen: Woche[] }>
  aktiv?: Szenario
  basis?: string
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
        {szenarien && (
          <div className="flex flex-col gap-2">
            <div role="tablist" aria-label="Szenario" className="flex flex-wrap gap-2">
              {(Object.keys(SZ_LABEL) as Szenario[]).map((k) => {
                const tief = szenarien[k].wochen.reduce((a, w) => Math.min(a, w.standCent), Infinity)
                return (
                  <Link
                    key={k}
                    href={`${basis}/geldfluss?szenario=${k}`}
                    scroll={false}
                    role="tab"
                    aria-selected={k === aktiv}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${k === aktiv ? "bg-primary text-primary-foreground" : "bg-background text-foreground/75"}`}
                  >
                    {SZ_LABEL[k]} <span className="tabular-nums opacity-75">· Tiefpunkt {eurRund(tief)}</span>
                  </Link>
                )
              })}
            </div>
            <p className="type-small text-muted-foreground">{SZ_HINWEIS[aktiv]}</p>
          </div>
        )}
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
                className={`flex-1 rounded-t-sm motion-safe:transition-[height,background-color] motion-safe:duration-300 motion-safe:ease-out ${negativ ? "bg-destructive" : unterTopf ? "bg-gold/50" : "bg-gold"}`}
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
            {bewegungen.slice(0, 10).map((b, i) => (
              <li key={`${b.datum}-${i}`} className="flex items-baseline justify-between gap-3">
                <span className="text-muted-foreground w-20 shrink-0 tabular-nums">{tag(b.datum)}</span>
                <span className="min-w-0 flex-1 truncate">
                  {b.titel}
                  {b.geschaetzt && <span className="text-muted-foreground"> · geschätzt</span>}
                </span>
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
