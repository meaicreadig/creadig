import "server-only"

import { neonAbfrage } from "@/lib/neon-abfrage"
import { geschaeftsTag, plusTage } from "@/lib/geschaeftszeit"
import { schreibeTerminmail } from "@/lib/termine/ki-mail"
import { mailLayout, sendeMail, siteUrl } from "@/lib/termine/mail"
import { GESPRAECHSARTEN, neuesToken, protokolliere, setzeNaechstenSchritt, type Gespraechsart } from "@/lib/termine/store"

/**
 * Nachfass-Motor: Für jeden Terminlink, der seit 3 Tagen unbenutzt ist,
 * schreibt die KI einmal einen Nachfass-Entwurf. Er liegt als Aktivität
 * `nachfass_entwurf` am Kontakt (data.status = offen | gesendet | verworfen)
 * und wird nie ohne Klick gesendet. Ein Link bekommt höchstens einen Entwurf.
 */

const MAX_JE_LAUF = 3

export async function bereiteNachfassVor(): Promise<number> {
  const q = neonAbfrage()
  if (!q) return 0
  const faellig = await q(
    `SELECT b.token, b.contact_id, b.meeting_kind, extract(day FROM now() - b.created_at)::int AS tage
       FROM booking_links b
       JOIN contacts c ON c.id = b.contact_id
      WHERE b.used_at IS NULL AND b.revoked_at IS NULL AND b.expires_at > now()
        AND b.created_at < now() - interval '3 days'
        AND c.email IS NOT NULL AND c.excluded_reason IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM activities a
           WHERE a.subject_type = 'contact' AND a.subject_id = b.contact_id
             AND a.kind = 'nachfass_entwurf' AND a.data->>'token' = b.token)
      ORDER BY b.created_at LIMIT ${MAX_JE_LAUF}`,
    [],
  )

  let fertig = 0
  for (const f of faellig) {
    const kontaktId = String(f.contact_id)
    const token = String(f.token)
    const entwurf = await schreibeTerminmail({ kontaktId, art: String(f.meeting_kind), zweck: "nachfass", gesendetVorTagen: Number(f.tage) })
    if ("fehler" in entwurf) continue
    await q(
      `INSERT INTO activities (id, subject_type, subject_id, kind, summary, detail, actor, origin, data, created_at)
       SELECT $1, 'contact', $2, 'nachfass_entwurf', $3, NULL, 'ki', 'termine', $4::jsonb, now()
        WHERE NOT EXISTS (SELECT 1 FROM activities WHERE kind = 'nachfass_entwurf' AND subject_id = $2 AND data->>'token' = $5)`,
      [`act_${neuesToken(9)}`, kontaktId, "Nachfassmail vorbereitet", JSON.stringify({ token, status: "offen", betreff: entwurf.betreff, text: entwurf.text }), token],
    )
    fertig++
  }
  return fertig
}

export type NachfassEntwurf = { id: string; kontaktId: string; token: string; betreff: string; text: string }

export async function holeNachfassEntwurf(id: string): Promise<NachfassEntwurf | null> {
  const q = neonAbfrage()
  if (!q) return null
  const r = await q(
    `SELECT id, subject_id, data FROM activities WHERE id = $1 AND kind = 'nachfass_entwurf' AND data->>'status' = 'offen'`,
    [id.slice(0, 40)],
  )
  if (!r[0]) return null
  const d = r[0].data as Record<string, string>
  return { id: String(r[0].id), kontaktId: String(r[0].subject_id), token: d.token, betreff: d.betreff, text: d.text }
}

async function setzeStatus(id: string, status: "gesendet" | "verworfen") {
  const q = neonAbfrage()
  if (!q) return
  await q(`UPDATE activities SET data = data || jsonb_build_object('status', $2::text, 'am', now()) WHERE id = $1`, [id, status])
}

export type NachfassErgebnis = { ok: true; meldung: string } | { ok: false; meldung: string }

export async function sendeNachfass(id: string, von: string): Promise<NachfassErgebnis> {
  const q = neonAbfrage()
  if (!q) return { ok: false, meldung: "Speicher nicht verfügbar." }
  const e = await holeNachfassEntwurf(id)
  if (!e) return { ok: false, meldung: "Entwurf nicht mehr offen." }

  const r = await q(
    `SELECT c.name, c.email, c.excluded_reason, b.meeting_kind, b.used_at, b.revoked_at, b.expires_at > now() + interval '2 days' AS gueltig
       FROM contacts c JOIN booking_links b ON b.token = $2 WHERE c.id = $1`,
    [e.kontaktId, e.token],
  )
  const k = r[0]
  if (!k) return { ok: false, meldung: "Kontakt oder Link fehlt." }
  if (k.excluded_reason) return { ok: false, meldung: `Kontakt ist gesperrt (${k.excluded_reason}).` }
  if (!k.email) return { ok: false, meldung: "Kontakt hat keine E-Mail-Adresse." }
  if (k.used_at) {
    await setzeStatus(id, "verworfen")
    return { ok: false, meldung: "Termin wurde inzwischen gebucht. Entwurf verworfen." }
  }

  let token = e.token
  if (k.revoked_at || !k.gueltig) {
    token = neuesToken()
    await q(
      `INSERT INTO booking_links (token, contact_id, organisation_id, meeting_kind, duration_min, topic, window_from, window_to, expires_at, created_by)
       SELECT $1, contact_id, organisation_id, meeting_kind, duration_min, topic, NULL, NULL, now() + interval '10 days', $3
         FROM booking_links WHERE token = $2`,
      [token, e.token, von],
    )
    await q(`UPDATE booking_links SET revoked_at = now() WHERE token = $1 AND revoked_at IS NULL`, [e.token])
  }

  const link = `${siteUrl()}/termin/buchen/${token}`
  const fertig = e.text.replace("{link}", link)
  const versand = await sendeMail({
    to: String(k.email),
    subject: e.betreff,
    text: fertig,
    html: mailLayout({
      vorschau: e.betreff,
      titel: e.betreff,
      absaetze: fertig.split(/\n{2,}/).map((p) => p.replace(link, "").trim()).filter(Boolean),
      knopf: { text: "Termin wählen", href: link },
    }),
  })
  if (!versand.ok) return { ok: false, meldung: versand.grund === "nicht_eingerichtet" ? "Mailversand ist nicht eingerichtet." : "Versand fehlgeschlagen." }

  await setzeStatus(id, "gesendet")
  const art = GESPRAECHSARTEN[String(k.meeting_kind) as Gespraechsart]?.label ?? "Termin"
  await protokolliere(e.kontaktId, "nachfassmail", `Nachfassmail gesendet · ${art}`, { token: token.slice(0, 6) }, von)
  await setzeNaechstenSchritt(e.kontaktId, "Nach Nachfassmail: anrufen, falls keine Buchung", plusTage(geschaeftsTag(), 4))
  return { ok: true, meldung: `Nachfassmail an ${String(k.name)} gesendet.` }
}

export async function verwirfNachfass(id: string): Promise<void> {
  await setzeStatus(id.slice(0, 40), "verworfen")
}
