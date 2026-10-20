import { offers, type OfferKey } from "@/lib/offers"
import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * Der Leistungskatalog kennt die Angebote der Website — aus DERSELBEN Quelle
 * (`lib/offers.ts`), keine zweite Preisliste. Nur veröffentlichte Angebote mit
 * Festbetrag werden übernommen; „Systemanalyse“ (Preis noch offen) fehlt mit
 * Absicht. Netto-Beträge laut offers.ts.
 *
 * Idempotent und schonend: `ON CONFLICT DO NOTHING` — ein vom Owner geänderter
 * Preis oder Text wird nie überschrieben, ein deaktivierter Eintrag nie wieder
 * eingeschaltet.
 */
const TEXT: Record<OfferKey, { titel: string; beschreibung: string; einheit: string; feld: string }> = {
  website: { titel: "Website", beschreibung: "Festpreis-Website für Handwerk und Mittelstand.", einheit: "Pauschal", feld: "digitalprodukte" },
  "website-pilot": { titel: "Website – Pilotplatz je Gewerk", beschreibung: "Pilotpreis gegen schriftliche Referenzfreigabe.", einheit: "Pauschal", feld: "digitalprodukte" },
  analyse: { titel: "Systemanalyse", beschreibung: "", einheit: "Pauschal", feld: "beratung" },
  audit: { titel: "Barrierefreiheits-Prüfung (BFSG)", beschreibung: "Prüfung der Website auf Barrierefreiheit mit Bericht.", einheit: "Pauschal", feld: "beratung" },
  betreuung: { titel: "Website-Betreuung", beschreibung: "Laufende Betreuung und Pflege der Website.", einheit: "Monat", feld: "digitalprodukte" },
}

export async function uebernehmeWebsiteLeistungen(db: Abfrage): Promise<number> {
  let neu = 0
  for (const o of offers) {
    if (!o.published || o.amount === null) continue
    const t = TEXT[o.key]
    const r = await db(
      `INSERT INTO fin_leistungen (id, titel, beschreibung, einheit, preis_cent, ust_satz, geschaeftsfeld, aktiv)
       VALUES ($1,$2,$3,$4,$5,19,$6,true) ON CONFLICT (id) DO NOTHING RETURNING id`,
      [`leistung-site-${o.key}`, t.titel, t.beschreibung, t.einheit, Math.round(o.amount * 100), t.feld],
    )
    neu += r.length
  }
  return neu
}
