import type { Locale } from "@/lib/dictionary"
import type { Localized, Package } from "@/lib/site-data"

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
  includes: Record<Locale, string[]>
  /** Für wen — aus den Schwerpunkten und der „Für wen"-Zeile der Ebene. */
  forWhom: Record<Locale, string[]>
  /*
   * ==========================================================================
   * MP10-1 — DIE VIER KAUF-FRAGEN
   * ==========================================================================
   *
   * Die Seiten beantworteten bisher „was ist enthalten" und „für wen". Wer
   * kaufen will, fragt vier andere Dinge, und zwar in dieser Reihenfolge:
   * wie läuft das ab, wie lange dauert es, was ändert sich bei mir, was muss
   * ich selbst beisteuern. Drei davon stehen unten als leeres Feld.
   *
   * --------------------------------------------------------------------------
   * WARUM DREI VON VIER LEER SIND
   * `process` darf hier stehen: Jeder Schritt ist eine Umformulierung dessen,
   * was die Seite ohnehin sagt (`includes`, `lead`, die drei Prozessschritte
   * aus dem Wörterbuch, ergänzt um „Umsetzung" aus `opsSteps`). Da wird
   * nichts behauptet, was nicht schon dasteht.
   *
   * `duration`, `fromTo` und `clientEffort` dürfen es NICHT. Eine Projektdauer
   * ist eine Zusage, ein Vorher→Nachher ist ein Ergebnisversprechen und ein
   * Kundenaufwand ist eine Rechnung, die der Kunde in Stunden bezahlt. Alle
   * drei sind aus dem Bestand nicht ableitbar — sie sind Erfahrungswerte, die
   * nur der Owner hat. Erfunden wären sie genau die Sorte Zahl, an der uns
   * später jemand misst.
   *
   * Sie stehen deshalb als Feld, nicht als Wert: `undefined` heißt, der
   * Abschnitt rendert nicht — und die Lücke steht auf `/status`.
   */
  /** „Wie lange dauert das?" — Owner-gegatet, siehe Block oben. */
  duration?: Localized
  /** Die Schritte dieser Leistung, in Reihenfolge. Aus dem Bestand ableitbar. */
  process?: { key: string; title: Localized; body: Localized }[]
  /** „Was ändert sich im Betrieb?" — Owner-gegatet. */
  fromTo?: { before: Localized; after: Localized }
  /** „Was muss ich beitragen?" (Zeit, Zugänge, Material) — Owner-gegatet. */
  clientEffort?: Record<Locale, string[]>
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
    we: Record<Locale, string[]>
    /** Was wir ausdrücklich nicht zusagen — und wer es stattdessen tut. */
    notWe: Record<Locale, string[]>
    /** Der eine Satz darunter: sachlich, ohne Drohung. */
    note: Localized
  }
  /**
   * BF-A9 — der Beleg am eigenen Objekt.
   *
   * Eine Kundenreferenz gibt es hier nicht, und es wird auch keine erfunden:
   * ohne schriftliche Freigabe kein Name. Was es gibt, ist die eigene Seite —
   * geprüft, mit acht gefundenen Mängeln, offengelegt. Das ist der einzige
   * Beleg, den wir ohne fremde Unterschrift zeigen dürfen, und für dieses
   * Angebot der stärkere: Wer seine eigenen Mängel veröffentlicht, hat die
   * Prüfung wirklich gemacht.
   */
  ownProof?: {
    body: Localized
    links: { label: Localized; href: string }[]
  }
  /**
   * BF-A10 — die Preisleiter dieser Leistung.
   *
   * Nur dort, wo die Leistung VOR dem Paket steht und einen eigenen Einstieg
   * hat. Sie macht keine zweite Preiswelt auf: Das beworbene Angebot bleibt
   * das Website-Paket (`packageKeys`, Preis ausschliesslich auf
   * `/leistungen#pakete`). Was hier steht, ist der Einstieg davor — eine
   * Prüfung zum Festpreis, eine Behebung, die erst nach der Prüfung beziffert
   * wird, und die laufende Betreuung, die es ohnehin schon gibt.
   *
   * `kind` entscheidet, welches Etikett am Preis steht. Genau ein `fixed` je
   * Seite: Ein zweiter Festpreis daneben ist keine Leiter mehr, sondern eine
   * Auswahl — und die verschiebt das Gespräch von „was brauchen Sie" zu
   * „was ist billiger".
   */
  priceLadder?: {
    steps: {
      key: string
      price: Localized
      kind: "fixed" | "offer" | "monthly"
      title: Localized
      body: Localized
      /*
       * MP10-2.3 — die Dauer neben dem Preis, je Stufe.
       *
       * Owner-gegatet und heute nirgends gesetzt: Wie lange eine Pruefung von
       * der Zusage bis zum Bericht braucht, weiss nur, wer sie gemacht hat.
       * Ohne Wert rendert die Zeile nicht.
       */
      duration?: Localized
    }[]
    note: Localized
  }
  /**
   * Einstiegsangebote, in denen die Leistung enthalten ist.
   *
   * Seit V2-3 gibt es zwei (`website`, `audit`), und die Barrierefreiheits-
   * Seite fuehrt bewusst weiterhin nur `website`: Das Audit IST diese Seite.
   * Eine Kachel, die auf sich selbst zeigt, ist keine Einordnung.
   */
  packageKeys: Package["key"][]
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
  /**
   * BF-A8 — „Kurz-Check anfragen" unter der Seite.
   *
   * Nur dort, wo ein Blick auf das Objekt des Kunden das Angebot ueberhaupt
   * erst greifbar macht. Auf einer Webdesign-Seite waere es eine zweite
   * Kontaktstrecke ohne Anlass; bei Barrierefreiheit ist es das Angebot:
   * Wir behaupten nicht, dass etwas im Argen liegt, wir sehen nach.
   */
  quickCheck?: boolean
  /** Auf `false` verschwindet die Seite aus Routing UND Sitemap. */
  published: boolean
}

