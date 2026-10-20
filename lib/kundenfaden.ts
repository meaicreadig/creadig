import "server-only"

import { randomUUID } from "node:crypto"

import type { Abfrage } from "@/lib/neon-abfrage"
import { legeEntwurfAusGewinn } from "@/lib/finanz/auftraege/aus-vertrieb"

/**
 * Der Kundenfaden: EINE Stelle, die Firmen und Kontakte erkennt oder anlegt
 * und jede Berührung (Mail, Gespräch, Termin) in `activities` schreibt.
 * Alle Seiten (Kunden, Verkaufen, Gesprächsraum, Assistent) lesen daraus.
 *
 * WER SCHREIBT WAS (Netzwerk-Durchlauf, Phase 4b — bewusst NICHT zu einer
 * Datei verschmolzen, `lib/vertrieb-store-neon.ts` hat dafür zu viele Aufrufstellen):
 *  · Stufenwechsel einer Chance: `protokolliereStufe()` HIER schreibt `deal.stufe`
 *    (+ eine `opportunity.*`-Zeile an der Chance). `moveOpportunity` im Vertriebs-Store
 *    ruft dieselbe Funktion auf, schreibt seine `opportunity.*`-Zeile aber selbst.
 *  · Angebot angenommen (`acceptOffer`), Projekt, Abnahme, Übergabe: nur der
 *    Vertriebs-Store (`offer.*`, `project.*`) — das sind keine Stufenwechsel des Fadens.
 *  · Mail/Gespräch/Termin-Berührungen: nur HIER.
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

/* ------------------------------------------------------------------------ */
/* Stufen-Motor: Ereignisse schieben Chancen vor – nie zurück.               */
/* ------------------------------------------------------------------------ */

const STUFEN_REIHE = ["new", "contacted", "qualified", "discovery", "audit", "proposal", "negotiation"] as const
type Stufe = (typeof STUFEN_REIHE)[number]
const rang = (s: string) => STUFEN_REIHE.indexOf(s as Stufe)

/** Vorheriger Stand einer Chance – reicht, um eine Änderung exakt zurückzunehmen. */
export type ChancenStand = { id: string; status: string; nachStatus: string; next_action: string | null; next_action_at: string | null }

export async function firmaVonKontakt(q: Abfrage, kontaktId: string | null): Promise<string | null> {
  if (!kontaktId) return null
  const r = (await q(`SELECT organisation_id FROM contacts WHERE id = $1`, [kontaktId])) as { organisation_id: string | null }[]
  return r[0]?.organisation_id ?? null
}

/**
 * Hebt alle offenen Chancen der Firma mindestens auf `ziel`, setzt optional den
 * nächsten Schritt und protokolliert jede Stufenänderung als `deal.stufe`.
 * Gibt es noch keine Chance und ist `anlegen` gesetzt, entsteht eine.
 */
export async function rueckeChanceVor(
  q: Abfrage,
  e: {
    firmaId: string | null
    kontaktId?: string | null
    ziel: Stufe
    grund: string
    quelleId?: string
    schritt?: string | null
    schrittAm?: string | null
    anlegen?: string | null
  },
): Promise<ChancenStand[]> {
  if (!e.firmaId) return []
  const offen = (await q(
    `SELECT id, status, next_action, next_action_at::text AS next_action_at FROM opportunities
     WHERE organisation_id = $1 AND status = ANY($2::text[])`,
    [e.firmaId, STUFEN_REIHE as unknown as string[]],
  )) as { id: string; status: string; next_action: string | null; next_action_at: string | null }[]

  if (offen.length === 0) {
    if (!e.anlegen) return []
    const id = `opp-${randomUUID()}`
    await q(
      `INSERT INTO opportunities (id, organisation_id, contact_id, title, status, source, next_action, next_action_at,
                                  last_contact_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'faden', $6, $7::date, now(), now(), now())`,
      [id, e.firmaId, e.kontaktId ?? null, e.anlegen.slice(0, 160), e.ziel, e.schritt ?? null, e.schrittAm ?? null],
    )
    await protokolliereStufe(q, e.firmaId, id, null, e.ziel, e.grund, e.quelleId)
    return [{ id, status: "neu-angelegt", nachStatus: e.ziel, next_action: null, next_action_at: null }]
  }

  const staende: ChancenStand[] = []
  for (const o of offen) {
    const nach = rang(o.status) < rang(e.ziel) ? e.ziel : o.status
    await q(
      `UPDATE opportunities SET status = $2, last_contact_at = now(), updated_at = now(),
              contact_id = coalesce(contact_id, $3),
              next_action = coalesce($4, next_action), next_action_at = CASE WHEN $4::text IS NULL THEN next_action_at ELSE $5::date END
       WHERE id = $1`,
      [o.id, nach, e.kontaktId ?? null, e.schritt ?? null, e.schrittAm ?? null],
    )
    if (nach !== o.status) await protokolliereStufe(q, e.firmaId, o.id, o.status, nach, e.grund, e.quelleId)
    staende.push({ ...o, nachStatus: nach })
  }
  return staende
}

