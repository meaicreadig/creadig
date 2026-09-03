import Link from "next/link"

import {
  AdminField,
  AdminInput,
  AdminSelect,
  Pill,
  SectionHeader,
} from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { SALES_LABELS_DE, SALES_STATES, getVertriebStore, type SalesStatus } from "@/lib/lead-store"
import type { OpportunityQuery, OpportunityRow } from "@/lib/vertrieb"

/**
 * Vertrieb · Pipeline.
 *
 * ---------------------------------------------------------------------------
 * TABELLE, KEIN KANBAN
 * Ein Kanban zeigt eine Spalte je Status und beantwortet damit gut die Frage
 * „wie verteilt sich mein Bestand". Die Frage im Alltag ist eine andere:
 * „woran muss ich heute ran". Dafür braucht es Sortierung nach Fälligkeit,
 * und die kann ein Brett mit neun Spalten nicht.
 *
 * Neun Spalten wären bei dieser Menge ausserdem neun fast leere Spalten.
 *
 * ---------------------------------------------------------------------------
 * DIE SORTIERUNG IST DIE AUSSAGE
 * Vorgänge ohne nächsten Schritt zuerst, dann nach Fälligkeit. Wer nichts
 * geplant hat, ist das grössere Problem als wer für morgen etwas geplant hat.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Pipeline" }

const BUCKETS: { value: string; label: string }[] = [
  { value: "", label: "alle" },
  { value: "offen", label: "offen" },
  { value: "faellig", label: "heute fällig" },
  { value: "ueberfaellig", label: "überfällig" },
  { value: "ohne-schritt", label: "ohne nächsten Schritt" },
  { value: "abgeschlossen", label: "abgeschlossen" },
]

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; bucket?: string }>
}) {
  const store = getVertriebStore()
  if (!store) return <VertriebShell title="Pipeline" available={false}>{null}</VertriebShell>

  const params = await searchParams
  const search = typeof params.q === "string" ? params.q.trim() : ""
  const status = SALES_STATES.includes(params.status as SalesStatus)
    ? (params.status as SalesStatus)
    : undefined
  const bucket = BUCKETS.some((b) => b.value && b.value === params.bucket)
    ? (params.bucket as OpportunityQuery["bucket"])
    : undefined

  let page: { rows: OpportunityRow[]; total: number }
  try {
    page = await store.listOpportunities({ search: search || undefined, status, bucket, limit: 100 })
  } catch {
    return <VertriebShell title="Pipeline" available={false}>{null}</VertriebShell>
  }

  return (
    <VertriebShell
      title="Pipeline"
      lead="Konkrete Verkaufschancen. Ein Vorgang entsteht, wenn jemand ihn anlegt — nicht automatisch aus jeder Anfrage."
      meta={<span className="block">{page.total} gesamt</span>}
      available
    >
      <form method="get" className="flex flex-wrap items-end gap-4">
        <AdminField label="Suche" htmlFor="q" className="flex-1 basis-64">
          <AdminInput id="q" name="q" type="search" defaultValue={search} placeholder="Vorgang, Betrieb, Kontakt" />
        </AdminField>
        <AdminField label="Status" htmlFor="status">
          <AdminSelect id="status" name="status" defaultValue={status ?? ""}>
            <option value="">alle</option>
            {SALES_STATES.map((s) => (
              <option key={s} value={s}>{SALES_LABELS_DE[s]}</option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label="Auswahl" htmlFor="bucket">
          <AdminSelect id="bucket" name="bucket" defaultValue={bucket ?? ""}>
            {BUCKETS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </AdminSelect>
        </AdminField>
        <button type="submit" className="cta-quiet px-4 py-2 text-sm">Anwenden</button>
      </form>

      <div className="mt-10">
        <SectionHeader title="Verkaufschancen" count={`${page.rows.length} von ${page.total}`} />
        {page.rows.length === 0 ? (
          <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
            {search || status || bucket
              ? "Kein Vorgang passt zu dieser Auswahl."
              : "Es gibt noch keine Verkaufschance. Sie entsteht aus einer Anfrage oder von Hand — nicht von selbst."}
          </p>
        ) : (
          <PipelineTable rows={page.rows} />
        )}
      </div>
    </VertriebShell>
  )
}

function PipelineTable({ rows }: { rows: OpportunityRow[] }) {
  const heute = new Date().toISOString().slice(0, 10)
  return (
    <div className="border-line mt-6 overflow-x-auto rounded-md border">
      <table className="w-full min-w-[56rem] border-collapse text-start">
        <caption className="sr-only">
          Verkaufschancen mit Vorgang, Organisation, Kontakt, Status, nächstem Schritt und Fälligkeit
        </caption>
        <thead>
          <tr className="border-line bg-muted/50 border-b">
            <Th>Vorgang</Th><Th>Organisation</Th><Th>Kontakt</Th>
            <Th>Status</Th><Th>Nächster Schritt</Th><Th>Fällig</Th><Th>Wert</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const overdue = o.nextActionAt !== null && o.nextActionAt < heute
            return (
              <tr key={o.id} className="border-line hover:bg-muted/40 border-b last:border-b-0">
                <Td>
                  <Link href={`/admin/vertrieb/pipeline/${o.id}`} className="text-gold-text text-sm underline underline-offset-4">
                    {o.title}
                  </Link>
                </Td>
                <Td><span className="text-xs">{o.organisationName ?? "—"}</span></Td>
                <Td><span className="text-xs">{o.contactName ?? "—"}</span></Td>
                <Td>
                  <Pill severity={o.status === "lost" ? "critical" : o.status === "won" ? "neutral" : "attention"}>
                    {SALES_LABELS_DE[o.status]}
                  </Pill>
                </Td>
                <Td>
                  {o.nextAction ? (
                    <span className="text-xs">{o.nextAction}</span>
                  ) : (
                    <span className="text-gold-text text-xs">kein nächster Schritt</span>
                  )}
                </Td>
                <Td>
                  {o.nextActionAt ? (
                    <span className={`text-xs tabular-nums ${overdue ? "text-destructive" : ""}`}>
                      {formatDate(o.nextActionAt)}{overdue && " · überfällig"}
                    </span>
                  ) : <span className="text-muted-foreground text-xs">—</span>}
                </Td>
                <Td>
                  {/* Kein Wert heisst "nicht geschätzt", nicht "0 €". */}
                  <span className="text-xs tabular-nums">
                    {o.estimatedValue === null ? "—" : `${o.estimatedValue.toLocaleString("de-DE")} €`}
                  </span>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th scope="col" className="text-meta text-muted-foreground px-4 py-2.5 font-normal">{children}</th>
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>
}
function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })
}
