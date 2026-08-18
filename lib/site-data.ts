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
  /**
   * Branche in zwei bis drei Worten — die dichte Register-Ansicht (B2) hat
   * keinen Platz fuer den ganzen `what`-Satz. Abgeleitet aus dem, was das
   * Projekt tatsaechlich ist; nichts dazuerfunden.
   */
  sector: string
  /**
   * Jahr der Umsetzung. `null`, solange es nicht belegt ist — und dann steht
   * im Register schlicht nichts. Ein geschaetztes Jahr waere eine erfundene
   * Angabe, und die Regel dagegen ist gesperrt.
   *
   * TODO (Owner): echte Jahreszahlen nachtragen.
   */
  year: string | null
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
    sector: "KI · Business-Software",
    year: null,
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
    sector: "Glasfaser · Operations",
    year: null,
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
    sector: "Gastronomie · Kasse",
    year: null,
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
    sector: "Immobilien · Verwaltung",
    year: null,
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
    sector: "Bildung · Plattform",
    year: null,
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
    sector: "Gemeinnützig · Spenden",
    year: null,
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
    sector: "Lifestyle · Marke",
    year: null,
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
 * Referenzregister (B2) — dieselben Projekte, dichte Listenansicht.
 *
 * Bewusst KEINE zweite Quelle: Wer hier eine eigene Liste pflegen wuerde,
 * haette in vier Wochen zwei Wahrheiten. Das Register ist eine andere
 * Darstellung derselben Werke — eigene Produkte zuerst, dann Kundenwerk,
 * durchnummeriert 01…n.
 */
export const registryWorks: Work[] = [...productWorks, ...clientWorks]

/* ==========================================================================
 * CASE-STUDIES — Problem → Lösung → Ergebnis (E-K1)
 *
 * Das Format, mit dem Wettbewerber gewinnen: nicht „wir haben eine Website
 * gebaut", sondern „der Betrieb hatte X, wir haben Y gebaut, seither Z".
 *
 * Die Struktur steht. Der Inhalt NICHT — und er wird hier auch nicht
 * erfunden. Jeder Eintrag braucht `approved: true`, und das heißt: eine
 * schriftliche Freigabe des Kunden für genau diesen Text liegt vor. Ohne
 * Freigabe rendert die Sektion gar nicht, statt mit Platzhaltern zu füllen.
 *
 * Zweisprachig als Feld-Paar, damit ein halb übersetzter Fall gar nicht erst
 * ins Repo kommt — der Compiler verlangt beide Sprachen.
 * ========================================================================== */

/** Ein Text in beiden Sprachen. Fehlt eine, meckert der Compiler. */
export type Localized = { de: string; tr: string }

export type CaseStudy = {
  slug: string
  /** Kundenname exakt so, wie er freigegeben wurde. */
  client: string
  /** Branche/Ort — Einordnung, keine Bewertung. */
  context: Localized
  /** Ausgangslage beim Kunden, in dessen Worten oder von ihm bestätigt. */
  problem: Localized
  /** Was wir gebaut oder geändert haben. */
  solution: Localized
  /**
   * Ergebnis — ausschließlich Nachweisbares. Keine Prozentzahl ohne Quelle,
   * keine „Umsatz verdreifacht"-Behauptung ohne Beleg des Kunden.
   */
  result: Localized
  image: string | null
  /** Monogramm, solange kein Bild vorliegt. */
  mark: string
  /** Schriftliche Freigabe des Kunden liegt vor. */
  approved: boolean
}

/**
 * LEER, und das ist der ehrliche Zustand.
 *
 * TODO (Owner): 2–3 Kunden um eine kurze Freigabe bitten, dann hier
 * eintragen. Vorlage:
 *
 *   {
 *     slug: "beispiel-betrieb",
 *     client: "Beispiel GmbH",
 *     context: { de: "Handwerk · Osnabrück", tr: "Zanaat · Osnabrück" },
 *     problem: { de: "…", tr: "…" },
 *     solution: { de: "…", tr: "…" },
 *     result: { de: "…", tr: "…" },
 *     image: null,
 *     mark: "BG",
 *     approved: true,
 *   }
 */
