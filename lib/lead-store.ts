import nodeFs from "node:fs"
import nodeOs from "node:os"
import nodePath from "node:path"
import { raiseAlert } from "@/lib/alert"
import { createNeonStore } from "@/lib/lead-store-neon"
import { createNeonVertrieb } from "@/lib/vertrieb-store-neon"
import type { VertriebStore } from "@/lib/vertrieb"
import type { Locale } from "@/lib/dictionary"

/**
 * MP-G · Der Lead-Speicher — Modell, Schnittstelle, Ausfallverhalten.
 *
 * ---------------------------------------------------------------------------
 * WAS SICH ÄNDERT UND WAS NICHT
 * Bis MP-G war das Postfach die einzige Ablage: `/api/lead` erzeugte `id` und
 * `reference`, verschickte eine Mail und warf beides weg. Das war keine
 * Nachlässigkeit, sondern eine veröffentlichte Zusage („Eine Datenbank führen
 * wir nicht"). Der Owner hat sie aufgehoben; der Satz in der
 * Datenschutzerklärung kommt mit dem Speicher (`docs/ops/lead-store.md`).
 *
 * **Die Mail bleibt.** Sie ist der Weg, auf dem eine Anfrage ankommt, und sie
 * braucht keine Infrastruktur. Der Speicher tritt DANEBEN.
 *
 * ---------------------------------------------------------------------------
 * DIE REGEL ÜBER ALLEM
 *
 *     Ein Speicherfehler darf niemals eine Anfrage kosten.
 *
 * Jede Funktion hier schluckt ihre eigenen Fehler und meldet sie intern. Die
 * Route kann durch diesen Speicher nicht scheitern.
 *
 * ---------------------------------------------------------------------------
 * WARUM EINE SCHNITTSTELLE
 * Welcher Speicher es wird, ist eine Owner-Entscheidung mit Vertrag und
 * Kosten. Was NICHT davon abhängt — Modell, Aufrufort, Abfrageform,
 * Ausfallverhalten, Doppel-Erkennung — steht hier und ist geprüft. Der
 * Anbieter ist danach ein Adapter mit sechs Methoden.
 *
 * Ohne `LEAD_STORE` verhält sich die Route **exakt wie vor MP-G**.
 */

/**
 * Die Sales-Zustände aus `docs/ops/crm-schema.md`. **Nur Sales** — nie für
 * Delivery (Onboarding, Build, Go-Live) oder Kunden-Lebenszyklus (Active,
 * Managed, Paused). Drei getrennte Maschinen, drei getrennte Felder.
 */
export const SALES_STATES = [
  "new",
  "contacted",
  "qualified",
  "discovery",
  "audit",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const

export type SalesStatus = (typeof SALES_STATES)[number]

export const SALES_LABELS_DE: Record<SalesStatus, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  qualified: "Qualifiziert",
  discovery: "Discovery",
  audit: "Audit",
  proposal: "Angebot",
  negotiation: "Verhandlung",
  won: "Gewonnen",
  lost: "Verloren",
}

/** `won` und `lost` sind Endzustände — Rückkehr nur bewusst durch den Owner. */
export const TERMINAL_STATES: readonly SalesStatus[] = ["won", "lost"]

/**
 * Das Lead-Objekt aus `docs/ops/crm-schema.md`. Kein zweites Modell.
 *
 * BEWUSST NICHT enthalten:
 *   `owner`           Es gibt einen Nutzer. Ein Zuweisungsfeld ohne zweite
 *                     Person ist eine Auswahlliste mit einem Eintrag (§19).
 *   `potentialValue`  Eine Zahl, die niemand bestätigt hat, ist eine
 *                     Schätzung, die später wie eine Pipeline aussieht (§20).
 *   `score`           Der Betriebscheck-Score gehört dem Besucher, nicht dem
 *                     Vertrieb. Aus ihm eine Qualifikation abzuleiten, wäre
 *                     eine neue Regel — die es nicht gibt (§15).
 * Beide Felder kommen, wenn es sie operativ braucht. Vorher nicht.
 */
