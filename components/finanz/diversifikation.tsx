import { eurRund } from "@/components/finanz/format"
import type { Diversifikation } from "@/lib/finanz/diversifikation"

/** Dashboard-Kachel (Phase 3) — Konzentrationsrisiko über die letzten 12 Monate, rein monetär. */
export function Diversifikationskachel({ bild }: { bild: Diversifikation }) {
  return (
    <section aria-labelledby="diversifikation-titel" className="bg-card flex flex-col gap-4 rounded-[2rem] p-7">
      <h2 id="diversifikation-titel" className="text-lg font-semibold">Verteilung der Einnahmen</h2>

      {bild.aktiveSaeulen < 2 ? (
        <p className="text-muted-foreground text-sm leading-relaxed">
          Noch zu wenig Verteilung für eine Aussage — die letzten 12 Monate zeigen Einnahmen aus höchstens einer Säule.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {bild.anteile.map((a) => (
              <li key={a.key} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{a.label}</span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {Math.round(a.anteil * 100)} % · {eurRund(a.einCent)}
                  </span>
                </div>
                <div className="bg-background h-2 overflow-hidden rounded-full" role="img" aria-label={`${Math.round(a.anteil * 100)}% der Einnahmen`}>
                  <div className="bg-primary h-full rounded-full" style={{ width: `${Math.round(a.anteil * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {bild.konzentriert && bild.hoechsteSaeule && (
            <p className="text-amber-600 text-sm leading-relaxed">
              {Math.round(bild.hoechsteSaeule.anteil * 100)} % deines Einkommens kommt aus einer Quelle ({bild.hoechsteSaeule.label}) — eine zweite trägt noch wenig.
            </p>
          )}
        </>
      )}
    </section>
  )
}
