import { AdminShell } from "@/components/admin/admin-shell"
import { LeadsTable } from "@/components/admin/leads-table"
import {
  AdminField,
  AdminInput,
  AdminSelect,
  SectionHeader,
  UnavailableNote,
} from "@/components/admin/primitives"
import {
  SALES_LABELS_DE,
  SALES_STATES,
  type SalesStatus,
  leadStoreConfigured,
  listLeads,
} from "@/lib/lead-store"

/**
 * Vertrieb — die Anfragenliste.
 *
 * ---------------------------------------------------------------------------
 * DREI ZUSTÄNDE, DIE NICHT DASSELBE SIND
 * Das ist der ganze Punkt dieser Seite, und der Grund, warum sie mehr
 * Fallunterscheidung als Darstellung enthält:
 *
 *   nicht eingerichtet   Es gibt keinen Speicher. Anfragen laufen als Mail.
 *   nicht erreichbar     Es gibt einen Speicher, er antwortet nicht.
 *   leer                 Der Speicher antwortet, und es liegt nichts vor.
 *
 * Alle drei sähen als „0 Anfragen" gleich aus, und genau das wäre die
 * gefährlichste Zeile der Anwendung: Im zweiten Fall würde die Oberfläche
 * behaupten, es gebe keine Anfragen, während in Wahrheit welche da sind und
 * nur niemand sie sieht. `listLeads()` wirft deshalb absichtlich, statt eine
 * leere Liste zurückzugeben.
 *
 * ---------------------------------------------------------------------------
 * SUCHE UND FILTER OHNE JAVASCRIPT
 * Ein `<form method="get">`. Die Suche steht damit in der Adresse — sie ist
 * teilbar, sie überlebt einen Neuladen, sie funktioniert mit der Tastatur und
 * sie braucht keinen Client-Zustand. Für eine dichte Tabelle ist das nicht
 * die einfache Lösung, sondern die richtige.
 *
 * Gefiltert wird ausschliesslich über Felder, die es wirklich gibt: Freitext
 * und Status. Kein Zuständigen-Filter, kein Wert-Filter — es gibt weder das
 * eine noch das andere Feld.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Vertrieb" }

const PAGE_SIZE = 50

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const params = await searchParams
  const search = typeof params.q === "string" ? params.q.trim() : ""
  const status = SALES_STATES.includes(params.status as SalesStatus)
    ? (params.status as SalesStatus)
    : undefined

  const configured = leadStoreConfigured()

  let page: Awaited<ReturnType<typeof listLeads>> | null = null
  let unreachable = false

  if (configured) {
    try {
      page = await listLeads({
        search: search || undefined,
        status,
        limit: PAGE_SIZE,
      })
    } catch {
      /*
        Der Fehler selbst gehört nicht auf den Bildschirm — er kann eine
        Verbindungszeichenfolge enthalten. Was zählt, ist die Unterscheidung.
      */
      unreachable = true
    }
  }

  return (
    <AdminShell
      title="Vertrieb"
      lead="Anfragen aus den Formularen der Website. Was hier steht, ist eingegangen — nicht geschätzt."
      meta={page ? <span className="block">{page.total} gesamt</span> : undefined}
      salesAvailable={configured}
    >
      {!configured ? (
        <UnavailableNote title="Kein Lead-Speicher eingerichtet">
          <code>LEAD_STORE</code> ist nicht gesetzt. Anfragen erreichen heute
          ausschliesslich das Postfach <code>info@creadig.de</code> — sie gehen
          also nicht verloren, sind hier aber nicht auflistbar. Was dafür fehlt,
          steht in <code>docs/ops/lead-store.md</code>: Anbieterwahl, AVV,
          Datenschutzsatz, Löschfrist.
        </UnavailableNote>
      ) : unreachable ? (
        <UnavailableNote title="Speicher nicht erreichbar">
          Der Lead-Speicher ist eingerichtet, antwortet aber nicht. Das ist
          <strong> nicht</strong> dasselbe wie &bdquo;keine Anfragen&ldquo;: es
          können welche vorliegen, die gerade niemand sehen kann. Bitte erneut laden;
          bleibt es dabei, ist der Anbieter zu prüfen.
        </UnavailableNote>
      ) : (
        <>
          <form method="get" className="flex flex-wrap items-end gap-4">
            <AdminField label="Suche" htmlFor="q" className="flex-1 basis-64">
              <AdminInput
                id="q"
                name="q"
                type="search"
                defaultValue={search}
                placeholder="Nummer, Name, Betrieb, E-Mail"
              />
            </AdminField>

            <AdminField label="Status" htmlFor="status">
              <AdminSelect id="status" name="status" defaultValue={status ?? ""}>
                <option value="">alle</option>
                {SALES_STATES.map((state) => (
                  <option key={state} value={state}>
                    {SALES_LABELS_DE[state]}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>

            <button type="submit" className="cta-quiet px-4 py-2 text-sm">
              Anwenden
            </button>
          </form>

          <div className="mt-10">
            <SectionHeader
              title="Anfragen"
              count={
                page && page.total > PAGE_SIZE
                  ? `${page.rows.length} von ${page.total}`
                  : `${page?.total ?? 0}`
              }
            />

            {page && page.rows.length > 0 ? (
              <LeadsTable rows={page.rows} />
            ) : (
              <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
                {search || status
                  ? "Keine Anfrage passt zu dieser Suche."
                  : "Der Speicher antwortet, und es liegt noch keine Anfrage vor."}
              </p>
            )}
          </div>
        </>
      )}
    </AdminShell>
  )
}
