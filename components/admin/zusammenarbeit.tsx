import { abteilungName, type Auftrag } from "@/lib/koordination/koordinator"

const STATUS: Record<Auftrag["status"], { text: string; ton: string }> = {
  neu: { text: "In Arbeit", ton: "bg-secondary text-secondary-foreground" },
  erledigt: { text: "Intern erledigt", ton: "bg-primary/10 text-primary" },
  weitergegeben: { text: "Übergeben", ton: "bg-accent text-accent-foreground" },
  bei_emin: { text: "Wartet auf dich", ton: "bg-primary text-primary-foreground" },
}

const seit = (iso: string) => {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 60) return `vor ${Math.max(1, min)} Min.`
  const h = Math.round(min / 60)
  return h < 24 ? `vor ${h} Std.` : `vor ${Math.round(h / 24)} T.`
}

export function Zusammenarbeit({
  auftraege,
  zahlen,
}: {
  auftraege: Auftrag[]
  zahlen: { heute: number; erledigt: number; uebergaben: number; beiEmin: number; offen: number }
}) {
  const kacheln = [
    { wert: zahlen.offen, text: "gerade in Arbeit" },
    { wert: zahlen.erledigt, text: "intern erledigt (7 T.)" },
    { wert: zahlen.uebergaben, text: "Übergaben zwischen Abteilungen" },
    { wert: zahlen.beiEmin, text: "dir vorgelegt" },
  ]
  return (
    <section id="zusammenarbeit" aria-labelledby="zusammenarbeit-titel" className="flex scroll-mt-6 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="zusammenarbeit-titel" className="font-sans text-xl font-semibold text-foreground">
          Interne Zusammenarbeit
        </h2>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          Der Chief of Staff verteilt jede neue Arbeit an die passende Abteilung. Abteilungen geben untereinander weiter.
          Nach außen geht nichts ohne dich.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kacheln.map((k) => (
          <div key={k.text} className="flex flex-col gap-1 rounded-3xl bg-card p-5">
            <span className="font-sans text-2xl font-semibold text-primary">{k.wert}</span>
            <span className="text-sm text-muted-foreground">{k.text}</span>
          </div>
        ))}
      </div>

      {auftraege.length === 0 ? (
        <p className="rounded-3xl bg-card p-6 text-sm leading-relaxed text-muted-foreground">
          Noch keine internen Aufträge. Beim nächsten Takt sammelt der Chief of Staff alle offenen Aufgaben ein und verteilt sie.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {auftraege.map((a) => {
            const s = STATUS[a.status]
            return (
              <li key={a.id} className="rounded-3xl bg-card p-5">
                <details className="group flex flex-col gap-2">
                  <summary className="flex cursor-pointer list-none flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{abteilungName(a.von)}</span>
                      <span aria-hidden="true">→</span>
                      <span className="font-medium text-foreground">{abteilungName(a.an)}</span>
                      <span className={`rounded-full px-2.5 py-0.5 font-medium ${s.ton}`}>{s.text}</span>
                      <span>· {seit(a.zeit)}</span>
                      {a.tiefe > 0 ? <span>· Schritt {a.tiefe + 1} der Kette</span> : null}
                    </div>
                    <span className="text-balance font-sans text-base font-medium text-foreground">{a.titel}</span>
                  </summary>
                  {a.ergebnis ? (
                    <p className="mt-2 whitespace-pre-line rounded-2xl bg-secondary px-4 py-3 text-sm leading-relaxed text-secondary-foreground">
                      {a.ergebnis}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Wird beim nächsten Takt bearbeitet.</p>
                  )}
                </details>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
