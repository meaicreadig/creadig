import "server-only"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"
import type { Intervall } from "@/lib/termine/verfuegbarkeit"

/*
 * Apple → System: Der öffentliche iCloud-Link eines Kalenders wird gelesen,
 * seine Termine blockieren die Buchungszeiten. Schreiben nach Apple läuft
 * über das Abo des eigenen Feeds (/api/termine/feed).
 * Wiederholungsregeln (RRULE) werden nicht aufgelöst — nur Einzeltermine.
 */

export type AppleTermin = { titel: string; start: number; end: number; ganztags: boolean }

async function tabelle(q: Abfrage) {
  await q(
    `CREATE TABLE IF NOT EXISTS admin_kalender_quelle (
       id text PRIMARY KEY, ics_url text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
     )`,
    [],
  )
}

export async function appleQuelle(): Promise<string | null> {
  const q = neonAbfrage()
  if (!q) return null
  await tabelle(q)
  const rows = await q(`SELECT ics_url FROM admin_kalender_quelle WHERE id = 'apple'`, [])
  return (rows[0]?.ics_url as string | undefined) ?? null
}

export async function speichereAppleQuelle(url: string | null): Promise<void> {
  const q = neonAbfrage()
  if (!q) throw new Error("Speicher nicht verfügbar")
  await tabelle(q)
  if (!url) {
    await q(`DELETE FROM admin_kalender_quelle WHERE id = 'apple'`, [])
    return
  }
  await q(
    `INSERT INTO admin_kalender_quelle (id, ics_url, updated_at) VALUES ('apple', $1, now())
     ON CONFLICT (id) DO UPDATE SET ics_url = EXCLUDED.ics_url, updated_at = now()`,
    [url],
  )
}

export function normalisiereIcsUrl(roh: string): string | null {
  const url = roh.trim().replace(/^webcals?:/i, "https:")
  try {
    const u = new URL(url)
    if (u.protocol !== "https:") return null
    if (!/(^|\.)icloud\.com$/i.test(u.hostname) && !/\.ics$/i.test(u.pathname)) return null
    return u.toString()
  } catch {
    return null
  }
}

function berlinNachUtc(y: number, mo: number, d: number, h: number, mi: number, s: number): number {
  const annahme = Date.UTC(y, mo - 1, d, h, mi, s)
  const teile = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin", hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(annahme))
  const w = (t: string) => Number(teile.find((p) => p.type === t)?.value)
  const alsBerlin = Date.UTC(w("year"), w("month") - 1, w("day"), w("hour"), w("minute"), w("second"))
  return annahme - (alsBerlin - annahme)
}

function zeit(wert: string, parameter: string): { ms: number; ganztags: boolean } | null {
  const m = wert.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/)
  if (!m) return null
  const [, y, mo, d, h, mi, s, z] = m
  if (!h || /VALUE=DATE(?!-)/.test(parameter)) {
    return { ms: berlinNachUtc(+y, +mo, +d, 0, 0, 0), ganztags: true }
  }
  if (z) return { ms: Date.UTC(+y, +mo - 1, +d, +h, +mi, +s), ganztags: false }
  return { ms: berlinNachUtc(+y, +mo, +d, +h, +mi, +s), ganztags: false }
}

export function parseIcs(text: string): AppleTermin[] {
  const zeilen = text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/)
  const termine: AppleTermin[] = []
  let ev: { titel?: string; start?: ReturnType<typeof zeit>; end?: ReturnType<typeof zeit>; frei?: boolean } | null = null
  for (const zeile of zeilen) {
    if (zeile === "BEGIN:VEVENT") ev = {}
    else if (zeile === "END:VEVENT" && ev) {
      if (ev.start && !ev.frei) {
        const ende = ev.end?.ms ?? ev.start.ms + (ev.start.ganztags ? 86_400_000 : 3_600_000)
        termine.push({ titel: ev.titel ?? "Termin", start: ev.start.ms, end: ende, ganztags: ev.start.ganztags })
      }
      ev = null
    } else if (ev) {
      const i = zeile.indexOf(":")
      if (i < 0) continue
      const [name, ...params] = zeile.slice(0, i).split(";")
      const wert = zeile.slice(i + 1)
      const p = params.join(";")
      if (name === "DTSTART") ev.start = zeit(wert, p)
      else if (name === "DTEND") ev.end = zeit(wert, p)
      else if (name === "SUMMARY") ev.titel = wert.replace(/\\,/g, ",").replace(/\\n/g, " ").slice(0, 120)
      else if (name === "TRANSP" && wert === "TRANSPARENT") ev.frei = true
    }
  }
  return termine
}

export async function appleTermine(tageVoraus = 60): Promise<AppleTermin[]> {
  const url = await appleQuelle().catch(() => null)
  if (!url) return []
  try {
    const res = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) })
    if (!res.ok) return []
    const jetzt = Date.now()
    const bis = jetzt + tageVoraus * 86_400_000
    return parseIcs(await res.text())
      .filter((t) => t.end > jetzt && t.start < bis)
      .sort((a, b) => a.start - b.start)
  } catch {
    return []
  }
}

export async function appleBelegt(): Promise<Intervall[]> {
  return (await appleTermine()).map((t) => ({ start: t.start, end: t.end }))
}
