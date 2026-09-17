import Link from "next/link"

import { AdminField, AdminInput, AdminSelect, Pill, SectionHeader } from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { getVertriebStore } from "@/lib/lead-store"
import { isTestEnquiry } from "@/lib/vertrieb-bestand"
import { HANDLING_STATES } from "@/lib/vertrieb"
import type { EnquiryRow, HandlingStatus } from "@/lib/vertrieb"
import { datumAnzeige, geschaeftsTag } from "@/lib/geschaeftszeit"
import type { AdminTexte } from "@/lib/admin-i18n"
import { adminSprachKontext } from "@/lib/admin-i18n/server"

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

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.nav.anfragen.label }
}

export default async function AnfragenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; source?: string }>
}) {
  const { t, intl } = await adminSprachKontext()
  const store = getVertriebStore()
  if (!store) return <VertriebShell title={t.nav.anfragen.label} available={false}>{null}</VertriebShell>

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
    return <VertriebShell title={t.nav.anfragen.label} available={false}>{null}</VertriebShell>
  }

  /* Letzte Linie: Store-Filter greift auf altem Deploy nicht — Seite filtert selbst. */
  const rows = page.rows.filter((row) => !isTestEnquiry(row))
  const total = Math.max(0, page.total - (page.rows.length - rows.length))
  const b = t.begriffe
  const l = t.anfragen

  return (
    <VertriebShell title={t.nav.anfragen.label} lead={l.lead} meta={<span className="block">{l.gesamt(total)}</span>} available>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <form method="get" className="flex flex-1 flex-wrap items-end gap-4">
          <AdminField label={l.suche} htmlFor="q" className="flex-1 basis-64">
            <AdminInput id="q" name="q" type="search" defaultValue={search} placeholder={l.suchePlatzhalter} />
          </AdminField>
          <AdminField label={t.anfrage.zustand} htmlFor="status">
            <AdminSelect id="status" name="status" defaultValue={handling ?? ""}>
              <option value="">{l.alle}</option>
              {HANDLING_STATES.map((s) => (
                <option key={s} value={s}>{b.bearbeitung[s]}</option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label={t.anfrage.quelle} htmlFor="source">
            <AdminSelect id="source" name="source" defaultValue={source ?? ""}>
              <option value="">{l.alle}</option>
              {sources.map((s) => <option key={s} value={s}>{b.quelle[s] ?? s}</option>)}
            </AdminSelect>
          </AdminField>
          <button type="submit" className="cta-quiet min-h-11 px-4 py-2 text-sm">{l.anwenden}</button>
        </form>
        {/* Die eine Hauptaktion dieser Seite. */}
        <Link href="/admin/vertrieb/anfragen/neu" className="cta-outline inline-flex min-h-11 items-center px-5 py-2.5 text-sm">
          {t.erfassen.primaer}
        </Link>
      </div>

      <div className="mt-10">
        <SectionHeader title={l.eingaenge} count={l.vonGesamt(rows.length, total)} />
        {rows.length === 0 ? (
          search || handling || source ? (
            <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
              {l.leerGefiltert}{" "}
              <Link href="/admin/vertrieb/anfragen" className="text-gold-text underline underline-offset-4">{l.filterZuruecksetzen}</Link>
            </p>
          ) : (
            <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">{l.leer}</p>
          )
        ) : (
          <EnquiryTable rows={rows} t={t} intl={intl} />
        )}
      </div>
    </VertriebShell>
  )
}

function EnquiryTable({ rows, t, intl }: { rows: EnquiryRow[]; t: AdminTexte; intl: string }) {
  const b = t.begriffe
  const sp = t.anfragen.spalte
  const heute = geschaeftsTag()
  return (
    <div className="border-line mt-6 overflow-x-auto rounded-md border">
      <table className="w-full min-w-[64rem] border-collapse text-start">
        <caption className="sr-only">{t.anfragen.tabelleBeschriftung}</caption>
        <thead>
          <tr className="border-line bg-muted/50 border-b">
            <Th>{sp.nummer}</Th><Th>{sp.absender}</Th><Th>{sp.organisation}</Th><Th>{sp.quelle}</Th>
            <Th>{sp.eingang}</Th><Th>{sp.bearbeitung}</Th><Th>{sp.verantwortlich}</Th><Th>{sp.schritt}</Th><Th>{sp.chance}</Th>
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
                <span className="text-muted-foreground block text-xs">{e.email ?? e.phone}</span>
              </Td>
              <Td><span className="text-xs">{e.organisationName ?? e.business ?? "—"}</span></Td>
              <Td>
                <span className="text-xs">{b.quelle[e.source] ?? e.source}</span>
                <span className="text-muted-foreground block text-xs uppercase">{e.locale}</span>
                {e.checkScore != null ? <span className="text-gold-text block text-xs tabular-nums">{e.checkScore}/100</span> : null}
              </Td>
              <Td>
                <time dateTime={e.createdAt} className="text-xs tabular-nums">{datumAnzeige(e.createdAt, intl)}</time>
              </Td>
              <Td>
                <Pill severity={e.handlingStatus === "neu" ? "attention" : "neutral"}>{b.bearbeitung[e.handlingStatus]}</Pill>
              </Td>
              <Td>
                <span className="text-xs">{e.responsible ? (b.rolle[e.responsible] ?? e.responsible) : <span className="text-muted-foreground">—</span>}</span>
              </Td>
              <Td>
                {e.nextAction ? (
                  <span className={`text-xs ${e.nextActionAt && e.nextActionAt < heute ? "text-destructive" : ""}`}>
                    {e.nextAction}
                    {e.nextActionAt ? <span className="block tabular-nums">{datumAnzeige(e.nextActionAt, intl)}</span> : null}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </Td>
              <Td>
                {e.opportunityId ? (
                  <Link href={`/admin/vertrieb/pipeline/${e.opportunityId}`} className="text-gold-text text-xs underline underline-offset-4">
                    {t.anfragen.vorhanden}
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
