import Link from "next/link"

import { Pill } from "@/components/admin/primitives"
import { SALES_LABELS_DE, TERMINAL_STATES, type LeadRecord } from "@/lib/lead-store"

/**
 * Die Anfragenliste.
 *
 * ---------------------------------------------------------------------------
 * WARUM EINE TABELLE UND KEINE KARTEN
 * Aus dem v0-Prototyp übernommen, und dort schon richtig entschieden: Wer
 * zwanzig Anfragen überfliegt, vergleicht Spalten. Karten zwingen das Auge
 * bei jedem Eintrag zurück an den Zeilenanfang. Der Prototyp benutzt dafür
 * echtes `<table>`-Markup statt einer Gitter-Nachbildung aus `div`s — das
 * ist hier eins zu eins übernommen, weil nur damit ein Vorleseprogramm
 * „Spalte Status, Zeile 4" sagen kann.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER NICHT STEHT
 * Kein Zuständiger, kein Auftragswert, kein Abschluss-Prozentsatz, keine
 * Bewertung. Nicht aus Zurückhaltung, sondern weil es die Felder nicht gibt:
 * `LeadRecord` führt sie bewusst nicht (§39). Eine Spalte, die geschätzt
 * werden müsste, sieht nach drei Monaten aus wie eine gemessene.
 */
export function LeadsTable({ rows }: { rows: LeadRecord[] }) {
  return (
    <div className="border-line mt-6 overflow-x-auto rounded-md border">
      <table className="w-full min-w-[52rem] border-collapse text-left">
        <caption className="sr-only">
          Anfragen mit Nummer, Absender, Herkunft, Status, Eingang und nächstem Schritt
        </caption>
        <thead>
          <tr className="border-line bg-muted/50 border-b">
            <Th>Nummer</Th>
            <Th>Absender</Th>
            <Th>Herkunft</Th>
            <Th>Status</Th>
            <Th>Eingang</Th>
            <Th>Nächster Schritt</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((lead) => (
            <tr key={lead.id} className="border-line hover:bg-muted/40 border-b last:border-b-0">
              <Td>
                {/*
                  Die Nummer ist der Link. Sie ist das, was in der Mail steht
                  und was der Anrufer nennt — also der Weg, den jemand sucht.
                */}
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="text-gold-text font-mono text-xs underline underline-offset-4"
                >
                  {lead.reference}
                </Link>
              </Td>
              <Td>
                <span className="text-subhead block text-sm">{lead.business ?? lead.name}</span>
                {lead.business && (
                  <span className="text-muted-foreground block text-xs">{lead.name}</span>
                )}
              </Td>
              <Td>
                <span className="text-xs">{lead.source}</span>
                <span className="text-muted-foreground block text-xs uppercase">{lead.locale}</span>
              </Td>
              <Td>
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
              </Td>
              <Td>
                <time dateTime={lead.createdAt} className="text-xs tabular-nums">
                  {formatDate(lead.createdAt)}
                </time>
              </Td>
              <Td>
                {lead.nextAction ? (
                  <>
                    <span className="block text-xs">{lead.nextAction}</span>
                    {lead.nextActionAt && (
                      <span
                        className={`block text-xs tabular-nums ${
                          isOverdue(lead.nextActionAt) ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {formatDate(lead.nextActionAt)}
                        {isOverdue(lead.nextActionAt) && " · überfällig"}
                      </span>
                    )}
                  </>
                ) : (
                  /*
                    Kein nächster Schritt ist kein leeres Feld, sondern der
                    haeufigste Grund, warum eine Anfrage liegen bleibt.
                  */
                  <span className="text-gold-text text-xs">kein nächster Schritt</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th scope="col" className="text-meta text-muted-foreground px-4 py-2.5 font-normal">
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })
}

function isOverdue(iso: string): boolean {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return false
  return date.getTime() < Date.now()
}