export const servicePages: ServicePage[] = [
  {
    slug: "webdesign",
    chip: { de: "Webdesign", tr: "Web tasarımı", en: "Web design", ar: "تصميم الويب" },
    layer: "digital",
    h1: {
      de: "Webdesign, das im Betrieb funktioniert.",
      tr: "İşletmede işe yarayan web tasarımı.",
      en: "Web design that works in the business.",
      ar: "تصميم ويب يعمل داخل المنشأة.",
    },
    lead: {
      de: "Website, Shop oder Landingpage — sichtbar, schnell, auffindbar. Wir bauen den Auftritt nicht als Bild, sondern als Teil Ihres Betriebs: verbunden mit dem, was danach passiert.",
      tr: "Web sitesi, mağaza veya açılış sayfası — görünür, hızlı, bulunabilir. Görünümü bir resim gibi değil, işletmenizin bir parçası olarak kurarız: sonrasında olan her şeye bağlı.",
      en: "Website, shop or landing page — visible, fast, findable. We build the presence not as a picture but as part of your business: connected to whatever happens next.",
      ar: "موقع أو متجر أو صفحة هبوط — ظاهرة وسريعة وقابلة للعثور عليها. نبني الحضور لا كصورة بل كجزء من منشأتكم: موصولًا بما يحدث بعده.",
    },
    metaTitle: { de: "Webdesign für kleine und mittlere Betriebe", tr: "KOBİ'ler için web tasarımı", en: "Web design for small and medium-sized businesses", ar: "تصميم ويب للمنشآت الصغيرة والمتوسطة" },
    metaDescription: {
      de: "Website, Shop und Landingpages für Unternehmen in Deutschland, Österreich und der Schweiz. Auf Deutsch und Türkisch.",
      tr: "Almanya, Avusturya ve İsviçre'deki işletmeler için web sitesi, mağaza ve açılış sayfaları. Almanca ve Türkçe.",
      en: "Websites, shops and landing pages for companies in Germany, Austria and Switzerland. In German, Turkish and English.",
      ar: "مواقع ومتاجر وصفحات هبوط لشركات في ألمانيا والنمسا وسويسرا. بالألمانية والتركية والإنجليزية والعربية.",
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
      en: [
        "Website, shop or landing page",
        "Structure, content and page architecture",
        "Visible, fast, findable",
        "Ongoing operation instead of handover",
      ],
      ar: [
        "موقع أو متجر أو صفحة هبوط",
        "البنية والمحتوى والتركيب",
        "ظاهر وسريع وقابل للعثور عليه",
        "تشغيل مستمر بدل تسليم",
      ],
    },
    forWhom: {
      de: ["Bäckerei, Praxis, Restaurant, Handwerksbetrieb", "Betriebe ohne eigene IT-Abteilung"],
      tr: ["Fırın, muayenehane, restoran, zanaat işletmesi", "Kendi BT birimi olmayan işletmeler"],
      en: ["Bakeries, practices, restaurants, trade businesses", "Businesses without their own IT department"],
      ar: ["مخابز وعيادات ومطاعم ومنشآت حِرفية", "منشآت دون قسم تقنية معلومات خاص"],
    },
    process: [
      {
        key: "verstehen",
        title: { de: "Verstehen", tr: "Anlamak", en: "Understand", ar: "نفهم" },
        body: {
          de: "Wir sehen uns den Betrieb an, bevor wir eine Zeile bauen: was der Auftritt leisten muss und was danach im Alltag mit einer Anfrage passiert.",
          tr: "Bir satır kurmadan önce işletmeye bakarız: görünümün ne yapması gerektiğine ve bir talebin ardından günlük işleyişte ne olduğuna.",
          en: "We look at the business before we build a line: what the presence has to achieve, and what happens to an enquiry afterwards in daily work.",
          ar: "ننظر في المنشأة قبل أن نبني سطرًا: ما الذي يجب أن يحققه الحضور، وما الذي يحدث للاستفسار بعده في العمل اليومي.",
        },
      },
      {
        key: "aufbau",
        title: { de: "Aufbau", tr: "Kurgu", en: "Architecture", ar: "البنية" },
        body: {
          de: "Struktur, Inhalte und Seitenaufbau stehen fest, bevor gestaltet wird — sonst gestaltet man eine Reihenfolge, die später nicht trägt.",
          tr: "Tasarımdan önce yapı, içerik ve sayfa kurgusu belirlenir — yoksa sonradan taşımayan bir sıralama tasarlanmış olur.",
          en: "Structure, content and page architecture are settled before anything is designed — otherwise you design an order that will not hold later.",
          ar: "البنية والمحتوى وترتيب الصفحات تُحسم قبل التصميم — وإلا صُمّم ترتيبٌ لا يصمد لاحقًا.",
        },
      },
      {
        key: "umsetzung",
        title: { de: "Umsetzung", tr: "Uygulama", en: "Delivery", ar: "التنفيذ" },
        body: {
          de: "Wir bauen Website, Shop oder Landingpage in Abschnitten, die Sie unterwegs zu sehen bekommen. Zwischenstände statt einer Überraschung am Ende.",
          tr: "Web sitesini, mağazayı ya da açılış sayfasını, yol boyunca göreceğiniz bölümler hâlinde kurarız. Sonunda sürpriz yerine ara durumlar.",
          en: "We build the website, shop or landing page in stages you get to see along the way. Interim states instead of a surprise at the end.",
          ar: "نبني الموقع أو المتجر أو صفحة الهبوط على مراحل ترونها في الطريق. حالات وسيطة بدل مفاجأة في النهاية.",
        },
      },
      {
        key: "betrieb",
        title: { de: "Betrieb", tr: "İşletme", en: "Operation", ar: "المنشأة" },
        body: {
          de: "Nach dem Start bleibt der Auftritt in Betrieb: keine Übergabe, sondern laufende Betreuung durch dieselben Leute, die ihn gebaut haben.",
          tr: "Yayına aldıktan sonra görünüm işlemeye devam eder: teslim değil, onu kuran kişilerin sürekli desteği.",
          en: "After launch the presence stays in operation: not a handover, but ongoing support by the same people who built it.",
          ar: "بعد الإطلاق يبقى الحضور في التشغيل: لا تسليم، بل متابعة جارية من الأشخاص أنفسهم الذين بنوه.",
        },
      },
    ],
    packageKeys: ["website"],
    // Echtes Kundenwerk auf der Webdesign-Seite: NV SWISS ist Marke, Website
    // und Digitalisierung aus einer Hand — genau das, was diese Seite anbietet.
    workSlugs: ["nv-swiss", "maqam"],
    published: true,
  },
  {
    slug: "corporate-design",
    chip: { de: "Corporate Design", tr: "Kurumsal tasarım", en: "Corporate design", ar: "الهوية المؤسسية" },
    layer: "identity",
    h1: {
      de: "Corporate Design vom ersten Strich an.",
      tr: "İlk çizgiden itibaren kurumsal tasarım.",
      en: "Corporate design from the first stroke.",
      ar: "هوية مؤسسية من أول خط.",
    },
    lead: {
      de: "Marke, Name, Logo, Auftritt — das Fundament, auf dem alles andere steht. Wer damit anfängt, muss später nichts geraderücken.",
      tr: "Marka, isim, logo, görünüm — geri kalan her şeyin üzerinde durduğu temel. Buradan başlayan, sonradan hiçbir şeyi düzeltmek zorunda kalmaz.",
      en: "Brand, name, logo, presence — the foundation everything else stands on. Start there and you have nothing to straighten out later.",
      ar: "العلامة والاسم والشعار والحضور — الأساس الذي يقوم عليه كل ما سواه. من يبدأ بها لا يحتاج لتقويم شيء لاحقًا.",
    },
    metaTitle: { de: "Corporate Design und Markenaufbau", tr: "Kurumsal tasarım ve marka kurulumu", en: "Corporate design and brand building", ar: "الهوية المؤسسية وبناء العلامة" },
    metaDescription: {
      de: "Logo, Marke und Auftritt für Gründer und neue Betriebe — als Fundament, nicht als Dekoration. Festpreis, kein Abo.",
      tr: "Girişimciler ve yeni işletmeler için logo, marka ve görünüm — dekorasyon değil, temel. Sabit fiyat, aboneliksiz.",
      en: "Logo, brand and presence for founders and new businesses — as a foundation, not decoration. Fixed price, no subscription.",
      ar: "شعار وعلامة وحضور للمؤسسين والمنشآت الجديدة — كأساس لا كزينة. سعر ثابت، دون اشتراك.",
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
      en: [
        "Logo design (2–3 concepts)",
        "Business card",
        "Social media profile",
        "A basic brand manual",
      ],
      ar: [
        "تصميم شعار (2–3 مفاهيم)",
        "بطاقة عمل",
        "ملف تواصل اجتماعي",
        "دليل علامة أساسي",
      ],
    },
    forWhom: {
      de: ["Gründer und neue Betriebe", "Handwerk vor dem ersten Auftritt"],
      tr: ["Girişimciler ve yeni işletmeler", "İlk görünümünden önceki zanaat işletmeleri"],
      en: ["Founders and new businesses", "Trades before their first public presence"],
      ar: ["المؤسسون والمنشآت الجديدة", "الحِرف قبل أول ظهور علني"],
    },
    process: [
      {
        key: "verstehen",
        title: { de: "Verstehen", tr: "Anlamak", en: "Understand", ar: "نفهم" },
        body: {
          de: "Wofür soll die Marke stehen, und wo taucht sie auf? Am Fahrzeug, auf der Rechnung, im Schaufenster — das entscheidet, wie das Zeichen gebaut sein muss.",
          tr: "Marka neyi temsil etmeli ve nerede görünüyor? Araçta, faturada, vitrinde — işareti nasıl kurmak gerektiğine bu karar verir.",
          en: "What should the brand stand for, and where does it appear? On the van, on the invoice, in the shop window — that decides how the mark has to be built.",
          ar: "عمّ يجب أن تعبّر العلامة، وأين تظهر؟ على المركبة وعلى الفاتورة وفي الواجهة — هذا يحسم كيف يجب أن يُبنى الرمز.",
        },
      },
      {
        key: "entwuerfe",
        title: { de: "Entwürfe", tr: "Taslaklar", en: "Concepts", ar: "التصاميم" },
        body: {
          de: "Zwei bis drei Logo-Konzepte, nicht dreißig Varianten einer Idee. Jedes ist ein eigener Vorschlag, keine Farbvariante des Nachbarn.",
          tr: "Bir fikrin otuz varyantı değil, iki–üç logo konsepti. Her biri kendi başına bir öneridir, komşusunun renk varyantı değil.",
          en: "Two to three logo concepts, not thirty variants of one idea. Each is its own proposal, not a colour variation of its neighbour.",
          ar: "مفهومان إلى ثلاثة للشعار، لا ثلاثون نسخة من فكرة واحدة. كلٌّ منها اقتراح مستقل، لا تنويعة لونية لجاره.",
        },
      },
      {
        key: "umsetzung",
        title: { de: "Umsetzung", tr: "Uygulama", en: "Delivery", ar: "التنفيذ" },
        body: {
          de: "Aus dem gewählten Konzept entstehen Visitenkarte, Social-Media-Profil und ein grundlegendes Brand Manual — die Regeln, nach denen das Zeichen später verwendet wird.",
          tr: "Seçilen konsepttan kartvizit, sosyal medya profili ve temel bir marka kılavuzu çıkar — işaretin sonradan hangi kurallara göre kullanılacağı.",
          en: "From the chosen concept come the business card, the social media profile and a basic brand manual — the rules by which the mark is used later.",
          ar: "من المفهوم المختار تنشأ بطاقة العمل وملف التواصل الاجتماعي ودليل علامة أساسي — القواعد التي يُستعمل بها الرمز لاحقًا.",
        },
      },
      {
        key: "fundament",
        title: { de: "Fundament", tr: "Temel", en: "Foundation", ar: "الأساس" },
        body: {
          de: "Was hier entsteht, trägt den digitalen Auftritt darüber. Deshalb steht diese Ebene am Anfang: Wer damit anfängt, muss später nichts geraderücken.",
          tr: "Burada ortaya çıkan, üstündeki dijital görünümü taşır. Bu katman bu yüzden başta durur: Buradan başlayan, sonradan hiçbir şeyi düzeltmek zorunda kalmaz.",
          en: "What is made here carries the digital presence above it. That is why this level comes first: start here and you have nothing to straighten out later.",
          ar: "ما ينشأ هنا يحمل الحضور الرقمي فوقه. لذلك تأتي هذه الطبقة أولًا: من يبدأ بها لا يحتاج لتقويم شيء لاحقًا.",
        },
      },
    ],
    packageKeys: ["website"],
    // Marke und Auftritt aus einer Hand — dieselbe Arbeit, andere Ebene.
    workSlugs: ["nv-swiss"],
    published: true,
  },
  {
    slug: "website-handwerk",
    chip: { de: "Website fürs Handwerk", tr: "Zanaat için web sitesi", en: "Website for trades", ar: "موقع للحِرف" },
    layer: "digital",
    h1: {
      de: "Website für Handwerksbetriebe.",
      tr: "Zanaat işletmeleri için web sitesi.",
      en: "Websites for trade businesses.",
      ar: "مواقع للمنشآت الحِرفية.",
    },
    lead: {
      de: "Betriebe mit 6–20 Mitarbeitern in NRW und Niedersachsen sind unser Schwerpunkt. Wir sehen uns den Betrieb an, bevor wir eine Zeile bauen — und bauen dann das, was im Alltag trägt.",
      tr: "NRW ve Aşağı Saksonya'daki 6–20 çalışanlı işletmeler bizim odağımız. Bir satır kurmadan önce işletmeye bakarız — sonra günlük işleyişte taşıyan şeyi kurarız.",
      en: "Businesses with 6–20 staff in North Rhine-Westphalia and Lower Saxony are our focus. We look at the business before we build a line — and then build what holds up in daily work.",
      ar: "المنشآت من 6 إلى 20 موظفًا في شمال الراين وساكسونيا السفلى هي مجال تركيزنا. ننظر في المنشأة قبل أن نبني سطرًا — ثم نبني ما يصمد في العمل اليومي.",
    },
    metaTitle: { de: "Website für Handwerksbetriebe", tr: "Zanaat işletmeleri için web sitesi", en: "Websites for trade businesses", ar: "مواقع للمنشآت الحِرفية" },
    metaDescription: {
      de: "Websites für Handwerksbetriebe mit 6–20 Mitarbeitern in NRW und Niedersachsen. Erst den Betrieb verstehen, dann bauen, dann betreiben.",
      tr: "NRW ve Aşağı Saksonya'da 6–20 çalışanlı zanaat işletmeleri için web siteleri. Önce işletmeyi anlamak, sonra kurmak, sonra işletmek.",
      en: "Websites for trade businesses with 6–20 staff in North Rhine-Westphalia and Lower Saxony. Understand the business first, then build, then operate.",
      ar: "مواقع للمنشآت الحِرفية من 6 إلى 20 موظفًا في شمال الراين وساكسونيا السفلى. نفهم المنشأة أولًا، ثم نبني، ثم نشغّل.",
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
      en: [
        "A website with services, references and a route to contact",
        "Enquiries directly by WhatsApp",
        "Process improvement and operations",
        "Ongoing support instead of handover",
      ],
      ar: [
        "موقع بالخدمات والمراجع وطريق التواصل",
        "استفسارات مباشرة عبر واتساب",
        "تحسين العمليات والتشغيل",
        "متابعة جارية بدل تسليم",
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
      en: [
        "Trades with 6–20 staff (NRW & Lower Saxony)",
        "Businesses with a growing pile of paperwork",
      ],
      ar: [
        "حِرف من 6 إلى 20 موظفًا (شمال الراين وساكسونيا السفلى)",
        "منشآت مع تراكم أوراق متزايد",
      ],
    },
    process: [
      {
        key: "verstehen",
        title: { de: "Verstehen", tr: "Anlamak", en: "Understand", ar: "نفهم" },
        body: {
          de: "Wir sehen uns den Betrieb an, bevor wir eine Zeile bauen: welche Aufträge Sie wollen, welche nicht, und wo im Alltag Zeit verloren geht.",
          tr: "Bir satır kurmadan önce işletmeye bakarız: hangi işleri istediğinizi, hangilerini istemediğinizi ve günlük işleyişte zamanın nerede kaybolduğunu.",
          en: "We look at the business before we build a line: which jobs you want, which you do not, and where time is lost in daily work.",
          ar: "ننظر في المنشأة قبل أن نبني سطرًا: أي الطلبات تريدون وأيها لا، وأين يضيع الوقت في العمل اليومي.",
        },
      },
      {
        key: "aufbau",
        title: { de: "Aufbau", tr: "Kurgu", en: "Architecture", ar: "البنية" },
        body: {
          de: "Leistungen, Referenzen und Kontaktweg werden so angeordnet, dass eine Anfrage in zwei Schritten möglich ist — auf Wunsch direkt per WhatsApp.",
          tr: "Hizmetler, referanslar ve iletişim yolu, bir talebin iki adımda mümkün olacağı biçimde düzenlenir — istenirse doğrudan WhatsApp üzerinden.",
          en: "Services, references and the route to contact are arranged so that an enquiry takes two steps — directly by WhatsApp if you prefer.",
          ar: "تُرتَّب الخدمات والمراجع وطريق التواصل بحيث يمكن الاستفسار في خطوتين — وعبر واتساب مباشرةً إن رغبتم.",
        },
      },
      {
        key: "umsetzung",
        title: { de: "Umsetzung", tr: "Uygulama", en: "Delivery", ar: "التنفيذ" },
        body: {
          de: "Wir bauen in Abschnitten und zeigen Zwischenstände. Wo ein Ablauf im Betrieb ohnehin schon hakt, richten wir ihn mit ein — Prozessoptimierung gehört dazu.",
          tr: "Bölümler hâlinde kurar, ara durumları gösteririz. İşletmede zaten aksayan bir akış varsa onu da düzenleriz — süreç iyileştirme buna dâhildir.",
          en: "We build in stages and show interim states. Where a process in the business already snags, we set it right along the way — process improvement is part of it.",
          ar: "نبني على مراحل ونعرض الحالات الوسيطة. وحيث تعلق عملية في المنشأة أصلًا نُصلحها في الطريق — تحسين العمليات جزء من ذلك.",
        },
      },
      {
        key: "betrieb",
        title: { de: "Betrieb", tr: "İşletme", en: "Operation", ar: "المنشأة" },
        body: {
          de: "Nach dem Start bleiben wir dran: betreiben, überwachen, weiterentwickeln. Laufende Betreuung statt Übergabe an jemanden, der den Betrieb nicht kennt.",
          tr: "Yayına aldıktan sonra bırakmayız: işletir, izler, geliştiririz. İşletmeyi tanımayan birine teslim etmek yerine sürekli destek.",
          en: "After launch we stay on it: operating, monitoring, developing further. Ongoing support instead of a handover to someone who does not know the business.",
          ar: "بعد الإطلاق نبقى على الخط: نشغّل ونراقب ونطوّر. متابعة جارية بدل تسليم لشخص لا يعرف المنشأة.",
        },
      },
    ],
    packageKeys: ["website"],
    workSlugs: [],
    published: true,
  },
  {
    slug: "zweisprachig-de-tr",
    chip: { de: "Zweisprachig DE + TR", tr: "İki dilli DE + TR", en: "Bilingual DE + TR", ar: "بلغتين DE + TR" },
    layer: "digital",
    h1: {
      de: "Zweisprachig: Deutsch und Türkisch.",
      tr: "İki dilli: Almanca ve Türkçe.",
      en: "Bilingual: German and Turkish.",
      ar: "بلغتين: الألمانية والتركية.",
    },
    lead: {
      de: "Beratung, Unterlagen und laufende Betreuung auf Deutsch und auf Türkisch — auf Wunsch komplett über WhatsApp. Kein Dolmetscher dazwischen, keine halb übersetzte Website.",
      tr: "Danışmanlık, belgeler ve sürekli destek Almanca ve Türkçe — istenirse tamamen WhatsApp üzerinden. Aracı tercüman yok, yarım çevrilmiş web sitesi yok.",
      en: "Advice, documents and ongoing support in German and Turkish — entirely over WhatsApp if you prefer. No interpreter in between, no half-translated website.",
      ar: "استشارة ومستندات ومتابعة جارية بالألمانية والتركية — وعبر واتساب بالكامل إن رغبتم. دون مترجم في الوسط، ودون موقع مترجَم نصفيًا.",
    },
    metaTitle: {
      de: "Zweisprachige Website und Betreuung (DE/TR)",
      tr: "İki dilli web sitesi ve destek (DE/TR)",
      en: "A bilingual website and support (DE/TR)",
      ar: "موقع ومتابعة بلغتين (DE/TR)",
    },
    metaDescription: {
      de: "Website, Marke und laufende Betreuung auf Deutsch und Türkisch. Für Betriebe mit Kundschaft oder Mitarbeitern in beiden Sprachen — Kommunikation auf Wunsch über WhatsApp.",
      tr: "Almanca ve Türkçe web sitesi, marka ve sürekli destek. Her iki dilde müşterisi ya da çalışanı olan işletmeler için — istenirse WhatsApp üzerinden iletişim.",
      en: "Website, brand and ongoing support in German and Turkish. For businesses with customers or staff in both languages — communication over WhatsApp if you prefer.",
      ar: "موقع وعلامة ومتابعة جارية بالألمانية والتركية. لمنشآت لها عملاء أو موظفون باللغتين — والتواصل عبر واتساب إن رغبتم.",
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
      en: [
        "A website in both languages, maintained equally",
        "Advice and documents in German and Turkish",
        "Communication over WhatsApp",
        "Support in both languages, permanently",
      ],
      ar: [
        "موقع باللغتين، مُصان بالتساوي",
        "استشارة ومستندات بالألمانية والتركية",
        "تواصل عبر واتساب",
        "متابعة باللغتين، بشكل دائم",
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
      en: [
        "Businesses with customers in both languages",
        "Businesses that want to reach staff in Turkish",
      ],
      ar: [
        "منشآت لها عملاء باللغتين",
        "منشآت تريد الوصول إلى موظفيها بالتركية",
      ],
    },
    process: [
      {
        key: "verstehen",
        title: { de: "Verstehen", tr: "Anlamak", en: "Understand", ar: "نفهم" },
        body: {
          de: "Das Erstgespräch führen wir in der Sprache, die Ihnen liegt — auf Deutsch oder auf Türkisch, ohne Dolmetscher dazwischen.",
          tr: "İlk görüşmeyi size uyan dilde yaparız — Almanca ya da Türkçe, araya tercüman girmeden.",
          en: "We hold the first conversation in the language that suits you — German or Turkish, with no interpreter in between.",
          ar: "نجري الحديث الأول باللغة التي تناسبكم — بالألمانية أو التركية، دون مترجم في الوسط.",
        },
      },
      {
        key: "aufbau",
        title: { de: "Aufbau", tr: "Kurgu", en: "Architecture", ar: "البنية" },
        body: {
          de: "Beide Sprachfassungen werden zusammen geplant, nicht eine zuerst und die andere später. Was in einer Sprache steht, hat in der anderen einen Platz.",
          tr: "Her iki dil sürümü birlikte planlanır; biri önce, öbürü sonra değil. Bir dilde duran şeyin öbüründe de yeri vardır.",
          en: "Both language versions are planned together, not one first and the other later. What exists in one language has a place in the other.",
          ar: "تُخطَّط النسختان معًا، لا واحدة أولًا والأخرى لاحقًا. وما يوجد في لغة له موضع في الأخرى.",
        },
      },
      {
        key: "umsetzung",
        title: { de: "Umsetzung", tr: "Uygulama", en: "Delivery", ar: "التنفيذ" },
        body: {
          de: "Gebaut werden beide Fassungen gleichwertig — keine halb übersetzte Website, bei der die zweite Sprache nach drei Klicks aufhört.",
          tr: "İki sürüm de eşdeğer kurulur — ikinci dilin üç tıklamada bittiği yarım çevrilmiş bir site değil.",
          en: "Both versions are built as equals — no half-translated website where the second language stops after three clicks.",
          ar: "تُبنى النسختان بالتساوي — لا موقع مترجَم نصفيًا تتوقف فيه اللغة الثانية بعد ثلاث نقرات.",
        },
      },
      {
        key: "betreuung",
        title: { de: "Betreuung", tr: "Destek", en: "Support", ar: "المتابعة" },
        body: {
          de: "Beratung, Unterlagen und laufende Betreuung bleiben dauerhaft in beiden Sprachen — auf Wunsch komplett über WhatsApp.",
          tr: "Danışmanlık, belgeler ve sürekli destek kalıcı olarak iki dilde kalır — istenirse tamamen WhatsApp üzerinden.",
          en: "Advice, documents and ongoing support stay permanently in both languages — entirely over WhatsApp if you prefer.",
          ar: "تبقى الاستشارة والمستندات والمتابعة الجارية باللغتين دائمًا — وعبر واتساب بالكامل إن رغبتم.",
        },
      },
    ],
    packageKeys: ["website"],
    // Die frueheren Slugs ("nur", "bir-damla-hayir") gibt es nicht mehr —
    // sie waren kein Kundenwerk. Bis eine zweisprachige Referenz freigegeben
    // ist, bleibt die Liste leer und der Werke-Block rendert nicht.
    workSlugs: [],
    published: true,
  },
  {
    slug: "ki-automatisierung",
    chip: { de: "KI & Automatisierung", tr: "Yapay zekâ & otomasyon", en: "AI & automation", ar: "ذكاء اصطناعي وأتمتة" },
    layer: "automation",
    h1: {
      de: "Automatisierung und KI im Betrieb.",
      tr: "İşletmede otomasyon ve yapay zekâ.",
      en: "Automation and AI in the business.",
      ar: "الأتمتة والذكاء الاصطناعي في المنشأة.",
    },
    lead: {
      de: "Wiederkehrende Arbeit übernimmt das System, nicht der Mensch. Und darüber meAI — unser KI-Business-Betriebssystem, das Zahlen, Aufgaben und Dokumente zusammenhält und Entscheidungen vorbereitet.",
      tr: "Tekrar eden işi insan değil, sistem üstlenir. Üzerinde ise meAI — sayıları, görevleri ve belgeleri bir arada tutan ve kararları hazırlayan yapay zekâ tabanlı iş işletim sistemimiz.",
      en: "Recurring work is done by the system, not by a person. And above it meAI — our AI business operating system, which holds figures, tasks and documents together and prepares decisions.",
      ar: "العمل المتكرر يتولّاه النظام لا الإنسان. وفوقه meAI — نظام تشغيل الأعمال بالذكاء الاصطناعي لدينا، يجمع الأرقام والمهام والمستندات ويُهيّئ القرارات.",
    },
    metaTitle: { de: "Automatisierung und KI-Systeme für KMU", tr: "KOBİ'ler için otomasyon ve yapay zekâ", en: "Automation and AI systems for SMEs", ar: "أتمتة وأنظمة ذكاء اصطناعي للمنشآت الصغيرة والمتوسطة" },
    metaDescription: {
      de: "Automatisierung und eigene KI-Systeme für kleine und mittlere Betriebe. meAI bündelt Zahlen, Aufgaben und Dokumente. Gebaut und betrieben von creaDIG.",
      tr: "Küçük ve orta ölçekli işletmeler için otomasyon ve kendi yapay zekâ sistemlerimiz. meAI sayıları, görevleri ve belgeleri toplar. creaDIG tarafından kurulur ve işletilir.",
      en: "Automation and bespoke AI systems for small and medium-sized businesses. meAI brings together figures, tasks and documents. Built and operated by creaDIG.",
      ar: "أتمتة وأنظمة ذكاء اصطناعي خاصة للمنشآت الصغيرة والمتوسطة. meAI يجمع الأرقام والمهام والمستندات. بناء وتشغيل creaDIG.",
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
      en: [
        "The system takes over recurring processes",
        "meAI platform integration",
        "Operations and system architecture",
        "Operation and further development by us",
      ],
      ar: [
        "النظام يتولّى العمليات المتكررة",
        "تكامل منصة meAI",
        "التشغيل وبناء الأنظمة",
        "التشغيل والتطوير من جهتنا",
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
      en: [
        "Businesses with 6–20 staff and a growing pile of paperwork",
        "Established businesses that want to decide faster",
      ],
      ar: [
        "منشآت من 6 إلى 20 موظفًا مع تراكم أوراق متزايد",
        "منشآت راسخة تريد أن تقرّر أسرع",
      ],
    },
    process: [
      {
        key: "verstehen",
        title: { de: "Verstehen", tr: "Anlamak", en: "Understand", ar: "نفهم" },
        body: {
          de: "Zuerst sehen wir uns an, was sich wiederholt: welche Arbeit jede Woche gleich abläuft, wo Zahlen von Hand übertragen werden, was liegen bleibt.",
          tr: "Önce neyin tekrarlandığına bakarız: her hafta aynı işleyen iş hangisi, sayılar nerede elle aktarılıyor, ne birikip kalıyor.",
          en: "First we look at what repeats: which work runs the same way every week, where figures are copied by hand, what gets left lying.",
          ar: "ننظر أولًا فيما يتكرر: أي عمل يجري كل أسبوع بالطريقة نفسها، وأين تُنقل الأرقام يدويًا، وما الذي يبقى معلّقًا.",
        },
      },
      {
        key: "systemaufbau",
        title: { de: "Systemaufbau", tr: "Sistem kurulumu", en: "System architecture", ar: "بناء النظام" },
        body: {
          de: "Wir legen fest, was das System übernimmt und was beim Menschen bleibt. Nicht alles, was sich automatisieren lässt, sollte automatisiert werden.",
          tr: "Sistemin neyi üstleneceğini, neyin insanda kalacağını belirleriz. Otomatikleştirilebilen her şey otomatikleştirilmeli değildir.",
          en: "We define what the system takes over and what stays with people. Not everything that can be automated should be.",
          ar: "نحدّد ما يتولّاه النظام وما يبقى للإنسان. فليس كل ما يمكن أتمتته ينبغي أن يُؤتمت.",
        },
      },
      {
        key: "umsetzung",
        title: { de: "Umsetzung", tr: "Uygulama", en: "Delivery", ar: "التنفيذ" },
        body: {
          de: "Die Abläufe werden gebaut und angebunden — auf Wunsch mit meAI darüber, das Zahlen, Aufgaben und Dokumente zusammenhält.",
          tr: "Akışlar kurulur ve bağlanır — istenirse üzerinde, sayıları, görevleri ve belgeleri bir arada tutan meAI ile.",
          en: "The processes are built and connected — with meAI on top if you want, holding figures, tasks and documents together.",
          ar: "تُبنى العمليات وتُربط — ومع meAI فوقها إن رغبتم، جامعًا الأرقام والمهام والمستندات.",
        },
      },
      {
        key: "betrieb",
        title: { de: "Betrieb", tr: "İşletme", en: "Operation", ar: "المنشأة" },
        body: {
          de: "Betrieb und Weiterentwicklung bleiben bei uns. Ein automatisierter Ablauf, den niemand beobachtet, fällt irgendwann aus, ohne dass es jemand merkt.",
          tr: "İşletme ve geliştirme bizde kalır. Kimsenin izlemediği otomatik bir akış, bir gün kimse fark etmeden durur.",
          en: "Operation and further development stay with us. An automated process nobody watches eventually fails without anyone noticing.",
          ar: "التشغيل والتطوير يبقيان لدينا. فالعملية المؤتمتة التي لا يراقبها أحد تتعطّل يومًا دون أن يلاحظ أحد.",
        },
      },
    ],
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
    chip: { de: "Barrierefreiheit", tr: "Erişilebilirlik", en: "Accessibility", ar: "إتاحة الوصول" },
    layer: "digital",
    h1: {
      de: "Barrierefreiheit: geprüft, behoben, nachweisbar.",
      tr: "Erişilebilirlik: denetlenir, giderilir, belgelenir.",
      en: "Accessibility: audited, fixed, evidenced.",
      ar: "إتاحة الوصول: مفحوصة، معالَجة، قابلة للإثبات.",
    },
    lead: {
      de: "Ein Kunde bricht die Bestellung ab, weil sein Screenreader das Pflichtfeld nicht vorliest. Er schreibt Ihnen nicht, warum — er ist einfach weg. Wir prüfen Ihre Website nach WCAG 2.1 AA von Hand, schreiben jeden Fund mit Beleg auf und beheben ihn im Code. Kein Overlay, kein Widget.",
      tr: "Bir müşteri siparişi yarıda bırakır, çünkü ekran okuyucusu zorunlu alanı okumaz. Size nedenini yazmaz — sadece gider. Web sitenizi WCAG 2.1 AA ölçütlerine göre elle denetler, bulduğumuz her şeyi kanıtıyla yazar ve kodun içinde gideririz. Overlay yok, eklenti yok.",
      en: "A customer abandons the order because their screen reader does not read out the required field. They do not write to tell you why — they are simply gone. We audit your website against WCAG 2.1 AA by hand, write down every finding with evidence and fix it in the code. No overlay, no widget.",
      ar: "عميلٌ يترك الطلب لأن قارئ الشاشة لديه لا يقرأ الحقل الإلزامي. لا يكتب لكم لماذا — يختفي ببساطة. نفحص موقعكم وفق WCAG 2.1 AA يدويًا، ونكتب كل نتيجة بدليلها، ونعالجها في الشيفرة. لا طبقة تغطية ولا أداة إضافية.",
    },
    metaTitle: {
      de: "Barrierefreiheit Website & BFSG Onlineshop",
      tr: "Web sitesi erişilebilirliği & BFSG (Almanya)",
      en: "Website accessibility & BFSG for online shops",
      ar: "إتاحة وصول الموقع والمتجر الإلكتروني وفق BFSG",
    },
    metaDescription: {
      de: "Barrierefreiheit für Website und Onlineshop: manuelle Prüfung nach WCAG 2.1 AA, Befundbericht mit Belegen, Behebung im Code — ohne Overlay. Aus Osnabrück, auf Deutsch und Türkisch.",
      tr: "Web sitesi ve online mağaza için erişilebilirlik: WCAG 2.1 AA ölçütlerine göre elle denetim, kanıtlı bulgu raporu, kod içinde giderme — overlay olmadan. Osnabrück'ten, Almanca ve Türkçe.",
      en: "Accessibility for websites and online shops: manual audit against WCAG 2.1 AA, a findings report with evidence, remediation in the code — without an overlay. From Osnabrück, in German, Turkish and English.",
      ar: "إتاحة الوصول للموقع والمتجر الإلكتروني: فحص يدوي وفق WCAG 2.1 AA، وتقرير نتائج بالأدلة، ومعالجة في الشيفرة — دون طبقة تغطية. من أوسنابروك، بالألمانية والتركية والإنجليزية والعربية.",
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
      en: [
        "A manual audit against our 12-point framework — the same one we used on our own site",
        "A pass with keyboard and screen reader, not just an automated scan",
        "A findings report: every finding with page, element, WCAG criterion and measured value",
        "Remediation in the code of your site — no overlay, no widget, no plugin",
        "An accessibility statement and feedback route as a technical template",
        "A re-check after remediation, with figures before and after",
      ],
      ar: [
        "فحص يدوي وفق إطارنا ذي الاثنتي عشرة نقطة — الإطار نفسه الذي فحصنا به موقعنا",
        "جولة بلوحة المفاتيح وقارئ الشاشة، لا مجرد مسح آلي",
        "تقرير نتائج: كل نتيجة مع الصفحة والعنصر ومعيار WCAG والقيمة المقيسة",
        "معالجة في شيفرة موقعكم — دون طبقة تغطية ولا أداة ولا إضافة",
        "بيان إتاحة الوصول وطريق التغذية الراجعة كقالب تقني",
        "إعادة فحص بعد المعالجة، بأرقام قبل وبعد",
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
      en: [
        "Businesses with an online shop or a booking flow",
        "Trades, SMEs and hospitality — focus on Germany",
        "Anyone with an existing site who first wants to know where it stands",
      ],
      ar: [
        "منشآت لديها متجر إلكتروني أو مسار حجز",
        "الحِرف والمنشآت الصغيرة والمتوسطة والضيافة — التركيز على ألمانيا",
        "من لديه موقع قائم ويريد أولًا معرفة أين هو",
      ],
    },
    /*
     * Vier Schritte, und keiner davon ist neu: Sie stehen als Zeilen in
     * `includes` und als Stufen in `priceLadder`. Was hier dazukommt, ist
     * die Reihenfolge — und die ist bei einer Pruefung das Angebot. Wer
     * zuerst behebt und danach prueft, hat nichts belegt.
     */
    process: [
      {
        key: "pruefung",
        title: { de: "Prüfung", tr: "Denetim", en: "Audit", ar: "الفحص" },
        body: {
          de: "Automatisiert über alle Hauptseiten, danach von Hand mit Tastatur und Screenreader. Der automatische Lauf findet ungefähr ein Drittel — den Rest findet ein Mensch.",
          tr: "Önce tüm ana sayfalarda otomatik, sonra elle klavye ve ekran okuyucuyla. Otomatik geçiş yaklaşık üçte birini bulur — gerisini bir insan bulur.",
          en: "Automated across all main pages, then by hand with keyboard and screen reader. The automated run finds roughly a third — a person finds the rest.",
          ar: "آليًا على كل الصفحات الرئيسية، ثم يدويًا بلوحة المفاتيح وقارئ الشاشة. الجولة الآلية تجد نحو الثلث — والباقي يجده إنسان.",
        },
      },
      {
        key: "befund",
        title: { de: "Befundbericht", tr: "Bulgu raporu", en: "Findings report", ar: "تقرير النتائج" },
        body: {
          de: "Jeder Fund mit Seite, Element, WCAG-Kriterium und Messwert. Der Bericht gehört Ihnen — auch wenn Sie danach jemand anderen beauftragen.",
          tr: "Her bulgu sayfası, öğesi, WCAG ölçütü ve ölçülen değeriyle. Rapor sizindir — sonrasında başkasına verseniz de.",
          en: "Every finding with page, element, WCAG criterion and measured value. The report belongs to you — even if you commission somebody else afterwards.",
          ar: "كل نتيجة مع الصفحة والعنصر ومعيار WCAG والقيمة المقيسة. والتقرير لكم — حتى لو كلّفتم غيرنا بعده.",
        },
      },
      {
        key: "behebung",
        title: { de: "Behebung", tr: "Giderme", en: "Remediation", ar: "المعالجة" },
        body: {
          de: "Die Funde werden im Code Ihrer Seite behoben. Kein Overlay, kein Widget, kein Plugin — eine Schicht darüber entfernt keine Barriere.",
          tr: "Bulgular sitenizin kodunda giderilir. Overlay yok, widget yok, eklenti yok — üste konan bir katman hiçbir engeli kaldırmaz.",
          en: "The findings are fixed in the code of your site. No overlay, no widget, no plugin — a layer on top removes no barrier.",
          ar: "تُعالَج النتائج في شيفرة موقعكم. لا طبقة تغطية ولا أداة ولا إضافة — فالطبقة فوق الصفحة لا تزيل عائقًا.",
        },
      },
      {
        key: "nachpruefung",
        title: { de: "Nachprüfung", tr: "Yeniden denetim", en: "Re-check", ar: "إعادة الفحص" },
        body: {
          de: "Nach der Behebung läuft dieselbe Prüfung erneut, mit Zahlen vorher und nachher. Ohne den zweiten Durchgang ist die Behebung eine Behauptung.",
          tr: "Gidermeden sonra aynı denetim yeniden yapılır, öncesi ve sonrası sayılarla. İkinci geçiş olmadan giderme bir iddiadan ibarettir.",
          en: "After remediation the same audit runs again, with figures before and after. Without that second pass, the remediation is a claim.",
          ar: "بعد المعالجة يُعاد الفحص نفسه، بأرقام قبل وبعد. ودون الجولة الثانية تبقى المعالجة ادّعاءً.",
        },
      },
    ],
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
        en: [
          "We audit your site against WCAG 2.1 AA — by hand, with keyboard and screen reader, not just with a scanner.",
          "We write down every finding with page, element, criterion and measured value, including the uncomfortable ones.",
          "We fix the findings in the code and audit again afterwards, with figures before and after.",
          "We give you the statement and feedback route as a technical template — text and structure, ready to insert.",
        ],
        ar: [
          "نفحص موقعكم وفق WCAG 2.1 AA — يدويًا، بلوحة المفاتيح وقارئ الشاشة، لا بماسح فقط.",
          "نكتب كل نتيجة مع الصفحة والعنصر والمعيار والقيمة المقيسة، بما فيها المزعجة.",
          "نعالج النتائج في الشيفرة ثم نفحص ثانيةً، بأرقام قبل وبعد.",
          "نسلّمكم البيان وطريق التغذية الراجعة كقالب تقني — نصًّا وبنيةً، جاهزًا للإدراج.",
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
        en: [
          "We do not assess whether and how the law applies to your business. That is a legal question, and your lawyer answers it — not us.",
          "We do not sign off the accessibility statement. We supply the template; it is published after your legal advisers have seen it.",
          "We do not use an overlay and do not recommend one. An overlay puts a layer over the site instead of removing the barrier — underneath, everything stays as it was.",
          "We promise no legal outcome. What is promised is an audit and implementation against WCAG 2.1 AA, and nothing beyond that.",
        ],
        ar: [
          "لا نقيّم ما إذا كان القانون ينطبق على منشأتكم وكيف. تلك مسألة قانونية يجيب عنها محاميكم — لا نحن.",
          "لا نعتمد بيان إتاحة الوصول. نحن نسلّم القالب؛ ويُنشر بعد أن يراه مستشاروكم القانونيون.",
          "لا نستعمل طبقة تغطية ولا نوصي بها. الطبقة توضع فوق الصفحة بدل إزالة العائق — وتحتها يبقى كل شيء كما كان.",
          "لا نعد بنتيجة قانونية. المُلتزَم به فحصٌ وتنفيذ وفق WCAG 2.1 AA، ولا شيء أبعد.",
        ],
      },
      note: {
        de: "Das Barrierefreiheitsstärkungsgesetz gilt seit dem 28. Juni 2025. Wir nennen das Datum, weil es zur Sache gehört — nicht, um Druck zu machen. Der bessere Grund steht oben: der Kunde, der abbricht und nicht sagt, warum.",
        tr: "Almanya'daki erişilebilirlik yasası (BFSG) 28 Haziran 2025'ten beri yürürlükte. Tarihi, konuya ait olduğu için yazıyoruz — baskı kurmak için değil. Daha iyi gerekçe yukarıda: yarıda bırakıp nedenini söylemeyen müşteri.",
        en: "The German Accessibility Strengthening Act has applied since 28 June 2025. We name the date because it belongs to the matter — not to apply pressure. The better reason is above: the customer who abandons and does not say why.",
        ar: "قانون تعزيز إتاحة الوصول الألماني ساري منذ 28 يونيو 2025. نذكر التاريخ لأنه من صلب الموضوع — لا للضغط. والسبب الأفضل مذكور أعلاه: العميل الذي ينسحب ولا يقول لماذا.",
      },
    },
    ownProof: {
      body: {
        de: "Wir haben unsere eigene Seite nach demselben Raster geprüft, bevor wir die Leistung angeboten haben. Acht Mängel, sieben davon erheblich — Fokus unsichtbar, keine Sprungmarke, ein Assistent, der beim Schrittwechsel schwieg. Alle behoben, im Code. Der Befund steht offen, mit Zahlen vorher und nachher.",
        tr: "Bu hizmeti sunmadan önce kendi sitemizi aynı şablonla denetledik. Sekiz eksik, yedisi ciddi — görünmeyen odak, atlama bağlantısının olmaması, adım değiştirirken susan bir asistan. Hepsi kodun içinde giderildi. Bulgu, öncesi ve sonrası sayılarıyla açıkta duruyor.",
        en: "We audited our own site against the same framework before offering this service. Eight defects, seven of them serious — focus invisible, no skip link, an assistant that stayed silent when the step changed. All fixed, in the code. The findings are open, with figures before and after.",
        ar: "فحصنا موقعنا بالإطار نفسه قبل أن نعرض الخدمة. ثمانية عيوب، سبعة منها خطيرة — تركيز غير مرئي، ولا رابط تخطٍّ، ومساعدٌ يصمت عند تغيير الخطوة. عولجت كلها في الشيفرة. والنتائج مكشوفة، بأرقام قبل وبعد.",
      },
      links: [
        {
          label: { de: "Der Befund: acht eigene Mängel", tr: "Bulgu: kendi sekiz eksiğimiz", en: "The findings: eight defects of our own", ar: "النتيجة: ثمانية عيوب لدينا" },
          href: "/insights/eigene-seite-geprueft",
        },
        {
          label: {
            de: "Unsere Erklärung zur Barrierefreiheit",
            tr: "Erişilebilirlik beyanımız",
            en: "Our accessibility statement",
            ar: "بيان إتاحة الوصول الخاص بنا",
          },
          href: "/barrierefreiheit",
        },
      ],
    },
    priceLadder: {
      steps: [
        {
          key: "pruefung",
          price: { de: "1.500 €", tr: "1.500 €", en: "€1,500", ar: "1.500 يورو" },
          kind: "fixed",
          title: { de: "Prüfung", tr: "Denetim", en: "Audit", ar: "الفحص" },
          body: {
            de: "Die vollständige Prüfung nach dem 12-Punkte-Raster: automatisiert über alle Hauptseiten, von Hand mit Tastatur und Screenreader, dazu der Befundbericht mit Seite, Element, Kriterium und Messwert je Fund. Der Bericht gehört Ihnen — auch wenn Sie danach jemand anderen beauftragen oder gar nichts tun.",
            tr: "12 maddelik şablona göre eksiksiz denetim: tüm ana sayfalarda otomatik, elle klavye ve ekran okuyucuyla, ayrıca her bulgu için sayfa, öğe, ölçüt ve ölçülen değeri içeren bulgu raporu. Rapor sizindir — sonrasında başkasına verseniz de, hiçbir şey yapmasanız da.",
            en: "The full audit against the 12-point framework: automated across all main pages, by hand with keyboard and screen reader, plus the findings report with page, element, criterion and measured value for every finding. The report belongs to you — even if you commission somebody else afterwards or do nothing at all.",
            ar: "الفحص الكامل وفق إطار الاثنتي عشرة نقطة: آليًا على كل الصفحات الرئيسية، ويدويًا بلوحة المفاتيح وقارئ الشاشة، مع تقرير نتائج يذكر لكل نتيجة الصفحة والعنصر والمعيار والقيمة المقيسة. والتقرير لكم — حتى لو كلّفتم غيرنا بعده أو لم تفعلوا شيئًا.",
          },
        },
        {
          key: "behebung",
          price: { de: "2.000–4.000 €", tr: "2.000–4.000 €", en: "€2,000–4,000", ar: "2.000–4.000 يورو" },
          kind: "offer",
          title: { de: "Behebung", tr: "Giderme", en: "Remediation", ar: "المعالجة" },
          body: {
            de: "Für Code, den wir noch nicht gesehen haben, nennen wir keinen Festpreis. Nach der Prüfung wissen wir, wie viel Arbeit darin steckt — dann bekommen Sie eine Zahl, und die steigt danach nicht mehr. Die Spanne ist Erfahrung aus dem eigenen Durchgang, kein Angebot.",
            tr: "Henüz görmediğimiz bir kod için sabit fiyat vermeyiz. Denetimden sonra içinde ne kadar iş olduğunu biliriz — o zaman bir rakam alırsınız ve o rakam sonradan yükselmez. Aralık, kendi denetimimizden gelen deneyimdir; teklif değildir.",
            en: "For code we have not yet seen, we name no fixed price. After the audit we know how much work is in it — then you get a figure, and it does not rise afterwards. The range is experience from our own pass, not an offer.",
            ar: "لشيفرة لم نرها بعد لا نذكر سعرًا ثابتًا. وبعد الفحص نعرف حجم العمل فيها — عندها تحصلون على رقم، ولا يرتفع بعدها. والمدى خبرةٌ من جولتنا نحن، لا عرضًا.",
          },
        },
        {
          key: "betreuung",
          price: { de: "149 €", tr: "149 €", en: "€149", ar: "149 يورو" },
          kind: "monthly",
          title: { de: "Betreuung", tr: "Sürekli destek", en: "Support", ar: "المتابعة" },
          body: {
            de: "Kein neuer Posten, sondern die laufende Betreuung, die es ohnehin gibt: Darin läuft der automatisierte Barrierefreiheits-Lauf bei jeder Änderung mit — denn jede Änderung an einer Seite kann eine Barriere zurückbringen. Einmal im Jahr sehen wir zusätzlich von Hand nach.",
            tr: "Yeni bir kalem değil, hâlihazırda var olan sürekli destek: İçinde otomatik erişilebilirlik geçişi her değişiklikte birlikte çalışır — çünkü sitedeki her değişiklik bir engeli geri getirebilir. Yılda bir kez ayrıca elle bakarız.",
            en: "Not a new line item, but the ongoing support that exists anyway: the automated accessibility pass runs with every change — because every change to a site can bring a barrier back. Once a year we additionally look by hand.",
            ar: "ليس بندًا جديدًا، بل المتابعة الجارية القائمة أصلًا: تجري فيها جولة إتاحة الوصول الآلية مع كل تغيير — فكل تغيير في صفحة قد يعيد عائقًا. ومرة في السنة ننظر إضافةً إلى ذلك يدويًا.",
          },
        },
      ],
      note: {
        de: "Alle Preise netto, zzgl. 19 % USt. Die Prüfung ist der Einstieg und steht für sich: Sie verpflichtet zu keiner Behebung, und der Bericht bleibt bei Ihnen.",
        tr: "Tüm fiyatlar nettir, %19 KDV hariç. Denetim giriş adımıdır ve tek başına durur: Hiçbir gidermeye mecbur bırakmaz, rapor sizde kalır.",
        en: "All prices excl. VAT, plus 19% VAT. The audit is the entry point and stands on its own: it commits you to no remediation, and the report stays with you.",
        ar: "كل الأسعار دون ضريبة، تُضاف إليها 19٪. والفحص هو نقطة الدخول وقائم بذاته: لا يُلزم بأي معالجة، والتقرير يبقى لديكم.",
      },
    },
    packageKeys: ["website"],
    packageNote: {
      de: "Wer neu bei uns baut, bekommt Barrierefreiheit eingebaut — sie steht als Zeile im Website-Paket. Was hier beschrieben ist, gilt für eine Seite, die schon steht.",
      tr: "Siteyi bizimle yeni kuranlarda erişilebilirlik baştan içeride — web sitesi paketinde bir satır olarak durur. Burada anlatılan, hâlihazırda ayakta olan bir site içindir.",
      en: "Anyone building new with us gets accessibility built in — it is a line in the website package. What is described here applies to a site that already exists.",
      ar: "من يبني معنا من جديد يحصل على إتاحة الوصول مدمجة — وهي بندٌ في باقة الموقع. أما الموصوف هنا فينطبق على موقع قائم بالفعل.",
    },
    /*
     * Leer, und das bleibt so, bis ein Kunde eine Freigabe unterschreibt.
     * Der Beleg dieser Seite ist nicht fremdes Werk, sondern das eigene:
     * `ownProof` zeigt auf die eigene Erklaerung und den eigenen Befund.
     */
    workSlugs: [],
    quickCheck: true,
    published: true,
  },
]

export const publishedServicePages = servicePages.filter((p) => p.published)

export function findServicePage(slug: string) {
  return publishedServicePages.find((p) => p.slug === slug)
}
