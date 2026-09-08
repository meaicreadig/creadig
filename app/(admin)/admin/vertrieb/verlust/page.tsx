import Link from "next/link"

import { Pill, SectionHeader, Surface } from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { getVertriebStore } from "@/lib/lead-store"
import { MUSTER_AB, marktRueckmeldung, unterDruck } from "@/lib/verlust"

/**
 * Vertrieb · Verlust-Schleife (G16).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM ES DIESE SEITE GIBT
 *
 * Der Verlustgrund wurde bisher genau dort gelesen, wo er entstand: auf der
 * Detailseite des einen Vorgangs. Damit beantwortete er die Frage „warum
 * haben wir DIESEN verloren" — und keine einzige darueber hinaus.
 *
 * Die Frage, auf die es ankommt, ist die andere: „Wie oft haben wir das
 * schon gehoert, und was heisst das fuer die Annahme, dass Handwerk unser
 * Kernmarkt ist?" Sie hatte bis hierher keinen Ort. Der Gate-Vertrag von G16
 * nennt sie die Verlust-Schleife: warum verloren → Marktwissen zurueck nach
 * G09.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS DIESE SEITE NICHT TUT
 *
 * Sie aendert das Hypothesen-Register nicht. Kein Zaehler kippt eine
 * Annahme; das tut ein Mensch, und er tut es im Register selbst, mit einem
 * Satz. Diese Seite legt ihm nur vor, was er sonst nie gesehen haette — und
 * sie sagt bei jeder Haeufung dazu, ob es schon ein Muster ist oder erst
 * eine Beobachtung.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Verlust-Schleife" }

export default async function VerlustPage() {
  const store = getVertriebStore()
  if (!store) return <VertriebShell title="Verlust-Schleife" available={false}>{null}</VertriebShell>

  /*
   * Alle verlorenen Vorgaenge, nicht die letzten zwanzig. Eine Schleife, die
   * nur die juengste Seite liest, meldet die Haeufung des letzten Monats als
   * Marktwissen — und das ist genau der Fehler, gegen den sie gebaut ist.
   */
  const { rows, total } = await store.listOpportunities({ status: "lost", limit: 500 })
  const schleife = marktRueckmeldung(rows.map((r) => r.lostReason))
  const druck = unterDruck(schleife)
  const gezaehlt = schleife.rueckmeldungen.reduce((n, r) => n + r.anzahl, 0)

  return (
    <VertriebShell
      title="Verlust-Schleife"
      lead="Warum Vorgänge verloren gehen — und was das Zielbild daraus lernt."
      available
      meta={
        <>
          {total} verloren · {gezaehlt} mit Grund aus dem Verzeichnis
          {schleife.ohneVerzeichnis > 0 ? ` · ${schleife.ohneVerzeichnis} Altbestand` : ""}
          {schleife.ohneGrund > 0 ? ` · ${schleife.ohneGrund} ohne Grund` : ""}
        </>
      }
    >
      {gezaehlt === 0 ? (
        <Surface padding="sm">
          <p className="type-small text-foreground/90 text-pretty">
            Kein verlorener Vorgang trägt einen Grund aus dem Verzeichnis.
          </p>
          <p className="type-small text-muted-foreground mt-2 text-pretty">
            {total === 0
              ? "Es ist noch nichts verloren gegangen. Das ist kein Erfolg und kein Mangel — es ist der Bestand."
              : "Die vorhandenen Gründe stammen aus der Zeit des Freitextfelds. Sie bleiben stehen und " +
                "werden nicht umgedeutet: Einen Grund nachträglich zu erfinden ist schlimmer, als keinen zu haben."}
          </p>
        </Surface>
      ) : (
        <>
          <section aria-labelledby="gruende-titel">
            <SectionHeader id="gruende-titel" title="Was gesagt wurde" />
            <ul className="mt-4 flex flex-col gap-3">
              {schleife.rueckmeldungen.map((r) => (
                <li key={r.lehre.grund}>
                  <Surface padding="sm">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-subhead">{r.lehre.grund}</span>
                      <span className="type-stat">{r.anzahl}×</span>
                      <Pill severity={r.muster ? "attention" : "neutral"}>
                        {r.muster ? "Muster" : `Beobachtung — Muster ab ${MUSTER_AB}`}
                      </Pill>
                    </div>
                    <p className="type-small text-foreground/90 mt-2 text-pretty">{r.lehre.bedeutet}</p>
                    <p className="type-small text-muted-foreground mt-2 text-pretty">{r.lehre.lehrt}</p>
                  </Surface>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="druck-titel" className="mt-10">
            <SectionHeader id="druck-titel" title="Was das Zielbild angeht" />
            <p className="type-small text-muted-foreground mt-2 text-pretty">
              Nur Muster. Eine einzelne Absage dreht kein Zielbild.
            </p>
            {druck.length === 0 ? (
              <Surface padding="sm" className="mt-4">
                <p className="type-small text-foreground/90 text-pretty">
                  Keine offene Annahme aus G09 steht durch diese Verluste unter Druck.
                </p>
                <p className="type-small text-muted-foreground mt-2 text-pretty">
                  Entweder ist noch keine Häufung ein Muster, oder die gehäuften Gründe sagen über
                  das Zielbild nichts &mdash; &bdquo;Zeitpunkt passt nicht&ldquo; ist kein Nein, und &bdquo;Keine Rückmeldung&ldquo;
                  sagt mehr über unser Nachfassen als über den Markt.
                </p>
              </Surface>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {druck.map((d) => (
                  <li key={d.hypothese.key}>
                    <Surface padding="sm">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className="text-subhead">{d.hypothese.satz}</span>
                        <Pill>{d.hypothese.status}</Pill>
                      </div>
                      <p className="type-small text-muted-foreground mt-2 text-pretty">
                        Berührt von: {d.wegen.map((w) => `${w.grund} (${w.anzahl}×)`).join(" · ")}
                      </p>
                      <p className="type-small text-foreground/90 mt-2 text-pretty">
                        <span className="text-subhead">Was sie entscheidet: </span>
                        {d.hypothese.pruefen}
                      </p>
                      <p className="type-small text-muted-foreground mt-2 text-pretty">
                        Das Register ändert ein Mensch, nicht dieser Zähler — in{" "}
                        <code>lib/market.ts</code>, mit einem Satz im Gegenbeleg.
                      </p>
                    </Surface>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <p className="type-small text-muted-foreground mt-10 text-pretty">
        Der Grund kommt seit G16 aus dem Verzeichnis, der Satz daneben gehört in die Notiz des
        Vorgangs. <Link href="/admin/vertrieb/pipeline" className="underline">Zur Pipeline</Link>.
      </p>
    </VertriebShell>
  )
}
