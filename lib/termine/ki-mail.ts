import "server-only"

import { generateText } from "ai"

import { firmengehirnText } from "@/lib/firmengehirn"
import { gespraeche } from "@/lib/gespraech"
import { GESPRAECHSARTEN, einladungsKontakt, type Gespraechsart } from "@/lib/termine/store"

export type MailEntwurf = { betreff: string; text: string } | { fehler: string }
export type MailZweck = "einladung" | "nachfass"

const GRUNDREGELN = `Du schreibst E-Mails im Namen von Muhammed Emin Akyol (creaDIG).
Grundlage ist ausschließlich das Firmengehirn und die Gesprächsnotizen. Erfinde keine Zahlen, Preise, Kunden oder Zusagen.
Regeln: Sie-Form (außer die Notizen zeigen Duzen), keine Floskeln, keine Emojis, keine Platzhalter außer {link}.
Der Platzhalter {link} steht genau einmal allein in einer eigenen Zeile.
Schreibe in der Sprache, die in den Notizen gewünscht ist; sonst Deutsch.
Signatur: "Viele Grüße" (bzw. passend zur Sprache), Zeilenumbruch, "Muhammed Emin Akyol", Zeilenumbruch, "creaDIG".
Antwortformat exakt:
BETREFF: <Betreff, max. 70 Zeichen>
---
<Mailtext>`

const ZIEL: Record<MailZweck, string> = {
  einladung: `Ziel der Mail: einen Termin vereinbaren. Die Mail bezieht sich konkret auf das letzte Gespräch, nennt in 1–2 Sätzen den Nutzen für genau diesen Betrieb und bittet, über den Link einen Termin zu wählen. Höchstens 120 Wörter.`,
  nachfass: `Ziel der Mail: freundlich nachfassen. Vor einigen Tagen wurde bereits ein Terminlink geschickt, der noch nicht genutzt wurde. Kein Vorwurf, kein Druck, kein "nur zur Erinnerung"-Floskelstart. Ein konkreter Satz zum Nutzen aus dem Gespräch, Angebot eines kurzen Termins über denselben Link, und der Hinweis, dass eine kurze Antwort genügt, falls gerade kein Bedarf ist. Höchstens 80 Wörter. Der Betreff greift den ersten Betreff nicht wörtlich auf.`,
}

export async function schreibeTerminmail(o: {
  kontaktId: string
  art: string
  hinweis?: string
  zweck: MailZweck
  gesendetVorTagen?: number
}): Promise<MailEntwurf> {
  const kontakt = await einladungsKontakt(o.kontaktId.slice(0, 80))
  if (!kontakt) return { fehler: "Kontakt nicht gefunden." }
  const gespraechsart = GESPRAECHSARTEN[o.art as Gespraechsart] ?? GESPRAECHSARTEN.kennenlernen

  const notizen = (await gespraeche(kontakt.id, 5))
    .map((g) => `[${g.createdAt.slice(0, 10)}] ${g.summary}${g.detail ? `\n${g.detail.slice(0, 1500)}` : ""}`)
    .join("\n\n")

  const prompt = [
    `FIRMENGEHIRN:\n${firmengehirnText()}`,
    `KONTAKT: ${kontakt.name}${kontakt.firma ? `, ${kontakt.firma}` : ""}`,
    `TERMIN: ${gespraechsart.label}, ${gespraechsart.dauer} Minuten`,
    o.zweck === "nachfass" && o.gesendetVorTagen ? `ERSTE MAIL: vor ${o.gesendetVorTagen} Tagen gesendet, Link noch nicht genutzt` : "",
    `GESPRÄCHSNOTIZEN:\n${notizen || "(keine Notizen vorhanden)"}`,
    o.hinweis?.trim() ? `ZUSÄTZLICHER WUNSCH VON MUHAMMED:\n${o.hinweis.trim().slice(0, 600)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")

  try {
    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      system: `${GRUNDREGELN}\n\n${ZIEL[o.zweck]}`,
      prompt,
      maxOutputTokens: 3000,
    })
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
