/*
 * Messe-Radar. Messen mit `termin` sind beim Veranstalter bestätigt (Stand
 * Okt. 2026). Alle anderen zeigen die ÜBLICHE Messezeit — die Seite sagt das
 * offen. Vor einer Buchung gilt nur die Veranstalterseite.
 */

export const MESSE_KATEGORIEN = {
  glasfaser: "Glasfaser, Telekom & Tiefbau",
  digital: "Digitale Produkte & IT",
  druck: "3D-Druck & Industrie",
  handel: "E-Commerce, Handel & Digitale Gastro",
  aussenhandel: "Außenhandel & China",
  quran: "Koran, Bildung & Islamische Medien",
  franchise: "Franchise & Gründung",
  moebel: "Möbel & Wohnen",
  mode: "Mode & Textil",
  netzwerk: "Wirtschaft, Helal & Netzwerk",
} as const
export type MesseKategorie = keyof typeof MESSE_KATEGORIEN

export const MESSE_REGIONEN = {
  dach: "DACH",
  tr: "Türkei",
  golf: "Golfstaaten",
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
  /** Üblicher Messemonat (1–12). */
  monat: number
  /** Abstand in Jahren und ein bekanntes Durchführungsjahr. */
  rhythmus: 1 | 2 | 3
  referenzJahr?: number
  /** Beim Veranstalter bestätigter Termin (ISO-Datum). */
  termin?: { von: string; bis: string }
  url: string
  nutzen: string
  empfehlung: Empfehlung
}