export const caseStudies: CaseStudy[] = []

/** Nur Freigegebenes verlässt die Datei. */
export const approvedCaseStudies = caseStudies.filter((c) => c.approved)

/* ==========================================================================
 * BEWERTUNGEN (E-K2)
 *
 * Der größte fehlende Vertrauens-Hebel. Und der, bei dem am meisten
 * geschummelt wird — deshalb hier die schärfsten Regeln des Repos:
 *
 *  1. Nur echte, nachprüfbare Bewertungen. Kein „sinngemäß", kein „so hat
 *     ein Kunde es mal gesagt", keine zusammengefassten Stimmen.
 *  2. Der Wortlaut wird NICHT übersetzt. Eine übersetzte Bewertung ist ein
 *     Text, den der Mensch so nie geschrieben hat. Sie erscheint in ihrer
 *     Originalsprache, in beiden Sprachfassungen der Seite.
 *  3. `AggregateRating` erscheint erst, wenn es echte Sterne gibt — eine
 *     erfundene Sterne-Auszeichnung in der Google-Suche wäre nicht nur
 *     unehrlich, sondern ein Verstoß gegen Googles Richtlinien.
 * ========================================================================== */

export type Review = {
  id: string
  /** Name so, wie er öffentlich steht (z. B. bei Google). */
  name: string
  /** Datum der Bewertung, ISO (YYYY-MM-DD). */
  date: string
  /** Originalwortlaut. Wird nicht übersetzt, nicht gekürzt, nicht geglättet. */
  text: string
  /** Sprache des Originals — für `<blockquote lang>`. */
  lang: "de" | "tr"
  /** Wo sie steht. `google` erlaubt die Verlinkung zum Nachprüfen. */
  source: "google" | "kunde"
  /** Direktlink zur Quelle, wo vorhanden. */
  sourceUrl?: string
  /** 1–5. `null`, wenn die Quelle keine Sterne vergibt. */
  rating: number | null
  /** Veröffentlichung ist abgesprochen. */
  approved: boolean
}

/**
 * LEER. Kein einziger Platzhalter.
 *
 * TODO (Owner): zufriedene Altkunden um eine Google-Bewertung bitten und die
 * echten Einträge hier eintragen — Name, Datum, Wortlaut, Link.
 */
export const reviews: Review[] = []

export const approvedReviews = reviews.filter((r) => r.approved)

/** Bewertungen mit Sternen — nur die zählen für den Durchschnitt. */
const ratedReviews = approvedReviews.filter((r) => typeof r.rating === "number")

/**
 * Durchschnitt und Anzahl — oder `null`, wenn es nichts zu mitteln gibt.
 * Bewusst kein Default wie „5,0 (0 Bewertungen)".
 */
export const aggregateRating =
  ratedReviews.length > 0
    ? {
        value:
          Math.round(
            (ratedReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratedReviews.length) * 10,
          ) / 10,
        count: ratedReviews.length,
      }
    : null

/* ==========================================================================
 * SOCIAL-PROFILE (E-K7)
 *
 * Vorher standen im Footer drei tote Kästchen mit „IG / LI / YT" — sie sahen
 * aus wie Links, führten aber nirgendwohin. Ein toter Link ist schlechter als
 * kein Link: er verspricht eine Präsenz, die es nicht gibt.
 *
 * Leer = der Block verschwindet. Gefüllt = echte Links, die zugleich als
 * `sameAs` in die Organisations-Daten für Suchmaschinen gehen.
 *
 * TODO (Owner): echte Profil-URLs eintragen oder es bei leer belassen.
 */
