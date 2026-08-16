// Alle Inhalte sind echt. Keine erfundenen Zahlen, Zitate oder Auszeichnungen.

export type Region = "DE" | "CH" | "DE & CH"

export type ProductLogo = {
  name: string
  /** TODO: Echtes Logo hier ablegen → assets/logos/produkte/ */
  logoPath: string
  /** Monogramm-Platzhalter, solange kein echtes Logo vorliegt. */
  mark: string
  region: Region
  /** Markenfarbe für den Graustufe-→-Farbe-Hover. */
  color: string
}

export type BrandLogo = {
  name: string
  /** TODO: Echtes Logo hier ablegen → assets/logos/kunden/ */
  logoPath: string
  mark: string
  region: Region
  /** Markenfarbe für den Graustufe-→-Farbe-Hover. */
  color: string
  /** Freigabe für die Bezeichnung „Kunde/Partner" liegt noch nicht vor. */
  approved: boolean
}

export const ownProducts: ProductLogo[] = [
  { name: "meAI", logoPath: "assets/logos/produkte/meai.svg", mark: "me", color: "#4f46e5", region: "DE & CH" },
  { name: "FIBERO", logoPath: "assets/logos/produkte/fibero.svg", mark: "FB", color: "#0f8a5f", region: "DE" },
  { name: "CASSAMEA", logoPath: "assets/logos/produkte/cassamea.svg", mark: "CA", color: "#b3122c", region: "CH" },
  { name: "PLANEX", logoPath: "assets/logos/produkte/planex.svg", mark: "PX", color: "#1d4ed8", region: "DE" },
  { name: "NÛR", logoPath: "assets/logos/produkte/nur.svg", mark: "NÛ", color: "#0f766e", region: "DE & CH" },
  {
    name: "Bir Damla Hayır",
    logoPath: "assets/logos/produkte/bir-damla-hayir.svg",
    mark: "BD",
    color: "#c2410c",
    region: "DE",
  },
]

export const brands: BrandLogo[] = [
  {
    name: "Deutsche Telekom",
    logoPath: "assets/logos/kunden/telekom.svg",
    mark: "T",
    color: "#e20074",
    region: "DE",
    approved: false,
  },
  {
    name: "Glasfaser NordWest",
    logoPath: "assets/logos/kunden/glasfaser-nordwest.svg",
    mark: "GN",
    color: "#0a5ca8",
    region: "DE",
    approved: false,
  },
  { name: "1&1", logoPath: "assets/logos/kunden/1und1.svg", mark: "1&1", color: "#1a4fa0", region: "DE", approved: false },
  {
    name: "Drillisch",
    logoPath: "assets/logos/kunden/drillisch.svg",
    mark: "DR",
    color: "#e2001a",
    region: "DE",
    approved: false,
  },
  {
    name: "MAS MöbelAufbauService",
    logoPath: "assets/logos/kunden/mas.svg",
    mark: "MAS",
    color: "#b45309",
    region: "DE",
    approved: false,
  },
  {
    name: "Wartungsprofis",
    logoPath: "assets/logos/kunden/wartungsprofis.svg",
    mark: "WP",
    color: "#166534",
    region: "DE",
    approved: false,
  },
  { name: "BÜEM", logoPath: "assets/logos/kunden/blueem.svg", mark: "BÜ", color: "#1e3a5f", region: "DE", approved: false },
  {
    name: "MEDILUXURY",
    logoPath: "assets/logos/kunden/mediluxury.svg",
    mark: "ML",
    color: "#7c2d5e",
    region: "DE & CH",
    approved: false,
  },
]

export type Work = {
  slug: string
  name: string
  what: string
  built: string
  outcome: string
  kind: "Produkt" | "Kundenwerk"
  region: Region
  /** TODO: Durch echtes Produkt-Mockup ersetzen → assets/works/ */
  image: string
  href?: string
  live?: boolean
  featured: boolean
}

