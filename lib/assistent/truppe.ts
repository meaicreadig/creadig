import "server-only"

import { generateText } from "ai"

import { collectAttention } from "@/lib/attention"
import { MESSEN, messeKey, type Messe } from "@/lib/messen"
import { ladeStatus, ladeVorschlaege } from "@/lib/messen-radar"
import { getVertriebStore } from "@/lib/lead-store"
import { ladeVerkaufslage, MONATSZIEL_EUR as MONATSZIEL } from "@/lib/verkaufen"
import { erstelleEntwurf, ladeEntwuerfe } from "@/lib/verkaufen-entwurf"

import { erzeugeBild } from "./bild"
import { firmenRahmen, INHABER } from "./rahmen"
import { findeKontaktMail } from "./kontaktsuche"
import { pruefeWebseite, webcheckNotiz } from "./webcheck"
import { ergaenzeFehlendeAdressen, istMail, nachfassen } from "./versand"
import { holeEingang } from "@/lib/eingang"
import { bulletinStoff, erstelleBulletin } from "@/lib/bulletin/agent"
import { protokolliereFaden } from "@/lib/zentrale/faden-protokoll"
import { ABTEILUNGEN } from "@/lib/zentrale/abteilungen"
import { findeOderLegeFirma } from "@/lib/kundenfaden"
import { briefBereit } from "@/lib/brief/letterxpress"
import { ladeSperrliste, rechtsRunde, sperrGrund } from "@/lib/recht/compliance"
import { geplantFuer, linkMitUtm, SAEULEN, zielgruppeDerWoche, type Saeule } from "./linkedin-plan"
import { veroeffentlicheGeplante } from "./redaktion-post"
import {
  assistentDb,
  gibSperre,
  ladeFreigaben,
  ladeRaete,
  legeFreigabeAn,
  letzteArtikel,
  letzteLaeufe,
  neueFreigabeId,
  nimmSperre,
  offeneAutomationErinnerungen,
  protokolliereLauf,
  quelleBekannt,
  speichereRat,
  type Lauf,
  type RatProtokoll,
} from "./store"
import { firmenText, firmenTextEn } from "@/lib/firmenwahrheit"
import { inhalteText } from "@/lib/inhalte"

/*
 * 24.10.2026: Messen → Vertrieb,
 * Wissens-Wächter → Qualität, Tahsilat → Finanz. Ihre Läufe laufen weiter als
 * Teil der jeweiligen Runde; Karten tragen weiter ihren alten Agenten-Namen.
 * Golf-Radar bleibt eigener, wöchentlicher Agent (Emin: offene Tür, nicht drosseln).
 * Neu: Kundenbetreuung, Partner & Empfehlungen, Ergebnis-Controller, Angebotsautomat.
 */
export const AGENT_KEYS = ["rat", "lage", "vertrieb", "jaeger", "kapital", "golf", "redaktion", "finanz", "projekte", "bulletin", "koordinator", "recht", "marketing", "webseite", "qualitaet", "sicherheit", "kundenservice", "forschung", "produkt", "entwicklung", "international", "einkauf", "personal", "kundenbetreuung", "partner", "controller", "angebot", "ideen", "teftis"] as const
export type AgentKey = (typeof AGENT_KEYS)[number]

export type AgentInfo = {
  key: AgentKey
  name: string
  aufgabe: string
  takt: "taeglich" | "woechentlich"
  ki: boolean
}

export const AGENTEN: AgentInfo[] = [
  { key: "koordinator", name: "Chief of Staff", aufgabe: "Ordnet jede neue interne Arbeit einer Abteilung zu, lässt Abteilungen untereinander übergeben und legt dir nur vor, was nach außen geht oder deine Entscheidung braucht – fertig vorbereitet.", takt: "taeglich", ki: true },
  { key: "rat", name: "Geschäftsleitung", aufgabe: "CEO, CFO, Vertrieb und Marketing tagen wöchentlich, prüfen gegen dein Budget und beschließen.", takt: "woechentlich", ki: true },
  { key: "jaeger", name: "Kunden-Jäger", aufgabe: "Findet jede Woche echte Firmen für fibero, creaDIG oder stammo, recherchiert die Impressums-Anschrift und legt je Firma einen Brief zur Ein-Klick-Freigabe an (Versand per Post erst nach Emins Klick) – keine Kaltmails.", takt: "woechentlich", ki: true },
  { key: "recht", name: "Recht & Compliance", aufgabe: "Prüft jede Mail vor dem Versand (Einwilligung, Widerspruch, UWG § 7), stoppt unzulässige Kaltmails, sperrt Widersprüche und kontrolliert Impressum und Datenschutz.", takt: "taeglich", ki: false },
  { key: "marketing", name: "Marketingleitung", aufgabe: "Macht aus Zielliste, Beschlüssen und Absagen einen Wochenplan mit einer Zielgruppe und verteilt die Aufträge an Redaktion, Vertrieb und Recht.", takt: "woechentlich", ki: true },
  { key: "webseite", name: "Website-Prüfer", aufgabe: "Prüft creadig.de täglich in allen 4 Sprachen auf Erreichbarkeit, Tempo, SEO, Sicherheit, tote Links und Aktualität, wöchentlich mit Google PageSpeed und Design-Blick. Behebt selbst, was er darf, und schickt den Rest an die zuständige Abteilung oder als fertigen Auftrag an die Geschäftsführung.", takt: "taeglich", ki: true },
  { key: "lage", name: "Lage", aufgabe: "Sammelt alles, was im System auf deine Entscheidung wartet.", takt: "taeglich", ki: false },
  { key: "vertrieb", name: "Vertrieb", aufgabe: "Findet stille oder überfällige Abschlüsse und schreibt die nächste Mail. Bereitet außerdem jede Messe vor, bei der du teilnimmst (Plan, Kontakte, Unterkunft).", takt: "taeglich", ki: true },
  { key: "finanz", name: "Finanz", aufgabe: "Legt Folgerechnungen aus Abos als Entwurf an, legt für überfällige Rechnungen die nächste Mahnstufe als Entwurf vor (3/14/28 Tage) und eskaliert die 2. Mahnung. Versendet nie selbst.", takt: "taeglich", ki: false },
  { key: "projekte", name: "Projektleitung", aufgabe: "Führt jeden gewonnenen Auftrag bis zur Übergabe: legt Projekte an, fordert Material an, schreibt Wochenberichte, warnt vor Fristen und fasst nach.", takt: "taeglich", ki: false },
  { key: "kapital", name: "Kapital", aufgabe: "Recherchiert Förderungen, Kredite und Investoren mit Quelle und Frist.", takt: "woechentlich", ki: true },
  { key: "golf", name: "Golf-Radar", aufgabe: "Sucht jede Woche Investoren, Family Offices, Programme, Aufträge und Events in VAE, Saudi-Arabien und Katar und schreibt die erste Nachricht auf Englisch und Arabisch – offene Tür für Leistung, Investition oder Partnerschaft, ohne Umzug.", takt: "woechentlich", ki: true },
  { key: "bulletin", name: "Bulletin", aufgabe: "Recherchiert jeden Morgen, was in KI, Automatisierung, Medien, Chips und Robotik zählt, mit Quelle, ordnet es für creaDIG ein und liefert der Redaktion Artikelideen.", takt: "taeglich", ki: true },
  { key: "qualitaet", name: "Qualitätssicherung", aufgabe: "Benotet jeden KI-Mitarbeiter täglich nach deinen Entscheidungen: Freigaben, Änderungen, Absagen, Fehler und Dauer. Wer unter der Grenze liegt, bekommt einen Auftrag mit seinen letzten Absagen. Prüft außerdem jeden offenen Entwurf auf erfundene Behauptungen (Zertifikate, Kundenzahlen) und unbekannte Preise. Schreibt aus deinen Entscheidungen Regeln ins Firmengedächtnis, die jeder Agent bei jedem Entwurf mitbekommt.", takt: "taeglich", ki: false },
  { key: "sicherheit", name: "IT-Sicherheit", aufgabe: "Prüft Pflicht-Einstellungen und durchsucht eingehende Mails nach Angriffen auf die KI (Prompt-Injection). Kritisches löst einen Alarm aus.", takt: "taeglich", ki: false },
  { key: "kundenservice", name: "Kundenservice", aufgabe: "Schreibt für unbeantwortete Kundenmails ohne Zuordnung einen Antwortentwurf; unbekannte Absender bekommen eine höfliche Rückfrage. Versendet nie selbst.", takt: "taeglich", ki: true },
  { key: "forschung", name: "F&E-Nachweis", aufgabe: "Fasst jede Woche die erfassten F&E-Stunden für die Forschungszulage zusammen und schätzt die Jahreserstattung.", takt: "woechentlich", ki: false },
  { key: "produkt", name: "Produktmanagement", aufgabe: "Nimmt sich jeden Tag ein Produkt vor (fibero, stammo, meAI, CASSAMEA, meahv): MRR aus den Abos, Wettbewerb und Gesetze mit Quelle, Bulletin – und verteilt höchstens zwei Fahrplan-Schritte an Entwicklung, Marketing, Vertrieb oder International.", takt: "taeglich", ki: true },
  { key: "entwicklung", name: "Entwicklung & Tech-Radar", aufgabe: "Bewertet jeden Morgen die Bulletin-Meldungen (montags auch Releases unseres Stacks): einsetzen, beobachten, ignorieren. Legt dir fertige Aufträge für Claude Code vor, markiert F&E-Vorhaben für die Forschungszulage und gibt Praxis-Themen an die Redaktion.", takt: "taeglich", ki: true },
  { key: "international", name: "International Business", aufgabe: "Sucht jede Woche reihum in Schweiz, Österreich, Diaspora-Netzwerken und EU-Programmen echte Wege in den Markt (Programme, Kammern, Messen, Pflichten) mit Quelle und nächstem Schritt; Chancen mit Kundenkontakt gehen an den Vertrieb.", takt: "woechentlich", ki: true },
  { key: "einkauf", name: "Einkauf", aufgabe: "Erkennt aus den Belegen laufende Verträge, meldet Preisanstiege über 10 % und neue Abos zur Prüfung. Kündigt nie selbst.", takt: "taeglich", ki: false },
  { key: "personal", name: "Personal (KI-Team)", aufgabe: "Prüft jede Woche das KI-Team: unbesetzte Abteilungen, gescheiterte, stumme und nie gelaufene Mitarbeiter – als ein Auftrag an die Geschäftsführung.", takt: "woechentlich", ki: false },
  { key: "kundenbetreuung", name: "Kundenbetreuung", aufgabe: "Betreut die Bestandskunden: Wer 90 Tage (ehemalige: 180) ohne Kontakt und ohne offene Chance ist, bekommt einen Check-in mit passendem Angebot aus dem Leistungskatalog – als fertige Mail (ohne Mail: Brief) zur Ein-Klick-Freigabe. Fehlen Website oder Kontakt, recherchiert sie das Impressum (mit Quelle, nie geraten).", takt: "taeglich", ki: true },
  { key: "partner", name: "Partner & Empfehlungen", aufgabe: "Sucht jede Woche Multiplikatoren eines Segments (Webagenturen für White-Label-BFSG, Steuerkanzleien, deutsch-türkische Verbände, IT-Systemhäuser) mit Impressums-Anschrift und legt höchstens 2 Partner-Briefe zur Freigabe an; bittet zufriedene Kunden einmal im Jahr um Empfehlung.", takt: "woechentlich", ki: true },
  { key: "controller", name: "Ergebnis-Controller", aufgabe: "Misst jeden KI-Mitarbeiter wöchentlich am Ergebnis: Kontakt → Antwort → Anfrage → Termin → Angebot → gewonnen (€), je Agent und Abteilung. Schickt Schärfen-Aufträge an die Abteilungen und legt Emin einmal pro Woche eine Steuerungs-Karte vor: wer sein Prüffenster ohne Ergebnis hinter sich hat, wird auf Klick pausiert.", takt: "woechentlich", ki: false },
  { key: "angebot", name: "Angebotsautomat", aufgabe: "Füllt jeden Angebots-Entwurf aus Gesprächsnotizen und Verlauf: Positionen nur aus dem Leistungskatalog mit dessen Preisen, Einleitung und Schluss; Unbekanntes mit „Preis prüfen“. Senden bleibt dein Klick.", takt: "taeglich", ki: true },
  { key: "redaktion", name: "Redaktion", aufgabe: "Plant jede Woche 4 LinkedIn-Beiträge (Gründer-Stimme, Praxiswissen, Einblick & Beweis, Branche & Haltung) mit Text, Bild, Sendetermin und Link im ersten Kommentar.", takt: "taeglich", ki: true },
  { key: "ideen", name: "Ideenwerkstatt", aufgabe: "Liest täglich deine Klagen im Chat, die Ergebnis-Karne, Website-Befunde und liegengebliebene Chancen und macht daraus bis zu drei konkrete Verbesserungen – jede sofort mit Zuständigem; im Chat siehst du, wer übernimmt.", takt: "taeglich", ki: true },
  { key: "teftis", name: "Teftiş (Revision)", aufgabe: "Prüft alle 3 Tage unabhängig die ganze Firma: Website, jeden KI-Mitarbeiter (Takt, Fehler, Leerlauf), Zusagen im Chat, liegengebliebene Aufträge, wartende Karten, Chancen ohne nächsten Schritt und Daten. Gibt eine Note mit Trend, verteilt jeden Befund an die Zuständigen und bringt eine „Hamle“ – einen mutigen nächsten Schritt. Täglich dazwischen ein Schnellcheck, der sich nur bei Kritischem meldet.", takt: "taeglich", ki: true },
]

