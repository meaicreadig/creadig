import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { Pill, SectionHeader, Surface } from "@/components/admin/primitives"
import { kontext, nichtErhoben, offen } from "@/lib/gedaechtnis"
import { reihenfolge } from "@/lib/navigator"

/**
 * G34 · OWNER-COCKPIT — die Synthese.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM ES SPAET KOMMT
 *
 * Die Roadmap sagt es selbst: „Kommt spaet, WEIL es die Quellen braucht.
 * Jedes Gate davor liefert seinen Heute-Beitrag sofort mit."
 *
 * Genau so ist es gebaut. Diese Seite rechnet NICHTS. Sie zeigt zwei
 * Dinge, und beide kommen fertig aus anderen Modulen:
 *
 *   wie es steht      `lib/gedaechtnis.ts`  (G28) — mit Fundstellen
 *   was zu tun waere  `lib/navigator.ts`    (G29) — mit Belegen
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DAS DIE EIGENTLICHE REGEL IST
 *
 * Ein Cockpit, das selbst rechnet, wird die zwanzigste Quelle der Wahrheit —
 * und die mit der groessten Schriftart. Wer eine Zahl auf einer
 * Uebersichtsseite sieht, prueft sie nicht nach; er handelt danach.
 *
 * Deshalb kommt hier keine Zahl vor, die nicht aus einer Auskunft mit Beleg
 * stammt, und `check-cockpit.mjs` bricht ab, sobald diese Seite anfaengt,
 * selbst zu rechnen.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DREI ZUSTAENDE, NICHT ZWEI
 *
 * Steht · Offen · NICHT ERHOBEN. Der dritte ist der, den Uebersichtsseiten
 * gewoehnlich verschlucken — und genau er ist der ehrlichste. Aus „nicht
 * erhoben" ein rotes Feld zu machen hiesse, eine offene Owner-Frage als
 * Systemfehler auszugeben.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Cockpit" }

export default function CockpitPage() {
  const lagen = kontext()
  const stehen = lagen.filter((a) => a.steht === true)
  const nichtOk = offen()
  const unbekannt = nichtErhoben()
  const schritte = reihenfolge()

  return (
    <AdminShell
      title="Cockpit"
      lead="Wie es steht, und was daraus folgt. Beides kommt aus den Registern — diese Seite rechnet nichts."
      meta={
        <>
          {stehen.length} steht · {nichtOk.length} offen · {unbekannt.length} nicht erhoben
        </>
      }
    >
      <section aria-labelledby="lage-titel">
        <SectionHeader id="lage-titel" title="Wie es steht" />
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
      </section>

      <section aria-labelledby="schritte-titel" className="mt-10">
        <SectionHeader id="schritte-titel" title="Was daraus folgt" />
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
                    <span className="type-small text-muted-foreground">{v.wer}</span>
                  </div>
                  <p className="type-small text-foreground mt-2 text-pretty">{v.handlung}</p>
                  <p className="type-small text-muted-foreground mt-2 text-pretty">{v.weil}</p>
                </Surface>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="type-small text-muted-foreground mt-10 text-pretty">
        Der Materialstand mit allen Einzelpunkten steht weiterhin unter{" "}
        <Link href="/admin/material" className="underline">Materialstand</Link>. Diese Seite fasst
        zusammen; sie ersetzt ihn nicht.
      </p>
    </AdminShell>
  )
}
