import Link from "next/link"

import {
  AdminField,
  AdminInput,
  AdminSelect,
  Pill,
  SectionHeader,
} from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import type { AdminTexte } from "@/lib/admin-i18n"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { SALES_STATES, getVertriebStore, type SalesStatus } from "@/lib/lead-store"
import type { OpportunityQuery, OpportunityRow } from "@/lib/vertrieb"
import { datumAnzeige, geschaeftsTag } from "@/lib/geschaeftszeit"

/**
 * Vertrieb · Pipeline — Tabelle nach Fälligkeit, kein Kanban (ADM-01 DE/TR).
 */
export const dynamic = "force-dynamic"

const BUCKET_KEYS = ["", "offen", "faellig", "ueberfaellig", "ohne-schritt", "abgeschlossen"] as const

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.pipeline.titel }
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; bucket?: string }>
}) {
  const { t, intl } = await adminSprachKontext()
  const store = getVertriebStore()
  if (!store) return <VertriebShell title={t.pipeline.titel} available={false}>{null}</VertriebShell>

  const params = await searchParams
  const search = typeof params.q === "string" ? params.q.trim() : ""
  const status = SALES_STATES.includes(params.status as SalesStatus)
    ? (params.status as SalesStatus)
    : undefined
  const bucket = BUCKET_KEYS.some((b) => b && b === params.bucket)
    ? (params.bucket as OpportunityQuery["bucket"])
    : undefined

  let page: { rows: OpportunityRow[]; total: number }
  try {
    page = await store.listOpportunities({ search: search || undefined, status, bucket, limit: 100 })
  } catch {
    return <VertriebShell title={t.pipeline.titel} available={false}>{null}</VertriebShell>
  }

  return (
    <VertriebShell
      title={t.pipeline.titel}
      lead={t.pipeline.lead}
      meta={<span className="block">{t.pipeline.gesamt(page.total)}</span>}
      available
    >
      <form method="get" data-wache="aus" className="flex flex-wrap items-end gap-4">
        <AdminField label={t.pipeline.suche} htmlFor="q" className="flex-1 basis-64">
          <AdminInput
            id="q"
            name="q"
            type="search"
            defaultValue={search}
            placeholder={t.pipeline.suchePlatzhalter}
          />
        </AdminField>
        <AdminField label={t.pipeline.status} htmlFor="status">
          <AdminSelect id="status" name="status" defaultValue={status ?? ""}>
            <option value="">{t.pipeline.alle}</option>
            {SALES_STATES.map((s) => (
              <option key={s} value={s}>
                {t.begriffe.stufe[s] ?? s}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label={t.pipeline.auswahl} htmlFor="bucket">
          <AdminSelect id="bucket" name="bucket" defaultValue={bucket ?? ""}>
            {BUCKET_KEYS.map((b) => (
              <option key={b || "alle"} value={b}>
                {t.pipeline.bucket[b] ?? b}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
        <button type="submit" className="cta-quiet min-h-11 px-4 py-2 text-sm">
          {t.pipeline.anwenden}
        </button>
      </form>

      <div className="mt-10">
        <SectionHeader
          title={t.pipeline.verkaufschancen}
          count={t.pipeline.vonGesamt(page.rows.length, page.total)}
        />
        {page.rows.length === 0 ? (
          <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
            {search || status || bucket ? t.pipeline.leerGefiltert : t.pipeline.leer}
          </p>
        ) : (
          <PipelineTable rows={page.rows} t={t} intl={intl} />
        )}
      </div>
    </VertriebShell>
  )
}

function PipelineTable({
  rows,
  t,
  intl,
}: {
  rows: OpportunityRow[]
  t: AdminTexte
  intl: string
}) {
  const heute = geschaeftsTag()
  const s = t.pipeline.spalte
  return (
    <div className="border-line mt-6 overflow-x-auto rounded-md border">
      <table className="w-full min-w-[56rem] border-collapse text-start">
        <caption className="sr-only">{t.pipeline.tabelleBeschriftung}</caption>
        <thead>
          <tr className="border-line bg-muted/50 border-b">
            <Th>{s.vorgang}</Th>
            <Th>{s.organisation}</Th>
            <Th>{s.kontakt}</Th>
            <Th>{s.status}</Th>
            <Th>{s.schritt}</Th>
            <Th>{s.faellig}</Th>
            <Th>{s.wert}</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const overdue = o.nextActionAt !== null && o.nextActionAt < heute
            return (
              <tr key={o.id} className="border-line hover:bg-muted/40 border-b last:border-b-0">
                <Td>
                  <Link
                    href={`/admin/vertrieb/pipeline/${o.id}`}
                    className="text-gold-text text-sm underline underline-offset-4"
                  >
                    {o.title}
                  </Link>
                </Td>
                <Td>
                  <span className="text-xs">{o.organisationName ?? "—"}</span>
                </Td>
                <Td>
                  <span className="text-xs">{o.contactName ?? "—"}</span>
                </Td>
                <Td>
                  <Pill
                    severity={
                      o.status === "lost" ? "critical" : o.status === "won" ? "neutral" : "attention"
                    }
                  >
                    {t.begriffe.stufe[o.status] ?? o.status}
                  </Pill>
                </Td>
                <Td>
                  {o.nextAction ? (
                    <span className="text-xs">{o.nextAction}</span>
                  ) : (
                    <span className="text-gold-text text-xs">{t.pipeline.keinSchritt}</span>
                  )}
                </Td>
                <Td>
                  {o.nextActionAt ? (
                    <span className={`text-xs tabular-nums ${overdue ? "text-destructive" : ""}`}>
                      {datumAnzeige(o.nextActionAt, intl)}
                      {overdue ? t.pipeline.ueberfaellig : ""}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </Td>
                <Td>
                  <span className="text-xs tabular-nums">
                    {o.estimatedValue === null
                      ? "—"
                      : `${o.estimatedValue.toLocaleString(intl)} €`}
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
  return (
    <th scope="col" className="text-meta text-muted-foreground px-4 py-2.5 font-normal">
      {children}
    </th>
  )
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>
}
