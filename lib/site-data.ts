// Alle Inhalte sind echt. Keine erfundenen Zahlen, Zitate oder Auszeichnungen.
//
// CEO-Entscheidung (gesperrt):
//   Eigene Produkte = meAI · fibero · CASSAMEA · meahv  — mehr nicht.
//   NÛR · Bir Damla Hayır · Rumi's Maison = Kundenwerk / Dienstleistung.
//   PLANEX gehört nicht zu creaDIG und kommt nirgends vor.

export type Region = "DE" | "CH" | "DE & CH"

export type ProductLogo = {
  name: string
  /** Echtes Logo unter public/brand/products/ — null, solange keins vorliegt. */
  logoPath: string | null
  /** Monogramm-Platzhalter, solange kein echtes Logo vorliegt (kein kaputtes <img>). */
  mark: string
  region: Region
  /** Markenfarbe für den Graustufe-→-Farbe-Hover. */
  color: string
}

export type BrandLogo = {
  name: string
  logoPath: string | null
  mark: string
  region: Region
  color: string
  /** Freigabe für die Bezeichnung „Kunde/Partner" liegt noch nicht vor. */
  approved: boolean
}

/** Die vier eigenen Produkte des Hauses. */
export const ownProducts: ProductLogo[] = [
  // TODO: Echtes meAI-Logo ergänzen → public/brand/products/meai.svg
  { name: "meAI", logoPath: null, mark: "me", color: "#be904e", region: "DE & CH" },
  { name: "fibero", logoPath: "/brand/products/fibero.svg", mark: "fb", color: "#dab149", region: "DE" },
  {
    name: "CASSAMEA",
    logoPath: "/brand/products/cassamea.svg",
    mark: "CA",
    color: "#f0743c",
    region: "CH",
  },
  // TODO: Echtes meahv-Logo ergänzen → public/brand/products/meahv.svg
  { name: "meahv", logoPath: null, mark: "hv", color: "#8f6a33", region: "DE" },
]

/**
 * Marken, mit denen wir im Tagesgeschäft zu tun hatten.
 * `approved: false` = keine Freigabe für „unser Kunde" → neutrale Beschriftung,
 * keine Behauptung einer Geschäfts- oder Partnerbeziehung.
 */
export const brands: BrandLogo[] = [
  { name: "Deutsche Telekom", logoPath: null, mark: "T", color: "#e20074", region: "DE", approved: false },
  {
    name: "Glasfaser NordWest",
    logoPath: null,
    mark: "GN",
    color: "#0a5ca8",
    region: "DE",
    approved: false,
  },
  { name: "1&1", logoPath: null, mark: "1&1", color: "#1a4fa0", region: "DE", approved: false },
  { name: "Drillisch", logoPath: null, mark: "DR", color: "#e2001a", region: "DE", approved: false },
  { name: "MAS MöbelAufbauService", logoPath: null, mark: "MAS", color: "#b45309", region: "DE", approved: false },
  { name: "Wartungsprofis", logoPath: null, mark: "WP", color: "#166534", region: "DE", approved: false },
  { name: "BÜEM", logoPath: null, mark: "BÜ", color: "#1e3a5f", region: "DE", approved: false },
  { name: "MEDILUXURY", logoPath: null, mark: "ML", color: "#7c2d5e", region: "DE & CH", approved: false },
]

export type Work = {
  slug: string
  name: string
  what: string
  built: string
  outcome: string
  kind: "Produkt" | "Kundenwerk"
  region: Region
  /** Illustratives Mockup — kein Screenshot. null = Monogramm-Panel statt Bild. */
  image: string | null
  /** Monogramm für Karten ohne Bild. */
  mark: string
  href?: string
  live?: boolean
}

/** Eigene Produkte — die großen Cases. */
export const productWorks: Work[] = [
  {
    slug: "meai",
    name: "meAI",
    what: "KI-Business-Betriebssystem für kleine und mittlere Betriebe.",
    built: "Produktarchitektur, KI-Logik, Dashboard, Betrieb — von Grund auf.",
    outcome: "Im Aufbau · live unter meai.run",
    kind: "Produkt",
    region: "DE & CH",
    image: "/works/meai.png",
    mark: "me",
    href: "https://meai.run",
    live: true,
  },
  {
    slug: "fibero",
    name: "fibero",
    what: "Ordnung und Klarheit im Glasfaser-Alltag: Auftrags-, Abrechnungs- und Finanzlogik.",
    built: "Operative Prozesse, Abrechnungssystem, Auswertung.",
    outcome: "Im Tagesbetrieb",
    kind: "Produkt",
    region: "DE",
    image: "/works/fibero.png",
    mark: "fb",
    live: true,
  },
  {
    slug: "cassamea",
    name: "CASSAMEA",
    what: "Die Kasse, die mitdenkt — für die Gastronomie, gebaut für Schweizer Anforderungen.",
    built: "Kassen-Software, Backoffice, Schweizer Anforderungen.",
    outcome: "Im Aufbau",
    kind: "Produkt",
    region: "CH",
    image: "/works/cassamea.png",
    mark: "CA",
  },
  {
    slug: "meahv",
    name: "meahv",
    what: "Hausverwaltungs-System: Objekte, Mieter, Belege und Abrechnung an einem Ort.",
    built: "Datenmodell, Verwaltungslogik, Abrechnung.",
    outcome: "Im Aufbau",
    kind: "Produkt",
    region: "DE",
    // Noch kein Mockup — die Karte rendert ein Monogramm-Panel statt eines leeren Bildes.
    image: null,
    mark: "hv",
  },
]

