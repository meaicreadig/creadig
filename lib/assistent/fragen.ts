import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * FRAGEN AN EMIN — 24.10.2026.
 *
 * Emin: „Bunu sen soracağına sistemden bana soru sorsa – şu konuda şu, devam
 * etsin sistem. Ben buradan yazmak yerine kendi sistemimden yazmak isterim.“
 *
 * Statt Emin zu fragen, was er ohnehin nur selbst weiß, legen die Agenten eine
 * kurze Frage ab – mit Antwortknöpfen und Freitext. Die Antwort geht als
 * Nachricht an Aylin (Chief of Staff), die mit ihren Werkzeugen weitermacht
 * (Absprache speichern, Erinnerung setzen, Chance anlegen …). Erinnerungen
 * sind Fragen mit „ab“-Datum: Sie erscheinen erst an diesem Tag.
 *
 * Quellen:
 *   - Gesprächsvorbehalt abgelaufen → „Wie lief das Gespräch mit X?“ (täglich, Teoman)
 *   - Chance ohne nächsten Schritt → „Wie geht es mit X weiter?“ (Teftiş)
 *   - Chat-Werkzeug erinnerung_anlegen („Pazartesi hatırlat“)
 */

export type EminFrage = {
  id: string
  agent: string
  frage: string
  kontext: string | null
  optionen: string[]
  bezug: string | null
  ab: string
  zeit: string
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS emin_fragen (
     id text PRIMARY KEY,
     agent text NOT NULL,
     frage text NOT NULL,
     kontext text,
     optionen jsonb NOT NULL DEFAULT '[]'::jsonb,
     bezug text,
     quelle text UNIQUE,
     status text NOT NULL DEFAULT 'offen' CHECK (status IN ('offen','beantwortet','erledigt')),
     antwort text,
     ab timestamptz NOT NULL DEFAULT now(),
     created_at timestamptz NOT NULL DEFAULT now(),
     beantwortet_at timestamptz
   )`,
  `CREATE INDEX IF NOT EXISTS emin_fragen_offen ON emin_fragen (status, ab)`,
]
let bereit: Promise<void> | null = null
async function schema(q: Abfrage): Promise<void> {
  if (!bereit) {
    bereit = (async () => {
      for (const ddl of SCHEMA) await q(ddl, [])
    })().catch((e) => {
      bereit = null
      throw e
    })
  }
  await bereit
}

async function db(): Promise<Abfrage | null> {
  const { assistentDb } = await import("@/lib/assistent/store")
  return assistentDb()
}

/** Legt eine Frage ab – dieselbe Quelle nur einmal. Gibt die id zurück oder null (schon gefragt). */
export async function stelleFrage(f: {
  agent: string
  frage: string
  kontext?: string | null
  optionen?: string[]
  bezug?: string | null
  quelle?: string | null
  ab?: Date | string | null
}): Promise<string | null> {
  const q = await db()
  if (!q) return null
  await schema(q)
  const id = `frage-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  const rows = (await q(
    `INSERT INTO emin_fragen (id, agent, frage, kontext, optionen, bezug, quelle, ab)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, coalesce($8::timestamptz, now()))
     ON CONFLICT (quelle) DO NOTHING RETURNING id`,
    [
      id,
      f.agent,
      f.frage.slice(0, 300),
      f.kontext?.slice(0, 600) ?? null,
      JSON.stringify((f.optionen ?? []).map((o) => o.slice(0, 80)).slice(0, 4)),
      f.bezug ?? null,
      f.quelle ?? null,
      f.ab ? new Date(f.ab).toISOString() : null,
    ],
  )) as { id: string }[]
  return rows[0]?.id ?? null
}

export async function offeneFragen(grenze = 8): Promise<EminFrage[]> {
  const q = await db()
  if (!q) return []
  await schema(q)
  return (await q(
    `SELECT id, agent, frage, kontext, optionen, bezug, ab::text AS ab, created_at::text AS zeit
       FROM emin_fragen WHERE status = 'offen' AND ab <= now() ORDER BY ab, created_at LIMIT $1`,
    [grenze],
  )) as EminFrage[]
}

export async function ladeFrage(id: string): Promise<EminFrage | null> {
  const q = await db()
  if (!q) return null
  await schema(q)
  const [r] = (await q(
    `SELECT id, agent, frage, kontext, optionen, bezug, ab::text AS ab, created_at::text AS zeit FROM emin_fragen WHERE id = $1 AND status = 'offen'`,
    [id],
  )) as EminFrage[]
  return r ?? null
}

export async function markiereBeantwortet(id: string, antwort: string): Promise<void> {
  const q = await db()
  if (!q) return
  await q(`UPDATE emin_fragen SET status = 'beantwortet', antwort = $2, beantwortet_at = now() WHERE id = $1`, [id, antwort.slice(0, 2000)])
}

