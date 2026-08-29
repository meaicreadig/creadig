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
type TrackProps = Record<string, string | number | boolean | null | undefined>

/**
 * MP-B Regel D — generisches Ereignis + Properties.
 * Keine PII. Consent hier noch einmal prüfen.
 */
export function trackEvent(name: string, props: TrackProps = {}): void {
  if (typeof window === "undefined") return
  if (!hasConsent("statistics")) return
  const clean: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined) continue
    clean[key] = value
  }
  try {
    vercelTrack(name, clean)
  } catch {
    // Messung darf niemals einen echten Vorgang stören.
  }
}

export function trackLead(source: string): void {
  // Alias behalten (bestehende Aufrufer). Zusätzlich Spec-Name lead_submitted.
  trackEvent("Anfrage", { source })
  trackEvent("lead_submitted", { source })
}
