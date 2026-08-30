import { AdminShell } from "@/components/admin/admin-shell"
import { ITEM_GROUPS, collect } from "@/lib/material-status"

/**
 * MP-G · G.1 — die erste und heute einzige Seite des Control Centers.
 *
 * ---------------------------------------------------------------------------
 * WARUM DER MATERIALSTAND UND NICHT „TODAY"
 * MP-G §74 sieht nach der Hülle eine Today-Seite vor: neue Leads, Leads ohne
 * nächste Aktion, offene Angebote. Die Bestandsaufnahme (G.0) hat gezeigt,
 * dass es für jede dieser Karten keine Datenquelle gibt — `/api/lead`
 * verschickt eine Mail und speichert nichts. Eine Today-Seite wäre heute
 * dreimal „Noch keine Daten." und damit genau die leere Theaterkulisse, die
 * §5 und §42 verbieten.
 *
 * Der Materialstand ist die einzige Ansicht, die schon jetzt aus echten Daten
 * beantwortet, was MP-G §8 verlangt: **Was braucht heute Aufmerksamkeit?**
 * Nur eben nicht im Vertrieb, sondern im Material — Freigaben, Bilder,
 * Zahlen, Verträge. Das ist der Engpass, den dieses Haus wirklich hat.
 *
 * ---------------------------------------------------------------------------
 * DIE DATEN
 * `collect()` aus `lib/material-status.ts` — dieselbe Funktion, die auch
 * `/status` liest. Eine Quelle, zwei Ansichten. Sie erhebt nichts und
 * speichert nichts; sie liest die Module, aus denen die Website gebaut wird.
 *
 * Zugang: `middleware.ts`. Ohne Sitzung kommt hier niemand an.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Materialstand" }

export default function ControlCenterHome() {
  const { open, done } = collect()
  const stand = new Date().toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <AdminShell
      title="Materialstand"
      lead="Abgeleitet aus denselben Daten, aus denen die Website gebaut wird. Diese Ansicht ändert nichts und erfindet nichts — sie sagt, was leer ist."
      meta={
        <>
          <span className="block">Stand {stand}</span>
          <span className="text-gold-text mt-1 block">
            {open.length} offen · {done.length} erledigt
          </span>
        </>
      }
    >
      {/* ── Was Aufmerksamkeit braucht ── */}
      <section aria-labelledby="offen-titel">
        <h2 id="offen-titel" className="eyebrow text-gold-text">
          Braucht Aufmerksamkeit
        </h2>

        {open.length === 0 ? (
          /*
            Kein „Keine Daten." — der Zustand ist eine Aussage, und sie ist
            eine gute. MP-G §42: Empty States sind Teil des Produkts.
          */
          <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
            Nichts offen. Jedes Material, das die Website zeigen könnte, ist da.
          </p>
        ) : (
          /*
            Gruppiert statt am Stück. Siebenundvierzig gleichrangige Zeilen
            sagen nur „es ist viel"; zehn benannte Blöcke mit Zahl sagen, WO
            es viel ist — und das ist die Frage, für die diese Ansicht da ist.

            Die Reihenfolge ist die der Erhebung und damit die des Hauses:
            Belege zuerst, Entscheidungen zuletzt. Leere Gruppen erscheinen
            nicht: Eine Überschrift über nichts ist eine Zeile, die man jedes
            Mal überliest.
          */
          <div className="mt-5 flex flex-col gap-10">
            {ITEM_GROUPS.map((group) => {
              const inGroup = open.filter((item) => item.group === group.key)
              if (inGroup.length === 0) return null

              return (
                <section key={group.key} aria-labelledby={`gruppe-${group.key}`}>
                  <div className="border-line flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b pb-2">
                    <h3 id={`gruppe-${group.key}`} className="text-subhead text-base">
                      {group.label}
                    </h3>
                    <span className="text-meta text-muted-foreground shrink-0">
                      {inGroup.length} offen
                    </span>
                  </div>

                  <ul className="mt-3 flex flex-col gap-2.5">
                    {inGroup.map((item) => (
                      <li key={item.label} className="tile bg-background p-5">
                        <h4 className="text-subhead text-sm">{item.label}</h4>
                        <p className="type-small text-muted-foreground mt-2 text-pretty">
                          {item.detail}
                        </p>
                        {/* Wer liefern muss — der Grund, warum diese Liste nützt. */}
                        <p className="type-small text-gold-text mt-3 text-pretty">{item.owner}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Was steht ── */}
      <section aria-labelledby="erledigt-titel" className="border-line mt-12 border-t pt-8">
        <h2 id="erledigt-titel" className="eyebrow text-muted-foreground">
          Steht
        </h2>

        {done.length === 0 ? (
          <p className="type-body text-muted-foreground mt-5 text-pretty">
            Noch nichts abgehakt.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col">
            {done.map((item) => (
              <li key={item.label} className="border-line flex flex-wrap gap-x-6 gap-y-1 border-b py-3.5">
                <span className="text-subhead min-w-0 flex-1 text-sm">{item.label}</span>
                <span className="type-small text-muted-foreground min-w-0 flex-[2] text-pretty">
                  {item.detail}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  )
}
