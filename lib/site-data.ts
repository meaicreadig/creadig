// Alle Inhalte sind echt. Keine erfundenen Zahlen, Zitate oder Auszeichnungen.
//
// CEO-Entscheidung (gesperrt):
//   Eigene Produkte = meAI · fibero · CASSAMEA · meahv  — mehr nicht.
//   Echte Kunden (Owner-Freigabe 22.08.2026) = NV SWISS · maqam.
//   NÛR ist ein EIGENES Produkt, kein Kundenwerk. Bir Damla Hayır und
//   Rumi's Maison sind nicht bestaetigt und erscheinen nirgends.
//   PLANEX gehört nicht zu creaDIG und kommt nirgends vor.

import { CLIENT_LOGOS } from "@/lib/client-logos.generated"
import { publishedInsights } from "@/lib/insights"

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
  /** `null`, solange der Owner die Region nicht bestaetigt hat. */
  region: Region | null
  color: string
  /** Schriftliche Freigabe für die Bezeichnung „Kunde/Partner" liegt vor. */
  approved: boolean
}

/** Die vier eigenen Produkte des Hauses. */
export const ownProducts: ProductLogo[] = [
  // Owner 29.08.2026: Gold-Icon unter public/brand/products/meai.png
  { name: "meAI", logoPath: "/brand/products/meai.png", mark: "me", color: "#be904e", region: "DE & CH" },
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
 * Fremdmarken-Wand — heute bewusst LEER.
 *
 * Hier standen Auftraggeber und Marken aus dem operativen Glasfaser-Alltag
 * (Telekom, Glasfaser NordWest, 1&1, Drillisch u. a.). Keine davon hatte eine
 * Freigabe fuer die Bezeichnung „Kunde/Partner", und die Glasfaser-Taetigkeit
 * ist der private Motor des Hauses, kein Schaufenster der oeffentlichen Seite
 * (Owner-Entscheidung 22.08.2026).
 *
 * Der Typ bleibt: Sobald eine Marke mit schriftlicher Freigabe dazukommt,
 * traegt sie `approved: true` und erscheint ohne Code-Umbau. Solange die
 * Liste leer ist, rendert die Reihe gar nicht — statt eine Wand aus
 * Monogrammen zu zeigen, die nichts belegen.
 */
export const brands: BrandLogo[] = []

/*
 * V2-1c — DIE PROJEKTTEXTE SIND ZWEISPRACHIG.
 *
 * Bis hierher waren `what`, `sector`, `built` und `outcome` einfache
 * Zeichenketten, und in den Routen stand der Grund dafuer als Kommentar:
 * „Auf /tr ist die Oberflaeche tuerkisch, der Projektsatz deutsch — der
 * ehrliche Zustand." Ehrlich war das, aber es war auch die groesste
 * sichtbare Luecke der tuerkischen Fassung: Auf /tr/produkte/meai stand die
 * halbe Seite auf Deutsch, ausgerechnet an der Stelle, an der es um die
 * Sache geht.
 *
 * `Localized` statt `string` heisst: Der Compiler verlangt beide Sprachen.
 * Ein Werk, das nur auf Deutsch beschrieben ist, kommt gar nicht mehr ins
 * Repo — dieselbe Mechanik wie bei den Case-Studies.
 *
 * Was NICHT uebersetzt wird: Eigennamen (`name`), Regionskuerzel (`region`)
 * und Monogramme. Und `outcome` ist eine Zustandsangabe („Im Aufbau"), keine
 * Bewertung — die tuerkische Fassung sagt dasselbe, nicht mehr.
 */
export type Work = {
  slug: string
  name: string
  what: Localized
  /**
   * Was wir gebaut haben. `null`, solange der Owner den Umfang nicht
   * bestaetigt hat — dann steht dort nichts statt einer Vermutung.
   */
  built: Localized | null
  outcome: Localized
  kind: "Produkt" | "Kundenwerk"
  /** `null`, solange der Owner die Region nicht bestaetigt hat. */
  region: Region | null
  /**
   * Branche in zwei bis drei Worten — die dichte Register-Ansicht (B2) hat
   * keinen Platz fuer den ganzen `what`-Satz. Abgeleitet aus dem, was das
   * Projekt tatsaechlich ist; nichts dazuerfunden.
   */
  sector: Localized
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
  /*
   * C-2 / BF-5 — die schriftliche Freigabe des Kunden fuer die Nennung, und
   * der eine Satz zu Aufgabe und Ergebnis, den er freigegeben hat.
   *
   * Beides liefert ausschliesslich der Owner. Die Felder stehen hier, damit
   * die Statusseite (`/status`) BENENNEN kann, was fehlt — eine Luecke, die
   * nirgends auftaucht, wird nie geschlossen. Nichts davon wird geraten, und
   * solange `approvalOnFile` nicht ausdruecklich `true` ist, gilt die
   * Freigabe als offen.
   */
  approvalOnFile?: boolean
  approvedSentence?: Localized | null
}

/** Eigene Produkte — die großen Cases. */
export const productWorks: Work[] = [
  {
    slug: "meai",
    sector: { de: "KI · Business-Software", tr: "Yapay zekâ · İş yazılımı" },
    year: null,
    name: "meAI",
    what: {
      de: "KI-Business-Betriebssystem für kleine und mittlere Betriebe.",
      tr: "Küçük ve orta ölçekli işletmeler için yapay zekâ tabanlı iş işletim sistemi.",
    },
    built: {
      de: "Produktarchitektur, KI-Logik, Dashboard, Betrieb — von Grund auf.",
      tr: "Ürün mimarisi, yapay zekâ mantığı, gösterge paneli, işletme — sıfırdan.",
    },
    outcome: { de: "Im Aufbau · live unter meai.run", tr: "Kuruluyor · meai.run adresinde canlı" },
    kind: "Produkt",
    region: "DE & CH",
    image: "/works/meai.png",
    mark: "me",
    href: "https://meai.run",
    live: true,
  },
  {
    slug: "fibero",
    sector: { de: "Glasfaser · Operations", tr: "Fiber optik · Operasyon" },
    year: null,
    name: "fibero",
    what: {
      de: "Ordnung und Klarheit im Glasfaser-Alltag: Auftrags-, Abrechnungs- und Finanzlogik.",
      tr: "Fiber optik günlük işinde düzen ve netlik: iş emri, hakediş ve finans mantığı.",
    },
    built: {
      de: "Operative Prozesse, Abrechnungssystem, Auswertung.",
      tr: "Operasyonel süreçler, hakediş sistemi, değerlendirme.",
    },
    outcome: { de: "Im Tagesbetrieb", tr: "Günlük kullanımda" },
    kind: "Produkt",
    region: "DE",
    image: "/works/fibero.png",
    mark: "fb",
    live: true,
  },
  {
    slug: "cassamea",
    sector: { de: "Gastronomie · Kasse", tr: "Gastronomi · Kasa" },
    year: null,
    name: "CASSAMEA",
    what: {
      de: "Die Kasse, die mitdenkt — für die Gastronomie, gebaut für Schweizer Anforderungen.",
      tr: "Birlikte düşünen kasa — gastronomi için, İsviçre gerekliliklerine göre kuruldu.",
    },
    built: {
      de: "Kassen-Software, Backoffice, Schweizer Anforderungen.",
      tr: "Kasa yazılımı, backoffice, İsviçre gereklilikleri.",
    },
    outcome: { de: "Im Aufbau", tr: "Kuruluyor" },
    kind: "Produkt",
    region: "CH",
    image: "/works/cassamea.png",
    mark: "CA",
  },
  {
    slug: "meahv",
    sector: { de: "Immobilien · Verwaltung", tr: "Gayrimenkul · Yönetim" },
    year: null,
    name: "meahv",
    what: {
      de: "Hausverwaltungs-System: Objekte, Mieter, Belege und Abrechnung an einem Ort.",
      tr: "Bina yönetim sistemi: taşınmazlar, kiracılar, belgeler ve faturalandırma tek yerde.",
    },
    built: {
      de: "Datenmodell, Verwaltungslogik, Abrechnung.",
      tr: "Veri modeli, yönetim mantığı, faturalandırma.",
    },
    outcome: { de: "Im Aufbau", tr: "Kuruluyor" },
    kind: "Produkt",
    region: "DE",
    // Noch kein Mockup — die Karte rendert ein Monogramm-Panel statt eines leeren Bildes.
    image: null,
    mark: "hv",
  },
]

/* ==========================================================================
 * PRODUKT-WELTEN (PHASE B)
 *
 * `productWorks` beantwortet „was ist das" in einem Satz. Eine Welt braucht
 * mehr — aber sie darf sich das Mehr nicht ausdenken. Deshalb steht hier
 * ausschliesslich, was schon belegt ist, nur anders sortiert:
 *
 *   blocks   ist `built`, zerlegt. Dieselben Angaben, einzeln lesbar statt
 *            als Komma-Kette. Kein neues Wort, nur eine andere Form — und
 *            zweisprachig, weil diese Felder hier neu geschrieben werden.
 *   layer    ordnet das Produkt in die fuenf Ebenen des Hauses ein. Das ist
 *            eine Einordnung unserer eigenen Arbeit, keine Behauptung ueber
 *            Dritte.
 *   story    ist der EINZIGE Ort fuer neuen Owner-Text — und er ist leer.
 *            Solange `null`, versteckt sich die Sektion. Hier gehoert hin,
 *            warum ein Produkt gebaut wurde; das weiss nur der Owner, und
 *            geraten wird es nicht.
 *   flagship traegt heute nur meAI: das dunkle Band mit den vier
 *            Faehigkeiten, die im Woerterbuch belegt sind.
 *
 * Was hier NICHT steht: Nutzerzahlen, Releases, Roadmaps, Preise, Feature-
 * Listen, Kundennamen. Nichts davon ist belegt.
 * ========================================================================== */

/**
 * Der Zustands-Badge eines Produkts (V2-4b · KIZILELMA §10.5).
 *
 * ---------------------------------------------------------------------------
 * ER WIRD ABGELEITET, NICHT GEPFLEGT
 * Es waere naheliegend gewesen, je Produkt ein Feld `status` einzutragen.
 * Genau das waere die zweite Wahrheit: `live` und `outcome` stehen schon in
 * den Daten, und ein drittes Feld daneben laeuft ihnen frueher oder spaeter
 * davon — „Im Aufbau" im Text, „LIVE" im Badge, und niemand merkt es, weil
 * beides nie nebeneinander gelesen wird.
 *
 * Die Ableitung ist absichtlich streng und behauptet nichts Neues:
 *   live + oeffentliche Adresse  →  LIVE           (jeder kann es aufrufen)
 *   live ohne Adresse            →  IM EIGENEN BETRIEB (wir nutzen es taeglich)
 *   nicht live                   →  IM AUFBAU
 *
 * `beta` steht im Typ und traegt heute kein Produkt. Der Zustand existiert
 * (eine geschlossene Testphase mit echten Nutzern), nur hat ihn niemand
 * bestaetigt — und einen Badge zu vergeben, den keiner belegt hat, waere
 * genau die Sorte Etikett, die diese Seite nicht vergibt.
 */
export type ProductStatus = "live" | "beta" | "aufbau" | "intern"

/*
 * MP-A · REIFEGRAD — was der Owner SAGT, nicht was der Code ABLEITET.
 *
 * `ProductStatus` oben wird aus `live` und `href` gerechnet und kann darum
 * nur drei grobe Zustaende: laeuft, im Aufbau, intern. Fuer die Produktseiten
 * fehlt die Stufe dazwischen — ein Produkt kann mit echten Nutzern in einer
 * geschlossenen Phase laufen, und das ist weder „live" noch „im Aufbau".
 *
 * Diese Stufe kann man nicht ausrechnen. Sie weiss genau eine Person. Deshalb
 * ist das Feld hier vorbereitet und ueberall `null`: Kein Etikett, das keiner
 * belegt hat. Sobald der Owner einen Wert setzt, hat die Produktseite ihn —
 * bis dahin steht dort nichts, und das ist die richtige Aussage.
 */
export type ProductMaturity = "live" | "pilot" | "private-beta" | "in-development"

export function productStatus(work: Work): ProductStatus {
  if (!work.live) return "aufbau"
  return work.href ? "live" : "intern"
}

/* --------------------------------------------------------------------------
 * V2-4b — DIE PRODUKTSEITE HAT JETZT PLATZ FUER DIE GANZE GESCHICHTE.
 *
 * §10.5 verlangt je Produkt: Problem → Product-Thesis → Screens → Funktionen
 * → System/Architektur → Betrieb → Status → Learnings → CTA. Bisher trug
 * `ProductWorld` davon zwei Punkte (Bausteine und eine gesperrte Story).
 *
 * Die sechs neuen Felder sind alle `null` beziehungsweise leer, und das
 * bleiben sie, bis der Owner liefert. Das ist kein Rueckstand, sondern die
 * Regel dieses Repos: Warum ein Produkt gebaut wurde, wie es innen aussieht
 * und was es im Betrieb gelehrt hat, weiss genau eine Person — und geraten
 * wird es nicht. Was fehlt, steht auf `/status` mit Namen.
 *
 * Sichtbar wird heute nur der Status-Badge, und der ist abgeleitet.
 * -------------------------------------------------------------------------- */
export type ProductWorld = {
  /** `built`, in einzelne Bausteine zerlegt — zweisprachig. */
  blocks: Localized[]
  /** Ebene im Haus. Mirror von `serviceLayers` (dieselben Schluessel). */
  layer: (typeof serviceLayers)[number]["key"]
  /**
   * Owner-gesetzter Reifegrad. `null` = offen — dann rendert nichts.
   * Wird NICHT aus `live` abgeleitet; siehe `ProductMaturity`.
   */
  maturity: ProductMaturity | null
  /**
   * Owner-Text: warum es gebaut wurde, was es im Betrieb gelehrt hat.
   * `null` = die Sektion rendert nicht. TODO (Owner).
   */
  story: Localized | null
  /**
   * Name eines Eintrags aus `furtherProjects`, der im selben Feld arbeitet.
   *
   * Heute traegt das KEIN Produkt: Der operative Betrieb, der frueher hier
   * neben fibero stand, ist von der oeffentlichen Seite genommen
   * (Owner-Entscheidung 22.08.2026) — er ist der Motor des Hauses, nicht sein
   * Schaufenster. Das Feld bleibt, weil die Verknuepfung als Struktur richtig
   * ist, sobald ein zeigbarer Betrieb dazukommt.
   *
   * `null` = der Block rendert nicht. Ein unbekannter Name ebenfalls.
   */
  houseContext: string | null
  /** Traegt das dunkle Faehigkeiten-Band (heute nur meAI). */
  flagship: boolean
  /**
   * Wofuer es gebaut wurde — das Problem im Markt, nicht das eigene.
   * TODO (Owner). `null` = die Sektion rendert nicht.
   */
  problem: Localized | null
  /**
   * Die Produkt-These: die eine Annahme, auf der das Produkt steht und an
   * der es scheitern wuerde, wenn sie falsch ist. TODO (Owner).
   */
  thesis: Localized | null
  /**
   * Funktionen in Kundensprache. Leer = kein Block.
   *
   * NICHT zu verwechseln mit `blocks`: Die sagen, was WIR gebaut haben
   * („Produktarchitektur"), die hier sagen, was das Produkt KANN. meAI
   * fuehrt seine vier bereits im Flaggschiff-Band; deshalb steht auch dort
   * heute nichts, statt dieselben Worte ein zweites Mal zu zeigen.
   */
  functions: Localized[]
  /** System und Architektur, so weit sie oeffentlich sein duerfen. TODO (Owner). */
  architecture: Localized | null
  /** Wie es betrieben wird — Hosting, Ueberwachung, Stand. TODO (Owner). */
  operations: Localized | null
  /**
   * Was der Betrieb gelehrt hat, auch das Unangenehme. Leer = kein Block.
   * Das ist der Teil, den kein Wettbewerber kopieren kann — und der
   * einzige, den man sich am wenigsten ausdenken darf.
   */
  learnings: Localized[]
}

export const productWorlds: Record<string, ProductWorld> = {
  meai: {
    blocks: [
      { de: "Produktarchitektur", tr: "Ürün mimarisi" },
      { de: "KI-Logik", tr: "Yapay zekâ mantığı" },
      { de: "Dashboard", tr: "Gösterge paneli" },
      { de: "Betrieb — von Grund auf", tr: "İşletme — sıfırdan" },
    ],
    layer: "intelligence",
    maturity: null,
    story: null,
    houseContext: null,
    flagship: true,
    problem: null,
    thesis: null,
    functions: [],
    architecture: null,
    operations: null,
    learnings: [],
  },
  fibero: {
    blocks: [
      { de: "Operative Prozesse", tr: "Operasyonel süreçler" },
      { de: "Abrechnungssystem", tr: "Hakediş sistemi" },
      { de: "Auswertung", tr: "Değerlendirme" },
    ],
    layer: "operations",
    maturity: null,
    story: null,
    houseContext: null,
    flagship: false,
    problem: null,
    thesis: null,
    functions: [],
    architecture: null,
    operations: null,
    learnings: [],
  },
  cassamea: {
    blocks: [
      { de: "Kassen-Software", tr: "Kasa yazılımı" },
      { de: "Backoffice", tr: "Backoffice" },
      { de: "Schweizer Anforderungen", tr: "İsviçre gereklilikleri" },
    ],
    layer: "operations",
    maturity: null,
    story: null,
    houseContext: null,
    flagship: false,
    problem: null,
    thesis: null,
    functions: [],
    architecture: null,
    operations: null,
    learnings: [],
  },
  meahv: {
    blocks: [
      { de: "Datenmodell", tr: "Veri modeli" },
      { de: "Verwaltungslogik", tr: "Yönetim mantığı" },
      { de: "Abrechnung", tr: "Faturalandırma" },
    ],
    layer: "operations",
    maturity: null,
    story: null,
    houseContext: null,
    flagship: false,
    problem: null,
    thesis: null,
    functions: [],
    architecture: null,
    operations: null,
    learnings: [],
  },
}

/**
 * Nachbarn eines Produkts — fuer die Weiter-Navigation am Seitenende.
 *
 * Ein Ring, kein Band: Das letzte Produkt fuehrt zurueck aufs erste. Wer am
 * Ende einer Welt ankommt, soll in die naechste koennen und nicht in eine
 * Sackgasse laufen. Reihenfolge ist die von `productWorks`.
 */
export function productNeighbours(slug: string): { prev: Work; next: Work } | null {
  const index = productWorks.findIndex((product) => product.slug === slug)
  if (index === -1) return null
  const count = productWorks.length
  return {
    prev: productWorks[(index - 1 + count) % count],
    next: productWorks[(index + 1) % count],
  }
}

/**
 * Echtes Kundenwerk — ausdrücklich KEIN eigenes Produkt.
 *
 * ---------------------------------------------------------------------------
 * WER HIER STAND UND WARUM ER GEHEN MUSSTE (Owner-Freigabe 22.08.2026)
 *   NÛR              — ein EIGENES Produkt des Hauses, nie ein Kunde.
 *   Bir Damla Hayır  — nicht als zahlender Kunde bestaetigt. Kommt erst
 *                      zurueck, wenn der Owner das ausdruecklich sagt.
 *   Rumi's Maison    — [OWNER-BESTAETIGUNG AUSSTEHEND] echter zahlender
 *                      Kunde? Bis zur Antwort: kein Eintrag, keine Seite,
 *                      keine Nennung. Der Datensatz steht als Kommentar am
 *                      Ende dieser Liste, damit nichts neu getippt werden
 *                      muss, falls die Bestaetigung kommt.
 *
 * Ein eigenes Projekt als Kundenwerk auszugeben ist der eine Fehler, den
 * diese Seite sich nicht leisten kann — sie hat sonst nichts als ihre
 * Glaubwuerdigkeit.
 *
 * ---------------------------------------------------------------------------
 * WAS FEHLT, STEHT AUF `null`
 * Screenshots, Regionen, Links und Umfang liefert der Owner. Solange etwas
 * fehlt, rendert das Feld nicht — geraten wird nichts.
 */
export const clientWorks: Work[] = [
  {
    slug: "nv-swiss",
    sector: { de: "Versicherung & Finanzen", tr: "Sigorta & finans" },
    year: null,
    name: "NV SWISS",
    what: {
      de: "Versicherungs- & Finanzmakler (Schweiz) — Marke, Website und Digitalisierung aus einer Hand.",
      tr: "Sigorta & finans brokeri (İsviçre) — marka, web sitesi ve dijitalleşme tek elden.",
    },
    built: { de: "Marke, Website, Digitalisierung.", tr: "Marka, web sitesi, dijitalleşme." },
    outcome: { de: "Kundenwerk · live", tr: "Müşteri işi · canlı" },
    kind: "Kundenwerk",
    region: "CH",
    // Owner 29.08.2026: Kundenbild (Laptop-Szene mit echter nvswiss.ch-Oberfläche).
    image: "/works/nv-swiss.jpg",
    mark: "NV",
    href: "https://nvswiss.ch",
    live: true,
    // Logo unter public/brand/clients/nv-swiss.png (Owner geliefert).
    approvalOnFile: false,
    approvedSentence: null,
  },
  {
    slug: "maqam",
    sector: { de: "Online-Business · E-Commerce", tr: "Online iş · e-ticaret" },
    year: null,
    name: "maqam",
    what: { de: "Online-Business / E-Commerce.", tr: "Online iş / e-ticaret." },
    // Umfang, Region, Link — Owner 29.08.2026: Logo + Kundenbild geliefert.
    built: null,
    outcome: { de: "Kundenwerk", tr: "Müşteri işi" },
    kind: "Kundenwerk",
    region: null,
    // Owner 29.08.2026: Kundenbild (Boutique-Laptop, echte maqam-Oberfläche).
    image: "/works/maqam.jpg",
    mark: "mq",
    // Logo: public/brand/clients/maqam.png (schwarz entfernt → transparent)
    approvalOnFile: false,
    approvedSentence: null,
  },
  /*
   * [OWNER-BESTAETIGUNG AUSSTEHEND] — Rumi's Maison
   *
   * Frage an den Owner: echter zahlender Kunde, ja oder nein? Bis zur
   * schriftlichen Antwort erscheint der Eintrag nirgends. Wird er bestaetigt,
   * kommt dieser Block zurueck in die Liste — unveraendert:
   *
   *   {
   *     slug: "rumis-maison",
   *     sector: "Lifestyle · Marke",
   *     year: null,
   *     name: "Rumi's Maison",
   *     what: "Markenauftritt und Website für eine Lifestyle-Marke.",
   *     built: "Marke, Web, Inhalte, laufende Betreuung.",
   *     outcome: "Kundenwerk",
   *     kind: "Kundenwerk",
   *     region: "DE",
   *     image: "/works/rumis-maison.png",
   *     mark: "RM",
   *   },
   */
]

/**
 * Die Kunden-Logowand — dieselbe Quelle wie `clientWorks`, andere Form.
 *
 * Ein echtes Logo erscheint, sobald es unter `public/brand/clients/<slug>.svg`
 * (oder `.png`) liegt; bis dahin traegt die Kachel ein sauberes Monogramm.
 * Der `prebuild`-Hook liest das Verzeichnis einmal zur Bauzeit
 * (`scripts/generate-client-logos.mjs`) — kein `fs` zur Laufzeit, siehe die
 * Begruendung in `lib/product-media.ts`.
 *
 * `approved: true` gilt hier fuer alle: In dieser Liste steht nur, wen der
 * Owner ausdruecklich als Kunden freigegeben hat.
 */
export const clientLogos: BrandLogo[] = clientWorks.map((work) => ({
  name: work.name,
  logoPath: CLIENT_LOGOS[work.slug] ?? null,
  mark: work.mark,
  region: work.region,
  // Kein Markenfarben-Raten: bis ein Logo vorliegt, traegt die Kachel die
  // Hausfarbe. Eine erfundene Markenfarbe waere eine erfundene Angabe.
  color: "#be904e",
  approved: true,
}))

/**
 * Referenzregister (B2) — dieselben Projekte, dichte Listenansicht.
 *
 * Bewusst KEINE zweite Quelle: Wer hier eine eigene Liste pflegen wuerde,
 * haette in vier Wochen zwei Wahrheiten. Das Register ist eine andere
 * Darstellung derselben Werke — eigene Produkte zuerst, dann Kundenwerk,
 * durchnummeriert 01…n.
 */
export const registryWorks: Work[] = [...productWorks, ...clientWorks]

/**
 * Die interne Adresse eines Werks (PHASE A).
 *
 * Vorher fuehrte jede Werk-Karte entweder nach draussen (meai.run) oder
 * nirgendwohin. Mit der neuen Architektur hat jedes Werk eine Seite im Haus:
 * eigene Produkte leben unter /produkte, Kundenwerk unter /arbeiten. Ein
 * externer Live-Link bleibt daneben bestehen — er ersetzt die eigene Seite
 * nicht, er ergaenzt sie.
 *
 * Eine Quelle, damit Karten, Register und Verweise nicht auseinanderlaufen.
 */
export function workHref(work: Work): string {
  return work.kind === "Produkt" ? `/produkte/${work.slug}` : `/arbeiten/${work.slug}`
}

/**
 * Die drei Arbeiten, die auf der Verteiler-Startseite gross stehen (PHASE A).
 *
 * Bewusst eine kuratierte Auswahl und nicht „die ersten drei": Die Startseite
 * soll in einem Blick zeigen, was das Haus ist — ein KI-Produkt, ein System
 * im Tagesbetrieb, eine Arbeit fuer einen Auftraggeber. Drei Zeilen, drei
 * Beweisarten.
 *
 * Slugs, keine Kopien: Der Inhalt bleibt in `productWorks`/`clientWorks`, hier
 * steht nur die Reihenfolge. Wer einen Slug aendert, faellt beim Build auf.
 */
export const featuredWorkSlugs = ["meai", "fibero", "nv-swiss"] as const

/** Aufgeloest in der Reihenfolge oben; unbekannte Slugs fallen still weg. */
export const featuredWorks: Work[] = featuredWorkSlugs
  .map((slug) => registryWorks.find((work) => work.slug === slug))
  .filter((work): work is Work => Boolean(work))

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

/**
 * Die acht Kapitel eines Falls, in Leserichtung (KIZILELMA §10.4).
 *
 * Die Reihenfolge ist die Aussage: Erst der Betrieb, wie er war, dann sein
 * Problem, dann sein Ziel — und erst DANACH kommen wir vor. Wer mit „unsere
 * Rolle" anfaengt, schreibt eine Selbstdarstellung mit Kundennamen.
 */
export const caseChapterKeys = [
  "start",
  "problem",
  "goal",
  "role",
  "system",
  "delivery",
  "result",
  "today",
] as const

export type CaseChapterKey = (typeof caseChapterKeys)[number]

/**
 * Eine Kennzahl — und der Beleg dafuer.
 *
 * `value` ist bewusst eine Zeichenkette und keine Zahl: „von drei Tagen auf
 * einen" ist die ehrlichste Form vieler Ergebnisse und laesst sich nicht
 * runden. `source` ist Pflicht. Eine Kennzahl ohne Quelle ist eine
 * Behauptung mit Ziffern — und Ziffern glaubt man schneller als Saetze,
 * weshalb sie hier strenger behandelt werden und nicht lockerer.
 */
export type CaseMetric = {
  label: Localized
  value: string
  source: Localized
}

/**
 * Die Kundenstimme in einem Fall.
 *
 * Dieselbe Regel wie bei `reviews`: Der Wortlaut wird NICHT uebersetzt. Ein
 * uebersetztes Zitat ist ein Satz, den der Mensch so nie gesagt hat. `role`
 * ist die Funktion und darf uebersetzt werden — sie ist eine Beschreibung,
 * kein Zitat.
 */
export type CaseVoice = {
  quote: string
  lang: "de" | "tr"
  name: string
  company: string
  role: Localized
}

/* ==========================================================================
 * DAS CASE-STUDY-SYSTEM (V2-4 · KIZILELMA §10.4)
 *
 * Vorher trug ein Fall drei Felder: Problem, Loesung, Ergebnis. Das ist die
 * Kurzform, mit der Agenturen ihre Referenzen fuellen, und sie beantwortet
 * die entscheidende Frage nicht: Was war unser Anteil daran? Ein Fall ohne
 * „unsere Rolle" und ohne „Heute" liest sich wie eine Projektbeschreibung,
 * die auch der Kunde selbst haette schreiben koennen.
 *
 * Acht Kapitel, dazu Kennzahlen und eine Stimme. Jedes Kapitel ist einzeln
 * `null`-faehig: Ein Fall, von dem der Owner heute nur die Ausgangslage
 * bestaetigen kann, rendert die Ausgangslage — und nicht acht
 * Zwischenueberschriften ueber Leerraum.
 *
 * ---------------------------------------------------------------------------
 * `approved` IST DIE HAUPTSICHERUNG, NICHT DER INHALT
 * Solange sie `false` ist, erscheint der Fall nirgends: nicht auf /arbeiten,
 * nicht auf der Werk-Seite, nicht in den strukturierten Daten. Die Geruest-
 * Eintraege unten sind deshalb sichtbar leer und trotzdem gefahrlos — sie
 * existieren, damit der Owner Text in eine Struktur schreiben kann, statt
 * eine Struktur mitzuliefern.
 * ========================================================================== */
export type CaseStudy = {
  slug: string
  /** Kundenname exakt so, wie er freigegeben wurde. */
  client: string
  /** Branche/Ort — Einordnung, keine Bewertung. */
  context: Localized
  /** Die acht Kapitel. `null` = liegt nicht vor und rendert nicht. */
  chapters: Record<CaseChapterKey, Localized | null>
  /** Nur belegte Zahlen, jede mit Quelle. Leer = kein Kennzahlen-Block. */
  metrics: CaseMetric[]
  /** Freigegebenes Zitat des Kunden. `null` = kein Stimmen-Block. */
  voice: CaseVoice | null
  image: string | null
  /** Monogramm, solange kein Bild vorliegt. */
  mark: string
  /** Schriftliche Freigabe des Kunden für genau diesen Text liegt vor. */
  approved: boolean
}

/** Alle acht Kapitel leer — die Form, in die der Owner schreibt. */
const emptyChapters: Record<CaseChapterKey, Localized | null> = {
  start: null,
  problem: null,
  goal: null,
  role: null,
  system: null,
  delivery: null,
  result: null,
  today: null,
}

/**
 * Zwei Geruestee, kein Inhalt — und das ist der ehrliche Zustand.
 *
 * NV SWISS ist der wertvollste Beweis, den das Haus hat: ein fremder,
 * zahlender Kunde, dessen Marke, Website und Digitalisierung aus einer Hand
 * kommen. maqam ist der zweite. Beide stehen hier mit Namen, Einordnung und
 * leeren Kapiteln — `approved: false`, also unsichtbar.
 *
 * Was der Owner liefern muss, steht auf `/status` mit Namen; erfunden wird
 * nichts davon. Sobald ein Kapitel Text traegt und die schriftliche Freigabe
 * vorliegt, wird `approved` auf `true` gesetzt und der Fall erscheint —
 * ohne dass jemand Markup anfassen muss.
 */
export const caseStudies: CaseStudy[] = [
  {
    slug: "nv-swiss",
    client: "NV SWISS",
    context: { de: "Versicherung & Finanzen · Schweiz", tr: "Sigorta & finans · İsviçre" },
    chapters: { ...emptyChapters },
    metrics: [],
    voice: null,
    image: null,
    mark: "NV",
    approved: false,
  },
  {
    slug: "maqam",
    client: "maqam",
    context: { de: "Online-Business · E-Commerce", tr: "Online iş · e-ticaret" },
    chapters: { ...emptyChapters },
    metrics: [],
    voice: null,
    image: null,
    mark: "mq",
    approved: false,
  },
]

/** Kapitel, die tatsächlich Text tragen — in der festen Leserichtung. */
export function filledChapters(study: CaseStudy) {
  return caseChapterKeys
    .map((key) => ({ key, body: study.chapters[key] }))
    .filter((entry): entry is { key: CaseChapterKey; body: Localized } => Boolean(entry.body))
}

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

/*
 * V2-4c — EINE KUNDENSTIMME IST MEHR ALS EIN NAME.
 *
 * Die Tiefen-Analyse verlangt „Kundenstimmen mit Name, Firma, Rolle,
 * Projekt". Bisher trug ein Eintrag Name, Datum, Wortlaut und Quelle. Der
 * Unterschied ist nicht kosmetisch: „M. K." unter einem Zitat ist eine
 * Behauptung, „Geschäftsführer, Firma X, zum Projekt Y" ist eine Angabe, die
 * jemand nachschlagen kann — und die derjenige, der sie freigibt, auch
 * bewusst freigibt.
 *
 * Die drei neuen Felder sind optional und nicht Pflicht: Eine echte
 * Google-Bewertung traegt oft nur einen Namen, und sie deshalb nicht zu
 * zeigen waere die falsche Strenge. Sie sind da, damit eine direkt
 * eingeholte Stimme ihre volle Form haben kann.
 *
 * Was NICHT gelockert ist: `approved`, der Originalwortlaut ohne
 * Uebersetzung, und das Sterne-Gate im Build.
 */
export type Review = {
  id: string
  /** Name so, wie er öffentlich steht (z. B. bei Google). */
  name: string
  /** Firma — nur mit Freigabe, sonst `null`. */
  company?: string | null
  /** Funktion im Betrieb. Beschreibung, kein Zitat — darf übersetzt werden. */
  role?: Localized | null
  /** Auf welches Projekt sich die Stimme bezieht. */
  project?: string | null
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
 *
 * ---------------------------------------------------------------------------
 * BF-6 — DIESE BEDINGUNG IST FESTGESCHRIEBEN
 * `null` heisst: Der Block haengt sich nicht an die Organisations-Daten
 * (components/site-shell.tsx). Wer hier einen Vorgabewert einsetzt — auch nur
 * zum Ausprobieren —, behauptet in den strukturierten Daten eine Auszeichnung,
 * die es nicht gibt. Google wertet das als Richtlinienverstoss und straft die
 * ganze Domain ab; sichtbar ist der Fehler nirgends, weil JSON-LD unsichtbar
 * ist.
 *
 * Deshalb steht die Regel nicht nur hier, sondern als Gate im Build:
 * `scripts/check-reviews.mjs` liest das GEBAUTE HTML und bricht ab, sobald ein
 * `AggregateRating` ohne ein einziges `Review` im selben Dokument steht oder
 * `reviewCount` unter 1 liegt. Gegengeprueft: mit einem eingesetzten
 * Vorgabewert (5,0 / 12) bricht der Build in 43 Dokumenten ab.
 *
 * Das Gate verbietet keine Sterne — es verlangt Deckung. Sobald echte,
 * freigegebene Bewertungen in `reviews` stehen, laeuft es unveraendert weiter.
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
 * SOCIAL-PROFILE (E-K7 · GROW-4)
 *
 * Vorher standen im Footer drei tote Kästchen mit „IG / LI / YT" — sie sahen
 * aus wie Links, führten aber nirgendwohin. Ein toter Link ist schlechter als
 * kein Link: er verspricht eine Präsenz, die es nicht gibt.
 *
 * Leer = der Block verschwindet. Gefüllt = echte Links, die zugleich als
 * `sameAs` in die Organisations-Daten für Suchmaschinen gehen. Beides hängt
 * an dieser einen Liste; es gibt keine zweite Stelle, an der ein Profil
 * stehen könnte.
 *
 * --------------------------------------------------------------------------
 * WANN EIN PROFIL HIER REIN DARF (GROW-4)
 * Drei Bedingungen, alle drei:
 *   1. Es existiert und ist öffentlich erreichbar.
 *   2. Es gehört creaDIG — nicht privat, nicht einem Produkt.
 *   3. Es wird gepflegt. Ein Profil mit dem letzten Beitrag von 2021 ist als
 *      Beleg schlechter als keines: Es beantwortet die Frage „läuft der
 *      Laden noch?" mit nein.
 * `sameAs` ist eine Identitätsangabe gegenüber Google. Ein Profil, das nicht
 * uns gehört oder nicht gepflegt wird, ist dort keine Lücke, sondern eine
 * falsche Angabe.
 *
 * Stand 23.08.2026: keine Profile freigegeben, die Liste bleibt leer, der
 * Footer-Block erscheint nicht. Das ist der abgeschlossene Zustand von
 * GROW-4 — nicht ein offener Punkt.
 *
 * --------------------------------------------------------------------------
 * DIE ZWEITE HÄLFTE VON GROW-4 IST BEWUSST NICHT GEBAUT
 * Das Audit nannte neben den Profilen einen „Lead-Magnet/Newsletter mit
 * Double-Opt-in". Der ist hier nicht entstanden, und zwar aus einem Grund,
 * der zur Sache gehört: Ein Newsletter-Feld verspricht Post. `/insights` hat
 * bis heute keinen einzigen veröffentlichten Eintrag — wir hätten ein
 * Anmeldefeld für eine Sendung gebaut, die es nicht gibt. Dazu käme ein
 * weiterer Auftragsverarbeiter für eine Empfängerliste.
 *
 * Die Reihenfolge ist damit umgekehrt: erst der erste Insight, dann die
 * Anmeldung. Die E-Mail-Erfassung, die heute schon trägt, steht ohnehin
 * woanders — `product-interest.tsx` (FEAT-1) sammelt Interesse pro Produkt,
 * und dort ist der Anlass echt.
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
 * Was sonst noch unter dem Dach läuft.
 *
 * Der operative Betrieb, aus dem creaDIG seinen Alltag kennt, steht hier
 * bewusst NICHT mehr: Er ist der Motor des Hauses, nicht sein Schaufenster
 * (Owner-Entscheidung 22.08.2026). Das Produkt fibero ist davon unberührt —
 * es ist ein eigenes Produkt und steht in `productWorks`.
 */
export const furtherProjects: {
  name: string
  what: Localized
  kind: Localized
}[] = [
  {
    name: "Ops-Retainer",
    what: {
      de: "Operations-System für Handwerksbetriebe",
      tr: "Zanaat işletmeleri için operasyon sistemi",
    },
    kind: { de: "Dienstleistung", tr: "Hizmet" },
  },
]

/**
 * Hauptnavigation (PHASE A) — die Firmen-IA, nicht die Sektionsreihenfolge.
 *
 * Vorher standen hier Anker auf Sektionen derselben Seite. Damit war die
 * Leiste ein Inhaltsverzeichnis der Startseite, und sie musste bei jeder
 * Umsortierung mitgepflegt werden (der Kommentar an dieser Stelle bat genau
 * darum). Jetzt bildet sie die Firma ab: fuenf Ebenen, die es als Adresse
 * gibt. Die Nav muss beweisen, dass hinter der Startseite eine Welt liegt.
 *
 * „Kontakt" steht bewusst NICHT in der Reihe, sondern rechts als Gold-CTA —
 * es ist kein Kapitel des Hauses, es ist die Handlung.
 */
export const navLinks = [
  { href: "/leistungen", labelKey: "leistungen" as const },
  { href: "/produkte", labelKey: "produkte" as const },
  { href: "/arbeiten", labelKey: "arbeiten" as const },
  { href: "/unternehmen", labelKey: "unternehmen" as const },
  { href: "/insights", labelKey: "insights" as const },
]

/**
 * Was in der Kopfleiste steht (PHASE B).
 *
 * Insights bleibt als Route und im Footer, verschwindet aber aus der
 * Hauptnavigation, solange dort nichts veroeffentlicht ist. Der Grund ist
 * nicht Aesthetik: Ein Menuepunkt ist ein Versprechen. Fuehrt er auf eine
 * Seite, die „Noch nichts veroeffentlicht" sagt, kostet er beim ersten Klick
 * mehr Vertrauen, als er vorher an Groesse suggeriert hat — und zwar bei
 * genau den Besuchern, die neugierig genug waren, ihn anzuklicken.
 *
 * Der Footer behaelt den Link: Er ist das vollstaendige Verzeichnis der
 * Seite, die Leiste ist eine Auswahl. Mit dem ersten Beitrag erscheint der
 * Punkt oben von selbst — hier ist nichts auszukommentieren.
 */
export const mainNavLinks = navLinks.filter(
  (link) => link.href !== "/insights" || publishedInsights.length > 0,
)

/*
 * Das Fundament — echte Signale statt erfundener Kennzahlen.
 *
 * VIS-5: Vorher standen alle vier in EINER Stat-Reihe, in Ziffern-Groesse
 * nebeneinander: „2017", „4", „DE / CH", „A–Z". Zwei davon sind aber keine
 * Kennziffern, sondern Reichweiten-Aussagen. Als Riesen-Zahl gesetzt
 * behaupten sie eine Messbarkeit, die es nicht gibt — und „A–Z" laesst sich
 * ohnehin nicht zaehlen. Die Trennung steht deshalb in den Daten, nicht im
 * Markup: Was zaehlbar ist, ist eine Figure; was eine Aussage ist, ein Fact.
 */

/**
 * Zaehlbares. Wird als Kennziffer gesetzt.
 *
 * ---------------------------------------------------------------------------
 * V2-4c — DREI GEFAESSE STEHEN BEREIT UND SIND LEER
 * Die Tiefen-Analyse nennt „Zahlen" als erste der fuenf fehlenden
 * Beweisarten. Das Band zeigt heute zwei: das Gruendungsjahr und die Anzahl
 * eigener Produkte. Beide sind belegt — mehr ist es nicht.
 *
 * Was ueberzeugen wuerde, steht darunter mit `value: null`: produktive
 * Systeme, automatisierte Vorgaenge, Jahre im Betrieb. Es sind genau die
 * Zahlen, die ein Haus wie dieses hat und die niemand nachzaehlen kann —
 * und deshalb genau die, die man sich am leichtesten ausdenkt. Sie stehen
 * hier als Feld, nicht als Wert: `null` heisst, die Kachel erscheint nicht.
 *
 * Wer eine davon fuellt, muss sie belegen koennen. „Ungefaehr 40" ist keine
 * Zahl, sondern ein Gefuehl mit Ziffern.
 */
/**
 * Gruendungsjahr — vom Inhaber bestaetigt (2026-08-17).
 *
 * Steht hier und nicht als Zeichenkette in drei Kacheln: Aus derselben Zahl
 * kommen das „Seit 2017" im Band, `foundingDate` in den strukturierten Daten
 * und die gerechneten Jahre darunter.
 */
export const FOUNDING_YEAR = 2017

/**
 * MP10-2 (Zusatz) — „Jahre im Betrieb" ist RECHENBAR, nicht zu schaetzen.
 *
 * Die Kachel stand auf `null` und wartete auf den Owner. Sie muss es nicht:
 * Wie lange dieses Haus im Geschaeft ist, ergibt sich aus dem
 * Gruendungsjahr — dieselbe Zahl, die eine Kachel weiter links schon steht,
 * nur anders gelesen. Das ist keine erfundene Kennzahl, sondern eine
 * Subtraktion.
 *
 * WAS SIE NICHT BEHAUPTET: nicht, wie lange EIN uebergebenes System schon
 * laeuft. Das waere eine andere, groessere Aussage und liesse sich ohne
 * Owner-Angabe nicht belegen — die Beschriftung im Woerterbuch sagt deshalb
 * ausdruecklich „seit der Gruendung".
 *
 * Der Wert wird zur Bauzeit gerechnet. Er aendert sich also erst mit dem
 * naechsten Deploy nach dem Jahreswechsel — und das ist richtig so: Eine Zahl,
 * die sich im Browser des Besuchers selbst weiterzaehlt, waere zur Bauzeit
 * nicht mehr nachpruefbar.
 */
const OPERATING_YEARS = new Date().getFullYear() - FOUNDING_YEAR

export const impactFigures: { value: string | null; key: string }[] = [
  { value: String(FOUNDING_YEAR), key: "since" },
  { value: "4", key: "products" },
  // TODO (Owner): echte Zahlen — bis dahin rendert keine dieser zwei Kacheln.
  { value: null, key: "systems" },
  { value: null, key: "automated" },
  { value: OPERATING_YEARS > 0 ? String(OPERATING_YEARS) : null, key: "operatingYears" },
]

/** Nur Kennziffern mit belegtem Wert verlassen die Datei. */
export const publishedImpactFigures = impactFigures.filter(
  (figure): figure is { value: string; key: string } => figure.value !== null,
)

/** Aussagen ueber Reichweite. Werden als Text gesetzt, nicht als Zahl. */
export const impactFacts = ["regions", "scope"] as const

/** Die fünf Ebenen — aufsteigende Architektur. */
export const serviceLayers = [
  { level: "01", key: "identity" as const },
  { level: "02", key: "digital" as const },
  { level: "03", key: "operations" as const },
  { level: "04", key: "automation" as const },
  { level: "05", key: "intelligence" as const },
]

/** Nur die Schluessel, in derselben Reihenfolge — fuer Chips und Sprungmarken. */
export const serviceLayerKeys = serviceLayers.map((layer) => layer.key)

/**
 * Einstiegs-Chips unter der Hero-Subline (PHASE A, §4.1).
 *
 * ---------------------------------------------------------------------------
 * MP10-2.7 — HIER STANDEN VIER, UND ZWEI DAVON GAB ES NICHT
 * Die Chips hiessen „Brand · Digital · KI · Produkte". Drei Fehler auf
 * engstem Raum: Es sind FUENF Ebenen, nicht vier — wer hier vier zaehlt und
 * eine Sektion tiefer fuenf liest, hat den ersten Widerspruch der Seite
 * gefunden. „Brand" und „KI" sind Uebersetzungen der Ebenennamen, also zwei
 * Vokabeln fuer dieselbe Sache: In der Kachel darunter steht „Identity", im
 * Menue „Intelligence". Und „Produkte" ist gar keine Ebene, sondern der
 * Beleg — an dieser Stelle macht es die Reihe zu einer Aufzaehlung ohne
 * Ordnung.
 *
 * Jetzt sind es genau die fuenf Ebenen, in der Reihenfolge des Hauses, mit
 * denselben Namen wie in `CapabilityTiles`, auf `/leistungen` und in der
 * Fusszeile. Der Beschriftungstext kommt aus `t.services.layers` — eine
 * Quelle, damit die Reihe nicht wieder auseinanderlaeuft.
 */
export const heroChips = serviceLayerKeys.map((key) => ({
  key,
  href: `/leistungen#ebene-${key}`,
}))

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
  /*
   * V2-2 — „Umsetzung" hat gefehlt, und zwar der laengste Schritt von allen.
   *
   * Der Ablauf sprang von „Angebot" direkt zu „Betrieb". Dazwischen liegen
   * die Wochen, in denen tatsaechlich gebaut wird — und aus Sicht eines
   * Kunden ist genau das die Zeit, in der er nichts hoert und nicht weiss,
   * ob etwas passiert. Eine Ablaufliste, die ihre laengste Etappe
   * verschweigt, beantwortet die Frage „was passiert, wenn ich schreibe"
   * nur bis zur Unterschrift.
   */
  { step: "04", key: "implementation" as const },
  { step: "05", key: "operate" as const },
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
/*
 * EINSTIEGSANGEBOTE — zwei Tueren, nicht das Haus (KIZILELMA §10.7).
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS EINE EIGENE RUBRIK IST
 * Das Website-Paket stand hier als „das Angebot" — die einzige bepreiste
 * Sache der Seite, direkt unter den fuenf Ebenen. Wer so liest, kommt zu dem
 * Schluss, der in der Tiefen-Analyse steht: „doch nur eine Website-Agentur."
 * Ein Festpreis-Paket fuer 2.400 EUR ist kein Beispiel der System-Haus-
 * Architektur, es ist der Einstieg davor. Beides in einer Reihe zu zeigen
 * macht das Groessere klein, nicht das Kleinere gross.
 *
 * Deshalb: Diese Liste heisst „Einstiegsangebote" und traegt jetzt ZWEI
 * Eintraege — das Website-Paket und die Barrierefreiheits-Pruefung. Beide
 * sind Festpreise, beide sind Tueren ins Haus, keiner von beiden ist die
 * Hauptarchitektur. Die steht darueber in den fuenf Ebenen und rechnet nach
 * Umfang ab.
 *
 * Der frueher hier stehende Lock „EIN beworbenes Angebot" ist damit
 * abgeloest (KIZILELMA §10 vor §9.8). Was NICHT gelockert ist: Es gibt
 * weiterhin genau EINE Preisleiter je Angebot, und kein Preis erscheint an
 * zwei Stellen mit zwei Zahlen.
 *
 * ---------------------------------------------------------------------------
 * Die Website-Leiter (KIZILELMA §9.3, gesperrt):
 *
 * Hier standen drei Pakete — 350 EUR einmalig, 500 EUR/Monat, 1.500 EUR/Monat.
 * Zwei Probleme auf einmal: Die Zahlen entsprachen nicht mehr dem, was das
 * Haus verkauft, und sie gingen ueber `hasOfferCatalog` als strukturierte
 * Daten an Google. Solange 350 EUR dasteht, verhandelt man gegen sich selbst.
 *
 * Die Leiter (KIZILELMA §9.3, gesperrt — nicht ueberspringen, nicht
 * unterbieten):
 *   Betrieb 1 + 2   2.400 EUR netto   Referenzpreis, offen als solcher benannt
 *   ab Betrieb 3    3.900 EUR netto   Regelpreis
 *   danach            149 EUR/Monat   laufende Betreuung (siehe `retainer`)
 *
 * `regularPrice` steht bewusst DANEBEN und nicht statt des Einstiegs: Wer
 * den Referenzpreis bekommt, soll sehen, was er kostet — sonst ist es kein
 * Entgegenkommen, sondern eine spaetere Ueberraschung.
 */
export type Package = {
  key: "website" | "audit"
  tier: string
  price: string
  amount: number
  period: string | null
  /*
   * MP10-2.3 — DIE PROJEKTDAUER NEBEN DEM PREIS.
   *
   * „Was kostet das" und „wie lange dauert das" sind eine Frage, nicht zwei:
   * Ein Festpreis ohne Zeitrahmen laesst genau die Unsicherheit stehen, die
   * er beseitigen soll. Steht die Dauer daneben, ist das Angebot vollstaendig.
   *
   * Sie ist trotzdem `null` — und das bleibt sie, bis der Owner sie nennt.
   * Eine geschaetzte Projektdauer ist eine Zusage, die im ersten Projekt
   * gebrochen wird; „vier bis sechs Wochen" hingeschrieben, weil es plausibel
   * klingt, ist erfunden. Solange `null`, rendert die Zeile nicht und die
   * Luecke steht auf `/status`.
   */
  duration: Localized | null
  /** Regelpreis ab dem dritten Betrieb — steht offen daneben. */
  regularPrice?: string
  regularAmount?: number
  recommended: boolean
  /**
   * Wohin die Schaltfläche fuehrt. Ohne Angabe in den Termin-Assistenten
   * (`/termin?paket=<key>`); mit Angabe auf die Leistungsseite, die das
   * Angebot ausfuehrlich beschreibt.
   *
   * Fuer die Pruefung ist das die richtige Reihenfolge: Sie hat eine eigene
   * Seite mit Grenze, Preisleiter und Kurz-Check. Wer aus einer Kachel
   * heraus direkt in ein Terminformular faellt, hat vorher nicht gelesen,
   * was er bucht.
   */
  ctaHref?: string
}

export const packages: Package[] = [
  {
    key: "website",
    tier: "01",
    price: "€2.400",
    amount: 2400,
    period: null,
    regularPrice: "€3.900",
    regularAmount: 3900,
    recommended: false,
    // TODO (Owner): reale Projektdauer. Bis dahin rendert die Zeile nicht.
    duration: null,
  },
  {
    /*
     * Die Barrierefreiheits-Pruefung (Owner-Beschluss, zweites Angebot).
     *
     * Der Preis steht hier NICHT zusaetzlich, sondern derselbe wie in der
     * Preisleiter auf `/leistungen/barrierefreiheit-website` — dort als
     * erste Stufe, hier als Kachel. Eine Zahl, zwei Ansichten. Die Behebung
     * (2.000–4.000 EUR) taucht hier bewusst nicht auf: Sie ist kein
     * Festpreis, und eine Spanne in einer Preiskachel liest jeder als
     * Angebot.
     */
    key: "audit",
    tier: "02",
    price: "€1.500",
    amount: 1500,
    period: null,
    recommended: false,
    ctaHref: "/leistungen/barrierefreiheit-website",
    // TODO (Owner): wie lange die Pruefung von der Zusage bis zum Bericht dauert.
    duration: null,
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
/* ==========================================================================
 * MANAGED BETRIEB (V2-3 · KIZILELMA §10.1 / §10.7)
 *
 * Die sieben Bestandteile des laufenden Betriebs, benannt.
 *
 * ---------------------------------------------------------------------------
 * WARUM SIE HIER STEHEN UND NICHT IM WOERTERBUCH
 * Sie stehen im Woerterbuch — die Texte. Hier steht nur die REIHENFOLGE und
 * die Schluessel, aus demselben Grund wie bei `serviceLayers`: Die Reihe ist
 * eine Aussage (Hosting zuerst, Weiterentwicklung zuletzt) und sie darf sich
 * nicht danach richten, in welcher Reihenfolge jemand zwei Woerterbuecher
 * gepflegt hat.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER BEWUSST FEHLT
 * Keine Verfuegbarkeitszusage in Prozent, keine Reaktionszeit in Stunden,
 * kein „24/7". Zugesagt ist, was im Retainer-Umfang steht — Rueckruf am
 * naechsten Werktag. Eine SLA-Zahl, die ein Haus dieser Groesse an einem
 * Sonntag nicht halten kann, ist keine Zusage, sondern eine spaetere
 * Enttaeuschung (dieselbe Begruendung wie bei BF-8).
 * ========================================================================== */
export const managedOperations = [
  "hosting",
  "monitoring",
  "updates",
  "security",
  "backups",
  "support",
  "evolution",
] as const

export const retainer = {
  /** Preis pro Monat, netto. `null` = der Block erscheint nicht. */
  price: "€149" as string | null,
  amount: 149 as number | null,
  /** Was tatsächlich geliefert wird — vom Owner bestätigt, nicht abgeleitet. */
  description: {
    de: "Nach dem Livegang bleibt die Seite in Betrieb — und wir bleiben ansprechbar. Kein Paket, das etwas verwaltet, sondern der Mensch, der sie gebaut hat.",
    tr: "Yayına aldıktan sonra site işlemeye devam eder — ve biz ulaşılabilir kalırız. Bir şeyi yöneten bir paket değil, siteyi kuran kişinin kendisi.",
  } as Localized | null,
  /** Einzelne Leistungen, in beiden Sprachen. */
  includes: {
    de: [
      "Hosting und Sicherheitsupdates",
      "Bis zu 2 Inhaltsänderungen im Monat",
      "Google-Unternehmensprofil aktuell halten",
      /* BF-A11 — die Zusage aus der Preisleiter der Barrierefreiheits-Seite
         steht hier im Leistungsumfang, nicht nur dort im Fliesstext. Eine
         Zusage, die nur auf der Verkaufsseite steht, ist keine. */
      "Barrierefreiheits-Lauf bei jeder Änderung, einmal im Jahr von Hand",
      "Rückruf am nächsten Werktag",
    ],
    tr: [
      "Hosting ve güvenlik güncellemeleri",
      "Ayda 2 içerik değişikliğine kadar",
      "Google işletme profilini güncel tutmak",
      "Her değişiklikte erişilebilirlik geçişi, yılda bir kez elle",
      "Bir sonraki iş günü geri arama",
    ],
  } as { de: string[]; tr: string[] } | null,
}

export const retainerPublished = Boolean(retainer.price && retainer.description)

export const meaiCapabilityKeys = ["overview", "tasks", "documents", "decisions"] as const

/*
 * ==========================================================================
 * ZERTIFIZIERUNGEN & MITGLIEDSCHAFTEN — ENTFERNT (V2-5 · KIZILELMA §9.9)
 * ==========================================================================
 *
 * Hier standen vier Eintraege: BAFA, iuk Osnabrueck, AVPQ, AGD. Sie trugen
 * die Ueberschrift „Geprueft. Zugelassen. Eingetragen." und den Satz „Vier
 * Nachweise, die man nachschlagen kann" — und keiner von ihnen war belegt.
 * Die AGD-Mitgliedschaft besteht nicht, die iuk-Mitgliedschaft besteht
 * nicht, der AVPQ-Eintrag ist nicht nachgewiesen, und die BAFA-Berater-ID
 * stammt aus einem ausgelaufenen Programm.
 *
 * Das war der schwerste Fehler auf der ganzen Seite. Nicht weil vier
 * Kacheln fehlten, sondern wegen der Reihenfolge: Ein unbelegter Nachweis
 * ist schlimmer als kein Nachweis. Wer eines der vier nachschlaegt und
 * nichts findet, glaubt danach auch die Saetze nicht mehr, die stimmen —
 * und auf dieser Seite stimmt sonst jeder.
 *
 * Sie standen zusaetzlich als `hasCredential` in den strukturierten Daten
 * von /unternehmen. Dort war es dieselbe Behauptung, nur unsichtbar und
 * gegenueber Google.
 *
 * ---------------------------------------------------------------------------
 * WAS ZURUECKKOMMT, UND WANN
 * Jede einzelne — sobald sie real erworben ist und sich bei der nennenden
 * Stelle nachschlagen laesst. Dann mit Nachweis, Datum und Quelle. Bis
 * dahin steht die Frage auf `creadig-AUDIT-BACKLOG.md` und nicht auf der
 * Seite.
 *
 * Mit den Eintraegen sind gegangen: `Certification`, die Sektion
 * `components/sections/certifications.tsx`, die Nachweis-Zeile der
 * Startseite (`proof-line.tsx`), das Woerterbuch unter `certs` und
 * `home.proof`, die Menuepunkte „Zertifizierungen" in Kopf- und Fusszeile
 * und der `hasCredential`-Block. Ein Rest, der nur noch auf sich selbst
 * zeigt, ist kein Geruest, sondern Bauschutt.
 */

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

/**
 * Bediente Laender fuer schema.org `areaServed` — ISO-3166-1 alpha-2.
 *
 * Stand bis zur Owner-Entscheidung vom 23.08.2026 an vier Stellen einzeln
 * (`site-shell`, `/leistungen`, `/leistungen/[slug]`, `/kontakt`). Vier
 * Kopien derselben Angabe heisst: Beim naechsten Markt aendert jemand drei
 * davon. Deshalb hier, an derselben Stelle wie `contact.markets` — die
 * sichtbare Zeile und das Maschinen-Feld sagen jetzt dasselbe, weil sie
 * nebeneinander stehen.
 */
export const areaServed = ["DE", "AT", "CH"] as const

export const contact = {
  whatsapp: "+41 76 504 58 79",
  whatsappHref: "https://wa.me/41765045879",
  email: "info@creadig.de",
  address,
  addressLines,
  /** Sitz — kurz. */
  locations: "Osnabrück (DE)",
  /*
   * Zielmarkt (KIZILELMA §10.10, Owner-Entscheidung 23.08.2026): DACH.
   *
   * Das ist bewusst als MARKT formuliert und nicht als Kundenliste. Sitz ist
   * und bleibt Osnabrück; in der Schweiz gibt es Kundenwerk (NV SWISS),
   * in Österreich heute nicht. „Deutschland, Österreich & Schweiz" sagt,
   * wohin gearbeitet wird — nicht, wo überall schon jemand unterschrieben
   * hat. Eine Behauptung bestehender AT-Kunden steht nirgends.
   */
  markets: "Deutschland, Österreich & Schweiz",
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
  /** Rechtsform — vom Inhaber bestätigt (22.08.2026). */
  legalForm: "Einzelunternehmen" as string | null,
  /** Umsatzsteuer-Identifikationsnummer nach § 27 a UStG. */
  vatId: null as string | null,
  /**
   * `true`, wenn die Kleinunternehmerregelung nach § 19 UStG greift.
   * Dann tritt der entsprechende Hinweis an die Stelle der USt-IdNr.
   * Entweder `vatId` ODER `smallBusiness` muss gesetzt sein — nicht beides.
   */
  smallBusiness: null as boolean | null,
  /**
   * Klar markierter Platzhalter, solange der Steuerstatus nicht freigegeben
   * ist. Er ist NICHT als Angabe gemeint und wird auf der Seite auch nicht so
   * gesetzt: Die Zeile traegt sichtbar die Kennzeichnung „Platzhalter" und der
   * Pending-Hinweis bleibt stehen. Ohne den echten Wert kein Livegang
   * (Live-Checkliste, Phase 5).
   */
  taxStatusPending: true,
  /**
   * Verantwortlicher nach § 18 Abs. 2 MStV (Name; Anschrift nur, wenn sie
   * von der Geschäftsanschrift abweicht). Vom Inhaber bestätigt (22.08.2026).
   */
  mstvResponsible: "Muhammed Emin Akyol" as string | null,
  /** Deutsche Rufnummer fürs Impressum, z. B. "+49 …". */
  phone: null as string | null,
  /**
   * Wie `taxStatusPending`: markierter Platzhalter statt einer erfundenen
   * Nummer. Es wird KEIN `tel:`-Link daraus — ein Anruf-Link, der ins Leere
   * fuehrt, waere schlimmer als keiner.
   */
  phonePending: true,
} as const

/**
 * Vollständig im Sinne der Pflichtangaben: Rechtsform, Umsatzsteuer-Status
 * (USt-IdNr. oder § 19-Hinweis) und § 18 Abs. 2 MStV liegen vor.
 */
/**
 * SEC-2 — wer im Auftrag von creaDIG Daten verarbeitet.
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS EINE LISTE IST UND KEIN SATZ
 * Bisher standen die Dienstleister verstreut in der Datenschutzerklaerung:
 * Vercel unter „Server-Logs", Vercel noch einmal unter „Hosting", Resend im
 * Formular-Absatz. Wer wissen will, wohin seine Daten gehen, muss dann drei
 * Absaetze zusammensetzen — und wer die Seite pflegt, vergisst beim naechsten
 * Dienst einen davon. Art. 30 DSGVO verlangt ohnehin ein Verzeichnis; das
 * hier ist seine oeffentliche Seite, aus einer Quelle gespeist.
 *
 * ---------------------------------------------------------------------------
 * `dpaConfirmed` IST EIN OWNER-FELD, KEIN CODE-FELD
 * Ein Auftragsverarbeitungsvertrag ist nichts, was ein Entwickler behaupten
 * kann. Solange der Owner ihn nicht im jeweiligen Dashboard bestaetigt und
 * abgelegt hat, steht `false` — und die Seite schreibt dann nicht „es besteht
 * ein Vertrag", sondern kennzeichnet die Zeile sichtbar als offen. Die
 * Alternative waere, eine Rechtslage zu behaupten, die vielleicht nicht
 * besteht; das ist genau die Sorte Satz, die im Ernstfall teuer wird.
 *
 * Beide Vertraege stehen auf der Live-Checkliste (Phase 5).
 */
export type Processor = {
  /** Schluessel fuer die Zwecktexte in `dictionary.legal.processorPurposes`. */
  key: "vercel" | "resend"
  company: string
  country: string
  /** Rechtsgrundlage der Uebermittlung ins Drittland. */
  safeguard: "scc"
  /** Wo der Vertrag liegt — oeffentlich einsehbar. */
  dpaUrl: string
  /** Vom Owner im Dashboard bestaetigt und abgelegt? */
  dpaConfirmed: boolean
  /*
   * R-1 — die einzelnen Dienste dieses Anbieters, mit Namen.
   *
   * Warum das noetig war: In der Liste stand "Vercel Inc." und dahinter ein
   * Zwecktext. Vercel Speed Insights lief da laengst mit — es misst die
   * Ladezeiten ECHTER Aufrufe und traegt dabei IP und Seitenpfad. Wer nur
   * "Hosting und Reichweitenmessung" liest, kann nicht erkennen, dass zwei
   * getrennte Messungen laufen. Ein Verarbeiter, dessen Dienste man nicht
   * benennt, ist nicht wirklich benannt.
   */
  services: string[]
}

export const processors: Processor[] = [
  {
    key: "vercel",
    company: "Vercel Inc.",
    country: "USA",
    safeguard: "scc",
    dpaUrl: "https://vercel.com/legal/dpa",
    dpaConfirmed: false,
    services: ["Hosting & CDN", "Vercel Web Analytics", "Vercel Speed Insights"],
  },
  {
    key: "resend",
    company: "Resend Inc.",
    country: "USA",
    safeguard: "scc",
    dpaUrl: "https://resend.com/legal/dpa",
    dpaConfirmed: false,
    services: ["Resend (E-Mail-Versand)"],
  },
]

/** Solange das `false` ist, bleibt der offene Hinweis auf der Seite stehen. */
export const processorsConfirmed = processors.every((p) => p.dpaConfirmed)

export const imprintComplete =
  Boolean(imprintDetails.legalForm) &&
  (Boolean(imprintDetails.vatId) || imprintDetails.smallBusiness === true) &&
  Boolean(imprintDetails.mstvResponsible)
