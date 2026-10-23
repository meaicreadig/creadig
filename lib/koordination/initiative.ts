import "server-only"
import { generateText } from "ai"

import { assistentDb, letzteLaeufe } from "@/lib/assistent/store"
import { legeAuftragAn } from "@/lib/koordination/koordinator"

/**
 * INITIATIVE — die Firma sucht sich selbst Arbeit.
 *
 * 23.10.2026: Neue Arbeit entstand nur einmal am Tag (Chief of Staff, höchstens
 * 3 Aufträge). Danach wartete die ganze Firma auf Emin. Gemessen über 7 Tage:
 * 23 Agenten, 0 Fehler — und trotzdem kaum Ergebnis. Der Owner: „Es soll im
 * Hintergrund eine Denkweise laufen; nach außen nur mit meiner Freigabe.“
 *
 * Jetzt stößt jeder Puls (alle 2 Stunden, auch nachts) einen Auftrag an, mit
 * wechselndem Schwerpunkt. Recherche-Schwerpunkte suchen zuerst ECHT im Netz
 * (Perplexity, mit Quellen) — die Abteilung arbeitet dann mit Funden statt mit
 * Modellwissen. Die Kette läuft wie jeder Auftrag: bearbeiten, weitergeben,
 * und was nach außen geht, liegt als fertige Vorlage bei Emin.
 *
 * Bremsen: höchstens MAX_JE_TAG Aufträge je Tag, keine neuen, solange sich
 * Arbeit staut, und ohne belegte Funde entsteht kein Recherche-Auftrag.
 */

const RECHERCHE = "perplexity/sonar"
const MAX_JE_TAG = 12
const STAU = 4

type Schwerpunkt = { key: string; label: string; an: string; auftrag: string; recherche?: string }

const SCHWERPUNKTE: Schwerpunkt[] = [
  {
    key: "kunden",
    label: "Kunden finden",
    an: "vertrieb",
    auftrag: "Bewerte die Funde: Welche 1–2 Wege bringen creaDIG in den nächsten 30 Tagen an zahlende Kunden? Nächster Schritt je Weg. Keine Kaltakquise – nur Wege, bei denen der Betrieb selbst sucht, ausschreibt oder ein Partner empfiehlt.",
    recherche:
      "Wo suchen kleine und mittlere Betriebe in Deutschland und der Schweiz (Handwerk, türkischstämmige Betriebe, Vereine und Verbände) gerade aktiv einen Dienstleister für Website, digitale Barrierefreiheit (BFSG) oder Automatisierung? Öffentliche Ausschreibungen, Förderprogramme mit Dienstleisterbedarf, Branchenverbände, Messen, Partnernetzwerke (Steuerberater, Agenturen ohne eigenes Web-Team). Keine Kontaktdaten einzelner Personen.",
  },
  {
    key: "markt",
    label: "Markt & Wettbewerb",
    an: "geschaeftsentwicklung",
    auftrag: "Was heißt das für unsere Angebote und Preise? Eine konkrete Anpassung oder Chance, mit Begründung.",
    recherche:
      "Was hat sich in den letzten 14 Tagen im deutschen und Schweizer Markt für Websites, digitale Barrierefreiheit (BFSG) und KI-Automatisierung für kleine Betriebe geändert: neue Angebote und Preise von Wettbewerbern, Gesetze, Fristen, Urteile?",
  },
  {
    key: "technologie",
    label: "Technologie",
    an: "produktmanagement",
    auftrag: "Welche Neuerung macht uns schneller oder wird ein neues Angebot? Aufwand grob schätzen, Empfehlung: einsetzen, beobachten oder ignorieren.",
    recherche:
      "Welche neuen KI- und Web-Technologien der letzten 14 Tage (Modelle, Tools, APIs, Frameworks) können ein kleines Digitalhaus mit Next.js, Vercel und KI-Agenten sofort produktiver machen oder als neues Kundenangebot dienen? Mit Preis, falls bekannt.",
  },
  {
    key: "kapital",
    label: "Kapital & Förderung",
    an: "finanzen",
    auftrag: "Welche Programme passen wirklich (Einzelunternehmen seit 01.10.2025)? Frist, Höhe, nächster Schritt. Antrag nur als Vorlage für Emin.",
    recherche:
      "Welche Förderprogramme, Zuschüsse und Wettbewerbe für junge Einzelunternehmen im Bereich Digitalisierung und KI in Deutschland haben eine Frist in den nächsten 90 Tagen?",
  },
  {
    key: "international",
    label: "Internationale Märkte",
    an: "international",
    auftrag: "Welcher Weg bringt creaDIG in den nächsten 90 Tagen in der Schweiz, in Österreich oder über die Diaspora-Netzwerke voran? Ein Weg, nächster Schritt, Frist. Keine Kaltakquise.",
    recherche:
      "Welche Programme, Kammern, Unternehmerverbände (auch türkischstämmige) und Messen mit offener Anmeldung in der Schweiz, in Österreich und im übrigen Europa helfen einem kleinen deutschen Digitalanbieter (Websites, Barrierefreiheit, KI-Automatisierung) beim Markteintritt?",
  },
  {
    key: "sichtbarkeit",
    label: "Sichtbarkeit",
    an: "kommunikation",
    auftrag:
      "Leite aus den jüngsten Ergebnissen der Firma (unten) ein Thema ab, mit dem creaDIG diese Woche sichtbar wird – Fachartikel, LinkedIn-Beitrag oder Website-Seite – mit fertiger Gliederung und Kernaussage.",
  },
  {
    key: "system",
    label: "Selbstverbesserung",
    an: "qualitaet",
    auftrag:
      "Prüfe die KI-Firma selbst anhand der Läufe unten: Wer liefert wenig oder Abgelehntes, woran liegt es, und was ändern wir (Ablauf, Zuständigkeit, Anweisung)? Ein konkreter Verbesserungsvorschlag; Code-Änderungen als Auftrag an die Entwicklung.",
  },
]

