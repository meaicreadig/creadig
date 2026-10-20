/*
 * Messe-Radar. Die Termine sind die ÜBLICHE Messewoche des Veranstalters,
 * keine bestätigten Daten — die Seite sagt das offen. Vor einer Buchung
 * gilt nur die Veranstalterseite.
 */

export const MESSE_KATEGORIEN = {
  glasfaser: "Glasfaser & Telekom",
  digital: "Digitale Produkte & IT",
  druck: "3D-Druck & Industrie",
  handel: "E-Commerce & Produkte",
} as const
export type MesseKategorie = keyof typeof MESSE_KATEGORIEN

export const MESSE_REGIONEN = {
  dach: "DACH",
  tr: "Türkei",
  eu: "Europa",
  welt: "Weitere Märkte",
} as const
export type MesseRegion = keyof typeof MESSE_REGIONEN

export type Empfehlung = "ausstellen" | "besuchen" | "beobachten"

export type Messe = {
  name: string
  ort: string
  land: string
  region: MesseRegion
  kategorie: MesseKategorie
  /** Übliche Messemonat (1–12). */
  monat: number
  /** Abstand in Jahren und ein bekanntes Durchführungsjahr. */
  rhythmus: 1 | 2 | 3
  referenzJahr?: number
  url: string
  nutzen: string
  empfehlung: Empfehlung
}

