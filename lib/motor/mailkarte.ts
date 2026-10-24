import "server-only"

import { generateText } from "ai"

import { MODELL, json } from "@/lib/agenten/ki"
import type { Locale } from "@/lib/dictionary"
import { firmenText } from "@/lib/firmenwahrheit"
import type { Abfrage } from "@/lib/neon-abfrage"
import { buchungsUrl } from "@/lib/termine/mail"
import { alsLocale, legeBuchungslinkAn } from "@/lib/termine/store"

/**
 * MOTOR → FERTIGE MAIL (24.10.2026, Katman 2).
 *
 * Bis hier legte jeder Motor-Schritt nur eine Aufgabe an („Öffne den
 * Gesprächsraum und klicke …“). Emin musste jede Erstantwort selbst schreiben,
 * und `booking_links` blieb leer. Jetzt liegt die Mail fertig auf der Karte:
 * Empfänger, Betreff, Text in der Sprache des Gastes, persönlicher
 * Buchungslink. Emin prüft und klickt – gesendet wird erst dann.
 *
 * Ohne KI oder bei kaputter Antwort greift eine feste Vorlage: Die Karte
 * entsteht immer, nie eine halbe.
 */

/** Schritte, die als Mail an die Person gehen. Zusammenfassung/Angebot brauchen Emins Wissen aus dem Termin → bleiben Aufgabe. */
export const MAIL_SCHRITTE = new Set(["erstantwort", "erinnerung", "dankesmail", "beispiel", "abschluss"])

export type MotorMail = { an: string; name: string; betreff: string; text: string; link: string; orgId: string | null; kontaktId: string | null }

type Person = { name: string; email: string; kontaktId: string | null; orgId: string | null; firma: string; nachricht: string; locale: Locale }

async function person(q: Abfrage, subjekt: string, kontaktId: string | null): Promise<Person | null> {
  if (kontaktId) {
    const r = await q(
      `SELECT c.name, c.email, c.organisation_id, og.name AS firma,
              (SELECT l.message FROM leads l WHERE l.contact_id = c.id OR lower(l.email) = lower(c.email) ORDER BY l.created_at DESC LIMIT 1) AS nachricht,
              (SELECT l.locale FROM leads l WHERE l.contact_id = c.id OR lower(l.email) = lower(c.email) ORDER BY l.created_at DESC LIMIT 1) AS locale
         FROM contacts c LEFT JOIN organisations og ON og.id = c.organisation_id
        WHERE c.id = $1 AND c.excluded_reason IS NULL LIMIT 1`,
      [kontaktId],
    )
    const k = r[0]
    if (!k?.email) return null
    return {
      name: String(k.name ?? ""),
      email: String(k.email),
      kontaktId,
      orgId: (k.organisation_id as string | null) ?? null,
      firma: String(k.firma ?? ""),
      nachricht: String(k.nachricht ?? ""),
      locale: alsLocale(k.locale),
    }
  }
  if (!subjekt.startsWith("lead:")) return null
  const r = await q(`SELECT name, email, business, message, locale, contact_id FROM leads WHERE id = $1 LIMIT 1`, [subjekt.slice(5)])
  const l = r[0]
  if (!l?.email) return null
  return {
    name: String(l.name ?? ""),
    email: String(l.email),
    kontaktId: (l.contact_id as string | null) ?? null,
    orgId: null,
    firma: String(l.business ?? ""),
    nachricht: String(l.message ?? ""),
    locale: alsLocale(l.locale),
  }
}

const SPRACHE: Record<Locale, string> = { de: "Deutsch", tr: "Türkisch", en: "Englisch", ar: "Arabisch" }

const ZIEL: Record<string, string> = {
  erstantwort: "Erste Antwort auf ihre Anfrage über die Website: Danke, ein konkreter Satz zu ihrem Anliegen, Einladung zu einem kurzen Gespräch über den Link.",
  erinnerung: "Freundliches Nachfassen: Wir hatten geantwortet, bisher kein Termin. Kurz fragen, ob das Thema noch aktuell ist; Link erneut.",
  dankesmail: "Danke für das Gespräch, die vereinbarte Folge in einem Satz, Link für den Folgetermin.",
  beispiel: "Noch keine Reaktion. Ein passendes echtes Projekt aus den Referenzen in zwei Sätzen (nur aus den Firmenfakten, nichts erfinden), Link.",
  abschluss: "Freundlicher Abschluss nach einer Woche ohne Antwort: Tür offen lassen, keine weitere Nachricht ankündigen, Link für später.",
}

