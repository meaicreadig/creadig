import "server-only"

import { randomUUID } from "node:crypto"

import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * Der Kundenfaden: EINE Stelle, die Firmen und Kontakte erkennt oder anlegt
 * und jede Berührung (Mail, Gespräch, Termin) in `activities` schreibt.
 * Alle Seiten (Kunden, Verkaufen, Gesprächsraum, Assistent) lesen daraus.
 */

const FREEMAIL = new Set([
  "gmail.com", "googlemail.com", "web.de", "gmx.de", "gmx.net", "gmx.at", "gmx.ch", "t-online.de",
  "outlook.com", "outlook.de", "hotmail.com", "hotmail.de", "live.com", "live.de", "yahoo.com", "yahoo.de",
  "icloud.com", "me.com", "aol.com", "aol.de", "freenet.de", "posteo.de", "mail.de", "proton.me", "protonmail.com",
])

const RECHTSFORM = /\b(gmbh|ug|ag|kg|ohg|gbr|e\s?\.?\s?v|mbh|co|haftungsbeschränkt|&|und|inh|inhaber)\b/g

/** "ViSec GmbH Sicherheitstechnik" und "vi-sec" ergeben denselben Schlüssel-Anfang. */
export function namensSchluessel(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(RECHTSFORM, " ")
    .replace(/[^a-z0-9]/g, "")
}