/** „Später“: dieselbe Frage morgen früh noch einmal. */
export async function verschiebeFrage(id: string, tage = 1): Promise<void> {
  const q = await db()
  if (!q) return
  await q(`UPDATE emin_fragen SET ab = date_trunc('day', now() AT TIME ZONE 'Europe/Berlin') AT TIME ZONE 'Europe/Berlin' + ($2::int * interval '1 day') + interval '7 hours' WHERE id = $1 AND status = 'offen'`, [id, tage])
}

/** Fragen, deren Chance inzwischen anderweitig erledigt ist (gewonnen/verloren), schließen. */
async function raeumeAuf(q: Abfrage): Promise<void> {
  await q(
    `UPDATE emin_fragen f SET status = 'erledigt'
      WHERE f.status = 'offen' AND f.bezug LIKE 'opportunity:%'
        AND EXISTS (SELECT 1 FROM opportunities o WHERE o.id = substring(f.bezug from 13) AND o.status IN ('won','lost'))`,
    [],
  ).catch(() => null)
}

/**
 * Täglich (Teoman): Chancen, deren Gespräch/Termin/Wartezeit vorbei ist, bekommen
 * EINE Frage „Wie ist es gelaufen?“. So entsteht das Angebot erst nach Emins
 * Antwort – und keine Chance bleibt stumm liegen.
 */
export async function frageNachGespraechen(q: Abfrage): Promise<number> {
  await schema(q)
  await raeumeAuf(q)
  const { spaetestesDatumImText } = await import("@/lib/ausfuehrung/vorbehalt")
  const chancen = (await q(
    `SELECT o.id, o.title, o.next_action, o.next_action_at, g.name,
            (SELECT v.bis FROM chance_vorbehalt v WHERE v.opportunity_id = o.id) AS vorbehalt_bis
       FROM opportunities o JOIN organisations g ON g.id = o.organisation_id
      WHERE o.status NOT IN ('won','lost') AND o.next_action IS NOT NULL`,
    [],
  ).catch(() => [])) as { id: string; title: string; next_action: string; next_action_at: string | Date | null; name: string; vorbehalt_bis: string | Date | null }[]
  let neu = 0
  const jetzt = Date.now()
  for (const c of chancen) {
    /* Datumsfelder zählen bis Tagesende – ein Treffen am 25.10. wird am 26.10. erfragt, nicht am Morgen des 25. */
    const daten = [c.next_action_at, c.vorbehalt_bis].filter(Boolean).map((d) => new Date(d as string).getTime() + 864e5 - 60_000)
    const imText = spaetestesDatumImText(c.next_action)?.getTime()
    if (imText) daten.push(imText)
    if (!daten.length) continue
    const faellig = Math.max(...daten)
    /* Am Morgen nach dem spätesten Datum fragen; nach 14 Tagen nicht mehr nachträglich. */
    if (faellig > jetzt || faellig < jetzt - 14 * 864e5) continue
    const tag = new Date(faellig).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })
    const id = await stelleFrage({
      agent: "vertrieb",
      frage: `${c.name}: Wie ist es gelaufen?`,
      kontext: `Geplant war: „${c.next_action}“ (bis ${tag}). Erst nach deiner Antwort entsteht ein Angebot oder eine Nachfass-Mail.`,
      optionen: ["Gespräch war gut – Angebot vorbereiten", "Noch keine Antwort – in 1 Woche erinnern", "Termin verschoben", "Kein Interesse mehr"],
      bezug: `opportunity:${c.id}`,
      quelle: `frage:nachgespraech:${c.id}:${new Date(faellig).toISOString().slice(0, 10)}`,
    })
    if (id) neu++
  }
  return neu
}

/** Teftiş-Befund „Chance ohne nächsten Schritt“ als Frage an Emin – er weiß es, die Agenten nicht. */
export async function frageNachNaechstemSchritt(q: Abfrage): Promise<number> {
  await schema(q)
  const ohne = (await q(
    `SELECT o.id, o.title, g.name FROM opportunities o JOIN organisations g ON g.id = o.organisation_id
      WHERE o.status NOT IN ('won','lost') AND (o.next_action IS NULL OR o.next_action_at IS NULL)`,
    [],
  ).catch(() => [])) as { id: string; title: string; name: string }[]
  let neu = 0
  for (const c of ohne) {
    const id = await stelleFrage({
      agent: "vertrieb",
      frage: `${c.name}: Wie geht es weiter – und bis wann?`,
      kontext: `„${c.title}“ hat keinen nächsten Schritt mit Datum. Ein Satz reicht, z. B. „Mittwoch anrufen“.`,
      optionen: ["Ich melde mich diese Woche", "Wartet auf deren Antwort", "Erst nächsten Monat", "Chance schließen"],
      bezug: `opportunity:${c.id}`,
      quelle: `frage:schritt:${c.id}`,
    })
    if (id) neu++
  }
  return neu
}