const MODELL = "openai/gpt-5.4-mini"
const RECHERCHE = "perplexity/sonar"

const berlinTag = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })
const kw = (d: Date) => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const jahr = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return `${t.getUTCFullYear()}-${Math.ceil(((t.getTime() - jahr.getTime()) / 86400000 + 1) / 7)}`
}

type Ergebnis = { ergebnis: string; anzahl: number }

async function lage(): Promise<Ergebnis> {
  const board = await collectAttention(getVertriebStore())
  const n = board.items.length
  return { ergebnis: n ? `${n} Punkte im System warten auf dich` : "Nichts wartet auf dich", anzahl: n }
}

/* Offene Vertriebs-Mailkarten, die nicht mehr stimmen (Deal pausiert, abgeschlossen oder ohne Empfänger), schließt das System selbst. */
async function raeumeVertriebsKartenAuf(
  deals: Awaited<ReturnType<typeof ladeVerkaufslage>>["deals"],
  pausiert: Set<string>,
): Promise<void> {
  const q = await assistentDb()
  if (!q) return
  const offen = new Set(deals.map((d) => d.id))
  const rows = (await q(
    `SELECT id, quelle, empfaenger FROM assistent_freigaben WHERE status = 'offen' AND agent = 'vertrieb' AND art = 'mail' AND quelle LIKE 'deal:%'`,
    [],
  )) as { id: string; quelle: string; empfaenger: string | null }[]
  for (const r of rows) {
    const dealId = r.quelle.split(":")[1]
    const weg = pausiert.has(dealId) || !offen.has(dealId) || !r.empfaenger || !istMail(r.empfaenger)
    if (!weg) continue
    await q(
      `UPDATE assistent_freigaben SET status = 'verworfen', erledigt_at = now(),
         extra = coalesce(extra, '{}'::jsonb) || jsonb_build_object('automatisch', 'Vom System geschlossen: Pause, Abschluss oder kein Empfänger')
       WHERE id = $1 AND status = 'offen'`,
      [r.id],
    )
  }
}

async function vertrieb(): Promise<Ergebnis> {
  const { deals } = await ladeVerkaufslage()
  const woche = kw(new Date())
  const heute = berlinTag(new Date())
  /* Abgesprochene Pause (nächster Schritt in der Zukunft) = Ruhe. Ohne Empfänger keine Mailkarte. */
  const pausiert = new Set(deals.filter((d) => d.faelligAm && d.faelligAm > heute).map((d) => d.id))
  await raeumeVertriebsKartenAuf(deals, pausiert)
  const kandidaten = deals
    .filter((d) => d.warnungen.length > 0 && !pausiert.has(d.id) && d.kontaktMail && istMail(d.kontaktMail))
    .slice(0, 4)
  /* Steht für den Deal schon eine offene Erinnerung der Automation (lib/automation.ts), melden wir ihn nicht ein zweites Mal. */
  const schonErinnert = await offeneAutomationErinnerungen(kandidaten.map((d) => d.id))
  let neu = 0
  let uebersprungen = 0
  for (const deal of kandidaten) {
    if (neu >= 2) break
    if (schonErinnert.has(deal.id)) {
      uebersprungen++
      continue
    }
    const quelle = `deal:${deal.id}:${woche}`
    if (await quelleBekannt(quelle)) continue
    await erstelleEntwurf(deal)
    const e = (await ladeEntwuerfe())[deal.id]
    if (!e) continue
    const id = await legeFreigabeAn({
      art: "mail",
      titel: `Nachfassen: ${deal.firma ?? deal.titel}`,
      empfaenger: deal.kontaktMail,
      betreff: e.betreff,
      inhalt: e.text,
      quelle,
      agent: "vertrieb",
    })
    if (id) neu++
  }
  return {
    ergebnis: kandidaten.length
      ? `${neu} Mailentwürfe für ${kandidaten.length} gefährdete Abschlüsse${uebersprungen ? ` (${uebersprungen} bereits als Automation-Erinnerung offen)` : ""}`
      : "Alle Abschlüsse im Takt",
    anzahl: neu,
  }
}

