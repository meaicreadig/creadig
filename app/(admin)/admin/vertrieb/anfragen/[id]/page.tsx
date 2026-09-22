import Link from "next/link"
import { notFound } from "next/navigation"

import {
  archiveEnquiry,
  createOpportunityFromEnquiry,
  setEnquiryHandling,
  setEnquiryNextAction,
  setEnquiryOrganisation,
  setEnquiryResponsible,
} from "@/app/(admin)/admin/vertrieb/actions"
import { ActivityLog } from "@/components/admin/activity-log"
import {
  AdminField,
  AdminInput,
  AdminSelect,
  Pill,
  SectionHeader,
  Surface,
} from "@/components/admin/primitives"
import {
  DataValue,
} from "@/components/admin/primitives-i18n"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { leseHinweis } from "@/lib/admin-hinweis"
import { CHECK_QUESTIONS } from "@/lib/betriebscheck"
import { dictionary } from "@/lib/dictionary"
import { datumAnzeige, GESCHAEFTS_ZEITZONE, geschaeftsTag } from "@/lib/geschaeftszeit"
import { getVertriebStore } from "@/lib/lead-store"
import { ROLLEN_KEYS } from "@/lib/rollen"
import { ARCHIV_GRUENDE, HANDLING_STATES, LIFECYCLE_LABELS } from "@/lib/vertrieb"

