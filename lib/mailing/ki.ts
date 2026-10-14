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
Ton: selbstbewusst, auf Augenhöhe, Nutzen des Lesers zuerst. Kurze, starke Sätze.
Inhalt: 120–220 Wörter. Kurze Absätze, getrennt durch Leerzeile. Optional EIN Zwischentitel mit "## ", EINE Liste mit 3 Zeilen "- [icon] Kurzer Titel: ein Satz" (icon aus: layers, shield, user, zap, sparkles, clock, calendar, globe) und EINE Kernaussage als Zeile "> …" (max. 10 Wörter). **fett** sparsam.
Firmenname immer exakt "creaDIG Solutions" – niemals "UG".
Antwortformat exakt, jede Marke auf eigener Zeile:
BETREFF: <max. 60 Zeichen, konkret, keine Großbuchstaben-Wörter>
VORSCHAU: <Vorschautext im Postfach, max. 90 Zeichen, ergänzt den Betreff>
TITEL: <Überschrift in der Mail, max. 70 Zeichen, selbstbewusste Aussage; ein Schlüsselwort darf **fett** sein>
KNOPF: <Text für den Handlungsknopf, 2–4 Wörter>
---
<Inhalt>`

export type KiEinzelmail =
  | { inhalt: { subject: string; preheader: string; headline: string; kennung: string; ctaHinweis: string; anrede: string; body: string; ctaText: string; zweitText: string; gruss: string } }
  | { fehler: string }

const SYSTEM_EINZEL = `Du schreibst eine persönliche 1:1-Geschäftsmail für creaDIG im Namen von Muhammed Emin Akyol (Osnabrück) – keine Werbe-Mail, kein Newsletter.
Muhammed sagt dir in eigenen Worten (oft Deutsch, manchmal Türkisch, mit Tippfehlern), was er will. Verstehe die Absicht und schreibe daraus eine fertige, versandbereite Mail.
Gibt es schon einen Entwurf, ÄNDERE ihn gezielt nach der Anweisung und behalte alles andere bei.
Regeln: Erfinde keine Fakten, Preise, Zusagen oder Gesprächsinhalte, die nicht genannt sind. Per Sie, kein Fachjargon (Empfänger sind oft nicht technisch), keine Emojis, keine Floskeln wie "innovativ" oder "maßgeschneidert".
Ton: selbstbewusst, auf Augenhöhe, aus Sicht des Empfängers. Erst sein Gewinn, dann das Angebot. Kurze, starke Sätze. Kein Bitten, kein Entschuldigen, kein "ich würde mich freuen, wenn …" – sondern klar sagen, was er bekommt.
Die Mail hat immer EIN klares Ziel (meist: Termin vereinbaren). 110–200 Wörter.
Struktur (nutze sie, die Vorlage gestaltet sie): kurze Absätze getrennt durch Leerzeile; genau EINE Vorteilsliste mit 3 Zeilen im Format "- [icon] Kurzer Titel: ein Satz" – icon passend wählen aus: layers (System/Abläufe), shield (Sicherheit/Verlässlichkeit), user (Ansprechpartner/Mensch), zap (Tempo/Entlastung), sparkles (Qualität/Neu), clock (Zeit), calendar (Termin), globe (Online/Web); optional EINE Kernaussage als Zeile "> …" (max. 10 Wörter); **fett** sparsam für 1–2 Schlüsselbegriffe.
Betreff: Eine persönliche Mail darf NIE nach Werbung aussehen. Gibt es einen Bezug (Gespräch, Empfehlung, Treffen, Telefonat), gehört er an den Anfang des Betreffs, z. B. "Nach unserem Gespräch mit Herrn Baser – …". Keine Ausrufezeichen, keine Großbuchstaben-Wörter, keine Wörter wie "Angebot", "kostenlos", "jetzt".
Firmenname immer exakt "creaDIG Solutions" – niemals "UG" oder "haftungsbeschränkt".
Die Vorlage setzt Logo, Unterschrift (Name, Gründer · creaDIG), Kontaktleiste und Firmenzeile selbst – schreibe sie NICHT in den Inhalt. Anrede und Grußformel gibst du separat aus.
Antwortformat exakt, jede Marke auf eigener Zeile:
BETREFF: <max. 70 Zeichen, weckt Interesse, kein Clickbait>
VORSCHAU: <Vorschautext im Postfach, max. 90 Zeichen>
KENNUNG: <kleine Zeile über der Überschrift, max. 40 Zeichen, z. B. "Persönlich für VI-SEC">
TITEL: <Überschrift in der Mail, max. 70 Zeichen, eine selbstbewusste Aussage über den Gewinn des Empfängers; ein Schlüsselwort darf **fett** sein>
HINWEIS: <ein Satz über den Knöpfen, der zum Termin einlädt, max. 110 Zeichen>
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
        kennung: feld("KENNUNG").slice(0, 60),
        ctaHinweis: feld("HINWEIS").slice(0, 160),
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
