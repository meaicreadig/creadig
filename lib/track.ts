import { track as vercelTrack } from "@vercel/analytics"
import { hasConsent } from "@/lib/consent"

/**
 * GROW-2 — das eine Ereignis, auf das es ankommt.
 *
 * Seitenaufrufe sagen, dass jemand da war. Sie sagen nicht, ob er angefragt
 * hat — und genau das ist die einzige Zahl, an der sich diese Seite messen
 * lassen muss. Ohne dieses Ereignis lässt sich später keine Anzeige bewerten:
 * Man sähe Klicks und Besuche, aber nie, welche davon zu einer Anfrage wurden.
 *
 * Die Einwilligung wird HIER noch einmal geprüft, nicht nur beim Laden des
 * Skripts. Ein Ereignis, das nach einem Widerruf noch abgesetzt wird, ist
 * genau der Fall, den ein Consent-Banner verhindern soll — und er entsteht
 * leicht, wenn zwischen Laden und Auslösen Minuten liegen.
 *
 * Es werden ausschließlich Feld-Namen übergeben, nie Feld-INHALTE: `source`
 * sagt „kontakt" oder „produkt-cassamea", niemals wer geschrieben hat.
 */
export function trackLead(source: string): void {
  if (typeof window === "undefined") return
  if (!hasConsent("statistics")) return
  try {
    vercelTrack("Anfrage", { source })
  } catch {
    // Messung darf niemals einen echten Vorgang stören.
  }
}
