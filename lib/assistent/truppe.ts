import "server-only"

import { generateImage, generateText } from "ai"
import { put } from "@vercel/blob"

import { collectAttention } from "@/lib/attention"
import { MESSEN, messeKey, type Messe } from "@/lib/messen"
import { ladeStatus, ladeVorschlaege } from "@/lib/messen-radar"
import { getVertriebStore } from "@/lib/lead-store"
import { ladeVerkaufslage, MONATSZIEL_EUR as MONATSZIEL } from "@/lib/verkaufen"
import { erstelleEntwurf, ladeEntwuerfe } from "@/lib/verkaufen-entwurf"

import { firmenRahmen, INHABER } from "./rahmen"
import { findeKontaktMail } from "./kontaktsuche"
import { ergaenzeFehlendeAdressen, istMail, nachfassen } from "./versand"
import { holeEingang } from "@/lib/eingang"
import {
  assistentDb,
  ladeFreigaben,
  ladeRaete,
  legeFreigabeAn,
  letzteArtikel,
  letzteLaeufe,
  neueFreigabeId,
  offeneAutomationErinnerungen,
  protokolliereLauf,
  quelleBekannt,
  speichereRat,
  type RatProtokoll,
} from "./store"

export const AGENT_KEYS = ["rat", "lage", "vertrieb", "jaeger", "messen", "kapital", "redaktion", "finanz"] as const
export type AgentKey = (typeof AGENT_KEYS)[number]

export type AgentInfo = {
  key: AgentKey
  name: string
  aufgabe: string
  takt: "taeglich" | "woechentlich"
  ki: boolean
}

export const AGENTEN: AgentInfo[] = [
  { key: "rat", name: "Geschäftsleitung", aufgabe: "CEO, CFO, Vertrieb und Marketing tagen wöchentlich, prüfen gegen dein Budget und beschließen.", takt: "woechentlich", ki: true },
  { key: "jaeger", name: "Kunden-Jäger", aufgabe: "Findet jede Woche echte Firmen für fibero, creaDIG oder stammo und schreibt die Erstmail.", takt: "woechentlich", ki: true },
  { key: "lage", name: "Lage", aufgabe: "Sammelt alles, was im System auf deine Entscheidung wartet.", takt: "taeglich", ki: false },
  { key: "vertrieb", name: "Vertrieb", aufgabe: "Findet stille oder überfällige Abschlüsse und schreibt die nächste Mail.", takt: "taeglich", ki: true },
  { key: "messen", name: "Messen", aufgabe: "Bereitet jede Messe vor, bei der du teilnimmst: Plan, Kontakte, Unterkunft.", takt: "taeglich", ki: false },
  { key: "finanz", name: "Finanz", aufgabe: "Legt Folgerechnungen aus Abos als Entwurf an und schlägt Mahnungen vor. Versendet nie selbst.", takt: "taeglich", ki: false },
  { key: "kapital", name: "Kapital", aufgabe: "Recherchiert Förderungen, Kredite und Investoren mit Quelle und Frist.", takt: "woechentlich", ki: true },
  { key: "redaktion", name: "Redaktion", aufgabe: "Wählt das Thema nach den Beschlüssen der Geschäftsleitung, schreibt den Beitrag und erzeugt das Bild dazu.", takt: "woechentlich", ki: true },
]

const MODELL = "openai/gpt-5.4-mini"
const RECHERCHE = "perplexity/sonar"
const BILDMODELL = "openai/gpt-image-1-mini"

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

/** Echter Stoff aus der eigenen Arbeit – die Redaktion erfindet keine Projekte. */
const STOFF = [
  "fibero: Software für Glasfaser-Montagefirmen (Aufmaß, Fotos, Hausanschlüsse, Abrechnung). Zielgruppe: Montage-, Tiefbau- und Spleißbetriebe.",
  "stammo: digitale Stempelkarte im Apple/Google Wallet für Cafés, Imbisse, Bäckereien. Erkennt Besuchsrhythmus und meldet, wenn Stammgäste wegbleiben.",
  "creaDIG Control Center: ein kleiner Betrieb lässt Anfragen, Termine, Nachfassen und Mailings automatisch laufen; KI-Agenten bereiten vor, der Mensch entscheidet.",
  "creaDIG Web & System für Vereine, Verbände, Moscheegemeinden, Stiftungen: Webseite plus Anmeldung, Mitglieder, Termine aus einer Hand.",
  "Erfahrung als Einzelunternehmer: wie man mit KI-Agenten statt Team arbeitet – was funktioniert, was nicht.",
]