/**
 * Die EINE Zeile, die „warum steht der Deal hier / rückgängig" trägt. Auch die
 * Pipeline (`moveOpportunity` in lib/vertrieb-store-neon.ts) schreibt sie —
 * früher stand dort nur `opportunity.<status>`, und eine Stufenänderung auf
 * /admin/vertrieb/pipeline war auf /admin/verkaufen unsichtbar.
 * `von` Hand = Herkunft MANUAL (so liest ladeStufenSchritte „vonHand").
 */
export async function protokolliereStufe(
  q: Abfrage,
  firmaId: string | null,
  oppId: string,
  von: string | null,
  nach: string,
  grund: string,
  quelleId?: string,
  wer: { actor: string; origin: "AUTOMATIC" | "MANUAL" } = { actor: "system", origin: "AUTOMATIC" },
  /** false, wenn der Aufrufer die Chronik des Vorgangs selbst schreibt (moveOpportunity). */
  chronikAmVorgang = true,
) {
  await q(
    `INSERT INTO activities (id, subject_type, subject_id, kind, summary, actor, origin, data, created_at)
     VALUES ($1, $2, $3, 'deal.stufe', $4, $5, $6, $7::jsonb, now())`,
    [
      randomUUID(),
      firmaId ? "organisation" : "opportunity",
      firmaId ?? oppId,
      `Stufe → ${nach} · ${grund}`.slice(0, 200),
      wer.actor,
      wer.origin,
      JSON.stringify({ oppId, von, nach, grund, quelleId: quelleId ?? null }),
    ],
  )
  /* Umgekehrt: eine Stufe, die hier gesetzt wird, steht auch in der Chronik des Vorgangs auf /admin/vertrieb/pipeline/:id. */
  if (chronikAmVorgang && firmaId) {
    await q(
      `INSERT INTO activities (id, subject_type, subject_id, kind, summary, detail, actor, origin, data, created_at)
       VALUES ($1, 'opportunity', $2, $3, $4, $5, $6, $7, $8::jsonb, now())`,
      [
        randomUUID(),
        oppId,
        nach === "won" || nach === "lost" ? `opportunity.${nach}` : "opportunity.status",
        `Status → ${nach}`,
        grund.slice(0, 200),
        wer.actor,
        wer.origin,
        JSON.stringify({ von, nach }),
      ],
    )
  }
}

const ALLE_STUFEN = [...(STUFEN_REIHE as unknown as string[]), "won", "lost"]

