"use server"

import { cookies } from "next/headers"
import { generateText } from "ai"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import { firmengehirnText } from "@/lib/firmengehirn"
import { gespraeche } from "@/lib/gespraech"
import { GESPRAECHSARTEN, einladungsKontakt, type Gespraechsart } from "@/lib/termine/store"

export type MailEntwurf = { betreff: string; text: string } | { fehler: string }

const SYSTEM = `Du schreibst E-Mails im Namen von Muhammed Emin Akyol (creaDIG).
Grundlage ist ausschließlich das Firmengehirn und die Gesprächsnotizen. Erfinde keine Zahlen, Preise, Kunden oder Zusagen.
Ziel der Mail: einen Termin vereinbaren. Die Mail bezieht sich konkret auf das letzte Gespräch, nennt in 1–2 Sätzen den Nutzen für genau diesen Betrieb und bittet, über den Link einen Termin zu wählen.
Regeln: Sie-Form (außer die Notizen zeigen Duzen), höchstens 120 Wörter, keine Floskeln, keine Emojis, keine Platzhalter außer {link}.
Der Platzhalter {link} steht genau einmal allein in einer eigenen Zeile.
Schreibe in der Sprache, die in den Notizen gewünscht ist; sonst Deutsch.
Signatur: "Viele Grüße" (bzw. passend zur Sprache), Zeilenumbruch, "Muhammed Emin Akyol", Zeilenumbruch, "creaDIG".
Antwortformat exakt:
BETREFF: <Betreff, max. 70 Zeichen>
---
<Mailtext>`

export async function terminmailEntwerfen(kontaktId: string, art: string, hinweis: string): Promise<MailEntwurf> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/termine")) {
    return { fehler: "Nicht berechtigt." }
  }
  const kontakt = await einladungsKontakt(kontaktId.slice(0, 80))
  if (!kontakt) return { fehler: "Kontakt nicht gefunden." }
  const gespraechsart = GESPRAECHSARTEN[art as Gespraechsart] ?? GESPRAECHSARTEN.kennenlernen

  const notizen = (await gespraeche(kontakt.id, 5))
    .map((g) => `[${g.createdAt.slice(0, 10)}] ${g.summary}${g.detail ? `\n${g.detail.slice(0, 1500)}` : ""}`)
    .join("\n\n")

  const prompt = [
    `FIRMENGEHIRN:\n${firmengehirnText()}`,
    `KONTAKT: ${kontakt.name}${kontakt.firma ? `, ${kontakt.firma}` : ""}`,
    `TERMIN: ${gespraechsart.label}, ${gespraechsart.dauer} Minuten`,
    `GESPRÄCHSNOTIZEN:\n${notizen || "(keine Notizen vorhanden)"}`,
    hinweis.trim() ? `ZUSÄTZLICHER WUNSCH VON MUHAMMED:\n${hinweis.trim().slice(0, 600)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")

  try {
    const { text } = await generateText({ model: "openai/gpt-5-mini", system: SYSTEM, prompt, maxOutputTokens: 3000 })
    const m = text.match(/BETREFF:\s*(.+)\n-{3,}\n([\s\S]+)/)
    if (!m) return { fehler: "Entwurf unvollständig. Bitte erneut versuchen." }
    let mail = m[2].trim()
    if (!mail.includes("{link}")) mail = mail.replace(/\n\n(Viele Grüße|Saygılarımla|Best regards)/, "\n\n{link}\n\n$1")
    if (!mail.includes("{link}")) mail += "\n\n{link}"
    return { betreff: m[1].trim().slice(0, 160), text: mail.slice(0, 4000) }
  } catch {
    return { fehler: "Entwurf konnte nicht erzeugt werden (KI nicht erreichbar)." }
  }
}
