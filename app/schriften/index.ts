import localFont from "next/font/local"

/*
 * Markenschriften, im Projekt mitgeliefert statt beim Build von Google geholt.
 *
 * Warum (22.10.2026): Die GitHub-Prüfung scheiterte bei jedem Lauf, weil
 * Google Fonts den GitHub-Servern keine Dateien lieferte („Retrying 1/3…“,
 * dann `next/font`-Absturz). Vercel kam durch, die CI nie — und eine Prüfung,
 * die immer rot ist, meldet echte Fehler nicht mehr. Lokal: kein Netz im
 * Build, keine Verbindung zu Google beim Besuch (DSGVO), gleiche Dateien
 * überall. Schon vorher so gelöst für Readex im Investor-Raum.
 *
 * Quelle: github.com/google/fonts (SIL Open Font License, OFL.txt hier).
 * Zugeschnitten mit fontTools auf genau die Zeichen, die vorher geladen
 * wurden: Latein + Latein-erweitert (ş ğ ı İ ç ö ü ä ß €) bzw. Arabisch;
 * variable Schriften auf den genutzten Gewichtsbereich begrenzt.
 *
 * Owner-Entscheidung (nicht ändern ohne Freigabe): Manrope für Überschriften,
 * M PLUS Rounded 1c für Fließtext, JetBrains Mono für Kennziffern.
 */

export const manrope = localFont({
  src: "./manrope.woff2",
  weight: "400 700",
  variable: "--font-manrope",
  display: "swap",
})

export const mplusRounded = localFont({
  src: [
    { path: "./mplus-rounded-400.woff2", weight: "400", style: "normal" },
    { path: "./mplus-rounded-500.woff2", weight: "500", style: "normal" },
    { path: "./mplus-rounded-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-mplus",
  display: "swap",
  preload: false,
})

export const jetbrains = localFont({
  src: "./jetbrains-mono.woff2",
  weight: "400 500",
  variable: "--font-jetbrains",
  display: "swap",
  adjustFontFallback: false,
})

export const readex = localFont({
  src: "./readex-arabic.woff2",
  weight: "300 700",
  variable: "--font-arabic",
  display: "swap",
  preload: false,
})

export const cairo = localFont({
  src: "./cairo-arabic.woff2",
  weight: "500 700",
  variable: "--font-arabic-display",
  display: "swap",
  preload: false,
})
