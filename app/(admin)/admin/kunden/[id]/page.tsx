import Link from "next/link"
import { notFound } from "next/navigation"

import { istNavigationsfehler } from "@/lib/navigationsfehler"

import {
  addLocation,
  removeLocation,
  saveLocation,
  setOrganisationDetails,
  setOrganisationLifecycle,
} from "@/app/(admin)/admin/vertrieb/actions"
import { ActivityLog } from "@/components/admin/activity-log"
import type { AdminTexte } from "@/lib/admin-i18n"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import {
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  Pill,
  SectionHeader,
  Surface,
} from "@/components/admin/primitives"
import {
  DataValue,
} from "@/components/admin/primitives-i18n"
import { KundenShell } from "@/components/admin/kunden-shell"
import { getVertriebStore } from "@/lib/lead-store"
import { LIFECYCLE_NOTES, LIFECYCLE_STAGES } from "@/lib/vertrieb"
import type { Location } from "@/lib/vertrieb"
import { datumAnzeige } from "@/lib/geschaeftszeit"

/**
 * Eine Organisation.
 *
 * ---------------------------------------------------------------------------
 * DREI ACHSEN, DREI ORTE
 * Hier steht die Kundenhistorie — belegte Geschäftsbeziehung, nie Kunde,
 * ehemaliger Kunde. Der Beziehungsgrad steht beim Menschen, der Vorgangsstand
 * bei der Verkaufschance. Keine der drei wird aus einer der anderen
 * abgeleitet: Ein Kunde kann kalt sein, ein warmer Kontakt nie beauftragt
 * haben, und beides schliesst eine offene Chance weder ein noch aus.
 *
 * ---------------------------------------------------------------------------
 * WARUM FAST NICHTS PFLICHT IST
 * Ein Pflichtfeld erzwingt keine Kenntnis, es erzwingt eine Eingabe. Wer die
 * Anschrift nicht kennt und ein Feld ausfüllen MUSS, trägt etwas
 * Plausibles ein — und aus einer Lücke wird eine Falschangabe, die niemand
 * mehr als solche erkennt. Leer bleibt deshalb leer.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.kundenDetail.titel }
}

export default async function OrganisationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { t, intl } = await adminSprachKontext()
  const { id } = await params
  const store = getVertriebStore()
  if (!store) return <KundenShell title={t.kundenDetail.kundeTitel} available={false}>{null}</KundenShell>

  let organisation, locations, contacts, opportunities, enquiries, activities
  try {
    organisation = await store.getOrganisation(id)
    if (!organisation) notFound()
    ;[locations, contacts, opportunities, enquiries, activities] = await Promise.all([
      store.listLocations(id),
      store.contactsForOrganisation(id),
      store.opportunitiesForOrganisation(id),
      store.leadsForOrganisation(id),
      store.activities("organisation", id),
    ])
  } catch (error) {
    /* ADM-07 · H27 — `notFound()` wirft auch; wer es faengt, faengt die Navigation. */
    if (istNavigationsfehler(error)) throw error

    return <KundenShell title={t.kundenDetail.kundeTitel} available={false}>{null}</KundenShell>
  }

  const kunde = organisation.lifecycle === "kunde"

  return (
    <KundenShell
      title={organisation.name}
      lead={[organisation.industry, organisation.city].filter(Boolean).join(" · ") || undefined}
      meta={<Pill severity={kunde ? "attention" : "neutral"}>{t.begriffe.lebenszyklus[organisation.lifecycle] ?? organisation.lifecycle}</Pill>}
      available
    >
      <Link href="/admin/kunden" className="text-gold-text text-sm underline underline-offset-4">
        {t.kundenDetail.alleKunden}
      </Link>

      {/*
       * Ein ausgeschlossener Datensatz bleibt erreichbar — er verschwindet nur
       * aus den Listen. Unsichtbar machen und unauffindbar machen sind zwei
       * verschiedene Dinge; wer einem Verweis folgt, soll sehen, was dort ist,
       * und warum es nicht mitgezählt wird.
       */}
      {organisation.excludedReason && (
        <Surface className="border-line-strong mt-6">
          <p className="type-small text-pretty">
            <strong className="text-subhead">{t.kundenDetail.nichtArbeitsflaecheTitel}</strong>{" "}
            {organisation.excludedReason} — {t.kundenDetail.nichtArbeitsflaecheText}
          </p>
        </Surface>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
        <div className="min-w-0">
          {/* ── Kundenhistorie ── */}
          <section aria-labelledby="historie-titel">
            <SectionHeader id="historie-titel" title={t.kundenDetail.kundenhistorie} />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
              {LIFECYCLE_NOTES[organisation.lifecycle]} Unabhängig von
              {" "}{t.kundenDetail.kundenhistorieZusatz}
            </p>
            <form action={setOrganisationLifecycle.bind(null, organisation.id)} className="mt-4 flex flex-wrap items-end gap-4">
              <AdminField label={t.kundenDetail.stufe} htmlFor="lifecycle">
                <AdminSelect id="lifecycle" name="lifecycle" defaultValue={organisation.lifecycle}>
                  {LIFECYCLE_STAGES.map((l) => (
                    <option key={l} value={l}>{t.begriffe.lebenszyklus[l] ?? l}</option>
                  ))}
                </AdminSelect>
              </AdminField>
              <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.formular.speichern}</button>
            </form>
          </section>

          {/* ── Stammdaten ── */}
          <section aria-labelledby="stamm-titel" className="mt-10">
            <SectionHeader id="stamm-titel" title={t.kundenDetail.stammdaten} />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
              {t.kundenDetail.stammdatenHinweis}
            </p>
            <form action={setOrganisationDetails.bind(null, organisation.id)} className="mt-4 flex flex-col gap-4">
              <AdminField label={t.kundenDetail.name} htmlFor="name">
                <AdminInput id="name" name="name" defaultValue={organisation.name} required />
              </AdminField>
              <div className="flex flex-wrap gap-4">
                <AdminField label={t.kundenDetail.branche} htmlFor="industry" className="flex-1 basis-56">
                  <AdminInput id="industry" name="industry" defaultValue={organisation.industry ?? ""} placeholder={t.kundenDetail.branchePlatzhalter} />
                </AdminField>
                <AdminField label={t.kundenDetail.website} htmlFor="website" className="flex-1 basis-56">
                  <AdminInput id="website" name="website" type="url" defaultValue={organisation.website ?? ""} placeholder="https://…" />
                </AdminField>
              </div>
              <div className="flex flex-wrap gap-4">
                <AdminField label={t.kundenDetail.email} htmlFor="email" className="flex-1 basis-56">
                  <AdminInput id="email" name="email" type="email" defaultValue={organisation.email ?? ""} />
                </AdminField>
                <AdminField label={t.kundenDetail.telefon} htmlFor="phone" className="flex-1 basis-44">
                  <AdminInput id="phone" name="phone" type="tel" defaultValue={organisation.phone ?? ""} />
                </AdminField>
              </div>
              <AdminField label={t.kundenDetail.strasse} htmlFor="street">
                <AdminInput id="street" name="street" defaultValue={organisation.street ?? ""} />
              </AdminField>
              <div className="flex flex-wrap gap-4">
                <AdminField label={t.kundenDetail.plz} htmlFor="postalCode" className="basis-28">
                  <AdminInput id="postalCode" name="postalCode" defaultValue={organisation.postalCode ?? ""} />
                </AdminField>
                <AdminField label={t.kundenDetail.ort} htmlFor="city" className="flex-1 basis-44">
                  <AdminInput id="city" name="city" defaultValue={organisation.city ?? ""} />
                </AdminField>
                <AdminField label={t.kundenDetail.land} htmlFor="country" className="flex-1 basis-40">
                  <AdminInput id="country" name="country" defaultValue={organisation.country ?? ""} />
                </AdminField>
              </div>
              <AdminField label={t.kundenDetail.linkedinAdresse} htmlFor="linkedinUrl">
                <AdminInput id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={organisation.linkedinUrl ?? ""} placeholder={t.kundenDetail.linkedinPlatzhalter} />
              </AdminField>
              <AdminField label={t.kundenDetail.interneNotiz} htmlFor="note">
                <AdminTextarea id="note" name="note" rows={4} defaultValue={organisation.note ?? ""} />
              </AdminField>
              <div>
                <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.kundenDetail.stammdatenSpeichern}</button>
              </div>
            </form>
          </section>

          {/* ── Standorte ── */}
          <section aria-labelledby="standorte-titel" className="mt-12">
            <SectionHeader id="standorte-titel" title={t.kundenDetail.standorte} count={locations.length > 0 ? `${locations.length}` : undefined} />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
              {t.kundenDetail.standorteHinweis}
            </p>

            {locations.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4">
                {t.kundenDetail.keinStandort}
              </p>
            ) : (
              <ul className="mt-6 flex flex-col gap-6">
                {locations.map((location) => (
                  <li key={location.id}>
                    <LocationForm organisationId={organisation.id} location={location} texts={t.kundenDetail} />
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8">
              <SectionHeader title={t.kundenDetail.standortHinzufuegen} as="h3" />
              <form action={addLocation.bind(null, organisation.id)} className="mt-4 flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  <AdminField label={t.kundenDetail.bezeichnung} htmlFor="neu-label" className="flex-1 basis-56">
                    <AdminInput id="neu-label" name="label" placeholder={t.kundenDetail.bezeichnungPlatzhalter} required />
                  </AdminField>
                  <AdminField label={t.kundenDetail.strasse} htmlFor="neu-street" className="flex-1 basis-56">
                    <AdminInput id="neu-street" name="street" />
                  </AdminField>
                </div>
                <div className="flex flex-wrap gap-4">
                  <AdminField label={t.kundenDetail.plz} htmlFor="neu-plz" className="basis-28">
                    <AdminInput id="neu-plz" name="postalCode" />
                  </AdminField>
                  <AdminField label={t.kundenDetail.ort} htmlFor="neu-city" className="flex-1 basis-44">
                    <AdminInput id="neu-city" name="city" />
                  </AdminField>
                  <AdminField label={t.kundenDetail.land} htmlFor="neu-country" className="flex-1 basis-40">
                    <AdminInput id="neu-country" name="country" />
                  </AdminField>
                </div>
                <div>
                  <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.kundenDetail.standortAnlegen}</button>
                </div>
              </form>
            </div>
          </section>

          {/* ── Verkaufschancen ── */}
          <section aria-labelledby="org-chancen-titel" className="mt-12">
            <SectionHeader id="org-chancen-titel" title={t.kundenDetail.verkaufschancen} count={`${opportunities.length}`} />
            {opportunities.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4 text-pretty">
                {t.kundenDetail.keinVorgang}
              </p>
            ) : (
              <ul className="mt-4 flex flex-col">
                {opportunities.map((o) => (
                  <li key={o.id} className="border-line flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b py-3 last:border-b-0">
                    <span className="min-w-0 flex-1">
                      <Link href={`/admin/vertrieb/pipeline/${o.id}`} className="text-subhead block text-sm underline-offset-4 hover:underline">
                        {o.title}
                      </Link>
                      {/*
                        Der nächste Schritt steht beim Vorgang, weil er dort
                        gepflegt wird. Hier wird er nur gezeigt — es entsteht
                        keine zweite Stelle, an der man ihn ändern könnte, und
                        damit auch keine doppelte Datenpflege.
                      */}
                      {o.nextAction ? (
                        <span className="text-muted-foreground mt-0.5 block text-xs">
                          {t.kundenDetail.naechsterSchritt}: {o.nextAction}
                          {o.nextActionAt ? ` · ${formatDate(o.nextActionAt, intl)}` : ""}
                        </span>
                      ) : (
                        <span className="text-muted-foreground mt-0.5 block text-xs">
                          {t.kundenDetail.keinNaechsterSchritt}
                        </span>
                      )}
                    </span>
                    <Pill severity={o.status === "lost" ? "critical" : "neutral"}>{t.begriffe.stufe[o.status] ?? o.status}</Pill>
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
          <SectionHeader title={t.kundenDetail.erreichbar} />
          <p className="type-small text-muted-foreground mt-3 text-pretty">
            {t.kundenDetail.erreichbarHinweis}
          </p>
          <dl className="mt-4 flex flex-col gap-4">
            <DataValue label={t.kundenDetail.website}>
              {organisation.website ? (
                <a href={organisation.website} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  {organisation.website.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
            </DataValue>
            <DataValue label={t.kundenDetail.email}>
              {organisation.email ? (
                <a href={`mailto:${organisation.email}`} className="underline underline-offset-4">{organisation.email}</a>
              ) : null}
            </DataValue>
            <DataValue label={t.kundenDetail.telefon}>
              {organisation.phone ? (
                <a href={`tel:${organisation.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
                  {organisation.phone}
                </a>
              ) : null}
            </DataValue>
            <DataValue label={t.kundenDetail.linkedinAdresse}>
              {organisation.linkedinUrl ? (
                <a href={organisation.linkedinUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  {t.kundenDetail.seiteOeffnen}
                </a>
              ) : null}
            </DataValue>
            <DataValue label={t.kundenDetail.anschrift}>
              {organisation.street || organisation.city ? (
                <span className="block whitespace-pre-line">
                  {[organisation.street, [organisation.postalCode, organisation.city].filter(Boolean).join(" "), organisation.country]
                    .filter(Boolean)
                    .join("\n")}
                </span>
              ) : null}
            </DataValue>
          </dl>

          <div className="mt-10">
            <SectionHeader title={t.kundenDetail.ansprechpartner} as="h3" count={contacts.length > 0 ? `${contacts.length}` : undefined} />
            {contacts.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4 text-pretty">
                {t.kundenDetail.keinAnsprechpartner}
              </p>
            ) : (
              <ul className="mt-4 flex flex-col">
                {contacts.map((c) => (
                  <li key={c.id} className="border-line border-b py-3 last:border-b-0">
                    <Link href={`/admin/vertrieb/beziehungen/${c.id}`} className="text-gold-text text-sm underline underline-offset-4">
                      {c.name}
                    </Link>
                    <span className="text-muted-foreground block text-xs">
                      {[c.role, t.begriffe.beziehung[c.relationship] ?? c.relationship].filter(Boolean).join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-10">
            <SectionHeader title={t.kundenDetail.anfragen} as="h3" count={enquiries.length > 0 ? `${enquiries.length}` : undefined} />
            {enquiries.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4">{t.kundenDetail.keineAnfrageVerknuepft}</p>
            ) : (
              <ul className="mt-4 flex flex-col">
                {enquiries.map((e) => (
                  <li key={e.id} className="border-line flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b py-3 last:border-b-0">
                    <Link href={`/admin/vertrieb/anfragen/${e.id}`} className="text-gold-text font-mono text-xs underline underline-offset-4">
                      {e.reference}
                    </Link>
                    <span className="text-meta text-muted-foreground shrink-0 tabular-nums">
                      {formatDate(e.createdAt, intl)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-10">
            <SectionHeader title={t.kundenDetail.herkunft} as="h3" />
            <dl className="mt-4 flex flex-col gap-4">
              {/* Woher der Datensatz stammt. Kein Zierfeld: Bei einem
                  eingespielten Bestandskunden steht die offene Frage zur
                  Identität in der Notiz, und dieser Hinweis sagt, warum. */}
              <DataValue label={t.kundenDetail.erfasstUeber}>
                {organisation.importKey ? t.kundenDetail.bestandsliste : t.kundenDetail.websiteAnfrage}
              </DataValue>
              <DataValue label={t.kundenDetail.angelegt}>
                <time dateTime={organisation.createdAt}>{formatDateTime(organisation.createdAt, intl)}</time>
              </DataValue>
            </dl>
          </div>
        </aside>
      </div>
    </KundenShell>
  )
}

/**
 * Ein Standort, änderbar an Ort und Stelle.
 *
 * Kein Dialogfenster: Ein Bestätigungsdialog blockiert die Seite und ist in
 * dieser Oberfläche nicht vorgesehen. Der Löschknopf steht deshalb direkt an
 * seinem Standort — er löscht genau eine Adresse, und an einer Adresse hängt
 * weder eine Anfrage noch ein Vorgang.
 */
function LocationForm({
  organisationId,
  location,
  texts,
}: {
  organisationId: string
  location: Location
  texts: AdminTexte["kundenDetail"]
}) {
  return (
    <Surface>
      <form action={saveLocation.bind(null, organisationId, location.id)} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <AdminField label={texts.bezeichnung} htmlFor={`label-${location.id}`} className="flex-1 basis-52">
            <AdminInput id={`label-${location.id}`} name="label" defaultValue={location.label} required />
          </AdminField>
          <AdminField label={texts.strasse} htmlFor={`street-${location.id}`} className="flex-1 basis-52">
            <AdminInput id={`street-${location.id}`} name="street" defaultValue={location.street ?? ""} />
          </AdminField>
        </div>
        <div className="flex flex-wrap gap-4">
          <AdminField label={texts.plz} htmlFor={`plz-${location.id}`} className="basis-28">
            <AdminInput id={`plz-${location.id}`} name="postalCode" defaultValue={location.postalCode ?? ""} />
          </AdminField>
          <AdminField label={texts.ort} htmlFor={`city-${location.id}`} className="flex-1 basis-40">
            <AdminInput id={`city-${location.id}`} name="city" defaultValue={location.city ?? ""} />
          </AdminField>
          <AdminField label={texts.land} htmlFor={`country-${location.id}`} className="flex-1 basis-36">
            <AdminInput id={`country-${location.id}`} name="country" defaultValue={location.country ?? ""} />
          </AdminField>
        </div>
        <div className="flex flex-wrap gap-4">
          <AdminField label={texts.telefon} htmlFor={`phone-${location.id}`} className="flex-1 basis-40">
            <AdminInput id={`phone-${location.id}`} name="phone" type="tel" defaultValue={location.phone ?? ""} />
          </AdminField>
          <AdminField label={texts.email} htmlFor={`mail-${location.id}`} className="flex-1 basis-52">
            <AdminInput id={`mail-${location.id}`} name="email" type="email" defaultValue={location.email ?? ""} />
          </AdminField>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="cta-quiet px-4 py-2 text-sm">{texts.standortSpeichern}</button>
        </div>
      </form>

      <form action={removeLocation.bind(null, organisationId, location.id)} className="mt-3">
        <button type="submit" className="text-muted-foreground hover:text-destructive text-xs underline underline-offset-4">
          {texts.standortEntfernen}
        </button>
      </form>
    </Surface>
  )
}

function formatDate(iso: string, locale: string): string {
  return datumAnzeige(iso, locale)
}
function formatDateTime(iso: string, locale: string): string {
  return datumAnzeige(iso, locale, "lang")
}
