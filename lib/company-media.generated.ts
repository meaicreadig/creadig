/*
 * GENERIERT — nicht von Hand aendern.
 *
 * Quelle: public/images/unternehmen/<slot>.<jpg|png|webp|avif>
 * Erzeugt von: scripts/generate-company-media.mjs (npm-Hook `prebuild`)
 *
 * Foto ablegen und `npm run build` laufen lassen; diese Datei schreibt sich
 * dann selbst neu. Sie wird mitversioniert, damit ein Build auch ohne
 * vorherigen Skript-Lauf ein definiertes Ergebnis hat.
 */

/** Slots in Anzeigereihenfolge — die Beschriftung steht im Woerterbuch. */
export const COMPANY_PHOTO_SLOTS = ["buero","ico","arbeitsplatz","whiteboard"] as const

export type CompanyPhotoSlot = (typeof COMPANY_PHOTO_SLOTS)[number]

/** Oeffentliche Pfade der vorhandenen Fotos. Fehlender Slot = kein Foto. */
export const COMPANY_PHOTOS: Readonly<Partial<Record<CompanyPhotoSlot, string>>> = {

}