export type LeadRecord = {
  /** Intern, immutable. NICHT die CD-Nummer. */
  id: string
  /** Menschlich: `CD-YYMMDD-XXXX`. Kein Primärschlüssel. */
  reference: string
  /**
   * HMAC des Absende-Tokens — der Schlüssel gegen Doppeleinträge. Nie das
   * Token selbst: Der Speicher soll kein wiederverwendbares Geheimnis halten.
   */
  submissionKey: string | null
  source: string
  locale: Locale
  name: string
  email: string
  phone: string
  business: string | null
  message: string | null
  siteUrl: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmTerm: string | null
  utmContent: string | null
  salesStatus: SalesStatus
  /** Frei formuliert. Kein Aufgabenverwaltungssystem (§18). */
  nextAction: string | null
  /** ISO-Datum. */
  nextActionAt: string | null
  /** Nur bei `lost`. Freitext, keine erfundene Gründeliste (§21). */
  lostReason: string | null
  createdAt: string
  updatedAt: string
}

export type LeadListQuery = {
  search?: string
  status?: SalesStatus
  source?: string
  locale?: Locale
  limit?: number
  offset?: number
}

export type LeadPage = {
  rows: LeadRecord[]
  /** Gesamtzahl vor `limit`/`offset` — für Seitenzahlen und Zähler. */
  total: number
}

/**
 * Sechs Methoden. Ein Anbieter-Adapter implementiert genau diese; ausserhalb
 * dieses Moduls greift nichts auf den Speicher zu.
 */
export type LeadStore = {
  readonly name: string
  save(record: LeadRecord): Promise<void>
  findBySubmissionKey(key: string): Promise<LeadRecord | null>
  getById(id: string): Promise<LeadRecord | null>
  list(query: LeadListQuery): Promise<LeadPage>
  updateSalesStatus(
    id: string,
    status: SalesStatus,
    lostReason: string | null,
  ): Promise<boolean>
  updateNextAction(id: string, action: string | null, at: string | null): Promise<boolean>
}

/* ==========================================================================
 * ADAPTER · Arbeitsspeicher (nur Entwicklung und Abnahme)
 *
 * In einer Serverless-Umgebung überlebt er keinen Kaltstart und gilt je
 * Instanz — als produktive Ablage wäre er lautloser Datenverlust, und lautlos
 * ist schlimmer als gar nichts: Man glaubt, man hätte die Daten.
 *
 * Er existiert, damit Schreibweg, Abfragen und Mutationen **prüfbar** sind,
 * bevor ein Anbieter feststeht. Ein Lesepfad, der beim ersten echten Lead zum
 * ersten Mal läuft, ist die schlechtere Alternative.
 * ========================================================================== */

const rows: LeadRecord[] = []

function matches(row: LeadRecord, query: LeadListQuery): boolean {
  if (query.status && row.salesStatus !== query.status) return false
  if (query.source && row.source !== query.source) return false
  if (query.locale && row.locale !== query.locale) return false
  if (query.search) {
    const needle = query.search.trim().toLowerCase()
    const hay = [row.reference, row.business, row.name, row.email]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    if (!hay.includes(needle)) return false
  }
  return true
}

/*
 * Gelesen wird immer eine KOPIE.
 *
 * Aufgefallen beim Testen: Der Adapter gab die gespeicherte Zeile selbst
 * zurueck. Zwei Aufrufe von `getById` lieferten dasselbe Objekt, und eine
 * spaetere Aenderung war ruecklaufend auch im zuerst gelesenen Wert sichtbar.
 * Ein echter Datenbank-Adapter kann das gar nicht; wer gegen diesen hier
 * entwickelt, wuerde sich an ein Verhalten gewoehnen, das spaeter fehlt —
 * und schlimmer: Aufrufer koennten den Speicher versehentlich aendern, ohne
 * zu speichern.
 */
