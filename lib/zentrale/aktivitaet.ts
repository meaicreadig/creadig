/**
 * Was „lebendig“ in der Zentrale bedeutet – nur aus echten Zeitstempeln.
 * Rein (kein Server-Import), damit Server und 3D-Szene dieselben Regeln nutzen.
 */
import type { KnotenId, Sprache } from "@/lib/zentrale/netz-karte"

export type Takt = "taeglich" | "woechentlich"

/**
 * Wie lange eine Verbindungslinie nach einem echten Ereignis sichtbar bleibt.
 * 20 Minuten: lang genug, dass man sie beim Öffnen der Zentrale noch sieht,
 * kurz genug, dass sie „gerade eben“ bedeutet und nie zum Dauerzustand wird.
 */
export const FADEN_FENSTER_MS = 20 * 60_000

const TAKT_MS: Record<Takt, number> = { taeglich: 24 * 3600_000, woechentlich: 7 * 24 * 3600_000 }

/**
 * Ein Agent gilt als „frisch“, solange sein letzter Lauf jünger ist als anderthalb Takte
 * (täglich 36 h – derselbe Wert wie STILL_STUNDEN in netz.ts –, wöchentlich 10,5 Tage).
 * Der halbe Takt Luft deckt ab, dass der nächste Lauf erst beim nächsten Cron-Tick startet.
 */
export const frischGrenzeMs = (takt: Takt) => TAKT_MS[takt] * 1.5

export type AgentStand = {
  id: string
  name: string
  takt: Takt | null
  /** ISO-Zeit des letzten abgeschlossenen Laufs; null = nie ein Lauf erfasst. */
  zeit: string | null
  /** Der letzte Lauf endete mit Fehler. */
  fehler: boolean
  /** Was der letzte Lauf tatsächlich erledigt hat (aus assistent_laeufe). */
  ergebnis?: string
}

export type LiveDaten = {
  laeufe: Record<string, { zeit: string; fehler: boolean; ergebnis?: string }>
  takte: Record<string, Takt>
  /** „von>nach“ → ISO-Zeit des jüngsten echten Ereignisses. */
  faeden: Record<string, string>
}

export type LiveFaden = {
  von: KnotenId
  nach: KnotenId
  raumVon: string
  raumNach: string
  was: string
  zeit: string
}

export function agentFrisch(s: AgentStand, jetzt: number): boolean {
  if (!s.zeit || !s.takt || s.fehler) return false
  return jetzt - new Date(s.zeit).getTime() < frischGrenzeMs(s.takt)
}

export function fadenLive(zeit: string, jetzt: number): boolean {
  const alter = jetzt - new Date(zeit).getTime()
  return alter >= 0 && alter < FADEN_FENSTER_MS
}

export function vorText(zeit: string, jetzt: number, sprache: Sprache): string {
  const min = Math.max(0, Math.round((jetzt - new Date(zeit).getTime()) / 60_000))
  const tr = sprache === "tr"
  if (min < 1) return tr ? "az önce" : "gerade eben"
  if (min < 60) return tr ? `${min} dk önce` : `vor ${min} Min.`
  const h = Math.round(min / 60)
  if (h < 48) return tr ? `${h} sa önce` : `vor ${h} Std.`
  const d = Math.round(h / 24)
  return tr ? `${d} gün önce` : `vor ${d} Tagen`
}
