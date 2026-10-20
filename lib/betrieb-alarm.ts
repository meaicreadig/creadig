import "server-only"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"

/**
 * Betrieb & Überwachung: Alarme landen nicht nur im Serverprotokoll (das
 * niemand liest), sondern in einer Tabelle, auf der Admin-Übersicht und —
 * höchstens einmal pro Stunde und Art — als Mail im Postfach des Inhabers.
 * Legt sein Schema selbst an (Prod-DATABASE_URL ist "Sensitive").
 */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS betrieb_alarme (
    id bigserial PRIMARY KEY,
    art text NOT NULL,
    text text NOT NULL,
    gemailt boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS betrieb_alarme_art_idx ON betrieb_alarme (art, created_at DESC)`,
]

const MAIL_PAUSE_MIN = 60
const TAEGLICHE_AGENTEN = ["lage", "vertrieb", "messen"] as const

let bereit: Promise<boolean> | null = null

async function db(): Promise<Abfrage | null> {
  const q = neonAbfrage()
  if (!q) return null
  bereit ??= (async () => {
    for (const s of SCHEMA) await q(s, [])
    return true
  })().catch(() => {
    bereit = null
    return false
  })
  return (await bereit) ? q : null
}

async function mailAnInhaber(betreff: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.LEAD_FROM ?? process.env.MAIL_FROM
  const to = process.env.LEAD_TO
  if (!key || !from || !to) return false
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: to.split(",").map((s) => s.trim()), subject: betreff, text }),
      signal: AbortSignal.timeout(4_000),
    })
    return r.ok
  } catch {
    return false
  }
}

/** Speichert den Alarm und mailt ihn, wenn kein Webhook da ist und die Art seit 60 Min. nicht gemailt wurde. */
export async function speichereAlarm(art: string, text: string, mitMail: boolean): Promise<void> {
  const q = await db()
  if (!q) {
    if (mitMail) await mailAnInhaber(`creaDIG Betrieb: ${art}`, text)
    return
  }
  const zuletzt = mitMail
    ? await q(
        `SELECT 1 FROM betrieb_alarme WHERE art = $1 AND gemailt AND created_at > now() - make_interval(mins => $2) LIMIT 1`,
        [art, MAIL_PAUSE_MIN],
      )
    : [{}]
  const gemailt = zuletzt.length === 0 ? await mailAnInhaber(`creaDIG Betrieb: ${art}`, `${text}\n\nAdmin: /admin`) : false
  await q(`INSERT INTO betrieb_alarme (art, text, gemailt) VALUES ($1, $2, $3)`, [art, text.slice(0, 2000), gemailt])
}

export type Betriebsmeldung = { id: string; titel: string; detail: string; seit: string }

/** Alarme der letzten 24 h (je Art einmal) + Agenten, die nicht mehr laufen oder scheitern. */
export async function ladeBetriebsmeldungen(): Promise<Betriebsmeldung[]> {
  const q = await db()
  if (!q) return []
  const meldungen: Betriebsmeldung[] = []

  const alarme = await q(
    `SELECT art, count(*)::int AS anzahl, max(created_at) AS zuletzt,
            (array_agg(text ORDER BY created_at DESC))[1] AS text
       FROM betrieb_alarme WHERE created_at > now() - interval '24 hours'
      GROUP BY art ORDER BY zuletzt DESC LIMIT 8`,
    [],
  ).catch(() => [])
  for (const a of alarme) {
    const anzahl = Number(a.anzahl)
    meldungen.push({
      id: `alarm:${a.art}`,
      titel: `Störung: ${String(a.art)}${anzahl > 1 ? ` (${anzahl}× in 24 h)` : ""}`,
      detail: String(a.text).replace(/^creaDIG \[[^\]]+\]\s*/, "").slice(0, 240),
      seit: new Date(String(a.zuletzt)).toISOString(),
    })
  }

  const laeufe = await q(
    `SELECT DISTINCT ON (agent) agent, fehler, created_at FROM assistent_laeufe
      WHERE agent = ANY($1) ORDER BY agent, created_at DESC`,
    [TAEGLICHE_AGENTEN as unknown as string[]],
  ).catch(() => null)
  if (laeufe) {
    const stand = new Map(laeufe.map((l) => [String(l.agent), l]))
    for (const agent of TAEGLICHE_AGENTEN) {
      const l = stand.get(agent)
      const alter = l ? (Date.now() - new Date(String(l.created_at)).getTime()) / 36e5 : Infinity
      if (l?.fehler) {
        meldungen.push({
          id: `agent:${agent}:fehler`,
          titel: `Agent „${agent}“ ist beim letzten Lauf gescheitert`,
          detail: String(l.fehler).slice(0, 240),
          seit: new Date(String(l.created_at)).toISOString(),
        })
      } else if (l && alter > 36) {
        meldungen.push({
          id: `agent:${agent}:still`,
          titel: `Agent „${agent}“ läuft seit ${Math.round(alter)} Std. nicht mehr`,
          detail: "Täglicher Lauf (Cron 5 Uhr UTC) ist ausgeblieben. Cron-Protokoll in Vercel prüfen.",
          seit: new Date(String(l.created_at)).toISOString(),
        })
      }
    }
  }
  return meldungen
}