/** Stufe von Hand setzen (auch zurück, gewonnen, verloren) – mit Protokoll, damit sie rücknehmbar bleibt. */
export async function setzeStufeVonHand(q: Abfrage, oppId: string, nach: string): Promise<boolean> {
  if (!ALLE_STUFEN.includes(nach)) return false
  const r = (await q(`SELECT status, organisation_id FROM opportunities WHERE id = $1`, [oppId])) as {
    status: string
    organisation_id: string | null
  }[]
  const alt = r[0]
  if (!alt || alt.status === nach || !alt.organisation_id) return false
  await q(`UPDATE opportunities SET status = $2, updated_at = now() WHERE id = $1`, [oppId, nach])
  await protokolliereStufe(q, alt.organisation_id, oppId, alt.status, nach, "von Hand", undefined, { actor: "emin", origin: "MANUAL" })
  /* Gewonnen heißt hier dasselbe wie in der Pipeline: ein Angebots-ENTWURF in Finanz (nie Versand). */
  if (nach === "won") {
    try {
      const entwurf = await legeEntwurfAusGewinn(q, oppId, null)
      if (entwurf?.neu) {
        await q(
          `INSERT INTO activities (id, subject_type, subject_id, kind, summary, detail, actor, origin, created_at)
           VALUES ($1, 'opportunity', $2, 'finanz.entwurf', 'Angebots-Entwurf in Finanz angelegt', $3, 'emin', 'MANUAL', now())`,
          [randomUUID(), oppId, `Entwurf ${entwurf.id} — Versand bleibt dein Klick in Finanz.`],
        )
      }
    } catch {
      /* Das Ja gilt auch ohne Entwurf; die Pipeline-Seite zeigt den Hinweis nur, wenn die Chronikzeile existiert. */
    }
  }
  return true
}

/** Letzten Stufenschritt (automatisch oder von Hand) zurücknehmen. */
export async function nimmLetzteStufeZurueck(q: Abfrage, oppId: string): Promise<boolean> {
  const r = (await q(
    `SELECT id, data->>'von' AS von, data->>'nach' AS nach FROM activities
      WHERE kind = 'deal.stufe' AND data->>'oppId' = $1 ORDER BY created_at DESC LIMIT 1`,
    [oppId],
  )) as { id: string; von: string | null; nach: string }[]
  const letzte = r[0]
  if (!letzte?.von) return false
  await q(`UPDATE opportunities SET status = $2, updated_at = now() WHERE id = $1 AND status = $3`, [oppId, letzte.von, letzte.nach])
  await q(`DELETE FROM activities WHERE id = $1`, [letzte.id])
  return true
}

/** Letzte Stufenschritte je Chance (für die Anzeige "warum steht der Deal hier"). */
export async function ladeStufenSchritte(
  q: Abfrage,
  oppIds: string[],
): Promise<Record<string, { von: string | null; nach: string; grund: string; am: string; vonHand: boolean }>> {
  if (oppIds.length === 0) return {}
  const r = (await q(
    `SELECT DISTINCT ON (data->>'oppId') data->>'oppId' AS opp, data->>'von' AS von, data->>'nach' AS nach,
            data->>'grund' AS grund, origin, created_at
       FROM activities WHERE kind = 'deal.stufe' AND data->>'oppId' = ANY($1::text[])
      ORDER BY data->>'oppId', created_at DESC`,
    [oppIds],
  )) as { opp: string; von: string | null; nach: string; grund: string | null; origin: string; created_at: string }[]
  return Object.fromEntries(
    r.map((s) => [
      s.opp,
      { von: s.von, nach: s.nach, grund: s.grund ?? "", am: new Date(s.created_at).toISOString(), vonHand: s.origin === "MANUAL" },
    ]),
  )
}

/** Antwort erhalten: am Kontakt + Firma protokollieren und Chance auf "qualifiziert" heben. */
export async function notiereAntwort(q: Abfrage, an: string, betreff: string | null, quelleId: string): Promise<void> {
  const k = (await q(`SELECT id, organisation_id FROM contacts WHERE email_normalised = $1 LIMIT 1`, [an.trim().toLowerCase()])) as {
    id: string
    organisation_id: string | null
  }[]
  if (!k[0]) return
  const staende = await rueckeChanceVor(q, {
    firmaId: k[0].organisation_id,
    kontaktId: k[0].id,
    ziel: "qualified",
    grund: "Antwort erhalten",
    quelleId,
    schritt: "Termin vereinbaren",
  })
  const summary = `Antwort erhalten${betreff ? ` · ${betreff}` : ""}`.slice(0, 200)
  const ziele: [string, string][] = [["contact", k[0].id]]
  if (k[0].organisation_id) ziele.push(["organisation", k[0].organisation_id])
  for (const [typ, ziel] of ziele) {
    await q(
      `INSERT INTO activities (id, subject_type, subject_id, kind, summary, actor, origin, data, created_at)
       VALUES ($1, $2, $3, 'mail.antwort', $4, 'admin', 'HUMAN', $5::jsonb, now())`,
      [randomUUID(), typ, ziel, summary, JSON.stringify({ quelleId, vorher: typ === "organisation" ? staende : [] })],
    )
  }
}

