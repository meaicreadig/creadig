import Link from "next/link"
import { notFound } from "next/navigation"

import {
  setOpportunityNextAction,
  setOpportunityNote,
  abnahmeEintragen,
  acceptAngebot,
  materialEingetroffen,
  projektStarten,
  uebergabeEintragen,
  saveAngebotEntwurf,
  sendAngebot,
  setOpportunityOffer,
  setOpportunityResponsible,
  setOpportunityStatus,
} from "@/app/(admin)/admin/vertrieb/actions"
import { ActivityLog } from "@/components/admin/activity-log"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { leseHinweis } from "@/lib/admin-hinweis"
import { ROLLEN_KEYS } from "@/lib/rollen"
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
import { AngebotMappe } from "@/components/admin/angebot-mappe"
import { LieferungMappe } from "@/components/admin/lieferung-mappe"
import { SALES_LABELS_DE, SALES_STATES, TERMINAL_STATES, getVertriebStore } from "@/lib/lead-store"
import { LOST_REASONS, NEXT_ACTIONS, OFFERED_STAGES, STAGE_RULES } from "@/lib/sales-playbook"
import { OFFER_KINDS, OFFERS, readinessFor } from "@/lib/offer-readiness"
import { GESCHAEFTS_ZEITZONE, datumAnzeige, geschaeftsTag } from "@/lib/geschaeftszeit"