function naechsterBeginn(m: Messe, heute: Date): Date {
  if (m.termin) return new Date(m.termin.von)
  const j = heute.getFullYear()
  const d = new Date(j, m.monat - 1, 1)
  return d < heute ? new Date(j + 1, m.monat - 1, 1) : d
}

async function projekte(): Promise<Ergebnis> {
  const { projektAgentLauf } = await import("@/lib/projekte/agent")
  return projektAgentLauf()
}

async function finanz(): Promise<Ergebnis> {
  const { finanzAgentLauf } = await import("@/lib/finanz/agent")
  return finanzAgentLauf()
}

async function messen(): Promise<Ergebnis> {
  const [status, vorschlaege] = await Promise.all([ladeStatus(), ladeVorschlaege()])
  const heute = new Date()
  const teil = [...MESSEN, ...vorschlaege].filter((m) => status[messeKey(m.name)] === "teilnehmen")
  let neu = 0
  for (const m of teil) {
    const beginn = naechsterBeginn(m, heute)
    const tage = Math.round((beginn.getTime() - heute.getTime()) / 86400000)
    if (tage < 0 || tage > 150) continue
    const datum = beginn.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })
    const id = await legeFreigabeAn({
      art: "aufgabe",
      titel: `Messe vorbereiten: ${m.name}`,
      inhalt: [
        `${m.name} · ${m.ort}, ${m.land} · ab ${datum} (in ${tage} Tagen)`,
        `Warum: ${m.nutzen}`,
        "",
        "Plan:",
        `1. Unterkunft in ${m.ort} jetzt buchen (Messewochen sind früh ausgebucht).`,
        "2. Ausstellerliste vom Veranstalter laden und 15 Zielfirmen markieren.",
        "3. Zwei Wochen vorher Termine anfragen – der Vertriebsagent schreibt die Mails.",
        "4. Material: Visitenkarten, ein Satz Pitch je Produkt, QR-Code zur Webseite.",
        "5. Nach der Messe: Kontakte innerhalb von 48 Stunden in Kunden eintragen.",
        "",
        `Veranstalter: ${m.url}`,
      ].join("\n"),
      quelle: `messe:${messeKey(m.name)}:${beginn.getFullYear()}`,
      agent: "messen",
    })
    if (id) neu++
  }
  if (neu > 0) await protokolliereFaden(await assistentDb().catch(() => null), "messen", "assistent", `${neu} Vorbereitungspläne`)
  return { ergebnis: teil.length ? `${neu} neue Vorbereitungspläne · ${teil.length} Messen zugesagt` : "Noch keine Messe zugesagt", anzahl: neu }
}

type Chance = { programm: string; geber: string; betrag: string; frist: string; url: string; warum: string }

function jsonListe<T>(text: string): T[] {
  const start = text.indexOf("[")
  const ende = text.lastIndexOf("]")
  if (start < 0 || ende <= start) return []
  try {
    return JSON.parse(text.slice(start, ende + 1)) as T[]
  } catch {
    return []
  }
}