/** Versehentlich "Antwort erhalten" gedrückt: Verlauf und Chancen exakt zurücksetzen. */
export async function nimmAntwortZurueck(q: Abfrage, quelleId: string): Promise<void> {
  const eintraege = (await q(
    `SELECT id, data FROM activities WHERE kind = 'mail.antwort' AND data->>'quelleId' = $1`,
    [quelleId],
  )) as { id: string; data: { vorher?: ChancenStand[] } | null }[]
  for (const e of eintraege) {
    for (const s of e.data?.vorher ?? []) {
      if (s.status === "neu-angelegt") continue
      // Nur zurücksetzen, wenn seitdem niemand die Chance weiterbewegt hat.
      await q(
        `UPDATE opportunities SET status = $2, next_action = $3, next_action_at = $4::date, updated_at = now()
         WHERE id = $1 AND status = $5`,
        [s.id, s.status, s.next_action, s.next_action_at, s.nachStatus],
      )
    }
  }
  await q(`DELETE FROM activities WHERE kind IN ('mail.antwort','deal.stufe') AND data->>'quelleId' = $1`, [quelleId])
}

/** Termin gebucht → mindestens Bedarfsgespräch; ohne Chance wird eine angelegt. */
export async function notiereTermin(
  q: Abfrage,
  t: { kontaktId: string | null; firmaId?: string | null; terminId: string; startDatum: string; referenz: string },
): Promise<void> {
  const firmaId = t.firmaId ?? (await firmaVonKontakt(q, t.kontaktId))
  if (!firmaId) return
  const firma = (await q(`SELECT name FROM organisations WHERE id = $1`, [firmaId])) as { name: string }[]
  await rueckeChanceVor(q, {
    firmaId,
    kontaktId: t.kontaktId,
    ziel: "discovery",
    grund: `Termin ${t.referenz} gebucht`,
    quelleId: t.terminId,
    schritt: `Termin ${t.referenz} vorbereiten`,
    schrittAm: t.startDatum,
    anlegen: `Bedarfsgespräch: ${firma[0]?.name ?? "Termin"}`,
  })
  await q(
    `INSERT INTO activities (id, subject_type, subject_id, kind, summary, actor, origin, data, created_at)
     SELECT $1, 'organisation', $2, 'termin_gebucht', $3, 'system', 'termine', $4::jsonb, now()
     WHERE NOT EXISTS (SELECT 1 FROM activities WHERE kind = 'termin_gebucht' AND subject_type = 'organisation' AND data->>'quelleId' = $5)`,
    [randomUUID(), firmaId, `Termin gebucht · ${t.referenz}`, JSON.stringify({ quelleId: t.terminId, startDatum: t.startDatum }), t.terminId],
  )
}

/** Gespräch notiert → mindestens Bedarfsgespräch, nächster Schritt aus der Folge-Notiz. */
export async function notiereGespraech(
  q: Abfrage,
  g: { kontaktId: string; gespraechId: string; summary: string; folge: string | null; folgeAm: string | null },
): Promise<void> {
  const firmaId = await firmaVonKontakt(q, g.kontaktId)
  if (!firmaId) return
  const firma = (await q(`SELECT name FROM organisations WHERE id = $1`, [firmaId])) as { name: string }[]
  await rueckeChanceVor(q, {
    firmaId,
    kontaktId: g.kontaktId,
    ziel: "discovery",
    grund: "Gespräch geführt",
    quelleId: g.gespraechId,
    schritt: g.folge,
    schrittAm: g.folge ? g.folgeAm : null,
    anlegen: `Bedarfsgespräch: ${firma[0]?.name ?? "Gespräch"}`,
  })
  await q(
    `INSERT INTO activities (id, subject_type, subject_id, kind, summary, actor, origin, data, created_at)
     VALUES ($1, 'organisation', $2, 'gespraech', $3, 'admin', 'HUMAN', $4::jsonb, now())`,
    [randomUUID(), firmaId, g.summary.slice(0, 200), JSON.stringify({ quelleId: g.gespraechId, kontaktId: g.kontaktId })],
  )
}
