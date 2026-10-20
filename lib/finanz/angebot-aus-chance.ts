import "server-only"

import { randomUUID } from "node:crypto"

import { legeFreigabeAn } from "@/lib/assistent/store"
import type { Abfrage } from "@/lib/neon-abfrage"
import { legeEntwurfAusGewinn } from "@/lib/finanz/auftraege/aus-vertrieb"

/**
 * Admin → Finanz, früher als beim Gewinn: Sobald ein Vorgang in „Angebot“ oder
 * „Verhandlung“ steht, liegt in Finanz der Angebots-ENTWURF bereit (Kunde,
 * Kontakt und geschätzter Wert kommen aus dem Vertrieb), und in der
 * Freigabe-Liste steht „prüfen und senden“.
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
    await legeFreigabeAn({
      art: "aufgabe",
      titel: `Angebot prüfen und senden: ${String(c.title).slice(0, 90)}`,
      inhalt: [`Für den Vorgang „${c.title}“ liegt ein Angebots-Entwurf bereit.`, "", `Öffnen, Preise prüfen, mit einem Klick senden: /finanz/vorgang/${r.id}`, "Es wurde nichts verschickt."].join("\n"),
      quelle: `angebot-chance:${oppId}`,
      agent: "finanz",
    }).catch(() => null)
  }
  return neu
}
