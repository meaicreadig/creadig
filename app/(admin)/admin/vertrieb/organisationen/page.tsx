import Link from "next/link"

import { AdminField, AdminInput, AdminSelect, Pill, SectionHeader } from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { getVertriebStore } from "@/lib/lead-store"
import { LIFECYCLE_LABELS, LIFECYCLE_STAGES } from "@/lib/vertrieb"
import type { LifecycleStage, OrganisationQuery, OrganisationRow } from "@/lib/vertrieb"

/**
 * Vertrieb · Organisationen.
 *
 * ---------------------------------------------------------------------------
 * WARUM EIN EIGENES REGISTER
 * Ein Betrieb ist kein Mensch. Vegitat hat vier Standorte und keinen
 * hinterlegten Ansprechpartner; unter „Beziehungen" wäre er unsichtbar,
 * obwohl er der am längsten belegte Kunde ist. Wer nur Menschen führt,
 * verliert genau die Betriebe, mit denen man zusammengearbeitet hat.
 *
 * ---------------------------------------------------------------------------
 * DIE DRITTE ACHSE
 * Diese Liste zeigt die Kundenhistorie — belegte Geschäftsbeziehung, nie
 * Kunde, ehemaliger Kunde. Das ist weder der Beziehungsgrad (der gehört zum
 * Menschen) noch die Pipeline (die gehört zum Vorgang). Drei Achsen, drei
 * Spalten, keine davon aus einer der anderen abgeleitet.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Organisationen" }

const BUCKETS = [
  { value: "", label: "alle" },
  { value: "kunde-ohne-chance", label: "Kunden ohne offene Chance" },
  { value: "mit-chance", label: "mit Verkaufschance" },
  { value: "ohne-chance", label: "ohne Verkaufschance" },
]

export default async function OrganisationenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; historie?: string; bucket?: string }>
}) {
  const store = getVertriebStore()
  if (!store) return <VertriebShell title="Organisationen" available={false}>{null}</VertriebShell>

  const params = await searchParams
  const search = typeof params.q === "string" ? params.q.trim() : ""
  const lifecycle = (LIFECYCLE_STAGES as readonly string[]).includes(params.historie ?? "")
    ? (params.historie as LifecycleStage)
    : undefined
  const bucket = BUCKETS.some((b) => b.value && b.value === params.bucket)
    ? (params.bucket as OrganisationQuery["bucket"])
    : undefined

  let page: { rows: OrganisationRow[]; total: number }
  try {
    page = await store.listOrganisations({ search: search || undefined, lifecycle, bucket, limit: 200 })
  } catch {
    return <VertriebShell title="Organisationen" available={false}>{null}</VertriebShell>
  }

  return (
    <VertriebShell
      title="Organisationen"
      lead="Betriebe, Einrichtungen und Vereine — mit ihrer belegten Geschäftshistorie."
      meta={<span className="block">{page.total} gesamt</span>}
      available
    >
      <form method="get" className="flex flex-wrap items-end gap-4">
        <AdminField label="Suche" htmlFor="q" className="flex-1 basis-64">
          <AdminInput id="q" name="q" type="search" defaultValue={search} placeholder="Name, Ort, Branche" />
        </AdminField>
        <AdminField label="Kundenhistorie" htmlFor="historie">
          <AdminSelect id="historie" name="historie" defaultValue={lifecycle ?? ""}>
            <option value="">alle</option>
            {LIFECYCLE_STAGES.map((l) => (
              <option key={l} value={l}>{LIFECYCLE_LABELS[l]}</option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label="Auswahl" htmlFor="bucket">
          <AdminSelect id="bucket" name="bucket" defaultValue={bucket ?? ""}>
            {BUCKETS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </AdminSelect>
        </AdminField>
        <button type="submit" className="cta-quiet px-4 py-2 text-sm">Anwenden</button>
      </form>

      <div className="mt-10">
        <SectionHeader title="Betriebe" count={`${page.rows.length} von ${page.total}`} />
        {page.rows.length === 0 ? (
          <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
            {search || lifecycle || bucket
              ? "Kein Betrieb passt zu dieser Auswahl."
              : "Noch keine Organisation. Sie entstehen aus Anfragen oder aus dem eingespielten Bestand."}
          </p>
        ) : (
          <OrganisationTable rows={page.rows} />
        )}
      </div>
    </VertriebShell>
  )
}

function OrganisationTable({ rows }: { rows: OrganisationRow[] }) {
  return (
    <div className="border-line mt-6 overflow-x-auto rounded-md border">
      <table className="w-full min-w-[52rem] border-collapse text-start">
        <caption className="sr-only">
          Organisationen mit Name, Ort, Kundenhistorie, Standorten, Kontakten und offenen Verkaufschancen
        </caption>
        <thead>
          <tr className="border-line bg-muted/50 border-b">
            <Th>Name</Th><Th>Ort</Th><Th>Kundenhistorie</Th>
            <Th>Standorte</Th><Th>Kontakte</Th><Th>Chance</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id} className="border-line hover:bg-muted/40 border-b last:border-b-0">
              <Td>
                <Link
                  href={`/admin/vertrieb/organisationen/${o.id}`}
                  className="text-gold-text text-sm underline underline-offset-4"
                >
                  {o.name}
                </Link>
                {o.industry && <span className="text-muted-foreground block text-xs">{o.industry}</span>}
              </Td>
              <Td>
                <span className="text-xs">
                  {[o.postalCode, o.city].filter(Boolean).join(" ") || "—"}
                </span>
              </Td>
              <Td>
                <Pill severity={o.lifecycle === "kunde" ? "attention" : "neutral"}>
                  {LIFECYCLE_LABELS[o.lifecycle]}
                </Pill>
              </Td>
              {/* Ein Standort ist der Normalfall und keine Zahl wert. */}
              <Td>
                <span className="text-xs tabular-nums">
                  {o.locationCount > 0 ? o.locationCount : "—"}
                </span>
              </Td>
              <Td>
                <span className="text-xs tabular-nums">
                  {o.contactCount > 0 ? o.contactCount : "—"}
                </span>
              </Td>
              <Td>
                <span className="text-xs tabular-nums">
                  {o.openOpportunities > 0 ? `${o.openOpportunities} offen` : "—"}
                </span>
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
