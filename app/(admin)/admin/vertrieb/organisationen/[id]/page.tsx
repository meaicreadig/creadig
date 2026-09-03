import Link from "next/link"
import { notFound } from "next/navigation"

import {
  addLocation,
  removeLocation,
  saveLocation,
  setOrganisationDetails,
  setOrganisationLifecycle,
} from "@/app/(admin)/admin/vertrieb/actions"
import { ActivityLog } from "@/components/admin/activity-log"
import {
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  DataValue,
  Pill,
  SectionHeader,
  Surface,
} from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { SALES_LABELS_DE, getVertriebStore } from "@/lib/lead-store"
import { LIFECYCLE_LABELS, LIFECYCLE_NOTES, LIFECYCLE_STAGES, RELATIONSHIP_LABELS } from "@/lib/vertrieb"
import type { Location } from "@/lib/vertrieb"

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

export const metadata = { title: "Organisation" }

export default async function OrganisationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const store = getVertriebStore()
  if (!store) return <VertriebShell title="Organisation" available={false}>{null}</VertriebShell>

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
  } catch {
    return <VertriebShell title="Organisation" available={false}>{null}</VertriebShell>
  }

  const kunde = organisation.lifecycle === "kunde"

  return (
    <VertriebShell
      title={organisation.name}
      lead={[organisation.industry, organisation.city].filter(Boolean).join(" · ") || undefined}
      meta={<Pill severity={kunde ? "attention" : "neutral"}>{LIFECYCLE_LABELS[organisation.lifecycle]}</Pill>}
      available
    >
      <Link href="/admin/vertrieb/organisationen" className="text-gold-text text-sm underline underline-offset-4">
        ← Alle Organisationen
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
            <strong className="text-subhead">Nicht auf der Arbeitsfläche.</strong>{" "}
            {organisation.excludedReason} — dieser Datensatz erscheint in keiner
            Liste und in keiner Zählung. Gelöscht ist er nicht.
          </p>
        </Surface>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
        <div className="min-w-0">
          {/* ── Kundenhistorie ── */}
          <section aria-labelledby="historie-titel">
            <SectionHeader id="historie-titel" title="Kundenhistorie" />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
              {LIFECYCLE_NOTES[organisation.lifecycle]} Unabhängig von
              Beziehungsgrad und Pipeline.
            </p>
            <form action={setOrganisationLifecycle.bind(null, organisation.id)} className="mt-4 flex flex-wrap items-end gap-4">
              <AdminField label="Stufe" htmlFor="lifecycle">
                <AdminSelect id="lifecycle" name="lifecycle" defaultValue={organisation.lifecycle}>
                  {LIFECYCLE_STAGES.map((l) => (
                    <option key={l} value={l}>{LIFECYCLE_LABELS[l]}</option>
                  ))}
                </AdminSelect>
              </AdminField>
              <button type="submit" className="cta-quiet px-4 py-2 text-sm">Speichern</button>
            </form>
          </section>

          {/* ── Stammdaten ── */}
          <section aria-labelledby="stamm-titel" className="mt-10">
            <SectionHeader id="stamm-titel" title="Stammdaten" />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
              Ausser dem Namen ist nichts Pflicht. Was nicht belegt ist, bleibt
              leer — ein leeres Feld sagt „nachschlagen“, eine geratene Angabe
              sagt „erledigt“.
            </p>
            <form action={setOrganisationDetails.bind(null, organisation.id)} className="mt-4 flex flex-col gap-4">
              <AdminField label="Name" htmlFor="name">
                <AdminInput id="name" name="name" defaultValue={organisation.name} required />
              </AdminField>
              <div className="flex flex-wrap gap-4">
                <AdminField label="Branche oder Organisationsform" htmlFor="industry" className="flex-1 basis-56">
                  <AdminInput id="industry" name="industry" defaultValue={organisation.industry ?? ""} placeholder="frei formuliert" />
                </AdminField>
                <AdminField label="Website" htmlFor="website" className="flex-1 basis-56">
                  <AdminInput id="website" name="website" type="url" defaultValue={organisation.website ?? ""} placeholder="https://…" />
                </AdminField>
              </div>
              <div className="flex flex-wrap gap-4">
                <AdminField label="Allgemeine E-Mail" htmlFor="email" className="flex-1 basis-56">
                  <AdminInput id="email" name="email" type="email" defaultValue={organisation.email ?? ""} />
                </AdminField>
                <AdminField label="Telefon" htmlFor="phone" className="flex-1 basis-44">
                  <AdminInput id="phone" name="phone" type="tel" defaultValue={organisation.phone ?? ""} />
                </AdminField>
              </div>
              <AdminField label="Straße und Hausnummer" htmlFor="street">
                <AdminInput id="street" name="street" defaultValue={organisation.street ?? ""} />
              </AdminField>
              <div className="flex flex-wrap gap-4">
                <AdminField label="PLZ" htmlFor="postalCode" className="basis-28">
                  <AdminInput id="postalCode" name="postalCode" defaultValue={organisation.postalCode ?? ""} />
                </AdminField>
                <AdminField label="Ort" htmlFor="city" className="flex-1 basis-44">
                  <AdminInput id="city" name="city" defaultValue={organisation.city ?? ""} />
                </AdminField>
                <AdminField label="Land" htmlFor="country" className="flex-1 basis-40">
                  <AdminInput id="country" name="country" defaultValue={organisation.country ?? ""} />
                </AdminField>
              </div>
              <AdminField label="LinkedIn-Adresse" htmlFor="linkedinUrl">
                <AdminInput id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={organisation.linkedinUrl ?? ""} placeholder="https://www.linkedin.com/company/…" />
              </AdminField>
              <AdminField label="Interne Notiz" htmlFor="note">
                <AdminTextarea id="note" name="note" rows={4} defaultValue={organisation.note ?? ""} />
              </AdminField>
              <div>
                <button type="submit" className="cta-quiet px-4 py-2 text-sm">Stammdaten speichern</button>
              </div>
            </form>
          </section>

          {/* ── Standorte ── */}
          <section aria-labelledby="standorte-titel" className="mt-12">
            <SectionHeader id="standorte-titel" title="Standorte" count={locations.length > 0 ? `${locations.length}` : undefined} />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
              Mehrere Adressen bleiben ein Betrieb. Vier Standorte als vier
              Organisationen zu führen würde jede Zählung vervierfachen — und
              die Frage, mit wem man zusammengearbeitet hat, viermal
              beantworten.
            </p>

            {locations.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4">
                Kein eigener Standort erfasst. Die Anschrift oben gilt.
              </p>
            ) : (
              <ul className="mt-6 flex flex-col gap-6">
                {locations.map((location) => (
                  <li key={location.id}>
                    <LocationForm organisationId={organisation.id} location={location} />
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8">
              <SectionHeader title="Standort hinzufügen" as="h3" />
              <form action={addLocation.bind(null, organisation.id)} className="mt-4 flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  <AdminField label="Bezeichnung" htmlFor="neu-label" className="flex-1 basis-56">
                    <AdminInput id="neu-label" name="label" placeholder="z. B. Basel Klybeck" required />
                  </AdminField>
                  <AdminField label="Straße und Hausnummer" htmlFor="neu-street" className="flex-1 basis-56">
                    <AdminInput id="neu-street" name="street" />
                  </AdminField>
                </div>
                <div className="flex flex-wrap gap-4">
                  <AdminField label="PLZ" htmlFor="neu-plz" className="basis-28">
                    <AdminInput id="neu-plz" name="postalCode" />
                  </AdminField>
                  <AdminField label="Ort" htmlFor="neu-city" className="flex-1 basis-44">
                    <AdminInput id="neu-city" name="city" />
                  </AdminField>
                  <AdminField label="Land" htmlFor="neu-country" className="flex-1 basis-40">
                    <AdminInput id="neu-country" name="country" />
                  </AdminField>
                </div>
                <div>
                  <button type="submit" className="cta-quiet px-4 py-2 text-sm">Standort anlegen</button>
                </div>
              </form>
            </div>
          </section>

          {/* ── Verkaufschancen ── */}
          <section aria-labelledby="org-chancen-titel" className="mt-12">
            <SectionHeader id="org-chancen-titel" title="Verkaufschancen" count={`${opportunities.length}`} />
            {opportunities.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4 text-pretty">
                Kein Vorgang. Auch bei einem belegten Kunden ist das keine
                Lücke — aus „war einmal Kunde“ folgt kein laufendes Geschäft.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col">
                {opportunities.map((o) => (
                  <li key={o.id} className="border-line flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b py-3 last:border-b-0">
                    <Link href={`/admin/vertrieb/pipeline/${o.id}`} className="text-subhead min-w-0 flex-1 text-sm underline-offset-4 hover:underline">
                      {o.title}
                    </Link>
                    <Pill severity={o.status === "lost" ? "critical" : "neutral"}>{SALES_LABELS_DE[o.status]}</Pill>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="mt-12">
            <ActivityLog entries={activities} />
          </div>
        </div>

        <aside className="min-w-0">
          <SectionHeader title="Erreichbar" />
          <p className="type-small text-muted-foreground mt-3 text-pretty">
            Nur was hinterlegt ist. Kein Weg wird angeboten, den es nicht gibt.
          </p>
          <dl className="mt-4 flex flex-col gap-4">
            <DataValue label="Website">
              {organisation.website ? (
                <a href={organisation.website} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  {organisation.website.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
            </DataValue>
            <DataValue label="E-Mail">
              {organisation.email ? (
                <a href={`mailto:${organisation.email}`} className="underline underline-offset-4">{organisation.email}</a>
              ) : null}
            </DataValue>
            <DataValue label="Telefon">
              {organisation.phone ? (
                <a href={`tel:${organisation.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
                  {organisation.phone}
                </a>
              ) : null}
            </DataValue>
            <DataValue label="LinkedIn">
              {organisation.linkedinUrl ? (
                <a href={organisation.linkedinUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  Seite öffnen
                </a>
              ) : null}
            </DataValue>
            <DataValue label="Anschrift">
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
            <SectionHeader title="Ansprechpartner" as="h3" count={contacts.length > 0 ? `${contacts.length}` : undefined} />
            {contacts.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4 text-pretty">
                Keiner hinterlegt. Für die Bestandskunden wurde bewusst keiner
                recherchiert — auffindbar heisst nicht speicherbar.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col">
                {contacts.map((c) => (
                  <li key={c.id} className="border-line border-b py-3 last:border-b-0">
                    <Link href={`/admin/vertrieb/beziehungen/${c.id}`} className="text-gold-text text-sm underline underline-offset-4">
                      {c.name}
                    </Link>
                    <span className="text-muted-foreground block text-xs">
                      {[c.role, RELATIONSHIP_LABELS[c.relationship]].filter(Boolean).join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-10">
            <SectionHeader title="Anfragen" as="h3" count={enquiries.length > 0 ? `${enquiries.length}` : undefined} />
            {enquiries.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4">Keine Anfrage verknüpft.</p>
            ) : (
              <ul className="mt-4 flex flex-col">
                {enquiries.map((e) => (
                  <li key={e.id} className="border-line flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b py-3 last:border-b-0">
                    <Link href={`/admin/vertrieb/anfragen/${e.id}`} className="text-gold-text font-mono text-xs underline underline-offset-4">
                      {e.reference}
                    </Link>
                    <span className="text-meta text-muted-foreground shrink-0 tabular-nums">
                      {formatDate(e.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-10">
            <SectionHeader title="Herkunft" as="h3" />
            <dl className="mt-4 flex flex-col gap-4">
              {/* Woher der Datensatz stammt. Kein Zierfeld: Bei einem
                  eingespielten Bestandskunden steht die offene Frage zur
                  Identität in der Notiz, und dieser Hinweis sagt, warum. */}
              <DataValue label="Erfasst über">
                {organisation.importKey ? "Bestandsliste des Eigentümers" : "Anfrage über die Website"}
              </DataValue>
              <DataValue label="Angelegt">
                <time dateTime={organisation.createdAt}>{formatDateTime(organisation.createdAt)}</time>
              </DataValue>
            </dl>
          </div>
        </aside>
      </div>
    </VertriebShell>
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
function LocationForm({ organisationId, location }: { organisationId: string; location: Location }) {
  return (
    <Surface>
      <form action={saveLocation.bind(null, organisationId, location.id)} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <AdminField label="Bezeichnung" htmlFor={`label-${location.id}`} className="flex-1 basis-52">
            <AdminInput id={`label-${location.id}`} name="label" defaultValue={location.label} required />
          </AdminField>
          <AdminField label="Straße und Hausnummer" htmlFor={`street-${location.id}`} className="flex-1 basis-52">
            <AdminInput id={`street-${location.id}`} name="street" defaultValue={location.street ?? ""} />
          </AdminField>
        </div>
        <div className="flex flex-wrap gap-4">
          <AdminField label="PLZ" htmlFor={`plz-${location.id}`} className="basis-28">
            <AdminInput id={`plz-${location.id}`} name="postalCode" defaultValue={location.postalCode ?? ""} />
          </AdminField>
          <AdminField label="Ort" htmlFor={`city-${location.id}`} className="flex-1 basis-40">
            <AdminInput id={`city-${location.id}`} name="city" defaultValue={location.city ?? ""} />
          </AdminField>
          <AdminField label="Land" htmlFor={`country-${location.id}`} className="flex-1 basis-36">
            <AdminInput id={`country-${location.id}`} name="country" defaultValue={location.country ?? ""} />
          </AdminField>
        </div>
        <div className="flex flex-wrap gap-4">
          <AdminField label="Telefon" htmlFor={`phone-${location.id}`} className="flex-1 basis-40">
            <AdminInput id={`phone-${location.id}`} name="phone" type="tel" defaultValue={location.phone ?? ""} />
          </AdminField>
          <AdminField label="E-Mail" htmlFor={`mail-${location.id}`} className="flex-1 basis-52">
            <AdminInput id={`mail-${location.id}`} name="email" type="email" defaultValue={location.email ?? ""} />
          </AdminField>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="cta-quiet px-4 py-2 text-sm">Standort speichern</button>
        </div>
      </form>

      <form action={removeLocation.bind(null, organisationId, location.id)} className="mt-3">
        <button type="submit" className="text-muted-foreground hover:text-destructive text-xs underline underline-offset-4">
          Standort entfernen
        </button>
      </form>
    </Surface>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })
}
function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}
