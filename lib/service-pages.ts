import type { Localized } from "@/lib/site-data"

/**
 * Granulare Leistungsseiten (E-K4).
 *
 * ---------------------------------------------------------------------------
 * WARUM ES SIE GIBT
 * Die Startseite nennt fünf Ebenen: Identity, Digital, Operations, Automation,
 * Intelligence. Das ist die Sprache des Hauses — aber niemand sucht bei Google
 * nach „Identity". Gesucht wird nach „Webdesign Osnabrück" oder „Website für
 * Handwerksbetrieb". Jede Seite hier ist eine eigene URL für genau einen
 * solchen Suchbegriff, mit eigenem Title, eigener Description und eigenem
 * Canonical.
 *
 * ---------------------------------------------------------------------------
 * WOHER DER INHALT KOMMT — und woher NICHT
 * Kein Satz auf diesen Seiten behauptet etwas, das die Seite nicht schon sagt.
 * Jede Aussage ist entweder aus `dictionary.ts` übernommen (Ebenen-Beschreibung,
 * Prozess, Pakete, Schwerpunkte) oder eine Umformulierung davon in
 * der Vokabel, nach der gesucht wird. Was hier NICHT steht: Zahlen, Fristen,
 * Ergebnisversprechen, Referenzen ohne Freigabe.
 *
 * ---------------------------------------------------------------------------
 * WAS BEWUSST FEHLT: „Lokales SEO"
 * Der naheliegendste SEO-Slug wäre `lokales-seo` gewesen — und genau der ist
 * hier nicht dabei. Sichtbarkeit, Reichweite und Werbung sind heute KEINE
 * Leistung von creaDIG (siehe E-K9). Eine Seite dafür würde Anfragen erzeugen,
 * die das Haus nicht bedienen kann. Sie kommt dazu, wenn die Leistung dazukommt
 * — nicht vorher.
 *
 * ---------------------------------------------------------------------------
 * KEIN WILDWUCHS
 * Fünf Seiten, alle in der Nische (Handwerk, KMU, Gastronomie) —
 * Schwerpunkt Deutschland, offen für Unternehmen jeder Branche.
 * Nicht dreißig generische Landingpages — die verwässern die Domain, statt sie
 * zu stärken.
 */

/** Schlüssel der fünf Ebenen aus `dictionary.services.layers`. */
export type ServiceLayerKey =
  | "identity"
  | "digital"
  | "operations"
  | "automation"
  | "intelligence"

export type ServicePage = {
  slug: string
  /** Ebene, aus der die belegte Beschreibung stammt. */
  layer: ServiceLayerKey
  /** Seitentitel (H1). */
  h1: Localized
  /** Einleitung unter der H1. */
  lead: Localized
  /** <title> — bewusst kürzer und suchnäher als die H1. */
  metaTitle: Localized
  /**
   * Kurzform fuer die Einstiegs-Chips auf der Startseite. Der `metaTitle`
   * ist ein Suchmaschinen-Satz („Webdesign für kleine und mittlere
   * Betriebe") — als Pille gelesen ist er zu lang. Hier steht die Vokabel,
   * nach der jemand tatsaechlich sucht.
   */
  chip: Localized
  metaDescription: Localized
  /** Was dazugehört. Jede Zeile ist eine Leistung, die heute erbracht wird. */
  includes: { de: string[]; tr: string[] }
  /** Für wen — aus den Schwerpunkten und der „Für wen"-Zeile der Ebene. */
  forWhom: { de: string[]; tr: string[] }
  /** Pakete, in denen die Leistung enthalten ist. */
  packageKeys: ("identity" | "growth" | "architecture")[]
  /** Arbeiten, die zu dieser Leistung gehören (slugs aus site-data). */
  workSlugs: string[]
  /** Auf `false` verschwindet die Seite aus Routing UND Sitemap. */
  published: boolean
}

