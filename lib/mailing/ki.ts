import "server-only"

import { generateText } from "ai"

import { firmengehirnText } from "@/lib/firmengehirn"
import type { KampagnenInhalt } from "@/lib/mailing/vorlage"

export type KampagnenAnlass = "einblick" | "angebot" | "fall" | "einladung"
export type KiKampagne = { inhalt: Omit<KampagnenInhalt, "ctaUrl"> } | { fehler: string }

const ANLASS: Record<KampagnenAnlass, string> = {
  einblick: "Ein fachlicher Einblick: ein Problem, das Inhaber kleiner Betriebe kennen, und wie man es sichtbar und lösbar macht.",
  angebot: "Ein konkretes Angebot von creaDIG (z. B. Betriebscheck). Nutzen zuerst, dann was genau passiert, dann der nächste Schritt.",
  fall: "Ein Praxisfall. Nur Fakten aus den Stichpunkten, keine erfundenen Zahlen oder Kundennamen.",
  einladung: "Eine Einladung zu einem kurzen Gespräch oder Termin. Ruhig, ohne Druck.",
}

const SYSTEM = `Du schreibst Newsletter-/Kampagnen-Mails für creaDIG im Namen von Muhammed Emin Akyol.
Grundlage ist ausschließlich das Firmengehirn und die Stichpunkte. Erfinde keine Zahlen, Preise, Kunden oder Zusagen.
Stil: Deutsch (außer die Stichpunkte verlangen Türkisch/Englisch), per Sie, ruhig, präzise, keine Werbesprache, keine Superlative, keine Emojis.
Keine Anrede und keine Grußformel schreiben – beides setzt die Vorlage selbst.
Inhalt: 120–220 Wörter. Kurze Absätze, getrennt durch Leerzeile. Optional EIN Zwischentitel mit "## " und EINE Liste mit Zeilen "- ".
Antwortformat exakt, jede Marke auf eigener Zeile:
BETREFF: <max. 60 Zeichen, konkret, keine Großbuchstaben-Wörter>
VORSCHAU: <Vorschautext im Postfach, max. 90 Zeichen, ergänzt den Betreff>
TITEL: <Überschrift in der Mail, max. 70 Zeichen>
KNOPF: <Text für den Handlungsknopf, 2–4 Wörter>
---
<Inhalt>`

export type KiEinzelmail =
  | { inhalt: { subject: string; preheader: string; headline: string; anrede: string; body: string; ctaText: string; zweitText: string; gruss: string } }
  | { fehler: string }

const SYSTEM_EINZEL = `Du schreibst eine persönliche 1:1-Geschäftsmail für creaDIG im Namen von Muhammed Emin Akyol (Osnabrück) – keine Werbe-Mail, kein Newsletter.
Muhammed sagt dir in eigenen Worten (oft Deutsch, manchmal Türkisch, mit Tippfehlern), was er will. Verstehe die Absicht und schreibe daraus eine fertige, versandbereite Mail.
Gibt es schon einen Entwurf, ÄNDERE ihn gezielt nach der Anweisung und behalte alles andere bei.
Regeln: Erfinde keine Fakten, Preise, Zusagen oder Gesprächsinhalte, die nicht genannt sind. Per Sie, ruhig, klar, menschlich, keine Werbesprache, keine Superlative, keine Emojis, kein Fachjargon (Empfänger sind oft nicht technisch).
Die Mail hat immer EIN klares Ziel (meist: Termin vereinbaren). Kurz: 90–180 Wörter. Kurze Absätze, getrennt durch Leerzeile. Optional EINE Liste mit Zeilen "- ".
Die Vorlage setzt Logo, Unterschrift (Name, Gründer · creaDIG) und Firmenzeile selbst – schreibe sie NICHT in den Inhalt. Anrede und Grußformel gibst du separat aus.
Antwortformat exakt, jede Marke auf eigener Zeile:
BETREFF: <max. 70 Zeichen>
VORSCHAU: <Vorschautext im Postfach, max. 90 Zeichen>
TITEL: <Überschrift in der Mail, max. 70 Zeichen, sachlich>
ANREDE: <z. B. "Sehr geehrte Damen und Herren," oder "Guten Tag Herr Baser,">
KNOPF: <Text für den Haupt-Knopf, 2–4 Wörter, meist zur Terminbuchung>
ZWEITKNOPF: <Text für den zweiten Knopf, 2–4 Wörter, meist zum Kontaktformular>
GRUSS: <z. B. "Mit freundlichen Grüßen">
---
<Inhalt>`

export async function schreibeEinzelmail(anweisung: string, entwurf: string, empfaenger: string): Promise<KiEinzelmail> {
  try {
    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      system: SYSTEM_EINZEL,
      prompt: [
        `FIRMENGEHIRN:\n${firmengehirnText()}`,
        `EMPFÄNGER: ${empfaenger || "unbekannt"}`,
        entwurf.trim() ? `AKTUELLER ENTWURF:\n${entwurf.slice(0, 6000)}` : "AKTUELLER ENTWURF: (noch keiner)",
        `ANWEISUNG VON MUHAMMED:\n${anweisung.slice(0, 4000)}`,
      ].join("\n\n"),
      maxOutputTokens: 3000,
    })
    const feld = (k: string) => text.match(new RegExp(`^${k}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? ""
    const body = text.split(/\n-{3,}\n/)[1]?.trim() ?? ""
    const subject = feld("BETREFF")
    if (!subject || !body) return { fehler: "Entwurf unvollständig. Bitte erneut versuchen." }
    return {
      inhalt: {
        subject: subject.slice(0, 140),
        preheader: feld("VORSCHAU").slice(0, 160),
        headline: feld("TITEL").slice(0, 140),
        anrede: feld("ANREDE").slice(0, 120),
        ctaText: feld("KNOPF").slice(0, 40),
        zweitText: feld("ZWEITKNOPF").slice(0, 40),
        gruss: feld("GRUSS").slice(0, 60),
        body: body.slice(0, 6000),
      },
    }
  } catch {
    return { fehler: "Entwurf konnte nicht erzeugt werden (KI nicht erreichbar)." }
  }
}

export async function schreibeKampagne(anlass: KampagnenAnlass, stichpunkte: string): Promise<KiKampagne> {
  try {
    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      system: `${SYSTEM}\n\nANLASS: ${ANLASS[anlass] ?? ANLASS.einblick}`,
      prompt: `FIRMENGEHIRN:\n${firmengehirnText()}\n\nSTICHPUNKTE VON MUHAMMED:\n${stichpunkte.slice(0, 2000)}`,
      maxOutputTokens: 3000,
    })
    const feld = (k: string) => text.match(new RegExp(`^${k}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? ""
    const body = text.split(/\n-{3,}\n/)[1]?.trim() ?? ""
    const subject = feld("BETREFF")
    if (!subject || !body) return { fehler: "Entwurf unvollständig. Bitte erneut versuchen." }
    return {
      inhalt: {
        subject: subject.slice(0, 120),
        preheader: feld("VORSCHAU").slice(0, 160),
        headline: feld("TITEL").slice(0, 140),
        ctaText: feld("KNOPF").slice(0, 40),
        body: body.slice(0, 6000),
      },
    }
  } catch {
    return { fehler: "Entwurf konnte nicht erzeugt werden (KI nicht erreichbar)." }
  }
}
