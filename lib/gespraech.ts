import { randomUUID } from "node:crypto"

import { neonClient } from "@/lib/neon-client"

/**
 * Der Gesprächsraum — Stufe A der „Zentrale“.
 *
 * Bewusst kein eigenes Schema: Ein Gespräch ist eine Chronikzeile
 * (`activities`, kind `gespraech`) am Kontakt. Damit steht es ohne Umweg in
 * der Kundenakte unter Vertrieb › Beziehungen, und es gibt keine zweite
 * Wahrheit über „wann haben wir zuletzt gesprochen“.
 */

export const INTERESSEN = [
  "webseite",
  "sichtbarkeit",
  "anfragen",
  "automatisierung",
  "plattform",
  "barrierefreiheit",
  "betriebscheck",
] as const
export type Interesse = (typeof INTERESSEN)[number]

export const ABSCHNITTE = ["ausgangslage", "bedarf", "rahmen", "einwaende", "notiz"] as const
export type Abschnitt = (typeof ABSCHNITTE)[number]

export type GespraechKontakt = {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string | null
  organisation: string | null
  lastInteractionAt: string | null
  nextTouch: string | null
  nextTouchAt: string | null
}

export type GespraechEintrag = {
  id: string
  contactId: string
  contactName: string | null
  summary: string
  detail: string | null
  dauerSek: number | null
  interessen: Interesse[]
  createdAt: string
}

const OHNE_MAIL = "@ohne-mail.invalid"

function client() {
  const art = process.env.LEAD_STORE?.trim()
  const url = process.env.DATABASE_URL?.trim()
  if ((art !== "neon" && art !== "pg-lokal") || !url) return null
  try {
    return neonClient(url)
  } catch {
    return null
  }
}

export function gespraechVerfuegbar(): boolean {
  return client() !== null
}

type KontaktZeile = {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string | null
  organisation: string | null
  last_interaction_at: string | Date | null
  next_touch: string | null
  next_touch_at: string | Date | null
}

function iso(wert: string | Date | null): string | null {
  if (wert === null) return null
  return wert instanceof Date ? wert.toISOString() : String(wert)
}

function datum(wert: string | Date | null): string | null {
  if (wert === null) return null
  if (wert instanceof Date) return wert.toISOString().slice(0, 10)
  return String(wert).slice(0, 10)
}

function alsKontakt(z: KontaktZeile): GespraechKontakt {
  return {
    id: z.id,
    name: z.name,
    email: !z.email || z.email.endsWith(OHNE_MAIL) ? null : z.email,
    phone: z.phone,
    role: z.role,
    organisation: z.organisation,
    lastInteractionAt: iso(z.last_interaction_at),
    nextTouch: z.next_touch,
    nextTouchAt: datum(z.next_touch_at),
  }
}

const KONTAKT_SPALTEN = `c.id, c.name, c.email, c.phone, c.role, o.name AS organisation,
  c.last_interaction_at, c.next_touch, c.next_touch_at`

export async function sucheKontakte(suche: string | null, limit = 40): Promise<GespraechKontakt[]> {
  const c = client()
  if (!c) return []
  await c.ready()
  const q = suche?.trim() ? `%${suche.trim().replace(/[%_]/g, "")}%` : null
  const rows = (await c.sql.query(
    `SELECT ${KONTAKT_SPALTEN}
       FROM contacts c LEFT JOIN organisations o ON o.id = c.organisation_id
      WHERE $1::text IS NULL
         OR c.name ILIKE $1 OR c.email ILIKE $1 OR coalesce(c.phone,'') ILIKE $1
         OR coalesce(o.name,'') ILIKE $1
      ORDER BY c.last_interaction_at DESC NULLS LAST, c.updated_at DESC
      LIMIT $2`,
    [q, limit],
  )) as KontaktZeile[]
  return rows.map(alsKontakt)
}

export async function holeKontakt(id: string): Promise<GespraechKontakt | null> {
  const c = client()
  if (!c) return null
  await c.ready()
  const rows = (await c.sql.query(
    `SELECT ${KONTAKT_SPALTEN}
       FROM contacts c LEFT JOIN organisations o ON o.id = c.organisation_id
      WHERE c.id = $1`,
    [id],
  )) as KontaktZeile[]
  return rows[0] ? alsKontakt(rows[0]) : null
}

type EintragZeile = {
  id: string
  subject_id: string
  contact_name: string | null
  summary: string
  detail: string | null
  data: { dauerSek?: number; interessen?: string[] } | null
  created_at: string | Date
}

function alsEintrag(z: EintragZeile): GespraechEintrag {
  const interessen = (z.data?.interessen ?? []).filter((i): i is Interesse =>
    (INTERESSEN as readonly string[]).includes(i),
  )
  return {
    id: z.id,
    contactId: z.subject_id,
    contactName: z.contact_name,
    summary: z.summary,
    detail: z.detail,
    dauerSek: typeof z.data?.dauerSek === "number" ? z.data.dauerSek : null,
    interessen,
    createdAt: iso(z.created_at) ?? "",
  }
}

