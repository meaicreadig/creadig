import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { SectionHeader, Surface, UnavailableNote } from "@/components/admin/primitives"
import { leadStoreConfigured } from "@/lib/lead-store"
import { ITEM_GROUPS, collect } from "@/lib/material-status"

/**
 * Heute — die Startseite des Control Centers.
 *
 * ---------------------------------------------------------------------------
 * DIE EINE FRAGE
 * „Was braucht heute Aufmerksamkeit?" Der v0-Prototyp beantwortet sie mit
 * einer Aufmerksamkeitsliste aus Leads, Terminen und Systemmeldungen. Zwei
 * dieser drei Quellen gibt es hier nicht — es gibt keinen Terminspeicher und
 * keine Telemetrie. Sie werden deshalb nicht nachgebaut, sondern weggelassen.
 *
 * Was es gibt, ist echt: der Materialstand. Er misst, welches Material die
 * Website zeigen könnte, aber nicht hat — Freigaben, Bilder, Zahlen,
 * Verträge. Das ist der reale Engpass dieses Hauses, und damit die einzige
 * Aufmerksamkeitsquelle, die heute nicht erfunden wäre.
 *
 * ---------------------------------------------------------------------------
 * WARUM HIER NUR EINE ZUSAMMENFASSUNG STEHT
 * Diese Seite wiederholt den Materialstand nicht, sie ordnet ihn: Wie viel
 * ist offen, und WO. Die Arbeit selbst passiert eine Ebene tiefer. Sonst
 * gäbe es zwei Seiten mit derselben Liste und keine mit einer Antwort.
 *
 * ---------------------------------------------------------------------------
 * DER VERTRIEBSBLOCK IST ABSICHTLICH LEER
 * `leadStoreConfigured()` fragt die Wahrheit ab, nicht die Absicht. Ohne
 * Speicher steht hier, dass es keinen gibt — nicht „0 Leads". Null wäre eine
 * Messung; es liegt aber keine vor.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Heute" }

export default function Today() {
  const { open, done } = collect()
  const hasStore = leadStoreConfigured()

  /* Gruppen mit offenen Punkten, größte zuerst — das ist die Rangfolge der
     Aufmerksamkeit, und sie ist gemessen, nicht gesetzt. */
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
        {/* ── Arbeitsfläche ── */}
        <section aria-labelledby="material-titel" className="min-w-0">
          <SectionHeader
            id="material-titel"
            title="Material"
            count={`${open.length} offen · ${done.length} steht`}
          />

          {open.length === 0 ? (
            <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
              Nichts offen. Jedes Material, das die Website zeigen könnte, ist da.
            </p>
          ) : (
            <>
              <p className="type-small text-muted-foreground mt-4 max-w-2xl text-pretty">
                Nach Bereichen geordnet, der größte zuerst. Die Punkte selbst
                stehen im Materialstand.
              </p>

              <ul className="mt-5 flex flex-col gap-2.5">
                {byGroup.map((group) => (
                  <li key={group.key}>
                    <Surface padding="sm" className="flex items-baseline justify-between gap-6">
                      <span className="text-subhead min-w-0 text-sm">{group.label}</span>
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

        {/* ── Nebenspalte ── */}
        <aside aria-labelledby="vertrieb-titel" className="min-w-0">
          <SectionHeader id="vertrieb-titel" title="Vertrieb" />

          <div className="mt-5">
            {hasStore ? (
              <p className="type-small text-muted-foreground text-pretty">
                Ein Lead-Speicher ist eingerichtet. Die Anfragen stehen unter{" "}
                <Link href="/admin/vertrieb" className="text-gold-text underline underline-offset-4">
                  Vertrieb
                </Link>
                .
              </p>
            ) : (
              <UnavailableNote title="Keine Lead-Quelle">
                Es ist kein Lead-Speicher eingerichtet (<code>LEAD_STORE</code> ist
                nicht gesetzt). Anfragen laufen heute ausschließlich als E-Mail
                ins Postfach — sie sind also nicht verloren, aber hier nicht
                zählbar. Das ist keine Null, sondern eine fehlende Messung.
              </UnavailableNote>
            )}
          </div>
        </aside>
      </div>
    </AdminShell>
  )
}
