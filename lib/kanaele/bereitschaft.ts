import "server-only"

import { assistentDb } from "@/lib/assistent/store"
import { briefBereit, briefTestmodus } from "@/lib/brief/letterxpress"
import { issueFormToken, verifyFormToken } from "@/lib/lead-guard"
import { leadStoreConfigured } from "@/lib/lead-store"

/**
 * KANAL-BEREITSCHAFT (24.10.2026, Katman 2).
 *
 * Jeder Weg nach außen – Formular, Mail, Antworten, Brief, LinkedIn, Google,
 * Terminbuchung – wird hier ohne Versand geprüft. Ergebnis: grün (läuft),
 * gelb (läuft mit Einschränkung) oder rot (geht nicht), und bei gelb/rot der
 * genaue Handgriff für Emin. Der Puls meldet einen Wechsel auf rot als
 * Betriebsalarm, damit kein Kanal still ausfällt.
 */

export type KanalStand = "gruen" | "gelb" | "rot"
export type Kanal = { id: string; name: string; stand: KanalStand; detail: string; schritt?: string }

const TAG = 86_400_000

async function formular(): Promise<Kanal> {
  const name = "Website-Formular"
  const jetzt = Date.now()
  const token = await issueFormToken(jetzt - 5_000).catch(() => null)
  if (!token) return { id: "formular", name, stand: "rot", detail: "Formular-Token wird nicht ausgestellt.", schritt: "LEAD_TOKEN_SECRET in Vercel prüfen." }
  if ((await verifyFormToken(token, jetzt)) !== "ok") return { id: "formular", name, stand: "rot", detail: "Token-Prüfung schlägt fehl – Anfragen kämen nicht durch." }
  if (!leadStoreConfigured()) return { id: "formular", name, stand: "gelb", detail: "Anfragen kommen nur per Mail, nicht ins System.", schritt: "LEAD_STORE=neon setzen." }
  return { id: "formular", name, stand: "gruen", detail: "Token, Schutz und Speicher laufen; Anfrage startet sofort den Ablauf „Neue Anfrage“." }
}

async function mail(): Promise<Kanal> {
  const name = "Mailversand (Resend)"
  const key = process.env.RESEND_API_KEY?.trim()
  const from = process.env.MAIL_FROM?.trim() || process.env.LEAD_FROM?.trim()
  if (!key || !from) return { id: "mail", name, stand: "rot", detail: "RESEND_API_KEY oder LEAD_FROM fehlt." }
  const domain = from.match(/@([^>\s]+)/)?.[1]?.toLowerCase() ?? null
  try {
    const r = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(5_000) })
    const j = (await r.json().catch(() => null)) as { name?: string; data?: { name: string; status: string }[] } | null
    if (r.status === 401 && j?.name === "restricted_api_key") return { id: "mail", name, stand: "gruen", detail: "Sende-Schlüssel gültig." }
    if (r.status === 403) return { id: "mail", name, stand: "gruen", detail: "Sende-Schlüssel gültig (Domains nicht lesbar)." }
    if (!r.ok) return { id: "mail", name, stand: "rot", detail: `Resend lehnt den Schlüssel ab (${r.status}).` }
    const d = j?.data?.find((x) => x.name.toLowerCase() === domain)
    if (domain && d && d.status !== "verified") return { id: "mail", name, stand: "rot", detail: `Absender-Domain ${domain} ist bei Resend „${d.status}“.`, schritt: "DNS-Einträge bei Resend prüfen." }
    return { id: "mail", name, stand: "gruen", detail: `Absender ${domain ?? from} verifiziert.` }
  } catch {
    return { id: "mail", name, stand: "gelb", detail: "Resend gerade nicht erreichbar." }
  }
}

function antworten(): Kanal {
  const name = "Antworten zurück ins System"
  return process.env.MAIL_EINGANG_DOMAIN?.trim()
    ? { id: "eingang", name, stand: "gruen", detail: `Antworten laufen über ${process.env.MAIL_EINGANG_DOMAIN} zurück an die Karte.` }
    : { id: "eingang", name, stand: "gelb", detail: "Antworten landen nur im Postfach, nicht an der Karte.", schritt: "MAIL_EINGANG_DOMAIN setzen." }
}

