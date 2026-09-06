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
  DataValue,
  Pill,
  SectionHeader,
} from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { getVertriebStore } from "@/lib/lead-store"
import {
  EXCLUSIONS,
  RESEARCH_STATES,
  SIGNALS,
  SOURCES,
  STATE_MEANING,
  abbruch,
  alterInTagen,
  einordnung,
  widersprueche,
  type SourceKind,
} from "@/lib/research"
import {
  CONTACT_SOURCES,
  CONTACT_SOURCE_LABEL,
  DECISIONS,
  DECISION_LABEL,
  ansprachedeckung,
  kontaktLage,
} from "@/lib/contact-access"

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

export const metadata = { title: "Recherche · Betrieb" }

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default async function RechercheDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const store = getVertriebStore()
  if (!store) notFound()

  const fall = await store.getResearch(id)
  if (!fall) notFound()

  const e = einordnung(fall)
  const stop = abbruch(fall)
  const tage = alterInTagen(fall)
  const konflikte = widersprueche(fall)
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
    <VertriebShell title={fall.organisationName} lead={STATE_MEANING[fall.status]} available>
      <Link href="/admin/vertrieb/recherche" className="type-small text-gold-text underline underline-offset-4">
        ← Zur Recherche
      </Link>

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          {/* ── Urteil ── */}
          <section aria-labelledby="urteil">
            <SectionHeader id="urteil" title="Urteil" />
            <div className="mt-5 flex flex-col gap-5">
              {([
                ["Passung", e.passung],
                ["Zugang", e.zugang],
                ["Bedienbarkeit", e.bedienbarkeit],
                ["Kaufkraft", e.kaufkraft],
              ] as const).map(([name, achse]) => (
                <div key={name}>
                  <span className="flex items-center gap-3">
                    <span className="eyebrow text-muted-foreground w-32 shrink-0">{name}</span>
                    <Pill severity={achse.urteil === "passend" ? "attention" : "neutral"}>{achse.urteil}</Pill>
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
            <SectionHeader id="belege" title="Belege" />
            {konflikte.length > 0 && (
              <p className="text-destructive type-small mt-4">
                {konflikte.length} Widerspruch: zwei gültige Belege sagen Verschiedenes zu{" "}
                {konflikte.map((k) => k.ref).join(", ")}. Der neuere ist nicht automatisch der
                bessere — entscheiden Sie, welcher gilt.
              </p>
            )}
            {gueltig.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4">
                Noch kein Beleg. Ohne Quelle zählt keine Beobachtung.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col">
                {gueltig.map((b) => (
                  <li key={b.id} className="border-line border-b py-4">
                    <span className="flex flex-wrap items-baseline gap-3">
                      <Pill severity="neutral">{b.kind}</Pill>
                      {b.ref && <span className="text-meta text-gold-text">{b.ref}</span>}
                      <span className="text-meta text-muted-foreground">
                        {SOURCES[b.sourceKind].label} · {fmt(b.observedAt)}
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
                  {abgeloest.length} abgelöste{abgeloest.length === 1 ? "r" : ""} Beleg
                  {abgeloest.length === 1 ? "" : "e"} — bleiben in der Akte
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
            <SectionHeader id="kontakt" title="Kontakt & Zugang" />

            <div className="mt-5 flex flex-col gap-4">
              {([
                ["Passung", lage.passung],
                ["Person", lage.person],
                ["Zugang", lage.zugang],
                ["Anlass", lage.anlass],
              ] as const).map(([name, achse]) => (
                <div key={name} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                  <span className="eyebrow text-muted-foreground sm:w-24 sm:shrink-0">{name}</span>
                  <span className="min-w-0">
                    <Pill severity={achse.urteil === "ja" ? "attention" : "neutral"}>{achse.urteil}</Pill>
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
              <AdminField label="Wer ist die relevante Person?" htmlFor="contactId">
                <AdminSelect id="contactId" name="contactId" defaultValue={fall.contactId ?? ""}>
                  <option value="">keine Person zugeordnet</option>
                  {kandidaten.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}{k.role ? ` — ${k.role}` : ""}
                    </option>
                  ))}
                </AdminSelect>
              </AdminField>
              <div className="grid gap-5 sm:grid-cols-2">
                <AdminField label="Fundstelle zur Person" htmlFor="sourceUrl">
                  <AdminInput id="sourceUrl" name="sourceUrl" type="url" placeholder="https://…/impressum" />
                </AdminField>
                <AdminField label="Woher" htmlFor="sourceKind">
                  <AdminSelect id="sourceKind" name="sourceKind" defaultValue={person?.sourceKind ?? ""}>
                    <option value="">—</option>
                    {CONTACT_SOURCES.map((k) => (
                      <option key={k} value={k}>{CONTACT_SOURCE_LABEL[k]}</option>
                    ))}
                  </AdminSelect>
                </AdminField>
              </div>
              <button type="submit" className="cta-quiet self-start px-4 py-2 text-sm">Person speichern</button>
            </form>

            {person && (
              <dl className="border-line mt-7 flex flex-col gap-4 border-t pt-6">
                <DataValue label="Rolle">{person.role}</DataValue>
                <DataValue label="Nähe">{person.relationship}</DataValue>
                <DataValue label="LinkedIn">
                  {person.linkedinUrl ? (
                    <a
                      href={person.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-gold-text underline underline-offset-4"
                    >
                      Profil öffnen
                    </a>
                  ) : null}
                </DataValue>
                <DataValue label="Fundstelle">
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
              <p className="eyebrow text-gold-text">Entscheidung</p>
              <p className="type-small text-muted-foreground mt-3 max-w-xl text-pretty">
                {deckung.gedeckt
                  ? `Eine Ansprache wäre gedeckt: ${deckung.grund}`
                  : `Eine Ansprache wäre NICHT gedeckt: ${deckung.grund}`}
              </p>
              <form action={decideResearchContact.bind(null, fall.id)} className="mt-5 flex flex-col gap-5">
                <AdminField label="Was entscheiden Sie?" htmlFor="decision">
                  <AdminSelect id="decision" name="decision" defaultValue={fall.contactDecision ?? ""}>
                    <option value="">noch nicht entschieden</option>
                    {DECISIONS.map((d) => (
                      <option key={d} value={d} disabled={d === "vorbereiten" && !deckung.gedeckt}>
                        {DECISION_LABEL[d]}
                        {d === "vorbereiten" && !deckung.gedeckt ? " — nicht gedeckt" : ""}
                      </option>
                    ))}
                  </AdminSelect>
                </AdminField>
                <AdminField label="Warum" htmlFor="note">
                  <AdminInput id="note" name="note" defaultValue={fall.contactDecisionNote ?? ""} placeholder="Ein Satz, der die Entscheidung trägt." />
                </AdminField>
                <button type="submit" className="cta-quiet self-start px-4 py-2 text-sm">Entscheidung festhalten</button>
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
            <SectionHeader id="neuer-beleg" title="Beleg hinzufügen" />
            <form action={addResearchEvidence.bind(null, fall.id)} className="mt-4 flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <AdminField label="Art" htmlFor="kind">
                  <AdminSelect id="kind" name="kind" defaultValue="signal">
                    <option value="signal">Signal — stützt einen Betriebszustand</option>
                    <option value="fact">Beobachtung — Tatsache ohne Signalbezug</option>
                    <option value="anlass">Anlass — öffentliches Ereignis</option>
                    <option value="ausschluss">Ausschluss</option>
                  </AdminSelect>
                </AdminField>
                <AdminField label="Bezug (bei Signal oder Ausschluss)" htmlFor="ref">
                  <AdminSelect id="ref" name="ref" defaultValue="">
                    <option value="">—</option>
                    {Object.entries(SIGNALS).map(([k, s]) => (
                      <option key={k} value={k}>{s.label}</option>
                    ))}
                    {EXCLUSIONS.map((x) => (
                      <option key={x.key} value={x.key}>Ausschluss: {x.label}</option>
                    ))}
                  </AdminSelect>
                </AdminField>
              </div>
              <AdminField label="Was wurde beobachtet — nicht, was es bedeutet" htmlFor="claim">
                <AdminInput id="claim" name="claim" required placeholder="z. B. Stellenanzeige nennt Lexware, Excel und ein Branchenprogramm" />
              </AdminField>
              <div className="grid gap-5 sm:grid-cols-2">
                <AdminField label="Fundstelle (Pflicht)" htmlFor="sourceUrl">
                  <AdminInput id="sourceUrl" name="sourceUrl" type="url" required placeholder="https://…" />
                </AdminField>
                <AdminField label="Quellenart" htmlFor="sourceKind">
                  <AdminSelect id="sourceKind" name="sourceKind" defaultValue="website">
                    {(Object.keys(SOURCES) as SourceKind[]).map((k) => (
                      <option key={k} value={k}>
                        {SOURCES[k].label}{SOURCES[k].automatisch ? "" : " · nur von Hand"}
                      </option>
                    ))}
                  </AdminSelect>
                </AdminField>
              </div>
              <button type="submit" className="cta-quiet self-start px-4 py-2 text-sm">Beleg speichern</button>
            </form>
          </section>
        </div>

        {/* ── Seitenspalte ── */}
        <aside className="min-w-0 lg:col-span-5">
          <SectionHeader title="Herkunft" />
          <dl className="mt-4 flex flex-col gap-4">
            <DataValue label="Warum entdeckt">{fall.discoveryWhy}</DataValue>
            <DataValue label="Gefunden über">{SOURCES[fall.discoveryKind].label}</DataValue>
            <DataValue label="Entdeckt am">{fmt(fall.discoveredAt)}</DataValue>
            <DataValue label="Jüngster Beleg">
              {tage === null ? null : `vor ${tage} Tagen`}
            </DataValue>
          </dl>
          {!SOURCES[fall.discoveryKind].automatisch && (
            <p className="type-small text-muted-foreground mt-4 text-pretty">
              {SOURCES[fall.discoveryKind].hinweis}
            </p>
          )}

          <div className="mt-12"><SectionHeader title="Was noch offen ist" /></div>
          <ul className="mt-4 flex flex-col gap-2">
            {Object.entries(SIGNALS)
              .filter(([k]) => !belegteSignale.has(k))
              .slice(0, 5)
              .map(([k, s]) => (
                <li key={k} className="type-small text-muted-foreground text-pretty">
                  ? {s.label} — {s.evidence}
                </li>
              ))}
          </ul>

          <div className="mt-12"><SectionHeader title="Zustand" /></div>
          <form action={setResearchCase.bind(null, fall.id)} className="mt-4 flex flex-col gap-5">
            <AdminField label="Recherchezustand" htmlFor="status">
              <AdminSelect id="status" name="status" defaultValue={fall.status}>
                {RESEARCH_STATES.map((s) => (
                  <option key={s} value={s}>{s} — {STATE_MEANING[s]}</option>
                ))}
              </AdminSelect>
            </AdminField>
            <AdminField label="Zugang" htmlFor="access">
              <AdminSelect id="access" name="access" defaultValue={fall.access ?? ""}>
                <option value="">nicht recherchiert</option>
                <option value="empfehlung">Empfehlung</option>
                <option value="netzwerk">Netzwerk</option>
                <option value="eingehend">selbst angefragt</option>
                <option value="bestandskunde">Bestandskunde</option>
                <option value="keiner">kein ehrlicher Weg</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Heute bedienbar" htmlFor="serviceable">
              <AdminSelect id="serviceable" name="serviceable" defaultValue={fall.serviceable === null ? "" : String(fall.serviceable)}>
                <option value="">nicht geprüft</option>
                <option value="true">ja</option>
                <option value="false">nein — z. B. Rechnungslage ungeklärt</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Nächster Schritt" htmlFor="nextAction">
              <AdminInput id="nextAction" name="nextAction" defaultValue={fall.nextAction ?? ""} placeholder={stop.warum} />
            </AdminField>
            <button type="submit" className="cta-quiet self-start px-4 py-2 text-sm">Zustand speichern</button>
          </form>

          <p className="type-small text-muted-foreground border-line mt-10 border-t pt-5 text-pretty">
            Aus dieser Seite entsteht keine Verkaufschance, kein Kontakt und keine
            Werbeeinwilligung. Wer angesprochen wird und wie, entscheidet G11 —
            auch dann, wenn hier ein Anlass belegt ist.
          </p>
        </aside>
      </div>
    </VertriebShell>
  )
}