/** Kundenwerk / Dienstleistung — ausdrücklich KEIN eigenes Produkt. */
export const clientWorks: Work[] = [
  {
    slug: "nur",
    name: "NÛR",
    what: "Qur'an-Plattform — Marke, Oberfläche und Inhalte.",
    built: "Marke, Web, Inhaltsstruktur.",
    outcome: "Kundenwerk",
    kind: "Kundenwerk",
    region: "DE & CH",
    image: null,
    mark: "NÛ",
  },
  {
    slug: "bir-damla-hayir",
    name: "Bir Damla Hayır",
    what: "Spendenplattform mit transparenter Mittelverwendung.",
    built: "Plattform, Spendenfluss, Verwaltung.",
    outcome: "Kundenwerk",
    kind: "Kundenwerk",
    region: "DE",
    image: "/works/bir-damla-hayir.png",
    mark: "BD",
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
    mark: "RM",
  },
]

/**
 * Was sonst noch unter dem Dach läuft. `creaDIG fiber` ist das operative
 * Glasfaser-Geschäft (der Motor) — nicht zu verwechseln mit dem Produkt fibero.
 */
export const furtherProjects = [
  { name: "creaDIG fiber", what: "Glasfaser-Geschäft mit Subunternehmern", kind: "Betrieb" as const },
  { name: "Ops-Retainer", what: "Operations-System für Handwerksbetriebe", kind: "Dienstleistung" as const },
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
  // TODO: Gründungsjahr vom Owner bestätigen lassen (KIZILELMA §4b markiert es als offen).
  { value: "2018", key: "since" as const },
  { value: "4", key: "products" as const },
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

/**
 * Zertifizierungen & Mitgliedschaften — ausschließlich echte, nachweisbare Einträge.
 * Nichts wird erfunden, nichts geschönt.
 *
 * `logoPath` bleibt `null`, solange das offizielle Badge-Logo nicht vorliegt.
 * Die Kachel rendert dann eine saubere getypte Variante — nie ein kaputtes <img>.
 * TODO (Owner): offizielle Badges nach `public/badges/<slug>.svg` legen und
 * hier `logoPath` setzen. Nutzungsbedingungen der jeweiligen Stelle beachten.
 */
export type Certification = {
  slug: "go-digital" | "bafa" | "iuk" | "avpq" | "agd"
  /** Offizielles Badge-Logo unter public/badges/ — null, solange keins vorliegt. */
  logoPath: string | null
  /** Kürzel für die getypte Kachel. */
  mark: string
  /** Eigenname — bewusst nicht übersetzt. */
  name: string
  /** Offizielle Quelle zum Nachprüfen. */
  href: string
}

export const certifications: Certification[] = [
  {
    slug: "go-digital",
    logoPath: null,
    mark: "gd",
    name: "go-digital",
    href: "https://www.bmwk.de/Redaktion/DE/Artikel/Digitale-Welt/foerderprogramm-go-digital.html",
  },
  {
    slug: "bafa",
    logoPath: null,
    mark: "BAFA",
    name: "Bundesamt für Wirtschaft und Ausfuhrkontrolle",
    href: "https://www.bafa.de",
  },
  {
    slug: "iuk",
    logoPath: null,
    mark: "iuk",
    name: "iuk unternehmensnetzwerk osnabrück e.v.",
    href: "https://www.iuk-os.de",
  },
  {
    slug: "avpq",
    logoPath: null,
    mark: "AVPQ",
    name: "Amtliche Verzeichnis Präqualifizierter Unternehmen (AVPQ)",
    href: "https://www.amtliches-verzeichnis.ihk.de",
  },
  {
    slug: "agd",
    logoPath: null,
    mark: "AGD",
    name: "Allianz deutscher Designer (AGD)",
    href: "https://agd.de",
  },
]

export const contact = {
  whatsapp: "+41 76 504 58 79",
  whatsappHref: "https://wa.me/41765045879",
  // Adresse der bisherigen Live-Seite — bewusst beibehalten, damit nichts bricht.
  email: "hallo@creadig.de",
  locations: "Diepholz (DE) · Schweiz",
}
