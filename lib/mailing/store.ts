import "server-only"

import { randomBytes } from "node:crypto"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"
import type { KampagnenInhalt } from "@/lib/mailing/vorlage"

/** Mail-Marketing · Speicher (Migration 027). */

export type Basis = "einwilligung" | "bestandskunde"
export type Empfaenger = {
  id: string
  email: string
  name: string | null
  status: "aktiv" | "abgemeldet" | "unzustellbar"
  basis: Basis
  source: string
  consentAt: string
  token: string
}
export type Kampagne = KampagnenInhalt & {
  id: string
  status: "entwurf" | "versendet"
  recipientsCount: number
  createdAt: string
  updatedAt: string
  sentAt: string | null
  gesendet: number
  fehler: number
  geoeffnet: number
  geklickt: number
}
export type FreierKontakt = { id: string; name: string; email: string; firma: string | null }

export function neueId(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString("base64url")}`
}

function iso(v: unknown): string {
  return v instanceof Date ? v.toISOString() : String(v ?? "")
}

// Same DDL as scripts/migrations/027 — runs once per instance so production needs no manual migration.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS mail_recipients (
    id text PRIMARY KEY, email text NOT NULL, email_normalised text NOT NULL UNIQUE, name text,
    contact_id text REFERENCES contacts (id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv','abgemeldet','unzustellbar')),
    basis text NOT NULL CHECK (basis IN ('einwilligung','bestandskunde')),
    source text NOT NULL, consent_at timestamptz NOT NULL DEFAULT now(), token text NOT NULL UNIQUE,
    unsubscribed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS mail_campaigns (
    id text PRIMARY KEY, subject text NOT NULL DEFAULT '', preheader text NOT NULL DEFAULT '',
    headline text NOT NULL DEFAULT '', body text NOT NULL DEFAULT '', cta_text text NOT NULL DEFAULT '',
    cta_url text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'entwurf' CHECK (status IN ('entwurf','versendet')),
    recipients_count integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz)`,
  `CREATE TABLE IF NOT EXISTS mail_deliveries (
    id text PRIMARY KEY, campaign_id text NOT NULL REFERENCES mail_campaigns (id) ON DELETE CASCADE,
    recipient_id text NOT NULL REFERENCES mail_recipients (id) ON DELETE CASCADE, email text NOT NULL,
    status text NOT NULL DEFAULT 'wartet' CHECK (status IN ('wartet','gesendet','fehler')),
    error text, sent_at timestamptz, opened_at timestamptz, clicked_at timestamptz,
    UNIQUE (campaign_id, recipient_id))`,
  `CREATE INDEX IF NOT EXISTS mail_deliveries_campaign_idx ON mail_deliveries (campaign_id)`,
]
let schemaBereit: Promise<void> | null = null

function q(): Abfrage {
  const abfrage = neonAbfrage()
  if (!abfrage) throw new Error("Datenbank nicht verbunden")
  if (!schemaBereit) {
    schemaBereit = (async () => {
      for (const ddl of SCHEMA) await abfrage(ddl, [])
    })().catch((e) => {
      schemaBereit = null
      throw e
    })
  }
  const bereit = schemaBereit
  return async (text, params) => {
    await bereit
    return abfrage(text, params)
  }
}

function zuKampagne(r: Record<string, unknown>): Kampagne {
  return {
    id: String(r.id),
    subject: String(r.subject ?? ""),
    preheader: String(r.preheader ?? ""),
    headline: String(r.headline ?? ""),
    body: String(r.body ?? ""),
    ctaText: String(r.cta_text ?? ""),
    ctaUrl: String(r.cta_url ?? ""),
    status: r.status === "versendet" ? "versendet" : "entwurf",
    recipientsCount: Number(r.recipients_count ?? 0),
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    sentAt: r.sent_at ? iso(r.sent_at) : null,
    gesendet: Number(r.gesendet ?? 0),
    fehler: Number(r.fehler ?? 0),
    geoeffnet: Number(r.geoeffnet ?? 0),
    geklickt: Number(r.geklickt ?? 0),
  }
}

const KAMPAGNE_SELECT = `SELECT c.*,
  (SELECT count(*) FROM mail_deliveries d WHERE d.campaign_id = c.id AND d.status = 'gesendet')::int AS gesendet,
  (SELECT count(*) FROM mail_deliveries d WHERE d.campaign_id = c.id AND d.status = 'fehler')::int AS fehler,
  (SELECT count(*) FROM mail_deliveries d WHERE d.campaign_id = c.id AND d.opened_at IS NOT NULL)::int AS geoeffnet,
  (SELECT count(*) FROM mail_deliveries d WHERE d.campaign_id = c.id AND d.clicked_at IS NOT NULL)::int AS geklickt
  FROM mail_campaigns c`

export async function kampagnen(): Promise<Kampagne[]> {
  const rows = await q()(`${KAMPAGNE_SELECT} ORDER BY coalesce(c.sent_at, c.updated_at) DESC LIMIT 50`, [])
  return rows.map(zuKampagne)
}

