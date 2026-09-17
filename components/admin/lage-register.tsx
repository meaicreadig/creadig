import { Pill, SectionHeader, Surface } from "@/components/admin/primitives"
import { kontext, nichtErhoben, offen } from "@/lib/gedaechtnis"
import { WER_LABELS, reihenfolge } from "@/lib/navigator"

/**
 * Die Lage-Register — „Wie es steht“ und „Was daraus folgt“.
 *
 * ADM-01 (17.09.2026): vorher eine eigene Startfläche „Cockpit“ neben
 * „Heute“. Zwei Owner-Startseiten mit überlappender Frage sind eine zu viel;
 * die Übersicht beantwortet „was ist heute zu tun“, diese Register
 * beantworten „wie steht das Haus“ — und das gehört unter System.
 * Inhalt und Quellen (`gedaechtnis`, `navigator`) sind unverändert; die Seite
 * rechnet weiterhin nichts. Texte sind noch deutsch (offener Übersetzungsstand).
 */
export function LageRegister() {
  const lagen = kontext()
  const stehen = lagen.filter((a) => a.steht === true)
  const nichtOk = offen()
  const unbekannt = nichtErhoben()
  const schritte = reihenfolge()

  return (
    <section id="lage" aria-labelledby="lage-titel" className="scroll-mt-8">
      <SectionHeader
        id="lage-titel"
        title="Lage des Hauses"
        count={`${stehen.length} steht · ${nichtOk.length} offen · ${unbekannt.length} nicht erhoben`}
      />
      <div>
        <h3 className="text-subhead mt-6 text-base">Wie es steht</h3>
        <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">
          Jede Zeile trägt ihre Fundstelle. Eine Auskunft ohne Beleg gibt es nicht — sie wäre eine
          Behauptung mit Systemstimme, und der widerspricht niemand.
        </p>
        <ul className="mt-5 flex flex-col gap-3">
          {lagen.map((a) => (
            <li key={a.key}>
              <Surface padding="sm">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-subhead">{a.frage}</span>
                  <Pill severity={a.steht === false ? "attention" : "neutral"}>
                    {a.steht === true ? "steht" : a.steht === false ? "offen" : "nicht erhoben"}
                  </Pill>
                </div>
                <p className="type-small text-foreground/90 mt-2 text-pretty">{a.antwort}</p>
                <p className="type-small text-muted-foreground mt-2 text-pretty">
                  {a.belege.map((b) => `${b.woher} — ${b.was}`).join(" · ")}
                </p>
              </Surface>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <h3 className="text-subhead text-base">Was daraus folgt</h3>
        <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">
          Erst messen, dann beheben — nicht weil Messen wichtiger wäre, sondern weil eine Reparatur
          an ungemessener Stelle die Messung für immer unmöglich macht. Innerhalb der beiden Gruppen
          wird nicht sortiert: Eine Rangfolge wäre eine Entscheidung, und die gehört Ihnen.
        </p>
        {schritte.length === 0 ? (
          <Surface padding="sm" className="mt-5">
            <p className="type-small text-foreground/90">Nichts offen. Das kommt vor.</p>
          </Surface>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {schritte.map((v) => (
              <li key={v.key}>
                <Surface padding="sm">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <Pill severity={v.art === "messen" ? "neutral" : "attention"}>{v.art}</Pill>
                    <span className="type-small text-muted-foreground">{WER_LABELS[v.wer]}</span>
                  </div>
                  <p className="type-small text-foreground mt-2 text-pretty">{v.handlung}</p>
                  <p className="type-small text-muted-foreground mt-2 text-pretty">{v.weil}</p>
                </Surface>
              </li>
            ))}
          </ul>
        )}
      </div>

    </section>
  )
}
