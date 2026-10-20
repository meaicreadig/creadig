import "server-only"

import { generateText } from "ai"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"
import {
  MESSEN,
  MESSE_KATEGORIEN,
  MESSE_REGIONEN,
  messeKey,
  type Messe,
  type MesseKategorie,
  type MesseRegion,
} from "@/lib/messen"

export type MesseStatus = "teilnehmen" | "interessiert" | "nein"
export const MESSE_STATUS: readonly MesseStatus[] = ["teilnehmen", "interessiert", "nein"]

/** Web-recherchierendes Modell über AI Gateway — günstig, mit Quellen. */
const RECHERCHE_MODELL = "perplexity/sonar"

const INTERESSEN = `
Inhaber: creaDIG Solutions (Einzelunternehmen, Deutschland). Interessen nach Priorität:
1. Digitale Produkte, Software, SaaS, KI — Messen für Mittelstand und Vereine.
2. Digitale Gastronomie / Food-Tech / Hospitality-Tech (Kassen, Bestellung, Treue-Apps) — KEINE reinen Lebensmittelmessen.
3. Golfstaaten (Saudi-Arabien, VAE, Katar, Kuwait): Koran, islamische Bildung und Medien, digitale islamische Produkte, Tech-Messen.
4. Internationaler Handel / China-Handel — aber in der Türkei, DACH oder Europa (nicht in China).
5. 3D-Druck, E-Commerce, Franchise, Möbel/Heimtextil (Türkei), Mode (Türkei), Helal-Wirtschaft, Unternehmernetzwerke (MÜSİAD).
Regionen: DACH und Türkei zuerst, dann Golfstaaten, dann Europa.
Glasfaser-Messen nur selten — dafür besteht kaum Bedarf.`.trim()

async function tabellen(q: Abfrage) {
  await q(
    `CREATE TABLE IF NOT EXISTS messen_status (
       key text PRIMARY KEY, status text NOT NULL CHECK (status IN ('teilnehmen','interessiert','nein')),
       updated_at timestamptz NOT NULL DEFAULT now()
     )`,
    [],
  )
  await q(
    `CREATE TABLE IF NOT EXISTS messen_vorschlaege (
       key text PRIMARY KEY, name text NOT NULL, ort text NOT NULL, land text NOT NULL,
       region text NOT NULL, kategorie text NOT NULL, monat int NOT NULL,
       von date, bis date, url text NOT NULL, nutzen text NOT NULL,
       gefunden_at timestamptz NOT NULL DEFAULT now()
     )`,
    [],
  )
}

export async function ladeStatus(): Promise<Record<string, MesseStatus>> {
  const q = neonAbfrage()
  if (!q) return {}
  try {
    await tabellen(q)
    const rows = await q(`SELECT key, status FROM messen_status`, [])
    return Object.fromEntries(rows.map((r) => [r.key as string, r.status as MesseStatus]))
  } catch {
    return {}
  }
}

export async function setzeStatus(key: string, status: MesseStatus | null): Promise<void> {
  const q = neonAbfrage()
  if (!q) throw new Error("Speicher nicht verfügbar")
  await tabellen(q)
  if (status === null) {
    await q(`DELETE FROM messen_status WHERE key = $1`, [key])
    return
  }
  await q(
    `INSERT INTO messen_status (key, status) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET status = EXCLUDED.status, updated_at = now()`,
    [key, status],
  )
}

function isoDatum(v: unknown): string | undefined {
  if (!v) return undefined
  const d = v instanceof Date ? v : new Date(String(v))
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10)
}

/** Vom wöchentlichen Radar gefundene Messen — im selben Format wie die feste Liste. */
export async function ladeVorschlaege(): Promise<(Messe & { neu: boolean })[]> {
  const q = neonAbfrage()
  if (!q) return []
  try {
    await tabellen(q)
    const rows = await q(`SELECT * FROM messen_vorschlaege ORDER BY gefunden_at DESC LIMIT 200`, [])
    const woche = Date.now() - 8 * 86_400_000
    return rows.map((r) => {
      const von = isoDatum(r.von)
      const bis = isoDatum(r.bis) ?? von
      return {
        name: r.name as string,
        ort: r.ort as string,
        land: r.land as string,
        region: r.region as MesseRegion,
        kategorie: r.kategorie as MesseKategorie,
        monat: Number(r.monat),
        rhythmus: 1 as const,
        termin: von && bis ? { von, bis } : undefined,
        url: r.url as string,
        nutzen: r.nutzen as string,
        empfehlung: "besuchen" as const,
        neu: new Date(r.gefunden_at as string).getTime() > woche,
      }
    })
  } catch {
    return []
  }
}

