import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { Pill, SectionHeader, Surface, UnavailableNote } from "@/components/admin/primitives"
import {
  ATTENTION_LABELS,
  type AttentionRank,
  collectAttention,
} from "@/lib/attention"
import { getVertriebStore, leadStoreConfigured } from "@/lib/lead-store"
import { ITEM_GROUPS, collect } from "@/lib/material-status"

/**
 * Heute — die Startseite des Control Centers.
 *
 * ---------------------------------------------------------------------------
 * DIE EINE FRAGE
 * „Was braucht heute Aufmerksamkeit?"
 *
 * Diese Seite hat sie lange nicht beantwortet, und der Grund war keine
 * fehlende Fähigkeit: Sie war eine SYNCHRONE Komponente und konnte deshalb
 * nichts abfragen, was eine Datenbank braucht. Übrig blieb, was ohne Warten
 * zu haben war — Materialzahlen und der Satz, ein Lead-Speicher sei
 * eingerichtet. Das ist eine Aussage über den Bauzustand der Software; wer
 * ein Unternehmen führt, braucht eine Aussage über das Unternehmen.
 *
 * Sie ist jetzt async und liest `collectAttention()`. Dort steht, warum die
 * Rangfolge so ist, wie sie ist, und warum nichts doppelt vorkommen kann.
 *
 * ---------------------------------------------------------------------------
 * KEINE NEUE DOMÄNE
 * Es entsteht keine Tabelle und kein zweites Modell. Zusammengetragen wird
 * ausschliesslich, was Vertrieb und Materialstand ohnehin schon führen. Jede
 * Zeile führt auf ihren Datensatz — eine Übersicht, aus der man nicht
 * herauskommt, ist ein Poster.
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS MATERIAL IN DIE NEBENSPALTE RÜCKT
 * Es bleibt unverändert erhoben und unverändert gezeigt, aber es ist ein
 * Vorrat, keine Fälligkeit. Ein Vorrat gehört neben die Arbeit, nicht davor.
 * Die beiden Materialpunkte, die WIRKLICH heute drücken — gestörter Betrieb
 * und offene Eigentümer-Entscheidungen — stehen deshalb oben in der Liste,
 * nicht hier unten in einer Zahl.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Heute" }

/**
 * Dringlichkeit als Farbe — an dem, was Nichtstun kostet.
 *
 * Rot nur, wo etwas bereits verloren geht: Der Weg ist gestört, oder eine
 * Zusage ist gebrochen. Gold, wo der Tag noch reicht. Grau, wo niemand von
 * aussen wartet. Wäre alles rot, wäre nichts rot.
 */
const RANK_SEVERITY: Record<AttentionRank, "neutral" | "attention" | "critical"> = {
  betriebsblocker: "critical",
  ueberfaellig: "critical",
  "heute-faellig": "attention",
  "neue-anfrage": "attention",
  "schritt-ohne-termin": "neutral",
  "ohne-schritt": "neutral",
  "beziehung-faellig": "neutral",
  entscheidung: "neutral",
}

function faellig(due: string | null) {
  if (!due) return null
  const [y, m, d] = due.split("-")
  return `${d}.${m}.${y}`
}