function vorlage(art: string, p: Person, link: string): { betreff: string; text: string } {
  const anrede = p.name ? `Guten Tag ${p.name},` : "Guten Tag,"
  const kern: Record<string, string> = {
    erstantwort: "vielen Dank für Ihre Anfrage. Am einfachsten klären wir alles in einem kurzen Gespräch – wählen Sie hier einen Termin, der Ihnen passt:",
    erinnerung: "ich wollte kurz nachfragen, ob Ihre Anfrage noch aktuell ist. Wenn ja, wählen Sie hier gern einen Termin:",
    dankesmail: "vielen Dank für das angenehme Gespräch. Für den nächsten Schritt können Sie hier direkt einen Termin wählen:",
    beispiel: "falls es hilft: Wir haben ähnliche Vorhaben bereits umgesetzt und zeigen Ihnen gern, wie das bei Ihnen aussehen könnte. Termin hier:",
    abschluss: "ich möchte Sie nicht weiter mit Nachrichten belasten. Wenn das Thema später wieder passt, finden Sie hier jederzeit einen Termin:",
  }
  const betreff: Record<string, string> = {
    erstantwort: "Ihre Anfrage bei creaDIG",
    erinnerung: "Kurze Nachfrage zu Ihrer Anfrage",
    dankesmail: "Danke für das Gespräch",
    beispiel: "Ein Beispiel aus unserer Arbeit",
    abschluss: "Gern später wieder",
  }
  return { betreff: betreff[art] ?? "creaDIG", text: `${anrede}\n\n${kern[art] ?? kern.erstantwort}\n\n${link}\n\nViele Grüße\nMuhammed Emin Akyol\ncreaDIG Solutions` }
}

/** Fertige Mail für einen Motor-Schritt – oder `null`, wenn es keine Mailadresse gibt (dann bleibt es eine Aufgabe). */
export async function motorMail(q: Abfrage, v: { art: string; subjekt: string; kontaktId: string | null }): Promise<MotorMail | null> {
  if (!MAIL_SCHRITTE.has(v.art)) return null
  const p = await person(q, v.subjekt, v.kontaktId).catch(() => null)
  if (!p) return null

  const token = await legeBuchungslinkAn({
    contactId: p.kontaktId,
    organisationId: p.orgId,
    meetingKind: "kennenlernen",
    topic: p.nachricht.slice(0, 200) || null,
    windowFrom: null,
    windowTo: null,
    gueltigTage: 21,
    von: "motor",
    locale: p.locale,
  })
  const link = buchungsUrl(token, p.locale)

  let fertig = vorlage(v.art, p, link)
  if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) {
    try {
      const { text } = await generateText({
        model: MODELL,
        maxOutputTokens: 900,
        prompt: `${firmenText("kurz")}
Schreibe für Muhammed Emin Akyol eine kurze persönliche Mail auf ${SPRACHE[p.locale]} (per Sie, 60–110 Wörter).
Empfänger: ${p.name || "unbekannt – neutrale Anrede"}${p.firma ? `, ${p.firma}` : ""}.
${p.nachricht ? `Ihre Nachricht an uns: """${p.nachricht.slice(0, 1200)}"""` : "Keine Nachricht bekannt."}
Zweck: ${ZIEL[v.art]}
Den Platzhalter {link} genau einmal als eigene Zeile einsetzen. Keine Preise, keine erfundenen Zahlen oder Kunden, kein Werbeton.
Antworte NUR mit JSON: {"betreff":"","text":"ab der Anrede, mit Gruß und Name"}`,
      })
      const r = json<{ betreff?: string; text?: string }>(text)
      if (r?.text?.includes("{link}") && r.betreff?.trim()) fertig = { betreff: r.betreff.trim().slice(0, 160), text: r.text.trim().replace("{link}", link) }
    } catch (error) {
      console.error("[motor] Mailtext per Vorlage:", error instanceof Error ? error.message : error)
    }
  }
  return { an: p.email, name: p.name, betreff: fertig.betreff, text: fertig.text, link, orgId: p.orgId, kontaktId: p.kontaktId }
}
