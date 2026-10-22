import "server-only"

import { generateText, stepCountIs, tool, type ModelMessage } from "ai"
import { z } from "zod"

import { sperre } from "@/lib/recht/compliance"

import { morgenBriefing } from "@/lib/admin/morgen-briefing"
import { ladeStatus, messenFuerKalender } from "@/lib/messen-radar"
import { ladeVerkaufslage, MONATSZIEL_EUR } from "@/lib/verkaufen"

import { protokolliereFaden } from "@/lib/zentrale/faden-protokoll"

import { firmenRahmen } from "./rahmen"
import { assistentDb, FREIGABE_ARTEN, ladeFreigaben, ladeRaete, legeFreigabeAn, type Nachricht } from "./store"

const MODELL = "openai/gpt-5.4-mini"
const BILD_MODELL = "anthropic/claude-sonnet-4.6"

const SYSTEM = `Du bist der Chief of Staff von Muhammed Emin Akyol, Inhaber von creaDIG Solutions (Einzelunternehmen, System-Haus für digitale Betriebe; Produkte: fibero = Glasfaser-Montage-Software, stammo = digitale Stempelkarte).
Ziel: Er soll als Selbstständiger nach vorne kommen — Kunden, Umsatz, Kapital. Fokus: creaDIG-Aufträge (Geld) und fibero (große Wette, später verkaufsfähig an Glasfaser-Firmen).

Regeln:
- Antworte in der Sprache, in der er schreibt (Deutsch oder Türkisch). Kurz, klar, wie ein erfahrener Sparringspartner. Keine Floskeln.
- Hole dir Fakten über die Werkzeuge, bevor du über Zahlen, Abschlüsse oder Messen sprichst. Erfinde NIE Zahlen, Firmen, Fristen oder Fördersummen. Wenn du etwas nicht weißt, sag es und schlage vor, wie man es herausfindet.
- Du handelst nie selbst. Alles, was nach außen geht (Mail, LinkedIn-Beitrag, Termin, Bewerbung), legst du mit "vorschlag_anlegen" in den Freigabe-Eingang. Er gibt frei.
- Interne Arbeit (art "aufgabe" oder "notiz") läuft unsichtbar im Hintergrund: Geschäftsleitung und Abteilungen erledigen sie selbst. Sag ihm nie, er müsse sie freigeben oder abhaken. Produkt- und Firmenfreigaben sind Verwaltung, keine Aufgabe für ihn.
- Absprachen zu Kunden/Chancen (Termin, nächster Schritt, Ort, Verband, wer entscheidet) speicherst du SOFORT mit "absprache_speichern". Bestätige danach kurz, was gespeichert ist. Er soll nichts zweimal sagen müssen.
- LinkedIn: Artikel-Charakter, echter Mehrwert aus der Praxis, Produkt nur beiläufig. Keine Werbesprache.
- Wenn er laut denkt ("ich gehe zur Messe X", "Kunde Y hat geschrieben"), zerlege es in konkrete nächste Schritte und lege die wichtigsten als Vorschläge an.
- Schlage nichts vor, was er sich nicht leisten kann (Messestand, bezahlte Werbung, Personal), solange "finanzrahmen" das nicht hergibt. Biete stattdessen die kostenlose Variante an.
- Er ist allein. Ihr (die Truppe) seid sein Team: denkt wie Mitinhaber, sagt auch Nein, wenn etwas vom Fokus ablenkt.
- Ende jede Antwort mit genau einem klaren nächsten Schritt.`

export type ChatBild = { base64: string; mediaType: string }

