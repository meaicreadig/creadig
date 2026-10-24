/**
 * Agenten-Kreise — EINE Stelle (Katman 6, 24.10.2026).
 *
 * Bis hierher gab es zwei Listen mit demselben Namen „AUSSEN_AGENTEN“ und
 * verschiedenem Inhalt (lib/lernen/store.ts, lib/koordination/koordinator.ts).
 * Es sind zwei verschiedene Fragen – deshalb zwei Namen, eine Datei:
 */

/** Sprechen fremde Firmen/Personen an. Für sie gilt die harte Zielsperre: Was Emin verworfen hat, kommt nicht wieder. */
export const AKQUISE_AGENTEN = ["jaeger", "vertrieb", "partner", "kundenbetreuung", "international", "golf"] as const

/**
 * Ihre internen Aufträge berühren Kunde, Geld oder Außenwirkung – die Koordination entscheidet sie nie allein,
 * sondern legt sie Emin vor. Jäger/Vertrieb/International fehlen bewusst: ihre Außenwirkung sind die Karten
 * (Brief, Mail) selbst, ihre Ziellisten und Wochenpläne bleiben intern.
 */
export const AUSSENWIRKUNG_AGENTEN = ["motor", "finanz", "forderungen", "projekte", "golf", "kapital", "investor", "kundenbetreuung", "partner", "angebot"] as const