/** Messen mit "Ich nehme teil" — für den Kalender-Feed (Apple/Google). */
export async function messenFuerKalender(): Promise<Messe[]> {
  const [status, vorschlaege] = await Promise.all([ladeStatus(), ladeVorschlaege()])
  return [...MESSEN, ...vorschlaege].filter((m) => status[messeKey(m.name)] === "teilnehmen")
}

type Fund = {
  name: string
  ort: string
  land: string
  region: string
  kategorie: string
  von?: string | null
  bis?: string | null
  monat?: number
  url: string
  nutzen: string
}

function feedbackText(status: Record<string, MesseStatus>, alle: Messe[]): string {
  const nachName = new Map(alle.map((m) => [messeKey(m.name), m]))
  const gruppe = (s: MesseStatus) =>
    Object.entries(status)
      .filter(([, v]) => v === s)
      .map(([k]) => nachName.get(k))
      .filter((m): m is Messe => Boolean(m))
      .map((m) => `${m.name} (${MESSE_KATEGORIEN[m.kategorie]}, ${m.land})`)
  const ja = [...gruppe("teilnehmen"), ...gruppe("interessiert")]
  const nein = gruppe("nein")
  return [
    ja.length ? `Gefällt dem Inhaber (mehr davon finden): ${ja.join("; ")}` : "",
    nein.length ? `Interessiert NICHT (ähnliche deutlich seltener vorschlagen): ${nein.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

function parseFunde(roh: string): Fund[] {
  const start = roh.indexOf("[")
  const ende = roh.lastIndexOf("]")
  if (start < 0 || ende <= start) return []
  try {
    const daten = JSON.parse(roh.slice(start, ende + 1))
    return Array.isArray(daten) ? daten : []
  } catch {
    return []
  }
}

const DATUM = /^\d{4}-\d{2}-\d{2}$/

/**
 * Wöchentliche Recherche: sucht neue Messen passend zu den Interessen und
 * zum Feedback (Teilnehmen/Interessiert/Nein). Legt nur NEUE Messen ab —
 * bekannte Namen werden übersprungen.
 */
export async function radarRecherche(): Promise<{ neu: number }> {
  const q = neonAbfrage()
  if (!q) throw new Error("Speicher nicht verfügbar")
  await tabellen(q)
  const [status, vorschlaege] = await Promise.all([ladeStatus(), ladeVorschlaege()])
  const alle: Messe[] = [...MESSEN, ...vorschlaege]
  const bekannt = new Set(alle.map((m) => messeKey(m.name)))
  const heute = new Date().toISOString().slice(0, 10)

  const { text } = await generateText({
    model: RECHERCHE_MODELL,
    prompt: `Heute ist ${heute}. Recherchiere im Web Fachmessen der nächsten 18 Monate.

${INTERESSEN}

${feedbackText(status, alle)}

Bereits bekannt (NICHT erneut nennen): ${alle.map((m) => m.name).join(", ")}

Nenne bis zu 12 NEUE, real existierende Messen mit offizieller Veranstalter-URL.
Datum nur angeben, wenn es auf der Veranstalterseite bestätigt ist, sonst null.
Antworte NUR mit einem JSON-Array, ohne Erklärung:
[{"name":"...","ort":"Stadt (Messegelände)","land":"ISO-2","region":"${Object.keys(MESSE_REGIONEN).join("|")}","kategorie":"${Object.keys(MESSE_KATEGORIEN).join("|")}","von":"YYYY-MM-DD oder null","bis":"YYYY-MM-DD oder null","monat":1-12,"url":"https://...","nutzen":"1 Satz auf Deutsch: Was bringt die Messe creaDIG konkret?"}]`,
  })

  let neu = 0
  for (const f of parseFunde(text).slice(0, 12)) {
    if (!f?.name || !f.url?.startsWith("https://") || !f.nutzen) continue
    const key = messeKey(f.name)
    if (bekannt.has(key)) continue
    const region = f.region in MESSE_REGIONEN ? f.region : "eu"
    const kategorie = f.kategorie in MESSE_KATEGORIEN ? f.kategorie : "digital"
    const von = f.von && DATUM.test(f.von) ? f.von : null
    const bis = f.bis && DATUM.test(f.bis) ? f.bis : von
    const monat = von ? Number(von.slice(5, 7)) : Math.min(12, Math.max(1, Math.round(Number(f.monat) || 1)))
    await q(
      `INSERT INTO messen_vorschlaege (key, name, ort, land, region, kategorie, monat, von, bis, url, nutzen)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (key) DO NOTHING`,
      [key, f.name.slice(0, 160), (f.ort ?? "").slice(0, 160), (f.land ?? "").slice(0, 8), region, kategorie, monat, von, bis, f.url.slice(0, 400), f.nutzen.slice(0, 400)],
    )
    bekannt.add(key)
    neu++
  }
  return { neu }
}
