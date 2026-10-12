import "server-only"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"
import {
  STANDARD_EINSTELLUNGEN,
  freieSlots,
  gueltigesRaster,
  type Einstellungen,
  type Intervall,
} from "@/lib/termine/verfuegbarkeit"

/**
 * Termin-Motor · Speicher (Migration 026). Doppelbuchung verhindert die
 * Datenbank selbst: EXCLUDE auf `hold_range` — zwei gleichzeitige Buchungen
 * für denselben Platz scheitern an Postgres, nicht an Glück.
 */

export const AKTIVE_STATUS = ["booked", "confirmed", "pending_calendar", "rescheduled"] as const
export const GESPRAECHSARTEN = {
  kennenlernen: { label: "Kennenlernen", dauer: 30 },
  video: { label: "Videogespräch", dauer: 45 },
  vorort: { label: "Termin vor Ort", dauer: 60 },
} as const
export type Gespraechsart = keyof typeof GESPRAECHSARTEN

export type Sperre = { id: string; kind: "unavailable" | "tentative" | "soft_hold"; startsAt: string; endsAt: string; label: string | null }
export type Termin = {
  id: string
  reference: string
  status: string
  meetingKind: string
  topic: string | null
  startsAt: string
  endsAt: string
  guestName: string
  guestEmail: string
  guestNote: string | null
  contactId: string | null
  contactName: string | null
  calendarState: string
}
export type Buchungslink = {
  token: string
  contactId: string | null
  meetingKind: Gespraechsart
  durationMin: number
  topic: string | null
  windowFrom: string | null
  windowTo: string | null
  expiresAt: string
  usedAt: string | null
  revokedAt: string | null
}

function db(): Abfrage | null {
  return neonAbfrage()
}

export function termineVerfuegbar(): boolean {
  return db() !== null
}