export const MESSEN: readonly Messe[] = [
  // Glasfaser, Telekom & Tiefbau
  { name: "ANGA COM", ort: "Köln", land: "DE", region: "dach", kategorie: "glasfaser", monat: 6, rhythmus: 1, url: "https://www.anga-com.com", nutzen: "Leitmesse Breitband & Glasfaser — Netzbetreiber, GU, Tiefbau. Beste Bühne für fibero.", empfehlung: "beobachten" },
  { name: "FIBERDAYS", ort: "Wiesbaden", land: "DE", region: "dach", kategorie: "glasfaser", monat: 5, rhythmus: 1, url: "https://www.fiberdays.de", nutzen: "BREKO-Glasfasermesse — Ausbauer und Montagefirmen, direkte fibero-Zielgruppe.", empfehlung: "beobachten" },
  { name: "FTTH Conference", ort: "wechselnd", land: "EU", region: "eu", kategorie: "glasfaser", monat: 5, rhythmus: 1, url: "https://www.ftthconference.eu", nutzen: "Europäischer FTTH-Kongress — Kontakte zu Ausbauern in ganz Europa.", empfehlung: "besuchen" },
  { name: "Broadband World Forum", ort: "Amsterdam", land: "NL", region: "eu", kategorie: "glasfaser", monat: 10, rhythmus: 1, url: "https://broadband-forum.com", nutzen: "Breitband-Strategie Europa — Netzbetreiber und Investoren.", empfehlung: "beobachten" },
  { name: "bauma", ort: "München", land: "DE", region: "dach", kategorie: "glasfaser", monat: 4, rhythmus: 3, referenzJahr: 2025, url: "https://bauma.de", nutzen: "Weltleitmesse Bau & Tiefbau — Tiefbaufirmen im Glasfaserausbau, Kunden für fibero.", empfehlung: "besuchen" },
  { name: "MWC Barcelona", ort: "Barcelona", land: "ES", region: "eu", kategorie: "glasfaser", monat: 3, rhythmus: 1, url: "https://www.mwcbarcelona.com", nutzen: "Weltgrößte Telekom-Messe — Markt- und Trendblick, weniger Montage-Kunden.", empfehlung: "beobachten" },
  { name: "Fiber Connect", ort: "USA (wechselnd)", land: "US", region: "welt", kategorie: "glasfaser", monat: 6, rhythmus: 1, url: "https://fiberbroadband.org", nutzen: "Größte Glasfaser-Messe Nordamerika — Vergleich mit dem US-Markt für fibero.", empfehlung: "beobachten" },

  // Digitale Produkte & IT
  { name: "it-sa", ort: "Nürnberg", land: "DE", region: "dach", kategorie: "digital", monat: 10, rhythmus: 1, url: "https://www.itsa365.de", nutzen: "IT-Sicherheit — Umfeld von vi-sec, Partner- und Kundengespräche.", empfehlung: "besuchen" },
  { name: "DMEXCO", ort: "Köln", land: "DE", region: "dach", kategorie: "digital", monat: 9, rhythmus: 1, url: "https://dmexco.com", nutzen: "Digital-Marketing — Agenturen, Mittelstand, Kooperationen für Web & Marke.", empfehlung: "besuchen" },
  { name: "Digital-X", ort: "Köln", land: "DE", region: "dach", kategorie: "digital", monat: 9, rhythmus: 1, url: "https://www.digital-x.eu", nutzen: "Digitalisierung im Mittelstand — Entscheider, die Software und Systeme suchen.", empfehlung: "besuchen" },
  { name: "Zukunft Handwerk", ort: "München", land: "DE", region: "dach", kategorie: "digital", monat: 3, rhythmus: 1, url: "https://www.zukunfthandwerk.com", nutzen: "Digitalisierung im Handwerk — direkt passend zur Handwerk-Seite und zum Betriebscheck.", empfehlung: "ausstellen" },
  { name: "OMR Festival", ort: "Hamburg", land: "DE", region: "dach", kategorie: "digital", monat: 5, rhythmus: 1, url: "https://omr.com/de/events/festival", nutzen: "Größtes Digital-Festival DACH — Sichtbarkeit und Netzwerk.", empfehlung: "besuchen" },
  { name: "Bits & Pretzels", ort: "München", land: "DE", region: "dach", kategorie: "digital", monat: 9, rhythmus: 1, url: "https://www.bitsandpretzels.com", nutzen: "Gründer- und Investoren-Treffen — Kapital und Partner für fibero/stammo.", empfehlung: "beobachten" },
  { name: "Hannover Messe", ort: "Hannover", land: "DE", region: "dach", kategorie: "digital", monat: 4, rhythmus: 1, url: "https://www.hannovermesse.de", nutzen: "Industrie & Digitalisierung — Mittelstand mit Software-Bedarf.", empfehlung: "besuchen" },
  { name: "GITEX Europe", ort: "Berlin", land: "DE", region: "dach", kategorie: "digital", monat: 5, rhythmus: 1, url: "https://www.gitex-europe.com", nutzen: "Tech- und Startup-Messe — Investoren, Software-Käufer, Türöffner Golfstaaten.", empfehlung: "besuchen" },
  { name: "Topsoft", ort: "Zürich", land: "CH", region: "dach", kategorie: "digital", monat: 9, rhythmus: 1, url: "https://www.topsoft.ch", nutzen: "Business-Software für Schweizer KMU — Einstieg für fibero/stammo in der Schweiz.", empfehlung: "besuchen" },
  { name: "SuisseEMEX", ort: "Zürich", land: "CH", region: "dach", kategorie: "digital", monat: 8, rhythmus: 1, url: "https://www.suisse-emex.ch", nutzen: "Marketing & Digital Schweiz — Einstieg Schweizer KMU.", empfehlung: "besuchen" },
  { name: "ViennaUP", ort: "Wien", land: "AT", region: "dach", kategorie: "digital", monat: 5, rhythmus: 1, url: "https://viennaup.com", nutzen: "Startup- und Innovationswoche Wien — Netzwerk Österreich.", empfehlung: "beobachten" },
  { name: "Web Summit", ort: "Lissabon", land: "PT", region: "eu", kategorie: "digital", monat: 11, rhythmus: 1, url: "https://websummit.com", nutzen: "Größte Tech-Konferenz Europas — Investoren, internationale Partner.", empfehlung: "beobachten" },
  { name: "VivaTech", ort: "Paris", land: "FR", region: "eu", kategorie: "digital", monat: 6, rhythmus: 1, url: "https://vivatechnology.com", nutzen: "Tech-Messe Frankreich — passt zu stammo (FR-Markt).", empfehlung: "besuchen" },
  { name: "TEKNOFEST", ort: "wechselnd", land: "TR", region: "tr", kategorie: "digital", monat: 9, rhythmus: 1, url: "https://www.teknofest.org", nutzen: "Größtes Technologie-Festival der Türkei — Sichtbarkeit, Kooperationen.", empfehlung: "beobachten" },
  { name: "Webrazzi Summit", ort: "Istanbul", land: "TR", region: "tr", kategorie: "digital", monat: 12, rhythmus: 1, url: "https://webrazzi.com", nutzen: "Digital- und Startup-Szene Türkei — Partner, Entwickler, Investoren.", empfehlung: "beobachten" },
  { name: "GITEX Global", ort: "Dubai", land: "AE", region: "welt", kategorie: "digital", monat: 10, rhythmus: 1, url: "https://www.gitex.com", nutzen: "Tech-Leitmesse Golfstaaten — Einstieg für die Golf-Vision.", empfehlung: "beobachten" },

  // 3D-Druck & Industrie
  { name: "EXPO 3D İstanbul", ort: "Istanbul (İFM)", land: "TR", region: "tr", kategorie: "druck", monat: 9, rhythmus: 1, termin: { von: "2027-09-30", bis: "2027-10-02" }, url: "https://www.expo3d.com.tr", nutzen: "3D-Druck-Messe der T��rkei — Drucker, Material, Lieferanten und Kunden direkt vor Ort.", empfehlung: "besuchen" },
  { name: "Formnext", ort: "Frankfurt am Main", land: "DE", region: "dach", kategorie: "druck", monat: 11, rhythmus: 1, url: "https://formnext.mesago.com", nutzen: "Weltleitmesse Additive Fertigung — Lieferanten, Kunden, Trends.", empfehlung: "besuchen" },
  { name: "Rapid.Tech 3D", ort: "Erfurt", land: "DE", region: "dach", kategorie: "druck", monat: 5, rhythmus: 1, url: "https://www.rapidtech-3d.de", nutzen: "Anwendertagung 3D-Druck — kleiner, gut für erste Kontakte.", empfehlung: "besuchen" },
  { name: "AMB", ort: "Stuttgart", land: "DE", region: "dach", kategorie: "druck", monat: 9, rhythmus: 2, referenzJahr: 2026, url: "https://www.messe-stuttgart.de/amb", nutzen: "Metallbearbeitung inkl. Additiv — Industrie-Mittelstand Süddeutschland.", empfehlung: "beobachten" },
  { name: "Prodex", ort: "Basel", land: "CH", region: "dach", kategorie: "druck", monat: 11, rhythmus: 2, referenzJahr: 2025, url: "https://www.prodex.ch", nutzen: "Werkzeugmaschinen & Fertigung Schweiz — Kontakte Schweizer Industrie.", empfehlung: "beobachten" },
  { name: "3D Print Lyon", ort: "Lyon", land: "FR", region: "eu", kategorie: "druck", monat: 6, rhythmus: 1, url: "https://www.3dprint-exhibition.com", nutzen: "3D-Druck-Messe Frankreich — Markt und Lieferanten.", empfehlung: "beobachten" },
  { name: "TCT 3Sixty", ort: "Birmingham", land: "UK", region: "eu", kategorie: "druck", monat: 6, rhythmus: 1, url: "https://www.tct3sixty.com", nutzen: "3D-Druck-Messe UK — Marktblick außerhalb DACH.", empfehlung: "beobachten" },
  { name: "WIN EURASIA", ort: "Istanbul", land: "TR", region: "tr", kategorie: "druck", monat: 6, rhythmus: 1, url: "https://www.win-eurasia.com", nutzen: "Industrie-Messe Türkei inkl. Fertigung — Kontakte TR-Industrie.", empfehlung: "besuchen" },
  { name: "MAKTEK Eurasia", ort: "Istanbul (TÜYAP)", land: "TR", region: "tr", kategorie: "druck", monat: 10, rhythmus: 2, referenzJahr: 2026, url: "https://www.maktekfuari.com", nutzen: "Werkzeugmaschinen & Fertigungstechnik — Industrie-Kunden in der Türkei.", empfehlung: "beobachten" },

  // E-Commerce, Handel & Gastro
  { name: "E-Commerce Berlin Expo", ort: "Berlin", land: "DE", region: "dach", kategorie: "handel", monat: 2, rhythmus: 1, url: "https://ecommerceberlin.com", nutzen: "Händler und Shop-Betreiber — Kunden für Shops und Treue-Systeme.", empfehlung: "besuchen" },
  { name: "Internet World Expo", ort: "München", land: "DE", region: "dach", kategorie: "handel", monat: 3, rhythmus: 1, url: "https://www.internetworld-expo.de", nutzen: "E-Commerce-Messe — Händler, Shop-Systeme, Dienstleister.", empfehlung: "besuchen" },
  { name: "K5 Konferenz", ort: "Berlin", land: "DE", region: "dach", kategorie: "handel", monat: 6, rhythmus: 1, url: "https://www.k5.de", nutzen: "Online-Handel-Konferenz — Entscheider aus dem Handel.", empfehlung: "besuchen" },
  { name: "SOM Swiss Online Marketing", ort: "Zürich", land: "CH", region: "dach", kategorie: "handel", monat: 4, rhythmus: 1, url: "https://www.som-expo.ch", nutzen: "E-Commerce & Online-Marketing Schweiz.", empfehlung: "besuchen" },
  { name: "INTERGASTRA", ort: "Stuttgart", land: "DE", region: "dach", kategorie: "handel", monat: 2, rhythmus: 2, referenzJahr: 2026, url: "https://www.messe-stuttgart.de/intergastra", nutzen: "Gastronomie & Hotellerie — Cafés, Imbisse, Restaurants: Kernkunden für stammo.", empfehlung: "ausstellen" },
  { name: "INTERNORGA", ort: "Hamburg", land: "DE", region: "dach", kategorie: "handel", monat: 3, rhythmus: 1, url: "https://www.internorga.com", nutzen: "Leitmesse Außer-Haus-Markt — Gastro-Ketten und Franchise: stammo-Kunden.", empfehlung: "besuchen" },
  { name: "EuroShop", ort: "Düsseldorf", land: "DE", region: "dach", kategorie: "handel", monat: 2, rhythmus: 3, referenzJahr: 2026, url: "https://www.euroshop.de", nutzen: "Weltleitmesse Retail — Ladentechnik, Kassensysteme, Treue (stammo).", empfehlung: "besuchen" },
  { name: "Paris Retail Week", ort: "Paris", land: "FR", region: "eu", kategorie: "handel", monat: 9, rhythmus: 1, url: "https://www.parisretailweek.com", nutzen: "Handel & E-Commerce Frankreich — stammo-Partner im FR-Markt.", empfehlung: "beobachten" },
  { name: "World Food Istanbul", ort: "Istanbul", land: "TR", region: "tr", kategorie: "handel", monat: 9, rhythmus: 1, url: "https://www.worldfood-istanbul.com", nutzen: "Lebensmittel-Messe Türkei — Gastro- und Handelskontakte.", empfehlung: "beobachten" },
  { name: "Gulfood", ort: "Dubai", land: "AE", region: "golf", kategorie: "handel", monat: 2, rhythmus: 1, url: "https://www.gulfood.com", nutzen: "Größte Food-Messe der Welt (helal) — Golfmarkt und Gastro-Ketten.", empfehlung: "beobachten" },

  // Franchise & Gründung
  { name: "Franchise Expo Germany", ort: "Frankfurt (Messe, The Forum)", land: "DE", region: "dach", kategorie: "franchise", monat: 11, rhythmus: 1, termin: { von: "2026-11-06", bis: "2026-11-07" }, url: "https://franchiseexpogermany.com", nutzen: "Franchise-Systeme und Gründer — stammo für Ketten (wie Vegitat), neue Systempartner.", empfehlung: "besuchen" },
  { name: "Franchise Expo Paris", ort: "Paris", land: "FR", region: "eu", kategorie: "franchise", monat: 3, rhythmus: 1, url: "https://www.franchiseparis.com", nutzen: "Größte Franchise-Messe Europas — Ketten im FR-Markt für stammo.", empfehlung: "besuchen" },
  { name: "Franchise İstanbul (UFRAD)", ort: "Istanbul", land: "TR", region: "tr", kategorie: "franchise", monat: 11, rhythmus: 1, url: "https://www.ufrad.org.tr", nutzen: "Franchise-Messe Türkei — Marken, die nach Europa wollen.", empfehlung: "beobachten" },

  // Möbel & Wohnen
  { name: "ANAMOB", ort: "Kayseri (OSB Messezentrum)", land: "TR", region: "tr", kategorie: "moebel", monat: 10, rhythmus: 1, url: "https://www.anamob.com", nutzen: "Anatolische Möbelmesse — Hersteller direkt, Lieferanten für meaqam home.", empfehlung: "besuchen" },
  { name: "İstanbul Mobilya Fuarı (IIFF)", ort: "Istanbul (İFM)", land: "TR", region: "tr", kategorie: "moebel", monat: 1, rhythmus: 1, url: "https://www.iiff.com.tr", nutzen: "Größte Möbelmesse der Türkei — Export-Hersteller für Dropshipping.", empfehlung: "besuchen" },
  { name: "MODEF EXPO", ort: "Inegöl / Bursa", land: "TR", region: "tr", kategorie: "moebel", monat: 9, rhythmus: 1, url: "https://www.modefexpo.com", nutzen: "Möbelzentrum İnegöl — viele Fabriken, gute Einkaufspreise.", empfehlung: "beobachten" },
  { name: "HOMETEX", ort: "Istanbul (İFM)", land: "TR", region: "tr", kategorie: "moebel", monat: 5, rhythmus: 1, termin: { von: "2027-05-25", bis: "2027-05-29" }, url: "https://www.hometex.com.tr", nutzen: "Heimtextil-Messe — Lieferanten für Textil und Wohnen (meaqam home).", empfehlung: "besuchen" },
  { name: "Heimtextil", ort: "Frankfurt am Main", land: "DE", region: "dach", kategorie: "moebel", monat: 1, rhythmus: 1, url: "https://heimtextil.messefrankfurt.com", nutzen: "Weltleitmesse Heimtextilien — Trends, Lieferanten, Händler.", empfehlung: "beobachten" },
  { name: "Ambiente", ort: "Frankfurt am Main", land: "DE", region: "dach", kategorie: "moebel", monat: 2, rhythmus: 1, url: "https://ambiente.messefrankfurt.com", nutzen: "Konsumgüter & Wohnen — Lieferanten für meaqam home.", empfehlung: "beobachten" },
  { name: "Salone del Mobile", ort: "Mailand", land: "IT", region: "eu", kategorie: "moebel", monat: 4, rhythmus: 1, url: "https://www.salonemilano.it", nutzen: "Weltleitmesse Möbeldesign — Marktblick und Premium-Trends.", empfehlung: "beobachten" },
  { name: "Maison&Objet", ort: "Paris", land: "FR", region: "eu", kategorie: "moebel", monat: 1, rhythmus: 1, url: "https://www.maison-objet.com", nutzen: "Wohnen & Deko — Händler und Concept Stores.", empfehlung: "beobachten" },

  // Mode & Textil
  { name: "IFCO Istanbul Fashion Connection", ort: "Istanbul (İFM)", land: "TR", region: "tr", kategorie: "mode", monat: 2, rhythmus: 1, url: "https://www.ifco.com.tr", nutzen: "Modemesse Türkei — Hersteller und Marken für den meaqam-Modeshop.", empfehlung: "besuchen" },
  { name: "IF Wedding Fashion İzmir", ort: "Izmir", land: "TR", region: "tr", kategorie: "mode", monat: 7, rhythmus: 1, url: "https://www.ifweddingfashion.com", nutzen: "Brautmode & Abendmode — Exporthersteller.", empfehlung: "beobachten" },
  { name: "Texworld Paris", ort: "Paris", land: "FR", region: "eu", kategorie: "mode", monat: 9, rhythmus: 1, url: "https://texworld-paris.fr.messefrankfurt.com", nutzen: "Stoffe & Bekleidungsproduktion — Lieferkette für Mode.", empfehlung: "beobachten" },
  { name: "Who's Next", ort: "Paris", land: "FR", region: "eu", kategorie: "mode", monat: 9, rhythmus: 1, url: "https://whosnext.com", nutzen: "Modemesse für Marken und Einzelhandel — Absatzkanal Europa.", empfehlung: "beobachten" },

  // Wirtschaft, Helal & Netzwerk
  { name: "Helal Expo / World Halal Summit", ort: "Istanbul (İFM)", land: "TR", region: "tr", kategorie: "netzwerk", monat: 11, rhythmus: 1, termin: { von: "2026-11-25", bis: "2026-11-28" }, url: "https://www.helalexpo.com.tr", nutzen: "Helal-Wirtschaft weltweit — Golfstaaten, Lebensmittel, Handel; Netzwerk für Gastro und Export.", empfehlung: "besuchen" },
  { name: "MÜSİAD EXPO", ort: "Istanbul (İFM)", land: "TR", region: "tr", kategorie: "netzwerk", monat: 9, rhythmus: 2, referenzJahr: 2026, url: "https://www.musiadexpo.org", nutzen: "Größte Unternehmermesse der Türkei — Firmen aus über 100 Ländern, Golf- und Export-Kontakte.", empfehlung: "ausstellen" },

  // Außenhandel & China (ohne Reise nach China)
  { name: "China Homelife Türkiye", ort: "Istanbul", land: "TR", region: "tr", kategorie: "aussenhandel", monat: 6, rhythmus: 1, url: "https://www.meorient.com", nutzen: "Chinesische Hersteller stellen in Istanbul aus — Einkauf und Partner ohne Reise nach China.", empfehlung: "besuchen" },
  { name: "Canton Fair Europe-Partnertage", ort: "wechselnd (Europa)", land: "EU", region: "eu", kategorie: "aussenhandel", monat: 6, rhythmus: 1, url: "https://www.cantonfair.org.cn/en-US", nutzen: "Vertreter der Canton Fair in Europa — Zugang zu China-Lieferanten vor Ort.", empfehlung: "beobachten" },

  // Golfstaaten: Digital, Koran & Bildung
  { name: "LEAP", ort: "Riad (Malham)", land: "SA", region: "golf", kategorie: "digital", monat: 2, rhythmus: 1, url: "https://onegiantleap.com", nutzen: "Größte Tech-Messe Saudi-Arabiens — Investoren und Käufer für digitale Produkte im Golf.", empfehlung: "besuchen" },
  { name: "Riyadh International Book Fair", ort: "Riad", land: "SA", region: "golf", kategorie: "quran", monat: 10, rhythmus: 1, url: "https://literature.moc.gov.sa", nutzen: "Größte Buchmesse am Golf — Verlage für Koran, Tafsir und islamische Bildung, digitale Formate.", empfehlung: "besuchen" },
  { name: "Sharjah International Book Fair", ort: "Sharjah (Expo Centre)", land: "AE", region: "golf", kategorie: "quran", monat: 11, rhythmus: 1, url: "https://www.sibf.com", nutzen: "Eine der größten Buchmessen der Welt — Koran-Verlage, Bildungsträger, digitale Lernprodukte.", empfehlung: "besuchen" },
]

