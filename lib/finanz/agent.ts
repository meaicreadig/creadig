import "server-only"

import { legeAngebotsEntwuerfeAusChancen } from "@/lib/finanz/angebot-aus-chance"
import { ordneAllesAutomatischZu } from "@/lib/finanz/auto"
import { erzeugeFaelligeAboEntwuerfe } from "@/lib/finanz/abos"
import { heuteBerlin } from "@/lib/finanz/auftraege/rechnen"
import { erstelleMorgenBericht } from "@/lib/finanz/morgenmail"
import { finanzDb, protokolliere } from "@/lib/finanz/store"

/**
 * Der tägliche Finanz-Lauf. Er BEREITET VOR und versendet nichts:
 *   · Folgerechnungen aus Abos → Entwurf (Prüfen/Festschreiben/Senden = dein Klick)
 *   · überfällige Rechnungen → übernimmt Tahsilat (lib/agenten/forderungen.ts) als
 *     sendefertige Mahnung je Stufe (Schlüssel `forderung:<id>:<stufe>`)
 * Gelöscht oder verändert wird dabei nichts Bestehendes.
 */
export async function finanzAgentLauf(): Promise<{ ergebnis: string; anzahl: number }> {
  const db = await finanzDb().catch(() => null)
  if (!db) return { ergebnis: "Finanz-Speicher nicht verbunden", anzahl: 0 }

  const entwuerfe = await erzeugeFaelligeAboEntwuerfe(db, heuteBerlin())
  for (const e of entwuerfe) await protokolliere(db, "abo_entwurf", { entwurf: e.id, abo: e.aboId, zeitraum: e.zeitraum })

  const angebote = await legeAngebotsEntwuerfeAusChancen(db).catch(() => [])
  const auto = await ordneAllesAutomatischZu(db).catch(() => null)
  const bericht = await erstelleMorgenBericht(db)
  /* Mahnvorschläge legt seit 22.10.2026 Tahsilat (lib/agenten/forderungen.ts) als sendefertige Mail an – nicht zweimal. */
  const teile = [
    entwuerfe.length ? `${entwuerfe.length} Folgerechnung(en) als Entwurf` : null,
    angebote.length ? `${angebote.length} Angebots-Entwurf/-Entwürfe aus dem Vertrieb` : null,
    bericht.faelligeMahnungen.length ? `${bericht.faelligeMahnungen.length} Mahnstufe(n) fällig → Tahsilat` : null,
    auto && auto.belegeVerlauf + auto.belegeKi ? `${auto.belegeVerlauf + auto.belegeKi} Beleg(e) zugeordnet` : null,
    auto && auto.bankAusgaben ? `${auto.bankAusgaben} Abbuchung(en) gebucht` : null,
    auto && auto.bankEingaenge ? `${auto.bankEingaenge} Zahlungseingang/-eingänge zugeordnet` : null,
  ].filter(Boolean)
  return { ergebnis: teile.length ? teile.join(" · ") : "Nichts zu tun", anzahl: entwuerfe.length + angebote.length + (auto ? auto.belegeVerlauf + auto.belegeKi + auto.bankAusgaben + auto.bankEingaenge : 0) }
}
