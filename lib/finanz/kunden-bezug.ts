import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"
import { auftraegeSchema } from "@/lib/finanz/auftraege/store"
import { finanzSchema } from "@/lib/finanz/store"

/**
 * Finanz → Kunde: was ein Kunde bisher bezahlt hat, was offen ist, wie schnell
 * er zahlt. EINE Abfrage für Kundenkarte, Kundenlage („Heute“) und Pipeline.
 *
 * Vorher lasen Kundenkarte und Kundenlage die alten Tabellen `invoices` und
 * `payments` (lib/rechnung.ts, nie befüllt) — jeder Kunde stand bei „0 €
 * eingenommen, keine offene Rechnung“, auch mit drei unbezahlten Rechnungen in
 * Finanz. Die Wahrheit steht in fin_dokumente / fin_zahlungen.
 *
 * Zuordnung Dokument → Organisation (jeweils eine ausreichende Spur):
 *   1. das Dokument entstand aus einer Chance der Organisation (opportunity_id)
 *   2. die E-Mail des Dokument-Kunden ist die eines Kontakts der Organisation
 *   3. der Firmenname des Dokument-Kunden ist der Organisationsname
 */
export type KundenGeld = {
  organisationId: string
  eingenommenCent: number
  offeneRechnungen: number
  offenCent: number
  ueberfaelligAnzahl: number
  ueberfaelligCent: number
  offeneAngebote: number
  /** Ø Tage von Rechnungsdatum bis letzter Zahlung, nur vollständig bezahlte Rechnungen; null ohne solche. */
  zahlungsdauerTage: number | null
}

const ZUORDNUNG = `
  zuordnung AS (
    SELECT fd.id AS dok, op.organisation_id AS org
      FROM fin_dokumente fd JOIN opportunities op ON op.id = fd.opportunity_id
     WHERE op.organisation_id IS NOT NULL
    UNION
    SELECT fd.id, c.organisation_id
      FROM fin_dokumente fd JOIN contacts c ON lower(c.email) = lower(fd.kunde->>'email')
     WHERE c.organisation_id IS NOT NULL AND coalesce(fd.kunde->>'email','') <> ''
    UNION
    SELECT fd.id, o.id
      FROM fin_dokumente fd JOIN organisations o ON lower(trim(o.name)) = lower(trim(fd.kunde->>'firma'))
     WHERE coalesce(trim(fd.kunde->>'firma'),'') <> ''
  )`

export async function ladeKundenGeld(db: Abfrage, heute: string, organisationIds?: string[]): Promise<Map<string, KundenGeld>> {
  await finanzSchema(db)
  await auftraegeSchema(db)
  const filter = organisationIds ? `AND z.org = ANY($2::text[])` : ""
  const rows = await db(
    `WITH ${ZUORDNUNG},
     r AS (
       SELECT z.org, fd.id, fd.art, fd.status, fd.datum, fd.faellig_am, fd.beantwortet_at,
              coalesce((fd.summen->>'bruttoCent')::bigint, 0) AS brutto,
              coalesce((SELECT sum(zz.cent) FROM fin_zahlungen zz WHERE zz.dokument_id = fd.id), 0) AS bezahlt,
              (SELECT max(zz.datum) FROM fin_zahlungen zz WHERE zz.dokument_id = fd.id) AS letzte
         FROM zuordnung z JOIN fin_dokumente fd ON fd.id = z.dok
        WHERE true ${filter}
     )
     SELECT org,
            coalesce(sum(bezahlt) FILTER (WHERE art = 'rechnung'), 0) AS eingenommen,
            count(*) FILTER (WHERE art = 'rechnung' AND status IN ('versendet','teilbezahlt') AND brutto - bezahlt > 0) AS offen_anzahl,
            coalesce(sum(brutto - bezahlt) FILTER (WHERE art = 'rechnung' AND status IN ('versendet','teilbezahlt') AND brutto - bezahlt > 0), 0) AS offen_cent,
            count(*) FILTER (WHERE art = 'rechnung' AND status IN ('versendet','teilbezahlt') AND brutto - bezahlt > 0 AND faellig_am < $1::date) AS ueber_anzahl,
            coalesce(sum(brutto - bezahlt) FILTER (WHERE art = 'rechnung' AND status IN ('versendet','teilbezahlt') AND brutto - bezahlt > 0 AND faellig_am < $1::date), 0) AS ueber_cent,
            count(*) FILTER (WHERE art = 'angebot' AND status = 'versendet' AND beantwortet_at IS NULL) AS angebote,
            avg((letzte - datum)) FILTER (WHERE art = 'rechnung' AND status = 'bezahlt' AND letzte IS NOT NULL) AS dauer
       FROM r GROUP BY org`,
    organisationIds ? [heute, organisationIds] : [heute],
  )
  const karte = new Map<string, KundenGeld>()
  for (const x of rows) {
    karte.set(String(x.org), {
      organisationId: String(x.org),
      eingenommenCent: Number(x.eingenommen),
      offeneRechnungen: Number(x.offen_anzahl),
      offenCent: Number(x.offen_cent),
      ueberfaelligAnzahl: Number(x.ueber_anzahl),
      ueberfaelligCent: Number(x.ueber_cent),
      offeneAngebote: Number(x.angebote),
      zahlungsdauerTage: x.dauer === null || x.dauer === undefined ? null : Math.round(Number(x.dauer)),
    })
  }
  return karte
}

export const keinKundenGeld = (organisationId: string): KundenGeld => ({
  organisationId,
  eingenommenCent: 0,
  offeneRechnungen: 0,
  offenCent: 0,
  ueberfaelligAnzahl: 0,
  ueberfaelligCent: 0,
  offeneAngebote: 0,
  zahlungsdauerTage: null,
})