export async function antworte(verlauf: Nachricht[], bild?: ChatBild): Promise<string> {
  const tools = {
    widerspruch_eintragen: tool({
      description:
        "Trägt eine E-Mail-Adresse oder Domain dauerhaft in die Sperrliste ein (Widerspruch, Absage, Spam-Drohung). Danach geht nie wieder eine Mail dorthin.",
      inputSchema: z.object({
        adresse: z.string().describe("E-Mail-Adresse oder Domain, z. B. info@firma.de oder firma.de"),
        grund: z.string().describe("Kurz, z. B. 'Kein Interesse, droht mit rechtlichen Schritten'"),
      }),
      execute: async ({ adresse, grund }) => {
        const id = await sperre(adresse, grund, "chat")
        return id ? { gesperrt: adresse } : { fehler: "Adresse ungültig oder Datenbank nicht erreichbar" }
      },
    }),
    verkaufslage: tool({
      description: "Offene Abschlüsse (Pipeline), Monatsziel, Warnungen und fällige Rückrufe.",
      inputSchema: z.object({}),
      execute: async () => {
        const l = await ladeVerkaufslage()
        return { monatszielEur: MONATSZIEL_EUR, ...l }
      },
    }),
    finanzrahmen: tool({
      description: "Frei verfügbares Geld, Reichweite und Ausgaben-Spielraum. Vor JEDEM Vorschlag, der Geld kostet, aufrufen.",
      inputSchema: z.object({}),
      execute: async () => {
        const rahmen = await firmenRahmen()
        await protokolliereFaden(await assistentDb().catch(() => null), "finanz", "assistent", "Chat liest Finanzrahmen")
        return rahmen
      },
    }),
    geschaeftsleitung: tool({
      description: "Letzte Wochensitzung der KI-Geschäftsleitung: Beschlüsse, verworfene Ideen, Rückfrage und Emins Antwort.",
      inputSchema: z.object({}),
      execute: async () => (await ladeRaete(1))[0] ?? null,
    }),
    tageslage: tool({
      description: "Heutiges Morgenbriefing des Admin: Lage und die drei wichtigsten Schritte.",
      inputSchema: z.object({}),
      execute: async () => morgenBriefing("de"),
    }),
    messen: tool({
      description: "Messen, bei denen er 'teilnehmen' gewählt hat, plus seine Bewertungen (interessant/uninteressant).",
      inputSchema: z.object({}),
      execute: async () => ({ teilnahme: await messenFuerKalender(), bewertungen: await ladeStatus() }),
    }),
    freigabe_eingang: tool({
      description: "Was bereits im Freigabe-Eingang liegt (um Doppelungen zu vermeiden).",
      inputSchema: z.object({}),
      execute: async () =>
        (await ladeFreigaben()).filter((f) => f.status === "offen").map((f) => ({ art: f.art, titel: f.titel })),
    }),
    vorschlag_anlegen: tool({
      description:
        "Legt einen fertigen Vorschlag in den Freigabe-Eingang: Mail-Entwurf, Aufgabe, Termin, LinkedIn-Beitrag, Kapital-/Förderchance oder Notiz. Inhalt vollständig ausformulieren.",
      inputSchema: z.object({
        art: z.enum(FREIGABE_ARTEN),
        titel: z.string().min(3).max(160),
        inhalt: z.string().min(3).max(6000),
        empfaenger: z.string().max(200).optional().describe("Nur bei Mail: E-Mail-Adresse, falls bekannt"),
        betreff: z.string().max(200).optional().describe("Nur bei Mail"),
      }),
      execute: async (v) => ({ id: await legeFreigabeAn(v), angelegt: true }),
    }),
    absprache_speichern: tool({
      description:
        "Speichert, was Emin zu einer offenen Chance gesagt hat (nächster Schritt, Datum, Fakten wie Ort/Verband/Ansprechpartner) direkt an der Chance. IMMER aufrufen, sobald er etwas zu einem Kunden/Deal festlegt – Morgenbriefing, Vertrieb und Agenten lesen genau das.",
      inputSchema: z.object({
        suche: z.string().min(2).max(120).describe("Firmenname oder Stichwort der Chance"),
        naechsterSchritt: z.string().min(3).max(300).optional(),
        datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Datum des nächsten Schritts, JJJJ-MM-TT"),
        fakten: z.string().min(3).max(600).optional().describe("Neue Fakten, werden an die Notiz angehängt"),
      }),
      execute: async (v) => {
        const q = await assistentDb()
        if (!q) return { gespeichert: false, grund: "keine Datenbank" }
        const muster = `%${v.suche.replace(/[%_]/g, "")}%`
        const treffer = await q(
          `SELECT o.id, o.title, coalesce(g.name,'') AS firma FROM opportunities o
             LEFT JOIN organisations g ON g.id = o.organisation_id
            WHERE o.status NOT IN ('won','lost','excluded') AND (g.name ILIKE $1 OR o.title ILIKE $1)
            ORDER BY o.updated_at DESC LIMIT 2`,
          [muster],
        )
        if (treffer.length !== 1) return { gespeichert: false, grund: treffer.length ? "mehrdeutig – genauer fragen" : "keine passende offene Chance", treffer }
        const id = String(treffer[0].id)
        const stempel = new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeZone: "Europe/Berlin" }).format(new Date())
        await q(
          `UPDATE opportunities SET
             next_action = coalesce($2, next_action),
             next_action_at = coalesce($3::date, next_action_at),
             note = CASE WHEN $4::text IS NULL THEN note ELSE concat_ws(E'\n', nullif(note,''), $4::text) END,
             updated_at = now()
           WHERE id = $1`,
          [id, v.naechsterSchritt ?? null, v.datum ?? null, v.fakten ? `${stempel}: ${v.fakten}` : null],
        )
        await q(`DELETE FROM admin_briefing WHERE tag = (now() AT TIME ZONE 'Europe/Berlin')::date`, []).catch(() => null)
        return { gespeichert: true, chance: treffer[0].title, firma: treffer[0].firma }
      },
    }),
  }

  const heute = new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeZone: "Europe/Berlin" }).format(new Date())

  const nachrichten: ModelMessage[] = verlauf.slice(-16).map((m) => ({ role: m.rolle, content: m.text }))
  const letzte = nachrichten.at(-1)
  if (bild && letzte?.role === "user") {
    nachrichten[nachrichten.length - 1] = {
      role: "user",
      content: [
        { type: "text", text: String(letzte.content) },
        { type: "image", image: Buffer.from(bild.base64, "base64"), mediaType: bild.mediaType },
      ],
    }
  }

  const { text } = await generateText({
    /* Bilder (Screenshots von Mails, Briefen, Belegen) liest Sonnet am zuverlässigsten – nur dann, sonst das günstige Modell. */
    model: bild ? BILD_MODELL : MODELL,
    system: `${SYSTEM}\n\nHeute ist ${heute}.${bild ? `\n\nEr hat ein Bild angehängt. Lies es genau. Ist es eine Kundenantwort oder Mail: 1) ordne sie mit "absprache_speichern" der Firma zu, 2) bei Absage/Widerspruch/Spam-Drohung sofort "widerspruch_eintragen" (dann wird diese Adresse nie wieder angeschrieben) und sag ehrlich, was rechtlich daraus folgt, 3) leite ab, was Marketing/Vertrieb daraus lernt.` : ""}`,
    messages: nachrichten,
    tools,
    stopWhen: stepCountIs(6),
    maxOutputTokens: 2500,
  })
  return text.trim() || "Ich habe die Vorschläge im Freigabe-Eingang abgelegt."
}