export type SocialProfile = {
  /** Kürzel für die Kachel. */
  label: string
  /** Voller Name für Screenreader und aria-label. */
  name: string
  url: string
}

export const socialProfiles: SocialProfile[] = []

/**
 * Was sonst noch unter dem Dach läuft. `creaDIG fiber` ist das operative
 * Glasfaser-Geschäft (der Motor) — nicht zu verwechseln mit dem Produkt fibero.
 */
export const furtherProjects = [
  { name: "creaDIG fiber", what: "Glasfaser-Geschäft mit Subunternehmern", kind: "Betrieb" as const },
  { name: "Ops-Retainer", what: "Operations-System für Handwerksbetriebe", kind: "Dienstleistung" as const },
]

/**
 * Reihenfolge = Reihenfolge auf der Seite (app/page.tsx).
 *
 * Vorher stand „Leistungen" an erster Stelle, lag auf der Seite aber HINTER
 * Produkten und Arbeiten. Wer oben links klickte, sprang nach unten und
 * scrollte dann zurueck — die Leiste log ueber den Seitenaufbau.
 * Wer die Sektionsreihenfolge in page.tsx aendert, aendert sie hier mit.
 */
export const navLinks = [
  { id: "produkte", labelKey: "produkte" as const },
  { id: "arbeiten", labelKey: "arbeiten" as const },
  { id: "leistungen", labelKey: "leistungen" as const },
  { id: "ueber-uns", labelKey: "ueber" as const },
  { id: "pakete", labelKey: "pakete" as const },
  { id: "kontakt", labelKey: "kontakt" as const },
]

