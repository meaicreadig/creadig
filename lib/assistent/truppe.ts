import "server-only"

import { generateText } from "ai"

import { collectAttention } from "@/lib/attention"
import { MESSEN, messeKey, type Messe } from "@/lib/messen"
import { ladeStatus, ladeVorschlaege } from "@/lib/messen-radar"
import { getVertriebStore } from "@/lib/lead-store"
import { ladeVerkaufslage } from "@/lib/verkaufen"
import { erstelleEntwurf, ladeEntwuerfe } from "@/lib/verkaufen-entwurf"

import { legeFreigabeAn, letzteLaeufe, protokolliereLauf, quelleBekannt } from "./store"

export const AGENT_KEYS = ["lage", "vertrieb", "messen", "kapital", "redaktion"] as const
export type AgentKey = (typeof AGENT_KEYS)[number]

export type AgentInfo = {
  key: AgentKey
  name: string
  aufgabe: string
  takt: "taeglich" | "woechentlich"
  ki: boolean
}

export const AGENTEN: AgentInfo[] = [
  { key: "lage", name: "Lage", aufgabe: "Sammelt alles, was im System auf deine Entscheidung wartet.", takt: "taeglich", ki: false },
  { key: "vertrieb", name: "Vertrieb", aufgabe: "Findet stille oder überfällige Abschlüsse und schreibt die nächste Mail.", takt: "taeglich", ki: true },
  { key: "messen", name: "Messen", aufgabe: "Bereitet jede Messe vor, bei der du teilnimmst: Plan, Kontakte, Unterkunft.", takt: "taeglich", ki: false },
  { key: "kapital", name: "Kapital", aufgabe: "Recherchiert Förderungen, Kredite und Investoren mit Quelle und Frist.", takt: "woechentlich", ki: true },
  { key: "redaktion", name: "Redaktion", aufgabe: "Schreibt einen LinkedIn-Artikel aus echter Arbeit – Wissen statt Werbung.", takt: "woechentlich", ki: true },
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

async function vertrieb(): Promise<Ergebnis> {
  const { deals } = await ladeVerkaufslage()
  const woche = kw(new Date())
  const kandidaten = deals.filter((d) => d.warnungen.length > 0).slice(0, 4)
  let neu = 0
  for (const deal of kandidaten) {
    if (neu >= 2) break
    const quelle = `deal:${deal.id}:${woche}`
    if (await quelleBekannt(quelle)) continue
    await erstelleEntwurf(deal)
    const e = (await ladeEntwuerfe())[deal.id]
    if (!e) continue
    const id = await legeFreigabeAn({
      art: "mail",
      titel: `Nachfassen: ${deal.firma ?? deal.titel}`,
      betreff: e.betreff,
      inhalt: e.text,
      quelle,
      agent: "vertrieb",
    })
    if (id) neu++
  }
  return {
    ergebnis: kandidaten.length ? `${neu} Mailentwürfe für ${kandidaten.length} gefährdete Abschlüsse` : "Alle Abschlüsse im Takt",
    anzahl: neu,
  }
}

function naechsterBeginn(m: Messe, heute: Date): Date {
  if (m.termin) return new Date(m.termin.von)
  const j = heute.getFullYear()
  const d = new Date(j, m.monat - 1, 1)
  return d < heute ? new Date(j + 1, m.monat - 1, 1) : d
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
creaDIG Solutions, Einzelunternehmen in Niedersachsen (Deutschland), Inhaber Muhammed Emin Akyol. Produkte: fibero (SaaS für Glasfaser-Montagefirmen), stammo (digitale Wallet-Treuekarte für Gastronomie/Einzelhandel), Web- und Systementwicklung für Betriebe. Ziel: Wachstum, Vertrieb, Internationalisierung (DACH, Türkei, Golfstaaten).
Nur Programme, die JETZT Anträge annehmen und für ein Einzelunternehmen zulässig sind. Bevorzugt: NBank, KfW, BAFA, EU (EIC, Horizon), Bund-Digitalprogramme, Accelerator in DACH/Türkei/Golf.
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

const THEMEN = [
  "Was Glasfaser-Montagefirmen an Papierkram verlieren – und wie man Aufmaß, Fotos und Abrechnung an einem Ort zusammenführt (aus der Arbeit an fibero).",
  "Warum Stempelkarten aus Papier Stammgäste kosten – und was eine Karte im Apple/Google Wallet über Besuchsrhythmus verrät (aus der Arbeit an stammo).",
  "Vom Werkzeug zum Motor: wie ein kleiner Betrieb Anfragen, Termine und Nachfassen automatisch laufen lässt (aus dem creaDIG Control Center).",
  "Digitalisierung im Verein und Verband: was Mitgliederverwaltung wirklich braucht und was nur teuer ist.",
]

async function redaktion(): Promise<Ergebnis> {
  const woche = kw(new Date())
  const quelle = `linkedin:${woche}`
  if (await quelleBekannt(quelle)) return { ergebnis: "Artikel dieser Woche liegt schon bereit", anzahl: 0 }
  const nr = Number(woche.split("-")[1]) % THEMEN.length
  const { text } = await generateText({
    model: MODELL,
    prompt: `Du schreibst als Muhammed Emin Akyol, Gründer von creaDIG Solutions, einen LinkedIn-Artikel auf Deutsch.
Thema: ${THEMEN[nr]}
Regeln: Fachartikel, kein Werbetext. Starker erster Satz (Beobachtung aus der Praxis). 3 kurze Abschnitte mit konkretem Wissen, das der Leser sofort nutzen kann. Das eigene Produkt höchstens einmal beiläufig als Beispiel nennen. Ende mit einer offenen Frage an die Leser. 180–260 Wörter, keine Emojis, keine Hashtag-Wolke (max. 3 Hashtags am Ende).
Erste Zeile = Titel, dann Leerzeile, dann Text.`,
  })
  const [titel, ...rest] = text.trim().split("\n")
  const id = await legeFreigabeAn({
    art: "linkedin",
    titel: titel.replace(/^#+\s*/, "").slice(0, 150),
    inhalt: rest.join("\n").trim(),
    quelle,
    agent: "redaktion",
  })
  return { ergebnis: id ? "Neuer Artikelentwurf bereit" : "Artikel liegt schon bereit", anzahl: id ? 1 : 0 }
}

const LAEUFER: Record<AgentKey, () => Promise<Ergebnis>> = { lage, vertrieb, messen, kapital, redaktion }

export async function fuehreAgentAus(key: AgentKey): Promise<void> {
  try {
    const r = await LAEUFER[key]()
    await protokolliereLauf({ agent: key, ...r })
  } catch (e) {
    console.error("[assistent] agent", key, e instanceof Error ? e.message : e)
    await protokolliereLauf({ agent: key, ergebnis: "Lauf fehlgeschlagen", anzahl: 0, fehler: e instanceof Error ? e.message : "Fehler" })
  }
}

/** Startet jeden Agenten, dessen Takt fällig ist (täglich bzw. alle 7 Tage). */
export async function fuehreFaelligeAus(): Promise<AgentKey[]> {
  const laeufe = await letzteLaeufe()
  const jetzt = new Date()
  const faellig = AGENTEN.filter((a) => {
    const l = laeufe[a.key]
    if (!l) return true
    const zuletzt = new Date(l.zeit)
    return a.takt === "taeglich" ? berlinTag(zuletzt) !== berlinTag(jetzt) : jetzt.getTime() - zuletzt.getTime() > 6.5 * 86400000
  }).map((a) => a.key)
  for (const key of faellig) await fuehreAgentAus(key)
  return faellig
}
