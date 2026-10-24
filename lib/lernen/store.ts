import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"
import { AKQUISE_AGENTEN } from "@/lib/agenten/kreise"

/**
 * FIRMENGEDÄCHTNIS — Katman 5 (24.10.2026).
 *
 * Vorher: Emin hat 14 Mails verworfen, keine mit Grund, und kein Agent hat
 * davon erfahren. Die Qualitätssicherung zählte nur Quoten. Derselbe Fehler
 * konnte beliebig oft wiederkommen.
 *
 * Jetzt zwei Tabellen:
 *   lern_entscheidungen – jede Entscheidung Emins (freigegeben, verworfen,
 *     umgeschrieben) mit Grund, Entwurf und Endfassung.
 *   firmen_lektionen    – daraus Regeln je Agent ('*' = alle). Quelle „emin“
 *     (selbst gesagt), „abgeleitet“ (aus dem Muster der Entscheidungen) oder
 *     „korrektur“ (aus seinen Umschreibungen). Emins Regeln überschreibt nie
 *     eine Maschine; gestrichene kommen nicht von selbst zurück.
 *
 * Die Regeln gehen über lib/lernen/middleware.ts in jeden Modellaufruf eines
 * Agenten. Zusätzlich sperrt `zielGesperrt` hart: ein verworfenes Ziel schlägt
 * kein Akquise-Agent ein zweites Mal vor.
 *
 * Eigener DB-Zugang (nicht assistentDb), damit die Middleware in
 * instrumentation.ts nicht das ganze Assistenten-Modul lädt.
 */

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS lern_entscheidungen (
    id text PRIMARY KEY,
    freigabe_id text NOT NULL UNIQUE,
    agent text,
    art text,
    entscheidung text NOT NULL CHECK (entscheidung IN ('freigegeben','verworfen','bearbeitet')),
    grund text,
    grund_text text,
    titel text NOT NULL DEFAULT '',
    entwurf text NOT NULL DEFAULT '',
    endfassung text,
    empfaenger text,
    org_id text,
    ziel text,
    zeit timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS lern_entscheidungen_agent_idx ON lern_entscheidungen (agent, zeit DESC)`,
  `CREATE INDEX IF NOT EXISTS lern_entscheidungen_ziel_idx ON lern_entscheidungen (ziel) WHERE entscheidung = 'verworfen'`,
  `CREATE TABLE IF NOT EXISTS firmen_lektionen (
    id text PRIMARY KEY,
    geltung text NOT NULL,
    regel text NOT NULL,
    art text NOT NULL DEFAULT 'gebot' CHECK (art IN ('verbot','gebot','stil')),
    quelle text NOT NULL CHECK (quelle IN ('emin','abgeleitet','korrektur')),
    belege text[] NOT NULL DEFAULT '{}',
    staerke int NOT NULL DEFAULT 1,
    aktiv boolean NOT NULL DEFAULT true,
    gestrichen boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE UNIQUE INDEX IF NOT EXISTS firmen_lektionen_regel_idx ON firmen_lektionen (geltung, lower(regel))`,
  `CREATE TABLE IF NOT EXISTS lern_destillat (agent text PRIMARY KEY, zuletzt timestamptz NOT NULL DEFAULT now())`,
]

let bereit: Promise<void> | null = null

export async function lernDb(): Promise<Abfrage | null> {
  const q = neonAbfrage()
  if (!q) return null
  if (!bereit) {
    bereit = (async () => {
      for (const ddl of SCHEMA) await q(ddl, [])
    })().catch((e) => {
      bereit = null
      throw e
    })
  }
  await bereit
  return q
}

const neueId = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

/** Agenten, die nach außen ansprechen – nur für sie gilt die harte Zielsperre (Liste: lib/agenten/kreise.ts). */
export const AUSSEN_AGENTEN: string[] = [...AKQUISE_AGENTEN]

/** Gründe, die den Entwurf meinen, nicht das Ziel: Ziel bleibt offen, nur der Text war schlecht. */
const NUR_TEXT = ["Ton passt nicht", "Inhalt falsch oder unbelegt"]
/** Gründe, die das Ziel nur auf Zeit sperren. */
const KURZ = ["Falscher Zeitpunkt", "Doppelt"]

/** Wochen-/Tagesanhang abschneiden: `deal:opp-1:2026-43` und `deal:opp-1:2026-44` sind dasselbe Ziel. */
export const zielVon = (quelle: string | null | undefined): string | null =>
  quelle ? quelle.replace(/:\d{4}-\d{1,2}(-\d{1,2})?$/, "") : null

const ALLERWELT = /@(gmail|googlemail|web|gmx|outlook|hotmail|live|yahoo|icloud|me|t-online|aol|freenet|posteo|mail)\./i

export type Entscheidung = "freigegeben" | "verworfen" | "bearbeitet"

export type FreigabeKern = {
  id: string
  agent: string | null
  art: string
  titel: string
  inhalt: string
  empfaenger: string | null
  quelle?: string | null
  extra?: { orgId?: string } | null
}

/**
 * Eine Entscheidung festhalten. Mit eigenem Grund in Worten entsteht sofort
 * eine Regel (Quelle „emin“) – die gilt ab dem nächsten Lauf.
 */
export async function notiereEntscheidung(
  f: FreigabeKern,
  e: { entscheidung: Entscheidung; grund?: string | null; grundText?: string | null; endfassung?: string | null },
): Promise<void> {
  const q = await lernDb()
  if (!q || !f.agent) return
  await q(
    `INSERT INTO lern_entscheidungen (id, freigabe_id, agent, art, entscheidung, grund, grund_text, titel, entwurf, endfassung, empfaenger, org_id, ziel)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT (freigabe_id) DO UPDATE SET entscheidung = EXCLUDED.entscheidung, grund = EXCLUDED.grund,
       grund_text = EXCLUDED.grund_text, endfassung = EXCLUDED.endfassung, zeit = now()`,
    [
      neueId("lent"),
      f.id,
      f.agent,
      f.art,
      e.entscheidung,
      e.grund?.slice(0, 80) || null,
      e.grundText?.slice(0, 600) || null,
      f.titel.slice(0, 200),
      f.inhalt.slice(0, 4000),
      e.endfassung?.slice(0, 4000) ?? null,
      f.empfaenger?.toLowerCase().trim() || null,
      f.extra?.orgId ?? null,
      zielVon(f.quelle),
    ],
  )
  const worte = e.grundText?.trim()
  if (worte && worte.length >= 6) {
    const anlass = `„${f.titel.slice(0, 80)}“`
    await legeLektionAn({
      geltung: f.agent,
      regel: e.entscheidung === "verworfen" ? `${worte} (verworfen: ${anlass})` : `${worte} (bei ${anlass})`,
      art: e.entscheidung === "verworfen" ? "verbot" : "gebot",
      quelle: "emin",
      belege: [f.id],
    })
  }
}

/**
 * Entscheidungen, die nicht über die Knöpfe liefen (Chat, ältere), täglich nachtragen.
 * Automatisch Geschlossenes (Pause, Antwort kam, keine Adresse) zählt nicht – mit
 * einer Ausnahme: Stoppt der Rechts-Check einen Entwurf, ist das ein Fehler des
 * Agenten (gemessen 24.10.: 9 von 10 verworfenen Jäger-Mails waren Kaltakquise).
 */
export async function entscheidungenNachholen(): Promise<number> {
  const q = await lernDb()
  if (!q) return 0
  const rows = (await q(
    `INSERT INTO lern_entscheidungen (id, freigabe_id, agent, art, entscheidung, grund, grund_text, titel, entwurf, empfaenger, org_id, ziel, zeit)
     SELECT 'lent-' || f.id, f.id, f.agent, f.art,
            CASE WHEN f.status = 'verworfen' THEN 'verworfen' WHEN f.extra->>'bearbeitet' = 'true' THEN 'bearbeitet' ELSE 'freigegeben' END,
            CASE WHEN f.extra ? 'recht' THEN 'Recht & Compliance' ELSE f.extra->>'grund' END,
            coalesce(f.extra->>'grundText', f.extra->>'recht', f.extra->'koordination'->>'ergebnis'),
            f.titel, f.inhalt, lower(f.empfaenger), f.extra->>'orgId',
            regexp_replace(f.quelle, ':\\d{4}-\\d{1,2}(-\\d{1,2})?$', ''), coalesce(f.erledigt_at, f.created_at)
       FROM assistent_freigaben f
      WHERE f.status IN ('freigegeben','verworfen') AND f.agent IS NOT NULL
        AND f.art IN ('mail','linkedin','brief','notiz','kapital')
        AND coalesce(f.erledigt_at, f.created_at) > now() - interval '120 days'
        AND (NOT (f.extra ? 'automatisch') OR f.extra ? 'recht')
        AND coalesce(f.extra->>'fehler', '') NOT LIKE 'Automatisch%'
        AND NOT (f.extra->>'vorgaenger' IS NOT NULL AND f.status = 'verworfen' AND EXISTS (
              SELECT 1 FROM assistent_freigaben v WHERE v.id = f.extra->>'vorgaenger' AND v.extra ? 'antwortAt'))
     ON CONFLICT (freigabe_id) DO NOTHING
     RETURNING id`,
    [],
  )) as { id: string }[]
  return rows.length
}

/**
 * Harte Sperre: Wurde dieses Ziel (Quelle ohne Wochenanhang, Firma, Adresse
 * oder Firmendomain) schon verworfen, schlägt kein Akquise-Agent es erneut vor.
 * Textgründe (Ton, Inhalt) sperren nicht; Zeitpunkt/Doppelt 30 Tage, sonst 180.
 */
export async function zielGesperrt(f: {
  agent?: string | null
  quelle?: string | null
  empfaenger?: string | null
  orgId?: string | null
}): Promise<boolean> {
  if (!f.agent || !AUSSEN_AGENTEN.includes(f.agent)) return false
  const ziel = zielVon(f.quelle)
  const mail = f.empfaenger?.toLowerCase().trim() || null
  const domain = mail && !ALLERWELT.test(mail) ? mail.split("@")[1] ?? null : null
  if (!ziel && !mail && !f.orgId) return false
  const q = await lernDb()
  if (!q) return false
  const rows = (await q(
    `SELECT 1 FROM lern_entscheidungen
      WHERE entscheidung = 'verworfen' AND agent = ANY($5::text[])
        AND coalesce(grund, '') <> ALL($6::text[])
        AND zeit > now() - CASE WHEN grund = ANY($7::text[]) THEN interval '30 days' ELSE interval '180 days' END
        AND ((ziel IS NOT NULL AND ziel = $1) OR (empfaenger IS NOT NULL AND empfaenger = $2)
             OR ($3::text IS NOT NULL AND split_part(empfaenger, '@', 2) = $3) OR (org_id IS NOT NULL AND org_id = $4))
      LIMIT 1`,
    [ziel, mail, domain, f.orgId ?? null, AUSSEN_AGENTEN, NUR_TEXT, KURZ],
  )) as unknown[]
  return rows.length > 0
}

/* ── Lektionen ─────────────────────────────────────────────────────────── */

export type LektionArt = "verbot" | "gebot" | "stil"
export type LektionQuelle = "emin" | "abgeleitet" | "korrektur"
export type Lektion = {
  id: string
  geltung: string
  regel: string
  art: LektionArt
  quelle: LektionQuelle
  belege: string[]
  staerke: number
  zeit: string
}

const g = globalThis as typeof globalThis & { __creadigLektionen?: { bis: number; liste: Lektion[] } | null }
export const vergiss = () => {
  g.__creadigLektionen = null
}

export async function legeLektionAn(l: { geltung: string; regel: string; art: LektionArt; quelle: LektionQuelle; belege?: string[] }): Promise<void> {
  const q = await lernDb()
  if (!q) return
  const regel = l.regel.replace(/\s+/g, " ").trim().slice(0, 400)
  if (regel.length < 6) return
  /* Gleiche Regel noch einmal = stärker. Emin belebt auch Gestrichenes wieder, eine Maschine nicht. */
  await q(
    `INSERT INTO firmen_lektionen (id, geltung, regel, art, quelle, belege)
     VALUES ($1,$2,$3,$4,$5,$6::text[])
     ON CONFLICT (geltung, lower(regel)) DO UPDATE SET
       staerke = firmen_lektionen.staerke + 1,
       belege = (SELECT array_agg(DISTINCT b) FROM unnest(firmen_lektionen.belege || EXCLUDED.belege) b),
       quelle = CASE WHEN EXCLUDED.quelle = 'emin' THEN 'emin' ELSE firmen_lektionen.quelle END,
       aktiv = CASE WHEN EXCLUDED.quelle = 'emin' THEN true ELSE NOT firmen_lektionen.gestrichen END,
       gestrichen = CASE WHEN EXCLUDED.quelle = 'emin' THEN false ELSE firmen_lektionen.gestrichen END,
       updated_at = now()`,
    [neueId("lek"), l.geltung.slice(0, 40), regel, l.art, l.quelle, (l.belege ?? []).slice(0, 20)],
  )
  vergiss()
}

export async function streicheLektion(id: string): Promise<void> {
  const q = await lernDb()
  if (!q) return
  await q(`UPDATE firmen_lektionen SET aktiv = false, gestrichen = true, updated_at = now() WHERE id = $1`, [id])
  vergiss()
}

/** Abgeleitete Regeln eines Agenten vor dem Neuschreiben ablegen (nicht streichen – Emins bleiben). */
export async function legeAbgeleiteteAb(geltung: string): Promise<void> {
  const q = await lernDb()
  if (!q) return
  await q(`UPDATE firmen_lektionen SET aktiv = false, updated_at = now() WHERE geltung = $1 AND quelle <> 'emin' AND aktiv`, [geltung])
  vergiss()
}

export async function ladeLektionen(): Promise<Lektion[]> {
  const c = g.__creadigLektionen
  if (c && c.bis > Date.now()) return c.liste
  const q = await lernDb()
  if (!q) return []
  const liste = (await q(
    `SELECT id, geltung, regel, art, quelle, belege, staerke, coalesce(updated_at, created_at)::text AS zeit FROM firmen_lektionen
      WHERE aktiv ORDER BY (quelle = 'emin') DESC, staerke DESC, updated_at DESC LIMIT 300`,
    [],
  )) as Lektion[]
  g.__creadigLektionen = { bis: Date.now() + 5 * 60_000, liste }
  return liste
}

/** Höchstens so viele Regeln je Aufruf – Emins zuerst, dann die stärksten. */
const MAX_JE_AUFRUF = 14

/**
 * Katman 6: Zusammengelegte Agenten laufen unter EINEM Schlüssel, ihre Karten tragen aber den
 * Unter-Namen (Messen-Karten „messen“, Mahnungen „forderungen“). Ohne diese Zuordnung kamen
 * Regeln aus Emins Entscheidungen zu diesen Karten nie in einen Prompt.
 */
const UNTER_AGENTEN: Record<string, string[]> = {
  vertrieb: ["messen"],
  finanz: ["forderungen"],
  koordinator: ["koordination"],
}

export async function lektionenFuer(agent: string): Promise<Lektion[]> {
  const namen = new Set([agent, ...(UNTER_AGENTEN[agent] ?? [])])
  return (await ladeLektionen()).filter((l) => namen.has(l.geltung) || l.geltung === "*").slice(0, MAX_JE_AUFRUF)
}

export async function lektionenText(agent: string): Promise<string | null> {
  const liste = await lektionenFuer(agent)
  if (!liste.length) return null
  const zeichen = { verbot: "NICHT", gebot: "IMMER", stil: "STIL" } as const
  return [
    "Firmengedächtnis – Regeln aus Emins bisherigen Entscheidungen (verbindlich; sie gehen allgemeinen Gewohnheiten vor, ändern aber keine Fakten der Firmenwahrheit). Wiederhole keinen Fehler, der hier steht:",
    ...liste.map((l) => `- [${zeichen[l.art]}${l.quelle === "emin" ? " · Emin selbst" : ""}] ${l.regel}`),
  ].join("\n")
}

export type LernStand = { entscheidungen: number; mitGrund: number; verworfen: number; bearbeitet: number }

export async function lernStand(tage = 30): Promise<LernStand | null> {
  const q = await lernDb()
  if (!q) return null
  const [r] = (await q(
    `SELECT count(*)::int AS entscheidungen,
            count(*) FILTER (WHERE grund IS NOT NULL OR grund_text IS NOT NULL)::int AS "mitGrund",
            count(*) FILTER (WHERE entscheidung = 'verworfen')::int AS verworfen,
            count(*) FILTER (WHERE entscheidung = 'bearbeitet')::int AS bearbeitet
       FROM lern_entscheidungen WHERE zeit > now() - make_interval(days => $1)`,
    [tage],
  )) as LernStand[]
  return r ?? null
}