/**
 * Eine Anfrage (ADM-03, 17.09.2026 — zweisprachig, mit Kernschleife).
 *
 * ---------------------------------------------------------------------------
 * DER BELEG BLEIBT UNANGETASTET
 * Nachricht, Absenderangaben, Quelle und Zeitpunkt sind, was tatsächlich
 * übermittelt wurde — hier zu LESEN, nicht zu ändern. Wer den Beleg mitpflegt,
 * kann hinterher nicht mehr sagen, was ursprünglich dastand.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER GETAN WIRD (Information → Entscheidung → Handlung)
 *   rechte Spalte  nächster Schritt + Termin, Verantwortlicher, Bearbeitung
 *   Qualifizieren  Verkaufschance anlegen (nie automatisch) ODER archivieren
 *                  mit Grund — „Dublette“ nur mit Bezug auf eine andere Anfrage
 *   Dubletten      Hinweise mit Grund; nichts wird verschmolzen
 *   Chronik        wer, was, wann — Mensch/System/Automation getrennt
 *
 * Betriebscheck: Befund als Feld (serverseitig gerechnet), Antworten im
 * Klartext der Nachricht. Keine Ampel — Diagnose, keine Kaufwahrscheinlichkeit.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.nav.anfragen.label }
}

export default async function AnfrageDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const fehler = (await leseHinweis(id)) === "nicht-gespeichert"
  const { t, sprache, intl } = await adminSprachKontext()
  const store = getVertriebStore()
  if (!store) return <VertriebShell title={t.nav.anfragen.label} available={false}>{null}</VertriebShell>

  let enquiry, activities, organisation, dubletten, organisationen
  try {
    enquiry = await store.getEnquiry(id)
    if (!enquiry) notFound()
    ;[activities, organisation, dubletten, organisationen] = await Promise.all([
      store.activities("lead", id),
      enquiry.organisationId ? store.getOrganisation(enquiry.organisationId) : Promise.resolve(null),
      store.possibleDuplicates(id),
      store.organisationChoices(),
    ])
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error && String((error as { digest: unknown }).digest).startsWith("NEXT_")) throw error
    return <VertriebShell title={t.nav.anfragen.label} available={false}>{null}</VertriebShell>
  }

  const b = t.begriffe
  const a = t.anfrage
  const quelleName = b.quelle[enquiry.source] ?? enquiry.source
  const isCheck = enquiry.source === "betriebscheck"
  const layers = dictionary[sprache].services.layers
  const engpassKey = enquiry.checkBottleneck as keyof typeof layers | null
  const befund =
    enquiry.checkScore != null
      ? {
          score: enquiry.checkScore,
          engpass: engpassKey != null && engpassKey in layers ? layers[engpassKey].name : null,
          manualSpots: enquiry.checkManualSpots ?? 0,
        }
      : null
  const utm = [enquiry.utmSource, enquiry.utmMedium, enquiry.utmCampaign].filter(Boolean).join(" · ")
  const archiviert = enquiry.handlingStatus === "archiviert"
  const ueberfaellig = enquiry.nextActionAt !== null && enquiry.nextActionAt < geschaeftsTag()

  return (
    <VertriebShell
      title={enquiry.organisationName ?? enquiry.business ?? enquiry.name}
      lead={a.eingegangenUeber(quelleName)}
      meta={
        <>
          <span className="block font-mono text-xs">{enquiry.reference}</span>
          <span className="mt-1 block">
            <Pill severity={enquiry.handlingStatus === "neu" ? "attention" : "neutral"}>{b.bearbeitung[enquiry.handlingStatus]}</Pill>
          </span>
        </>
      }
      available
    >
      <Link href="/admin/vertrieb/anfragen" className="text-gold-text text-sm underline underline-offset-4">
        {a.alle}
      </Link>

      {fehler ? (
        <p role="alert" className="border-destructive/40 text-destructive mt-4 border-s-2 py-1 ps-4 text-sm">
          {a.nichtGespeichert}
        </p>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
        <div className="min-w-0">
          {/* ── Beleg ── */}
          <section aria-labelledby="nachricht-titel">
            <SectionHeader id="nachricht-titel" title={isCheck ? a.betriebscheck : a.nachricht} />
            {isCheck ? <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">{a.betriebscheckHinweis}</p> : null}
            {befund ? (
              <Surface className="mt-4">
                <dl className="flex flex-wrap gap-x-12 gap-y-5">
                  <DataValue label={a.reifegrad}>
                    <span className="tabular-nums">{befund.score}</span>
                    <span className="text-muted-foreground"> / 100</span>
                  </DataValue>
                  <DataValue label={a.engpass}>
                    {befund.engpass ?? <span className="text-muted-foreground">{a.keinEngpass}</span>}
                  </DataValue>
                  <DataValue label={a.mitNicht}>
                    <span className="tabular-nums">{befund.manualSpots}</span>
                    <span className="text-muted-foreground"> {a.vonN(CHECK_QUESTIONS.length)}</span>
                  </DataValue>
                </dl>
              </Surface>
            ) : null}
            {isCheck && !befund ? <p className="type-small text-muted-foreground mt-4 max-w-2xl text-pretty">{a.keinBefund}</p> : null}
            {enquiry.message ? (
              <Surface className="mt-4">
                <p className="type-body text-foreground/90 whitespace-pre-line">{enquiry.message}</p>
              </Surface>
            ) : (
              <p className="type-small text-muted-foreground mt-4">{a.keineNachricht}</p>
            )}
          </section>

          {/* ── Einordnung ── */}
          <section aria-labelledby="triage-titel" className="mt-10">
            <SectionHeader id="triage-titel" title={a.einordnung} />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">{a.einordnungHinweis}</p>
            <Surface padding="sm" className="mt-4">
              <ul className="flex flex-col gap-2">
                <li className="type-small text-foreground/90">
                  {organisation ? a.bekannterBetrieb(organisation.name, LIFECYCLE_LABELS[organisation.lifecycle]) : a.keinBetrieb}
                </li>
                <li className="type-small text-foreground/90">{enquiry.contactName ? a.bekannterKontakt(enquiry.contactName) : a.keinKontakt}</li>
                <li className="type-small text-foreground/90">{befund ? a.befundLiegtVor(befund.score, befund.engpass) : a.keinBefundKurz}</li>
                <li className="type-small text-foreground/90">{b.eingangsabsicht[enquiry.source] ?? a.eingangUeber(quelleName)}</li>
              </ul>
            </Surface>
          </section>

          {/* ── Qualifizieren ── */}
          <section aria-labelledby="entscheidung-titel" className="mt-10">
            <SectionHeader id="entscheidung-titel" title={a.entscheidungTitel} />
            {enquiry.opportunityId ? (
              <p className="type-body mt-4">
                {a.chanceVorhanden}{" "}
                <Link href={`/admin/vertrieb/pipeline/${enquiry.opportunityId}`} className="text-gold-text underline underline-offset-4">
                  {a.chanceOeffnen}
                </Link>
              </p>
            ) : archiviert ? (
              <p className="type-body mt-4">
                {a.archiviertMit(enquiry.archiveReason ? (b.archivGrund[enquiry.archiveReason] ?? enquiry.archiveReason) : b.unbekannt)}
                {enquiry.duplicateOf ? (
                  <>
                    {" "}
                    {a.dubletteVon}:{" "}
                    <Link href={`/admin/vertrieb/anfragen/${enquiry.duplicateOf}`} className="text-gold-text underline underline-offset-4">
                      {a.oeffnen}
                    </Link>
                  </>
                ) : null}
              </p>
            ) : (
              <>
                <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">{a.entscheidungHinweis}</p>
                <form action={createOpportunityFromEnquiry.bind(null, enquiry.id)} className="mt-4 flex flex-wrap items-end gap-4">
                  <AdminField label={a.bezeichnung} htmlFor="title" className="flex-1 basis-64">
                    <AdminInput id="title" name="title" defaultValue={enquiry.organisationName ?? enquiry.business ?? enquiry.name} />
                  </AdminField>
                  <AdminField label={a.ersterSchritt} htmlFor="firstAction" className="flex-1 basis-56">
                    <AdminInput id="firstAction" name="firstAction" defaultValue={b.ersterSchritt[enquiry.source] ?? b.ersterSchrittStandard} />
                  </AdminField>
                  <button type="submit" className="cta-outline min-h-11 px-5 py-2.5 text-sm">
                    {a.chanceAnlegen}
                  </button>
                </form>

                <form action={archiveEnquiry.bind(null, enquiry.id)} className="border-line mt-6 flex flex-wrap items-end gap-4 border-t pt-6">
                  <AdminField label={a.archivGrund} htmlFor="grund">
                    <AdminSelect id="grund" name="grund" defaultValue="kein-bedarf">
                      {ARCHIV_GRUENDE.filter((g) => g !== "dublette").map((g) => (
                        <option key={g} value={g}>
                          {b.archivGrund[g]}
                        </option>
                      ))}
                    </AdminSelect>
                  </AdminField>
                  <button type="submit" className="cta-quiet min-h-11 px-4 py-2 text-sm">
                    {a.archivieren}
                  </button>
                </form>
              </>
            )}
          </section>

          {/* ── Dubletten ── */}
          <section aria-labelledby="dubletten-titel" className="mt-10">
            <SectionHeader id="dubletten-titel" title={a.dublettenTitel} count={dubletten.length ? String(dubletten.length) : undefined} />
            {dubletten.length === 0 ? (
              <p className="type-small text-muted-foreground mt-3">{a.keineDubletten}</p>
            ) : (
              <>
                <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">{a.dublettenHinweis}</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {dubletten.map((d) => (
                    <li key={`${d.art}:${d.id}`}>
                      <Surface padding="sm" className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                        <span className="min-w-0">
                          <Link
                            href={d.art === "anfrage" ? `/admin/vertrieb/anfragen/${d.id}` : d.art === "kontakt" ? `/admin/vertrieb/beziehungen/${d.id}` : `/admin/kunden/${d.id}`}
                            className="text-subhead text-sm underline-offset-4 hover:underline"
                          >
                            {d.titel}
                          </Link>
                          <span className="type-small text-muted-foreground mt-1 block">
                            {b.dublettenArt[d.art]} · {b.dublettenGrund[d.grund]}
                            {d.am ? ` · ${datumAnzeige(d.am, intl)}` : ""}
                          </span>
                        </span>
                        {d.art === "anfrage" && !archiviert && !enquiry.opportunityId ? (
                          <form action={archiveEnquiry.bind(null, enquiry.id)}>
                            <input type="hidden" name="grund" value="dublette" />
                            <input type="hidden" name="dubletteVon" value={d.id} />
                            <button type="submit" className="cta-quiet min-h-11 px-3 py-2 text-xs">
                              {a.alsDubletteArchivieren}
                            </button>
                          </form>
                        ) : null}
                      </Surface>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <div className="mt-12">
            <ActivityLog entries={activities} t={t} intl={intl} />
          </div>
        </div>

        {/* ── Rechte Spalte: was als Nächstes, wer, Zustand, Zusammenhang ── */}
        <aside aria-label={a.naechsterSchrittTitel} className="flex min-w-0 flex-col gap-10">
          <section aria-labelledby="schritt-titel">
            <SectionHeader id="schritt-titel" title={a.naechsterSchrittTitel} />
            {enquiry.nextAction ? (
              <p className={`type-body mt-3 ${ueberfaellig ? "text-destructive" : ""}`}>
                {enquiry.nextAction}
                {enquiry.nextActionAt ? <span className="text-muted-foreground tabular-nums"> · {datumAnzeige(enquiry.nextActionAt, intl)}</span> : null}
              </p>
            ) : (
              <p className="type-small text-muted-foreground mt-3">{a.naechsterSchrittLeer}</p>
            )}
            <form action={setEnquiryNextAction.bind(null, enquiry.id)} className="mt-4 flex flex-col gap-3">
              <AdminField label={a.naechsterSchrittFeld} htmlFor="nextAction">
                <AdminInput id="nextAction" name="nextAction" defaultValue={enquiry.nextAction ?? ""} />
              </AdminField>
              <AdminField label={a.naechsterSchrittDatum} htmlFor="nextActionAt">
                <AdminInput id="nextActionAt" name="nextActionAt" type="date" defaultValue={enquiry.nextActionAt ?? ""} />
              </AdminField>
              <button type="submit" className="cta-quiet min-h-11 self-start px-4 py-2 text-sm">
                {t.formular.speichern}
              </button>
            </form>
          </section>

          <section aria-labelledby="zustaendig-titel">
            <SectionHeader id="zustaendig-titel" title={a.verantwortlich} />
            <form action={setEnquiryResponsible.bind(null, enquiry.id)} className="mt-4 flex flex-wrap items-end gap-3">
              <AdminField label={a.verantwortlich} htmlFor="verantwortlich">
                <AdminSelect id="verantwortlich" name="verantwortlich" defaultValue={enquiry.responsible ?? ""}>
                  <option value="">{b.niemand}</option>
                  {ROLLEN_KEYS.map((r) => (
                    <option key={r} value={r}>
                      {b.rolle[r] ?? r}
                    </option>
                  ))}
                </AdminSelect>
              </AdminField>
              <button type="submit" className="cta-quiet min-h-11 px-4 py-2 text-sm">
                {t.formular.speichern}
              </button>
            </form>
          </section>

          <section aria-labelledby="zustand-titel">
            <SectionHeader id="zustand-titel" title={a.zustand} />
            {archiviert ? (
              <p className="type-small text-muted-foreground mt-3">{b.bearbeitung.archiviert}</p>
            ) : (
              <form action={setEnquiryHandling.bind(null, enquiry.id)} className="mt-4 flex flex-wrap items-end gap-3">
                <AdminField label={a.zustand} htmlFor="handling">
                  <AdminSelect id="handling" name="handling" defaultValue={enquiry.handlingStatus}>
                    {HANDLING_STATES.filter((s) => s !== "archiviert").map((s) => (
                      <option key={s} value={s}>
                        {b.bearbeitung[s]}
                      </option>
                    ))}
                  </AdminSelect>
                </AdminField>
                <button type="submit" className="cta-quiet min-h-11 px-4 py-2 text-sm">
                  {t.formular.speichern}
                </button>
              </form>
            )}
          </section>

          <section aria-labelledby="absender-titel">
            <SectionHeader id="absender-titel" title={a.absender} />
            <p className="type-small text-muted-foreground mt-3 text-pretty">{a.absenderHinweis}</p>
            <dl className="mt-4 flex flex-col gap-4">
              <DataValue label={a.name}>{enquiry.name}</DataValue>
              <DataValue label={a.betrieb}>{enquiry.business}</DataValue>
              <DataValue label={a.email}>
                {enquiry.email ? (
                  <a href={`mailto:${enquiry.email}`} className="underline underline-offset-4">
                    {enquiry.email}
                  </a>
                ) : null}
              </DataValue>
              <DataValue label={a.telefon}>
                {enquiry.phone ? (
                  <a href={`tel:${enquiry.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
                    {enquiry.phone}
                  </a>
                ) : null}
              </DataValue>
            </dl>
          </section>

          <section aria-labelledby="verknuepft-titel">
            <SectionHeader id="verknuepft-titel" title={a.verknuepft} as="h3" />
            <dl className="mt-4 flex flex-col gap-4">
              <DataValue label={a.kontakt}>
                {enquiry.contactId ? (
                  <Link href={`/admin/vertrieb/beziehungen/${enquiry.contactId}`} className="text-gold-text underline underline-offset-4">
                    {enquiry.contactName ?? a.oeffnen}
                  </Link>
                ) : null}
              </DataValue>
              <DataValue label={a.organisation}>
                {enquiry.organisationId ? (
                  <Link href={`/admin/kunden/${enquiry.organisationId}`} className="text-gold-text underline underline-offset-4">
                    {enquiry.organisationName ?? a.oeffnen}
                  </Link>
                ) : null}
              </DataValue>
            </dl>
            {/* ADM-03 · A04 — ausdrücklich zuordnen statt nur über den gleichen Namen. */}
            <form action={setEnquiryOrganisation.bind(null, enquiry.id)} className="mt-4 flex flex-wrap items-end gap-3">
              <AdminField label={a.zuordnen} htmlFor="organisation">
                <AdminSelect id="organisation" name="organisation" defaultValue={enquiry.organisationId ?? ""}>
                  <option value="">{a.keineOrganisation}</option>
                  {organisationen.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </AdminSelect>
              </AdminField>
              <button type="submit" className="cta-quiet min-h-11 px-4 py-2 text-sm">{t.formular.speichern}</button>
            </form>
          </section>

          <section aria-labelledby="herkunft-titel">
            <SectionHeader id="herkunft-titel" title={a.herkunft} as="h3" />
            <dl className="mt-4 flex flex-col gap-4">
              <DataValue label={a.quelle}>{quelleName}</DataValue>
              <DataValue label={a.sprache}>{enquiry.locale.toUpperCase()}</DataValue>
              <DataValue label={a.seite}>{enquiry.siteUrl}</DataValue>
              <DataValue label={a.kampagne}>{utm || null}</DataValue>
              <DataValue label={a.eingegangen}>
                <time dateTime={enquiry.createdAt}>
                  {new Date(enquiry.createdAt).toLocaleString(intl, { timeZone: GESCHAEFTS_ZEITZONE, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </time>
              </DataValue>
            </dl>
          </section>

        </aside>
      </div>
    </VertriebShell>
  )
}
