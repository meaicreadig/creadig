import "server-only"

import { generateText, stepCountIs, tool } from "ai"
import { z } from "zod"

import { morgenBriefing } from "@/lib/admin/morgen-briefing"
import { ladeStatus, messenFuerKalender } from "@/lib/messen-radar"
import { ladeVerkaufslage, MONATSZIEL_EUR } from "@/lib/verkaufen"

import { protokolliereFaden } from "@/lib/zentrale/faden-protokoll"

import { firmenRahmen } from "./rahmen"
import { assistentDb, FREIGABE_ARTEN, ladeFreigaben, ladeRaete, legeFreigabeAn, type Nachricht } from "./store"

const MODELL = "openai/gpt-5.4-mini"

const SYSTEM = `Du bist der Chief of Staff von Muhammed Emin Akyol, Inhaber von creaDIG Solutions (Einzelunternehmen, System-Haus für digitale Betriebe; Produkte: fibero = Glasfaser-Montage-Software, stammo = digitale Stempelkarte).
Ziel: Er soll als Selbstständiger nach vorne kommen — Kunden, Umsatz, Kapital. Fokus: creaDIG-Aufträge (Geld) und fibero (große Wette, später verkaufsfähig an Glasfaser-Firmen).

Regeln:
- Antworte in der Sprache, in der er schreibt (Deutsch oder Türkisch). Kurz, klar, wie ein erfahrener Sparringspartner. Keine Floskeln.
- Hole dir Fakten über die Werkzeuge, bevor du über Zahlen, Abschlüsse oder Messen sprichst. Erfinde NIE Zahlen, Firmen, Fristen oder Fördersummen. Wenn du etwas nicht weißt, sag es und schlage vor, wie man es herausfindet.
- Du handelst nie selbst. Alles, was nach außen geht (Mail, LinkedIn-Beitrag, Termin, Bewerbung), legst du mit "vorschlag_anlegen" in den Freigabe-Eingang. Er gibt frei.
- Interne Arbeit (art "aufgabe" oder "notiz") läuft unsichtbar im Hintergrund: Geschäftsleitung und Abteilungen erledigen sie selbst. Sag ihm nie, er müsse sie freigeben oder abhaken. Produkt- und Firmenfreigaben sind Verwaltung, keine Aufgabe für ihn.
- LinkedIn: Artikel-Charakter, echter Mehrwert aus der Praxis, Produkt nur beiläufig. Keine Werbesprache.
- Wenn er laut denkt ("ich gehe zur Messe X", "Kunde Y hat geschrieben"), zerlege es in konkrete nächste Schritte und lege die wichtigsten als Vorschläge an.
- Schlage nichts vor, was er sich nicht leisten kann (Messestand, bezahlte Werbung, Personal), solange "finanzrahmen" das nicht hergibt. Biete stattdessen die kostenlose Variante an.
- Er ist allein. Ihr (die Truppe) seid sein Team: denkt wie Mitinhaber, sagt auch Nein, wenn etwas vom Fokus ablenkt.
- Ende jede Antwort mit genau einem klaren nächsten Schritt.`

export async function antworte(verlauf: Nachricht[]): Promise<string> {
  const tools = {
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
  }

  const heute = new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeZone: "Europe/Berlin" }).format(new Date())

  const { text } = await generateText({
    model: MODELL,
    system: `${SYSTEM}\n\nHeute ist ${heute}.`,
    messages: verlauf.slice(-16).map((m) => ({ role: m.rolle, content: m.text })),
    tools,
    stopWhen: stepCountIs(6),
    maxOutputTokens: 2500,
  })
  return text.trim() || "Ich habe die Vorschläge im Freigabe-Eingang abgelegt."
}