export async function kampagne(id: string): Promise<Kampagne | null> {
  const rows = await q()(`${KAMPAGNE_SELECT} WHERE c.id = $1`, [id])
  return rows[0] ? zuKampagne(rows[0]) : null
}

export async function kampagneAnlegen(inhalt?: Partial<KampagnenInhalt>): Promise<string> {
  const id = neueId("kmp")
  await q()(
    `INSERT INTO mail_campaigns (id, subject, preheader, headline, body, cta_text, cta_url) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, inhalt?.subject ?? "", inhalt?.preheader ?? "", inhalt?.headline ?? "", inhalt?.body ?? "", inhalt?.ctaText ?? "", inhalt?.ctaUrl ?? ""],
  )
  return id
}

export async function kampagneSpeichern(id: string, k: KampagnenInhalt): Promise<boolean> {
  const rows = await q()(
    `UPDATE mail_campaigns SET subject=$2, preheader=$3, headline=$4, body=$5, cta_text=$6, cta_url=$7, updated_at=now()
     WHERE id=$1 AND status='entwurf' RETURNING id`,
    [id, k.subject, k.preheader, k.headline, k.body, k.ctaText, k.ctaUrl],
  )
  return rows.length > 0
}

export async function kampagneLoeschen(id: string): Promise<void> {
  await q()(`DELETE FROM mail_campaigns WHERE id=$1 AND status='entwurf'`, [id])
}

/* Empfänger ---------------------------------------------------------------- */

function zuEmpfaenger(r: Record<string, unknown>): Empfaenger {
  return {
    id: String(r.id),
    email: String(r.email),
    name: r.name ? String(r.name) : null,
    status: (r.status as Empfaenger["status"]) ?? "aktiv",
    basis: r.basis === "bestandskunde" ? "bestandskunde" : "einwilligung",
    source: String(r.source ?? ""),
    consentAt: iso(r.consent_at),
    token: String(r.token),
  }
}

export async function empfaenger(): Promise<Empfaenger[]> {
  const rows = await q()(`SELECT * FROM mail_recipients ORDER BY status, created_at DESC LIMIT 2000`, [])
  return rows.map(zuEmpfaenger)
}

export async function aktiveEmpfaenger(): Promise<Empfaenger[]> {
  const rows = await q()(`SELECT * FROM mail_recipients WHERE status='aktiv' ORDER BY created_at`, [])
  return rows.map(zuEmpfaenger)
}

const QUELLE_OHNE_EINWILLIGUNG = /linked\s*in|xing|instagram|facebook|tiktok|vernetz|visitenkarte|messe|stand(gespr|besuch)|import|kaltakquise|recherche/i

export async function empfaengerEintragen(e: {
  email: string
  name: string | null
  basis: Basis
  source: string
  contactId?: string | null
}): Promise<"neu" | "vorhanden" | "gesperrt"> {
  /*
   * Mail-Sperre (24.10.2026, Automatik 4): Eine Vernetzung, eine Visitenkarte
   * oder ein Messegespräch ist keine Einwilligung in Werbe-Mails (AG Düsseldorf
   * 20.11.2025, 23 C 120/25: LinkedIn-Kontakt ≠ Einwilligung). Solche Quellen
   * kommen nie mit „einwilligung“ in den Verteiler – nur über die bestätigte
   * Website-Anmeldung (Quelle doi:…) oder eine ausdrücklich erteilte Zustimmung.
   */
  if (e.basis === "einwilligung" && !e.source.startsWith("doi:") && QUELLE_OHNE_EINWILLIGUNG.test(e.source)) return "gesperrt"
  const norm = e.email.trim().toLowerCase()
  const rows = await q()(
    `INSERT INTO mail_recipients (id, email, email_normalised, name, contact_id, basis, source, token)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (email_normalised) DO NOTHING RETURNING id`,
    [neueId("emp"), e.email.trim(), norm, e.name, e.contactId ?? null, e.basis, e.source, randomBytes(18).toString("base64url")],
  )
  return rows.length ? "neu" : "vorhanden"
}

export async function empfaengerStatus(id: string, status: "aktiv" | "abgemeldet"): Promise<void> {
  await q()(
    `UPDATE mail_recipients SET status=$2, unsubscribed_at = CASE WHEN $2='abgemeldet' THEN now() ELSE NULL END WHERE id=$1`,
    [id, status],
  )
}

/** Kontakte aus dem CRM mit echter Adresse, die noch nicht im Verteiler stehen. */
export async function freieKontakte(): Promise<FreierKontakt[]> {
  const rows = await q()(
    `SELECT c.id, c.name, c.email, o.name AS firma FROM contacts c
     LEFT JOIN organisations o ON o.id = c.organisation_id
     WHERE c.email LIKE '%@%.%' AND c.email NOT LIKE '%.invalid'
       AND NOT EXISTS (SELECT 1 FROM mail_recipients r WHERE r.email_normalised = c.email_normalised)
     ORDER BY c.updated_at DESC LIMIT 200`,
    [],
  )
  return rows.map((r) => ({ id: String(r.id), name: String(r.name), email: String(r.email), firma: r.firma ? String(r.firma) : null }))
}

export async function kontaktFuerVerteiler(id: string): Promise<{ id: string; name: string; email: string } | null> {
  const rows = await q()(`SELECT id, name, email FROM contacts WHERE id=$1 AND email LIKE '%@%.%' AND email NOT LIKE '%.invalid'`, [id])
  return rows[0] ? { id: String(rows[0].id), name: String(rows[0].name), email: String(rows[0].email) } : null
}

/* Öffentliche Seite: Abmelden ---------------------------------------------- */

export async function empfaengerPerToken(token: string): Promise<Empfaenger | null> {
  if (!/^[\w-]{10,60}$/.test(token)) return null
  const rows = await q()(`SELECT * FROM mail_recipients WHERE token=$1`, [token])
  return rows[0] ? zuEmpfaenger(rows[0]) : null
}

export async function abmeldenPerToken(token: string): Promise<boolean> {
  if (!/^[\w-]{10,60}$/.test(token)) return false
  const rows = await q()(
    `UPDATE mail_recipients SET status='abgemeldet', unsubscribed_at = coalesce(unsubscribed_at, now()) WHERE token=$1 RETURNING id`,
    [token],
  )
  return rows.length > 0
}

/* Zustellungen ------------------------------------------------------------- */

/** Legt je aktivem Empfänger genau eine Zustellung an — doppelter Klick verschickt nicht doppelt. */
export async function zustellungenVormerken(kampagneId: string): Promise<{ id: string; email: string; name: string | null; token: string }[]> {
  await q()(
    `INSERT INTO mail_deliveries (id, campaign_id, recipient_id, email)
     SELECT 'z_' || replace(gen_random_uuid()::text, '-', ''), $1, r.id, r.email FROM mail_recipients r WHERE r.status='aktiv'
     ON CONFLICT (campaign_id, recipient_id) DO NOTHING`,
    [kampagneId],
  )
  const rows = await q()(
    `SELECT d.id, d.email, r.name, r.token FROM mail_deliveries d JOIN mail_recipients r ON r.id = d.recipient_id
     WHERE d.campaign_id=$1 AND d.status='wartet' AND r.status='aktiv'`,
    [kampagneId],
  )
  return rows.map((r) => ({ id: String(r.id), email: String(r.email), name: r.name ? String(r.name) : null, token: String(r.token) }))
}

export async function zustellungErgebnis(ids: string[], ok: boolean, fehler?: string): Promise<void> {
  if (!ids.length) return
  await q()(
    `UPDATE mail_deliveries SET status=$2, sent_at = CASE WHEN $2='gesendet' THEN now() ELSE sent_at END, error=$3 WHERE id = ANY($1)`,
    [ids, ok ? "gesendet" : "fehler", fehler ?? null],
  )
}

export async function kampagneAbschliessen(id: string): Promise<void> {
  await q()(
    `UPDATE mail_campaigns SET status='versendet', sent_at=coalesce(sent_at, now()), updated_at=now(),
       recipients_count=(SELECT count(*) FROM mail_deliveries WHERE campaign_id=$1 AND status='gesendet') WHERE id=$1`,
    [id],
  )
}

export async function geoeffnet(zustellung: string): Promise<void> {
  if (!/^z_[0-9a-f]{32}$/.test(zustellung)) return
  const erst = await q()(`UPDATE mail_deliveries SET opened_at = now() WHERE id=$1 AND opened_at IS NULL RETURNING id`, [zustellung])
  if (erst.length) await meldeZustellung("mail_geoeffnet", zustellung)
}

/** Erstes Öffnen/Klicken einer Kampagnenmail ins Rückgrat melden (Empfänger über die Zustellung). */
async function meldeZustellung(typ: "mail_geoeffnet" | "mail_geklickt", zustellung: string): Promise<void> {
  try {
    const r = await q()(`SELECT lower(email) AS email FROM mail_deliveries WHERE id = $1`, [zustellung])
    const email = r[0]?.email ? String(r[0].email) : null
    if (!email) return
    const { ereignis } = await import("@/lib/motor/ereignis")
    await ereignis(typ, { subjekt: `mail:${email}`, email, daten: { zustellung }, schluessel: `${typ}:${zustellung}` })
  } catch (e) {
    console.error("[mailing] Ereignis", typ, e instanceof Error ? e.message : e)
  }
}

export async function geklickt(zustellung: string): Promise<string | null> {
  if (!/^z_[0-9a-f]{32}$/.test(zustellung)) return null
  const rows = await q()(
    `UPDATE mail_deliveries d SET clicked_at = coalesce(d.clicked_at, now()), opened_at = coalesce(d.opened_at, now())
     FROM mail_campaigns c WHERE d.id=$1 AND c.id = d.campaign_id RETURNING c.cta_url`,
    [zustellung],
  )
  if (rows[0]) await meldeZustellung("mail_geklickt", zustellung)
  return rows[0] ? String(rows[0].cta_url) : null
}