const copy = (row: LeadRecord): LeadRecord => ({ ...row })

const memoryStore: LeadStore = {
  name: "memory",
  async save(record) {
    const index = rows.findIndex((row) => row.id === record.id)
    if (index >= 0) rows[index] = copy(record)
    else rows.push(copy(record))
  },
  async findBySubmissionKey(key) {
    const row = rows.find((entry) => entry.submissionKey === key)
    return row ? copy(row) : null
  },
  async getById(id) {
    const row = rows.find((entry) => entry.id === id)
    return row ? copy(row) : null
  },
  async list(query) {
    /* Neueste zuerst — die Standardsortierung aus §7. */
    const found = rows
      .filter((row) => matches(row, query))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const offset = query.offset ?? 0
    const limit = query.limit ?? 50
    return { rows: found.slice(offset, offset + limit).map(copy), total: found.length }
  },
  async updateSalesStatus(id, status, lostReason) {
    const row = rows.find((entry) => entry.id === id)
    if (!row) return false
    row.salesStatus = status
    row.lostReason = status === "lost" ? lostReason : null
    row.updatedAt = new Date().toISOString()
    return true
  },
  async updateNextAction(id, action, at) {
    const row = rows.find((entry) => entry.id === id)
    if (!row) return false
    row.nextAction = action
    row.nextActionAt = at
    row.updatedAt = new Date().toISOString()
    return true
  },
}

/* ==========================================================================
 * AUSWAHL
 * ========================================================================== */

let warned = false

function warnOnce(kind: string, message: string): void {
  if (warned) return
  warned = true
  void raiseAlert(kind, message)
}

/* ==========================================================================
 * ADAPTER · Datei (nur Entwicklung und Abnahme)
 *
 * WARUM ES DIESEN ZWEITEN ENTWICKLUNGS-ADAPTER GIBT
 * Der Arbeitsspeicher-Adapter oben ist fuer eine Abnahme der Oberflaeche
 * unbrauchbar — und zwar aus einem Grund, der nicht offensichtlich ist:
 *
 *   Next kompiliert Route Handler und Server Components in ZWEI getrennte
 *   Modulgraphen (Bedingung `react-server`). Ein Modul-Singleton wie
 *   `const rows: LeadRecord[] = []` existiert damit ZWEIMAL im selben
 *   Prozess. Der Schreibweg (/api/lead) fuellt die eine Liste, der Lesepfad
 *   (/admin/leads) liest die andere — und sieht immer null Eintraege.
 *
 * Nachgemessen am 30.08.2026: `[lead] created CD-260830-268` im Log,
 * gleichzeitig „es liegt noch keine Anfrage vor" auf der Seite.
 *
 * Eine Datei ist von beiden Schichten dieselbe. Damit werden Liste, Suche,
 * Filter, Detail und die beiden Mutationen pruefbar, BEVOR ein Anbieter
 * feststeht — und der Lesepfad laeuft nicht zum ersten Mal, wenn der erste
 * echte Lead eintrifft.
 *
 * Fuer den Betrieb ist er genauso verboten wie der Arbeitsspeicher: kein
 * Sperrverfahren, kein gleichzeitiger Zugriff, kein Netzlaufwerk.
 * ========================================================================== */

const FILE_DEFAULT = "creadig-leads.dev.json"

function filePath(): string {
  const configured = process.env.LEAD_STORE_FILE?.trim()
  if (configured) return configured
  return nodePath.join(nodeOs.tmpdir(), FILE_DEFAULT)
}

function readAll(): LeadRecord[] {
  try {
    const raw = nodeFs.readFileSync(filePath(), "utf8")
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as LeadRecord[]) : []
  } catch {
    // Datei fehlt oder ist unlesbar — beides heisst hier: noch nichts da.
    return []
  }
}