/** Echte Signale statt erfundener Kennzahlen. */
export const impactSignals = [
  // Gründungsjahr 2017 — vom Inhaber bestätigt (2026-08-17).
  { value: "2017", key: "since" as const },
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

/**
 * Die vier operativen Schritte (B4).
 *
 * `processSteps` beantwortet „wie arbeitet ihr" — eine Haltung. Das ist
 * richtig, aber es beantwortet nicht die Frage, die ein Interessent vor dem
 * Absenden tatsaechlich hat: „Was passiert, wenn ich jetzt schreibe?"
 * Genau das steht hier — vier Schritte, vom ersten Kontakt bis zum Betrieb.
 */
export const opsSteps = [
  { step: "01", key: "request" as const },
  { step: "02", key: "analysis" as const },
  { step: "03", key: "offer" as const },
  { step: "04", key: "operate" as const },
]

/**
 * Die drei Stufen (E-K3).
 *
 * `tier` macht die Reihenfolge zur Aussage: 01 ist der Einstieg, 03 das
 * Vollbild. `recommended` setzt genau EINEN Anker — und der ist als
 * „Unsere Empfehlung" beschriftet, nicht als „beliebteste Wahl". Ohne
 * Verkaufszahlen wäre Letzteres eine Behauptung; unsere Empfehlung ist
 * nachprüfbar unsere.
 *
 * `amount` ist der Preis als Zahl für schema.org — dieselbe Quelle wie die
 * angezeigte Zeichenkette, damit beides nicht auseinanderlaufen kann.
 */
export const packages = [
  { key: "identity" as const, tier: "01", price: "€350", amount: 350, period: null, recommended: false },
  { key: "growth" as const, tier: "02", price: "€500", amount: 500, period: "MON" as const, recommended: true },
  {
    key: "architecture" as const,
    tier: "03",
    price: "€1.500",
    amount: 1500,
    period: "MON" as const,
    recommended: false,
  },
]

/* ==========================================================================
 * RETAINER (E-K6)
 *
 * Die laufende Betreuung ist heute in einer Fußzeile versteckt
 * („Ops-Retainer" unter `furtherProjects`) — dabei ist sie das, was
 * wiederkehrenden Umsatz trägt und was creaDIG von einer Agentur
 * unterscheidet, die übergibt und verschwindet.
 *
 * Sichtbar wird sie erst, wenn der Owner Preis UND Leistungsumfang
 * bestätigt hat. Beides steht hier, nicht im Markup — und solange `price`
 * `null` ist, rendert der Block nicht. Einen Retainer zu bewerben, dessen
 * Umfang niemand festgelegt hat, wäre ein Versprechen ohne Substanz.
 */
export const retainer = {
  /** z. B. "€450". `null` = der Block erscheint nicht. */
  price: null as string | null,
  amount: null as number | null,
  /** Was tatsächlich geliefert wird — vom Owner bestätigt, nicht abgeleitet. */
  description: null as Localized | null,
  /** Einzelne Leistungen, in beiden Sprachen. */
  includes: null as { de: string[]; tr: string[] } | null,
}

export const retainerPublished = Boolean(retainer.price && retainer.description)

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

/**
 * Geschäftsadresse (gesperrt): ICO InnovationsCentrum Osnabrück.
 * Die private Anschrift taucht öffentlich nirgends auf.
 */
export const address = {
  company: "creaDIG",
  owner: "Muhammed Emin Akyol",
  venue: "ICO InnovationsCentrum Osnabrück",
  street: "Albert-Einstein-Straße 1",
  postalCode: "49076",
  city: "Osnabrück",
  country: "Deutschland",
  countryCode: "DE",
} as const

/** Anschrift als Zeilen — für Footer, Kontakt und Impressum identisch. */
export const addressLines: string[] = [
  address.venue,
  address.street,
  `${address.postalCode} ${address.city}`,
  address.country,
]

export const contact = {
  whatsapp: "+41 76 504 58 79",
  whatsappHref: "https://wa.me/41765045879",
  email: "info@creadig.de",
  address,
  addressLines,
  /** Sitz — kurz. */
  locations: "Osnabrück (DE)",
  /** Die Schweiz ist Markt, nicht Sitz. */
  markets: "Deutschland & Schweiz",
}

/**
 * Förmliche Anbieterangaben für das Impressum.
 *
 * Diese Werte liefert ausschließlich der Inhaber — sie werden NICHT geraten
 * und NICHT aus anderen Quellen abgeleitet. Solange ein Feld `null` ist,
 * rendert das Impressum die Zeile nicht und der Pending-Hinweis bleibt stehen
 * (siehe components/legal/legal-page.tsx). Sobald alle Pflichtfelder gefüllt
 * sind, verschwindet der Pending-Block automatisch.
 */
export const imprintDetails = {
  /** Rechtsform, z. B. "Einzelunternehmen" oder "creaDIG GmbH". */
  legalForm: null as string | null,
  /** Umsatzsteuer-Identifikationsnummer nach § 27 a UStG. */
  vatId: null as string | null,
  /**
   * `true`, wenn die Kleinunternehmerregelung nach § 19 UStG greift.
   * Dann tritt der entsprechende Hinweis an die Stelle der USt-IdNr.
   * Entweder `vatId` ODER `smallBusiness` muss gesetzt sein — nicht beides.
   */
  smallBusiness: null as boolean | null,
  /**
   * Verantwortlicher nach § 18 Abs. 2 MStV (Name; Anschrift nur, wenn sie
   * von der Geschäftsanschrift abweicht).
   */
  mstvResponsible: null as string | null,
  /** Optionale deutsche Rufnummer fürs Impressum, z. B. "+49 …". */
  phone: null as string | null,
} as const

/**
 * Vollständig im Sinne der Pflichtangaben: Rechtsform, Umsatzsteuer-Status
 * (USt-IdNr. oder § 19-Hinweis) und § 18 Abs. 2 MStV liegen vor.
 */
export const imprintComplete =
  Boolean(imprintDetails.legalForm) &&
  (Boolean(imprintDetails.vatId) || imprintDetails.smallBusiness === true) &&
  Boolean(imprintDetails.mstvResponsible)
