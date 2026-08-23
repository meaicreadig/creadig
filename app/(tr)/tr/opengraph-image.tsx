import { contentType, ogAlt, renderOgImage, size } from "@/app/_routes/og-image"

/**
 * Vorschaubild des türkischen Baums — `/tr/opengraph-image`.
 *
 * Es liegt unter `/tr` und nicht direkt in der Gruppe `(tr)`, weil Gruppen
 * keinen Pfad beisteuern: Zwei Dateien `opengraph-image.tsx` auf gleicher
 * Höhe stritten sonst um dieselbe Adresse.
 */
export const alt = ogAlt("tr")
export { size, contentType }

export default function OpengraphImage() {
  return renderOgImage("tr")
}
