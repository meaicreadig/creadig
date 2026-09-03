import Link from "next/link"
import { notFound } from "next/navigation"

import { createOpportunityFromEnquiry, setEnquiryHandling } from "@/app/(admin)/admin/vertrieb/actions"
import { ActivityLog } from "@/components/admin/activity-log"
import {
  AdminField,
  AdminInput,
  AdminSelect,
  DataValue,
  Pill,
  SectionHeader,
  Surface,
} from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { getVertriebStore } from "@/lib/lead-store"
import { CHECK_QUESTIONS } from "@/lib/betriebscheck"
import { dictionary } from "@/lib/dictionary"
import { HANDLING_LABELS, HANDLING_STATES } from "@/lib/vertrieb"

/**
 * Eine Anfrage.
 *
 * ---------------------------------------------------------------------------
 * DER BELEG BLEIBT UNANGETASTET
 * Nachricht, Absenderangaben, Quelle und Zeitpunkt sind das, was jemand
 * tatsächlich abgeschickt hat. Sie sind hier zu LESEN, nicht zu ändern — auch
 * dann nicht, wenn der Kontakt später eine neue Telefonnummer bekommt. Wer
 * den Beleg mitpflegt, kann hinterher nicht mehr sagen, was ursprünglich
 * dastand.
 *
 * Änderbar ist genau eines: der Bearbeitungszustand. Und die Aktion, aus der
 * Anfrage einen Vorgang zu machen.
 *
 * ---------------------------------------------------------------------------
 * BETRIEBSCHECK
 * Seit 03.09.2026 zweigeteilt, und die Teilung ist Absicht:
 *
 *   Der BEFUND (Reifegrad, Engpass, Zahl der „Nicht"-Antworten) steht als
 *   Feld — serverseitig aus den Antworten gerechnet, nicht vom Formular
 *   entgegengenommen. Er beantwortet die Frage, die man vor dem Anruf hat.
 *
 *   Die ANTWORTEN stehen weiter im Klartext der Nachricht, so wie sie
 *   eingegangen sind. Sie sind der Beleg, und ein Beleg wird nicht
 *   nachgebaut.
 *
 * Keine Balken und keine Ebenen-Grafik: Der Engpass ist EIN Wert, und ein
 * einzelner Wert braucht kein Diagramm. Der Reifegrad steht ohne Ampelfarbe
 * da — er bleibt eine Diagnose, keine Kaufwahrscheinlichkeit, und ein roter
 * Punkt neben einer niedrigen Zahl würde den Absender bewerten statt seinen
 * Betrieb zu beschreiben.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Anfrage" }

export default async function AnfrageDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const store = getVertriebStore()
  if (!store) return <VertriebShell title="Anfrage" available={false}>{null}</VertriebShell>

  let enquiry, activities
  try {
    enquiry = await store.getEnquiry(id)
    if (!enquiry) notFound()
    activities = await store.activities("lead", id)
  } catch {
    return <VertriebShell title="Anfrage" available={false}>{null}</VertriebShell>
  }

  const isCheck = enquiry.source === "betriebscheck"

  /*
   * Der Befund hängt am Reifegrad, nicht am Engpass.
   *
   * `!= null` fängt beides ab: das fehlende Feld bei Anfragen von vor dieser
   * Änderung UND `undefined` aus dem Entwicklungs-Dateispeicher, der alte
   * JSON-Zeilen ohne diese Schlüssel zurückliest.
   *
   * Ein fehlender Engpass ist dagegen KEIN fehlender Befund, sondern selbst
   * ein Ergebnis: Sind alle fünf Ebenen gleich stark, gibt es keinen — und
   * dann steht genau das da statt einer Ebene, die zufällig zuerst in der
   * Liste steht.
   */
  const layers = dictionary.de.services.layers
  const engpassKey = enquiry.checkBottleneck as keyof typeof layers | null
  const befund =
    enquiry.checkScore != null
      ? {
          score: enquiry.checkScore,
          engpass:
            engpassKey != null && engpassKey in layers ? layers[engpassKey].name : null,
          manualSpots: enquiry.checkManualSpots ?? 0,
        }
      : null
  const utm = [enquiry.utmSource, enquiry.utmMedium, enquiry.utmCampaign].filter(Boolean).join(" · ")

  return (
    <VertriebShell
      title={enquiry.organisationName ?? enquiry.business ?? enquiry.name}
      lead={`Eingegangen über ${enquiry.source}.`}
      meta={
        <>
          <span className="block font-mono text-xs">{enquiry.reference}</span>
          <span className="mt-1 block">
            <Pill severity={enquiry.handlingStatus === "neu" ? "attention" : "neutral"}>
              {HANDLING_LABELS[enquiry.handlingStatus]}
            </Pill>
          </span>
        </>
      }
      available
    >
      <Link href="/admin/vertrieb/anfragen" className="text-gold-text text-sm underline underline-offset-4">
        ← Alle Anfragen
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
        {/* ── Arbeitsfläche ── */}
        <div className="min-w-0">
          <section aria-labelledby="nachricht-titel">
            <SectionHeader id="nachricht-titel" title={isCheck ? "Betriebscheck" : "Nachricht"} />
            {isCheck && (
              <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
                Reifegrad-Diagnose, wie der Absender sie ausgefüllt hat. Keine
                Kaufwahrscheinlichkeit und keine Bewertung des Absenders.
              </p>
            )}
            {befund ? (
              /*
                `DataValue` erzeugt `dt`/`dd`; beide brauchen ein `dl` als
                Elternteil. Ohne das ist die Auszeichnung ungültig und ein
                Vorleseprogramm liest drei zusammenhanglose Textstücke statt
                drei beschrifteter Werte. Dieselbe Hülle wie im Absender-Block.
              */
              <Surface className="mt-4">
                <dl className="flex flex-wrap gap-x-12 gap-y-5">
                  <DataValue label="Reifegrad">
                    <span className="tabular-nums">{befund.score}</span>
                    <span className="text-muted-foreground"> / 100</span>
                  </DataValue>
                  <DataValue label="Engpass">
                    {befund.engpass ?? (
                      <span className="text-muted-foreground">
                        keiner — alle fünf Ebenen gleich stark
                      </span>
                    )}
                  </DataValue>
                  <DataValue label="Mit „Nicht“ beantwortet">
                    <span className="tabular-nums">{befund.manualSpots}</span>
                    <span className="text-muted-foreground"> von {CHECK_QUESTIONS.length}</span>
                  </DataValue>
                </dl>
              </Surface>
            ) : null}

            {isCheck && !befund ? (
              <p className="type-small text-muted-foreground mt-4 max-w-2xl text-pretty">
                Zu dieser Anfrage ist kein Befund gespeichert. Sie ist eingegangen,
                bevor der Betriebscheck ihn als Feld ablegte (vor dem 03.09.2026) —
                die Antworten selbst stehen unverändert darunter.
              </p>
            ) : null}

            {enquiry.message ? (
              <Surface className="mt-4">
                <p className="type-body text-foreground/90 whitespace-pre-line">{enquiry.message}</p>
              </Surface>
            ) : (
              <p className="type-small text-muted-foreground mt-4">Keine Nachricht übermittelt.</p>
            )}
          </section>

          {/* ── Bearbeitung ── */}
          <section aria-labelledby="bearbeitung-titel" className="mt-10">
            <SectionHeader id="bearbeitung-titel" title="Bearbeitung" />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
              Der Zustand des Eingangs, nicht des Geschäfts. Eine Anfrage kann
              bearbeitet sein, ohne dass je ein Vorgang daraus wird.
            </p>
            <form action={setEnquiryHandling.bind(null, enquiry.id)} className="mt-4 flex flex-wrap items-end gap-4">
              <AdminField label="Zustand" htmlFor="handling">
                <AdminSelect id="handling" name="handling" defaultValue={enquiry.handlingStatus}>
                  {HANDLING_STATES.map((s) => (
                    <option key={s} value={s}>{HANDLING_LABELS[s]}</option>
                  ))}
                </AdminSelect>
              </AdminField>
              <button type="submit" className="cta-quiet px-4 py-2 text-sm">Speichern</button>
            </form>
          </section>

          {/* ── Verkaufschance ── */}
          <section aria-labelledby="chance-titel" className="mt-10">
            <SectionHeader id="chance-titel" title="Verkaufschance" />
            {enquiry.opportunityId ? (
              <p className="type-body mt-4">
                Zu dieser Anfrage gibt es einen Vorgang:{" "}
                <Link href={`/admin/vertrieb/pipeline/${enquiry.opportunityId}`} className="text-gold-text underline underline-offset-4">
                  in der Pipeline öffnen
                </Link>
              </p>
            ) : (
              <>
                <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
                  Aus dieser Anfrage ist noch kein Vorgang entstanden. Das ist
                  der Normalfall — ein Vorgang entsteht, wenn Sie ihn anlegen.
                </p>
                <form action={createOpportunityFromEnquiry.bind(null, enquiry.id)} className="mt-4 flex flex-wrap items-end gap-4">
                  <AdminField label="Bezeichnung" htmlFor="title" className="flex-1 basis-64">
                    <AdminInput
                      id="title"
                      name="title"
                      defaultValue={enquiry.organisationName ?? enquiry.business ?? enquiry.name}
                      placeholder="worum es geht"
                    />
                  </AdminField>
                  <button type="submit" className="cta-quiet px-4 py-2 text-sm">Verkaufschance anlegen</button>
                </form>
              </>
            )}
          </section>

          <div className="mt-12">
            <ActivityLog entries={activities} />
          </div>
        </div>

        {/* ── Zusammenhang ── */}
        <aside aria-labelledby="kontext-titel" className="min-w-0">
          <SectionHeader id="kontext-titel" title="Absender" />
          <p className="type-small text-muted-foreground mt-3 text-pretty">
            Wie im Formular übermittelt. Der Beleg ändert sich nicht mit.
          </p>
          <dl className="mt-4 flex flex-col gap-4">
            <DataValue label="Name">{enquiry.name}</DataValue>
            <DataValue label="Betrieb">{enquiry.business}</DataValue>
            <DataValue label="E-Mail">
              <a href={`mailto:${enquiry.email}`} className="underline underline-offset-4">{enquiry.email}</a>
            </DataValue>
            <DataValue label="Telefon">
              {enquiry.phone ? (
                <a href={`tel:${enquiry.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">{enquiry.phone}</a>
              ) : null}
            </DataValue>
          </dl>

          <div className="mt-10">
            <SectionHeader title="Verknüpft" as="h3" />
            <dl className="mt-4 flex flex-col gap-4">
              <DataValue label="Kontakt">
                {enquiry.contactId ? (
                  <Link href={`/admin/vertrieb/beziehungen/${enquiry.contactId}`} className="text-gold-text underline underline-offset-4">
                    {enquiry.contactName ?? "öffnen"}
                  </Link>
                ) : null}
              </DataValue>
              <DataValue label="Organisation">{enquiry.organisationName}</DataValue>
            </dl>
          </div>

          <div className="mt-10">
            <SectionHeader title="Herkunft" as="h3" />
            <dl className="mt-4 flex flex-col gap-4">
              <DataValue label="Quelle">{enquiry.source}</DataValue>
              <DataValue label="Sprache">{enquiry.locale.toUpperCase()}</DataValue>
              <DataValue label="Seite">{enquiry.siteUrl}</DataValue>
              <DataValue label="Kampagne">{utm || null}</DataValue>
              <DataValue label="Eingegangen">
                <time dateTime={enquiry.createdAt}>{formatDateTime(enquiry.createdAt)}</time>
              </DataValue>
            </dl>
          </div>
        </aside>
      </div>
    </VertriebShell>
  )
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}
