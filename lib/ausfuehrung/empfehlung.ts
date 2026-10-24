import "server-only"

import { legeFreigabeAn, quelleBekannt } from "@/lib/assistent/store"
import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * EMPFEHLUNGEN & TIPPGEBER — 24.10.2026 (Automatik 3 von 4).
 *
 * Steuerberater, IT-Systemhäuser, Verbände und Kunden sind der Kanal mit dem
 * schnellsten Ertrag ohne Kaltakquise. Bisher wusste das System nicht, WER
 * eine Chance gebracht hat – also bekam niemand Dank, und eine vereinbarte
 * Provision hing an Emins Gedächtnis.
 *
 * Regeln:
 * - Eine Tippgeber-Provision wird dem Kunden offengelegt (BGH IV ZR 147/89:
 *   verdeckte Provision an einen Berater ist pflichtwidrig). Darum fragt die
 *   Karte nach, bevor ausgezahlt wird.
 * - Ausgezahlt wird erst, wenn die Schlussrechnung BEZAHLT ist – nie auf
 *   Erwartung.
 * - Jede Empfehlung bekommt sofort eine Dank-Karte für Emin (persönlich).
 */

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS partner_empfehlungen (
    id text PRIMARY KEY,
    opportunity_id text NOT NULL,
    partner text NOT NULL,
    partner_org_id text,
    provision_prozent numeric(5,2),
    offengelegt boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'offen' CHECK (status IN ('offen','faellig','ausgezahlt','verfallen')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (opportunity_id))`,
]
let bereit: Promise<void> | null = null
async function schema(q: Abfrage) {
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

export async function trageEmpfehlungEin(
  q: Abfrage,
  e: { oppId: string; firma: string; partner: string; provisionProzent?: number | null },
): Promise<boolean> {
  await schema(q)
  const [p] = (await q(`SELECT id FROM organisations WHERE lower(name) = lower($1) LIMIT 1`, [e.partner.trim()]).catch(() => [])) as { id: string }[]
  await q(
    `INSERT INTO partner_empfehlungen (id, opportunity_id, partner, partner_org_id, provision_prozent)
     VALUES ($1,$2,$3,$4,$5) ON CONFLICT (opportunity_id) DO UPDATE SET partner = EXCLUDED.partner, provision_prozent = coalesce(EXCLUDED.provision_prozent, partner_empfehlungen.provision_prozent)`,
    [`emp-${crypto.randomUUID().slice(0, 8)}`, e.oppId, e.partner.trim(), p?.id ?? null, e.provisionProzent ?? null],
  )
  await q(`UPDATE opportunities SET source = 'empfehlung', updated_at = now() WHERE id = $1`, [e.oppId]).catch(() => null)
  if (!(await quelleBekannt(`empfehlung-dank:${e.oppId}`))) {
    await legeFreigabeAn({
      art: "aufgabe",
      titel: `Danke sagen: ${e.partner} hat ${e.firma} empfohlen`.slice(0, 160),
      inhalt: [
        `${e.partner} hat uns ${e.firma} empfohlen. Ein kurzer persönlicher Dank (Anruf oder WhatsApp) hält den Kanal warm – heute, nicht erst nach dem Auftrag.`,
        e.provisionProzent
          ? `\nVereinbart: ${e.provisionProzent} % Tippgeber-Provision. Wichtig: Der Kunde muss davon wissen (Offenlegung) – bitte im Erstgespräch erwähnen und hier bestätigen. Ausgezahlt wird erst nach bezahlter Schlussrechnung.`
          : "",
      ].join(""),
      quelle: `empfehlung-dank:${e.oppId}`,
      agent: "partner",
      extra: { fuerEmin: true, bezug: `opportunity:${e.oppId}` },
    }).catch(() => null)
  }
  return true
}

/** Täglich (Partner-Agent): Provisionen fällig stellen, sobald die Schlussrechnung bezahlt ist. */
export async function provisionsRunde(q: Abfrage): Promise<number> {
  await schema(q)
  const faellig = (await q(
    `SELECT e.id, e.partner, e.provision_prozent, e.offengelegt, og.name AS firma,
            sum(coalesce((d.summen->>'nettoCent')::bigint, 0)) AS netto_cent
       FROM partner_empfehlungen e
       JOIN opportunities o ON o.id = e.opportunity_id
       JOIN organisations og ON og.id = o.organisation_id
       JOIN fin_dokumente d ON d.opportunity_id = e.opportunity_id AND d.art = 'rechnung' AND d.bezahlt_am IS NOT NULL
      WHERE e.status = 'offen' AND e.provision_prozent > 0
        AND EXISTS (SELECT 1 FROM fin_dokumente s WHERE s.opportunity_id = e.opportunity_id AND s.art = 'rechnung'
                     AND s.anzahlung_prozent IS NULL AND s.bezahlt_am IS NOT NULL)
      GROUP BY e.id, og.name`,
    [],
  ).catch(() => [])) as { id: string; partner: string; provision_prozent: string; offengelegt: boolean; firma: string; netto_cent: string }[]
  let n = 0
  for (const f of faellig) {
    const betrag = Math.round((Number(f.netto_cent) * Number(f.provision_prozent)) / 100) / 100
    const id = await legeFreigabeAn({
      art: "aufgabe",
      titel: `Tippgeber-Provision: ${f.partner} (${f.firma}) – ${betrag.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`,
      inhalt: [
        `Die Schlussrechnung für ${f.firma} ist bezahlt. Vereinbart: ${f.provision_prozent} % vom bezahlten Netto = ${betrag.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €.`,
        f.offengelegt ? "Offenlegung gegenüber dem Kunden ist bestätigt." : "⚠ Offenlegung gegenüber dem Kunden ist NICHT bestätigt – erst klären, dann auszahlen.",
        "Der Partner stellt dir dafür eine Rechnung (bzw. Gutschrift); bei Steuerberatern vorher prüfen, ob ihre Berufsordnung das erlaubt.",
      ].join("\n"),
      quelle: `provision:${f.id}`,
      agent: "finanz",
      extra: { fuerEmin: true },
    }).catch(() => null)
    if (id) {
      await q(`UPDATE partner_empfehlungen SET status = 'faellig' WHERE id = $1`, [f.id]).catch(() => null)
      n++
    }
  }
  return n
}
