import { massVon, optischeHoeheCss } from "@/lib/auftritt"
import type { LogoDunkel } from "@/lib/site-data"

/**
 * G14 · EIN Markenzeichen — und genau eine Stelle, die weiss, wie es
 * aussehen muss.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM ES DIESE KOMPONENTE GIBT
 *
 * Dasselbe `<img>` stand zweimal im Haus: in `logo-strip.tsx` (Startseite)
 * und in `logo-wall.tsx` (/unternehmen), jedes Mal mit eigener Hoehe, eigener
 * Kappung und derselben pauschalen Dunkelbehandlung. Beide trugen dieselben
 * drei Fehler, und beide haetten sie einzeln reparieren muessen:
 *
 *   1 · `h-10 w-auto max-w-[11rem]` QUETSCHT. Bei einem <img> steht
 *       `object-fit` ohne Angabe auf `fill`; wird die Breite durch `max-w`
 *       gekappt, waehrend die Hoehe fest steht, bleibt das Bild in voller
 *       Hoehe und wird schmal. Gemessen an den echten Dateien: CASSAMEA
 *       (8,38 : 1) verlor 46 % seiner Breite, MAQAM (5,85 : 1) 23 %.
 *
 *   2 · GLEICHE HOEHE IST NICHT GLEICHE GROESSE. Auf 32 px Hoehe belegte
 *       meahv 960 px², CASSAMEA 4.608 px² — Faktor 4,8 auf derselben Wand.
 *       Die Hoehe kommt jetzt aus der Flaeche (`optischeHoehe`), nicht
 *       umgekehrt.
 *
 *   3 · `dark:brightness-0 dark:invert` galt fuer ALLE. Zwei Marken
 *       brauchten es, vier verloren dafuer ihre Farbe. Jetzt entscheidet
 *       die Marke (`dunkel`), nicht die Klasse.
 *
 * Dazu der vierte, den erst das Messen zeigte: Die Farbe kam ausschliesslich
 * beim HOVER zurueck. Auf einem Telefon gibt es kein Hover — dort hat noch
 * nie jemand ein Logo dieses Hauses in seiner Farbe gesehen. `pointer-coarse`
 * beendet das.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS SIE NICHT ENTSCHEIDET
 *
 * OB ein Zeichen erscheinen darf. Das steht in Gate 13 (`releases`) und wird
 * vor dem Aufruf entschieden. Diese Komponente bekommt nur Zeichen, die
 * erscheinen duerfen — sie prueft keine Freigabe und kann keine erteilen.
 */
export type MarkenZeichenProps = {
  name: string
  logoPath: string | null
  /** Monogramm, wenn kein Logo vorliegt — nie ein kaputtes <img>. */
  mark: string
  /** Behandlung auf dunklem Grund. Ohne Angabe: die vorsichtige Silhouette. */
  dunkel?: LogoDunkel
  /**
   * Basisgroesse der Reihe als CSS-Laenge. Sie ist die Kante des gedachten
   * Quadrats, dessen FLAECHE jedes Zeichen belegt — nicht seine Hoehe.
   * Responsiv, weil sie es sein muss: `56px` am Schirm, `46px` am Telefon.
   */
  basis: string
  /** Klasse fuer das Monogramm, wenn kein Logo vorliegt. */
  monogrammClassName?: string
}

export function MarkenZeichen({
  name,
  logoPath,
  mark,
  dunkel = "silhouette",
  basis,
  monogrammClassName,
}: MarkenZeichenProps) {
  const mass = massVon(logoPath)

  /*
   * OHNE MASS KEIN BILD.
   *
   * Ist das Verhaeltnis der Datei unbekannt, laesst sich die Hoehe nicht
   * berechnen — und alles, was dann bliebe, waere die alte Quetschung. Dann
   * lieber das Monogramm: es ist ehrlich, und `check-auftritt` bricht
   * ohnehin ab, damit der Zustand nicht bleibt.
   */
  if (!logoPath || !mass) {
    return (
      <span
        aria-hidden="true"
        className={
          monogrammClassName ??
          "border-line-strong text-muted-foreground group-hover:border-[var(--brand)] group-hover:text-[var(--brand)] inline-flex size-9 items-center justify-center border text-xs font-semibold"
        }
      >
        {mark}
      </span>
    )
  }

  return (
    /*
      Bewusst ein rohes <img> und kein `next/image` (TECH-6): Wortmarken
      kommen als SVG, und die optimiert `next/image` nicht — es wuerde sie
      durchreichen und dafuer `dangerouslyAllowSVG` verlangen.
    */
    <img
      src={logoPath}
      alt={name}
      /* Fuer `auftritt-drill`: das Zeichen sagt selbst, was es sein will. */
      data-zeichen={name}
      data-verhaeltnis={mass.verhaeltnis}
      data-dunkel={dunkel}
      style={{
        ["--zeichen-basis" as string]: basis,
        height: optischeHoeheCss(mass.verhaeltnis),
        width: "auto",
      }}
      className={[
        /* Der Guertel zum Hosentraeger: sollte je ein Rahmen die Breite doch
           kappen, wird das Bild eingepasst statt verzerrt. */
        "object-contain",
        "opacity-70 grayscale transition-all duration-[var(--dur-2)]",
        "group-hover:opacity-100 group-hover:grayscale-0",
        /* Kein Zeiger, kein Hover — dort gilt der Endzustand sofort. */
        "pointer-coarse:opacity-100 pointer-coarse:grayscale-0",
        dunkel === "silhouette"
          ? "dark:brightness-0 dark:invert dark:group-hover:brightness-100 dark:group-hover:invert-0 dark:pointer-coarse:brightness-100 dark:pointer-coarse:invert-0"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  )
}