export const MESSEN: readonly Messe[] = [
  // Glasfaser & Telekom
  { name: "ANGA COM", ort: "Köln", land: "DE", region: "dach", kategorie: "glasfaser", monat: 6, rhythmus: 1, url: "https://www.anga-com.com", nutzen: "Leitmesse Breitband & Glasfaser — Netzbetreiber, GU, Tiefbau. Beste Bühne für fibero.", empfehlung: "ausstellen" },
  { name: "FIBERDAYS", ort: "Wiesbaden", land: "DE", region: "dach", kategorie: "glasfaser", monat: 5, rhythmus: 1, url: "https://www.fiberdays.de", nutzen: "BREKO-Glasfasermesse — Ausbauer und Montagefirmen, direkte fibero-Zielgruppe.", empfehlung: "ausstellen" },
  { name: "FTTH Conference", ort: "wechselnd", land: "EU", region: "eu", kategorie: "glasfaser", monat: 5, rhythmus: 1, url: "https://www.ftthconference.eu", nutzen: "Europäischer FTTH-Kongress — Kontakte zu Ausbauern in ganz Europa.", empfehlung: "besuchen" },
  { name: "MWC Barcelona", ort: "Barcelona", land: "ES", region: "eu", kategorie: "glasfaser", monat: 3, rhythmus: 1, url: "https://www.mwcbarcelona.com", nutzen: "Weltgrößte Telekom-Messe — Markt- und Trendblick, weniger Montage-Kunden.", empfehlung: "beobachten" },

  // Digitale Produkte & IT
  { name: "it-sa", ort: "Nürnberg", land: "DE", region: "dach", kategorie: "digital", monat: 10, rhythmus: 1, url: "https://www.itsa365.de", nutzen: "IT-Sicherheit — Umfeld von vi-sec, Partner- und Kundengespräche.", empfehlung: "besuchen" },
  { name: "DMEXCO", ort: "Köln", land: "DE", region: "dach", kategorie: "digital", monat: 9, rhythmus: 1, url: "https://dmexco.com", nutzen: "Digital-Marketing — Agenturen, Mittelstand, Kooperationen für Web & Marke.", empfehlung: "besuchen" },
  { name: "OMR Festival", ort: "Hamburg", land: "DE", region: "dach", kategorie: "digital", monat: 5, rhythmus: 1, url: "https://omr.com/de/events/festival", nutzen: "Größtes Digital-Festival DACH — Sichtbarkeit und Netzwerk.", empfehlung: "besuchen" },
  { name: "Hannover Messe", ort: "Hannover", land: "DE", region: "dach", kategorie: "digital", monat: 4, rhythmus: 1, url: "https://www.hannovermesse.de", nutzen: "Industrie & Digitalisierung — Mittelstand mit Software-Bedarf.", empfehlung: "besuchen" },
  { name: "GITEX Europe", ort: "Berlin", land: "DE", region: "dach", kategorie: "digital", monat: 5, rhythmus: 1, url: "https://www.gitex-europe.com", nutzen: "Tech- und Startup-Messe — Investoren, Software-Käufer, Türöffner Golfstaaten.", empfehlung: "besuchen" },
  { name: "SuisseEMEX", ort: "Zürich", land: "CH", region: "dach", kategorie: "digital", monat: 8, rhythmus: 1, url: "https://www.suisse-emex.ch", nutzen: "Marketing & Digital Schweiz — Einstieg Schweizer KMU.", empfehlung: "besuchen" },
  { name: "ViennaUP", ort: "Wien", land: "AT", region: "dach", kategorie: "digital", monat: 5, rhythmus: 1, url: "https://viennaup.com", nutzen: "Startup- und Innovationswoche Wien — Netzwerk Österreich.", empfehlung: "beobachten" },
  { name: "Web Summit", ort: "Lissabon", land: "PT", region: "eu", kategorie: "digital", monat: 11, rhythmus: 1, url: "https://websummit.com", nutzen: "Größte Tech-Konferenz Europas — Investoren, internationale Partner.", empfehlung: "beobachten" },
  { name: "VivaTech", ort: "Paris", land: "FR", region: "eu", kategorie: "digital", monat: 6, rhythmus: 1, url: "https://vivatechnology.com", nutzen: "Tech-Messe Frankreich — passt zu stammo (FR-Markt).", empfehlung: "besuchen" },
  { name: "TEKNOFEST", ort: "wechselnd", land: "TR", region: "tr", kategorie: "digital", monat: 9, rhythmus: 1, url: "https://www.teknofest.org", nutzen: "Größtes Technologie-Festival der Türkei — Sichtbarkeit, Kooperationen.", empfehlung: "beobachten" },
  { name: "GITEX Global", ort: "Dubai", land: "AE", region: "welt", kategorie: "digital", monat: 10, rhythmus: 1, url: "https://www.gitex.com", nutzen: "Tech-Leitmesse Golfstaaten — Einstieg für die Golf-Vision.", empfehlung: "beobachten" },

  // 3D-Druck & Industrie
  { name: "Formnext", ort: "Frankfurt am Main", land: "DE", region: "dach", kategorie: "druck", monat: 11, rhythmus: 1, url: "https://formnext.mesago.com", nutzen: "Weltleitmesse Additive Fertigung — Lieferanten, Kunden, Trends.", empfehlung: "besuchen" },
  { name: "Rapid.Tech 3D", ort: "Erfurt", land: "DE", region: "dach", kategorie: "druck", monat: 5, rhythmus: 1, url: "https://www.rapidtech-3d.de", nutzen: "Anwendertagung 3D-Druck — kleiner, gut für erste Kontakte.", empfehlung: "besuchen" },
  { name: "TCT 3Sixty", ort: "Birmingham", land: "UK", region: "eu", kategorie: "druck", monat: 6, rhythmus: 1, url: "https://www.tct3sixty.com", nutzen: "3D-Druck-Messe UK — Marktblick außerhalb DACH.", empfehlung: "beobachten" },
  { name: "WIN EURASIA", ort: "Istanbul", land: "TR", region: "tr", kategorie: "druck", monat: 6, rhythmus: 1, url: "https://www.win-eurasia.com", nutzen: "Industrie-Messe Türkei inkl. Fertigung — Kontakte TR-Industrie.", empfehlung: "besuchen" },

  // E-Commerce & Produkte
  { name: "E-Commerce Berlin Expo", ort: "Berlin", land: "DE", region: "dach", kategorie: "handel", monat: 2, rhythmus: 1, url: "https://ecommerceberlin.com", nutzen: "Händler und Shop-Betreiber — Kunden für Shops und Treue-Systeme.", empfehlung: "besuchen" },
  { name: "K5 Konferenz", ort: "Berlin", land: "DE", region: "dach", kategorie: "handel", monat: 6, rhythmus: 1, url: "https://www.k5.de", nutzen: "Online-Handel-Konferenz — Entscheider aus dem Handel.", empfehlung: "besuchen" },
  { name: "SOM Swiss Online Marketing", ort: "Zürich", land: "CH", region: "dach", kategorie: "handel", monat: 4, rhythmus: 1, url: "https://www.som-expo.ch", nutzen: "E-Commerce & Online-Marketing Schweiz.", empfehlung: "besuchen" },
  { name: "Ambiente", ort: "Frankfurt am Main", land: "DE", region: "dach", kategorie: "handel", monat: 2, rhythmus: 1, url: "https://ambiente.messefrankfurt.com", nutzen: "Konsumgüter & Wohnen — Lieferanten für meaqam home.", empfehlung: "beobachten" },
  { name: "EuroShop", ort: "Düsseldorf", land: "DE", region: "dach", kategorie: "handel", monat: 2, rhythmus: 3, referenzJahr: 2026, url: "https://www.euroshop.de", nutzen: "Weltleitmesse Retail — Ladentechnik, Kassensysteme, Treue (stammo).", empfehlung: "besuchen" },
]

export type MesseTermin = Messe & { jahr: number; monateBis: number }

export function naechsteTermine(heute = new Date()): MesseTermin[] {
  const jahr = heute.getFullYear()
  const monat = heute.getMonth() + 1
  return MESSEN.map((m) => {
    let j = m.monat > monat ? jahr : jahr + 1
    if (m.rhythmus > 1 && m.referenzJahr) {
      while ((j - m.referenzJahr) % m.rhythmus !== 0) j++
    }
    return { ...m, jahr: j, monateBis: (j - jahr) * 12 + (m.monat - monat) }
  }).sort((a, b) => a.monateBis - b.monateBis || a.name.localeCompare(b.name))
}
