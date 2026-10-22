import "server-only"

import { generateText } from "ai"

import { GESCHAEFTS_ZEITZONE } from "@/lib/geschaeftszeit"
import { neonAbfrage } from "@/lib/neon-abfrage"
import { firmenText } from "@/lib/firmenwahrheit"

/** Tages-Rückmeldung am Abend: was heute wirklich passiert ist, was offen bleibt, womit morgen anfangen. */
export type AbendRueckmeldung = {
  tag: string
  bilanz: string
  gut: string[]
  offen: string[]
  morgenZuerst: string
  zahlen: TagesZahlen
  quelle: "ki" | "regel"
  erstellt: string
}

export type TagesZahlen = {
  mailsGesendet: number
  antworten: number
  termineGebucht: number
  freigabenErledigt: number
  freigabenOffen: number
  agentenLaeufe: number
  agentenFehler: number
}

const MODELL = "openai/gpt-5.4-mini"
const SPRACHE_KEY = "abend-de"

function heute(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: GESCHAEFTS_ZEITZONE }).format(new Date())
}

function gestern(): string {
  const d = new Date(Date.now() - 86_400_000)
  return new Intl.DateTimeFormat("en-CA", { timeZone: GESCHAEFTS_ZEITZONE }).format(d)
}

const TAG = `(created_at AT TIME ZONE '${GESCHAEFTS_ZEITZONE}')::date = $1::date`

async function zaehle(sql: string, p: unknown[]): Promise<number> {
  const db = neonAbfrage()
  if (!db) return 0
  const r = await db(sql, p).catch(() => [])
  return Number(r[0]?.c ?? 0)
}

async function sammle(tag: string): Promise<{ zahlen: TagesZahlen; details: string[] }> {
  const db = neonAbfrage()
  const [mailsGesendet, antworten, termineGebucht, freigabenErledigt, freigabenOffen, agentenLaeufe, agentenFehler] = await Promise.all([
    zaehle(`SELECT count(*) AS c FROM activities WHERE kind = 'mail.gesendet' AND subject_type = 'contact' AND ${TAG}`, [tag]),
    zaehle(`SELECT count(*) AS c FROM activities WHERE kind LIKE 'mail.antwort%' AND subject_type = 'contact' AND ${TAG}`, [tag]),
    zaehle(`SELECT count(*) AS c FROM appointments WHERE status <> 'cancelled' AND ${TAG}`, [tag]),
    zaehle(
      `SELECT count(*) AS c FROM assistent_freigaben WHERE status <> 'offen' AND (erledigt_at AT TIME ZONE '${GESCHAEFTS_ZEITZONE}')::date = $1::date`,
      [tag],
    ),
    zaehle(`SELECT count(*) AS c FROM assistent_freigaben WHERE status = 'offen'`, []),
    zaehle(`SELECT count(*) AS c FROM assistent_laeufe WHERE ${TAG}`, [tag]),
    zaehle(`SELECT count(*) AS c FROM assistent_laeufe WHERE fehler IS NOT NULL AND ${TAG}`, [tag]),
  ])
  const details: string[] = []
  if (db) {
    const akt = await db(
      `SELECT kind, summary FROM activities WHERE ${TAG} AND subject_type IN ('contact','organisation') ORDER BY created_at DESC LIMIT 25`,
      [tag],
    ).catch(() => [])
    for (const a of akt) details.push(`Aktivität: ${a.kind} – ${String(a.summary ?? "").slice(0, 120)}`)
    const laeufe = await db(`SELECT agent, ergebnis, fehler FROM assistent_laeufe WHERE ${TAG} ORDER BY created_at DESC LIMIT 12`, [tag]).catch(() => [])
    for (const l of laeufe) details.push(`Agent ${l.agent}: ${l.fehler ? `FEHLER ${String(l.fehler).slice(0, 80)}` : String(l.ergebnis ?? "").slice(0, 120)}`)
    const offen = await db(
      `SELECT art, titel, created_at::date AS d FROM assistent_freigaben WHERE status = 'offen' ORDER BY created_at ASC LIMIT 10`,
      [],
    ).catch(() => [])
    for (const o of offen) details.push(`Offen seit ${String(o.d).slice(0, 10)}: [${o.art}] ${String(o.titel ?? "").slice(0, 100)}`)
  }
  return {
    zahlen: { mailsGesendet, antworten, termineGebucht, freigabenErledigt, freigabenOffen, agentenLaeufe, agentenFehler },
    details,
  }
}