export async function gespraeche(kontaktId: string | null, limit = 12): Promise<GespraechEintrag[]> {
  const c = client()
  if (!c) return []
  await c.ready()
  const rows = (await c.sql.query(
    `SELECT a.id, a.subject_id, c.name AS contact_name, a.summary, a.detail, a.data, a.created_at
       FROM activities a LEFT JOIN contacts c ON c.id = a.subject_id
      WHERE a.subject_type = 'contact' AND a.kind = 'gespraech'
        AND ($1::text IS NULL OR a.subject_id = $1)
      ORDER BY a.created_at DESC
      LIMIT $2`,
    [kontaktId, limit],
  )) as EintragZeile[]
  return rows.map(alsEintrag)
}

export async function legeKontaktAn(input: {
  name: string
  phone: string | null
  email: string | null
  firma: string | null
}): Promise<string | null> {
  const c = client()
  if (!c) return null
  await c.ready()
  const id = randomUUID()

  let organisationId: string | null = null
  if (input.firma) {
    const org = (await c.sql.query(
      `INSERT INTO organisations (id, name, created_at, updated_at)
       VALUES ($1, $2, now(), now())
       ON CONFLICT ((lower(name))) DO UPDATE SET updated_at = organisations.updated_at
       RETURNING id`,
      [randomUUID(), input.firma],
    )) as { id: string }[]
    organisationId = org[0]?.id ?? null
  }

  if (input.email) {
    const vorhanden = (await c.sql.query(`SELECT id FROM contacts WHERE email_normalised = $1`, [
      input.email.toLowerCase(),
    ])) as { id: string }[]
    if (vorhanden[0]) return vorhanden[0].id
  }

  const email = input.email ?? `${id}${OHNE_MAIL}`
  await c.sql.query(
    `INSERT INTO contacts (id, organisation_id, name, email, email_normalised, phone, relationship, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'bekannt', now(), now())`,
    [id, organisationId, input.name, email, email.toLowerCase(), input.phone],
  )
  return id
}

export type GespraechSpeichern = {
  kontaktId: string
  dauerSek: number
  abschnitte: Partial<Record<Abschnitt, string>>
  interessen: Interesse[]
  folge: string | null
  folgeAm: string | null
  folgeUm: string | null
}

const UEBERSCHRIFT: Record<Abschnitt, string> = {
  ausgangslage: "Ausgangslage",
  bedarf: "Ziele & Bedarf",
  rahmen: "Budget & Zeitrahmen",
  einwaende: "Einwände & Fragen",
  notiz: "Notizen",
}

export async function speichereGespraech(
  input: GespraechSpeichern,
  akteur: string,
): Promise<{ id: string } | null> {
  const c = client()
  if (!c) return null
  await c.ready()

  const minuten = Math.max(1, Math.round(input.dauerSek / 60))
  const kern =
    input.folge ??
    input.abschnitte.bedarf ??
    input.abschnitte.ausgangslage ??
    input.abschnitte.notiz ??
    "ohne Notiz"
  const ersteZeile = kern.split("\n")[0].trim()
  const summary = `Gespräch · ${minuten} Min · ${ersteZeile.length > 110 ? `${ersteZeile.slice(0, 110)}…` : ersteZeile}`

  const detail =
    ABSCHNITTE.filter((a) => input.abschnitte[a])
      .map((a) => `${UEBERSCHRIFT[a]}\n${input.abschnitte[a]}`)
      .join("\n\n") || null

  const id = randomUUID()
  await c.sql.query(
    `INSERT INTO activities (id, subject_type, subject_id, kind, summary, detail, actor, origin, data, created_at)
     VALUES ($1, 'contact', $2, 'gespraech', $3, $4, $5, 'HUMAN', $6::jsonb, now())`,
    [
      id,
      input.kontaktId,
      summary,
      detail,
      akteur,
      JSON.stringify({
        dauerSek: input.dauerSek,
        interessen: input.interessen,
        abschnitte: input.abschnitte,
        folge: input.folge,
        folgeAm: input.folgeAm,
        folgeUm: input.folgeUm,
      }),
    ],
  )

  await c.sql.query(
    `UPDATE contacts
        SET last_interaction_at = now(), updated_at = now(),
            next_touch = CASE WHEN $2::text IS NULL THEN next_touch ELSE $2 END,
            next_touch_at = CASE WHEN $2::text IS NULL THEN next_touch_at ELSE $3::date END
      WHERE id = $1`,
    [input.kontaktId, input.folge, input.folgeAm],
  )

  const { ereignis } = await import("@/lib/motor/ereignis")
  await ereignis("gespraech_notiert", {
    kontaktId: input.kontaktId,
    daten: { folge: input.folge, folgeAm: input.folgeAm, interessen: input.interessen },
    schluessel: `gespraech:${id}`,
  })

  return { id }
}
