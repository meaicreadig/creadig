import Link from "next/link"
import { notFound } from "next/navigation"

import { updateNextAction, updateStatus } from "@/app/(admin)/admin/leads/[id]/actions"
import { AdminShell } from "@/components/admin/admin-shell"
import {
  DataValue,
  Pill,
  SectionHeader,
  Surface,
  UnavailableNote,
} from "@/components/admin/primitives"
import {
  SALES_LABELS_DE,
  SALES_STATES,
  TERMINAL_STATES,
  getLead,
  leadStoreConfigured,
} from "@/lib/lead-store"

/**
 * Eine Anfrage.
 *
 * ---------------------------------------------------------------------------
 * ZWEI DRITTEL ARBEIT, EIN DRITTEL ZUSAMMENHANG
 * Die Aufteilung stammt aus dem v0-Prototyp und ist die einzige Entscheidung
 * dieser Seite, die nicht aus den Daten folgt: links das, was man liest und
 * ändert (Nachricht, Status, nächster Schritt), rechts das, was man
 * nachschlägt (Kontakt, Herkunft, Zeiten). Wer arbeitet, schaut links; wer
 * prüft, schaut rechts.
 *
 * ---------------------------------------------------------------------------
 * KEINE ZEITLEISTE
 * Der Prototyp zeigt hier eine Chronik aus Statuswechseln, Notizen und
 * Terminen. Dafür gibt es keinen Ereignisspeicher: `LeadRecord` hält nur den
 * AKTUELLEN Zustand plus `createdAt`/`updatedAt`. Eine Chronik müsste also
 * erfunden werden — und eine erfundene Chronik ist schlimmer als keine, weil
 * sie aussieht wie ein Protokoll. Stattdessen stehen die beiden Zeitpunkte,
 * die wirklich gespeichert sind.
 *
 * ---------------------------------------------------------------------------
 * BETRIEBSCHECK
 * Der Betriebscheck wird als TEXT übermittelt (`checkSummary()` schreibt ihn
 * in die Nachricht) — es gibt keine gespeicherten Einzelantworten und keine
 * Ebenenwerte. Darum steht hier die Zusammenfassung, wie sie eingegangen ist,
 * und keine nachgebauten Balken. Und er bleibt, was er ist: eine Reifegrad-
 * Diagnose, keine Kaufwahrscheinlichkeit.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Anfrage" }

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!leadStoreConfigured()) {
    return (
      <AdminShell title="Anfrage">
        <UnavailableNote title="Kein Lead-Speicher eingerichtet">
          Ohne <code>LEAD_STORE</code> gibt es nichts nachzuschlagen.
        </UnavailableNote>
      </AdminShell>
    )
  }

  let lead
  try {
    lead = await getLead(id)
  } catch {
    return (
      <AdminShell title="Anfrage">
        <UnavailableNote title="Speicher nicht erreichbar">
          Die Anfrage konnte nicht geladen werden. Das heisst <strong>nicht</strong>,
          dass es sie nicht gibt.
        </UnavailableNote>
      </AdminShell>
    )
  }

  /* Erreichbarer Speicher, kein Treffer — das ist ein echtes 404. */
  if (!lead) notFound()

  const isBetriebscheck = lead.source === "betriebscheck"
  const utm = [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" · ")

  return (
    <AdminShell
      salesAvailable
      title={lead.business ?? lead.name}
      lead={`Eingegangen über ${lead.source}.`}
      meta={
        <>
          <span className="block font-mono text-xs">{lead.reference}</span>
          <span className="mt-1 block">
            <Pill
              severity={
                lead.salesStatus === "lost"
                  ? "critical"
                  : TERMINAL_STATES.includes(lead.salesStatus)
                    ? "neutral"
                    : "attention"
              }
            >
              {SALES_LABELS_DE[lead.salesStatus]}
            </Pill>
          </span>
        </>
      }
    >
      <Link href="/admin/leads" className="text-gold-text text-sm underline underline-offset-4">
        ← Alle Anfragen
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
        {/* ── Arbeitsfläche ── */}
        <div className="min-w-0">
          <section aria-labelledby="nachricht-titel">
            <SectionHeader
              id="nachricht-titel"
              title={isBetriebscheck ? "Betriebscheck" : "Nachricht"}
            />
            {isBetriebscheck && (
              <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
                Reifegrad-Diagnose, wie der Absender sie ausgefüllt hat. Keine
                Kaufwahrscheinlichkeit und keine Bewertung des Absenders.
              </p>
            )}
            {lead.message ? (
              <Surface className="mt-4">
                <p className="type-body text-foreground/90 whitespace-pre-line">{lead.message}</p>
              </Surface>
            ) : (
              <p className="type-small text-muted-foreground mt-4">Keine Nachricht übermittelt.</p>
            )}
          </section>

          {/* ── Status ── */}
          <section aria-labelledby="status-titel" className="mt-10">
            <SectionHeader id="status-titel" title="Status" />
            <form action={updateStatus.bind(null, lead.id)} className="mt-4 flex flex-wrap items-end gap-4">
              <div>
                <label htmlFor="status" className="text-meta text-muted-foreground block">
                  Vertriebsstatus
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={lead.salesStatus}
                  className="border-line bg-background mt-1.5 rounded-sm border px-3 py-2 text-sm"
                >
                  {SALES_STATES.map((state) => (
                    <option key={state} value={state}>
                      {SALES_LABELS_DE[state]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0 flex-1 basis-64">
                <label htmlFor="lostReason" className="text-meta text-muted-foreground block">
                  Grund — nur bei „Verloren“
                </label>
                <input
                  id="lostReason"
                  name="lostReason"
                  type="text"
                  defaultValue={lead.lostReason ?? ""}
                  placeholder="frei formuliert"
                  className="border-line bg-background mt-1.5 w-full rounded-sm border px-3 py-2 text-sm"
                />
              </div>

              <button type="submit" className="cta-quiet px-4 py-2 text-sm">
                Status speichern
              </button>
            </form>
          </section>

          {/* ── Nächster Schritt ── */}
          <section aria-labelledby="schritt-titel" className="mt-10">
            <SectionHeader id="schritt-titel" title="Nächster Schritt" />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
              Ein Satz genügt. Das Feld leer zu lassen, löscht den Schritt —
              es gibt hier absichtlich kein Aufgabenverwaltungssystem.
            </p>
            <form
              action={updateNextAction.bind(null, lead.id)}
              className="mt-4 flex flex-wrap items-end gap-4"
            >
              <div className="min-w-0 flex-1 basis-64">
                <label htmlFor="nextAction" className="text-meta text-muted-foreground block">
                  Was passiert als Nächstes
                </label>
                <input
                  id="nextAction"
                  name="nextAction"
                  type="text"
                  defaultValue={lead.nextAction ?? ""}
                  placeholder="z. B. Rückruf mit Terminvorschlag"
                  className="border-line bg-background mt-1.5 w-full rounded-sm border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="nextActionAt" className="text-meta text-muted-foreground block">
                  Bis wann
                </label>
                <input
                  id="nextActionAt"
                  name="nextActionAt"
                  type="date"
                  defaultValue={lead.nextActionAt?.slice(0, 10) ?? ""}
                  className="border-line bg-background mt-1.5 rounded-sm border px-3 py-2 text-sm"
                />
              </div>

              <button type="submit" className="cta-quiet px-4 py-2 text-sm">
                Schritt speichern
              </button>
            </form>
          </section>
        </div>

        {/* ── Zusammenhang ── */}
        <aside aria-labelledby="kontext-titel" className="min-w-0">
          <SectionHeader id="kontext-titel" title="Kontakt" />
          <dl className="mt-4 flex flex-col gap-4">
            <DataValue label="Name">{lead.name}</DataValue>
            <DataValue label="Betrieb">{lead.business}</DataValue>
            <DataValue label="E-Mail">
              <a href={`mailto:${lead.email}`} className="underline underline-offset-4">
                {lead.email}
              </a>
            </DataValue>
            <DataValue label="Telefon">
              {lead.phone ? (
                <a href={`tel:${lead.phone}`} className="underline underline-offset-4">
                  {lead.phone}
                </a>
              ) : null}
            </DataValue>
          </dl>

          <div className="mt-10">
            <SectionHeader title="Herkunft" as="h3" />
            <dl className="mt-4 flex flex-col gap-4">
              <DataValue label="Quelle">{lead.source}</DataValue>
              <DataValue label="Sprache">{lead.locale.toUpperCase()}</DataValue>
              <DataValue label="Seite">{lead.siteUrl}</DataValue>
              {/* UTM nur, wenn wirklich etwas mitkam — kein leeres Feldtrio. */}
              <DataValue label="Kampagne">{utm || null}</DataValue>
            </dl>
          </div>

          <div className="mt-10">
            <SectionHeader title="Zeiten" as="h3" />
            <dl className="mt-4 flex flex-col gap-4">
              <DataValue label="Eingegangen">
                <time dateTime={lead.createdAt}>{formatDateTime(lead.createdAt)}</time>
              </DataValue>
              <DataValue label="Zuletzt geändert">
                <time dateTime={lead.updatedAt}>{formatDateTime(lead.updatedAt)}</time>
              </DataValue>
            </dl>
            <p className="type-small text-muted-foreground mt-4 text-pretty">
              Mehr Zeitpunkte gibt es nicht: Es wird kein Ereignisprotokoll
              geführt, also gibt es hier auch keine Chronik.
            </p>
          </div>
        </aside>
      </div>
    </AdminShell>
  )
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
