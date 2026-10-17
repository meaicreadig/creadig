import "server-only"

import { generateText } from "ai"

import { eur } from "@/components/finanz/format"
import type { Lage } from "@/lib/finanz/lage"

const SYSTEM = `Du bist der Finanzassistent von creaDIG (Einzelunternehmen von Muhammed Emin Akyol, Osnabrück, Deutschland).
Rolle: kluger, ehrlicher Finanzchef an seiner Seite – Liquidität, Steuern/Finanzamt, Wachstum, Rücklagen, Vermögensaufbau.
Regeln:
- Grundlage sind NUR die Zahlen im LAGEBILD. Erfinde nichts. Fehlt etwas, sag genau, welche Angabe fehlt.
- Du entscheidest nichts und führst nichts aus. Du empfiehlst – Muhammed entscheidet.
- Antworte in der Sprache der Frage (Deutsch oder Türkisch), per du, klar und direkt, ohne Floskeln, ohne Emojis.
- Struktur: zuerst die Antwort in 1–2 Sätzen, dann höchstens 5 kurze Punkte mit "- ", zuletzt "Nächster Schritt: …" (eine konkrete Handlung mit Datum, wenn sinnvoll).
- Finanzamt-Pflichten haben Vorrang vor Investitionen. Steuertopf ist kein verfügbares Geld.
- Bei Investitions-, Kredit- oder Immobilienfragen: rechne mit den vorhandenen Zahlen (Reichweite, frei verfügbar), nenne Risiken, und sag, wann ein Steuerberater oder Bankgespräch nötig ist.
- Keine Rechts- oder Steuerberatung im engeren Sinn; markiere Unsicheres als Einschätzung.
- Max. 220 Wörter.`

/** Verdichtet die Lage. Notizen bleiben draußen, nur was zum Rechnen nötig ist. */
export function lagebild(l: Lage): string {
  const zeilen: string[] = [
    `Heute: ${l.heute}`,
    `Kontostand heute: ${eur(l.stand)}`,
    `Steuertopf gesamt: ${eur(l.topf.gesamtCent)} (USt offen ${eur(l.topf.ustOffenCent)}, ESt-Rücklage ${eur(l.topf.estRuecklageCent)}, Gewinn laufendes Jahr ${eur(l.topf.gewinnJahrCent)})`,
    `Frei verfügbar (Konto minus Steuertopf): ${eur(l.frei)}`,
    `Reichweite: ${l.reichweite === null ? "nicht berechenbar" : `${l.reichweite.toFixed(1)} Monate`}`,
    `Einstellungen: USt-pflichtig ${l.einstellungen.ustPflichtig ? "ja" : "nein"}, Rhythmus ${l.einstellungen.ustRhythmus}, USt bezahlt bis ${l.einstellungen.ustBezahltBis}, ESt-Quote ${l.einstellungen.estQuote} %`,
    "",
    "Monate (Einnahmen / Ausgaben):",
    ...l.verlauf.map((m) => `- ${m.schluessel}: ${eur(m.einCent)} / ${eur(m.ausCent)}`),
    "",
    "Liquidität 13 Wochen (Stand am Wochenende):",
    ...l.wochen.map((w) => `- bis ${w.bis}: ${eur(w.standCent)} (ein ${eur(w.einCent)}, aus ${eur(w.ausCent)})`),
    "",
    "Offene Fristen:",
    ...l.fristen
      .filter((f) => !f.erledigt)
      .slice(0, 12)
      .map((f) => `- ${f.titel}: fällig ${f.faellig}${f.betragCent !== null ? `, ${eur(f.betragCent)}` : ""}`),
    "",
    "Kompass-Hinweise:",
    ...l.hinweise.map((h) => `- [${h.schwere}] ${h.text}`),
    "",
    "Letzte 40 Buchungen (Datum, Art, Status, Betrag brutto, Kategorie, Gegenpartei, Wiederholung):",
    ...l.buchungen
      .filter((b) => !b.storniert)
      .slice(0, 40)
      .map(
        (b) =>
          `- ${b.datum} ${b.art} ${b.status} ${eur(b.bruttoCent)} ${b.kategorie}${b.gegenpartei ? ` · ${b.gegenpartei}` : ""}${b.wiederholung !== "keine" ? ` · ${b.wiederholung}` : ""}`,
      ),
  ]
  return zeilen.join("\n").slice(0, 12000)
}

