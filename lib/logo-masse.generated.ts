/*
 * GENERIERT — nicht von Hand aendern.
 *
 * Quelle:      public/brand/**.{svg,png,webp,avif,jpg}
 * Erzeugt von: scripts/generate-logo-masse.mjs (npm-Hook `prebuild`)
 * Geprueft in: scripts/check-auftritt.mjs (postbuild) gegen dieselben Dateien
 *
 * Warum es das gibt, steht im Kopf des Skripts. Kurz: Ohne das echte
 * Seitenverhaeltnis kann eine Oberflaeche ein Logo nur auf gleiche HOEHE
 * stellen — und das verzerrt die breiten und verkleinert die hohen.
 */

export type LogoMass = {
  /** Breite der Quelldatei in ihren eigenen Einheiten (px bzw. viewBox). */
  breite: number
  /** Hoehe der Quelldatei. */
  hoehe: number
  /** breite / hoehe — die einzige Zahl, die beim Rendern zaehlt. */
  verhaeltnis: number
}

/** Oeffentlicher Pfad → Mass der echten Datei. */
export const LOGO_MASSE: Readonly<Record<string, LogoMass>> = {
  "/brand/creadig-logo-light.svg": { breite: 1743, hoehe: 186, verhaeltnis: 9.3710 },
  "/brand/creadig-logo.png": { breite: 5425, hoehe: 1500, verhaeltnis: 3.6167 },
  "/brand/creadig-logo.svg": { breite: 1743, hoehe: 186, verhaeltnis: 9.3710 },
  "/brand/products/cassamea.png": { breite: 6967, hoehe: 3917, verhaeltnis: 1.7787 },
  "/brand/products/cassamea.svg": { breite: 1324, hoehe: 158, verhaeltnis: 8.3797 },
  "/brand/products/fibero.svg": { breite: 1028.9, hoehe: 296.89, verhaeltnis: 3.4656 },
  "/brand/products/meahv.png": { breite: 695, hoehe: 739, verhaeltnis: 0.9405 },
  "/brand/products/meai.png": { breite: 133, hoehe: 75, verhaeltnis: 1.7733 },
  "/brand/clients/bir-damla-hayir.png": { breite: 354, hoehe: 381, verhaeltnis: 0.9291 },
  "/brand/clients/maqam.png": { breite: 854, hoehe: 146, verhaeltnis: 5.8493 },
  "/brand/clients/nv-swiss.png": { breite: 1080, hoehe: 235, verhaeltnis: 4.5957 },
}

/** Kein Markenzeichen ohne bekanntes Mass. */
export const OHNE_MASS: readonly string[] = []
