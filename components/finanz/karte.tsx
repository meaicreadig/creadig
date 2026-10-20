import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"

/**
 * Eine Karte, die sich zur Tabelle öffnet: oben Titel und Kennzahlen (immer
 * sichtbar), darunter der Inhalt (auf Klick). Server-Komponente — `<details>`
 * braucht kein JavaScript.
 */
export function Karte({
  titel,
  untertitel,
  zahl,
  fuss,
  offen = false,
  warnung = false,
  children,
}: {
  titel: string
  untertitel?: string
  /** Die große Kennzahl rechts (Betrag oder Anzahl). */
  zahl?: string
  fuss?: string
  offen?: boolean
  warnung?: boolean
  children: ReactNode
}) {
  return (
    <details open={offen} className="bg-card group rounded-[1.75rem] shadow-sm">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 rounded-[1.75rem] px-6 py-5 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-base font-semibold">{titel}</span>
          {untertitel && <span className="text-muted-foreground text-xs">{untertitel}</span>}
        </div>
        {zahl && (
          <div className="flex flex-col items-end">
            <span className={`text-xl font-semibold tabular-nums ${warnung ? "text-destructive" : "text-primary"}`}>{zahl}</span>
            {fuss && <span className="text-muted-foreground text-xs">{fuss}</span>}
          </div>
        )}
        <ChevronDown className="text-muted-foreground size-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-line flex flex-col gap-2 border-t px-4 pt-3 pb-5 md:px-6">{children}</div>
    </details>
  )
}
