import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

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
 *
 * ---------------------------------------------------------------------------
 * FORMULAR-CONTROLS
 * Browser liefern Select, Date und Search mit eigener Chromium-/Safari-/
 * Firefox-Optik. Hier steht EIN Dialekt: Haarlinie, Token, Fokus über das
 * globale `:focus-visible` (kein `outline-none`), native Semantik bleibt.
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

/**
 * DER SPEICHERSTAND — vier Zustaende, eine Stelle.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES IHN GIBT
 * Die Mappen im Vertrieb meldeten bis zum 09.09.2026 nur den FEHLER. Die
 * Befund-Anzeige begann mit `if (antwort.ok || befunde.length === 0) return
 * null` — bei Erfolg also nichts, und waehrend des Speicherns auch nichts.
 *
 * Der Owner drueckt „Speichern" und sieht: nichts. Er weiss nicht, ob der
 * Klick angekommen ist, ob noch gerechnet wird, ob es geklappt hat. Also
 * drueckt er noch einmal. Das ist keine Kosmetik — bei „Angebot senden" ist
 * der zweite Klick eine zweite Zusage.
 *
 * `useActionState` liefert den Wartezustand als drittes Element mit. Er war
 * da, er wurde nur nie ausgelesen.
 *
 * ---------------------------------------------------------------------------
 * WARUM `role="status"` UND KEIN TOAST
 * Ein Toast erscheint woanders als der Knopf und verschwindet von selbst —
 * wer die Maus fuehrt, sieht ihn nicht immer, und wer vorliest, gar nicht.
 * Diese Meldung steht, wo gehandelt wurde, und `aria-live="polite"` bringt
 * sie ins Vorleseprogramm, ohne die Eingabe zu unterbrechen.
 */
export function Speicherstand({
  wartet,
  ok,
  punkte,
  erfolgssatz = "Gespeichert.",
}: {
  wartet: boolean
  /**
   * `null` heisst: noch nichts abgeschickt. Nicht dasselbe wie Erfolg —
   * sonst stuende „Gespeichert." schon beim Oeffnen der Seite.
   */
  ok: boolean | null
  /**
   * Die offenen Punkte, auf ein Vokabular gebracht.
   *
   * Die Mappen nennen sie verschieden — `befunde`/`abschnitt` beim Angebot,
   * `maengel`/`bereich` bei der Lieferung. Das Primitive kennt keines von
   * beiden: Wer es benutzt, uebersetzt einmal beim Aufruf, und diese
   * Anzeige bleibt von der Fachsprache der Mappe unabhaengig.
   */
  punkte: { wo: string; satz: string }[]
  erfolgssatz?: string
}) {
  const gescheitert = ok === false && punkte.length > 0
  const gelungen = ok === true
  if (!wartet && !gescheitert && !gelungen) return null

  return (
    <div role="status" aria-live="polite" className="mt-4">
      {wartet ? (
        <p className="type-small text-muted-foreground">Wird gespeichert …</p>
      ) : gelungen ? (
        <p className="type-small text-gold-text">{erfolgssatz}</p>
      ) : (
        <Surface padding="sm">
          <p className="type-small text-subhead">
            Das geht so nicht hinaus — {punkte.length} offene
            {punkte.length === 1 ? "r Punkt" : " Punkte"}:
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {punkte.map((b, i) => (
              <li key={i} className="type-small text-muted-foreground text-pretty">
                <span className="text-foreground">{b.wo}: </span>
                {b.satz}
              </li>
            ))}
          </ul>
        </Surface>
      )}
    </div>
  )
}

/**
 * Der Hinweis, dass eine Liste abgeschnitten sein koennte.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES IHN GIBT
 * Jede Liste im Vertrieb holt hoechstens eine feste Zahl Zeilen — 100, 200,
 * 500. Vier der sechs sagen dazu „N von Total"; wer dort 100 von 340 liest,
 * weiss, dass er nicht alles sieht, und kann suchen oder filtern.
 *
 * Zwei sagten es nicht. Recherche und Verlust zeigten schlicht, was kam. Eine
 * Liste, die bei genau ihrer Obergrenze endet, sieht aus wie eine
 * vollstaendige — und der Owner sucht Datensatz 137 dann in einer Liste, die
 * bei 100 aufgehoert hat, ohne es zu sagen.
 *
 * Der Hinweis behauptet nichts, was er nicht weiss: Er sagt „koennte", weil
 * eine Liste, die genau die Obergrenze trifft, auch genau so lang sein kann.
 * Das ist dieselbe Unterscheidung wie ueberall in diesem Haus — nicht
 * gemessen ist nicht null.
 */
export function Abschneidehinweis({
  gezeigt,
  grenze,
  wie,
}: {
  gezeigt: number
  grenze: number
  /** Was der Owner tun kann, um den Rest zu sehen. */
  wie: string
}) {
  if (gezeigt < grenze) return null
  return (
    <p className="type-small text-muted-foreground border-line mt-4 border-s-2 py-1 ps-4 text-pretty">
      Diese Liste zeigt {grenze} Eintraege — die Obergrenze. Ob es mehr gibt, steht hier nicht.
      {" "}
      {wie}
    </p>
  )
}

/* ------------------------------------------------------------------------ */
/* Formular — ein Dialekt für Safari, Chrome und Firefox                     */
/* ------------------------------------------------------------------------ */

/**
 * Gemeinsame Kante für Text, Suche, Datum und Select.
 *
 * Bewusst kein `outline-none`: Die globale `:focus-visible`-Regel in
 * `globals.css` (Gold-Umriss) gilt auch hier — sonst entstünde ein zweiter
 * Fokusstil neben dem Rest der Oberfläche.
 */
const controlClass =
  "w-full min-w-0 rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground " +
  "placeholder:text-muted-foreground " +
  "transition-colors duration-[var(--dur-1)] " +
  "focus-visible:border-gold " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "aria-invalid:border-destructive"

export function AdminField({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string
  htmlFor: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={htmlFor} className="text-meta text-muted-foreground block">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

export function AdminInput({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-admin-control={type === "date" || type === "search" ? type : "input"}
      className={cn(controlClass, className)}
      {...props}
    />
  )
}

/**
 * Mehrzeiliger Text — Notizen.
 *
 * `field-sizing: content` waere schoener, wird aber noch nicht ueberall
 * unterstuetzt; `rows` plus `resize-y` funktioniert in Safari, Chrome und
 * Firefox gleich. Horizontal NICHT skalierbar: Eine Notiz, die aus ihrer
 * Spalte herauswaechst, bricht das Raster.
 */
export function AdminTextarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      rows={rows}
      data-admin-control="textarea"
      className={cn(controlClass, "resize-y leading-relaxed", className)}
      {...props}
    />
  )
}

export function AdminSelect({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-admin-control="select"
        className={cn(controlClass, "appearance-none bg-background pe-9", className)}
        {...props}
      >
        {children}
      </select>
      <span
        aria-hidden
        className="text-muted-foreground pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2"
      >
        <svg viewBox="0 0 16 16" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  )
}