function writeAll(all: LeadRecord[]): void {
  nodeFs.writeFileSync(filePath(), JSON.stringify(all, null, 2), "utf8")
}

const fileStore: LeadStore = {
  name: "file",

  async save(record: LeadRecord): Promise<void> {
    const all = readAll()
    const index = all.findIndex((row) => row.id === record.id)
    if (index === -1) all.push({ ...record })
    else all[index] = { ...record }
    writeAll(all)
  },

  async findBySubmissionKey(key: string): Promise<LeadRecord | null> {
    if (!key) return null
    return readAll().find((row) => row.submissionKey === key) ?? null
  },

  async getById(id: string): Promise<LeadRecord | null> {
    return readAll().find((row) => row.id === id) ?? null
  },

  async list(query: LeadListQuery): Promise<LeadPage> {
    const hits = readAll()
      .filter((row) => matches(row, query))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const offset = query.offset ?? 0
    const limit = query.limit ?? hits.length
    return { rows: hits.slice(offset, offset + limit), total: hits.length }
  },

  async updateSalesStatus(
    id: string,
    status: SalesStatus,
    lostReason: string | null,
  ): Promise<boolean> {
    const all = readAll()
    const row = all.find((entry) => entry.id === id)
    if (!row) return false
    row.salesStatus = status
    row.lostReason = status === "lost" ? lostReason : null
    row.updatedAt = new Date().toISOString()
    writeAll(all)
    return true
  },

  async updateNextAction(id: string, action: string | null, at: string | null): Promise<boolean> {
    const all = readAll()
    const row = all.find((entry) => entry.id === id)
    if (!row) return false
    row.nextAction = action
    row.nextActionAt = action === null ? null : at
    row.updatedAt = new Date().toISOString()
    writeAll(all)
    return true
  },
}

/**
 * `null` heisst: kein Speicher konfiguriert — die Route verhält sich wie vor
 * MP-G. Das ist ein gültiger Zustand, kein Fehler.
 */
/**
 * Der Produktions-Adapter wird EINMAL gebaut, nicht je Anfrage.
 *
 * `neon()` haelt eine Konfiguration, keine offene Verbindung — trotzdem
 * waere ein Neuaufbau pro Aufruf verschwendete Arbeit in einem Pfad, der
 * bei jedem Seitenaufruf des Control Centers laeuft.
 */
let neonStore: LeadStore | null = null

export function getLeadStore(): LeadStore | null {
  const kind = process.env.LEAD_STORE?.trim()
  if (!kind) return null

  if (kind === "neon") {
    const url = process.env.DATABASE_URL?.trim()
    if (!url) {
      /*
       * GATE 4 — LAUT SCHEITERN, NICHT LEISE ZURUECKFALLEN.
       *
       * `LEAD_STORE=neon` ohne `DATABASE_URL` ist eine Fehlkonfiguration,
       * kein gueltiger Zustand. Der Adapter gibt `null` zurueck; die Route
       * verhaelt sich dann wie vor MP-G (Mail, kein Speicher) und der Alarm
       * geht raus.
       *
       * Was hier NICHT passiert: ein Rueckfall auf Arbeitsspeicher oder
       * Datei. Ein Produktivsystem, das lautlos in einen Adapter faellt, der
       * beim naechsten Kaltstart alles vergisst, verliert Anfragen und sagt
       * es niemandem.
       */
      warnOnce(
        "lead-store-neon-without-url",
        "LEAD_STORE=neon, aber DATABASE_URL fehlt — der Speicher gilt als nicht erreichbar.",
      )
      /*
       * NICHT `null`: Der Speicher IST eingerichtet, er hat nur keine
       * Adresse. Ein Adapter, der bei jedem Zugriff wirft, sagt genau das —
       * die Liste meldet "nicht erreichbar", der Schreibweg alarmiert.
       */
      if (!neonStore) neonStore = createNeonStore("")
      return neonStore
    }
    if (!neonStore) neonStore = createNeonStore(url)
    return neonStore
  }

  if (kind === "memory" || kind === "file") {
    if (process.env.NODE_ENV === "production") {
      warnOnce(
        `lead-store-${kind}-in-production`,
        `LEAD_STORE=${kind} im Betrieb — dieser Adapter ist nur fuer Entwicklung. Es wird NICHTS gespeichert.`,
      )
      return null
    }
    return kind === "file" ? fileStore : memoryStore
  }

  warnOnce(
    "lead-store-unknown",
    `LEAD_STORE="${kind}" ist kein bekannter Adapter — es wird nichts gespeichert.`,
  )
  return null
}