/** Stabiler Schlüssel für Status und Vorschläge. */
export function messeKey(name: string): string {
  return name
    .toLocaleLowerCase("de")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export type MesseTermin = Messe & { jahr: number; monateBis: number; bestaetigt: boolean }

const MONATE_KURZ = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

export function naechsteTermine<T extends Messe>(heute = new Date(), liste: readonly T[] = MESSEN as readonly T[]): (T & MesseTermin)[] {
  const jahr = heute.getFullYear()
  const monat = heute.getMonth() + 1
  const heuteIso = heute.toISOString().slice(0, 10)

  return liste.map((m) => {
    if (m.termin && m.termin.bis >= heuteIso) {
      const j = Number(m.termin.von.slice(0, 4))
      const mo = Number(m.termin.von.slice(5, 7))
      return { ...m, monat: mo, jahr: j, monateBis: (j - jahr) * 12 + (mo - monat), bestaetigt: true }
    }
    const terminJahr = m.termin ? Number(m.termin.von.slice(0, 4)) : undefined
    const ref = m.referenzJahr ?? terminJahr
    let j = m.monat > monat ? jahr : jahr + 1
    if (terminJahr) j = Math.max(j, terminJahr + m.rhythmus)
    if (m.rhythmus > 1 && ref) {
      while ((j - ref) % m.rhythmus !== 0) j++
    }
    return { ...m, jahr: j, monateBis: (j - jahr) * 12 + (m.monat - monat), bestaetigt: false }
  }).sort((a, b) => a.monateBis - b.monateBis || a.name.localeCompare(b.name))
}

function tag(iso: string) {
  return Number(iso.slice(8, 10))
}

/** "6.–7. Nov 2026" bei bestätigtem Termin, sonst "Okt 2027 · übliche Zeit". */
export function terminLabel(t: MesseTermin): string {
  if (t.bestaetigt && t.termin) {
    const { von, bis } = t.termin
    const mVon = Number(von.slice(5, 7))
    const mBis = Number(bis.slice(5, 7))
    const spanne =
      mVon === mBis
        ? `${tag(von)}.–${tag(bis)}. ${MONATE_KURZ[mBis - 1]}`
        : `${tag(von)}. ${MONATE_KURZ[mVon - 1]} – ${tag(bis)}. ${MONATE_KURZ[mBis - 1]}`
    return `${spanne} ${bis.slice(0, 4)}`
  }
  return `${MONATE_KURZ[t.monat - 1]} ${t.jahr} · übliche Zeit`
}
