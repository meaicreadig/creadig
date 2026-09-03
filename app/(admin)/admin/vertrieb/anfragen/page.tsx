import Link from "next/link"

import { AdminField, AdminInput, AdminSelect, Pill, SectionHeader } from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { getVertriebStore } from "@/lib/lead-store"
import { isTestEnquiry } from "@/lib/vertrieb-bestand"
import { HANDLING_LABELS, HANDLING_STATES } from "@/lib/vertrieb"
import type { EnquiryRow, HandlingStatus } from "@/lib/vertrieb"

/**
 * Vertrieb · Anfragen — die Inbox.
 *
 * ---------------------------------------------------------------------------
 * EIN EINGANGSBUCH, KEINE PIPELINE
 * Diese Liste zeigt, was hereingekommen ist. Ob daraus ein Geschäft wird,
 * steht eine Ebene weiter unter „Pipeline" — und die meisten Anfragen werden
 * nie eine Verkaufschance. Das ist normal und darf hier nicht wie ein
 * Rückstand aussehen.
 *
 * Deshalb ist der Filter „Neu" und nicht „offen": Eine bearbeitete Anfrage
 * ohne Vorgang ist ein abgeschlossener Fall, kein liegengebliebener.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Anfragen" }

export default async function AnfragenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; source?: string }>
}) {
  const store = getVertriebStore()
  if (!store) return <VertriebShell title="Anfragen" available={false}>{null}</VertriebShell>

  const params = await searchParams
  const search = typeof params.q === "string" ? params.q.trim() : ""
  const handling = (HANDLING_STATES as readonly string[]).includes(params.status ?? "")
    ? (params.status as HandlingStatus)
    : undefined
  const source = typeof params.source === "string" && params.source ? params.source : undefined

  let page: { rows: EnquiryRow[]; total: number }
  let sources: string[]
  try {
    ;[page, sources] = await Promise.all([
      store.listEnquiries({ search: search || undefined, handling, source, limit: 100 }),
      store.enquirySources(),
    ])
  } catch {
    return <VertriebShell title="Anfragen" available={false}>{null}</VertriebShell>
  }

  /* Letzte Linie: Store-Filter greift auf altem Deploy nicht — Seite filtert selbst. */
  const rows = page.rows.filter((row) => !isTestEnquiry(row))
  const total = Math.max(0, page.total - (page.rows.length - rows.length))

  return (
    <VertriebShell
      title="Anfragen"
      lead="Was über die Formulare hereingekommen ist. Ein Eingangsbuch — der Inhalt ändert sich nie."
      meta={<span className="block">{total} gesamt</span>}
      available
    >
      <form method="get" className="flex flex-wrap items-end gap-4">
        <AdminField label="Suche" htmlFor="q" className="flex-1 basis-64">
          <AdminInput id="q" name="q" type="search" defaultValue={search} placeholder="Nummer, Betrieb, Name, E-Mail" />
        </AdminField>
        <AdminField label="Bearbeitung" htmlFor="status">
          <AdminSelect id="status" name="status" defaultValue={handling ?? ""}>
            <option value="">alle</option>
            {HANDLING_STATES.map((s) => (
              <option key={s} value={s}>{HANDLING_LABELS[s]}</option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label="Quelle" htmlFor="source">
          <AdminSelect id="source" name="source" defaultValue={source ?? ""}>
            <option value="">alle</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </AdminSelect>
        </AdminField>
        <button type="submit" className="cta-quiet px-4 py-2 text-sm">Anwenden</button>
      </form>

      <div className="mt-10">
        <SectionHeader title="Eingänge" count={`${rows.length} von ${total}`} />
        {rows.length === 0 ? (
          <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
            {search || handling || source
              ? "Keine Anfrage passt zu dieser Auswahl."
              : "Der Speicher antwortet, und es liegt noch keine Anfrage vor."}
          </p>
        ) : (
          <EnquiryTable rows={rows} />
        )}
      </div>
    </VertriebShell>
  )
}

function EnquiryTable({ rows }: { rows: EnquiryRow[] }) {
  return (
    <div className="border-line mt-6 overflow-x-auto rounded-md border">
      <table className="w-full min-w-[56rem] border-collapse text-start">
        <caption className="sr-only">
          Anfragen mit Nummer, Absender, Organisation, Quelle, Eingang, Bearbeitung und Verkaufschance
        </caption>
        <thead>
          <tr className="border-line bg-muted/50 border-b">
            <Th>Nummer</Th><Th>Absender</Th><Th>Organisation</Th>
            <Th>Quelle</Th><Th>Eingang</Th><Th>Bearbeitung</Th><Th>Chance</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id} className="border-line hover:bg-muted/40 border-b last:border-b-0">
              <Td>
                {/* Die Nummer ist der Weg: Sie steht in der Mail und nennt der Anrufer. */}
                <Link href={`/admin/vertrieb/anfragen/${e.id}`} className="text-gold-text font-mono text-xs underline underline-offset-4">
                  {e.reference}
                </Link>
              </Td>
              <Td>
                <span className="text-subhead block text-sm">{e.contactName ?? e.name}</span>
                <span className="text-muted-foreground block text-xs">{e.email}</span>
              </Td>
              <Td><span className="text-xs">{e.organisationName ?? e.business ?? "—"}</span></Td>
              <Td>
                <span className="text-xs">{e.source}</span>
                <span className="text-muted-foreground block text-xs uppercase">{e.locale}</span>
                {/*
                  Der Reifegrad steht in der Quellen-Spalte und nicht in einer
                  eigenen: Er gehoert zum Betriebscheck, und eine Spalte, die
                  bei fast allen Zeilen leer bleibt, kostet Breite ohne Ertrag.
                */}
                {e.checkScore != null ? (
                  <span className="text-gold-text block text-xs tabular-nums">
                    {e.checkScore}/100
                  </span>
                ) : null}
              </Td>
              <Td>
                <time dateTime={e.createdAt} className="text-xs tabular-nums">{formatDate(e.createdAt)}</time>
              </Td>
              <Td>
                <Pill severity={e.handlingStatus === "neu" ? "attention" : "neutral"}>
                  {HANDLING_LABELS[e.handlingStatus]}
                </Pill>
              </Td>
              <Td>
                {e.opportunityId ? (
                  <Link href={`/admin/vertrieb/pipeline/${e.opportunityId}`} className="text-gold-text text-xs underline underline-offset-4">
                    vorhanden
                  </Link>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </Td>
            </tr>
          ))}
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
