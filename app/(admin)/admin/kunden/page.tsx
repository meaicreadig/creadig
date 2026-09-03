import Link from "next/link"

import { AdminField, AdminInput, AdminSelect, Pill, SectionHeader, Unknown } from "@/components/admin/primitives"
import { KundenShell } from "@/components/admin/kunden-shell"
import { getVertriebStore } from "@/lib/lead-store"
import { LIFECYCLE_LABELS, LIFECYCLE_STAGES, RELATIONSHIP_LABELS } from "@/lib/vertrieb"
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

export const metadata = { title: "Kunden" }

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
  if (!store) return <KundenShell title="Kunden" available={false}>{null}</KundenShell>

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
    return <KundenShell title="Kunden" available={false}>{null}</KundenShell>
  }

  return (
    <KundenShell
      title="Kunden"
      lead="Betriebe, Einrichtungen und Vereine — mit ihrer belegten Geschäftshistorie. Kundenhistorie heisst NICHT laufender Auftrag."
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
    </KundenShell>
  )
}

function OrganisationTable({ rows }: { rows: OrganisationRow[] }) {
  return (
    <div className="border-line mt-6 overflow-x-auto rounded-md border">
      <table className="w-full min-w-[72rem] border-collapse text-start">
        <caption className="sr-only">
          Kunden mit Name, Ort, Kundenhistorie, Standorten, Ansprechpartnern,
          engster belegter Beziehung, offener Verkaufschance, letzter
          aufgezeichneter Aktivität und nächstem fälligen Schritt
        </caption>
        <thead>
          <tr className="border-line bg-muted/50 border-b">
            <Th>Name</Th><Th>Ort</Th><Th>Kundenhistorie</Th>
            <Th>Standorte</Th><Th>Kontakte</Th><Th>Beziehung</Th>
            <Th>Chance</Th><Th>Zuletzt</Th><Th>Nächster Schritt</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id} className="border-line hover:bg-muted/40 border-b last:border-b-0">
              <Td>
                <Link
                  href={`/admin/kunden/${o.id}`}
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
              {/*
                Der Beziehungsgrad gehört zum Menschen, nicht zum Betrieb —
                hier steht deshalb der stärkste belegte unter seinen
                Ansprechpartnern, und „unbekannt" gilt als kein Wert.
              */}
              <Td>
                {o.strongestRelationship ? (
                  <span className="text-xs">{RELATIONSHIP_LABELS[o.strongestRelationship]}</span>
                ) : (
                  <Unknown />
                )}
              </Td>
              <Td>
                <span className="text-xs tabular-nums">
                  {o.openOpportunities > 0 ? `${o.openOpportunities} offen` : "—"}
                </span>
              </Td>
              {/*
                „Zuletzt" ist die letzte AUFGEZEICHNETE Aktivität. Ein
                Telefonat, das niemand eingetragen hat, steht hier nicht — und
                der Gedankenstrich sagt „nichts aufgezeichnet", nicht
                „nichts passiert".
              */}
              <Td>
                {o.lastActivityAt ? (
                  <time dateTime={o.lastActivityAt} className="text-xs tabular-nums">
                    {formatDate(o.lastActivityAt)}
                  </time>
                ) : (
                  <Unknown />
                )}
              </Td>
              <Td>
                {o.nextStep ? (
                  <>
                    <span className="block text-xs">{o.nextStep}</span>
                    {o.nextStepAt && (
                      <time dateTime={o.nextStepAt} className="text-muted-foreground block text-xs tabular-nums">
                        {formatDate(o.nextStepAt)}
                      </time>
                    )}
                  </>
                ) : (
                  <Unknown />
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

/* Wortgleich mit `pipeline/page.tsx` — ein Datum sieht im ganzen Control
   Center gleich aus, und ein unlesbarer Wert wird durchgereicht statt als
   „Invalid Date" angezeigt. */
function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })
}
