import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * GESPRÄCHSVORBEHALT — Katman 6 (24.10.2026).
 *
 * Emin: „Ich habe Gesprächstermine, dort muss ich erst sprechen – danach
 * schicke ich das Angebot.“ Das System hat trotzdem „Angebot senden“ für CIMG
 * vorgelegt (Termin Straßburg 05./06.12.) und für NV SWISS eine Rechnung
 * vorgeschlagen (Treffen CH 02./03.11.). Die Notiz der Chance sagte es schon.
 *
 * Regel, an EINER Stelle: Solange eine Chance auf ein Gespräch wartet, entsteht
 * für sie weder Angebot noch Rechnung noch Nachfass-Mail. Sie wartet, wenn
 *   1. Emin sie ausdrücklich zurückgestellt hat (chance_vorbehalt), oder
 *   2. ihr nächster Schritt ein Gespräch/Treffen/Termin ist und noch nicht
 *      vorbei (next_action + next_action_at), oder
 *   3. ein gebuchter Termin mit der Firma/Person noch bevorsteht.
 * Das Angebot entsteht danach aus Emins Gesprächsnotiz (angebotAusGespraech).
 */

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS chance_vorbehalt (
    opportunity_id text PRIMARY KEY,
    grund text NOT NULL,
    bis date,
    created_at timestamptz NOT NULL DEFAULT now())`,
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

const GESPRAECH = /gespräch|gespraech|treffen|termin|besuch|vor-ort|vor ort|besprechen|vorstellen|präsentieren|meeting|call/i
/* 24.10.2026 (Aymarkt): „Antwort abwarten“ heißt auch warten – kein Angebot, kein Nachfassen vor dem Datum. */
const WARTEN = /abwarten|warten auf|wartet auf|rückmeldung|rueckmeldung|antwort/i

/**
 * Späteste Datumsangabe im Text („05./06.12.“, „2.11.“, „05.12.2026“). CIMG
 * 24.10.: next_action_at stand auf dem 19.11. (Telefonnummer besorgen), das
 * Treffen ist aber am 05./06.12. – ohne das lief der Vorbehalt drei Wochen zu früh ab.
 */
export function spaetestesDatumImText(text: string, jetzt = new Date()): Date | null {
  let max: Date | null = null
  for (const m of text.matchAll(/(?<![\d.])(\d{1,2})\.(?:\s*[/–-]\s*(\d{1,2})\.)?(\d{1,2})\.(\d{4})?/g)) {
    const tag = Number(m[2] ?? m[1])
    const monat = Number(m[3])
    if (!tag || tag > 31 || !monat || monat > 12) continue
    let jahr = m[4] ? Number(m[4]) : jetzt.getFullYear()
    let d = new Date(Date.UTC(jahr, monat - 1, tag, 22))
    if (!m[4] && d.getTime() < jetzt.getTime() - 60 * 864e5) d = new Date(Date.UTC(++jahr, monat - 1, tag, 22))
    if (!max || d > max) max = d
  }
  return max
}

/** Grund, warum diese Chance gerade auf ein Gespräch wartet – oder null. Fehler zählen als „wartet“ (lieber nichts vorlegen). */
export async function wartetAufGespraech(q: Abfrage, oppId: string): Promise<string | null> {
  try {
    await schema(q)
    const [r] = (await q(
      `SELECT (SELECT grund FROM chance_vorbehalt v WHERE v.opportunity_id = o.id AND (v.bis IS NULL OR v.bis >= current_date)) AS zurueck,
              o.next_action, o.next_action_at,
              (SELECT min(a.starts_at) FROM appointments a
                WHERE a.starts_at > now() AND a.cancelled_at IS NULL AND coalesce(a.status, '') NOT IN ('cancelled','abgesagt')
                  AND ((o.organisation_id IS NOT NULL AND a.organisation_id = o.organisation_id) OR (o.contact_id IS NOT NULL AND a.contact_id = o.contact_id))) AS termin
         FROM opportunities o WHERE o.id = $1`,
      [oppId],
    )) as { zurueck: string | null; next_action: string | null; next_action_at: string | Date | null; termin: string | Date | null }[]
    if (!r) return null
    if (r.zurueck) return `Zurückgestellt: ${r.zurueck}`
    const tag = (d: string | Date) => new Date(d).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })
    if (r.termin) return `Termin am ${tag(r.termin)} steht noch an`
    if (r.next_action && (GESPRAECH.test(r.next_action) || WARTEN.test(r.next_action))) {
      const bis = Math.max(r.next_action_at ? Date.parse(String(r.next_action_at)) : 0, spaetestesDatumImText(r.next_action)?.getTime() ?? 0)
      if (bis > Date.now() - 864e5) return `${GESPRAECH.test(r.next_action) ? "Erst Gespräch" : "Wartet auf Antwort"}: ${r.next_action.slice(0, 120)}`
    }
    return null
  } catch (e) {
    console.error("[vorbehalt]", oppId, e instanceof Error ? e.message : e)
    return "Vorbehalt nicht prüfbar"
  }
}

export async function stelleZurueck(q: Abfrage, oppId: string, grund: string, bis: string | null): Promise<void> {
  await schema(q)
  await q(
    `INSERT INTO chance_vorbehalt (opportunity_id, grund, bis) VALUES ($1, $2, $3::date)
     ON CONFLICT (opportunity_id) DO UPDATE SET grund = EXCLUDED.grund, bis = EXCLUDED.bis, created_at = now()`,
    [oppId, grund.slice(0, 300), bis],
  )
}

export async function hebeVorbehaltAuf(q: Abfrage, oppId: string): Promise<void> {
  await schema(q)
  await q(`DELETE FROM chance_vorbehalt WHERE opportunity_id = $1`, [oppId])
}

/**
 * Offene Karten zu wartenden Chancen ablegen (automatisch, keine Absage Emins –
 * zählt nicht als Fehler des Agenten und sperrt das Ziel nicht).
 */
export async function legeWartendeKartenAb(q: Abfrage): Promise<number> {
  const karten = (await q(
    `SELECT id, quelle, extra->>'bezug' AS bezug, extra->>'dokumentId' AS dok FROM assistent_freigaben
      WHERE status = 'offen' AND (extra->>'bezug' LIKE 'opportunity:%' OR extra ? 'dokumentId' OR quelle LIKE '%opp-%')`,
    [],
  ).catch(() => [])) as { id: string; quelle: string | null; bezug: string | null; dok: string | null }[]
  let n = 0
  for (const k of karten) {
    let opp = k.bezug?.startsWith("opportunity:") ? k.bezug.slice(12) : (k.quelle?.match(/opp-[a-z0-9-]+?(?=:\d{4}-|$)/i)?.[0] ?? null)
    if (!opp && k.dok) {
      const [d] = (await q(`SELECT opportunity_id FROM fin_dokumente WHERE id = $1`, [k.dok]).catch(() => [])) as { opportunity_id: string | null }[]
      opp = d?.opportunity_id ?? null
    }
    if (!opp) continue
    const grund = await wartetAufGespraech(q, opp)
    if (!grund) continue
    await q(
      `UPDATE assistent_freigaben SET status = 'verworfen', erledigt_at = now(),
         extra = coalesce(extra, '{}'::jsonb) || jsonb_build_object('automatisch', $2::text)
       WHERE id = $1 AND status = 'offen'`,
      [k.id, `Wartet auf Gespräch – ${grund}`],
    )
    n++
  }
  return n
}


/**
 * Karten, die VOR dem Vorbehalt entstanden sind (CIMG: Angebot um 16:00, Vorbehalt
 * live um 17:35 am 24.10.), blieben bisher offen. Täglich (Teftiş) und sofort
 * aufräumen: offene Geld-Karten einer wartenden Chance werden automatisch
 * geschlossen – mit Grund, ohne Lerneffekt (zählt nicht als Emins Absage).
 */
export async function raeumeWartendeKarten(q: Abfrage, geldAgenten: readonly string[]): Promise<{ id: string; titel: string; grund: string }[]> {
  const karten = (await q(
    `SELECT id, titel, quelle, extra->>'bezug' AS bezug, extra->>'orgId' AS org_id
       FROM assistent_freigaben
      WHERE status = 'offen' AND agent = ANY($1::text[]) AND coalesce(extra->>'nachAnnahme', '') <> 'true'`,
    [geldAgenten],
  )) as { id: string; titel: string; quelle: string | null; bezug: string | null; org_id: string | null }[]
  const zu: { id: string; titel: string; grund: string }[] = []
  for (const k of karten) {
    const grund = await karteWartet(q, { bezug: k.bezug, quelle: k.quelle, orgId: k.org_id })
    if (!grund) continue
    await q(
      `UPDATE assistent_freigaben SET status = 'verworfen', erledigt_at = now(),
              extra = coalesce(extra, '{}'::jsonb) || jsonb_build_object('automatisch', true, 'fehler', $2::text)
        WHERE id = $1 AND status = 'offen'`,
      [k.id, `Automatisch: Gesprächsvorbehalt – ${grund}`.slice(0, 300)],
    )
    zu.push({ id: k.id, titel: k.titel, grund })
  }
  return zu
}

/**
 * Zu welchen offenen Chancen gehört eine Karte? Direkt (bezug „opportunity:…“,
 * opp-Id in der Quelle) oder über Kontakt/Firma (Motor-Dankesmail an Cabir
 * Gölbaşı, 24.10.: bezug „contact:…“ – vorher ohne Prüfung durchgelassen).
 */
export async function chancenDerKarte(q: Abfrage, k: { bezug?: string | null; quelle?: string | null; orgId?: string | null }): Promise<string[]> {
  const direkt = k.bezug?.startsWith("opportunity:") ? k.bezug.slice(12) : (k.quelle?.match(/opp-[a-z0-9-]+?(?=:\d{4}-|$|:)/i)?.[0] ?? null)
  if (direkt) return [direkt]
  const kontakt = k.bezug?.startsWith("contact:") ? k.bezug.slice(8) : null
  if (!kontakt && !k.orgId) return []
  const rows = (await q(
    `SELECT o.id FROM opportunities o
      WHERE o.status NOT IN ('won','lost')
        AND (($1::text IS NOT NULL AND (o.contact_id = $1 OR o.organisation_id = (SELECT organisation_id FROM contacts WHERE id = $1)))
             OR ($2::text IS NOT NULL AND o.organisation_id = $2))`,
    [kontakt, k.orgId ?? null],
  ).catch(() => [])) as { id: string }[]
  return rows.map((r) => r.id)
}

/** Erster Grund, aus dem eine der Chancen der Karte noch wartet – oder null. */
export async function karteWartet(q: Abfrage, k: { bezug?: string | null; quelle?: string | null; orgId?: string | null }): Promise<string | null> {
  for (const opp of await chancenDerKarte(q, k)) {
    const grund = await wartetAufGespraech(q, opp)
    if (grund) return grund
  }
  return null
}
