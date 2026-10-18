/**
 * Reine Daten, kein "server-only" — darf auch ein Client-Component
 * importieren (components/finanz/belege/upload.tsx). lib/finanz/belege.ts
 * reexportiert dieselben Namen fuer den Server-Code, der schon darauf zeigt.
 */
/**
 * Die drei echten Einkommenssäulen des Owners plus Glasfaser (physische
 * Altlast, gehört zu keiner Säule) und die beiden Restkategorien. 'it',
 * 'software' und 'ecommerce' gab es früher getrennt — sie sind jetzt
 * 'digitalprodukte' (eine Säule: Produkt/Dienstleistung gegen wiederkehrendes
 * Geld). Bestehende Buchungen werden dorthin migriert, siehe BELEGE_SCHEMA
 * (lib/finanz/belege.ts) und AUFTRAEGE_SCHEMA (lib/finanz/auftraege/store.ts).
 */
export const GESCHAEFTSFELDER = [
  { key: "digitalprodukte", label: "Digitalprodukte & -dienstleistungen" },
  { key: "beratung", label: "Internationale Beratung" },
  { key: "content", label: "Content & eigene Marke" },
  { key: "glasfaser", label: "Glasfaser-Dienstleistung" },
  { key: "privat", label: "Privat / nicht betrieblich" },
  { key: "sonstiges", label: "Sonstiges" },
] as const

export type Geschaeftsfeld = (typeof GESCHAEFTSFELDER)[number]["key"]
export const istGeschaeftsfeld = (v: string): v is Geschaeftsfeld => GESCHAEFTSFELDER.some((g) => g.key === v)

/**
 * Alte Werte vor dem Säulen-Durchlauf. Eine bereits GEBUCHTE fin_buchungen-
 * Zeile (status='gebucht', quelle<>'fibero') ist GoBD-festgeschrieben
 * (scripts/migrations/030-gobd-festschreibung.sql, trg_fin_buchungen_
 * festschreibung) — "nur storniert_at darf noch gesetzt werden", auch
 * geschaeftsfeld nicht. Eine solche Zeile per UPDATE auf 'digitalprodukte'
 * umzuschreiben ist deshalb nicht nur unnötig, sondern verboten: der Trigger
 * wirft eine Exception. Die Übersetzung läuft darum beim LESEN (Gruppierung/
 * Anzeige, siehe lib/finanz/felder.ts und lib/finanz/diversifikation.ts),
 * nicht als Migration auf der Spalte selbst — die ursprüngliche Zuordnung
 * bleibt im Beleg stehen (keine Buchung verliert ihre Historie), erscheint
 * aber überall korrekt unter der neuen Säule. fin_belege, fin_leistungen und
 * fin_dokumente tragen keine solche Sperre auf geschaeftsfeld und werden
 * stattdessen direkt migriert (additiv in BELEGE_SCHEMA/AUFTRAEGE_SCHEMA).
 */
const ALTE_GESCHAEFTSFELDER: Record<string, Geschaeftsfeld> = { it: "digitalprodukte", software: "digitalprodukte", ecommerce: "digitalprodukte" }

/** Für Gruppierung/Anzeige: übersetzt auch einen alten, GoBD-eingefrorenen Wert auf seine neue Säule. */
export function geschaeftsfeldSchluessel(wert: string | null | undefined): string {
  if (!wert) return "offen"
  if (istGeschaeftsfeld(wert)) return wert
  return ALTE_GESCHAEFTSFELDER[wert] ?? wert
}

export const HAND_UPLOAD_MAX_BYTES = 20 * 1024 * 1024
export const HAND_UPLOAD_TYPEN = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/xml",
  "text/xml",
] as const