export async function frageAssistent(lage: Lage, frage: string): Promise<{ antwort: string } | { fehler: string }> {
  try {
    const { text } = await generateText({
      model: "openai/gpt-5.4-mini",
      system: SYSTEM,
      prompt: `LAGEBILD:\n${lagebild(lage)}\n\nFRAGE:\n${frage}`,
      maxOutputTokens: 2500,
    })
    const antwort = text.trim()
    return antwort ? { antwort } : { fehler: "Keine Antwort erhalten. Bitte erneut fragen." }
  } catch {
    return { fehler: "Assistent gerade nicht erreichbar (KI-Guthaben oder Verbindung prüfen)." }
  }
}

/**
 * Persönlicher Mahnungs-Entwurf (nicht die feste DE/EN/TR-Mahnstufen-Vorlage
 * aus lib/finanz/auftraege/mail.ts — die bleibt die rechtssichere
 * Standardroute). Dieser Entwurf ist ein Zweites, Weicheres für schwierige
 * Einzelfälle: wird NIE automatisch verschickt, landet als bearbeitbarer Text
 * in der Oberfläche, zum Kopieren/Anpassen durch Muhammed selbst.
 */
export type MahnKontext = {
  nummer: string
  kunde: string
  sprache: "de" | "en" | "tr"
  offenerRestCent: number
  tageUeberfaellig: number
  mahnstufe: number
  notiz?: string
}

const SPRACHE_NAME: Record<MahnKontext["sprache"], string> = { de: "Deutsch", en: "Englisch", tr: "Türkisch" }

const MAHN_SYSTEM = `Du schreibst EINEN Entwurf für eine persönliche Nachricht an einen Kunden wegen einer überfälligen Rechnung — für creaDIG Solutions (Einzelunternehmen von Muhammed Emin Akyol).
Regeln:
- Nur ein Entwurf, kein Versand. Muhammed liest, bearbeitet und entscheidet selbst, ob und wie er ihn verschickt.
- Nenne Rechnungsnummer, offenen Betrag und überfällige Tage GENAU wie im KONTEXT angegeben. Erfinde keine Zahlen, keine Zahlungshistorie, keine Details, die nicht im KONTEXT stehen.
- Ton: höflich, direkt, ruhig. Kein Drohton, keine Paragraphen-Zitate, keine Inkasso-Sprache — das übernimmt bei Bedarf die reguläre Mahnstufen-Vorlage, nicht dieser Entwurf.
- Sprache GENAU wie im KONTEXT angegeben (de/en/tr), keine Mischung.
- Max. 120 Wörter, keine Betreffzeile, direkt mit der Anrede beginnen.
- Wenn eine NOTIZ im KONTEXT steht (z. B. "Kunde bat um Aufschub"), berücksichtige sie sinngemäß im Ton, ohne sie wörtlich zu zitieren.`

export async function entwerfeMahnung(kontext: MahnKontext): Promise<{ entwurf: string } | { fehler: string }> {
  try {
    const { text } = await generateText({
      model: "openai/gpt-5.4-mini",
      system: MAHN_SYSTEM,
      prompt: `KONTEXT:\nRechnungsnummer: ${kontext.nummer}\nKunde: ${kontext.kunde}\nSprache: ${SPRACHE_NAME[kontext.sprache]}\nOffener Betrag: ${eur(kontext.offenerRestCent)}\nTage überfällig: ${kontext.tageUeberfaellig}\nBisherige Mahnstufe: ${kontext.mahnstufe}${kontext.notiz ? `\nNotiz: ${kontext.notiz}` : ""}\n\nSchreib den Entwurf.`,
      maxOutputTokens: 400,
    })
    const entwurf = text.trim()
    return entwurf ? { entwurf } : { fehler: "Kein Entwurf erhalten. Bitte erneut versuchen." }
  } catch {
    return { fehler: "Assistent gerade nicht erreichbar (KI-Guthaben oder Verbindung prüfen)." }
  }
}
