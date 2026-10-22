/**
 * Reine Regeln der neuen Abteilungen (Qualität, Wissen, Sicherheit, Forschung).
 *
 * Bewusst OHNE "server-only" und ohne Datenbank: Die Prüfskripte
 * (scripts/check-netz-agenten.mjs) laden genau diese Datei — dieselben
 * Schwellen, dieselben Muster wie im Betrieb, kein Nachbau.
 */

/* ------------------------------------------------------------------------ */
/* Qualität (Denetçi)                                                        */
/* ------------------------------------------------------------------------ */

export const QUALITAET_SCHWELLEN = {
  /** Ab so vielen entschiedenen Entwürfen ist die Freigabequote aussagekräftig. */
  minEntschieden: 4,
  /** Darunter arbeitet ein Agent am Inhaber vorbei. */
  minQuote: 0.4,
  /** Mehr als 30 % gescheiterte Läufe = instabil. */
  maxFehlerquote: 0.3,
} as const

export type AgentZahlen = {
  agent: string
  entwuerfe: number
  freigegeben: number
  verworfen: number
  offen: number
  bearbeitet: number
  laeufe: number
  fehler: number
  /** Agent steht im Takt, ist im Zeitraum aber nie gelaufen. */
  erwartetOhneLauf?: boolean
}

export type Bewertung = { auffaellig: boolean; quote: number | null; fehlerquote: number | null; gruende: string[] }

export function bewerte(z: AgentZahlen): Bewertung {
  const entschieden = z.freigegeben + z.verworfen
  const quote = entschieden > 0 ? z.freigegeben / entschieden : null
  const fehlerquote = z.laeufe > 0 ? z.fehler / z.laeufe : null
  const gruende: string[] = []
  if (entschieden >= QUALITAET_SCHWELLEN.minEntschieden && quote !== null && quote < QUALITAET_SCHWELLEN.minQuote) {
    gruende.push(`Freigabequote ${Math.round(quote * 100)} % (${z.freigegeben} von ${entschieden} Entwürfen freigegeben)`)
  }
  if (fehlerquote !== null && fehlerquote > QUALITAET_SCHWELLEN.maxFehlerquote) {
    gruende.push(`Fehlerquote ${Math.round(fehlerquote * 100)} % (${z.fehler} von ${z.laeufe} Läufen gescheitert)`)
  }
  if (z.erwartetOhneLauf) gruende.push("Im Takt, aber im Zeitraum kein einziger Lauf")
  return { auffaellig: gruende.length > 0, quote, fehlerquote, gruende }
}

/* ------------------------------------------------------------------------ */
/* Wissen (Bilgi Bekçisi) — was creaDIG nie über sich behaupten darf          */
/* ------------------------------------------------------------------------ */

export type Behauptung = { muster: RegExp; grund: string }

/**
 * Jede Zeile ist eine früher tatsächlich aufgetauchte oder naheliegende
 * Falschaussage. Quelle der Wahrheit: Owner-Entscheidungen (keine
 * Zertifizierungen, Einzelunternehmen, Telekom & Co. nie als Kunden).
 */
export const VERBOTENE_BEHAUPTUNGEN: Behauptung[] = [
  { muster: /\bBAFA[- ]?(zertifiziert|gelistet|autorisiert|anerkannt|berater)/i, grund: "BAFA-Zertifizierung/-Listung existiert nicht" },
  { muster: /\b(iuk|AVPQ|AGD)[- ]?(zertifiziert|mitglied|gepr[uü]ft|qualifiziert)/i, grund: "Zertifizierung/Mitgliedschaft (iuk/AVPQ/AGD) existiert nicht" },
  { muster: /\b(zertifiziert|mitglied)\b[^.\n]{0,40}\b(BAFA|iuk|AVPQ|AGD)\b/i, grund: "Zertifizierung/Mitgliedschaft (BAFA/iuk/AVPQ/AGD) existiert nicht" },
  { muster: /go[- ]?digital[^.\n]{0,40}(autorisiert|zugelassen|berater|f[oö]rderf[aä]hig über uns)/i, grund: "Keine go-digital-Autorisierung" },
  { muster: /\b(gegr[uü]ndet|seit)\s+(im\s+jahr\s+)?2018\b|\b2018\s+gegr[uü]ndet\b/i, grund: "Falsches Jahr: Marke seit 2017, Einzelunternehmen seit 01.10.2025" },
  {
    muster: /\b(Telekom|Glasfaser\s*NordWest|1\s*&\s*1|Drillisch)\b[^.\n]{0,60}\b(Kunde|Kunden|Referenz|Partner|f[uü]r die wir|Auftraggeber)/i,
    grund: "Telekom/Glasfaser NordWest/1&1/Drillisch dürfen nie als Kunde oder Partner genannt werden",
  },
  {
    muster: /\b(Kunde|Kunden|Referenz|Partner|Auftraggeber)\b[^.\n]{0,60}\b(Telekom|Glasfaser\s*NordWest|1\s*&\s*1|Drillisch)\b/i,
    grund: "Telekom/Glasfaser NordWest/1&1/Drillisch dürfen nie als Kunde oder Partner genannt werden",
  },
  { muster: /\b\d{1,3}\s?%\s+(mehr|h[oö]here[rn]?|weniger|schneller|g[uü]nstiger)\s+\w+/i, grund: "Prozent-Wirkungsversprechen ohne belegte Quelle" },
  { muster: /\b(Team|Mannschaft)\s+(von|aus)\s+(\d{2,}|zwanzig|drei[sß]ig|vielen|über)\b/i, grund: "Größenbehauptung zum Team – creaDIG ist ein Einzelunternehmen" },
  { muster: /\b(\d{2,})\s+(Mitarbeiter(innen)?|Angestellte|Experten)\b/i, grund: "Mitarbeiterzahl – creaDIG ist ein Einzelunternehmen" },
]

