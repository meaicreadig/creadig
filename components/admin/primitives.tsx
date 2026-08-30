import type { ReactNode } from "react"

/**
 * Control Center — gemeinsame Bausteine.
 *
 * ---------------------------------------------------------------------------
 * HERKUNFT
 * Portiert aus dem v0-Prototyp (`components/ui/primitives.tsx`). Dort standen
 * sie auf Primer + styled-components; hier stehen sie auf den Token und
 * Utilities, die die öffentliche Seite schon benutzt.
 *
 * Das war möglich, weil der Prototyp seine Farben bereits über eine eigene
 * Semantik-Schicht (`--cd-*`) bezog und nie über Primer-Farbtoken. Die
 * Übersetzung ist deshalb eine Umhängung, keine Neuerfindung:
 *
 *   --cd-bg              → bg-background
 *   --cd-surface         → bg-surface        (`tile`)
 *   --cd-border          → border-line
 *   --cd-text-muted      → text-muted-foreground
 *   --cd-accent-text     → text-gold-text
 *   --cd-critical        → text-destructive
 *
 * Kein zweites Design-System. Wer hier eine Farbe braucht, die es oben nicht
 * gibt, hat entweder den falschen Baustein oder eine Frage an die Marke.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE PLAKETTEN NICHT GEFÜLLT SIND
 * Der Prototyp füllte Statusflächen. Dieses Repo hat am 28.08. das Gegenteil
 * entschieden (Commit 67b4388): die Knöpfe verlieren ihre Füllung, die Kante
 * trägt die Farbe. Eine gefüllte Plakette neben einem Umriss-Knopf wäre ein
 * zweiter Dialekt in derselben Oberfläche — also tragen auch hier Kante und
 * Schrift die Bedeutung.
 */

/* ------------------------------------------------------------------------ */
/* Fläche                                                                    */
/* ------------------------------------------------------------------------ */

export function Surface({
  children,
  padding = "md",
  className = "",
}: {
  children: ReactNode
  padding?: "none" | "sm" | "md"
  className?: string
}) {
  const pad = padding === "none" ? "" : padding === "sm" ? "p-4" : "p-5"
  return <div className={`tile bg-surface ${pad} ${className}`}>{children}</div>
}

/* ------------------------------------------------------------------------ */
/* Abschnittskopf — Titel links, Zählung rechts                              */
/* ------------------------------------------------------------------------ */

export function SectionHeader({
  title,
  id,
  count,
  as: As = "h2",
}: {
  title: string
  id?: string
  /** Rechts stehende Angabe. Weglassen, wenn es nichts zu zählen gibt. */
  count?: ReactNode
  as?: "h2" | "h3"
}) {
  return (
    <div className="border-line flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b pb-2">
      <As id={id} className="text-subhead text-base">
        {title}
      </As>
      {count !== undefined && (
        <span className="text-meta text-muted-foreground shrink-0">{count}</span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/* Plaketten                                                                 */
/* ------------------------------------------------------------------------ */

export type Severity = "neutral" | "attention" | "critical"

const SEVERITY: Record<Severity, string> = {
  neutral: "border-line text-muted-foreground",
  attention: "border-gold text-gold-text",
  critical: "border-destructive text-destructive",
}

export function Pill({
  children,
  severity = "neutral",
}: {
  children: ReactNode
  severity?: Severity
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-sm border px-2 py-0.5 text-xs leading-5 whitespace-nowrap ${SEVERITY[severity]}`}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------------ */
/* Wert mit Beschriftung                                                     */
/* ------------------------------------------------------------------------ */

export function DataValue({
  label,
  children,
}: {
  label: string
  /** `null`/`undefined` heißt: unbekannt. Nicht null, nicht leer — unbekannt. */
  children?: ReactNode
}) {
  const empty = children === null || children === undefined || children === ""
  return (
    <div>
      <dt className="text-meta text-muted-foreground">{label}</dt>
      <dd className={`mt-1 text-sm ${empty ? "text-muted-foreground" : "text-foreground"}`}>
        {empty ? <Unknown /> : children}
      </dd>
    </div>
  )
}

/**
 * Der Gedankenstrich ist der wichtigste Baustein dieser Datei.
 *
 * „0" ist eine Messung. „—" ist das Eingeständnis, nicht gemessen zu haben.
 * Wo eine Quelle fehlt, muss die Oberfläche das sagen und darf nicht die
 * beruhigendere Zahl zeigen. `title` macht es auch für Vorleseprogramme und
 * für die Maus eindeutig.
 */
export function Unknown() {
  return (
    <span className="text-muted-foreground" title="Keine Angabe">
      —<span className="sr-only"> keine Angabe</span>
    </span>
  )
}

/* ------------------------------------------------------------------------ */
/* Fehlende Quelle                                                           */
/* ------------------------------------------------------------------------ */

/**
 * Für ganze Flächen, deren Datenquelle es noch nicht gibt.
 *
 * Absichtlich keine Karte, kein Symbol, kein „Demnächst". Ein Satz, der
 * benennt, was fehlt und wer es liefern kann — mehr würde die Leere
 * dekorieren, statt sie zu erklären.
 */
export function UnavailableNote({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="border-line bg-muted/40 rounded-md border border-dashed p-5">
      <p className="text-subhead text-sm">{title}</p>
      <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">{children}</p>
    </div>
  )
}
