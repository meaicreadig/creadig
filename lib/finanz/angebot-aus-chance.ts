import "server-only"

import { randomUUID } from "node:crypto"

import type { Abfrage } from "@/lib/neon-abfrage"
import { legeEntwurfAusGewinn } from "@/lib/finanz/auftraege/aus-vertrieb"

/**
 * Admin → Finanz, früher als beim Gewinn: Sobald ein Vorgang in „Angebot“ oder
 * „Verhandlung“ steht, liegt in Finanz der Angebots-ENTWURF bereit (Kunde,
 * Kontakt und geschätzter Wert kommen aus dem Vertrieb), und in der
 * Freigabe-Liste steht (seit Katman 4) die fertige Karte „Angebot senden“.
 *
 * Es wird nichts verschickt: Senden bleibt dein Klick in /finanz/vorgang/<id>
 * (dort auch Preise und Texte anpassen). Idempotent über opportunity_id und den
 * Freigabe-Schlüssel — derselbe Vorgang erzeugt nie zwei Entwürfe.
 */
export async function legeAngebotsEntwuerfeAusChancen(db: Abfrage): Promise<{ id: string; opportunityId: string; titel: string }[]> {
  const chancen = await db(
    `SELECT o.id, o.title FROM opportunities o
      WHERE o.status IN ('proposal','negotiation') AND o.excluded_reason IS NULL
        AND (o.organisation_id IS NOT NULL OR o.contact_id IS NOT NULL)
        AND NOT EXISTS (SELECT 1 FROM fin_dokumente d WHERE d.opportunity_id = o.id AND d.art = 'angebot')
      ORDER BY o.updated_at DESC LIMIT 10`,
    [],
  ).catch(() => [])
  const neu: { id: string; opportunityId: string; titel: string }[] = []
  for (const c of chancen) {
    const oppId = String(c.id)
    const r = await legeEntwurfAusGewinn(db, oppId, null).catch(() => null)
    if (!r?.neu) continue
    neu.push({ id: r.id, opportunityId: oppId, titel: String(c.title) })
    await db(
      `INSERT INTO activities (id, subject_type, subject_id, kind, summary, detail, actor, origin, created_at)
       VALUES ($1,'opportunity',$2,'finanz.entwurf','Angebots-Entwurf in Finanz angelegt',$3,'finanz-agent','AUTO',now())`,
      [randomUUID(), oppId, `Entwurf ${r.id} liegt bereit — Prüfen und Senden bleibt dein Klick in Finanz.`],
    ).catch(() => null)
    /* Katman 4: statt „prüfen und senden“-Aufgabe gleich füllen und die Ein-Klick-Karte „Angebot senden“ anlegen. */
    try {
      const [{ fuelleAngebot }, { legeAngebotsKarte }, { finanzDb }] = await Promise.all([
        import("@/lib/agenten/angebot"),
        import("@/lib/ausfuehrung/angebot-hat"),
        import("@/lib/finanz/store"),
      ])
      const fdb = await finanzDb()
      if (fdb) {
        await fuelleAngebot(fdb, r.id, oppId)
        await legeAngebotsKarte(fdb, r.id)
      }
    } catch (e) {
      console.error("[angebot-aus-chance] karte", e instanceof Error ? e.message : e)
    }
  }
  return neu
}
