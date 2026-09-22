import Link from "next/link"
import { notFound } from "next/navigation"

import {
  addResearchEvidence,
  decideResearchContact,
  setResearchCase,
  setResearchPerson,
} from "@/app/(admin)/admin/vertrieb/actions"
import {
  AdminField,
  AdminInput,
  AdminSelect,
  Pill,
  SectionHeader,
} from "@/components/admin/primitives"
import {
  DataValue,
} from "@/components/admin/primitives-i18n"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { getVertriebStore } from "@/lib/lead-store"
import {
  EXCLUSIONS,
  RESEARCH_STATES,
  SIGNALS,
  SOURCES,
  abbruch,
  alterInTagen,
  einordnung,
  mehrfachBelegt,
  type SourceKind,
} from "@/lib/research"
import {
  CONTACT_SOURCES,
  DECISIONS,
  ansprachedeckung,
  kontaktLage,
} from "@/lib/contact-access"
import { datumAnzeige } from "@/lib/geschaeftszeit"

/**
 * Vertrieb · Recherche · ein Betrieb.
 *
 * ---------------------------------------------------------------------------
 * DIE SEITE ZEIGT DREI DINGE GETRENNT
 *
 *   BELEG      was beobachtet wurde, mit Fundstelle — anklickbar
 *   URTEIL     was daraus folgt, mit Gruenden im Klartext
 *   OFFEN      was niemand nachgesehen hat
 *
 * Das dritte ist das wichtigste und faellt in den meisten Werkzeugen weg:
 * Ein leeres Feld sieht aus wie eine Antwort. Hier steht, dass niemand
 * nachgesehen hat.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.rechercheDetail.titel }
}

function fmt(iso: string, intl: string): string {
  return datumAnzeige(iso, intl, "lang")
}

export default async function RechercheDetail({ params }: { params: Promise<{ id: string }> }) {
  const { t, intl } = await adminSprachKontext()
  const { id } = await params
  const store = getVertriebStore()
  /*
   * ADM-02 · A19 — ohne Speicher ist ein Fall nicht „nicht gefunden“: Es wurde
   * gar nicht gesucht. Und ein Speicherfehler ist keine fehlende Kennung.
   */
  const nichtVerfuegbar = (
    <VertriebShell title={t.rechercheDetail.titel} available={false}>
      {null}
    </VertriebShell>
  )
  if (!store) return nichtVerfuegbar

  const fall = await store.getResearch(id).catch(() => undefined)
  if (fall === undefined) return nichtVerfuegbar
  if (!fall) notFound()

  const e = einordnung(fall)
  const stop = abbruch(fall)
  const tage = alterInTagen(fall)
  const mehrfach = mehrfachBelegt(fall)
  /*
    GATE 11 — Person, Zugang, Anlass und Entscheidung. Vier Achsen, die
    einzeln beantwortet werden; keine wird zur anderen.
  */
  const person = await store.getResearchPerson(fall.id)
  const kandidaten = await store.listOrganisationContacts(fall.organisationId)
  const lage = kontaktLage(fall, person)
  const deckung = ansprachedeckung(fall, person)

  const gueltig = fall.evidence.filter((x) => !x.supersededBy)
  const abgeloest = fall.evidence.filter((x) => x.supersededBy)
  const belegteSignale = new Set(gueltig.filter((x) => x.kind === "signal").map((x) => x.ref))

  return (
    <VertriebShell
      title={fall.organisationName}
      lead={t.rechercheDetail.statusBedeutung[fall.status] ?? fall.status}
      available
    >
      <Link href="/admin/vertrieb/recherche" className="type-small text-gold-text underline underline-offset-4">
        {t.rechercheDetail.zurListe}
      </Link>

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          {/* ── Urteil ── */}
          <section aria-labelledby="urteil">
            <SectionHeader id="urteil" title={t.rechercheDetail.urteil} />
            <div className="mt-5 flex flex-col gap-5">
              {([
                ["passung", e.passung],
                ["zugang", e.zugang],
                ["bedienbarkeit", e.bedienbarkeit],
                ["kaufkraft", e.kaufkraft],
              ] as const).map(([name, achse]) => (
                <div key={name}>
                  <span className="flex items-center gap-3">
                    <span className="eyebrow text-muted-foreground w-32 shrink-0">
                      {t.rechercheDetail.achsen[name] ?? name}
                    </span>
                    <Pill severity={achse.urteil === "passend" ? "attention" : "neutral"}>
                      {t.rechercheDetail.urteile[achse.urteil] ?? achse.urteil}
                    </Pill>
                  </span>
                  <ul className="mt-2 ms-32 flex flex-col gap-1">
                    {achse.gruende.map((g) => (
                      <li key={g} className="type-small text-muted-foreground text-pretty">{g}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-gold-text type-small border-line mt-6 border-t pt-5">{stop.warum}</p>
          </section>

          {/* ── Belege ── */}
          <section aria-labelledby="belege" className="mt-12">
            <SectionHeader id="belege" title={t.rechercheDetail.belege} />
            {mehrfach.length > 0 && (
              <p className="text-gold-text type-small mt-4 text-pretty">
                {t.rechercheDetail.mehrfachBelegtHinweis(mehrfach.map((k) => k.ref).join(", "))}
              </p>
            )}
            {gueltig.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4">
                {t.rechercheDetail.keinBeleg}
              </p>
            ) : (
              <ul className="mt-4 flex flex-col">
                {gueltig.map((b) => (
                  <li key={b.id} className="border-line border-b py-4">
                    <span className="flex flex-wrap items-baseline gap-3">
                      <Pill severity="neutral">{t.rechercheDetail.belegArten[b.kind] ?? b.kind}</Pill>
                      {b.ref && <span className="text-meta text-gold-text">{b.ref}</span>}
                      <span className="text-meta text-muted-foreground">
                        {(t.rechercheDetail.quellen[b.sourceKind] ?? SOURCES[b.sourceKind].label)} · {fmt(b.observedAt, intl)}
                      </span>
                    </span>
                    <p className="type-small text-foreground mt-2 text-pretty">{b.claim}</p>
                    <a
                      href={b.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-meta text-muted-foreground mt-1 block truncate underline underline-offset-4"
                    >
                      {b.sourceUrl}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {abgeloest.length > 0 && (
              <details className="mt-5">
                <summary className="type-small text-muted-foreground cursor-pointer">
                  {t.rechercheDetail.abgeloesteBelege(abgeloest.length)}
                </summary>
                <ul className="mt-3 flex flex-col gap-2">
                  {abgeloest.map((b) => (
                    <li key={b.id} className="type-small text-muted-foreground line-through">
                      {b.claim}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>

          {/* ── Kontakt & Zugang ──────────────────────────────────────────
              GATE 11 — der Mensch und der Weg zu ihm.

              „bereit fuer Kontakt" ist ein Zustand des WISSENS. Ansprechen
              ist eine ENTSCHEIDUNG. Zwischen beiden steht dieser Abschnitt,
              und er entscheidet nichts von selbst. */}
          <section aria-labelledby="kontakt" className="mt-12">
            <SectionHeader id="kontakt" title={t.rechercheDetail.kontaktZugang} />

            <div className="mt-5 flex flex-col gap-4">
              {([
                ["passung", lage.passung],
                ["person", lage.person],
                ["zugang", lage.zugang],
                ["anlass", lage.anlass],
              ] as const).map(([name, achse]) => (
                <div key={name} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                  <span className="eyebrow text-muted-foreground sm:w-24 sm:shrink-0">
                    {t.rechercheDetail.achsen[name] ?? name}
                  </span>
                  <span className="min-w-0">
                    <Pill severity={achse.urteil === "ja" ? "attention" : "neutral"}>
                      {t.rechercheDetail.urteile[achse.urteil] ?? achse.urteil}
                    </Pill>
                    <span className="type-small text-muted-foreground ms-3 text-pretty">{achse.grund}</span>
                  </span>
                </div>
              ))}
            </div>

            <p className="type-small text-gold-text border-line mt-6 border-t pt-5 text-pretty">
              {lage.naechstes}
            </p>

            {/* Person zuordnen */}
            <form action={setResearchPerson.bind(null, fall.id)} className="mt-7 flex flex-col gap-5">
              <AdminField label={t.rechercheDetail.personRelevant} htmlFor="contactId">
                <AdminSelect id="contactId" name="contactId" defaultValue={fall.contactId ?? ""}>
                  <option value="">{t.rechercheDetail.keinePersonZugeordnet}</option>
                  {kandidaten.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}{k.role ? ` — ${k.role}` : ""}
                    </option>
                  ))}
                </AdminSelect>
              </AdminField>
              <div className="grid gap-5 sm:grid-cols-2">
                <AdminField label={t.rechercheDetail.fundstelleZurPerson} htmlFor="sourceUrl">
                  <AdminInput id="sourceUrl" name="sourceUrl" type="url" placeholder="https://…/impressum" />
                </AdminField>
                <AdminField label={t.rechercheDetail.woher} htmlFor="sourceKind">
                  <AdminSelect id="sourceKind" name="sourceKind" defaultValue={person?.sourceKind ?? ""}>
                    <option value="">—</option>
                    {CONTACT_SOURCES.map((k) => (
                      <option key={k} value={k}>{t.rechercheDetail.kontaktQuellen[k] ?? k}</option>
                    ))}
                  </AdminSelect>
                </AdminField>
              </div>
              <button type="submit" className="cta-quiet self-start px-4 py-2 text-sm">{t.rechercheDetail.personSpeichern}</button>
            </form>

            {person && (
              <dl className="border-line mt-7 flex flex-col gap-4 border-t pt-6">
                <DataValue label={t.rechercheDetail.rolle}>{person.role}</DataValue>
                <DataValue label={t.rechercheDetail.naehe}>
                  {t.begriffe.beziehung[person.relationship] ?? person.relationship}
                </DataValue>
                <DataValue label={t.rechercheDetail.linkedIn}>
                  {person.linkedinUrl ? (
                    <a
                      href={person.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-gold-text underline underline-offset-4"
                    >
                      {t.rechercheDetail.profilOeffnen}
                    </a>
                  ) : null}
                </DataValue>
                <DataValue label={t.rechercheDetail.fundstelle}>
                  {person.sourceUrl ? (
                    <a
                      href={person.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-gold-text truncate underline underline-offset-4"
                    >
                      {person.sourceUrl}
                    </a>
                  ) : null}
                </DataValue>
              </dl>
            )}

            {/* Das Entscheidungstor */}
            <div className="border-gold/45 mt-8 border-s-2 ps-6">
              <p className="eyebrow text-gold-text">{t.rechercheDetail.entscheidung}</p>
              <p className="type-small text-muted-foreground mt-3 max-w-xl text-pretty">
                {deckung.gedeckt
                  ? t.rechercheDetail.anspracheGedeckt(deckung.grund)
                  : t.rechercheDetail.anspracheNichtGedeckt(deckung.grund)}
              </p>
              <form action={decideResearchContact.bind(null, fall.id)} className="mt-5 flex flex-col gap-5">
                <AdminField label={t.rechercheDetail.wasEntscheidenSie} htmlFor="decision">
                  <AdminSelect id="decision" name="decision" defaultValue={fall.contactDecision ?? ""}>
                    <option value="">{t.rechercheDetail.nochNichtEntschieden}</option>
                    {DECISIONS.map((d) => (
                      <option key={d} value={d} disabled={d === "vorbereiten" && !deckung.gedeckt}>
                        {t.rechercheDetail.entscheidungen[d] ?? d}
                        {d === "vorbereiten" && !deckung.gedeckt ? ` — ${t.rechercheDetail.nichtGedeckt}` : ""}
                      </option>
                    ))}
                  </AdminSelect>
                </AdminField>
                <AdminField label={t.rechercheDetail.warum} htmlFor="note">
                  <AdminInput
                    id="note"
                    name="note"
                    defaultValue={fall.contactDecisionNote ?? ""}
                    placeholder={t.rechercheDetail.entscheidungPlatzhalter}
                  />
                </AdminField>
                <button type="submit" className="cta-quiet self-start px-4 py-2 text-sm">{t.rechercheDetail.entscheidungFesthalten}</button>
              </form>
              <ul className="mt-6 flex flex-col gap-1">
                {lage.niemalsAutomatisch.map((n) => (
                  <li key={n} className="type-small text-muted-foreground text-pretty">· {n}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Beleg hinzufügen ── */}
          <section aria-labelledby="neuer-beleg" className="mt-12">
            <SectionHeader id="neuer-beleg" title={t.rechercheDetail.belegHinzufuegen} />
            <form action={addResearchEvidence.bind(null, fall.id)} className="mt-4 flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <AdminField label={t.rechercheDetail.art} htmlFor="kind">
                  <AdminSelect id="kind" name="kind" defaultValue="signal">
                    <option value="signal">{t.rechercheDetail.belegArten.signal}</option>
                    <option value="fact">{t.rechercheDetail.belegArten.fact}</option>
                    <option value="anlass">{t.rechercheDetail.belegArten.anlass}</option>
                    <option value="ausschluss">{t.rechercheDetail.belegArten.ausschluss}</option>
                  </AdminSelect>
                </AdminField>
                <AdminField label={t.rechercheDetail.bezug} htmlFor="ref">
                  <AdminSelect id="ref" name="ref" defaultValue="">
                    <option value="">—</option>
                    {Object.entries(SIGNALS).map(([k, s]) => (
                      <option key={k} value={k}>{t.rechercheDetail.signale[k] ?? s.label}</option>
                    ))}
                    {EXCLUSIONS.map((x) => (
                      <option key={x.key} value={x.key}>
                        {t.rechercheDetail.belegArten.ausschluss}: {t.rechercheDetail.ausschluesse[x.key] ?? x.label}
                      </option>
                    ))}
                  </AdminSelect>
                </AdminField>
              </div>
              <AdminField label={t.rechercheDetail.beobachtet} htmlFor="claim">
                <AdminInput id="claim" name="claim" required placeholder={t.rechercheDetail.beobachtetPlatzhalter} />
              </AdminField>
              <div className="grid gap-5 sm:grid-cols-2">
                <AdminField label={t.rechercheDetail.fundstellePflicht} htmlFor="sourceUrl">
                  <AdminInput id="sourceUrl" name="sourceUrl" type="url" required placeholder="https://…" />
                </AdminField>
                <AdminField label={t.rechercheDetail.quellenart} htmlFor="sourceKind">
                  <AdminSelect id="sourceKind" name="sourceKind" defaultValue="website">
                    {(Object.keys(SOURCES) as SourceKind[]).map((k) => (
                      <option key={k} value={k}>
                        {(t.rechercheDetail.quellen[k] ?? SOURCES[k].label)}
                        {SOURCES[k].automatisch ? "" : ` · ${t.rechercheDetail.nurVonHand}`}
                      </option>
                    ))}
                  </AdminSelect>
                </AdminField>
              </div>
              <button type="submit" className="cta-quiet self-start px-4 py-2 text-sm">{t.rechercheDetail.belegSpeichern}</button>
            </form>
          </section>
        </div>

        {/* ── Seitenspalte ── */}
        <aside className="min-w-0 lg:col-span-5">
          <SectionHeader title={t.rechercheDetail.herkunft} />
          <dl className="mt-4 flex flex-col gap-4">
            <DataValue label={t.rechercheDetail.warumEntdeckt}>{fall.discoveryWhy}</DataValue>
            <DataValue label={t.rechercheDetail.gefundenUeber}>
              {t.rechercheDetail.quellen[fall.discoveryKind] ?? SOURCES[fall.discoveryKind].label}
            </DataValue>
            <DataValue label={t.rechercheDetail.entdecktAm}>{fmt(fall.discoveredAt, intl)}</DataValue>
            <DataValue label={t.rechercheDetail.juengsterBeleg}>
              {tage === null ? null : t.rechercheDetail.vorTagen(tage)}
            </DataValue>
          </dl>
          {!SOURCES[fall.discoveryKind].automatisch && (
            <p className="type-small text-muted-foreground mt-4 text-pretty">
              {t.rechercheDetail.quellenHinweis[fall.discoveryKind] ?? SOURCES[fall.discoveryKind].hinweis}
            </p>
          )}

          <div className="mt-12"><SectionHeader title={t.rechercheDetail.wasNochOffenIst} /></div>
          <ul className="mt-4 flex flex-col gap-2">
            {Object.entries(SIGNALS)
              .filter(([k]) => !belegteSignale.has(k))
              .slice(0, 5)
              .map(([k, s]) => (
                <li key={k} className="type-small text-muted-foreground text-pretty">
                  ? {t.rechercheDetail.signale[k] ?? s.label} — {s.evidence}
                </li>
              ))}
          </ul>

          <div className="mt-12"><SectionHeader title={t.rechercheDetail.zustand} /></div>
          <form action={setResearchCase.bind(null, fall.id)} className="mt-4 flex flex-col gap-5">
            <AdminField label={t.rechercheDetail.recherchezustand} htmlFor="status">
              <AdminSelect id="status" name="status" defaultValue={fall.status}>
                {RESEARCH_STATES.map((s) => (
                  <option key={s} value={s}>
                    {t.begriffe.rechercheStatus[s] ?? s} — {t.rechercheDetail.statusBedeutung[s] ?? s}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
            <AdminField label={t.rechercheDetail.zugang} htmlFor="access">
              <AdminSelect id="access" name="access" defaultValue={fall.access ?? ""}>
                <option value="">{t.rechercheDetail.zugangNichtRecherchiert}</option>
                <option value="empfehlung">{t.rechercheDetail.zugangsoptionen.empfehlung}</option>
                <option value="netzwerk">{t.rechercheDetail.zugangsoptionen.netzwerk}</option>
                <option value="eingehend">{t.rechercheDetail.zugangsoptionen.eingehend}</option>
                <option value="bestandskunde">{t.rechercheDetail.zugangsoptionen.bestandskunde}</option>
                <option value="keiner">{t.rechercheDetail.zugangsoptionen.keiner}</option>
              </AdminSelect>
            </AdminField>
            <AdminField label={t.rechercheDetail.heuteBedienbar} htmlFor="serviceable">
              <AdminSelect id="serviceable" name="serviceable" defaultValue={fall.serviceable === null ? "" : String(fall.serviceable)}>
                <option value="">{t.rechercheDetail.serviceableOptionen.unbekannt}</option>
                <option value="true">{t.rechercheDetail.serviceableOptionen.ja}</option>
                <option value="false">{t.rechercheDetail.serviceableOptionen.nein}</option>
              </AdminSelect>
            </AdminField>
            <AdminField label={t.rechercheDetail.naechsterSchritt} htmlFor="nextAction">
              <AdminInput id="nextAction" name="nextAction" defaultValue={fall.nextAction ?? ""} placeholder={stop.warum} />
            </AdminField>
            <button type="submit" className="cta-quiet self-start px-4 py-2 text-sm">{t.rechercheDetail.zustandSpeichern}</button>
          </form>

          <p className="type-small text-muted-foreground border-line mt-10 border-t pt-5 text-pretty">
            {t.rechercheDetail.fuss}
          </p>
        </aside>
      </div>
    </VertriebShell>
  )
}
