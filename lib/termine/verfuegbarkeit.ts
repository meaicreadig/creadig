/**
 * Termin-Motor · Verfügbarkeit — reine Rechnung, keine Datenbank.
 *
 * Eingang: Wochenraster in Ortszeit, Sperren, bestehende Termine, fremde
 * Belegungen (Kalender). Ausgang: buchbare Startzeiten in UTC.
 * Ortszeit → UTC läuft über Intl, damit Sommer-/Winterzeit stimmt.
 */

export type Intervall = { start: number; end: number }
/** Schlüssel "0"–"6" (0 = Sonntag) → Zeitfenster "HH:MM"–"HH:MM" in Ortszeit. */
export type Wochenraster = Record<string, [string, string][]>

export type Einstellungen = {
  timezone: string
  week: Wochenraster
  bufferMin: number
  minNoticeHours: number
  horizonDays: number
}

export const STANDARD_EINSTELLUNGEN: Einstellungen = {
  timezone: "Europe/Berlin",
  week: {
    "1": [["09:00", "12:00"], ["13:00", "17:00"]],
    "2": [["09:00", "12:00"], ["13:00", "17:00"]],
    "3": [["09:00", "12:00"], ["13:00", "17:00"]],
    "4": [["09:00", "12:00"], ["13:00", "17:00"]],
    "5": [["09:00", "12:00"], ["13:00", "15:00"]],
  },
  bufferMin: 30,
  minNoticeHours: 24,
  horizonDays: 21,
}

const MIN = 60_000
export const RASTER_MIN = 30

/** Versatz der Zone gegenüber UTC in ms zum Zeitpunkt `ms`. */
export function zonenVersatz(ms: number, timezone: string): number {
  const teile = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ms))
  const w = (t: string) => Number(teile.find((p) => p.type === t)?.value)
  const alsUtc = Date.UTC(w("year"), w("month") - 1, w("day"), w("hour"), w("minute"), w("second"))
  return alsUtc - Math.floor(ms / 1000) * 1000
}

/** Ortszeit (Tag "YYYY-MM-DD", Uhrzeit "HH:MM") in der Zone → UTC-ms. */
export function ortszeitZuUtc(tag: string, uhrzeit: string, timezone: string): number {
  const [y, m, d] = tag.split("-").map(Number)
  const [hh, mm] = uhrzeit.split(":").map(Number)
  const naiv = Date.UTC(y, m - 1, d, hh, mm)
  let ergebnis = naiv - zonenVersatz(naiv, timezone)
  /* Zweiter Durchgang: an Umstelltagen weicht der Versatz am Ergebnis ab. */
  const korrigiert = naiv - zonenVersatz(ergebnis, timezone)
  if (korrigiert !== ergebnis) ergebnis = korrigiert
  return ergebnis
}

/** Kalendertag in der Zone für einen UTC-Zeitpunkt. */
export function ortsTag(ms: number, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(ms),
  )
}

export function tagPlus(tag: string, n: number): string {
  const [y, m, d] = tag.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

function wochentagVon(tag: string): number {
  const [y, m, d] = tag.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

function ueberlappt(a: Intervall, b: Intervall): boolean {
  return a.start < b.end && b.start < a.end
}

export type SlotAnfrage = {
  einstellungen: Einstellungen
  dauerMin: number
  jetzt: number
  /** Sperren (Urlaub, vorläufig, Soft Hold) — alle nicht buchbar. */
  sperren: Intervall[]
  /** Bestehende aktive Termine (ohne Puffer). */
  termine: Intervall[]
  /** Belegt laut externem Kalender. */
  belegt?: Intervall[]
  /** Optional: nur diese Ortstage (inklusive). */
  vonTag?: string | null
  bisTag?: string | null
}

/** Buchbare Startzeitpunkte (UTC-ms), aufsteigend. */
export function freieSlots(a: SlotAnfrage): number[] {
  const { einstellungen: e, dauerMin, jetzt } = a
  const puffer = e.bufferMin * MIN
  const fruehestens = jetzt + e.minNoticeHours * 60 * MIN
  const spaetestens = jetzt + e.horizonDays * 24 * 60 * MIN
  const heute = ortsTag(jetzt, e.timezone)
  let tag = a.vonTag && a.vonTag > heute ? a.vonTag : heute
  const letzterTag = a.bisTag ?? ortsTag(spaetestens, e.timezone)

  /* Ein Termin hält den Platz bis Ende + Puffer; ein neuer braucht davor ebenfalls Puffer. */
  const blockiert: Intervall[] = [
    ...a.sperren,
    ...(a.belegt ?? []),
    ...a.termine.map((t) => ({ start: t.start - puffer, end: t.end + puffer })),
  ]

  const ergebnis: number[] = []
  for (let schritt = 0; tag <= letzterTag && schritt < 120; schritt++, tag = tagPlus(tag, 1)) {
    const fenster = e.week[String(wochentagVon(tag))] ?? []
    for (const [von, bis] of fenster) {
      const fensterStart = ortszeitZuUtc(tag, von, e.timezone)
      const fensterEnde = ortszeitZuUtc(tag, bis, e.timezone)
      for (let s = fensterStart; s + dauerMin * MIN <= fensterEnde; s += RASTER_MIN * MIN) {
        if (s < fruehestens || s > spaetestens) continue
        const slot = { start: s, end: s + dauerMin * MIN }
        if (blockiert.some((b) => ueberlappt(slot, b))) continue
        ergebnis.push(s)
      }
    }
  }
  return ergebnis
}

/** Prüft genau einen Start — die Buchung rechnet serverseitig nach, nicht der Browser. */
export function istFrei(a: SlotAnfrage, start: number): boolean {
  return freieSlots(a).includes(start)
}

export function gueltigesRaster(week: unknown): week is Wochenraster {
  if (!week || typeof week !== "object") return false
  const zeit = /^([01]\d|2[0-3]):[0-5]\d$/
  return Object.entries(week as Record<string, unknown>).every(
    ([k, v]) =>
      /^[0-6]$/.test(k) &&
      Array.isArray(v) &&
      v.every((f) => Array.isArray(f) && f.length === 2 && zeit.test(f[0]) && zeit.test(f[1]) && f[0] < f[1]),
  )
}