export default async function Today() {
  const hasStore = leadStoreConfigured()
  const board = await collectAttention(getVertriebStore())

  const { open, done } = collect()

  /* Gruppen mit offenen Punkten, größte zuerst — gemessen, nicht gesetzt. */
  const byGroup = ITEM_GROUPS.map((group) => ({
    ...group,
    count: open.filter((item) => item.group === group.key).length,
  }))
    .filter((group) => group.count > 0)
    .sort((a, b) => b.count - a.count)

  const stand = new Date().toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <AdminShell
      title="Heute"
      lead="Was Aufmerksamkeit braucht — aus den Quellen, die es wirklich gibt."
      meta={<span className="block">Stand {stand}</span>}
      salesAvailable={hasStore}
    >
      <div className="grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
        {/* ── Arbeitsfläche: die Aufmerksamkeitsliste ── */}
        <section aria-labelledby="heute-titel" className="min-w-0">
          <SectionHeader
            id="heute-titel"
            title="Aufmerksamkeit"
            count={
              board.items.length === 0
                ? "nichts offen"
                : `${board.items.length} ${board.items.length === 1 ? "Punkt" : "Punkte"}`
            }
          />

          {board.items.length === 0 ? (
            <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
              {board.salesMeasured
                ? "Nichts fällig. Kein Vorgang schuldet heute einen Schritt, keine Anfrage wartet, kein Betriebspunkt ist offen."
                : "Aus dem Materialstand ist nichts offen. Der Vertrieb konnte nicht gemessen werden — was dort liegt, steht hier nicht."}
            </p>
          ) : (
            <ul className="mt-5 flex flex-col gap-2.5">
              {board.items.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="group block">
                    <Surface
                      padding="sm"
                      className="flex items-baseline justify-between gap-6"
                    >
                      <span className="min-w-0">
                        <span className="text-subhead block text-sm group-hover:underline group-hover:underline-offset-4">
                          {item.title}
                        </span>
                        {item.detail ? (
                          <span className="type-small text-muted-foreground mt-1 block text-pretty">
                            {item.detail}
                          </span>
                        ) : null}
                      </span>
                      <span className="flex shrink-0 items-baseline gap-2">
                        {item.due ? (
                          <span className="text-meta text-muted-foreground tabular-nums">
                            {faellig(item.due)}
                          </span>
                        ) : null}
                        <Pill severity={RANK_SEVERITY[item.rank]}>
                          {ATTENTION_LABELS[item.rank]}
                        </Pill>
                      </span>
                    </Surface>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {hasStore && !board.salesMeasured ? (
            <div className="mt-5">
              <UnavailableNote title="Vertrieb nicht gemessen">
                Ein Lead-Speicher ist eingerichtet, war aber gerade nicht
                erreichbar. Offene Vorgänge, neue Anfragen und fällige
                Kontaktpflege fehlen deshalb in dieser Liste. Das ist keine
                Null, sondern eine fehlende Messung.
              </UnavailableNote>
            </div>
          ) : null}
        </section>

        {/* ── Nebenspalte ── */}
        <aside className="min-w-0 flex flex-col gap-10">
          <section aria-labelledby="material-titel">
            <SectionHeader
              id="material-titel"
              title="Material"
              count={`${open.length} offen · ${done.length} steht`}
            />

            {open.length === 0 ? (
              <p className="type-small text-muted-foreground mt-5 max-w-2xl text-pretty">
                Nichts offen. Jedes Material, das die Website zeigen könnte, ist
                da.
              </p>
            ) : (
              <>
                <p className="type-small text-muted-foreground mt-4 text-pretty">
                  Nach Bereichen geordnet, der größte zuerst. Gearbeitet wird im
                  Materialstand.
                </p>

                <ul className="mt-5 flex flex-col gap-2.5">
                  {byGroup.map((group) => (
                    <li key={group.key}>
                      <Surface
                        padding="sm"
                        className="flex items-baseline justify-between gap-6"
                      >
                        <span className="text-subhead min-w-0 text-sm">
                          {group.label}
                        </span>
                        <span className="text-meta text-gold-text shrink-0 tabular-nums">
                          {group.count} offen
                        </span>
                      </Surface>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/admin/material"
                  className="text-gold-text mt-5 inline-block text-sm underline underline-offset-4"
                >
                  Zum Materialstand
                </Link>
              </>
            )}
          </section>

          {hasStore ? null : (
            <section aria-labelledby="vertrieb-titel">
              <SectionHeader id="vertrieb-titel" title="Vertrieb" />
              <div className="mt-5">
                <UnavailableNote title="Keine Lead-Quelle">
                  Es ist kein Lead-Speicher eingerichtet (<code>LEAD_STORE</code>{" "}
                  ist nicht gesetzt). Anfragen laufen heute ausschließlich als
                  E-Mail ins Postfach — sie sind also nicht verloren, aber hier
                  nicht zählbar. Das ist keine Null, sondern eine fehlende
                  Messung.
                </UnavailableNote>
              </div>
            </section>
          )}
        </aside>
      </div>
    </AdminShell>
  )
}