const heute = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })

async function recherchiere(frage: string, tag: string): Promise<string | null> {
  const { text } = await generateText({
    model: RECHERCHE,
    prompt: `Stand: ${tag}. ${frage}
Antworte mit 3–6 konkreten, überprüfbaren Funden als Stichpunkte: was, für wen, Frist oder Datum, Quelle mit direkter URL. Nichts erfinden; lieber weniger Funde. Keine Einleitung.`,
  })
  const funde = text.trim()
  /* Ohne einen einzigen Link ist es keine Recherche, sondern Modellwissen. */
  return /https?:\/\//.test(funde) ? funde.slice(0, 3000) : null
}

async function lageDerFirma(): Promise<string> {
  const laeufe = await letzteLaeufe()
  return Object.entries(laeufe)
    .map(([k, l]) => `- ${k}: ${l.ergebnis}${l.fehler ? ` [Fehler: ${l.fehler}]` : ""} (${l.zeit.slice(0, 10)})`)
    .join("\n")
    .slice(0, 2500)
}

/** Ein Initiative-Auftrag je Aufruf (Puls). Gibt zurück, ob einer entstanden ist. */
export async function initiativeRunde(): Promise<{ angelegt: boolean; grund: string }> {
  const q = await assistentDb()
  if (!q) return { angelegt: false, grund: "keine Datenbank" }
  const tag = heute()
  const zahlen = (await q(
    `SELECT count(*) FILTER (WHERE quelle LIKE $1)::int AS heute, count(*) FILTER (WHERE status = 'neu')::int AS neu FROM firma_auftraege`,
    [`initiative:${tag}:%`],
  ).catch(() => [])) as { heute: number; neu: number }[]
  const heuteSchon = zahlen[0]?.heute ?? 0
  if (heuteSchon >= MAX_JE_TAG) return { angelegt: false, grund: "Tagesgrenze erreicht" }
  if ((zahlen[0]?.neu ?? 0) >= STAU) return { angelegt: false, grund: "Warteschlange staut sich – erst abarbeiten" }

  /* Reihum über den Tag, jeden Tag mit anderem Start – so kommt jeder Schwerpunkt dran. */
  const tagNr = Math.floor(Date.parse(`${tag}T00:00:00Z`) / 86_400_000)
  const s = SCHWERPUNKTE[(tagNr + heuteSchon) % SCHWERPUNKTE.length]

  let stoff: string
  if (s.recherche) {
    const funde = await recherchiere(s.recherche, tag).catch((e) => {
      console.error("[initiative] recherche", s.key, e instanceof Error ? e.message : e)
      return null
    })
    if (!funde) return { angelegt: false, grund: `${s.label}: keine belegten Funde` }
    stoff = `Recherche (Perplexity, ${tag}):\n${funde}`
  } else {
    stoff = `Jüngste Ergebnisse der Firma:\n${await lageDerFirma()}`
  }

  const id = await legeAuftragAn({
    von: "koordination",
    an: s.an,
    titel: `Initiative · ${s.label} (${tag})`,
    inhalt: `${s.auftrag}\n\n${stoff}\n\nWas nach außen geht (Mail, Beitrag, Antrag, Angebot), legst du Emin als fertige Vorlage vor.`,
    quelle: `initiative:${tag}:${heuteSchon}`,
  })
  return { angelegt: Boolean(id), grund: s.label }
}