export function neuesToken(bytes = 24): string {
  const a = crypto.getRandomValues(new Uint8Array(bytes))
  return btoa(String.fromCharCode(...a)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function iso(v: unknown): string {
  return v instanceof Date ? v.toISOString() : String(v)
}
function tagText(v: unknown): string | null {
  if (v == null) return null
  return v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10)
}

/* ------------------------------------------------------------------------ */
/* Einstellungen & Sperren                                                   */
/* ------------------------------------------------------------------------ */

export async function holeEinstellungen(): Promise<Einstellungen> {
  const q = db()
  if (!q) return STANDARD_EINSTELLUNGEN
  const rows = await q(`SELECT timezone, week, buffer_min, min_notice_hours, horizon_days FROM availability_settings WHERE id = 'owner'`, [])
  const r = rows[0]
  if (!r) return { ...STANDARD_EINSTELLUNGEN, timezone: process.env.DEFAULT_TIMEZONE?.trim() || STANDARD_EINSTELLUNGEN.timezone }
  return {
    timezone: String(r.timezone),
    week: gueltigesRaster(r.week) ? r.week : STANDARD_EINSTELLUNGEN.week,
    bufferMin: Number(r.buffer_min),
    minNoticeHours: Number(r.min_notice_hours),
    horizonDays: Number(r.horizon_days),
  }
}

export async function speichereEinstellungen(e: Einstellungen, von: string): Promise<void> {
  const q = db()
  if (!q) throw new Error("Speicher nicht verfügbar")
  await q(
    `INSERT INTO availability_settings (id, timezone, week, buffer_min, min_notice_hours, horizon_days, updated_at, updated_by)
     VALUES ('owner', $1, $2::jsonb, $3, $4, $5, now(), $6)
     ON CONFLICT (id) DO UPDATE SET timezone = EXCLUDED.timezone, week = EXCLUDED.week, buffer_min = EXCLUDED.buffer_min,
       min_notice_hours = EXCLUDED.min_notice_hours, horizon_days = EXCLUDED.horizon_days, updated_at = now(), updated_by = EXCLUDED.updated_by`,
    [e.timezone, JSON.stringify(e.week), e.bufferMin, e.minNoticeHours, e.horizonDays, von],
  )
}

export async function sperren(abIso?: string): Promise<Sperre[]> {
  const q = db()
  if (!q) return []
  const rows = await q(
    `SELECT id, kind, starts_at, ends_at, label FROM availability_blocks
      WHERE deleted_at IS NULL AND ends_at > COALESCE($1::timestamptz, now()) ORDER BY starts_at LIMIT 200`,
    [abIso ?? null],
  )
  return rows.map((r) => ({
    id: String(r.id),
    kind: r.kind as Sperre["kind"],
    startsAt: iso(r.starts_at),
    endsAt: iso(r.ends_at),
    label: (r.label as string | null) ?? null,
  }))
}

export async function legeSperreAn(s: { kind: Sperre["kind"]; start: number; end: number; label: string | null }, von: string) {
  const q = db()
  if (!q) throw new Error("Speicher nicht verfügbar")
  await q(
    `INSERT INTO availability_blocks (id, kind, starts_at, ends_at, label, created_by) VALUES ($1, $2, $3, $4, $5, $6)`,
    [`blk_${neuesToken(9)}`, s.kind, new Date(s.start).toISOString(), new Date(s.end).toISOString(), s.label, von],
  )
}

export async function entferneSperre(id: string): Promise<void> {
  const q = db()
  if (!q) throw new Error("Speicher nicht verfügbar")
  await q(`UPDATE availability_blocks SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`, [id])
}

/* ------------------------------------------------------------------------ */
/* Termine                                                                   */
/* ------------------------------------------------------------------------ */

const TERMIN_SPALTEN = `a.id, a.reference, a.status, a.meeting_kind, a.topic, a.starts_at, a.ends_at, a.guest_name, a.guest_email,
  a.guest_note, a.contact_id, c.name AS contact_name, a.calendar_state`

function alsTermin(r: Record<string, unknown>): Termin {
  return {
    id: String(r.id),
    reference: String(r.reference),
    status: String(r.status),
    meetingKind: String(r.meeting_kind),
    topic: (r.topic as string | null) ?? null,
    startsAt: iso(r.starts_at),
    endsAt: iso(r.ends_at),
    guestName: String(r.guest_name),
    guestEmail: String(r.guest_email),
    guestNote: (r.guest_note as string | null) ?? null,
    contactId: (r.contact_id as string | null) ?? null,
    contactName: (r.contact_name as string | null) ?? null,
    calendarState: String(r.calendar_state),
  }
}

export async function kommendeTermine(limit = 50): Promise<Termin[]> {
  const q = db()
  if (!q) return []
  const rows = await q(
    `SELECT ${TERMIN_SPALTEN} FROM appointments a LEFT JOIN contacts c ON c.id = a.contact_id
      WHERE a.ends_at > now() - interval '1 day' AND a.status = ANY($1) ORDER BY a.starts_at LIMIT $2`,
    [AKTIVE_STATUS as unknown as string[], limit],
  )
  return rows.map(alsTermin)
}

export async function termineFuerFeed(): Promise<Termin[]> {
  const q = db()
  if (!q) return []
  const rows = await q(
    `SELECT ${TERMIN_SPALTEN} FROM appointments a LEFT JOIN contacts c ON c.id = a.contact_id
      WHERE a.starts_at > now() - interval '60 days' ORDER BY a.starts_at LIMIT 500`,
    [],
  )
  return rows.map(alsTermin)
}

async function belegteIntervalle(q: Abfrage): Promise<{ sperren: Intervall[]; termine: Intervall[] }> {
  const [b, t] = await Promise.all([
    q(`SELECT starts_at, ends_at FROM availability_blocks WHERE deleted_at IS NULL AND ends_at > now()`, []),
    q(`SELECT starts_at, ends_at FROM appointments WHERE ends_at > now() AND status = ANY($1)`, [AKTIVE_STATUS as unknown as string[]]),
  ])
  const iv = (r: Record<string, unknown>) => ({ start: new Date(iso(r.starts_at)).getTime(), end: new Date(iso(r.ends_at)).getTime() })
  return { sperren: b.map(iv), termine: t.map(iv) }
}

/* ------------------------------------------------------------------------ */
/* Buchungslinks                                                             */
/* ------------------------------------------------------------------------ */

export async function legeBuchungslinkAn(l: {
  contactId: string | null
  organisationId: string | null
  meetingKind: Gespraechsart
  topic: string | null
  windowFrom: string | null
  windowTo: string | null
  gueltigTage: number
  von: string
}): Promise<string> {
  const q = db()
  if (!q) throw new Error("Speicher nicht verfügbar")
  const token = neuesToken()
  await q(
    `INSERT INTO booking_links (token, contact_id, organisation_id, meeting_kind, duration_min, topic, window_from, window_to, expires_at, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now() + make_interval(days => $9), $10)`,
    [token, l.contactId, l.organisationId, l.meetingKind, GESPRAECHSARTEN[l.meetingKind].dauer, l.topic, l.windowFrom, l.windowTo, l.gueltigTage, l.von],
  )
  return token
}

export type LinkPruefung = { ok: true; link: Buchungslink } | { ok: false; grund: "unbekannt" | "abgelaufen" | "benutzt" | "widerrufen" | "speicher" }

export async function pruefeBuchungslink(token: string): Promise<LinkPruefung> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return { ok: false, grund: "unbekannt" }
  const q = db()
  if (!q) return { ok: false, grund: "speicher" }
  const rows = await q(
    `SELECT token, contact_id, meeting_kind, duration_min, topic, window_from, window_to, expires_at, used_at, revoked_at
       FROM booking_links WHERE token = $1`,
    [token],
  )
  const r = rows[0]
  if (!r) return { ok: false, grund: "unbekannt" }
  const link: Buchungslink = {
    token: String(r.token),
    contactId: (r.contact_id as string | null) ?? null,
    meetingKind: (String(r.meeting_kind) in GESPRAECHSARTEN ? String(r.meeting_kind) : "kennenlernen") as Gespraechsart,
    durationMin: Number(r.duration_min),
    topic: (r.topic as string | null) ?? null,
    windowFrom: tagText(r.window_from),
    windowTo: tagText(r.window_to),
    expiresAt: iso(r.expires_at),
    usedAt: r.used_at ? iso(r.used_at) : null,
    revokedAt: r.revoked_at ? iso(r.revoked_at) : null,
  }
  if (link.revokedAt) return { ok: false, grund: "widerrufen" }
  if (link.usedAt) return { ok: false, grund: "benutzt" }
  if (new Date(link.expiresAt).getTime() < Date.now()) return { ok: false, grund: "abgelaufen" }
  return { ok: true, link }
}

