import { cn } from "@/lib/utils"

/**
 * Sektions-Marke: Gold-Linie + Versal-Label.
 *
 * Diese drei Zeilen standen 16x wortgleich im Markup — und liefen bereits
 * auseinander (`gap-3` neben `gap-4`, mal `text-muted-foreground`, mal
 * `text-gold-text`). Jetzt gibt es eine Quelle; die Ausnahme ist ein
 * benannter Ton, kein handgeschriebener Sonderfall.
 *
 * VIS-4 — drei Korrekturen an derselben Stelle:
 *   1. Die Linie war 1px. Auf einem hellen Grund war das ein Haar, kein
 *      Signal; die Marke, die die Seite fuehren soll, verschwand als
 *      Erstes. Jetzt 2px und etwas laenger.
 *   2. Der Standardton war `muted` — Gold trat nur in EINEM von 33
 *      Aufrufen auf. Gold ist die Primaerfarbe des Hauses, also ist es
 *      hier der Default; `tone="muted"` bleibt fuer Faelle, in denen das
 *      Label reine Nebeninformation ist.
 *   3. Linie und Label klebten aneinander (`gap-4`, buendig). Die Linie
 *      sitzt jetzt mit Abstand und auf der Mittelachse des Labels, statt
 *      es anzustossen.
 */
export function SectionEyebrow({
  label,
  tone = "gold",
  className,
}: {
  label: string
  tone?: "muted" | "gold"
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-5", className)}>
      <span aria-hidden="true" className="bg-gold h-0.5 w-12 shrink-0" />
      <p className={cn("eyebrow", tone === "muted" ? "text-muted-foreground" : "text-gold-text")}>
        {label}
      </p>
    </div>
  )
}
