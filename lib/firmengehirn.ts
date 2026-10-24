import { firmenText } from "@/lib/firmenwahrheit"

/**
 * Firmengehirn — Kontext für Termin- und Kampagnen-Mails.
 *
 * Katman 6 (24.10.2026): Hier stand eine zweite Firmenbeschreibung mit
 * „creaDIG solutions UG (haftungsbeschränkt)“ – rechtlich ist creaDIG ein
 * Einzelunternehmen. Fakten kommen jetzt ausschließlich aus
 * lib/firmenwahrheit.ts; hier bleibt nur, was keine Tatsache ist: der Ton.
 */

const TONFALL = [
  "Persönlich, ruhig, respektvoll — Sie-Form, außer der Kontakt duzt.",
  "Kurz: keine Floskeln, kein Marketing-Deutsch, keine Übertreibungen.",
  "Nutzen für den Betrieb zuerst, Technik nur so weit, wie sie verstanden wird.",
  "Immer ein klarer nächster Schritt.",
]

/** Der Kontext, den jede KI-Anfrage bekommt. */
export function firmengehirnText(): string {
  return `${firmenText("voll")}\n\nTonfall:\n${TONFALL.map((p) => `- ${p}`).join("\n")}`
}
