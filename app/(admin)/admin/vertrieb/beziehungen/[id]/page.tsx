import Link from "next/link"
import { notFound } from "next/navigation"

import {
  setContactDetails,
  setContactOrganisation,
  setNextTouch,
  setRelationship,
} from "@/app/(admin)/admin/vertrieb/actions"
import { ActivityLog } from "@/components/admin/activity-log"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import {
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  Pill,
  SectionHeader,
} from "@/components/admin/primitives"
import {
  DataValue,
} from "@/components/admin/primitives-i18n"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { getVertriebStore } from "@/lib/lead-store"
import { RELATIONSHIP_LEVELS } from "@/lib/vertrieb"
import { datumAnzeige } from "@/lib/geschaeftszeit"

/**
 * Ein Kontakt.
 *
 * ---------------------------------------------------------------------------
 * DIE ZWEI ACHSEN NEBENEINANDER
 * Links steht die Beziehung, rechts stehen die Vorgänge. Beides auf einer
 * Seite, aber sichtbar getrennt — man soll auf einen Blick sehen können, dass
 * jemand eng ist UND gerade nichts läuft. Das ist kein Widerspruch, das ist
 * der Normalfall.
 *
 * ---------------------------------------------------------------------------
 * LINKEDIN
 * Ein Feld und ein Link, mehr nicht. Es gibt keine Anbindung an LinkedIn —
 * kein Abruf, keine Synchronisierung, keine Automatisierung. Was hier steht,
 * hat jemand von Hand eingetragen. Eine „Integration" zu behaupten, die aus
 * einem `<a href>` besteht, wäre genau die Art Attrappe, die dieses Projekt
 * nicht baut.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.beziehungDetail.titel }
}

export default async function KontaktDetail({ params }: { params: Promise<{ id: string }> }) {
  const { t, intl } = await adminSprachKontext()
  const { id } = await params
  const store = getVertriebStore()
  if (!store) return <VertriebShell title={t.beziehungDetail.titel} available={false}>{null}</VertriebShell>

  let contact, enquiries, opportunities, activities, organisation, organisationChoices
  try {
    contact = await store.getContact(id)
    if (!contact) notFound()
    ;[enquiries, opportunities, activities, organisationChoices] = await Promise.all([
      store.leadsForContact(id),
      store.opportunitiesForContact(id),
      store.activities("contact", id),
      store.organisationChoices(),
    ])
    organisation = contact.organisationId ? await store.getOrganisation(contact.organisationId) : null
  } catch {
    return <VertriebShell title={t.beziehungDetail.titel} available={false}>{null}</VertriebShell>
  }

  const warm = contact.relationship === "warm" || contact.relationship === "eng"

  return (
    <VertriebShell
      title={contact.name}
      lead={contact.organisationName ?? undefined}
      meta={<Pill severity={warm ? "attention" : "neutral"}>{t.begriffe.beziehung[contact.relationship] ?? contact.relationship}</Pill>}
      available
    >
      <Link href="/admin/vertrieb/beziehungen" className="text-gold-text text-sm underline underline-offset-4">
        {t.beziehungDetail.alleBeziehungen}
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
        <div className="min-w-0">
          {/* ── Beziehung ── */}
          <section aria-labelledby="grad-titel">
            <SectionHeader id="grad-titel" title={t.beziehungDetail.beziehung} />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
              {t.beziehungDetail.beziehungHinweis}
            </p>
            <form action={setRelationship.bind(null, contact.id)} className="mt-4 flex flex-wrap items-end gap-4">
              <AdminField label={t.beziehungDetail.grad} htmlFor="relationship">
                <AdminSelect id="relationship" name="relationship" defaultValue={contact.relationship}>
                  {RELATIONSHIP_LEVELS.map((r) => (
                    <option key={r} value={r}>{t.begriffe.beziehung[r] ?? r}</option>
                  ))}
                </AdminSelect>
              </AdminField>
              <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.formular.speichern}</button>
            </form>
          </section>

          {/* ── Beziehungspflege ── */}
          <section aria-labelledby="pflege-titel" className="mt-10">
            <SectionHeader id="pflege-titel" title={t.beziehungDetail.naechsterSchritt} />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
              {t.beziehungDetail.naechsterSchrittHinweis}
            </p>
            <form action={setNextTouch.bind(null, contact.id)} className="mt-4 flex flex-wrap items-end gap-4">
              <AdminField label={t.beziehungDetail.wasAnsteht} htmlFor="nextTouch" className="flex-1 basis-64">
                <AdminInput id="nextTouch" name="nextTouch" defaultValue={contact.nextTouch ?? ""} placeholder={t.beziehungDetail.wasAnstehtPlatzhalter} />
              </AdminField>
              <AdminField label={t.beziehungDetail.bisWann} htmlFor="nextTouchAt">
                <AdminInput id="nextTouchAt" name="nextTouchAt" type="date" defaultValue={contact.nextTouchAt ?? ""} />
              </AdminField>
              <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.formular.speichern}</button>
            </form>
          </section>

          {/* ── Angaben ── */}
          <section aria-labelledby="angaben-titel" className="mt-10">
            <SectionHeader id="angaben-titel" title={t.beziehungDetail.angaben} />
            <form action={setContactDetails.bind(null, contact.id)} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-wrap gap-4">
                <AdminField label={t.beziehungDetail.name} htmlFor="name" className="flex-1 basis-56">
                  <AdminInput id="name" name="name" defaultValue={contact.name} required />
                </AdminField>
                <AdminField label={t.beziehungDetail.telefon} htmlFor="phone" className="flex-1 basis-44">
                  <AdminInput id="phone" name="phone" type="tel" defaultValue={contact.phone ?? ""} />
                </AdminField>
              </div>
              <div className="flex flex-wrap gap-4">
                <AdminField label={t.beziehungDetail.rolleImBetrieb} htmlFor="role" className="flex-1 basis-56">
                  <AdminInput id="role" name="role" defaultValue={contact.role ?? ""} placeholder={t.beziehungDetail.rollePlatzhalter} />
                </AdminField>
                <AdminField label={t.beziehungDetail.linkedinAdresse} htmlFor="linkedinUrl" className="flex-1 basis-64">
                  <AdminInput id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={contact.linkedinUrl ?? ""} placeholder={t.beziehungDetail.linkedinPlatzhalter} />
                </AdminField>
              </div>
              <AdminField label={t.beziehungDetail.interneNotiz} htmlFor="note">
                <AdminTextarea id="note" name="note" rows={3} defaultValue={contact.note ?? ""} />
              </AdminField>
              <div>
                <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.beziehungDetail.angabenSpeichern}</button>
              </div>
            </form>
          </section>

          {/* ── Zugehörigkeit ── */}
          <section aria-labelledby="zugehoerig-titel" className="mt-10">
            <SectionHeader id="zugehoerig-titel" title={t.beziehungDetail.gehoertZu} />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
              {t.beziehungDetail.gehoertZuHinweis}
            </p>
            <form action={setContactOrganisation.bind(null, contact.id)} className="mt-4 flex flex-wrap items-end gap-4">
              <AdminField label={t.beziehungDetail.organisation} htmlFor="organisationId" className="flex-1 basis-64">
                <AdminSelect id="organisationId" name="organisationId" defaultValue={contact.organisationId ?? ""}>
                  <option value="">{t.beziehungDetail.keineZuordnung}</option>
                  {organisationChoices.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </AdminSelect>
              </AdminField>
              <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.formular.speichern}</button>
            </form>
          </section>

          {/* ── Vorgänge ── */}
          <section aria-labelledby="chancen-titel" className="mt-10">
            <SectionHeader id="chancen-titel" title={t.beziehungDetail.verkaufschancen} count={`${opportunities.length}`} />
            {opportunities.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4 text-pretty">
                {t.beziehungDetail.keinVorgang}
              </p>
            ) : (
              <ul className="mt-4 flex flex-col">
                {opportunities.map((o) => (
                  <li key={o.id} className="border-line flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b py-3 last:border-b-0">
                    <Link href={`/admin/vertrieb/pipeline/${o.id}`} className="text-subhead min-w-0 flex-1 text-sm underline-offset-4 hover:underline">
                      {o.title}
                    </Link>
                    <Pill severity={o.status === "lost" ? "critical" : "neutral"}>{t.begriffe.stufe[o.status] ?? o.status}</Pill>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── Anfragen ── */}
          <section aria-labelledby="anfragen-titel" className="mt-10">
            <SectionHeader id="anfragen-titel" title={t.beziehungDetail.anfragen} count={`${enquiries.length}`} as="h3" />
            {enquiries.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4">{t.beziehungDetail.keineAnfrageVerknuepft}</p>
            ) : (
              <ul className="mt-4 flex flex-col">
                {enquiries.map((e) => (
                  <li key={e.id} className="border-line flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b py-3 last:border-b-0">
                    <Link href={`/admin/vertrieb/anfragen/${e.id}`} className="text-gold-text font-mono text-xs underline underline-offset-4">
                      {e.reference}
                    </Link>
                    <span className="text-muted-foreground min-w-0 flex-1 text-xs">{e.source}</span>
                    <span className="text-meta text-muted-foreground shrink-0 tabular-nums">{formatDate(e.createdAt, intl)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="mt-12">
            <ActivityLog entries={activities} t={t} intl={intl} />
          </div>
        </div>

        <aside className="min-w-0">
          <SectionHeader title={t.beziehungDetail.erreichbar} />
          <p className="type-small text-muted-foreground mt-3 text-pretty">
            {t.beziehungDetail.erreichbarHinweis}
          </p>
          <dl className="mt-4 flex flex-col gap-4">
            <DataValue label={t.beziehungDetail.email}>
              {/* Ein Kontakt aus der Bestandsliste hat oft keine. Ein
                  „mailto:"-Link ins Leere wäre schlimmer als ein Strich. */}
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="underline underline-offset-4">{contact.email}</a>
              ) : null}
            </DataValue>
            <DataValue label={t.beziehungDetail.telefon}>
              {contact.phone ? (
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">{contact.phone}</a>
              ) : null}
            </DataValue>
            <DataValue label={t.beziehungDetail.linkedIn}>
              {contact.linkedinUrl ? (
                <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  {t.beziehungDetail.profilOeffnen}
                </a>
              ) : null}
            </DataValue>
            <DataValue label={t.beziehungDetail.rolle}>{contact.role}</DataValue>
          </dl>

          {organisation && (
            <div className="mt-10">
              <SectionHeader title={t.beziehungDetail.organisationTitel} as="h3" />
              <dl className="mt-4 flex flex-col gap-4">
                <DataValue label={t.beziehungDetail.name}>
                  <Link href={`/admin/kunden/${organisation.id}`} className="text-gold-text underline underline-offset-4">
                    {organisation.name}
                  </Link>
                </DataValue>
                {/* Die dritte Achse — hier nur zu lesen. Geändert wird sie
                    bei der Organisation, weil sie ihr gehört, nicht dem
                    Menschen. */}
                <DataValue label={t.beziehungDetail.kundenhistorie}>{t.begriffe.lebenszyklus[organisation.lifecycle] ?? organisation.lifecycle}</DataValue>
                <DataValue label={t.beziehungDetail.ort}>{organisation.city}</DataValue>
                <DataValue label={t.beziehungDetail.website}>
                  {organisation.website ? (
                    <a href={organisation.website} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                      {organisation.website}
                    </a>
                  ) : null}
                </DataValue>
              </dl>
            </div>
          )}

          <div className="mt-10">
            <SectionHeader title={t.beziehungDetail.zeiten} as="h3" />
            <dl className="mt-4 flex flex-col gap-4">
              <DataValue label={t.beziehungDetail.letzteBeruehrung}>
                {contact.lastInteractionAt ? (
                  <time dateTime={contact.lastInteractionAt}>{formatDateTime(contact.lastInteractionAt, intl)}</time>
                ) : null}
              </DataValue>
              <DataValue label={t.beziehungDetail.erfasst}>
                <time dateTime={contact.createdAt}>{formatDateTime(contact.createdAt, intl)}</time>
              </DataValue>
            </dl>
          </div>
        </aside>
      </div>
    </VertriebShell>
  )
}

function formatDate(iso: string, locale: string): string {
  return datumAnzeige(iso, locale)
}
function formatDateTime(iso: string, locale: string): string {
  return datumAnzeige(iso, locale, "lang")
}
