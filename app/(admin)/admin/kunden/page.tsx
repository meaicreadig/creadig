import Link from "next/link"

import {
  AdminField,
  AdminInput,
  AdminSelect,
  Pill,
  SectionHeader,
} from "@/components/admin/primitives"
import {
  Unknown,
} from "@/components/admin/primitives-i18n"
import { KundenShell } from "@/components/admin/kunden-shell"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import type { AdminTexte } from "@/lib/admin-i18n"
import { getVertriebStore } from "@/lib/lead-store"
import { LIFECYCLE_STAGES } from "@/lib/vertrieb"
import type { LifecycleStage, OrganisationQuery, OrganisationRow } from "@/lib/vertrieb"
import { datumAnzeige } from "@/lib/geschaeftszeit"

/**
 * Vertrieb · Organisationen — ADM-01 DE/TR.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.kundenListe.titel }
}

const BUCKET_VALUES = ["", "kunde-ohne-chance", "mit-chance", "ohne-chance"] as const

export default async function OrganisationenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; historie?: string; bucket?: string }>
}) {
  const { t, intl } = await adminSprachKontext()
  const store = getVertriebStore()
  if (!store) return <KundenShell title={t.kundenListe.titel} available={false}>{null}</KundenShell>

  const params = await searchParams
  const search = typeof params.q === "string" ? params.q.trim() : ""
  const lifecycle = (LIFECYCLE_STAGES as readonly string[]).includes(params.historie ?? "")
    ? (params.historie as LifecycleStage)
    : undefined
  const bucket = BUCKET_VALUES.some((b) => b && b === params.bucket)
    ? (params.bucket as OrganisationQuery["bucket"])
    : undefined

  let page: { rows: OrganisationRow[]; total: number }
  try {
    page = await store.listOrganisations({ search: search || undefined, lifecycle, bucket, limit: 200 })
  } catch {
    return <KundenShell title={t.kundenListe.titel} available={false}>{null}</KundenShell>
  }

  return (
    <KundenShell
      title={t.kundenListe.titel}
      lead={t.kundenListe.lead}
      meta={<span className="block">{t.kundenListe.gesamt(page.total)}</span>}
      available
    >
      <form method="get" data-wache="aus" className="flex flex-wrap items-end gap-4">
        <AdminField label={t.kundenListe.suche} htmlFor="q" className="flex-1 basis-64">
          <AdminInput id="q" name="q" type="search" defaultValue={search} placeholder={t.kundenListe.suchePlatzhalter} />
        </AdminField>
        <AdminField label={t.kundenListe.historie} htmlFor="historie">
          <AdminSelect id="historie" name="historie" defaultValue={lifecycle ?? ""}>
            <option value="">{t.kundenListe.alle}</option>
            {LIFECYCLE_STAGES.map((l) => (
              <option key={l} value={l}>{t.begriffe.lebenszyklus[l] ?? l}</option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label={t.kundenListe.auswahl} htmlFor="bucket">
          <AdminSelect id="bucket" name="bucket" defaultValue={bucket ?? ""}>
            {BUCKET_VALUES.map((b) => (
              <option key={b} value={b}>{t.kundenListe.bucket[b] ?? b}</option>
            ))}
          </AdminSelect>
        </AdminField>
        <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.kundenListe.anwenden}</button>
      </form>

      <div className="mt-10">
        <SectionHeader title={t.kundenListe.betriebe} count={t.kundenListe.vonGesamt(page.rows.length, page.total)} />
        {page.rows.length === 0 ? (
          <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
            {search || lifecycle || bucket ? t.kundenListe.leerGefiltert : t.kundenListe.leer}
          </p>
        ) : (
          <OrganisationTable rows={page.rows} t={t} intl={intl} />
        )}
      </div>
    </KundenShell>
  )
}

function OrganisationTable({
  rows,
  t,
  intl,
}: {
  rows: OrganisationRow[]
  t: AdminTexte
  intl: string
}) {
  const s = t.kundenListe.spalte
  return (
    <div className="border-line mt-6 overflow-x-auto rounded-md border">
      <table className="w-full min-w-[72rem] border-collapse text-start">
        <caption className="sr-only">{t.kundenListe.tabelleBeschriftung}</caption>
        <thead>
          <tr className="border-line bg-muted/50 border-b">
            <Th>{s.name}</Th><Th>{s.ort}</Th><Th>{s.historie}</Th>
            <Th>{s.standorte}</Th><Th>{s.kontakte}</Th><Th>{s.beziehung}</Th>
            <Th>{s.chance}</Th><Th>{s.zuletzt}</Th><Th>{s.schritt}</Th>
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
                  {t.begriffe.lebenszyklus[o.lifecycle] ?? o.lifecycle}
                </Pill>
              </Td>
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
                {o.strongestRelationship ? (
                  <span className="text-xs">{t.begriffe.beziehung[o.strongestRelationship] ?? o.strongestRelationship}</span>
                ) : (
                  <Unknown />
                )}
              </Td>
              <Td>
                <span className="text-xs tabular-nums">
                  {o.openOpportunities > 0 ? t.kundenListe.offen(o.openOpportunities) : "—"}
                </span>
              </Td>
              <Td>
                {o.lastActivityAt ? (
                  <time dateTime={o.lastActivityAt} className="text-xs tabular-nums">
                    {datumAnzeige(o.lastActivityAt, intl)}
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
                        {datumAnzeige(o.nextStepAt, intl)}
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