export async function slotsFuerLink(link: Buchungslink, jetzt = Date.now()): Promise<number[]> {
  const q = db()
  if (!q) return []
  const [einstellungen, belegt] = await Promise.all([holeEinstellungen(), belegteIntervalle(q)])
  return freieSlots({
    einstellungen,
    dauerMin: link.durationMin,
    jetzt,
    sperren: belegt.sperren,
    termine: belegt.termine,
    vonTag: link.windowFrom,
    bisTag: link.windowTo,
  })
}

/* ------------------------------------------------------------------------ */
/* Buchung                                                                   */
/* ------------------------------------------------------------------------ */

export type BuchungsErgebnis =
  | { ok: true; termin: Termin; manageToken: string }
  | { ok: false; grund: "link" | "vergeben" | "speicher" }

function referenz(): string {
  const z = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const a = crypto.getRandomValues(new Uint8Array(6))
  return `T-${Array.from(a, (b) => z[b % z.length]).join("")}`
}

export async function bucheTermin(e: {
  token: string
  start: number
  name: string
  email: string
  note: string | null
}): Promise<BuchungsErgebnis> {
  const q = db()
  if (!q) return { ok: false, grund: "speicher" }
  const pruefung = await pruefeBuchungslink(e.token)
  if (!pruefung.ok) return { ok: false, grund: "link" }
  const link = pruefung.link

  /* Serverseitig nachrechnen: nur ein Start, den der Motor jetzt anbietet, ist buchbar. */
  const frei = await slotsFuerLink(link)
  if (!frei.includes(e.start)) return { ok: false, grund: "vergeben" }

  const einstellungen = await holeEinstellungen()
  const start = new Date(e.start)
  const ende = new Date(e.start + link.durationMin * 60_000)
  const halteEnde = new Date(ende.getTime() + einstellungen.bufferMin * 60_000)
  const id = `apt_${neuesToken(9)}`
  const manageToken = neuesToken()

  try {
    /* Ein Statement: Link verbrauchen + Termin anlegen. Scheitert das EXCLUDE, bleibt auch der Link frei. */
    const rows = await q(
      `WITH link AS (
         UPDATE booking_links SET used_at = now()
          WHERE token = $1 AND used_at IS NULL AND revoked_at IS NULL AND expires_at > now()
          RETURNING token, contact_id, organisation_id, meeting_kind, topic
       )
       INSERT INTO appointments (id, reference, booking_token, manage_token, contact_id, organisation_id, meeting_kind, topic,
         starts_at, ends_at, hold_range, timezone, status, guest_name, guest_email, guest_note, calendar_state)
       SELECT $2, $3, link.token, $4, link.contact_id, link.organisation_id, link.meeting_kind, link.topic,
         $5::timestamptz, $6::timestamptz, tstzrange($5::timestamptz, $7::timestamptz, '[)'), $8, 'booked', $9, $10, $11, 'feed_only'
         FROM link
       RETURNING id, contact_id`,
      [link.token, id, referenz(), manageToken, start.toISOString(), ende.toISOString(), halteEnde.toISOString(), einstellungen.timezone, e.name, e.email, e.note],
    )
    if (rows.length === 0) return { ok: false, grund: "link" }
    const { ereignis } = await import("@/lib/motor/ereignis")
    await ereignis("termin_gebucht", {
      kontaktId: (rows[0].contact_id as string | null) ?? null,
      subjekt: `termin:${id}`,
      daten: { start: start.toISOString() },
      schluessel: `termin_gebucht:${id}`,
    })
  } catch (error) {
    const code = (error as { code?: string }).code
    if (code === "23P01" || String((error as Error).message).includes("appointments_no_overlap")) return { ok: false, grund: "vergeben" }
    throw error
  }

  const gelesen = await q(
    `SELECT ${TERMIN_SPALTEN} FROM appointments a LEFT JOIN contacts c ON c.id = a.contact_id WHERE a.id = $1`,
    [id],
  )
  const termin = alsTermin(gelesen[0])
  await protokoll(q, termin.contactId, "termin_gebucht", `Termin gebucht · ${termin.reference}`, {
    appointmentId: termin.id,
    startsAt: termin.startsAt,
  })
  if (termin.contactId) {
    await q(
      `UPDATE contacts SET next_touch = $2, next_touch_at = ($3::timestamptz AT TIME ZONE $4)::date, updated_at = now() WHERE id = $1`,
      [termin.contactId, `Termin ${termin.reference} vorbereiten`, termin.startsAt, einstellungen.timezone],
    )
  }
  return { ok: true, termin, manageToken }
}

