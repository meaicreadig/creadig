import { cn } from "@/lib/utils"

/**
 * Sektions-Marke: 10px-Gold-Linie + Versal-Label.
 *
 * Diese drei Zeilen standen 16x wortgleich im Markup — und liefen bereits
 * auseinander (`gap-3` neben `gap-4`, mal `text-muted-foreground`, mal
 * `text-gold-text`). Jetzt gibt es eine Quelle; die Ausnahme ist ein
 * benannter Ton, kein handgeschriebener Sonderfall.
 *
 * `tone="gold"` tragen nur die abgesetzten Baender: dort steht das Label auf
 * eigener Flaeche und darf die Marke fuehren.
 */
export function SectionEyebrow({
  label,
  tone = "muted",
  className,
}: {
  label: string
  tone?: "muted" | "gold"
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span aria-hidden="true" className="bg-gold h-px w-10" />
      <p className={cn("eyebrow", tone === "gold" ? "text-gold-text" : "text-muted-foreground")}>
        {label}
      </p>
    </div>
  )
}
