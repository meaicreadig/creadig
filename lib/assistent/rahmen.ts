import "server-only"

import { berechneLage } from "@/lib/finanz/lage"
import { finanzDb } from "@/lib/finanz/store"

export type Rahmen = {
  freiEur: number | null
  reichweiteMonate: number | null
  spielraumEur: number
  text: string
}

const eur = (n: number) => `${Math.round(n).toLocaleString("de-DE")} €`

/**
 * Was sich creaDIG gerade leisten kann. Jeder Agent bekommt diesen Rahmen,
 * damit niemand einen Messestand oder bezahlte Werbung vorschlägt, wenn das Geld fehlt.
 */
export async function firmenRahmen(): Promise<Rahmen> {
  try {
    const db = await finanzDb()
    if (!db) throw new Error("keine DB")
    const lage = await berechneLage(db)
    const frei = lage.frei / 100
    const reichweite = lage.reichweite
    const anteil = reichweite === null ? 0.03 : reichweite >= 6 ? 0.1 : reichweite >= 3 ? 0.03 : 0
    const spielraum = Math.max(0, Math.floor(frei * anteil))
    const lageText =
      reichweite !== null && reichweite < 3
        ? "Knapp: nur kostenlose Maßnahmen, Fokus auf Umsatz in den nächsten 30 Tagen."
        : spielraum < 1500
          ? "Eng: kein Messestand, keine bezahlte Werbung. Messen nur als Besucher, Marketing organisch."
          : "Solide: gezielte Ausgaben möglich, jede Ausgabe braucht einen erwarteten Rückfluss."
    return {
      freiEur: frei,
      reichweiteMonate: reichweite,
      spielraumEur: spielraum,
      text: `Frei verfügbar (nach Steuertopf): ${eur(frei)}. Reichweite: ${reichweite === null ? "unbekannt" : `${reichweite.toFixed(1)} Monate`}. Ausgaben-Spielraum diesen Monat: ${eur(spielraum)}. ${lageText}`,
    }
  } catch {
    return {
      freiEur: null,
      reichweiteMonate: null,
      spielraumEur: 0,
      text: "Finanzlage nicht lesbar – behandle das Budget als knapp: nur kostenlose Maßnahmen vorschlagen.",
    }
  }
}

export const INHABER = `creaDIG Solutions ist ein Einzelunternehmen in Niedersachsen. Inhaber Muhammed Emin Akyol arbeitet allein, ohne Team und ohne Investor. Produkte: fibero (SaaS für Glasfaser-Montagefirmen, die große Wette – erst 10–20 zahlende Firmen, dann verkaufsfähig), stammo (digitale Wallet-Stempelkarte für Gastronomie/Handel, 39/69 € im Monat), Web- und Systemprojekte für Betriebe, Vereine und Verbände (bringt heute das Geld). Märkte: DACH, Türkei, später Golfstaaten. Engpass: Vertrieb und Zeit, nicht Technik.`