function brief(): Kanal {
  const name = "Briefe (LetterXpress)"
  if (!briefBereit())
    return {
      id: "brief",
      name,
      stand: "rot",
      detail: "Kein Zugang – Brief-Karten können nicht versendet werden.",
      schritt: "Konto auf letterxpress.de → API-Schlüssel; in Vercel LETTERXPRESS_USER, LETTERXPRESS_API_KEY und für den ersten Versuch LETTERXPRESS_MODE=test setzen.",
    }
  if (briefTestmodus()) return { id: "brief", name, stand: "gelb", detail: "Testmodus: Briefe landen nur im LetterXpress-Postfach, gedruckt wird nichts.", schritt: "Nach dem Probebrief LETTERXPRESS_MODE entfernen." }
  return { id: "brief", name, stand: "gruen", detail: "Live: freigegebene Briefe werden gedruckt und verschickt." }
}

async function linkedin(): Promise<Kanal[]> {
  const q = await assistentDb()
  const rows = q ? ((await q(`SELECT id, name, expires_at FROM assistent_linkedin`, []).catch(() => [])) as { id: string; name: string | null; expires_at: string }[]) : []
  const zeile = (id: "inhaber" | "firma", name: string, fehlt: Omit<Kanal, "id" | "name">): Kanal => {
    const r = rows.find((x) => x.id === id)
    if (!r) return { id: `linkedin-${id}`, name, ...fehlt }
    const tage = Math.floor((new Date(r.expires_at).getTime() - Date.now()) / TAG)
    if (tage < 0) return { id: `linkedin-${id}`, name, stand: "rot", detail: "Verbindung abgelaufen.", schritt: "Unter Veröffentlichungen neu verbinden." }
    if (tage < 14) return { id: `linkedin-${id}`, name, stand: "gelb", detail: `Verbindung läuft in ${tage} Tagen ab.`, schritt: "Unter Veröffentlichungen neu verbinden (1 Klick)." }
    return { id: `linkedin-${id}`, name, stand: "gruen", detail: `${r.name ?? "Verbunden"} · gültig noch ${tage} Tage.` }
  }
  return [
    zeile("inhaber", "LinkedIn (Emin)", { stand: "rot", detail: "Nicht verbunden.", schritt: "Unter Veröffentlichungen verbinden." }),
    zeile("firma", "LinkedIn (Firmenseite)", {
      stand: "gelb",
      detail: "Wartet auf LinkedIns Prüfung der Community Management API (eingereicht Okt 2026, 10–14 Werktage). Bis dahin posten Beiträge über Emins Profil.",
      schritt: "Nach der Freigabe durch LinkedIn: Firmenseite unter Veröffentlichungen verbinden.",
    }),
  ]
}

function google(): Kanal {
  const name = "Google Search Console"
  return process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim()
    ? { id: "google", name, stand: "gruen", detail: "Suchbegriffe und Klicks fließen in Marketing und Redaktion." }
    : {
        id: "google",
        name,
        stand: "gelb",
        detail: "Ohne Zugang schreibt die Redaktion nach Recherche statt nach echten Suchdaten.",
        schritt: "Google Cloud → Dienstkonto + JSON-Schlüssel; Dienstkonto in der Search Console als Nutzer für creadig.de eintragen; JSON als GOOGLE_SERVICE_ACCOUNT_JSON in Vercel.",
      }
}

async function buchung(): Promise<Kanal> {
  const name = "Terminbuchung"
  const q = await assistentDb()
  if (!q) return { id: "buchung", name, stand: "rot", detail: "Speicher nicht erreichbar." }
  const r = (await q(`SELECT count(*)::int AS n, count(*) FILTER (WHERE used_at IS NOT NULL)::int AS b FROM booking_links`, []).catch(() => null)) as { n: number; b: number }[] | null
  if (!r) return { id: "buchung", name, stand: "rot", detail: "Tabelle booking_links fehlt." }
  return { id: "buchung", name, stand: "gruen", detail: `Persönliche Links in jeder Antwort-Mail · bisher ${r[0].n} erstellt, ${r[0].b} gebucht.` }
}

function besucher(): Kanal {
  return {
    id: "analytics",
    name: "Besucherzahlen",
    stand: "gelb",
    detail: "Die Seite misst nach Einwilligung, aber Web Analytics ist im Vercel-Projekt nicht eingeschaltet – das System sieht nicht, wie viele kommen.",
    schritt: "Vercel → Projekt → Analytics → Enable.",
  }
}

export async function pruefeKanaele(): Promise<Kanal[]> {
  const [f, m, l, b] = await Promise.all([formular(), mail(), linkedin(), buchung()])
  return [f, m, antworten(), b, brief(), ...l, google(), besucher()]
}