export const servicePages: ServicePage[] = [
  {
    slug: "webdesign",
    chip: { de: "Webdesign", tr: "Web tasarımı" },
    layer: "digital",
    h1: {
      de: "Webdesign, das im Betrieb funktioniert.",
      tr: "İşletmede işe yarayan web tasarımı.",
    },
    lead: {
      de: "Website, Shop oder Landingpage — sichtbar, schnell, auffindbar. Wir bauen den Auftritt nicht als Bild, sondern als Teil Ihres Betriebs: verbunden mit dem, was danach passiert.",
      tr: "Web sitesi, mağaza veya açılış sayfası — görünür, hızlı, bulunabilir. Görünümü bir resim gibi değil, işletmenizin bir parçası olarak kurarız: sonrasında olan her şeye bağlı.",
    },
    metaTitle: { de: "Webdesign für kleine und mittlere Betriebe", tr: "KOBİ'ler için web tasarımı" },
    metaDescription: {
      de: "Website, Shop und Landingpages für kleine und mittlere Betriebe in Deutschland und der Schweiz. Auf Deutsch und Türkisch.",
      tr: "Almanya ve İsviçre'deki küçük ve orta ölçekli işletmeler için web sitesi, mağaza ve açılış sayfaları. Almanca ve Türkçe.",
    },
    includes: {
      de: [
        "Website, Shop oder Landingpage",
        "Aufbau, Inhalte und Struktur",
        "Sichtbar, schnell, auffindbar",
        "Laufender Betrieb statt Übergabe",
      ],
      tr: [
        "Web sitesi, mağaza veya açılış sayfası",
        "Kurgu, içerik ve yapı",
        "Görünür, hızlı, bulunabilir",
        "Teslim değil, sürekli işletme",
      ],
    },
    forWhom: {
      de: ["Bäckerei, Praxis, Restaurant, Handwerksbetrieb", "Betriebe ohne eigene IT-Abteilung"],
      tr: ["Fırın, muayenehane, restoran, zanaat işletmesi", "Kendi BT birimi olmayan işletmeler"],
    },
    packageKeys: ["growth", "architecture"],
    // Echtes Kundenwerk auf der Webdesign-Seite: NV SWISS ist Marke, Website
    // und Digitalisierung aus einer Hand — genau das, was diese Seite anbietet.
    workSlugs: ["nv-swiss", "maqam"],
    published: true,
  },
  {
    slug: "corporate-design",
    chip: { de: "Corporate Design", tr: "Kurumsal tasarım" },
    layer: "identity",
    h1: {
      de: "Corporate Design vom ersten Strich an.",
      tr: "İlk çizgiden itibaren kurumsal tasarım.",
    },
    lead: {
      de: "Marke, Name, Logo, Auftritt — das Fundament, auf dem alles andere steht. Wer damit anfängt, muss später nichts geraderücken.",
      tr: "Marka, isim, logo, görünüm — geri kalan her şeyin üzerinde durduğu temel. Buradan başlayan, sonradan hiçbir şeyi düzeltmek zorunda kalmaz.",
    },
    metaTitle: { de: "Corporate Design und Markenaufbau", tr: "Kurumsal tasarım ve marka kurulumu" },
    metaDescription: {
      de: "Logo, Marke und Auftritt für Gründer und neue Betriebe — als Fundament, nicht als Dekoration. Identity-Paket ab €350 einmalig, ohne Abo.",
      tr: "Girişimciler ve yeni işletmeler için logo, marka ve görünüm — dekorasyon değil, temel. Identity paketi tek seferlik €350'den, aboneliksiz.",
    },
    includes: {
      de: [
        "Logo Design (2–3 Konzepte)",
        "Visitenkarte",
        "Social-Media-Profil",
        "Grundlegendes Brand Manual",
      ],
      tr: [
        "Logo tasarımı (2–3 konsept)",
        "Kartvizit",
        "Sosyal medya profili",
        "Temel marka kılavuzu",
      ],
    },
    forWhom: {
      de: ["Gründer und neue Betriebe", "Handwerk vor dem ersten Auftritt"],
      tr: ["Girişimciler ve yeni işletmeler", "İlk görünümünden önceki zanaat işletmeleri"],
    },
    packageKeys: ["identity", "growth"],
    // Marke und Auftritt aus einer Hand — dieselbe Arbeit, andere Ebene.
    workSlugs: ["nv-swiss"],
    published: true,
  },
  {
    slug: "website-handwerk",
    chip: { de: "Website fürs Handwerk", tr: "Zanaat için web sitesi" },
    layer: "digital",
    h1: {
      de: "Website für Handwerksbetriebe.",
      tr: "Zanaat işletmeleri için web sitesi.",
    },
    lead: {
      de: "Betriebe mit 6–20 Mitarbeitern in NRW und Niedersachsen sind unser Schwerpunkt. Wir sehen uns den Betrieb an, bevor wir eine Zeile bauen — und bauen dann das, was im Alltag trägt.",
      tr: "NRW ve Aşağı Saksonya'daki 6–20 çalışanlı işletmeler bizim odağımız. Bir satır kurmadan önce işletmeye bakarız — sonra günlük işleyişte taşıyan şeyi kurarız.",
    },
    metaTitle: { de: "Website für Handwerksbetriebe", tr: "Zanaat işletmeleri için web sitesi" },
    metaDescription: {
      de: "Websites für Handwerksbetriebe mit 6–20 Mitarbeitern in NRW und Niedersachsen. Erst den Betrieb verstehen, dann bauen, dann betreiben.",
      tr: "NRW ve Aşağı Saksonya'da 6–20 çalışanlı zanaat işletmeleri için web siteleri. Önce işletmeyi anlamak, sonra kurmak, sonra işletmek.",
    },
    includes: {
      de: [
        "Website mit Leistungen, Referenzen und Kontaktweg",
        "Anfragen direkt per WhatsApp",
        "Prozessoptimierung und Operations",
        "Laufende Betreuung statt Übergabe",
      ],
      tr: [
        "Hizmetler, referanslar ve iletişim yolu içeren web sitesi",
        "Talepler doğrudan WhatsApp üzerinden",
        "Süreç iyileştirme ve operasyon",
        "Teslim değil, sürekli destek",
      ],
    },
    forWhom: {
      de: [
        "Handwerk mit 6–20 Mitarbeitern (NRW & Niedersachsen)",
        "Betriebe mit wachsendem Papierberg",
      ],
      tr: [
        "6–20 çalışanlı zanaat işletmeleri (NRW & Aşağı Saksonya)",
        "Evrak yükü büyüyen işletmeler",
      ],
    },
    packageKeys: ["growth", "architecture"],
    workSlugs: [],
    published: true,
  },
  {
    slug: "zweisprachig-de-tr",
    chip: { de: "Zweisprachig DE + TR", tr: "İki dilli DE + TR" },
    layer: "digital",
    h1: {
      de: "Zweisprachig: Deutsch und Türkisch.",
      tr: "İki dilli: Almanca ve Türkçe.",
    },
    lead: {
      de: "Beratung, Unterlagen und laufende Betreuung auf Deutsch und auf Türkisch — auf Wunsch komplett über WhatsApp. Kein Dolmetscher dazwischen, keine halb übersetzte Website.",
      tr: "Danışmanlık, belgeler ve sürekli destek Almanca ve Türkçe — istenirse tamamen WhatsApp üzerinden. Aracı tercüman yok, yarım çevrilmiş web sitesi yok.",
    },
    metaTitle: {
      de: "Zweisprachige Website und Betreuung (DE/TR)",
      tr: "İki dilli web sitesi ve destek (DE/TR)",
    },
    metaDescription: {
      de: "Website, Marke und laufende Betreuung auf Deutsch und Türkisch. Für Betriebe mit Kundschaft oder Mitarbeitern in beiden Sprachen — Kommunikation auf Wunsch über WhatsApp.",
      tr: "Almanca ve Türkçe web sitesi, marka ve sürekli destek. Her iki dilde müşterisi ya da çalışanı olan işletmeler için — istenirse WhatsApp üzerinden iletişim.",
    },
    includes: {
      de: [
        "Website in beiden Sprachen, gleichwertig gepflegt",
        "Beratung und Unterlagen auf Deutsch und Türkisch",
        "Kommunikation über WhatsApp",
        "Betreuung in beiden Sprachen, dauerhaft",
      ],
      tr: [
        "Her iki dilde, eşdeğer bakımlı web sitesi",
        "Almanca ve Türkçe danışmanlık ve belgeler",
        "WhatsApp üzerinden iletişim",
        "Kalıcı olarak her iki dilde destek",
      ],
    },
    forWhom: {
      de: [
        "Betriebe mit Kundschaft in beiden Sprachen",
        "Betriebe, die Mitarbeiter auf Türkisch erreichen wollen",
      ],
      tr: [
        "Her iki dilde müşterisi olan işletmeler",
        "Çalışanlarına Türkçe ulaşmak isteyen işletmeler",
      ],
    },
    packageKeys: ["identity", "growth"],
    // Die frueheren Slugs ("nur", "bir-damla-hayir") gibt es nicht mehr —
    // sie waren kein Kundenwerk. Bis eine zweisprachige Referenz freigegeben
    // ist, bleibt die Liste leer und der Werke-Block rendert nicht.
    workSlugs: [],
    published: true,
  },
  {
    slug: "ki-automatisierung",
    chip: { de: "KI & Automatisierung", tr: "Yapay zekâ & otomasyon" },
    layer: "automation",
    h1: {
      de: "Automatisierung und KI im Betrieb.",
      tr: "İşletmede otomasyon ve yapay zekâ.",
    },
    lead: {
      de: "Wiederkehrende Arbeit übernimmt das System, nicht der Mensch. Und darüber meAI — unser KI-Business-Betriebssystem, das Zahlen, Aufgaben und Dokumente zusammenhält und Entscheidungen vorbereitet.",
      tr: "Tekrar eden işi insan değil, sistem üstlenir. Üzerinde ise meAI — sayıları, görevleri ve belgeleri bir arada tutan ve kararları hazırlayan yapay zekâ tabanlı iş işletim sistemimiz.",
    },
    metaTitle: { de: "Automatisierung und KI-Systeme für KMU", tr: "KOBİ'ler için otomasyon ve yapay zekâ" },
    metaDescription: {
      de: "Automatisierung und eigene KI-Systeme für kleine und mittlere Betriebe. meAI bündelt Zahlen, Aufgaben und Dokumente. Gebaut und betrieben von creaDIG.",
      tr: "Küçük ve orta ölçekli işletmeler için otomasyon ve kendi yapay zekâ sistemlerimiz. meAI sayıları, görevleri ve belgeleri toplar. creaDIG tarafından kurulur ve işletilir.",
    },
    includes: {
      de: [
        "Wiederkehrende Abläufe übernimmt das System",
        "meAI-Plattform-Integration",
        "Operations und Systemaufbau",
        "Betrieb und Weiterentwicklung durch uns",
      ],
      tr: [
        "Tekrar eden akışları sistem üstlenir",
        "meAI platform entegrasyonu",
        "Operasyon ve sistem kurulumu",
        "İşletme ve geliştirme bizden",
      ],
    },
    forWhom: {
      de: [
        "Betriebe mit 6–20 Mitarbeitern und wachsendem Papierberg",
        "Etablierte Betriebe, die Entscheidungen schneller treffen wollen",
      ],
      tr: [
        "6–20 çalışanlı, evrak yükü büyüyen işletmeler",
        "Kararları daha hızlı almak isteyen yerleşik işletmeler",
      ],
    },
    packageKeys: ["architecture"],
    workSlugs: ["meai", "fibero", "meahv"],
    published: true,
  },
]

export const publishedServicePages = servicePages.filter((p) => p.published)

export function findServicePage(slug: string) {
  return publishedServicePages.find((p) => p.slug === slug)
}
