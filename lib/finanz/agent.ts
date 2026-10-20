import "server-only"

import { legeFreigabeAn } from "@/lib/assistent/store"
import { ordneAllesAutomatischZu } from "@/lib/finanz/auto"
import { erzeugeFaelligeAboEntwuerfe } from "@/lib/finanz/abos"
import { heuteBerlin } from "@/lib/finanz/auftraege/rechnen"
import { erstelleMorgenBericht } from "@/lib/finanz/morgenmail"
import { finanzDb, protokolliere } from "@/lib/finanz/store"

const STUFE = ["", "Zahlungserinnerung", "1. Mahnung", "2. Mahnung"]

/**
 * Der tägliche Finanz-Lauf. Er BEREITET VOR und versendet nichts:
 *   · Folgerechnungen aus Abos → Entwurf (Prüfen/Festschreiben/Senden = dein Klick)
 *   · überfällige Rechnungen → ein Vorschlag in deiner Freigabe-Liste je Mahnstufe
 *     (derselbe Fall wird nie zweimal vorgeschlagen — Schlüssel `mahnung:<id>:<stufe>`)
 * Gelöscht oder verändert wird dabei nichts Bestehendes.
 */
export async function finanzAgentLauf(): Promise<{ ergebnis: string; anzahl: number }> {
  const db = await finanzDb().catch(() => null)
  if (!db) return { ergebnis: "Finanz-Speicher nicht verbunden", anzahl: 0 }

  const entwuerfe = await erzeugeFaelligeAboEntwuerfe(db, heuteBerlin())
  for (const e of entwuerfe) await protokolliere(db, "abo_entwurf", { entwurf: e.id, abo: e.aboId, zeitraum: e.zeitraum })

  const auto = await ordneAllesAutomatischZu(db).catch(() => null)
  const bericht = await erstelleMorgenBericht(db)
  let mahnungen = 0
  for (const m of bericht.faelligeMahnungen) {
    const id = await legeFreigabeAn({
      art: "aufgabe",
      titel: `${STUFE[m.stufe] ?? "Mahnung"} prüfen: ${m.nummer} (${m.kunde})`,
      inhalt: [
        `Rechnung ${m.nummer} an ${m.kunde} ist ${m.tageUeberfaellig} Tage überfällig.`,
        `Vorschlag: ${STUFE[m.stufe] ?? "Mahnung"} senden.`,
        "",
        `Öffnen und mit einem Klick versenden: /finanz/vorgang/${m.id}`,
        "Es wurde nichts verschickt.",
      ].join("\n"),
      quelle: `mahnung:${m.id}:${m.stufe}`,
      agent: "finanz",
    })
    if (id) mahnungen++
  }

  const teile = [
    entwuerfe.length ? `${entwuerfe.length} Folgerechnung(en) als Entwurf` : null,
    mahnungen ? `${mahnungen} Mahnvorschlag/-vorschläge` : null,
    auto && auto.belegeVerlauf + auto.belegeKi ? `${auto.belegeVerlauf + auto.belegeKi} Beleg(e) zugeordnet` : null,
    auto && auto.bankAusgaben ? `${auto.bankAusgaben} Abbuchung(en) gebucht` : null,
    auto && auto.bankEingaenge ? `${auto.bankEingaenge} Zahlungseingang/-eingänge zugeordnet` : null,
  ].filter(Boolean)
  return { ergebnis: teile.length ? teile.join(" · ") : "Nichts zu tun", anzahl: entwuerfe.length + mahnungen + (auto ? auto.belegeVerlauf + auto.belegeKi + auto.bankAusgaben + auto.bankEingaenge : 0) }
}
