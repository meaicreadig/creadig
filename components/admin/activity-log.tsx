import { SectionHeader } from "@/components/admin/primitives"
import type { Activity } from "@/lib/vertrieb"

/**
 * Die Chronik eines Vorgangs.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER STEHT, IST PASSIERT
 * Jeder Eintrag wurde im selben Aufruf geschrieben wie die Änderung, die er
 * beschreibt (`vertrieb-store-neon.ts`). Es gibt keinen abgeleiteten,
 * geschätzten oder nachträglich konstruierten Eintrag.
 *
 * Was deshalb FEHLT: alles vor Vertrieb 1.0. Statuswechsel, die vor dieser
 * Version passiert sind, hat niemand protokolliert — und eine Chronik, die
 * sie erfindet, wäre eine Erzählung mit Zeitstempeln. Die Migration schreibt
 * genau zwei belegte Punkte: wann die Anfrage kam, und dass der Vorgang aus
 * ihr übernommen wurde.
 */
export function ActivityLog({ entries }: { entries: Activity[] }) {
  return (
    <section aria-labelledby="chronik-titel">
      <SectionHeader id="chronik-titel" title="Chronik" as="h3" />
      {entries.length === 0 ? (
        <p className="type-small text-muted-foreground mt-4 text-pretty">
          Noch kein Eintrag. Die Chronik beginnt mit der ersten Änderung —
          rückwirkend wird nichts ergänzt.
        </p>
      ) : (
        <ol className="mt-4 flex flex-col">
          {entries.map((entry) => (
            <li key={entry.id} className="border-line flex flex-wrap gap-x-4 gap-y-1 border-b py-3 last:border-b-0">
              <time
                dateTime={entry.createdAt}
                className="text-meta text-muted-foreground w-28 shrink-0 tabular-nums"
              >
                {formatDateTime(entry.createdAt)}
              </time>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{entry.summary}</p>
                {entry.detail && (
                  <p className="type-small text-muted-foreground mt-0.5 text-pretty">{entry.detail}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
  })
}