/** Öffentliche Preise (docs/website-2/pricing-inventory.md, lib/site-data.ts, stammo.app) in Euro. */
export const BEKANNTE_PREISE_EUR = [2400, 3900, 1500, 2000, 4000, 149, 39, 69] as const

const PREIS = /(\d{1,3}(?:[.\u00a0\u202f]\d{3})*|\d+)(?:,\d{2})?\s?(?:€|EUR|Euro)(?![A-Za-z])|(?:€|EUR)\s?(\d{1,3}(?:[.\u00a0\u202f]\d{3})*|\d+)/gi

/** Preise, die ein Entwurf nennt, aber nirgends öffentlich stehen. */
export function fremdePreise(text: string): number[] {
  const funde: number[] = []
  for (const m of text.matchAll(PREIS)) {
    const roh = (m[1] ?? m[2] ?? "").replace(/[.\u00a0\u202f]/g, "")
    const n = Number(roh)
    if (!Number.isFinite(n) || n <= 0) continue
    if (!(BEKANNTE_PREISE_EUR as readonly number[]).includes(n)) funde.push(n)
  }
  return [...new Set(funde)]
}

/** Alle Gründe, aus denen ein Text so nicht nach außen darf (leer = sauber). */
export function pruefeText(text: string): string[] {
  const gruende = new Set<string>()
  for (const b of VERBOTENE_BEHAUPTUNGEN) if (b.muster.test(text)) gruende.add(b.grund)
  const preise = fremdePreise(text)
  if (preise.length) gruende.add(`Preis nicht im Preis-Inventar: ${preise.map((p) => `${p.toLocaleString("de-DE")} €`).join(", ")}`)
  return [...gruende]
}

/* ------------------------------------------------------------------------ */
/* Sicherheit — Eingangsmails, die das Modell steuern wollen                  */
/* ------------------------------------------------------------------------ */

const INJEKTION: { muster: RegExp; grund: string }[] = [
  { muster: /\b(ignore|disregard|forget)\s+(all\s+|any\s+|the\s+)?(previous|prior|above|earlier)?\s*(instructions|prompts?|rules)\b/i, grund: "Versuch, Anweisungen auszuhebeln" },
  { muster: /\b(ignoriere|vergiss)\s+(alle\s+)?(vorherigen|bisherigen|obigen)?\s*(anweisungen|regeln|instruktionen)\b/i, grund: "Versuch, Anweisungen auszuhebeln" },
  { muster: /\bsystem\s?prompt\b/i, grund: "Fragt nach dem Systemprompt" },
  { muster: /\b(du bist (jetzt|ab sofort)|you are now|act as|pretend to be)\b/i, grund: "Versuch, die Rolle des Modells umzudefinieren" },
  { muster: /<\s*script\b|javascript:/i, grund: "Skript-Code in der Mail" },
  { muster: /\b(send|schick|sende|forward|leite)\b[^.\n]{0,40}\b(api[- ]?key|passwor[dt]|token|zugangsdaten|credentials|secret)/i, grund: "Will Zugangsdaten herausgeben lassen" },
  { muster: /!\[[^\]]*\]\(https?:\/\/[^)]*\?[^)]*=/i, grund: "Bild-Link mit Parametern (Datenabfluss)" },
]

/** Grund, warum eine Mail verdächtig ist – oder null. */
export function istVerdaechtig(text: string): string | null {
  for (const i of INJEKTION) if (i.muster.test(text)) return i.grund
  return null
}

/* ------------------------------------------------------------------------ */
/* Forschung (Forschungszulage)                                               */
/* ------------------------------------------------------------------------ */

export const FORSCHUNG_PROJEKTE = ["fibero", "stammo", "meai", "creadig-os", "sonstiges"] as const
export type ForschungProjekt = (typeof FORSCHUNG_PROJEKTE)[number]

/**
 * SCHÄTZUNG, keine Steuerberatung: Eigenleistung des Einzelunternehmers
 * 100 €/h (FZulG ab 2026), +20 % Gemeinkostenpauschale, 35 % KMU-Satz.
 * Verbindlich ist nur, was BSFZ-Bescheinigung und Finanzamt festsetzen.
 */
export const FORSCHUNG_SATZ = { eurJeStunde: 100, gemeinkosten: 0.2, foerdersatz: 0.35 } as const

export function forschungszulageSchaetzung(stunden: number): number {
  const basis = stunden * FORSCHUNG_SATZ.eurJeStunde * (1 + FORSCHUNG_SATZ.gemeinkosten)
  return Math.round(basis * FORSCHUNG_SATZ.foerdersatz)
}

/* ------------------------------------------------------------------------ */
/* Gemeinsam                                                                  */
/* ------------------------------------------------------------------------ */

export function isoWoche(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const jahr = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return `${t.getUTCFullYear()}-${Math.ceil(((t.getTime() - jahr.getTime()) / 86400000 + 1) / 7)}`
}