/**
 * Eine Verkaufschance.
 *
 * ---------------------------------------------------------------------------
 * ZWEI DRITTEL ARBEIT, EIN DRITTEL ZUSAMMENHANG
 * Links, was man ändert: Status, nächster Schritt, Notiz. Rechts, was man
 * nachschlägt: Kontakt, Organisation, Herkunft, Zeiten. Wer arbeitet, schaut
 * links; wer prüft, schaut rechts.
 *
 * ---------------------------------------------------------------------------
 * DIE CHRONIK IST ECHT
 * Anders als bei der Anfrage steht hier eine Chronik — weil es sie gibt:
 * Jede Änderung auf dieser Seite schreibt im selben Aufruf ihren Eintrag.
 * Was fehlt, ist die Zeit vor Vertrieb 1.0; die hat niemand protokolliert,
 * und sie wird nicht erfunden.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.chance.titel }
}

export default async function ChanceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const konflikt = (await leseHinweis(id)) === "konflikt"
  const { t, intl, sprache } = await adminSprachKontext()
  const store = getVertriebStore()
  if (!store) return <VertriebShell title={t.chance.titel} available={false}>{null}</VertriebShell>

  let opp, activities, lead, angebote, projekte
  try {
    opp = await store.getOpportunity(id)
    if (!opp) notFound()
    ;[activities, lead, angebote, projekte] = await Promise.all([
      store.activities("opportunity", id),
      store.leadForOpportunity(id),
      store.listOffers(id),
      store.listProjects(id),
    ])
  } catch {
    return <VertriebShell title={t.chance.titel} available={false}>{null}</VertriebShell>
  }

  const closed = TERMINAL_STATES.includes(opp.status)
  /*
    GATE 08 — Reife wird ABGELEITET, nie gespeichert. Aendern sich die
    Anforderungen einer Angebotsart, aendert sich die Anzeige mit; eine
    gespeicherte Reife waere ab diesem Moment still falsch.
  */
  const readiness = opp.offerKind ? readinessFor(opp.offerKind, opp.readinessEvidence) : null

  const overdue = opp.nextActionAt !== null && opp.nextActionAt < geschaeftsTag()

  return (
    <VertriebShell
      title={opp.title}
      lead={opp.organisationName ? t.chance.organisationLead(opp.organisationName) : undefined}
      meta={
        <Pill severity={opp.status === "lost" ? "critical" : closed ? "neutral" : "attention"}>
          {t.begriffe.stufe[opp.status] ?? SALES_LABELS_DE[opp.status]}
        </Pill>
      }
      available
    >
      <Link href="/admin/vertrieb/pipeline" className="text-gold-text text-sm underline underline-offset-4">
        {t.chance.zurPipeline}
      </Link>

      {konflikt ? (
        <p role="alert" className="border-destructive/40 text-destructive mt-4 max-w-3xl border-s-2 py-1 ps-4 text-sm text-pretty">
          {t.chance.konflikt}
        </p>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
        <div className="min-w-0">
          {/* ── Status ── */}
          <section aria-labelledby="status-titel">
            <SectionHeader id="status-titel" title={t.chance.statusTitel} />
            {/*
              GATE 4 — DIE REGEL STEHT DA, WO ENTSCHIEDEN WIRD.

              Vorher war das eine Auswahlliste mit neun Wörtern. Was
              „Qualifiziert“ verlangt und wann ein Vorgang wirklich in
              „Verhandlung“ gehört, stand nirgends — es stand im Kopf dessen,
              der die Liste angelegt hat. Beim zweiten Menschen, oder beim
              ersten vollen Monat, bedeutet dieselbe Liste etwas anderes.

              Jetzt steht die Bedeutung der aktuellen Stufe darüber und die
              Eintrittsbedingung darunter. Erzwungen wird nichts: Der Satz
              erinnert, er sperrt nicht.
            */}
            <Surface padding="sm" className="mt-4">
              <p className="type-small text-foreground/90 text-pretty">
                <span className="text-subhead">{t.begriffe.stufe[opp.status] ?? SALES_LABELS_DE[opp.status]}: </span>
                {STAGE_RULES[opp.status].meaning}
              </p>
              <p className="type-small text-muted-foreground mt-2 text-pretty">
                {t.chance.hierherWenn} {STAGE_RULES[opp.status].entry}
              </p>
            </Surface>

            {opp.status === "won" ? (
              /* ADM-03 · A11 — ein Gewinn führt irgendwohin, aber nichts geschieht von selbst. */
              <Surface padding="sm" className="border-gold/40 mt-4 border">
                <p className="text-subhead text-sm">{t.chance.gewonnenTitel}</p>
                <p className="type-small text-foreground/90 mt-2 text-pretty">
                  {(projekte ?? []).length > 0
                    ? t.chance.gewonnenMitProjekt
                    : (angebote ?? []).some((a) => a.zustand === "angenommen")
                      ? t.chance.gewonnenMitAngebot
                      : t.chance.gewonnenOhneAngebot}
                </p>
                <p className="mt-3 flex flex-wrap gap-5 text-sm">
                  <a href="#angebotsmappe-titel" className="text-gold-text underline underline-offset-4">{t.chance.zumAngebot}</a>
                  <a href="#lieferung-titel" className="text-gold-text underline underline-offset-4">{t.chance.zurLieferung}</a>
                </p>
                <p className="text-muted-foreground mt-2 text-xs">{t.chance.keineAutomatik}</p>
              </Surface>
            ) : null}

            <form action={setOpportunityStatus.bind(null, opp.id)} className="mt-5 flex flex-wrap items-end gap-4">
              {/* ADM-03 · A09 — der Stand, den diese Seite gesehen hat. */}
              <input type="hidden" name="stand" value={opp.updatedAt} />
              <AdminField label={t.chance.pipelineStatus} htmlFor="status">
                {/*
                  `audit` wird nicht mehr angeboten — Gate 3 hat entschieden,
                  dass zwischen Gespräch und Angebot EIN Schritt liegt, und der
                  heisst Systemgespräch. Der Wert bleibt in der Datenbank
                  gültig; wer ihn trägt, behält ihn. Umgeschrieben wird nichts,
                  denn ohne Blick auf die echten Zeilen wäre das Raten.
                */}
                <AdminSelect id="status" name="status" defaultValue={opp.status}>
                  {(opp.status === "audit" ? SALES_STATES : OFFERED_STAGES).map((s) => (
                    <option key={s} value={s}>{t.begriffe.stufe[s] ?? SALES_LABELS_DE[s]}</option>
                  ))}
                </AdminSelect>
              </AdminField>
              <AdminField label={t.chance.verlustGrund} htmlFor="lostReason" className="flex-1 basis-64">
                {/*
                  GATE 16 — HIER STAND EIN `<input list=…>`.

                  Eine `<datalist>` schlägt vor, sie bindet nicht: Der
                  Platzhalter sagte „Grund wählen oder frei formulieren", und
                  genau das ist passiert. Die Liste aus Gate 3 war gegen
                  fünfzig Formulierungen gebaut und hat sie zugelassen.

                  Jetzt eine Auswahl. Der Satz daneben ist deshalb nicht weg —
                  er gehört in die Notiz des Vorgangs weiter unten: Die
                  Kategorie sagt WO es gescheitert ist, die Notiz WAS los war.
                  Nur trägt die Kategorie jetzt die Schleife zurück ins
                  Zielbild, und ein Satz konnte das nie.
                */}
                <AdminSelect id="lostReason" name="lostReason" defaultValue={opp.lostReason ?? ""}>
                  <option value="">{t.chance.keinGrund}</option>
                  {LOST_REASONS.map((r) => (
                    <option key={t.begriffe.verlustGrund[r] ?? r} value={r}>{r}</option>
                  ))}
                  {/*
                    Altbestand: Steht im Datensatz ein Freitext von früher,
                    bleibt er wählbar und sichtbar. Er wird nicht umgedeutet
                    und nicht stillschweigend gelöscht — wer den Status
                    speichert, ohne ihn anzufassen, verlöre ihn sonst.
                  */}
                  {opp.lostReason && !(LOST_REASONS as readonly string[]).includes(opp.lostReason) && (
                    <option value={opp.lostReason}>{opp.lostReason} {t.chance.altbestand}</option>
                  )}
                </AdminSelect>
              </AdminField>
              <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.chance.statusSpeichern}</button>
            </form>
          </section>

          {/* ── Nächster Schritt ── */}
          <section aria-labelledby="schritt-titel" className="mt-10">
            <SectionHeader id="schritt-titel" title={t.chance.schrittTitel} />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
              {t.chance.schrittHinweis}
              {STAGE_RULES[opp.status].suggests && (
                <> {t.chance.schrittMeistens}{" "}
                  <span className="text-foreground">{STAGE_RULES[opp.status].suggests}</span>.
                </>
              )}
            </p>
            {STAGE_RULES[opp.status].active && !opp.nextAction && (
              <p className="text-destructive type-small mt-3">
                {t.chance.schrittFehlt}
              </p>
            )}
            <form action={setOpportunityNextAction.bind(null, opp.id)} className="mt-4 flex flex-wrap items-end gap-4">
              <AdminField label={t.chance.wasAlsNaechstes} htmlFor="nextAction" className="flex-1 basis-64">
                <AdminInput
                  id="nextAction"
                  name="nextAction"
                  list="naechste-schritte"
                  defaultValue={opp.nextAction ?? ""}
                  placeholder={t.chance.schrittPlatzhalter}
                />
                {/* Vorschläge, keine Liste zum Auswählen: Der zwölfte Fall
                    kommt garantiert, und dann soll dort die Wahrheit stehen
                    und nicht der nächstbeste Eintrag. */}
                <datalist id="naechste-schritte">
                  {NEXT_ACTIONS.map((a) => <option key={a} value={a} />)}
                </datalist>
              </AdminField>
              <AdminField label={t.chance.bisWann} htmlFor="nextActionAt">
                <AdminInput id="nextActionAt" name="nextActionAt" type="date" defaultValue={opp.nextActionAt ?? ""} />
              </AdminField>
              <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.chance.schrittSpeichern}</button>
            </form>
            {overdue && (
              <p className="text-destructive type-small mt-3">
                {t.chance.ueberfaelligSeit(formatDate(opp.nextActionAt!))}
              </p>
            )}
          </section>

          {/* ── Angebotsreife ──────────────────────────────────────────────
              GATE 08 — die Regel stand in zwei Markdown-Dateien und nirgends
              im System.

              Zwei Logiken, nicht eine. Ein Festpreis-Angebot fragt NICHT
              nach Systemtreibern: Der Umfang steht im Paket, reif ist, wer
              weiss, wem er es anbietet. Nur das Systemprojekt braucht die
              Treiber, weil dort der Umfang erst entsteht.

              Bewusst kein Zaehler und keine Ampel. Was fehlt, steht als
              Frage da. Eine Quote laedt dazu ein, Haken zu setzen, damit sie
              steigt; eine offene Frage laedt dazu ein, sie zu beantworten. */}
          <section aria-labelledby="angebot-titel" className="mt-10">
            <SectionHeader id="angebot-titel" title={t.chance.angebotTitel} />
            <form action={setOpportunityOffer.bind(null, opp.id)} className="mt-4">
              <AdminField label={t.chance.wasWirdAngeboten} htmlFor="offerKind">
                <AdminSelect id="offerKind" name="offerKind" defaultValue={opp.offerKind ?? ""}>
                  <option value="">{t.chance.nochNichtEntschieden}</option>
                  {OFFER_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {OFFERS[k].label}
                      {OFFERS[k].publicPrice ? ` — ${OFFERS[k].publicPrice}` : "{t.chance.nachZuschnitt}"}
                    </option>
                  ))}
                </AdminSelect>
              </AdminField>

              {opp.offerKind && (
                <fieldset className="mt-6">
                  <legend className="type-small text-muted-foreground">
                    {t.chance.belegeLegende}
                  </legend>
                  <div className="mt-4 flex flex-col gap-4">
                    {OFFERS[opp.offerKind].evidence.map((e) => {
                      const belegt = opp.readinessEvidence.includes(e.key)
                      return (
                        <label key={e.key} className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            name="evidence"
                            value={e.key}
                            defaultChecked={belegt}
                            className="accent-gold mt-1 size-4 shrink-0"
                          />
                          <span>
                            <span className="type-small text-foreground block">{e.label}</span>
                            <span className="type-small text-muted-foreground block">{e.why}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              )}
              <button type="submit" className="cta-quiet mt-5 px-4 py-2 text-sm">
                {t.chance.angebotSpeichern}
              </button>
            </form>

            {readiness && (
              <p className={`type-small mt-5 ${readiness.ready ? "text-gold-text" : "text-muted-foreground"}`}>
                {readiness.ready ? (
                  <>{t.chance.angebotsreif}</>
                ) : (
                  <>
                    {t.chance.nochOffen}{" "}
                    {readiness.open.map((e) => e.label).join(" · ")}
                  </>
                )}
              </p>
            )}
          </section>

          {/* ── Angebotsdokument ───────────────────────────────────────────
              GATE 17 — hier gab es bis zum 09.09.2026 nichts.

              `offer_kind` und die Belege (oben) sagten, WAS verkauft wird
              und ob eine Zahl genannt werden darf. Das Angebot selbst
              entstand daneben, in einem Textprogramm — wo keine der neun
              Regeln aus `docs/sales/proposal-outline.md` gilt und wo eine
              Zahl frei getippt wird.

              Dieselbe Luecke wie in Gate 12: Der Aktenschrank stand, der
              Stift lag daneben, und der Weg, eine Akte anzulegen, fehlte. */}
          <section aria-labelledby="angebotsmappe-titel" className="mt-10">
            <SectionHeader id="angebotsmappe-titel" title={t.chance.angebotsdokumentTitel} />
            <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">
              {t.chance.angebotsdokumentHinweis}
            </p>
            <div className="mt-5">
              <AngebotMappe
                opportunityId={opp.id}
                referenz={lead?.reference ?? ""}
                offerKind={opp.offerKind}
                angebote={angebote ?? []}
                sprache={sprache}
                speichern={saveAngebotEntwurf}
                senden={sendAngebot}
                annehmen={acceptAngebot}
              />
            </div>
          </section>

          {/* ── Lieferung ──────────────────────────────────────────────────
              GATE 19 — „eine Lieferung ohne Abnahme ist keine."

              Die Regeln hier sind nicht erfunden: Sie stehen auf der
              oeffentlichen Seite. Das FAQ verspricht vier Stuecke bei der
              Uebergabe („Code, Inhalte, Zugaenge und Domain"), die
              Paketzeile nennt die Frist („vier Wochen ab Materialeingang")
              und knuepft die zweite Rate an die Freigabe.

              Gebaut war davon nichts. Die Zusagen standen auf der Seite und
              wirkten nirgends — dieselbe Bauart wie in G13, G15, G16 und
              G17. */}
          <section aria-labelledby="lieferung-titel" className="mt-10">
            <SectionHeader id="lieferung-titel" title={t.chance.lieferungTitel} />
            <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">
              {t.chance.lieferungHinweis}
            </p>
            <div className="mt-5">
              <LieferungMappe
                opportunityId={opp.id}
                angenommeneAngebote={(angebote ?? [])
                  .filter((a) => a.zustand === "angenommen")
                  .map((a) => ({ id: a.id, referenz: a.referenz }))}
                projekte={projekte ?? []}
                sprache={sprache}
                starten={projektStarten}
                material={materialEingetroffen}
                abnahme={abnahmeEintragen}
                uebergabe={uebergabeEintragen}
              />
            </div>
          </section>

          {/* ── Notiz ── */}
          <section aria-labelledby="notiz-titel" className="mt-10">
            <SectionHeader id="notiz-titel" title={t.chance.notizTitel} />
            <form action={setOpportunityNote.bind(null, opp.id)} className="mt-4">
              <AdminField label={t.chance.notizIntern} htmlFor="note">
                <AdminTextarea id="note" name="note" rows={4} defaultValue={opp.note ?? ""} placeholder={t.chance.notizPlatzhalter} />
              </AdminField>
              <button type="submit" className="cta-quiet mt-4 px-4 py-2 text-sm">{t.chance.notizSpeichern}</button>
            </form>
          </section>

          <div className="mt-12">
            <ActivityLog entries={activities} t={t} intl={intl} />
          </div>
        </div>

        <aside className="min-w-0">
          <SectionHeader title={t.anfrage.verantwortlich} />
          <form action={setOpportunityResponsible.bind(null, opp.id)} className="mt-4 mb-10 flex flex-wrap items-end gap-3">
            <AdminField label={t.anfrage.verantwortlich} htmlFor="verantwortlich">
              <AdminSelect id="verantwortlich" name="verantwortlich" defaultValue={opp.responsible ?? ""}>
                <option value="">{t.begriffe.niemand}</option>
                {ROLLEN_KEYS.map((r) => (
                  <option key={r} value={r}>{t.begriffe.rolle[r] ?? r}</option>
                ))}
              </AdminSelect>
            </AdminField>
            <button type="submit" className="cta-quiet min-h-11 px-4 py-2 text-sm">{t.formular.speichern}</button>
          </form>

          <SectionHeader title={t.chance.beteiligte} />
          <dl className="mt-4 flex flex-col gap-4">
            <DataValue label={t.chance.kontakt}>
              {opp.contactId ? (
                <Link href={`/admin/vertrieb/beziehungen/${opp.contactId}`} className="text-gold-text underline underline-offset-4">
                  {opp.contactName ?? t.chance.oeffnen}
                </Link>
              ) : null}
            </DataValue>
            <DataValue label={t.chance.organisation}>{opp.organisationName}</DataValue>
          </dl>

          <div className="mt-10">
            <SectionHeader title={t.chance.herkunft} as="h3" />
            <dl className="mt-4 flex flex-col gap-4">
              <DataValue label={t.chance.quelle}>{opp.source}</DataValue>
              <DataValue label={t.chance.ausAnfrage}>
                {lead ? (
                  <Link href={`/admin/vertrieb/anfragen/${lead.id}`} className="text-gold-text font-mono text-xs underline underline-offset-4">
                    {lead.reference}
                  </Link>
                ) : null}
              </DataValue>
              <DataValue label={t.chance.geschaetzterWert}>
                {/* `null` heisst nicht geschätzt — nicht null Euro. */}
                {opp.estimatedValue === null ? null : `${opp.estimatedValue.toLocaleString(intl)} €`}
              </DataValue>
            </dl>
          </div>

          <div className="mt-10">
            <SectionHeader title={t.chance.zeiten} as="h3" />
            <dl className="mt-4 flex flex-col gap-4">
              <DataValue label={t.chance.angelegt}>
                <time dateTime={opp.createdAt}>{formatDateTime(opp.createdAt, intl)}</time>
              </DataValue>
              <DataValue label={t.chance.letzterKontakt}>
                {opp.lastContactAt ? <time dateTime={opp.lastContactAt}>{formatDateTime(opp.lastContactAt, intl)}</time> : null}
              </DataValue>
              <DataValue label={t.chance.zuletztGeaendert}>
                <time dateTime={opp.updatedAt}>{formatDateTime(opp.updatedAt, intl)}</time>
              </DataValue>
            </dl>
          </div>
        </aside>
      </div>
    </VertriebShell>
  )
}

function formatDate(iso: string): string {
  return datumAnzeige(iso)
}
function formatDateTime(iso: string, locale: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(locale, { timeZone: GESCHAEFTS_ZEITZONE, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}
