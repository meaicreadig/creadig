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
 * Sechs Seiten, alle in der Nische (Handwerk, KMU, Gastronomie) —
 * Schwerpunkt Deutschland, offen für Unternehmen jeder Branche. Die sechste
 * (Barrierefreiheit) ist seit Master-Prompt 7 die Einstiegsleistung: der
 * Türöffner, hinter dem Relaunch und Betreuung stehen.
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
  /**
   * BF-A6 — „Was wir tun, und was nicht."
   *
   * Optional, und bewusst nicht auf jeder Seite: Er gehört dorthin, wo die
   * Grenze der eigenen Leistung Teil des Angebots ist. Bei Barrierefreiheit
   * ist genau das der Fall — die technische Prüfung ist unsere Arbeit, die
   * rechtliche Bewertung ist es nicht, und wer das nicht ausspricht, wird
   * genau daran gemessen. Ein Kunde, der glaubt, er habe Rechtssicherheit
   * gekauft, ist ein Rechtsstreit mit Ansage.
   */
  boundary?: {
    /** Was wir zusagen. */
    we: { de: string[]; tr: string[] }
    /** Was wir ausdrücklich nicht zusagen — und wer es stattdessen tut. */
    notWe: { de: string[]; tr: string[] }
    /** Der eine Satz darunter: sachlich, ohne Drohung. */
    note: Localized
  }
  /** Pakete, in denen die Leistung enthalten ist. */
  packageKeys: "website"[]
  /**
   * BF-A5 — Seiten, deren Leistung NICHT im Paket steckt, sondern davor.
   *
   * Der Regelfall ist `packageKeys`: Die Leistung ist Bestandteil des
   * Website-Pakets, die Seite verweist dorthin. Barrierefreiheit ist der
   * erste Fall, der beides ist — im Paket eingebaut, wenn neu gebaut wird,
   * und eine eigene Leistung, wenn die Seite schon steht. Dieser Satz sagt
   * das an der Paketliste, statt es dem Leser zu ueberlassen.
   */
  packageNote?: Localized
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
    packageKeys: ["website"],
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
      de: "Logo, Marke und Auftritt für Gründer und neue Betriebe — als Fundament, nicht als Dekoration. Festpreis, kein Abo.",
      tr: "Girişimciler ve yeni işletmeler için logo, marka ve görünüm — dekorasyon değil, temel. Sabit fiyat, aboneliksiz.",
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
    packageKeys: ["website"],
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
    packageKeys: ["website"],
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
    packageKeys: ["website"],
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
    packageKeys: ["website"],
    workSlugs: ["meai", "fibero", "meahv"],
    published: true,
  },
  {
    /*
     * BF-A5 — Barrierefreiheit als eigene Leistung.
     *
     * -----------------------------------------------------------------------
     * WARUM DIESE SEITE ANDERS GEBAUT IST ALS DIE VIER DARUEBER
     * Die anderen vier Seiten buendeln, was das Haus ohnehin tut, fuer je
     * einen Suchbegriff. Diese hier verkauft eine Pruefung — und eine
     * Pruefung, die man nicht belegen kann, ist eine Behauptung. Deshalb
     * traegt sie drei Bloecke, die es sonst nicht gibt: die Grenze der
     * eigenen Leistung (`boundary`), den Beleg am eigenen Objekt
     * (`ownProof`) und die Preisleiter (`priceLadder`).
     *
     * -----------------------------------------------------------------------
     * WAS HIER NICHT STEHT — UND WARUM
     * Keine Bussgeldhoehe, keine Abmahnung, keine Behoerde, keine Frist als
     * Druckmittel, kein "rechtssicher" und kein "garantiert konform".
     * Argumentiert wird ueber den Kunden, der abbricht, nie ueber die
     * Strafe. Das ist keine Zurueckhaltung aus Vorsicht: Wer mit Angst
     * verkauft, bekommt einen Kunden, der die Rechnung bezahlt und nie
     * wiederkommt — und wer eine Rechtsfolge verspricht, verkauft etwas,
     * das er gar nicht liefern darf.
     */
    slug: "barrierefreiheit-website",
    chip: { de: "Barrierefreiheit", tr: "Erişilebilirlik" },
    layer: "digital",
    h1: {
      de: "Barrierefreiheit: geprüft, behoben, nachweisbar.",
      tr: "Erişilebilirlik: denetlenir, giderilir, belgelenir.",
    },
    lead: {
      de: "Ein Kunde bricht die Bestellung ab, weil sein Screenreader das Pflichtfeld nicht vorliest. Er schreibt Ihnen nicht, warum — er ist einfach weg. Wir prüfen Ihre Website nach WCAG 2.1 AA von Hand, schreiben jeden Fund mit Beleg auf und beheben ihn im Code. Kein Overlay, kein Widget.",
      tr: "Bir müşteri siparişi yarıda bırakır, çünkü ekran okuyucusu zorunlu alanı okumaz. Size nedenini yazmaz — sadece gider. Web sitenizi WCAG 2.1 AA ölçütlerine göre elle denetler, bulduğumuz her şeyi kanıtıyla yazar ve kodun içinde gideririz. Overlay yok, eklenti yok.",
    },
    metaTitle: {
      de: "Barrierefreiheit Website & BFSG Onlineshop",
      tr: "Web sitesi erişilebilirliği & BFSG (Almanya)",
    },
    metaDescription: {
      de: "Barrierefreiheit für Website und Onlineshop: manuelle Prüfung nach WCAG 2.1 AA, Befundbericht mit Belegen, Behebung im Code — ohne Overlay. Aus Osnabrück, auf Deutsch und Türkisch.",
      tr: "Web sitesi ve online mağaza için erişilebilirlik: WCAG 2.1 AA ölçütlerine göre elle denetim, kanıtlı bulgu raporu, kod içinde giderme — overlay olmadan. Osnabrück'ten, Almanca ve Türkçe.",
    },
    includes: {
      de: [
        "Manuelle Prüfung nach unserem 12-Punkte-Raster — demselben, mit dem wir unsere eigene Seite geprüft haben",
        "Durchlauf mit Tastatur und Screenreader, nicht nur ein automatischer Scan",
        "Befundbericht: jeder Fund mit Seite, Element, WCAG-Kriterium und Messwert",
        "Behebung im Code Ihrer Seite — kein Overlay, kein Widget, kein Plugin",
        "Erklärung zur Barrierefreiheit und Feedback-Weg als technische Vorlage",
        "Nachprüfung nach der Behebung, mit Zahlen vorher und nachher",
      ],
      tr: [
        "Kendi 12 maddelik denetim şablonumuzla elle denetim — kendi sitemizi denetlediğimiz şablonun aynısı",
        "Klavye ve ekran okuyucuyla baştan sona geçiş, yalnızca otomatik tarama değil",
        "Bulgu raporu: her bulgu sayfası, öğesi, WCAG ölçütü ve ölçülen değeriyle",
        "Sitenizin kodunda giderme — overlay yok, widget yok, eklenti yok",
        "Erişilebilirlik beyanı ve geri bildirim yolu, teknik taslak olarak",
        "Giderme sonrası yeniden denetim, öncesi ve sonrası sayılarla",
      ],
    },
    forWhom: {
      de: [
        "Betriebe mit Onlineshop oder Buchungsstrecke",
        "Handwerk, KMU und Gastronomie — Schwerpunkt Deutschland",
        "Wer eine bestehende Seite hat und zuerst wissen will, wo sie steht",
      ],
      tr: [
        "Online mağazası veya randevu/rezervasyon akışı olan işletmeler",
        "Zanaat, KOBİ ve gastronomi — ağırlık Almanya",
        "Mevcut bir sitesi olan ve önce durumunu öğrenmek isteyenler",
      ],
    },
    boundary: {
      we: {
        de: [
          "Wir prüfen Ihre Seite nach WCAG 2.1 AA — von Hand, mit Tastatur und Screenreader, nicht nur mit einem Scanner.",
          "Wir schreiben jeden Fund mit Seite, Element, Kriterium und Messwert auf, auch die unangenehmen.",
          "Wir beheben die Funde im Code und prüfen danach erneut, mit Zahlen vorher und nachher.",
          "Wir liefern Ihnen Erklärung und Feedback-Weg als technische Vorlage — Text und Struktur, fertig zum Einsetzen.",
        ],
        tr: [
          "Sitenizi WCAG 2.1 AA ölçütlerine göre denetleriz — elle, klavye ve ekran okuyucuyla, yalnızca tarayıcı programla değil.",
          "Her bulguyu sayfası, öğesi, ölçütü ve ölçülen değeriyle yazarız; rahatsız edici olanları da.",
          "Bulguları kodda gideririz ve sonrasında öncesi–sonrası sayılarla yeniden denetleriz.",
          "Erişilebilirlik beyanını ve geri bildirim yolunu teknik taslak olarak veririz — metin ve yapı, yerine konmaya hazır.",
        ],
      },
      notWe: {
        de: [
          "Wir bewerten nicht, ob und wie das Gesetz für Ihren Betrieb gilt. Das ist eine Rechtsfrage, und die beantwortet Ihr Anwalt — nicht wir.",
          "Wir geben die Erklärung zur Barrierefreiheit nicht frei. Wir liefern die Vorlage; veröffentlicht wird sie, nachdem Ihre Rechtsberatung sie gesehen hat.",
          "Wir setzen kein Overlay ein und empfehlen keins. Ein Overlay legt eine Schicht über die Seite, statt die Barriere zu entfernen — darunter bleibt alles, wie es war.",
          "Wir versprechen kein rechtliches Ergebnis. Zugesagt ist Prüfung und Umsetzung nach WCAG 2.1 AA, und nichts darüber hinaus.",
        ],
        tr: [
          "Yasanın işletmeniz için geçerli olup olmadığını ve nasıl geçerli olduğunu biz değerlendirmeyiz. Bu bir hukuk sorusudur, yanıtını avukatınız verir.",
          "Erişilebilirlik beyanını biz onaylamayız. Taslağı veririz; yayımlanması, hukuk danışmanınız gördükten sonra olur.",
          "Overlay kullanmayız ve önermeyiz. Overlay, engeli kaldırmak yerine sitenin üzerine bir katman koyar — altındaki her şey olduğu gibi kalır.",
          "Hukuki bir sonuç vaat etmeyiz. Verdiğimiz söz, WCAG 2.1 AA'ya göre denetim ve uygulamadır; fazlası değil.",
        ],
      },
      note: {
        de: "Das Barrierefreiheitsstärkungsgesetz gilt seit dem 28. Juni 2025. Wir nennen das Datum, weil es zur Sache gehört — nicht, um Druck zu machen. Der bessere Grund steht oben: der Kunde, der abbricht und nicht sagt, warum.",
        tr: "Almanya'daki erişilebilirlik yasası (BFSG) 28 Haziran 2025'ten beri yürürlükte. Tarihi, konuya ait olduğu için yazıyoruz — baskı kurmak için değil. Daha iyi gerekçe yukarıda: yarıda bırakıp nedenini söylemeyen müşteri.",
      },
    },
    packageKeys: ["website"],
    packageNote: {
      de: "Wer neu bei uns baut, bekommt Barrierefreiheit eingebaut — sie steht als Zeile im Website-Paket. Was hier beschrieben ist, gilt für eine Seite, die schon steht.",
      tr: "Siteyi bizimle yeni kuranlarda erişilebilirlik baştan içeride — web sitesi paketinde bir satır olarak durur. Burada anlatılan, hâlihazırda ayakta olan bir site içindir.",
    },
    /*
     * Leer, und das bleibt so, bis ein Kunde eine Freigabe unterschreibt.
     * Der Beleg dieser Seite ist nicht fremdes Werk, sondern das eigene:
     * `ownProof` zeigt auf die eigene Erklaerung und den eigenen Befund.
     */
    workSlugs: [],
    published: true,
  },
]

export const publishedServicePages = servicePages.filter((p) => p.published)

export function findServicePage(slug: string) {
  return publishedServicePages.find((p) => p.slug === slug)
}
