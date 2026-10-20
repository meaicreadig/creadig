import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"
import { betragVon, type Angebot } from "@/lib/angebot"
import type { Kunde, Position } from "@/lib/finanz/auftraege/rechnen"
import { finanzSchema } from "@/lib/finanz/store"
import { auftraegeSchema, ladeFirma, legeEntwurfAn, merkeKunde, verlauf } from "@/lib/finanz/auftraege/store"

/**
 * Vertrieb → Finanz: ein gewonnener Vorgang bekommt einen Angebots-ENTWURF
 * in fin_dokumente. Nur Entwurf — Versand und Festschreibung bleiben ein
 * Klick des Owners in Finanz. Idempotent über fin_dokumente.opportunity_id:
 * ein zweiter Aufruf für denselben Vorgang legt nichts an.
 *
 * Fehler hier dürfen den Vertriebs-Schritt nie kippen — der Aufrufer fängt
 * sie ab und schreibt sie in die Chronik.
 */
export async function legeEntwurfAusGewinn(
  db: Abfrage,
  opportunityId: string,
  angebot: Angebot | null,
): Promise<{ id: string; neu: boolean } | null> {
  await finanzSchema(db)
  await auftraegeSchema(db)
  const vorhanden = await db(`SELECT id FROM fin_dokumente WHERE opportunity_id = $1 AND art = 'angebot' LIMIT 1`, [opportunityId])
  if (vorhanden.length) return { id: String(vorhanden[0].id), neu: false }

  const [o] = await db(
    `SELECT o.title, o.estimated_value, o.organisation_id, o.contact_id,
            org.name AS org_name, org.city AS org_city,
            c.name AS c_name, c.email AS c_email
       FROM opportunities o
       LEFT JOIN organisations org ON org.id = o.organisation_id
       LEFT JOIN contacts c ON c.id = o.contact_id
      WHERE o.id = $1`,
    [opportunityId],
  )
  if (!o) return null

  const kunde: Kunde = {
    name: String(o.c_name ?? ""),
    firma: String(o.org_name ?? ""),
    strasse: "",
    plzOrt: String(o.org_city ?? ""),
    land: "Deutschland",
    email: String(o.c_email ?? ""),
    ustId: "",
  }
  if (!kunde.name && !kunde.firma && !kunde.email) return null

  const { ustPflichtig } = await ladeFirma(db)
  const ustSatz = ustPflichtig ? 19 : 0
  const positionen: Position[] = []
  if (angebot) {
    for (const p of angebot.positionen) {
      const betrag = betragVon(p)
      positionen.push({
        titel: betrag === null ? `${p.was} (Preis prüfen)` : p.was,
        beschreibung: "",
        menge: 1,
        einheit: p.wiederkehrend ? "Monat" : "Pauschal",
        preisCent: betrag === null ? 0 : Math.round(betrag * 100),
        ustSatz,
        optional: false,
        gewaehlt: true,
      })
    }
  } else if (o.estimated_value && Number(o.estimated_value) > 0) {
    positionen.push({
      titel: String(o.title),
      beschreibung: "",
      menge: 1,
      einheit: "Pauschal",
      preisCent: Math.round(Number(o.estimated_value) * 100),
      ustSatz,
      optional: false,
      gewaehlt: true,
    })
  }

  const organisationId = o.organisation_id ? String(o.organisation_id) : null
  const contactId = o.contact_id ? String(o.contact_id) : null
  await merkeKunde(db, kunde, { organisationId, contactId })
  const sprache = angebot && (angebot.sprache === "en" || angebot.sprache === "tr") ? angebot.sprache : "de"
  const id = await legeEntwurfAn(db, "angebot", { titel: String(o.title), kunde, positionen, sprache, opportunityId })
  await verlauf(db, id, "aus_vertrieb", { opportunityId, vertriebsAngebot: angebot?.referenz ?? null })
  return { id, neu: true }
}
