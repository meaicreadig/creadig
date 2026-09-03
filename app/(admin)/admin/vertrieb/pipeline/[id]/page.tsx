import Link from "next/link"
import { notFound } from "next/navigation"

import {
  setOpportunityNextAction,
  setOpportunityNote,
  setOpportunityStatus,
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
} from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { SALES_LABELS_DE, SALES_STATES, TERMINAL_STATES, getVertriebStore } from "@/lib/lead-store"

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

export const metadata = { title: "Verkaufschance" }

export default async function ChanceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const store = getVertriebStore()
  if (!store) return <VertriebShell title="Verkaufschance" available={false}>{null}</VertriebShell>

  let opp, activities, lead
  try {
    opp = await store.getOpportunity(id)
    if (!opp) notFound()
    ;[activities, lead] = await Promise.all([
      store.activities("opportunity", id),
      store.leadForOpportunity(id),
    ])
  } catch {
    return <VertriebShell title="Verkaufschance" available={false}>{null}</VertriebShell>
  }

  const closed = TERMINAL_STATES.includes(opp.status)
  const overdue = opp.nextActionAt !== null && opp.nextActionAt < new Date().toISOString().slice(0, 10)

  return (
    <VertriebShell
      title={opp.title}
      lead={opp.organisationName ? `Organisation: ${opp.organisationName}` : undefined}
      meta={
        <Pill severity={opp.status === "lost" ? "critical" : closed ? "neutral" : "attention"}>
          {SALES_LABELS_DE[opp.status]}
        </Pill>
      }
      available
    >
      <Link href="/admin/vertrieb/pipeline" className="text-gold-text text-sm underline underline-offset-4">
        ← Zur Pipeline
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
        <div className="min-w-0">
          {/* ── Status ── */}
          <section aria-labelledby="status-titel">
            <SectionHeader id="status-titel" title="Status" />
            <form action={setOpportunityStatus.bind(null, opp.id)} className="mt-4 flex flex-wrap items-end gap-4">
              <AdminField label="Pipeline-Status" htmlFor="status">
                <AdminSelect id="status" name="status" defaultValue={opp.status}>
                  {SALES_STATES.map((s) => (
                    <option key={s} value={s}>{SALES_LABELS_DE[s]}</option>
                  ))}
                </AdminSelect>
              </AdminField>
              <AdminField label="Grund — nur bei „Verloren“" htmlFor="lostReason" className="flex-1 basis-64">
                <AdminInput id="lostReason" name="lostReason" defaultValue={opp.lostReason ?? ""} placeholder="frei formuliert" />
              </AdminField>
              <button type="submit" className="cta-quiet px-4 py-2 text-sm">Status speichern</button>
            </form>
          </section>

          {/* ── Nächster Schritt ── */}
          <section aria-labelledby="schritt-titel" className="mt-10">
            <SectionHeader id="schritt-titel" title="Nächster Schritt" />
            <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
              Ein Satz genügt. Das Feld leer zu lassen löscht den Schritt und
              sein Datum — es gibt hier absichtlich kein Aufgabenverwaltungssystem.
            </p>
            <form action={setOpportunityNextAction.bind(null, opp.id)} className="mt-4 flex flex-wrap items-end gap-4">
              <AdminField label="Was passiert als Nächstes" htmlFor="nextAction" className="flex-1 basis-64">
                <AdminInput id="nextAction" name="nextAction" defaultValue={opp.nextAction ?? ""} placeholder="z. B. Rückruf mit Terminvorschlag" />
              </AdminField>
              <AdminField label="Bis wann" htmlFor="nextActionAt">
                <AdminInput id="nextActionAt" name="nextActionAt" type="date" defaultValue={opp.nextActionAt ?? ""} />
              </AdminField>
              <button type="submit" className="cta-quiet px-4 py-2 text-sm">Schritt speichern</button>
            </form>
            {overdue && (
              <p className="text-destructive type-small mt-3">
                Überfällig seit {formatDate(opp.nextActionAt!)}.
              </p>
            )}
          </section>

          {/* ── Notiz ── */}
          <section aria-labelledby="notiz-titel" className="mt-10">
            <SectionHeader id="notiz-titel" title="Notiz" />
            <form action={setOpportunityNote.bind(null, opp.id)} className="mt-4">
              <AdminField label="Intern" htmlFor="note">
                <AdminTextarea id="note" name="note" rows={4} defaultValue={opp.note ?? ""} placeholder="Was man beim nächsten Mal wissen muss." />
              </AdminField>
              <button type="submit" className="cta-quiet mt-4 px-4 py-2 text-sm">Notiz speichern</button>
            </form>
          </section>

          <div className="mt-12">
            <ActivityLog entries={activities} />
          </div>
        </div>

        <aside className="min-w-0">
          <SectionHeader title="Beteiligte" />
          <dl className="mt-4 flex flex-col gap-4">
            <DataValue label="Kontakt">
              {opp.contactId ? (
                <Link href={`/admin/vertrieb/beziehungen/${opp.contactId}`} className="text-gold-text underline underline-offset-4">
                  {opp.contactName ?? "öffnen"}
                </Link>
              ) : null}
            </DataValue>
            <DataValue label="Organisation">{opp.organisationName}</DataValue>
          </dl>

          <div className="mt-10">
            <SectionHeader title="Herkunft" as="h3" />
            <dl className="mt-4 flex flex-col gap-4">
              <DataValue label="Quelle">{opp.source}</DataValue>
              <DataValue label="Aus Anfrage">
                {lead ? (
                  <Link href={`/admin/vertrieb/anfragen/${lead.id}`} className="text-gold-text font-mono text-xs underline underline-offset-4">
                    {lead.reference}
                  </Link>
                ) : null}
              </DataValue>
              <DataValue label="Geschätzter Wert">
                {/* `null` heisst nicht geschätzt — nicht null Euro. */}
                {opp.estimatedValue === null ? null : `${opp.estimatedValue.toLocaleString("de-DE")} €`}
              </DataValue>
            </dl>
          </div>

          <div className="mt-10">
            <SectionHeader title="Zeiten" as="h3" />
            <dl className="mt-4 flex flex-col gap-4">
              <DataValue label="Angelegt">
                <time dateTime={opp.createdAt}>{formatDateTime(opp.createdAt)}</time>
              </DataValue>
              <DataValue label="Letzter Kontakt">
                {opp.lastContactAt ? <time dateTime={opp.lastContactAt}>{formatDateTime(opp.lastContactAt)}</time> : null}
              </DataValue>
              <DataValue label="Zuletzt geändert">
                <time dateTime={opp.updatedAt}>{formatDateTime(opp.updatedAt)}</time>
              </DataValue>
            </dl>
          </div>
        </aside>
      </div>
    </VertriebShell>
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
