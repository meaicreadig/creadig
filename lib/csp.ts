/**
 * ADM-07 · H28 — DIE POLICY DES ADMIN, AN EINER STELLE.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DER ADMIN EINE ANDERE RECHNUNG HAT ALS DIE ÖFFENTLICHE SEITE
 *
 * Für den Auftritt ist entschieden (`next.config.ts`): vollständige Policy
 * nur als Bericht, weil die Seite statisch ausgeliefert wird und keine
 * fremden Eingaben rendert. Diese Entscheidung nennt ihre eigene Bedingung —
 * und im Admin ist sie nicht erfüllt:
 *
 *   · Jede Admin-Seite ist `force-dynamic`. Es gibt nichts, was eine
 *     schärfere Policy vom CDN fernhalten könnte; sie kostet hier nichts.
 *   · Auf jeder zweiten Admin-Seite steht, was ein fremder Mensch in ein
 *     Formular geschrieben hat: Name, Betrieb, Nachricht.
 *
 * Scharf heisst NICHT „keine Inline-Skripte" — die Hydration von Next
 * braucht sie weiterhin, und ein Nonce hiesse dynamisches Rendern für die
 * ganze Seite. Scharf heisst: kein fremder Skript-Host, kein fremdes
 * Verbindungsziel, kein Frame, keine Schrift und kein Bild von irgendwoher.
 * Genau darüber verlassen Daten ein Admin-Werkzeug.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM SIE NICHT IN `next.config.ts` STEHT
 *
 * Gemessen am 22.09.2026: Ein zweiter `headers()`-Eintrag für `/admin/:pfad*`
 * kam an der Admin-Antwort nicht an — die Middleware beantwortet diese
 * Adressen selbst. Die Köpfe, die dort nachweislich ankommen, sind die aus
 * `ADMIN_RESPONSE_HEADERS`. Also steht sie dort, und zwar von hier.
 */
export const ADMIN_CSP = [
  "default-src 'self'",
  /* Next-Hydration und das Theme-Boot-Skript; siehe Abwägung in next.config.ts. */
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  /* Der Admin spricht mit niemandem ausser sich selbst. */
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ")
