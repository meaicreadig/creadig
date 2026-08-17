import { cn } from "@/lib/utils"

/**
 * Halbmond — gefüllte Sichel, nicht gestrichelte Kontur.
 *
 * Der Theme-Umschalter trug Lucides `Moon`: eine 1,5 px starke Umrisslinie.
 * Bei 16–20 px schließt sich diese Kontur optisch zum Ring — der Mond wurde
 * als Kreis gelesen, nicht als Mond. Daneben steht die Sonne als geschlossene
 * Scheibe mit Strahlen; zwei Rundformen, eine Bedeutung.
 *
 * Die Sichel hier ist EIN geschlossener Pfad aus zwei Kreisbögen:
 *   - Außenkante: Großbogen der Mondscheibe (r 9,5 um 12/12)
 *   - Innenkante: Gegenbogen des Schattenkreises (R 10, Mittelpunkt 5,5
 *     Einheiten in Richtung −50°)
 * Die Hörner sind die Schnittpunkte beider Kreise.
 *
 * Bewusst KEIN Zwei-Kreise-Pfad mit `evenodd`: die Even-Odd-Regel bildet die
 * symmetrische Differenz, nicht die Differenz — der Teil des Schattenkreises
 * außerhalb der Scheibe würde mitgefüllt und am viewBox-Rand als Klotz
 * abgeschnitten.
 */
export function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={cn("size-5 shrink-0", className)}
    >
      <path d="M20.33 16.56A9.5 9.5 0 1 1 6.06 4.58A10 10 0 0 0 20.33 16.56Z" />
    </svg>
  )
}