export async function sageTerminAb(id: string, grund: string | null, von: string): Promise<Termin | null> {
  const q = db()
  if (!q) throw new Error("Speicher nicht verfügbar")
  const rows = await q(
    `UPDATE appointments SET status = 'cancelled', cancelled_at = now(), cancel_reason = $2, updated_at = now()
      WHERE id = $1 AND status = ANY($3) RETURNING id`,
    [id, grund, AKTIVE_STATUS as unknown as string[]],
  )
  if (!rows[0]) return null
  const t = await q(`SELECT ${TERMIN_SPALTEN} FROM appointments a LEFT JOIN contacts c ON c.id = a.contact_id WHERE a.id = $1`, [id])
  const termin = alsTermin(t[0])
  await protokoll(q, termin.contactId, "termin_abgesagt", `Termin abgesagt · ${termin.reference}`, { appointmentId: id, von })
  return termin
}

/* ------------------------------------------------------------------------ */
/* Protokoll (activities)                                                    */
/* ------------------------------------------------------------------------ */

/*
 * activities kennt nur lead/contact/organisation/opportunity als Bezug.
 * Ohne Kontakt gibt es keinen Ort für den Eintrag — der Termin selbst bleibt die Quelle.
 * Ein fehlgeschlagener Protokolleintrag darf eine gültige Buchung nie scheitern lassen.
 */
async function protokoll(q: Abfrage, kontaktId: string | null, kind: string, summary: string, data: Record<string, unknown>, actor = "system") {
  if (!kontaktId) return
  try {
    await q(
      `INSERT INTO activities (id, subject_type, subject_id, kind, summary, detail, actor, origin, data, created_at)
       VALUES ($1, 'contact', $2, $3, $4, NULL, $5, 'termine', $6::jsonb, now())`,
      [`act_${neuesToken(9)}`, kontaktId, kind, summary, actor, JSON.stringify(data)],
    )
  } catch (e) {
    console.error("[termine] Protokolleintrag fehlgeschlagen:", e instanceof Error ? e.message : e)
  }
}

export async function protokolliere(kontaktId: string | null, kind: string, summary: string, data: Record<string, unknown>, actor: string) {
  const q = db()
  if (!q) return
  await protokoll(q, kontaktId, kind, summary, data, actor)
}

/* ------------------------------------------------------------------------ */
/* Kontakt für die Einladung                                                 */
/* ------------------------------------------------------------------------ */

export type EinladungsKontakt = {
  id: string
  name: string
  email: string | null
  organisationId: string | null
  firma: string | null
  gesperrt: string | null
  letzteNotiz: string | null
}

export async function einladungsKontakt(id: string): Promise<EinladungsKontakt | null> {
  const q = db()
  if (!q) return null
  const rows = await q(
    `SELECT c.id, c.name, c.email, c.organisation_id, o.name AS firma, c.excluded_reason,
            (SELECT a.summary FROM activities a WHERE a.subject_type = 'contact' AND a.subject_id = c.id AND a.kind = 'gespraech'
              ORDER BY a.created_at DESC LIMIT 1) AS letzte_notiz
       FROM contacts c LEFT JOIN organisations o ON o.id = c.organisation_id WHERE c.id = $1`,
    [id],
  )
  const r = rows[0]
  if (!r) return null
  return {
    id: String(r.id),
    name: String(r.name),
    email: (r.email as string | null) ?? null,
    organisationId: (r.organisation_id as string | null) ?? null,
    firma: (r.firma as string | null) ?? null,
    gesperrt: (r.excluded_reason as string | null) ?? null,
    letzteNotiz: (r.letzte_notiz as string | null) ?? null,
  }
}

export async function setzeNaechstenSchritt(kontaktId: string, text: string, tag: string) {
  const q = db()
  if (!q) return
  await q(
    `UPDATE contacts SET next_touch = $2, next_touch_at = $3::date, last_interaction_at = now(), updated_at = now() WHERE id = $1`,
    [kontaktId, text, tag],
  )
}