/** Host ohne www aus Webseite oder Mail-Adresse; Freemail-Domains zählen nicht als Firma. */
export function domainAus(wert: string | null | undefined): string | null {
  if (!wert) return null
  const roh = wert.trim().toLowerCase()
  const host = roh.includes("@") && !roh.includes("/")
    ? roh.split("@")[1]
    : roh.replace(/^https?:\/\//, "").split(/[/?#]/)[0]
  const d = host?.replace(/^www\./, "").replace(/\.$/, "")
  if (!d || !d.includes(".") || FREEMAIL.has(d)) return null
  return d
}

type Firma = { id: string; name: string }

/**
 * Sucht eine bestehende Firma: zuerst über die Domain (Webseite oder Mail eines
 * Kontakts), dann über den bereinigten Namen. Gibt null zurück, wenn es sie nicht gibt.
 */
export async function findeFirma(
  q: Abfrage,
  hinweis: { name?: string | null; website?: string | null; email?: string | null },
): Promise<Firma | null> {
  const domain = domainAus(hinweis.website) ?? domainAus(hinweis.email)
  if (domain) {
    const treffer = (await q(
      `SELECT o.id, o.name FROM organisations o
       WHERE regexp_replace(regexp_replace(lower(coalesce(o.website, '')), '^https?://(www\\.)?', ''), '[/?#].*$', '') = $1
          OR EXISTS (SELECT 1 FROM contacts c WHERE c.organisation_id = o.id AND split_part(c.email_normalised, '@', 2) = $1)
       ORDER BY o.created_at LIMIT 1`,
      [domain],
    )) as Firma[]
    if (treffer[0]) return treffer[0]
  }
  const schluessel = hinweis.name ? namensSchluessel(hinweis.name) : ""
  const domainKern = domain ? namensSchluessel(domain.split(".").slice(-2, -1)[0] ?? "") : ""
  const kandidaten = [schluessel, domainKern].filter((s) => s.length >= 4)
  if (kandidaten.length === 0) return null
  const alle = (await q(`SELECT id, name FROM organisations`, [])) as Firma[]
  for (const k of kandidaten) {
    const f = alle.find((o) => {
      const s = namensSchluessel(o.name)
      return s === k || (s.length >= 4 && (s.startsWith(k) || k.startsWith(s)))
    })
    if (f) return f
  }
  return null
}

/** Firma finden oder neu anlegen – nie ein zweites Mal dieselbe Firma. */
export async function findeOderLegeFirma(
  q: Abfrage,
  daten: { name: string; website?: string | null; city?: string | null; note?: string | null },
): Promise<{ id: string; neu: boolean; name: string }> {
  const website = daten.website && !/^https?:\/\//i.test(daten.website) ? `https://${daten.website}` : daten.website ?? null
  const vorhanden = await findeFirma(q, { name: daten.name, website })
  if (vorhanden) {
    await q(
      `UPDATE organisations SET website = coalesce(website, $2), city = coalesce(city, $3), updated_at = now() WHERE id = $1`,
      [vorhanden.id, website, daten.city ?? null],
    )
    return { ...vorhanden, neu: false }
  }
  const id = `org-${randomUUID().slice(0, 8)}`
  const r = (await q(
    `INSERT INTO organisations (id, name, website, city, note, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, now(), now())
     ON CONFLICT ((lower(name))) DO UPDATE SET website = coalesce(organisations.website, EXCLUDED.website), updated_at = now()
     RETURNING id, name, (xmax = 0) AS neu`,
    [id, daten.name, website, daten.city ?? null, daten.note ?? null],
  )) as { id: string; name: string; neu: boolean }[]
  return r[0]
}

/** Kontakt zur Mail-Adresse finden oder anlegen; Firma wird über die Domain erkannt. */
export async function findeOderLegeKontakt(
  q: Abfrage,
  daten: { email: string; name?: string | null; firma?: string | null; website?: string | null },
): Promise<{ kontaktId: string; firmaId: string | null }> {
  const email = daten.email.trim().toLowerCase()
  const da = (await q(`SELECT id, organisation_id FROM contacts WHERE email_normalised = $1 LIMIT 1`, [email])) as {
    id: string
    organisation_id: string | null
  }[]
  let firmaId = da[0]?.organisation_id ?? null
  if (!firmaId) {
    const gefunden = await findeFirma(q, { name: daten.firma, website: daten.website, email })
    firmaId = gefunden?.id ?? (daten.firma ? (await findeOderLegeFirma(q, { name: daten.firma, website: daten.website ?? null })).id : null)
  }
  if (da[0]) {
    if (!da[0].organisation_id && firmaId) {
      await q(`UPDATE contacts SET organisation_id = $2, updated_at = now() WHERE id = $1`, [da[0].id, firmaId])
    }
    return { kontaktId: da[0].id, firmaId }
  }
  const id = randomUUID()
  const name = daten.name?.trim() || email.split("@")[0]
  await q(
    `INSERT INTO contacts (id, organisation_id, name, email, email_normalised, relationship, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $4, 'unbekannt', now(), now())
     ON CONFLICT DO NOTHING`,
    [id, firmaId, name, email],
  )
  const neu = (await q(`SELECT id FROM contacts WHERE email_normalised = $1 LIMIT 1`, [email])) as { id: string }[]
  return { kontaktId: neu[0]?.id ?? id, firmaId }
}

/**
 * Gesendete Mail in den Faden schreiben: Kontakt + Firma sicherstellen,
 * Aktivität am Kontakt, Verkaufschance aktualisieren (oder für Erstkontakt anlegen).
 */
export async function notiereGesendeteMail(
  q: Abfrage,
  m: {
    an: string
    betreff: string
    text: string
    quelleId: string
    agent: string | null
    firma?: string | null
    website?: string | null
    stufe?: number
  },
): Promise<void> {
  const { kontaktId, firmaId } = await findeOderLegeKontakt(q, { email: m.an, firma: m.firma, website: m.website })
  const nachfass = (m.stufe ?? 0) > 0
  // Am Kontakt (Gesprächsraum) und an der Firma (Kundenkarte) – beide Seiten lesen nur ihren eigenen Verlauf.
  const ziele: [string, string][] = [["contact", kontaktId]]
  if (firmaId) ziele.push(["organisation", firmaId])
  for (const [typ, ziel] of ziele) {
    await q(
      `INSERT INTO activities (id, subject_type, subject_id, kind, summary, detail, actor, origin, data, created_at)
       SELECT $1, $9, $2, 'mail.gesendet', $3, $4, $5, $6, $7::jsonb, now()
       WHERE NOT EXISTS (SELECT 1 FROM activities WHERE kind = 'mail.gesendet' AND subject_type = $9 AND data->>'quelleId' = $8)`,
      [
        randomUUID(),
        ziel,
        `${nachfass ? `${m.stufe}. Nachfassen` : "Mail"} · ${m.betreff}`.slice(0, 200),
        m.text.slice(0, 4000),
        m.agent ?? "admin",
        m.agent && m.agent !== "studio" ? "AGENT" : "HUMAN",
        JSON.stringify({ quelleId: m.quelleId, an: m.an, agent: m.agent, stufe: m.stufe ?? 0 }),
        m.quelleId,
        typ,
      ],
    )
  }
  if (!firmaId) return
  const offen = (await q(
    `UPDATE opportunities SET last_contact_at = now(), updated_at = now(),
            status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END,
            contact_id = coalesce(contact_id, $2)
     WHERE organisation_id = $1 AND status IN ('new','contacted','qualified','discovery','audit','proposal','negotiation')
     RETURNING id`,
    [firmaId, kontaktId],
  )) as { id: string }[]
  if (offen.length === 0 && !nachfass && m.agent === "jaeger") {
    await q(
      `INSERT INTO opportunities (id, organisation_id, contact_id, title, status, source, next_action, next_action_at,
                                  last_contact_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'contacted', 'jaeger', 'Antwort abwarten, sonst Nachfassen', (now() + interval '5 days')::date, now(), now(), now())`,
      [`opp-${randomUUID()}`, firmaId, kontaktId, `Erstkontakt: ${m.betreff}`.slice(0, 160)],
    )
  }
}

/** Antwort erhalten: am Kontakt protokollieren und Chance auf "qualifiziert" heben. */
export async function notiereAntwort(q: Abfrage, an: string, betreff: string | null): Promise<void> {
  const k = (await q(`SELECT id, organisation_id FROM contacts WHERE email_normalised = $1 LIMIT 1`, [an.trim().toLowerCase()])) as {
    id: string
    organisation_id: string | null
  }[]
  if (!k[0]) return
  await q(
    `INSERT INTO activities (id, subject_type, subject_id, kind, summary, actor, origin, data, created_at)
     VALUES ($1, 'contact', $2, 'mail.antwort', $3, 'admin', 'HUMAN', '{}'::jsonb, now())`,
    [randomUUID(), k[0].id, `Antwort erhalten${betreff ? ` · ${betreff}` : ""}`.slice(0, 200)],
  )
  if (k[0].organisation_id) {
    await q(
      `INSERT INTO activities (id, subject_type, subject_id, kind, summary, actor, origin, data, created_at)
       VALUES ($1, 'organisation', $2, 'mail.antwort', $3, 'admin', 'HUMAN', '{}'::jsonb, now())`,
      [randomUUID(), k[0].organisation_id, `Antwort erhalten${betreff ? ` · ${betreff}` : ""}`.slice(0, 200)],
    )
    await q(
      `UPDATE opportunities SET status = CASE WHEN status IN ('new','contacted') THEN 'qualified' ELSE status END,
              last_contact_at = now(), updated_at = now(), next_action = 'Termin vereinbaren'
       WHERE organisation_id = $1 AND status IN ('new','contacted','qualified','discovery','audit','proposal','negotiation')`,
      [k[0].organisation_id],
    )
  }
}