/**
 * Der Vertriebs-Speicher — dieselbe Datenbank, zweite Facette.
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS NUR MIT NEON GEHT
 * `LeadStore` beschreibt den Weg einer Website-Anfrage; den erfuellen auch
 * die Entwicklungs-Adapter, und das bleibt so — die Abnahme des Formularwegs
 * braucht keine Datenbank.
 *
 * Vertrieb braucht Verknuepfungen und Zaehlungen ueber vier Tabellen. Das in
 * einer JSON-Datei nachzubauen hiesse, einen halben Datenbankkern zu
 * schreiben, den niemand testet — und dessen Verhalten dann NICHT dem
 * entspricht, was in Produktion laeuft. Genau diese Art Attrappe hat hier
 * schon einen Fehler versteckt (`42P08`, `lead-store-neon.ts`).
 *
 * Fehlt die Datenbank, gibt diese Funktion `null` zurueck und die
 * Oberflaeche sagt das. Sie erfindet nichts.
 */
export function getVertriebStore(): VertriebStore | null {
  if (process.env.LEAD_STORE?.trim() !== "neon") return null
  const url = process.env.DATABASE_URL?.trim()
  if (!url) return null
  if (!vertriebStore) {
    /*
     * `neon()` prueft die Zeichenkette sofort und wirft bei einer kaputten.
     * Ungefangen kommt das nicht als Fehlerseite an, sondern bleibt im
     * Ladezustand haengen — nachgemessen am 02.09.2026 mit einer
     * absichtlich unvollstaendigen Verbindung: Die Seite zeigte dauerhaft
     * "Wird geladen", und der Fehler stand nur im Serverprotokoll.
     *
     * Anders als beim LeadStore ist `null` hier die richtige Antwort. Dort
     * muss "nicht eingerichtet" von "nicht erreichbar" unterschieden werden,
     * weil der Schreibweg beides verschieden behandelt. Fuer eine
     * Leseansicht laufen beide auf dieselbe Aussage hinaus — und die steht
     * in `VertriebShell`: eingerichtet ODER erreichbar ist sie gerade nicht.
     */
    try {
      vertriebStore = createNeonVertrieb(url)
    } catch (error) {
      warnOnce(
        "vertrieb-store-unreachable",
        `Vertriebs-Speicher nicht erreichbar: ${error instanceof Error ? error.message : "unbekannt"}`,
      )
      return null
    }
  }
  return vertriebStore
}

let vertriebStore: VertriebStore | null = null

export function leadStoreConfigured(): boolean {
  return getLeadStore() !== null
}

/* ==========================================================================
 * SCHREIBEN
 * ========================================================================== */

/**
 * Die Identität eines Absendevorgangs.
 *
 * Schickt jemand dasselbe Formular ein zweites Mal — typischerweise, weil die
 * Zustellung fehlschlug und er die Fehlermeldung gesehen hat —, dann traegt
 * der zweite Versuch denselben Fingerabdruck. Dann bekommt er auch dieselbe
 * Vorgangsnummer, statt einer zweiten fuer denselben Vorgang.
 *
 * Ohne Speicher gibt es nichts nachzuschlagen: `null`, und die Route erzeugt
 * wie bisher eine neue Identität.
 */
