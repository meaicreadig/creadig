import Link from "next/link"

import { AdminField, AdminInput, AdminSelect, Pill, SectionHeader } from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import type { AdminTexte } from "@/lib/admin-i18n"
import { getVertriebStore } from "@/lib/lead-store"
import { RELATIONSHIP_LEVELS } from "@/lib/vertrieb"
import type { ContactQuery, ContactRow, RelationshipLevel } from "@/lib/vertrieb"
import { datumAnzeige, geschaeftsTag } from "@/lib/geschaeftszeit"

/**
 * Vertrieb · Beziehungen — ADM-01 DE/TR.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.beziehungenListe.titel }
}

const BUCKET_VALUES = ["", "mit-chance", "ohne-chance", "pflege-faellig"] as const

export default async function BeziehungenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; grad?: string; bucket?: string }>
}) {
  const { t, intl } = await adminSprachKontext()
  const store = getVertriebStore()
  if (!store) return <VertriebShell title={t.beziehungenListe.titel} available={false}>{null}</VertriebShell>

  const params = await searchParams
  const search = typeof params.q === "string" ? params.q.trim() : ""
  const relationship = (RELATIONSHIP_LEVELS as readonly string[]).includes(params.grad ?? "")
    ? (params.grad as RelationshipLevel)
    : undefined
  const bucket = BUCKET_VALUES.some((b) => b && b === params.bucket)
    ? (params.bucket as ContactQuery["bucket"])
    : params.bucket === "warm-ohne-chance"
      ? "warm-ohne-chance"
      : undefined

  let page: { rows: ContactRow[]; total: number }
  try {
    page = await store.listContacts({ search: search || undefined, relationship, bucket, limit: 100 })
  } catch {
    return <VertriebShell title={t.beziehungenListe.titel} available={false}>{null}</VertriebShell>
  }

  return (
    <VertriebShell
      title={t.beziehungenListe.titel}
      lead={t.beziehungenListe.lead}
      meta={<span className="block">{t.beziehungenListe.gesamt(page.total)}</span>}
      available
    >
      <form method="get" data-wache="aus" className="flex flex-wrap items-end gap-4">
        <AdminField label={t.beziehungenListe.suche} htmlFor="q" className="flex-1 basis-64">
          <AdminInput id="q" name="q" type="search" defaultValue={search} placeholder={t.beziehungenListe.suchePlatzhalter} />
        </AdminField>
        <AdminField label={t.beziehungenListe.grad} htmlFor="grad">
          <AdminSelect id="grad" name="grad" defaultValue={relationship ?? ""}>
            <option value="">{t.beziehungenListe.alle}</option>
            {RELATIONSHIP_LEVELS.map((r) => (
              <option key={r} value={r}>{t.begriffe.beziehung[r] ?? r}</option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label={t.beziehungenListe.auswahl} htmlFor="bucket">
          <AdminSelect id="bucket" name="bucket" defaultValue={bucket ?? ""}>
            {[...BUCKET_VALUES, "warm-ohne-chance" as const].map((b) => (
              <option key={b} value={b}>{t.beziehungenListe.bucket[b] ?? b}</option>
            ))}
          </AdminSelect>
        </AdminField>
        <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.beziehungenListe.anwenden}</button>
      </form>

      <div className="mt-10">
        <SectionHeader title={t.beziehungenListe.kontakte} count={t.beziehungenListe.vonGesamt(page.rows.length, page.total)} />
        {page.rows.length === 0 ? (
          <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
            {search || relationship || bucket ? t.beziehungenListe.leerGefiltert : t.beziehungenListe.leer}
          </p>
        ) : (
          <ContactTable rows={page.rows} t={t} intl={intl} />
        )}
      </div>
    </VertriebShell>
  )
}

function ContactTable({
  rows,
  t,
  intl,
}: {
  rows: ContactRow[]
  t: AdminTexte
  intl: string
}) {
  const heute = geschaeftsTag()
  const s = t.beziehungenListe.spalte
  return (
    <div className="border-line mt-6 overflow-x-auto rounded-md border">
      <table className="w-full min-w-[54rem] border-collapse text-start">
        <caption className="sr-only">{t.beziehungenListe.tabelleBeschriftung}</caption>
        <thead>
          <tr className="border-line bg-muted/50 border-b">
            <Th>{s.name}</Th><Th>{s.organisation}</Th><Th>{s.beziehung}</Th>
            <Th>{s.zuletzt}</Th><Th>{s.schritt}</Th><Th>{s.chance}</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const due = c.nextTouchAt !== null && c.nextTouchAt <= heute
            return (
              <tr key={c.id} className="border-line hover:bg-muted/40 border-b last:border-b-0">
                <Td>
                  <Link href={`/admin/vertrieb/beziehungen/${c.id}`} className="text-gold-text text-sm underline underline-offset-4">
                    {c.name}
                  </Link>
                  <span className="text-muted-foreground block text-xs">{c.email}</span>
                </Td>
                <Td><span className="text-xs">{c.organisationName ?? "—"}</span></Td>
                <Td>
                  <Pill severity={c.relationship === "warm" || c.relationship === "eng" ? "attention" : "neutral"}>
                    {t.begriffe.beziehung[c.relationship] ?? c.relationship}
                  </Pill>
                </Td>
                <Td>
                  <span className="text-xs tabular-nums">
                    {c.lastInteractionAt ? datumAnzeige(c.lastInteractionAt, intl) : "—"}
                  </span>
                </Td>
                <Td>
                  {c.nextTouch ? (
                    <>
                      <span className="text-xs">{c.nextTouch}</span>
                      {c.nextTouchAt && (
                        <span className={`block text-xs tabular-nums ${due ? "text-destructive" : "text-muted-foreground"}`}>
                          {datumAnzeige(c.nextTouchAt, intl)}{due ? t.beziehungenListe.faelligMark : ""}
                        </span>
                      )}
                    </>
                  ) : <span className="text-muted-foreground text-xs">—</span>}
                </Td>
                <Td>
                  <span className="text-xs tabular-nums">
                    {c.openOpportunities > 0 ? t.beziehungenListe.offen(c.openOpportunities) : "—"}
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