const SYSTEM = `Du bist der Geschäftsassistent von Muhammed Emin Akyol.
${firmenText("kurz")}
Gib ihm am Abend eine ehrliche Tages-Rückmeldung. Grundlage NUR die DATEN – erfinde nichts.
- "bilanz": ein Satz, wie der Tag gemessen an Umsatz/Kunden war. Ehrlich, auch wenn wenig passiert ist.
- "gut": 0–3 kurze Punkte, was heute wirklich vorangegangen ist.
- "offen": 0–3 kurze Punkte, was liegen geblieben ist (alte Freigaben, Fehler, unbeantwortete Kunden).
- "morgenZuerst": EIN konkreter Schritt für morgen früh, imperativ, max 14 Wörter.
Deutsch, per du, keine Floskeln, keine Emojis. Antworte NUR mit JSON: {"bilanz":"…","gut":["…"],"offen":["…"],"morgenZuerst":"…"}`

function liste(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((x) => x.trim().slice(0, 160)).slice(0, 3) : []
}

function regel(tag: string, z: TagesZahlen): AbendRueckmeldung {
  const gut: string[] = []
  if (z.mailsGesendet) gut.push(`${z.mailsGesendet} Mails an Kunden verschickt`)
  if (z.antworten) gut.push(`${z.antworten} Antworten erhalten`)
  if (z.termineGebucht) gut.push(`${z.termineGebucht} Termine gebucht`)
  const offen: string[] = []
  if (z.freigabenOffen) offen.push(`${z.freigabenOffen} Freigaben warten auf dich`)
  if (z.agentenFehler) offen.push(`${z.agentenFehler} Agentenläufe mit Fehler`)
  return {
    tag,
    bilanz: gut.length ? "Heute ist etwas nach außen gegangen – dranbleiben." : "Heute ist nach außen wenig passiert.",
    gut,
    offen,
    morgenZuerst: z.freigabenOffen ? "Freigaben im Assistenten durchgehen und Mails losschicken" : "Drei neue Firmen anschreiben",
    zahlen: z,
    quelle: "regel",
    erstellt: new Date().toISOString(),
  }
}

async function erstelle(tag: string): Promise<AbendRueckmeldung> {
  const { zahlen, details } = await sammle(tag)
  try {
    const { text } = await generateText({
      model: MODELL,
      system: SYSTEM,
      prompt: `DATEN ${tag}:\n${JSON.stringify(zahlen)}\n${details.join("\n")}`.slice(0, 8000),
      maxOutputTokens: 1200,
    })
    const j = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as Record<string, unknown>
    const bilanz = typeof j.bilanz === "string" ? j.bilanz.trim().slice(0, 240) : ""
    const morgenZuerst = typeof j.morgenZuerst === "string" ? j.morgenZuerst.trim().slice(0, 140) : ""
    if (!bilanz || !morgenZuerst) return regel(tag, zahlen)
    return { tag, bilanz, gut: liste(j.gut), offen: liste(j.offen), morgenZuerst, zahlen, quelle: "ki", erstellt: new Date().toISOString() }
  } catch (e) {
    console.error("[abend]", e instanceof Error ? e.message : e)
    return regel(tag, zahlen)
  }
}

async function speichere(r: AbendRueckmeldung) {
  const db = neonAbfrage()
  if (!db) return
  await db(
    `CREATE TABLE IF NOT EXISTS admin_briefing (tag text NOT NULL, sprache text NOT NULL, daten jsonb NOT NULL,
       erstellt_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (tag, sprache))`,
    [],
  ).catch(() => undefined)
  await db(
    `INSERT INTO admin_briefing (tag, sprache, daten) VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (tag, sprache) DO UPDATE SET daten = EXCLUDED.daten, erstellt_at = now()`,
    [r.tag, SPRACHE_KEY, JSON.stringify(r)],
  ).catch(() => undefined)
}

export async function ladeAbend(tag: string): Promise<AbendRueckmeldung | null> {
  const db = neonAbfrage()
  if (!db) return null
  const r = await db(`SELECT daten FROM admin_briefing WHERE tag = $1 AND sprache = $2`, [tag, SPRACHE_KEY]).catch(() => [])
  return (r[0]?.daten as AbendRueckmeldung | undefined) ?? null
}

/** Neueste Rückmeldung: heute (falls schon erstellt), sonst gestern. */
export async function letzteAbendRueckmeldung(): Promise<AbendRueckmeldung | null> {
  return (await ladeAbend(heute())) ?? (await ladeAbend(gestern()))
}

/** Für das Morgenbriefing: die Rückmeldung vom Vorabend. */
export async function abendVonGestern(): Promise<AbendRueckmeldung | null> {
  return ladeAbend(gestern())
}

export async function erstelleAbendRueckmeldung(): Promise<AbendRueckmeldung> {
  const r = await erstelle(heute())
  await speichere(r)
  return r
}