export async function findExistingSubmission(
  submissionKey: string | null,
): Promise<LeadRecord | null> {
  if (!submissionKey) return null
  const store = getLeadStore()
  if (!store) return null
  try {
    return await store.findBySubmissionKey(submissionKey)
  } catch (error) {
    await raiseAlert(
      "lead-store-lookup-failed",
      `Nachschlagen eines Absendevorgangs fehlgeschlagen (${store.name}): ${String(error).slice(0, 300)}`,
    )
    return null
  }
}

export type StoreOutcome = "skipped" | "created" | "updated" | "failed"

/**
 * Legt an oder aktualisiert — und schluckt jeden Fehler.
 *
 * Aktualisiert wird, wenn derselbe Absendevorgang schon einmal ankam. Dabei
 * bleiben `id`, `reference`, `createdAt` und der Sales-Zustand erhalten: Der
 * Vorgang ist derselbe, nur der Inhalt kann sich geaendert haben (jemand
 * korrigiert nach einer Fehlermeldung eine Zeile und schickt erneut).
 */
export async function storeLead(record: LeadRecord): Promise<StoreOutcome> {
  const store = getLeadStore()
  if (!store) return "skipped"

  try {
    const existing = record.submissionKey
      ? await store.findBySubmissionKey(record.submissionKey)
      : null

    const next: LeadRecord = existing
      ? {
          ...record,
          id: existing.id,
          reference: existing.reference,
          createdAt: existing.createdAt,
          salesStatus: existing.salesStatus,
          nextAction: existing.nextAction,
          nextActionAt: existing.nextActionAt,
          lostReason: existing.lostReason,
          updatedAt: new Date().toISOString(),
        }
      : record

    await store.save(next)
    /*
     * Eine Zeile im Protokoll, damit ein Schreibvorgang sichtbar ist. Nur
     * Vorgangsnummer und Adapter — kein Name, keine Mail: Serverprotokolle
     * sind kein Ort fuer personenbezogene Daten.
     */
    const outcome: StoreOutcome = existing ? "updated" : "created"
    console.info(`[lead] ${outcome} ${next.reference} (${store.name})`)
    return outcome
  } catch (error) {
    await raiseAlert(
      "lead-store-failed",
      `Speichern von ${record.reference} fehlgeschlagen (${store.name}): ${String(error).slice(0, 300)}`,
    )
    return "failed"
  }
}

/* ==========================================================================
 * LESEN UND ÄNDERN — für das Control Center
 *
 * Diese Funktionen werfen ABSICHTLICH. Anders als beim Schreiben, das eine
 * Besucher-Anfrage nicht gefaehrden darf, ist ein Lesefehler im Control
 * Center eine Nachricht an den Owner: „Die Datenbank antwortet nicht."
 * Sie durch eine leere Liste zu ersetzen, hiesse „keine Leads" zu behaupten,
 * wo „nicht erreichbar" gilt (MP-G §33).
 * ========================================================================== */

export class LeadStoreUnavailable extends Error {
  constructor() {
    super("Kein Lead-Speicher konfiguriert")
    this.name = "LeadStoreUnavailable"
  }
}

function requireStore(): LeadStore {
  const store = getLeadStore()
  if (!store) throw new LeadStoreUnavailable()
  return store
}

export function listLeads(query: LeadListQuery = {}): Promise<LeadPage> {
  return requireStore().list(query)
}

export function getLead(id: string): Promise<LeadRecord | null> {
  return requireStore().getById(id)
}

export function setSalesStatus(
  id: string,
  status: SalesStatus,
  lostReason: string | null,
): Promise<boolean> {
  return requireStore().updateSalesStatus(id, status, lostReason)
}

export function setNextAction(
  id: string,
  action: string | null,
  at: string | null,
): Promise<boolean> {
  return requireStore().updateNextAction(id, action, at)
}