const BILDSTIL =
  "Editorial photograph for a LinkedIn article, realistic, natural daylight, shallow depth of field, calm and confident mood, subtle cool blue accent light (#2F5BEA), clean composition with negative space, real people at work in Germany when people appear, no text, no letters, no logos, no watermarks, no UI screenshots."

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

async function erzeugeBild(id: string, idee: string): Promise<string | null> {
  try {
    const { image } = await generateImage({
      model: BILDMODELL,
      prompt: `${idee}. ${BILDSTIL}`,
      size: "1536x1024",
    })
    const pfad = `assistent/linkedin/${id}.png`
    await put(pfad, Buffer.from(image.uint8Array), {
      access: "private",
      contentType: "image/png",
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    return pfad
  } catch (e) {
    console.error("[redaktion] bild", e)
    return null
  }
}

async function redaktion(): Promise<Ergebnis> {
  const woche = kw(new Date())
  const quelle = `linkedin:${woche}`
  if (await quelleBekannt(quelle)) return { ergebnis: "Artikel dieser Woche liegt schon bereit", anzahl: 0 }

  const [raete, frueher, rahmen] = await Promise.all([ladeRaete(1).catch(() => []), letzteArtikel(10), firmenRahmen()])
  const rat = raete[0]?.protokoll
  const marketing = rat?.stimmen.find((s) => /marketing/i.test(s.rolle))?.sagt
  const beschluesse = rat?.beschluesse.map((b) => b.was) ?? []

  const { text } = await generateText({
    model: MODELL,
    prompt: `Du bist die Redaktion von creaDIG Solutions (Einzelunternehmen, Inhaber Muhammed Emin Akyol). Du schreibst als Muhammed Emin Akyol genau EINEN LinkedIn-Beitrag auf Deutsch.

SCHRITT 1 – Thema wählen (wie ein Chefredakteur):
- Richte dich nach der letzten Sitzung der Geschäftsleitung. Marketing sagte: ${marketing ?? "(noch keine Sitzung)"}
- Beschlüsse: ${beschluesse.length ? beschluesse.join(" | ") : "(keine)"}
- Lage: ${rahmen.text}
- Echter Stoff (nur daraus schöpfen, nichts erfinden): ${STOFF.join(" || ")}
- Schon geschrieben – NICHT wiederholen, anderer Blickwinkel: ${frueher.map((f) => f.titel).join(" | ") || "(noch nichts)"}
- Wähle das Thema, das den Leser (Inhaber kleiner Betriebe, Glasfaser-Branche, Vereine) am meisten bewegt und Kunden anzieht, ohne zu werben.

SCHRITT 2 – Beitrag:
- Fachbeitrag mit Haltung, kein Werbetext. Erster Satz = scharfe Beobachtung aus der Praxis, die zum Weiterlesen zwingt.
- 3 kurze Absätze mit konkretem Wissen, sofort nutzbar. Das eigene Produkt höchstens einmal beiläufig als Beispiel.
- Ende mit einer echten Frage an die Leser. 180–260 Wörter, keine Emojis, max. 3 Hashtags am Ende.

SCHRITT 3 – Bildidee: eine konkrete fotografische Szene (Englisch, ein Satz), die die Kernaussage zeigt – keine Schrift, keine Bildschirme.

Antworte NUR mit JSON:
{"thema":"…","warum":"1 Satz: warum gerade jetzt dieses Thema (Bezug auf Sitzung/Lage)","bezug":"welcher Stoff/Beschluss","titel":"…","text":"…","bildidee":"…","alt":"Bildbeschreibung Deutsch, 1 Satz"}`,
  })

  const a = jsonObjekt<Artikel>(text)
  if (!a?.titel || !a.text) throw new Error("Redaktion lieferte keinen gültigen Beitrag")

  const id = neueFreigabeId()
  const bildPfad = a.bildidee ? await erzeugeBild(id, a.bildidee) : null
  const angelegt = await legeFreigabeAn({
    id,
    art: "linkedin",
    titel: a.titel.replace(/^#+\s*/, "").slice(0, 150),
    inhalt: a.text.trim(),
    quelle,
    agent: "redaktion",
    bildPfad,
    extra: { warum: a.warum, bezug: a.bezug, alt: a.alt },
  })
  return {
    ergebnis: angelegt ? `Beitrag „${a.thema}“ ${bildPfad ? "mit Bild " : ""}bereit` : "Beitrag liegt schon bereit",
    anzahl: angelegt ? 1 : 0,
  }
}

type Ziel = { firma: string; ort: string; website: string; email?: string; warum: string; betreff: string; mail: string }

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
    suche:
      "Glasfaser-Montagefirmen, FTTH-Tiefbau- und Spleißbetriebe (5–80 Mitarbeiter) in Niedersachsen, NRW, Bremen, Hamburg, Hessen, die als Subunternehmer für Netzbetreiber arbeiten",
    angebot: "fibero: Aufmaß, Fotos, Hausanschlüsse und Abrechnung an einem Ort statt Excel und WhatsApp",
  },
  {
    produkt: "creaDIG Web & System",
    suche:
      "Vereine, Verbände, Moscheegemeinden, Stiftungen und mittelständische Betriebe in Niedersachsen/NRW mit sichtbar veralteter Webseite oder ohne Online-Anmeldung/Mitgliederverwaltung",
    angebot: "creaDIG: moderne Webseite plus System (Anmeldung, Mitglieder, Termine) aus einer Hand",
  },
  {
    produkt: "stammo",
    suche:
      "inhabergeführte Cafés, Bäckereien, Imbisse und vegane Restaurants mit 2–6 Filialen in Deutschland, Österreich, Schweiz oder dem Elsass",
    angebot: "stammo: Stempelkarte im Apple/Google Wallet, die Stammgäste zurückholt",
  },
]

async function jaeger(): Promise<Ergebnis> {
  const woche = kw(new Date())
  const lauf = (await zaehleJaegerLaeufe()) + Number(woche.split("-")[1])
  const revier = JAGDREVIER[lauf % JAGDREVIER.length]
  const bekannt = await bekannteJaegerFirmen()
  const { text } = await generateText({
    model: RECHERCHE,
    prompt: `${INHABER}
Finde ${JAEGER_ANZAHL} echte, aktuell existierende Firmen als Neukunden für ${revier.produkt}.
Zielgruppe: ${revier.suche}.
Nur Firmen mit eigener Webseite, die du in der Quelle gesehen hast. Keine Konzerne. Keine Erfindungen.
Gib, wenn auf der Webseite sichtbar, die öffentliche Kontakt-E-Mail an (Impressum/Kontakt), sonst leer lassen – niemals raten.
${bekannt.length ? `Diese Firmen kennen wir schon – NICHT erneut nennen: ${bekannt.slice(0, 80).join(", ")}.` : ""}
Für jede Firma eine kurze Erstmail auf Deutsch (60–110 Wörter, per Sie, Absender Muhammed Emin Akyol): ein konkreter Bezug zur Firma, ein Nutzen aus "${revier.angebot}", eine kleine Frage am Ende (z. B. 15 Minuten Telefonat). Kein Werbeton.
Antworte NUR mit JSON-Array: [{"firma":"","ort":"","website":"https://...","email":"","warum":"1 Satz, warum gerade diese Firma","betreff":"","mail":""}]`,
  })
  const ziele = jsonListe<Ziel>(text)
    .filter((z) => z?.firma && z?.website?.startsWith("http") && z?.mail)
    .slice(0, JAEGER_ANZAHL)
  const adressen = await Promise.all(ziele.map((z) => findeKontaktMail(z.website).catch(() => null)))
  let neu = 0
  for (const [i, z] of ziele.entries()) {
    let host = ""
    try {
      host = new URL(z.website).hostname.replace(/^www\./, "").toLowerCase()
    } catch {}
    const genannt = istMail(z.email) && z.email.trim().toLowerCase().endsWith(`@${host}`) ? z.email.trim().toLowerCase() : null
    const an = adressen[i] ?? genannt
    const id = await legeFreigabeAn({
      art: "mail",
      titel: `Neukunde ${revier.produkt}: ${z.firma} (${z.ort})`,
      empfaenger: an,
      betreff: z.betreff,
      extra: { adressSuche: an ? "gefunden" : "keine" },
      inhalt: `${z.mail}\n\n---\nWarum diese Firma: ${z.warum}\nWebseite: ${z.website}\n${an ? `Adresse von der Webseite: ${an}` : "Keine Adresse auf der Webseite gefunden – bitte im Impressum nachsehen."}`,
      quelle: `jaeger:${z.firma.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      agent: "jaeger",
    })
    if (id) neu++
  }
  return { ergebnis: `${neu} neue Firmen für ${revier.produkt} gefunden`, anzahl: neu }
}

async function rat(): Promise<Ergebnis> {
  const woche = kw(new Date())
  const [rahmen, verkauf, status, offene, laeufe, frueher] = await Promise.all([
    firmenRahmen(),
    ladeVerkaufslage(),
    ladeStatus(),
    ladeFreigaben(),
    letzteLaeufe(),
    ladeRaete(2),
  ])
  if (frueher[0]?.woche === woche) return { ergebnis: "Sitzung dieser Woche hat schon getagt", anzahl: 0 }

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
    prompt: `Ihr seid die Geschäftsleitung von creaDIG Solutions und haltet die Wochensitzung KW ${woche}. Ihr behandelt die Firma als eure eigene und denkt wie Gründer, die aus wenig viel machen.
${INHABER}

Teilnehmer: CEO (Richtung, Fokus, sagt Nein zu Ablenkung), CFO (prüft jede Idee gegen das Budget unten – blockiert alles, was nicht bezahlbar ist), Vertrieb (Abschlüsse, Neukunden), Marketing (LinkedIn-Artikel, Sichtbarkeit, organisch zuerst).

Lagebild (echte Daten, nichts dazuerfinden):
${JSON.stringify(lagebild, null, 1)}

Regeln:
- Nur Beschlüsse, die mit dem Budget machbar sind. Summe kostenEur aller Beschlüsse ≤ ${rahmen.spielraumEur}. Kostenlos ist bevorzugt.
- Was der CFO oder CEO ablehnt (z. B. Messestand, bezahlte Werbung, neues Produkt), kommt mit Grund in "verworfen".
- Emin hat ca. 10 Stunden pro Woche für Vertrieb. Maximal 3 Beschlüsse. Jeder Beschluss konkret und in einer Woche erledigbar.
- "wer": "truppe" = die KI-Agenten bereiten vor; "emin" = nur er kann es tun (Anruf, Termin, Unterschrift).
- Wenn Emin letzte Woche geantwortet hat, berücksichtigt seine Antwort ausdrücklich.
- "frage": genau eine Rückfrage an Emin, deren Antwort die nächste Sitzung besser macht.
- Deutsch, klar, keine Floskeln.

Antworte NUR mit JSON: {"lage":"2 Sätze","stimmen":[{"rolle":"CEO","sagt":""},{"rolle":"CFO","sagt":""},{"rolle":"Vertrieb","sagt":""},{"rolle":"Marketing","sagt":""}],"beschluesse":[{"was":"","warum":"","kostenEur":0,"wer":"emin"}],"verworfen":["Idee – Grund"],"frage":""}`,
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
  p.beschluesse = p.beschluesse.slice(0, 3).map((b) => ({ ...b, kostenEur: Math.max(0, Number(b.kostenEur) || 0), wer: b.wer === "truppe" ? "truppe" : "emin" }))
  p.verworfen = Array.isArray(p.verworfen) ? p.verworfen.slice(0, 4) : []
  if (!(await speichereRat(woche, p))) return { ergebnis: "Sitzung dieser Woche hat schon getagt", anzahl: 0 }

  for (const [i, b] of p.beschluesse.entries()) {
    if (b.wer !== "emin") continue
    await legeFreigabeAn({
      art: "aufgabe",
      titel: `Beschluss: ${b.was}`.slice(0, 160),
      inhalt: `${b.warum}\n\nKosten: ${b.kostenEur ? `${b.kostenEur} €` : "keine"}\nAus der Wochensitzung KW ${woche}.`,
      quelle: `rat:${woche}:${i}`,
      agent: "rat",
    })
  }
  return { ergebnis: `Sitzung KW ${woche.split("-")[1]}: ${p.beschluesse.length} Beschlüsse`, anzahl: p.beschluesse.length }
}

const LAEUFER: Record<AgentKey, () => Promise<Ergebnis>> = { lage, vertrieb, messen, finanz, kapital, redaktion, jaeger, rat }

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
  await holeEingang().catch((e) => console.error("[assistent] eingang", e instanceof Error ? e.message : e))
  await nachfassen().catch((e) => console.error("[assistent] nachfassen", e instanceof Error ? e.message : e))
  return faellig
}
