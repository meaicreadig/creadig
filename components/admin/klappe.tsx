import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"

/**
 * Aufklappbarer Abschnitt — lange Seiten bleiben kurz, nichts verschwindet.
 * Natives <details>: ohne JavaScript, per Tastatur bedienbar, Strg+F findet
 * auch zugeklappte Inhalte (Chrome öffnet sie dabei von selbst).
 *
 * `offen`: Was eine Entscheidung braucht, steht offen; Hintergrund und
 * Verlauf zugeklappt. `kasten`: als Karte (bg-card) statt frei auf der Seite.
 */
export function Klappe({
  titel,
  zahl,
  unter,
  offen = false,
  kasten = true,
  id,
  children,
}: {
  titel: string
  zahl?: ReactNode
  unter?: ReactNode
  offen?: boolean
  kasten?: boolean
  id?: string
  children: ReactNode
}) {
  return (
    <details
      id={id}
      open={offen}
      className={`group scroll-mt-6 ${kasten ? "rounded-3xl bg-card shadow-sm" : ""}`}
    >
      <summary
        className={`flex cursor-pointer list-none items-center justify-between gap-4 rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden ${
          kasten ? "p-6 md:px-7" : "py-1"
        }`}
      >
        <span className="flex min-w-0 flex-col gap-1">
          <span className="font-sans text-lg font-semibold tracking-tight text-foreground">{titel}</span>
          {unter ? <span className="text-sm text-muted-foreground">{unter}</span> : null}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {zahl !== undefined && zahl !== null ? <span className="text-meta text-muted-foreground">{zahl}</span> : null}
          <ChevronDown aria-hidden className="size-5 text-muted-foreground transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className={`flex flex-col gap-4 ${kasten ? "px-6 pb-6 md:px-7 md:pb-7" : "pt-4"}`}>{children}</div>
    </details>
  )
}