export const works: Work[] = [
  {
    slug: "meai",
    name: "meAI",
    what: "KI-Business-Betriebssystem für kleine und mittlere Betriebe.",
    built: "Produktarchitektur, KI-Logik, Dashboard, Betrieb — von Grund auf.",
    outcome: "Live im Einsatz",
    kind: "Produkt",
    region: "DE & CH",
    image: "/works/meai.png",
    href: "https://meai.run",
    live: true,
    featured: true,
  },
  {
    slug: "fibero",
    name: "FIBERO",
    what: "Glasfaser- und Telekom-Dienstleistung mit eigenem Finanz- und Rechnungssystem.",
    built: "Operatives Geschäft, Abrechnungssystem, Prozesse und Betrieb.",
    outcome: "Im Tagesbetrieb",
    kind: "Produkt",
    region: "DE",
    image: "/works/fibero.png",
    live: true,
    featured: true,
  },
  {
    slug: "cassamea",
    name: "CASSAMEA",
    what: "Das Kassensystem, das mitdenkt — für die Gastronomie, für die Schweiz.",
    built: "Kassen-Software, Backoffice, Schweizer Anforderungen.",
    outcome: "Gastronomie DE & CH",
    kind: "Produkt",
    region: "CH",
    image: "/works/cassamea.png",
    featured: true,
  },
  {
    slug: "rumis-maison",
    name: "Rumi's Maison",
    what: "Markenauftritt und Website für eine Lifestyle-Marke.",
    built: "Marke, Web, Inhalte, laufende Betreuung.",
    outcome: "Kundenwerk",
    kind: "Kundenwerk",
    region: "DE",
    image: "/works/rumis-maison.png",
    featured: true,
  },
  {
    slug: "planex",
    name: "PLANEX",
    what: "Einsatzplanung für Teams im Außendienst und Handwerk.",
    built: "Planungslogik, Oberfläche, Rollen und Rechte.",
    outcome: "Eigenes Produkt",
    kind: "Produkt",
    region: "DE",
    image: "/works/planex.png",
    featured: true,
  },
  {
    slug: "bir-damla-hayir",
    name: "Bir Damla Hayır",
    what: "Spendenplattform mit transparenter Mittelverwendung.",
    built: "Plattform, Spendenfluss, Verwaltung.",
    outcome: "Eigenes Produkt",
    kind: "Produkt",
    region: "DE",
    image: "/works/bir-damla-hayir.png",
    featured: true,
  },
]

export const furtherProjects = [
  { name: "NÛR", what: "Qur'an-Plattform", kind: "Produkt" as const },
  { name: "ENIGMA", what: "Markenprojekt", kind: "Kundenwerk" as const },
  { name: "Hausverwaltung", what: "Verwaltungssystem", kind: "Kundenwerk" as const },
]

export const navLinks = [
  { id: "leistungen", labelKey: "leistungen" as const },
  { id: "produkte", labelKey: "produkte" as const },
  { id: "arbeiten", labelKey: "arbeiten" as const },
  { id: "ueber-uns", labelKey: "ueber" as const },
  { id: "pakete", labelKey: "pakete" as const },
  { id: "kontakt", labelKey: "kontakt" as const },
]

/** Echte Signale statt erfundener Kennzahlen. */
export const impactSignals = [
  { value: "2018", key: "since" as const },
  { value: "6+", key: "products" as const },
  { value: "DE / CH", key: "regions" as const },
  { value: "A–Z", key: "scope" as const },
]

/** Die fünf Ebenen — aufsteigende Architektur. */
export const serviceLayers = [
  { level: "01", key: "identity" as const },
  { level: "02", key: "digital" as const },
  { level: "03", key: "operations" as const },
  { level: "04", key: "automation" as const },
  { level: "05", key: "intelligence" as const },
]

export const processSteps = [
  { step: "01", key: "understand" as const },
  { step: "02", key: "build" as const },
  { step: "03", key: "operate" as const },
]

export const packages = [
  { key: "identity" as const, price: "€350", recommended: false },
  { key: "growth" as const, price: "€500", recommended: true },
  { key: "architecture" as const, price: "€1.500", recommended: false },
]

export const meaiCapabilityKeys = ["overview", "tasks", "documents", "decisions"] as const

export const contact = {
  whatsapp: "+41 76 504 58 79",
  whatsappHref: "https://wa.me/41765045879",
  // TODO: Echte Geschäfts-E-Mail und Impressum-Adresse ergänzen.
  email: "kontakt@creadig.de",
  locations: "Diepholz (DE) · Schweiz",
}