async function kapital(): Promise<Ergebnis> {
  const { text } = await generateText({
    model: RECHERCHE,
    prompt: `Recherchiere aktuell (Stand ${berlinTag(new Date())}) offene Förderprogramme, Förderkredite, Wettbewerbe mit Preisgeld und Investoren-Programme für:
${firmenText("voll")}
Ziel: Wachstum und Vertrieb in Deutschland, der Schweiz und Europa.
Nur Programme, die JETZT Anträge annehmen und für ein Einzelunternehmen zulässig sind. Bevorzugt: NBank, KfW, EU (EIC, Horizon), Bund-Digitalprogramme, Accelerator in DACH/EU.
Antworte NUR mit einem JSON-Array (max. 4 Einträge): [{"programm":"","geber":"","betrag":"Spanne oder Höhe laut Quelle","frist":"Datum oder laufend","url":"offizielle Seite","warum":"1 Satz, warum es zu creaDIG passt"}]. Keine Erfindungen – wenn unsicher, weglassen.`,
  })
  const chancen = jsonListe<Chance>(text).filter((c) => c?.programm && c?.url?.startsWith("http"))
  let neu = 0
  for (const c of chancen) {
    const id = await legeFreigabeAn({
      art: "kapital",
      titel: `${c.programm} · ${c.betrag}`,
      inhalt: `${c.geber}\nBetrag: ${c.betrag}\nFrist: ${c.frist}\n\n${c.warum}\n\nQuelle: ${c.url}\n\nVor Antrag Bedingungen auf der Quelle prüfen.`,
      quelle: `kapital:${c.programm.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      agent: "kapital",
    })
    if (id) neu++
  }
  return { ergebnis: `${neu} neue Kapitalchancen gefunden`, anzahl: neu }
}

/** Echter Stoff aus der eigenen Arbeit – die Redaktion erfindet keine Projekte. */
const STOFF = [
  "fibero: Software für Glasfaser-Montagefirmen (Aufmaß, Fotos, Hausanschlüsse, Abrechnung). Zielgruppe: Montage-, Tiefbau- und Spleißbetriebe.",
  "stammo: digitale Stempelkarte im Apple/Google Wallet für Cafés, Imbisse, Bäckereien. Erkennt Besuchsrhythmus und meldet, wenn Stammgäste wegbleiben.",
  "creaDIG Control Center: ein kleiner Betrieb lässt Anfragen, Termine, Nachfassen und Mailings automatisch laufen; KI-Agenten bereiten vor, der Mensch entscheidet.",
  "creaDIG Web & System für Vereine, Verbände, Moscheegemeinden, Stiftungen: Webseite plus Anmeldung, Mitglieder, Termine aus einer Hand.",
  "Erfahrung als Einzelunternehmer: wie man mit KI-Agenten statt Team arbeitet – was funktioniert, was nicht.",
]

type Artikel = { thema: string; warum: string; bezug: string; titel: string; text: string; bildidee: string; alt: string }

function jsonObjekt<T>(text: string): T | null {
  const a = text.indexOf("{")
  const b = text.lastIndexOf("}")
  if (a < 0 || b <= a) return null
  try {
    return JSON.parse(text.slice(a, b + 1)) as T
  } catch {
    return null
  }
}

type RedaktionsLage = { marketing?: string; beschluesse: string[]; lage: string; branche: string; frueher: string[]; inhalte: string; woche: string; zielgruppe: string }

/** Wochenplan: jede fehlende Säule dieser Woche wird geschrieben, bebildert und mit Sendetermin zur Freigabe gelegt. */
async function redaktion(): Promise<Ergebnis> {
  const woche = kw(new Date())
  const fehlend: Saeule[] = []
  for (const s of SAEULEN) {
    if (await quelleBekannt(`linkedin:${woche}:${s.key}`)) continue
    /* Der frühere Einzelbeitrag pro Woche zählt als Gründer-Stimme. */
    if (s.key === "gruender" && (await quelleBekannt(`linkedin:${woche}`))) continue
    fehlend.push(s)
  }
  if (!fehlend.length) return { ergebnis: "Wochenplan steht – alle Beiträge liegen bereit", anzahl: 0 }

  const [raete, frueher, rahmen, branche, inhalte] = await Promise.all([
    ladeRaete(1).catch(() => []),
    letzteArtikel(12),
    firmenRahmen(),
    bulletinStoff().catch(() => "—"),
    inhalteText(),
  ])
  const rat = raete[0]?.protokoll
  const lage: RedaktionsLage = {
    marketing: rat?.stimmen.find((s) => /marketing/i.test(s.rolle))?.sagt,
    beschluesse: rat?.beschluesse.map((b) => b.was) ?? [],
    lage: rahmen.text,
    branche,
    frueher: frueher.map((f) => f.titel),
    inhalte,
    woche,
    zielgruppe: zielgruppeDerWoche(Number(woche.split("-")[1])),
  }

  const ergebnisse = await Promise.allSettled(fehlend.map((s) => schreibeBeitrag(s, lage)))
  const fertig = ergebnisse.filter((r) => r.status === "fulfilled" && r.value).length
  const fehler = ergebnisse.find((r): r is PromiseRejectedResult => r.status === "rejected")
  if (!fertig && fehler) throw fehler.reason
  return { ergebnis: `${fertig} von ${fehlend.length} Beiträgen für KW ${woche.split("-")[1]} bereit (${lage.zielgruppe.split(" (")[0]})`, anzahl: fertig }
}

async function schreibeBeitrag(s: Saeule, l: RedaktionsLage): Promise<boolean> {
  const { text } = await generateText({
    model: MODELL,
    prompt: `Du bist die Redaktion von creaDIG Solutions. Du schreibst genau EINEN LinkedIn-Beitrag auf Deutsch.
${firmenText("voll")}

SÄULE: ${s.name} – Ziel: ${s.ziel}
KANAL: ${s.kanal === "firma" ? "Unternehmensseite creaDIG" : "persönliches Profil von Emin"} · Stimme: ${s.stimme}
AUFTRAG: ${s.anleitung}
ZIELGRUPPE DIESER WOCHE: ${l.zielgruppe}

Hintergrund (nur daraus schöpfen, nichts erfinden):
- Geschäftsleitung, Marketing sagte: ${l.marketing ?? "(noch keine Sitzung)"}
- Beschlüsse: ${l.beschluesse.join(" | ") || "(keine)"}
- Lage: ${l.lage}
- Produkte/Stoff: ${STOFF.join(" || ")}
- Branche aktuell (Bulletin, mit Quelle): ${l.branche}
- Schon vorbereitet – NICHT wiederholen: ${l.frueher.join(" | ") || "(nichts)"}
- Website-Artikel darfst du aufgreifen und im ersten Kommentar verlinken.
${l.inhalte}

AUFBAU (so funktioniert LinkedIn):
1. Haken: die ersten zwei Zeilen (max. 200 Zeichen) entscheiden, ob jemand „mehr anzeigen“ klickt – eine überraschende Beobachtung oder klare These aus dem Alltag der Zielgruppe. Keine Frage als Einstieg, kein „Heute möchte ich…“.
2. Leerzeile, dann kurze Absätze (1–3 Sätze), viel Weißraum, gut auf dem Handy lesbar.
3. Konkreter Nutzen: etwas, das man sofort anwenden kann.
4. Schluss: eine echte, leicht zu beantwortende Frage an die Leser (erzeugt Kommentare = Reichweite).
- 150–230 Wörter, keine Emojis, kein Link im Text, keine Kundennamen, keine erfundenen Zahlen, max. 3 Hashtags in der letzten Zeile.
- Rechtlich sauber: keine Heilsversprechen, keine Garantien, keine Vergleiche mit namentlich genannten Wettbewerbern.

BILD: eine konkrete fotografische Szene (Englisch, ein Satz) mit Gegenständen, Händen oder einem Ort aus dem Alltag der Zielgruppe, die die Kernaussage als Bild zeigt (z. B. „a worn paper loyalty card next to a cobalt blue coffee cup on a café counter“) – keine Gesichter, keine Schrift, keine Bildschirme, keine Roboter, nichts Futuristisches.

Antworte NUR mit JSON:
{"thema":"…","warum":"1 Satz: warum dieses Thema jetzt Kunden aus der Zielgruppe bringt","bezug":"welcher Stoff/Beschluss","titel":"…","text":"…","kommentar":"1 kurzer Satz für den ersten Kommentar, der neugierig auf den Link macht","bildidee":"…","alt":"Bildbeschreibung Deutsch, 1 Satz"}`,
  })

  const a = jsonObjekt<Artikel & { kommentar?: string }>(text)
  if (!a?.titel || !a.text) throw new Error(`Redaktion (${s.name}) lieferte keinen gültigen Beitrag`)

  const id = neueFreigabeId()
  const bildPfad = a.bildidee ? await erzeugeBild(`assistent/linkedin/${id}.png`, a.bildidee) : null
  const geplant = geplantFuer(s)
  const angelegt = await legeFreigabeAn({
    id,
    art: "linkedin",
    titel: a.titel.replace(/^#+\s*/, "").slice(0, 150),
    inhalt: a.text.trim(),
    quelle: `linkedin:${l.woche}:${s.key}`,
    agent: "redaktion",
    bildPfad,
    extra: {
      warum: a.warum,
      bezug: a.bezug,
      alt: a.alt,
      saeule: s.key,
      ziel: s.kanal,
      geplant: geplant?.toISOString() ?? null,
      kommentar: `${(a.kommentar || s.kommentar).trim()}\n${linkMitUtm(s, l.woche)}`,
    },
  })
  return Boolean(angelegt)
}

type Ziel = { firma: string; ort: string; website: string; email?: string; strasse?: string; plz?: string; land?: string; warum: string; betreff: string; mail: string }

const JAEGER_ANZAHL = 8

async function bekannteJaegerFirmen(): Promise<string[]> {
  const q = await assistentDb()
  if (!q) return []
  const rows = (await q(
    `SELECT DISTINCT regexp_replace(titel, '^Neukunde [^:]+: ', '') AS firma FROM assistent_freigaben WHERE agent = 'jaeger' LIMIT 200`,
    [],
  ).catch(() => [])) as { firma: string }[]
  return rows.map((r) => r.firma)
}

async function zaehleJaegerLaeufe(): Promise<number> {
  const q = await assistentDb()
  if (!q) return 0
  const rows = (await q(`SELECT count(*)::int AS n FROM assistent_laeufe WHERE agent = 'jaeger'`, []).catch(() => [])) as { n: number }[]
  return rows[0]?.n ?? 0
}

const JAGDREVIER = [
  {
    produkt: "fibero",
    id: "fibero" as const,
    suche:
      "Glasfaser-Montagefirmen, FTTH-Tiefbau- und Spleißbetriebe (5–80 Mitarbeiter) in Niedersachsen, NRW, Bremen, Hamburg, Hessen, die als Subunternehmer für Netzbetreiber arbeiten",
    angebot: "fibero: Aufmaß, Fotos, Hausanschlüsse und Abrechnung an einem Ort statt Excel und WhatsApp",
  },
  {
    produkt: "creaDIG Web & System",
    id: "creadig" as const,
    suche:
      "Vereine, Verbände, Moscheegemeinden, Stiftungen und mittelständische Betriebe in Niedersachsen/NRW mit sichtbar veralteter Webseite oder ohne Online-Anmeldung/Mitgliederverwaltung",
    angebot: "creaDIG: moderne Webseite plus System (Anmeldung, Mitglieder, Termine) aus einer Hand",
  },
  {
    produkt: "stammo",
    id: "stammo" as const,
    suche:
      "inhabergeführte Cafés, Bäckereien, Imbisse und vegane Restaurants mit 2–6 Filialen in Deutschland, Österreich, Schweiz oder dem Elsass",
    angebot: "stammo: Stempelkarte im Apple/Google Wallet, die Stammgäste zurückholt",
  },
]

const slugJaeger = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)

async function jaeger(): Promise<Ergebnis> {
  const woche = kw(new Date())
  const lauf = (await zaehleJaegerLaeufe()) + Number(woche.split("-")[1])
  const revier = JAGDREVIER[lauf % JAGDREVIER.length]
  const bekannt = await bekannteJaegerFirmen()
  const { text } = await generateText({
    model: RECHERCHE,
    prompt: `${INHABER}
Finde ${JAEGER_ANZAHL * 2} echte, aktuell existierende Firmen als Neukunden für ${revier.produkt}.
Zielgruppe: ${revier.suche}.
Nur Firmen mit eigener Webseite, die du in der Quelle gesehen hast. Keine Konzerne. Keine Erfindungen.
Pflicht: die Postanschrift aus dem Impressum (Straße mit Hausnummer, PLZ, Ort, Land) – genau so, wie sie dort steht, niemals raten. Firmen ohne Impressums-Anschrift weglassen. Die öffentliche Kontakt-E-Mail nur angeben, wenn sie im Impressum steht.
${bekannt.length ? `Diese Firmen kennen wir schon – NICHT erneut nennen: ${bekannt.slice(0, 80).join(", ")}.` : ""}
Für jede Firma einen kurzen persönlichen BRIEF auf Deutsch (Post, keine E-Mail – Werbung per E-Mail ohne Einwilligung ist unzulässig; 90–140 Wörter, per Sie, Absender Muhammed Emin Akyol): ein konkreter Bezug zur Firma, ein Nutzen aus "${revier.angebot}", am Ende die Einladung, sich bei Interesse selbst zu melden (creadig.de/termin). Kein Werbeton, keine Superlative, keine Aufzählungen.
Antworte NUR mit JSON-Array: [{"firma":"","strasse":"","plz":"","ort":"","land":"Deutschland","website":"https://...","email":"","warum":"1 Satz, warum gerade diese Firma","betreff":"","mail":"nur der Brieftext ab der Anrede, mit Gruß und Name"}]`,
  })
  const ziele = jsonListe<Ziel>(text)
    .filter((z) => z?.firma && z?.website?.startsWith("http") && z?.mail)
    .slice(0, JAEGER_ANZAHL * 2)
  const pruefeMitWiederholung = async (web: string) => {
    const erst = await pruefeWebseite(web).catch(() => null)
    if (erst?.erreichbar) return erst
    return (await pruefeWebseite(web).catch(() => null)) ?? erst
  }
  const [adressen, checks] = await Promise.all([
    Promise.all(ziele.map((z) => findeKontaktMail(z.website).catch(() => null))),
    Promise.all(ziele.map((z) => pruefeMitWiederholung(z.website))),
  ])
  const q = await assistentDb()
  const liste: string[] = []
  let neu = 0
  for (const [i, z] of ziele.entries()) {
    const check = checks[i]
    const befund = check?.befunde[0]
    const ps = befund
      ? `\n\nP.S. Mir ist beim Blick auf Ihre Webseite aufgefallen: ${befund} Das lässt sich meist schnell beheben. Wenn Sie möchten, schicke ich Ihnen eine kurze Einschätzung, kostenlos.`
      : revier.id !== "creadig"
        ? `\n\nP.S. Neben ${revier.produkt} bauen wir auch Webseiten und digitale Abläufe für Betriebe wie Ihren, falls das irgendwann ein Thema wird.`
        : ""
    let host = ""
    try {
      host = new URL(z.website).hostname.replace(/^www\./, "").toLowerCase()
    } catch {}
    const genannt = istMail(z.email) && z.email.trim().toLowerCase().endsWith(`@${host}`) ? z.email.trim().toLowerCase() : null
    const an = adressen[i] ?? genannt
    /*
     * Erstansprache per Brief (Owner-Entscheid 24.10.2026): Pflicht ist die
     * Impressums-Anschrift, nicht mehr die E-Mail. Bis hierher verwarf der
     * Jäger jede Firma ohne auffindbare Mail – am 23.10. blieb so 1 von 16.
     */
    const anschrift =
      z.strasse?.trim() && /^\d{4,5}$/.test(z.plz?.trim() ?? "") && z.ort?.trim()
        ? { firma: z.firma.trim(), strasse: z.strasse.trim(), plz: z.plz!.trim(), ort: z.ort.trim(), land: z.land?.trim() || undefined }
        : null
    if (!anschrift || !q) continue
    if (neu >= JAEGER_ANZAHL) break
    if (an && (await sperrGrund(an))) continue
    const firma = await findeOderLegeFirma(q, {
      name: z.firma,
      website: z.website,
      city: z.ort,
      note: `Zielfirma (Kunden-Jäger, KW ${woche}) für ${revier.produkt}. ${z.warum}`,
    })
    if (!firma.neu) continue
    await q(`UPDATE organisations SET note = concat_ws(E'\n\n', nullif(note,''), $2::text), updated_at = now() WHERE id = $1`, [
      firma.id,
      `Anschrift laut Impressum: ${anschrift.strasse}, ${anschrift.plz} ${anschrift.ort}${an ? `\nKontakt laut Webseite: ${an}` : ""}\nAnsprache: Brief per Post – Werbung per E-Mail ohne Einwilligung ist unzulässig (UWG § 7).\n${check ? webcheckNotiz(check) : ""}`.slice(0, 4000),
    ])
    /* Katman 6: Ohne Briefkanal keine Karte, die beim Freigeben nur scheitert – der Brief wartet im Firmenprofil. */
    if (!briefBereit()) {
      await q(`UPDATE organisations SET note = concat_ws(E'\n\n', nullif(note,''), $2::text), updated_at = now() WHERE id = $1`, [
        firma.id,
        `Brief-Entwurf (wartet auf Briefkanal):\nBetreff: ${z.betreff}\n\n${z.mail.trim()}${ps}`.slice(0, 4000),
      ])
      liste.push(`- ${z.firma} (${z.ort}) · ${z.website} · ${z.warum}`)
      neu++
      continue
    }
    const kartenId = await legeFreigabeAn({
      art: "brief",
      titel: `Brief an ${z.firma} (${z.ort})`,
      inhalt: `${z.mail.trim()}${ps}`,
      betreff: z.betreff,
      empfaenger: an ?? null,
      quelle: `brief:${host || slugJaeger(z.firma)}`,
      agent: "jaeger",
      extra: { warum: z.warum, anschrift, orgId: firma.id, produkt: revier.id === "fibero" || revier.id === "stammo" ? revier.id : "creadig" },
    })
    /* Katman 6: Nur gezählt, was wirklich als Karte angelegt wurde (gesperrtes Ziel, Doppel → null). */
    if (!kartenId) continue
    liste.push(`- ${z.firma} (${z.ort}) · ${z.website} · ${z.warum}`)
    neu++
  }
  if (liste.length) {
    const { legeAuftragAn } = await import("@/lib/koordination/koordinator")
    await legeAuftragAn({
      von: "vertrieb",
      an: "marketing",
      titel: `Zielliste KW ${woche}: ${liste.length} Firmen für ${revier.produkt}`,
      inhalt: `Zielgruppe: ${revier.suche}\nAngebot: ${revier.angebot}\n\n${liste.join("\n")}\n\n${briefBereit() ? "Die Briefe liegen fertig bei Emin zur Freigabe (Post über LetterXpress)." : "Briefkanal noch nicht eingerichtet – die Brief-Entwürfe stehen im Firmenprofil."} Kein Mailversand ohne Einwilligung.`,
      quelle: `jaeger:${woche}:${revier.id}`,
    })
  }
  return {
    ergebnis: `${neu} Zielfirmen für ${revier.produkt} recherchiert – ${neu} Briefe ${briefBereit() ? "zur Freigabe" : "im Firmenprofil geparkt (Briefkanal fehlt)"}`,
    anzahl: neu,
  }
}

async function rat(opt: { manuell?: boolean } = {}): Promise<Ergebnis> {
  const kwHeute = kw(new Date())
  const [rahmen, verkauf, status, offene, laeufe, frueher] = await Promise.all([
    firmenRahmen(),
    ladeVerkaufslage(),
    ladeStatus(),
    ladeFreigaben(),
    letzteLaeufe(),
    ladeRaete(2),
  ])
  await protokolliereFaden(await assistentDb().catch(() => null), "finanz", "assistent", "Rat liest Finanzrahmen")
  const schonGetagt = Boolean(frueher[0]?.woche.startsWith(kwHeute))
  if (schonGetagt && !opt.manuell) return { ergebnis: "Sitzung dieser Woche hat schon getagt", anzahl: 0 }
  /* Ruft Emin selbst eine Sitzung ein, obwohl diese Woche schon getagt wurde, ist es eine außerordentliche Sitzung mit eigenem Schlüssel. */
  const ausserordentlich = schonGetagt
  const woche = ausserordentlich ? `${kwHeute}-a${Date.now().toString(36)}` : kwHeute
  const kwNr = kwHeute.split("-")[1] ?? kwHeute

  const zugesagt = Object.entries(status).filter(([, s]) => s === "teilnehmen").map(([k]) => k)
  const lagebild = {
    finanzen: rahmen.text,
    vertrieb: {
      monatszielEur: MONATSZIEL,
      deals: verkauf.deals.slice(0, 8).map((d) => ({ firma: d.firma ?? d.titel, stufe: d.stufe, wertEur: d.wert, naechsterSchritt: d.naechsterSchritt, warnungen: d.warnungen })),
    },
    messenZugesagt: zugesagt,
    offeneFreigaben: offene.filter((f) => f.status === "offen").map((f) => `${f.agent ?? "?"}: ${f.titel}`).slice(0, 12),
    letzteAgentenLaeufe: Object.values(laeufe).map((l) => `${l.agent}: ${l.ergebnis}`),
    letzteSitzung: frueher[0]
      ? { beschluesse: frueher[0].protokoll.beschluesse.map((b) => b.was), frage: frueher[0].protokoll.frage, antwortVonEmin: frueher[0].antwort ?? "noch keine Antwort" }
      : null,
  }

  const { text } = await generateText({
    model: MODELL,
    maxOutputTokens: 2500,
    prompt: `Ihr seid die Geschäftsleitung von creaDIG Solutions und haltet ${ausserordentlich ? `eine AUSSERORDENTLICHE Sitzung in KW ${kwNr} (Emin hat sie einberufen – geht auf das ein, was sich seit der letzten Sitzung geändert hat)` : `die Wochensitzung KW ${kwNr}`}. Ihr behandelt die Firma als eure eigene und denkt wie Gründer, die aus wenig viel machen.
${INHABER}

Teilnehmer: CEO (Richtung, Fokus, sagt Nein zu Ablenkung), CFO (prüft jede Idee gegen das Budget unten – blockiert alles, was nicht bezahlbar ist), Vertrieb (Abschlüsse, Neukunden), Marketing (LinkedIn-Artikel, Sichtbarkeit, organisch zuerst).

Lagebild (echte Daten, nichts dazuerfinden):
${JSON.stringify(lagebild, null, 1)}

Regeln:
- Nur Beschlüsse, die mit dem Budget machbar sind. Summe kostenEur aller Beschlüsse ≤ ${rahmen.spielraumEur}. Kostenlos ist bevorzugt.
- Was der CFO oder CEO ablehnt (z. B. Messestand, bezahlte Werbung, neues Produkt), kommt mit Grund in "verworfen".
- Emin hat ca. 10 Stunden pro Woche für Vertrieb. Maximal 3 Beschlüsse. Jeder Beschluss konkret und in einer Woche erledigbar.
- "wer": "truppe" = die KI-Agenten bereiten vor; "emin" = nur er kann es tun (Anruf, Termin, Unterschrift).
- "abteilung": welche Abteilung den Beschluss umsetzt bzw. vorbereitet, eine ID aus: ${ABTEILUNGEN.map((a) => `${a.id} (${a.name.de})`).join(", ")}.
- Wenn Emin letzte Woche geantwortet hat, berücksichtigt seine Antwort ausdrücklich.
- "frage": genau eine Rückfrage an Emin, deren Antwort die nächste Sitzung besser macht.
- Deutsch, klar, keine Floskeln.

Antworte NUR mit JSON: {"lage":"2 Sätze","stimmen":[{"rolle":"CEO","sagt":""},{"rolle":"CFO","sagt":""},{"rolle":"Vertrieb","sagt":""},{"rolle":"Marketing","sagt":""}],"beschluesse":[{"was":"","warum":"","kostenEur":0,"wer":"emin","abteilung":"vertrieb"}],"verworfen":["Idee – Grund"],"frage":""}`,
  })

  const start = text.indexOf("{")
  const ende = text.lastIndexOf("}")
  let p: RatProtokoll | null = null
  try {
    p = JSON.parse(text.slice(start, ende + 1)) as RatProtokoll
  } catch {
    p = null
  }
  if (!p?.lage || !Array.isArray(p.stimmen) || !Array.isArray(p.beschluesse)) throw new Error("Sitzungsprotokoll unlesbar")
  p.beschluesse = p.beschluesse.slice(0, 3).map((b) => ({
    ...b,
    kostenEur: Math.max(0, Number(b.kostenEur) || 0),
    wer: b.wer === "truppe" ? "truppe" : "emin",
    abteilung: ABTEILUNGEN.some((a) => a.id === b.abteilung) ? b.abteilung : "geschaeftsfuehrung",
  }))
  p.verworfen = Array.isArray(p.verworfen) ? p.verworfen.slice(0, 4) : []
  p.stimmen = p.stimmen.filter((s) => s?.rolle && s?.sagt)
  p.frage = typeof p.frage === "string" ? p.frage : ""
  if (!(await speichereRat(woche, p))) return { ergebnis: "Sitzung dieser Woche hat schon getagt", anzahl: 0 }

  const sitzung = ausserordentlich ? `außerordentlichen Sitzung KW ${kwNr}` : `Wochensitzung KW ${kwNr}`
  const { legeAuftragAn } = await import("@/lib/koordination/koordinator")
  let verteilt = 0
  for (const [i, b] of p.beschluesse.entries()) {
    if (b.wer === "emin") {
      await legeFreigabeAn({
        art: "aufgabe",
        titel: `Beschluss: ${b.was}`.slice(0, 160),
        inhalt: `${b.warum}\n\nKosten: ${b.kostenEur ? `${b.kostenEur} €` : "keine"}\nAus der ${sitzung}.`,
        quelle: `rat:${woche}:${i}`,
        agent: "rat",
      })
    }
    /* Jeder Beschluss wird sofort Arbeit einer Abteilung – auch Emins: die Abteilung bereitet alles vor, damit er nur noch handeln muss. */
    const id = await legeAuftragAn({
      von: "geschaeftsfuehrung",
      an: b.abteilung ?? "geschaeftsfuehrung",
      titel: `${b.wer === "emin" ? "Für Emin vorbereiten" : "Umsetzen"}: ${b.was}`,
      inhalt: `${b.warum}\n\nBudget: ${b.kostenEur ? `${b.kostenEur} €` : "kostenlos"}\nBeschlossen in der ${sitzung}.${b.wer === "emin" ? "\nEmin führt aus – liefere ihm eine fertige Vorlage (Text, Nummer, Ablauf)." : ""}`,
      quelle: `rat-auftrag:${woche}:${i}`,
    }).catch(() => null)
    if (id) verteilt++
  }
  if (verteilt > 0) await koordinationAbarbeiten()

  const { sendeRatMail } = await import("./rat-mail")
  const mail = await sendeRatMail(p, { kw: kwNr, ausserordentlich, auftraege: verteilt }).catch((e) => {
    console.error("[assistent] rat-mail", e instanceof Error ? e.message : e)
    return false
  })
  return {
    ergebnis: `${ausserordentlich ? "Außerordentliche Sitzung" : "Sitzung"} KW ${kwNr}: ${p.beschluesse.length} Beschlüsse, ${verteilt} an Abteilungen verteilt${mail ? ", Protokoll per Mail" : ""}`,
    anzahl: p.beschluesse.length,
  }
}

type GolfChance = {
  name: string
  art: string
  land: string
  url: string
  warum: string
  naechsterSchritt: string
  nachrichtEn: string
  nachrichtAr: string
}

/** Golf-Radar: Kapital und Türöffner in VAE, Saudi-Arabien, Katar. Wöchentlich 3 Chancen, jede mit fertiger Erstnachricht. */
async function golf(): Promise<Ergebnis> {
  const { text } = await generateText({
    model: RECHERCHE,
    prompt: `Research (as of ${berlinTag(new Date())}) concrete, currently active opportunities in the UAE, Saudi Arabia and Qatar for this company:
${firmenTextEn()} The founder speaks German, English, Turkish and Arabic. Also: its own AI operating system (15 departments run by AI agents), and Islamic digital services (Quran study with Arabic root reading, donation live-streaming, mosque/association management).
Goal: strategic investor or partner for Gulf expansion, NOT small client work.
Look for: accelerator/soft-landing programmes accepting foreign founders (Hub71, DIFC Innovation Hub, in5, Dubai Future District, Garage Riyadh, Misk, Monsha'at, QSTP, Qatar Development Bank), AI/tech investment funds and family offices with a stated tech or Islamic-economy thesis, awqaf/Islamic-economy digitalisation initiatives, and events with investor meetings (LEAP, GITEX, Web Summit Qatar) with open application or registration deadlines.
Only real, verifiable entries with an official URL. Max 3.
Reply ONLY with a JSON array: [{"name":"","art":"Accelerator|Fund|Family Office|Programme|Event|Institution","land":"","url":"","warum":"1 sentence in German why it fits creaDIG","naechsterSchritt":"1 concrete next step in German incl. deadline if known","nachrichtEn":"first outreach message in English, max 90 words, warm and confident, mention the AI-run company and the Germany–Türkiye–Gulf bridge, ask for a 20-minute call, sign as Muhammed Emin Akyol, creaDIG Solutions","nachrichtAr":"the same message in natural Modern Standard Arabic"}]. If unsure, leave it out.`,
  })
  const chancen = jsonListe<GolfChance>(text).filter((c) => c?.name && c?.url?.startsWith("http"))
  let neu = 0
  for (const c of chancen.slice(0, 3)) {
    const id = await legeFreigabeAn({
      art: "kapital",
      titel: `Golf · ${c.name} (${c.land})`,
      inhalt: `${c.art} · ${c.land}\n\n${c.warum}\n\nNächster Schritt: ${c.naechsterSchritt}\n\nQuelle: ${c.url}\n\n— Erstnachricht (EN) —\n${c.nachrichtEn}\n\n— Erstnachricht (AR) —\n${c.nachrichtAr}\n\nTipp: Mit der Nachricht einen persönlichen Investorenraum-Link mitschicken (/admin/investoren).`,
      quelle: `golf:${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      agent: "golf",
    })
    if (id) neu++
  }
  return { ergebnis: `${neu} neue Golf-Chancen mit Erstnachricht`, anzahl: neu }
}

async function recht(): Promise<Ergebnis> {
  return rechtsRunde()
}

/** Marketingleitung: macht aus Zielliste, Beschlüssen und Absagen einen Wochenplan und verteilt ihn an die Abteilungen. */
async function marketing(): Promise<Ergebnis> {
  const woche = kw(new Date())
  const { ladeAuftraegeMitQuelle, legeAuftragAn } = await import("@/lib/koordination/koordinator")
  const [ziele, raete, sperren, stoff] = await Promise.all([
    ladeAuftraegeMitQuelle("jaeger:", 3).catch(() => []),
    ladeRaete(1).catch(() => []),
    ladeSperrliste(10).catch(() => []),
    bulletinStoff().catch(() => ""),
  ])
  const erlaubt = ABTEILUNGEN.filter((a) => a.id !== "marketing").map((a) => a.id)
  const { text } = await generateText({
    model: MODELL,
    prompt: `${INHABER}
Du bist die Marketingleitung von creaDIG Solutions. Regel von Recht & Compliance: KEINE Werbe-E-Mails ohne Einwilligung (UWG § 7). Neukunden kommen über erlaubte Wege: Fachartikel/LinkedIn/SEO (Einwilligung entsteht durch Anfrage), persönliche Briefe per Post, Veranstaltungen/Messen, Empfehlungen, Verbände als Partner.
Zielliste des Kunden-Jägers:\n${ziele.map((z) => `${z.titel}\n${z.inhalt}`).join("\n\n").slice(0, 2500) || "keine"}
Beschlüsse der Geschäftsleitung: ${JSON.stringify(raete[0]?.protokoll ?? null).slice(0, 1200)}
Widersprüche (daraus lernen, Ton anpassen): ${sperren.map((s) => s.grund).join(" | ").slice(0, 600) || "keine"}
Aktuelle Lage: ${String(stoff).slice(0, 800)}
Erstelle den Wochenplan: genau EINE Zielgruppe, EINE Kernbotschaft (Nutzen, kein Werbeton) und 2–3 Aufträge an Abteilungen (ids: ${erlaubt.join(", ")}), z. B. Fachartikel an unternehmenskommunikation, Briefserie an vertrieb, Prüfung an recht.
Antworte NUR mit JSON: {"zielgruppe":"","botschaft":"","auftraege":[{"an":"","titel":"","inhalt":"konkret, was bis wann entsteht"}]}`,
    maxOutputTokens: 1200,
  })
  const roh = text.match(/\{[\s\S]*\}/)?.[0]
  let plan: { zielgruppe?: string; botschaft?: string; auftraege?: { an: string; titel: string; inhalt: string }[] } = {}
  try {
    plan = roh ? JSON.parse(roh) : {}
  } catch {}
  let verteilt = 0
  for (const [i, a] of (plan.auftraege ?? []).slice(0, 3).entries()) {
    if (!a?.titel || !erlaubt.includes(a.an)) continue
    const id = await legeAuftragAn({
      von: "marketing",
      an: a.an,
      titel: a.titel,
      inhalt: `Zielgruppe: ${plan.zielgruppe ?? "-"}\nBotschaft: ${plan.botschaft ?? "-"}\n\n${a.inhalt}`,
      quelle: `marketing:${woche}:${i}`,
    })
    if (id) verteilt++
  }
  return {
    ergebnis: plan.zielgruppe ? `Wochenplan: ${plan.zielgruppe} · ${verteilt} Aufträge verteilt` : "Kein Wochenplan erstellt",
    anzahl: verteilt,
  }
}

async function koordinator(): Promise<Ergebnis> {
  const { koordinatorRunde } = await import("@/lib/koordination/koordinator")
  return koordinatorRunde()
}

/** `trotzPause`: Emin startet einen pausierten Agenten selbst (Knopf im Assistenten). */
type Start = { manuell?: boolean; trotzPause?: boolean }
/** Zusammengelegte Agenten: beide Ergebnisse in einer Zeile, Mengen addiert. */
const verbinde = (...e: Ergebnis[]): Ergebnis => ({ ergebnis: e.map((x) => x.ergebnis).join(" · "), anzahl: e.reduce((n, x) => n + x.anzahl, 0) })
const LAEUFER: Record<AgentKey, (o: Start) => Promise<Ergebnis>> = {
  koordinator,
  lage,
  vertrieb: async () => verbinde(await vertrieb(), await messen()),
  finanz: async () => verbinde(await finanz(), await (await import("@/lib/agenten/forderungen")).forderungsRunde()),
  projekte,
  kapital,
  golf,
  redaktion,
  jaeger,
  recht,
  marketing,
  rat: (o) => rat(o),
  bulletin: (o) => erstelleBulletin({ erzwingen: o.manuell }),
  webseite: async (o) => (await import("@/lib/webseite/pruefer")).websiteRunde(o),
  qualitaet: async () => verbinde(await (await import("@/lib/agenten/qualitaet")).qualitaetsRunde(), await (await import("@/lib/agenten/wissen")).wissensRunde(), await (await import("@/lib/lernen/destillieren")).lernRunde()),
  sicherheit: async () => (await import("@/lib/agenten/sicherheit")).sicherheitsRunde(),
  kundenservice: async () => (await import("@/lib/agenten/kundenservice")).kundenserviceRunde(),
  forschung: async () => (await import("@/lib/agenten/forschung")).forschungsRunde(),
  produkt: async () => (await import("@/lib/agenten/produkt")).produktRunde(),
  entwicklung: async () => (await import("@/lib/agenten/entwicklung")).entwicklungsRunde(),
  international: async () => (await import("@/lib/agenten/international")).internationalRunde(),
  einkauf: async () => (await import("@/lib/agenten/einkauf")).einkaufsRunde(),
  personal: async () => (await import("@/lib/agenten/personal")).personalRunde(),
  kundenbetreuung: async () => (await import("@/lib/agenten/kundenbetreuung")).kundenbetreuungsRunde(),
  partner: async () => (await import("@/lib/agenten/partner")).partnerRunde(),
  controller: async () => (await import("@/lib/agenten/controller")).controllerRunde(),
  angebot: async () => (await import("@/lib/agenten/angebot")).angebotsRunde(),
  ideen: async () => (await import("@/lib/agenten/ideen")).ideenRunde(),
  teftis: async () => (await import("@/lib/agenten/teftis")).teftisRunde(),
}

/** Länger als jede Funktion leben darf (maxDuration 300 s) – danach gilt eine Sperre als verwaist. */
const SPERRE_MINUTEN = 6
/** Weiche Zeitgrenze je Agent im Morgen-Takt: ein hängender Agent hält die anderen nicht auf. */
const AGENT_ZEITLIMIT_MS = 200_000
/** So viele Agenten arbeiten gleichzeitig (schont Gateway-Limits). */
const GLEICHZEITIG = 4
/**
 * Eine Funktion lebt 300 s. Ein neuer Block startet nur, wenn er samt Zeitlimit noch hineinpasst –
 * der Rest bleibt fällig und läuft im nächsten Takt (Folgerunden alle 12 Minuten bis 05:48 UTC,
 * Chef-Runde 06:00 UTC, danach der Puls).
 */
const TAKT_BUDGET_MS = 280_000

/** Ein scheiternder Agent ist ein Alarm (Mail an Emin, gedrosselt je Fenster) – nicht nur eine Logzeile. */
async function meldeAgentFehler(key: AgentKey, grund: string): Promise<void> {
  const name = AGENTEN.find((a) => a.key === key)?.name ?? key
  const { raiseAlert } = await import("@/lib/alert")
  await raiseAlert("agent-fehler", `${name}: ${grund.slice(0, 300)}`).catch((e) => console.error("[assistent] alarm", e))
}

export async function fuehreAgentAus(key: AgentKey, o: Start = {}): Promise<"gelaufen" | "laeuft_schon" | "pausiert"> {
  /*
   * Katman 6: Pause gilt auf JEDEM Weg (Takt, Motor-Ereignis, Puls, Seitenaufruf, Artikel) –
   * vorher prüften nur Takt und Puls, ein pausierter Agent lief über Ereignisse weiter.
   */
  if (!o.trotzPause && !o.manuell) {
    const { pausierteAgenten } = await import("@/lib/ergebnis/steuerung")
    if ((await pausierteAgenten().catch(() => new Set<string>())).has(key)) return "pausiert"
  }
  const sperre = await nimmSperre(`agent:${key}`, SPERRE_MINUTEN)
  if (!sperre) return "laeuft_schon"
  if (sperre.abgebrochen) {
    /* Der vorige Lauf ist gestorben, ohne sich abzumelden – sichtbar machen, statt ihn als "gelaufen" zu zählen. */
    await protokolliereLauf({ agent: key, ergebnis: "Voriger Lauf abgebrochen", anzahl: 0, fehler: "Abgebrochen (Zeitlimit oder Absturz)" })
    await meldeAgentFehler(key, "voriger Lauf abgebrochen (Zeitlimit oder Absturz)")
  }
  const start = Date.now()
  try {
    /* Katman 5: jeder Modellaufruf dieses Laufs bekommt die Regeln aus Emins Entscheidungen (lib/lernen). */
    const { mitAgent } = await import("@/lib/lernen/kontext")
    const r = await mitAgent(key, () => LAEUFER[key](o))
    await protokolliereLauf({ agent: key, ...r, dauerMs: Date.now() - start })
  } catch (e) {
    console.error("[assistent] agent", key, e instanceof Error ? e.message : e)
    await meldeAgentFehler(key, e instanceof Error ? e.message : "Fehler")
    await protokolliereLauf({
      agent: key,
      ergebnis: "Lauf fehlgeschlagen",
      anzahl: 0,
      fehler: e instanceof Error ? e.message : "Fehler",
      dauerMs: Date.now() - start,
    })
  } finally {
    await gibSperre(`agent:${key}`).catch((e) => console.error("[assistent] sperre", key, e instanceof Error ? e.message : e))
  }
  return "gelaufen"
}

/** Agent mit weicher Zeitgrenze: läuft er zu lange, geht der Takt weiter; seine Sperre verfällt von selbst. */
async function mitZeitlimit(key: AgentKey): Promise<void> {
  let uhr: ReturnType<typeof setTimeout> | undefined
  const grenze = new Promise<void>((fertig) => {
    uhr = setTimeout(() => {
      console.error("[assistent] agent", key, "überschreitet", AGENT_ZEITLIMIT_MS / 1000, "s – Takt läuft weiter")
      fertig()
    }, AGENT_ZEITLIMIT_MS)
  })
  await Promise.race([fuehreAgentAus(key).then(() => undefined), grenze])
  clearTimeout(uhr)
}

/** Welche Agenten sind fällig? Gescheiterte Läufe zählen nicht als "heute erledigt". */
export function faelligeAgenten(laeufe: Record<string, Lauf>, jetzt = new Date()): AgentKey[] {
  return AGENTEN.filter((a) => {
    const l = laeufe[a.key]
    if (!l) return true
    const her = jetzt.getTime() - new Date(l.zeit).getTime()
    /* Ein gescheiterter oder leerer Lauf wartet nicht bis morgen bzw. nächste Woche: nach 90 Minuten neuer Versuch. */
    if ((l.fehler || (a.key === "bulletin" && l.anzahl === 0)) && her > 90 * 60000) return true
    return a.takt === "taeglich" ? berlinTag(new Date(l.zeit)) !== berlinTag(jetzt) : her > 6.5 * 86400000
  }).map((a) => a.key)
}

/**
 * Reihenfolge innerhalb eines Takts — gemessen 22.10.2026: Vorher lief Bulletin
 * allein vorweg; brauchte es länger als 80 s, startete in der Runde kein
 * weiterer Agent mehr. Ergebnis: morgens liefen höchstens 4 von 20 Agenten,
 * der Chief of Staff in 30 Tagen genau einmal (er kam nur dran, wenn alle
 * anderen fertig waren UND Zeit übrig blieb).
 *
 * Jetzt:
 * 1. Alle Agenten ohne KI gemeinsam (Datenbankarbeit, Sekunden) — zusammen
 *    mit Bulletin, das nur Zeit kostet, aber niemanden blockiert.
 * 2. KI-Agenten in Blöcken; Redaktion und Geschäftsleitung zuletzt, weil sie
 *    Bulletin-Meldungen lesen.
 * 3. Der Chief of Staff hat eine eigene Runde (`chef`, 06:00 UTC): Er läuft
 *    dort IMMER, wenn er fällig ist — egal, ob andere noch warten. Er sieht
 *    dann die Ergebnisse aller Morgenrunden, bevor um 06:15 die Morgenmail geht.
 */
const LIEST_BULLETIN: AgentKey[] = ["redaktion", "rat", "entwicklung", "produkt"]

export function taktPlan(faellig: AgentKey[]): { schnell: AgentKey[]; ki: AgentKey[] } {
  const ohneChef = faellig.filter((k) => k !== "koordinator")
  const istKi = (k: AgentKey) => AGENTEN.find((a) => a.key === k)?.ki ?? true
  const schnell = ohneChef.filter((k) => !istKi(k) || k === "bulletin")
  const ki = ohneChef
    .filter((k) => istKi(k) && k !== "bulletin")
    .sort((a, b) => Number(LIEST_BULLETIN.includes(a)) - Number(LIEST_BULLETIN.includes(b)))
  return { schnell, ki }
}

/** Startet jeden Agenten, dessen Takt fällig ist (täglich bzw. alle 7 Tage). */
export async function fuehreFaelligeAus(o: { chef?: boolean } = {}): Promise<AgentKey[]> {
  const start = Date.now()
  const passtNoch = () => Date.now() - start + AGENT_ZEITLIMIT_MS < TAKT_BUDGET_MS
  /* Katman 3: Von Emin pausierte Agenten laufen nicht (lib/ergebnis/steuerung.ts). */
  const { pausierteAgenten } = await import("@/lib/ergebnis/steuerung")
  const pausiert = await pausierteAgenten().catch(() => new Set<string>())
  const faellig = faelligeAgenten(await letzteLaeufe()).filter((k) => !pausiert.has(k))
  const gestartet: AgentKey[] = []

  if (o.chef && faellig.includes("koordinator")) {
    await mitZeitlimit("koordinator")
    gestartet.push("koordinator")
  }

  const { schnell, ki } = taktPlan(faellig)
  if (schnell.length && passtNoch()) {
    await Promise.all(schnell.map(mitZeitlimit))
    gestartet.push(...schnell)
  }
  let i = 0
  for (; i < ki.length && passtNoch(); i += GLEICHZEITIG) {
    const block = ki.slice(i, i + GLEICHZEITIG)
    await Promise.all(block.map(mitZeitlimit))
    gestartet.push(...block)
  }
  const liegenGeblieben = faellig.filter((k) => k !== "koordinator" && !gestartet.includes(k)).length
  if (liegenGeblieben > 0) console.info(`[assistent] ${liegenGeblieben} Agenten bleiben für den nächsten Takt fällig`)

  /* Außerhalb der Chef-Runde: Chief of Staff nur, wenn alles durch ist und Zeit bleibt — sonst arbeitet die Warteschlange. */
  if (!o.chef && faellig.includes("koordinator") && liegenGeblieben === 0 && passtNoch()) {
    await mitZeitlimit("koordinator")
    gestartet.push("koordinator")
  } else if (!gestartet.includes("koordinator")) await koordinationAbarbeiten()
  await holeEingang().catch((e) => console.error("[assistent] eingang", e instanceof Error ? e.message : e))
  await ergaenzeFehlendeAdressen().catch((e) => console.error("[assistent] adressen", e instanceof Error ? e.message : e))
  await nachfassen().catch((e) => console.error("[assistent] nachfassen", e instanceof Error ? e.message : e))
  await veroeffentlicheGeplante().catch((e) => console.error("[redaktion] geplant", e instanceof Error ? e.message : e))
  return gestartet
}

/** Interne Warteschlange abarbeiten und – wenn etwas getan wurde – als Arbeitszeit der Geschäftsführung protokollieren. */
export async function koordinationAbarbeiten(): Promise<number> {
  const start = Date.now()
  try {
    const { arbeiteWarteschlangeAb } = await import("@/lib/koordination/koordinator")
    const w = await arbeiteWarteschlangeAb()
    if (w.bearbeitet > 0) {
      await protokolliereLauf({
        agent: "koordination",
        ergebnis: `${w.bearbeitet} interne Aufträge bearbeitet`,
        anzahl: w.bearbeitet,
        dauerMs: Date.now() - start,
      })
    }
    return w.bearbeitet
  } catch (e) {
    console.error("[assistent] koordination", e instanceof Error ? e.message : e)
    return 0
  }
}
