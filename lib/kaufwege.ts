/*
 * ===========================================================================
 * KAUFWEGE — WIE MAN BEI creaDIG KAUFT
 * ===========================================================================
 *
 * PHASE 2 · COMMERCIAL COMPLETION, 11.09.2026.
 *
 * -------------------------------------------------------------------------
 * DER BEFUND, DER DAS AUSGELOEST HAT
 *
 * Das kommerzielle System war nicht unklar — es war unveroeffentlicht.
 *
 * `docs/sales/offer-canon.md` (Gate 05) und `docs/sales/qualification-canon.md`
 * (Gate 06) beschreiben seit dem 05.09.2026 vollstaendig, was creaDIG
 * verkauft, wie ein Preis entsteht, wo kostenlos aufhoert und wann ein
 * Systemgespraech der richtige Schritt ist. Beide Dokumente liegen im
 * Repository. Auf der Website standen davon einzelne Teile: die Betraege, die
 * fuenf Treiber, der Pilotpreis. Nicht aber die eine Auskunft, die ein
 * Kaeufer zuerst braucht — dass es UEBERHAUPT drei verschiedene Arten gibt,
 * hier zu kaufen, und dass sie unterschiedlich funktionieren.
 *
 * Ohne diese Auskunft liest jemand mit einem Betriebsproblem die
 * Website-Preistabelle und rechnet still hoch: „3.900 Euro fuer eine Seite,
 * dann kostet mein System vermutlich 40.000." Oder umgekehrt: Er liest 149
 * Euro im Monat und haelt das fuer den Betrieb seiner Warenwirtschaft.
 *
 * Dieses Modul ist die fehlende Ebene. Es erfindet nichts. Jeder Eintrag hat
 * eine Fundstelle im Kanon, und jeder Betrag kommt aus `packages` bzw.
 * `retainer` in `lib/site-data.ts` — hier wird keine Zahl getippt (D-18).
 *
 * -------------------------------------------------------------------------
 * WARUM DREI UND NICHT FUENF
 *
 * `offer-canon.md` §8 kennt fuenf PREISTYPEN (frei, Festpreis, Pilotpreis,
 * Spanne mit Treibern, Festpreis nach Zuschnitt, wiederkehrend). Das ist die
 * Innensicht: Wie kommt eine Zahl zustande?
 *
 * Ein Kaeufer stellt eine andere Frage: Was passiert mit mir, bis ich weiss,
 * was es kostet? Darauf gibt es genau drei Antworten:
 *
 *   1 · Der Umfang steht vorher fest  → die Zahl steht auf der Seite.
 *   2 · Der Umfang entsteht zuerst    → die Zahl entsteht danach.
 *   3 · Es ist ein laufender Zustand  → die Zahl gilt pro Monat.
 *
 * Fuenf Preistypen fallen in drei Kaufwege. Die Innensicht bleibt im Kanon,
 * die Aussensicht steht hier.
 *
 * -------------------------------------------------------------------------
 * WAS HIER BEWUSST NICHT STEHT
 *
 * Keine Mindestprojektsumme. `offer-canon.md` §7 leitet eine Untergrenze ab
 * („ein Systemprojekt enthaelt mindestens das, was das Website-Paket
 * enthaelt") und sagt im selben Absatz, dass sie NICHT oeffentlich als Preis
 * ausgestellt wird, sondern dem Verkauf als Boden dient. Diese Entscheidung
 * wird hier nicht umgedreht.
 *
 * Keine Betriebsstufen ueber 149 Euro. Die Staffel (Operate, Business,
 * Mission Critical) existiert im Kanon als Struktur und wird nach demselben
 * Kanon nicht verkauft, solange Reaktionszeit, Erreichbarkeit und Vertretung
 * nicht beantwortet sind. Was hier steht, ist deshalb kein Preis, sondern die
 * ehrliche Auskunft, dass es fuer diesen Fall heute keinen gibt.
 */
import { packages, retainer } from "@/lib/site-data"

/** Die drei Arten, wie bei creaDIG ein Preis zustande kommt. */
export type KaufwegSchluessel = "fester-umfang" | "umfang-zuerst" | "laufend"

/** Wie der Betrag zu lesen ist, den ein Angebot traegt. */
export type BetragArt =
  /** Die Zahl steht auf der Seite und gilt fuer den vereinbarten Umfang. */
  | "festpreis"
  /** Die Zahl gilt pro Monat, solange der Zustand laeuft. */
  | "monatlich"
  /** Eine Spanne, deren Lage von benannten Treibern abhaengt. */
  | "spanne"
  /** Es gibt heute oeffentlich keine Zahl — und der Grund steht dabei. */
  | "nach-zuschnitt"

export type Angebot = {
  /** Schluessel fuer Woerterbuch und Pruefskript. */
  key: string
  /** Zu welchem der drei Kaufwege dieses Angebot gehoert. */
  kaufweg: KaufwegSchluessel
  betragArt: BetragArt
  /**
   * Der Betrag in Euro — gelesen aus `site-data`, nie hier getippt.
   * `null` bei `nach-zuschnitt`.
   */
  betrag: number | null
  /** Zweiter Betrag, wo es einen gibt (Regelpreis neben Pilotpreis, Spanne). */
  betragBis: number | null
  /** Wohin der naechste Schritt fuehrt. */
  href: string
  /**
   * Wo dieses Angebot im Kanon steht. Keine Zierde: Wer den Satz auf der
   * Seite anzweifelt, soll die Fundstelle im Repository nachschlagen koennen,
   * und wer ihn aendert, soll sehen, dass er dabei den Kanon aendert.
   */
  kanon: string
}

const websitePaket = packages.find((p) => p.key === "website") ?? null
const barrierefreiheit = packages.find((p) => p.key === "audit") ?? null

/*
 * Die Behebungs-Spanne (2.000–4.000 EUR) steht heute ausschliesslich in der
 * Leistungsseite `barrierefreiheit-website` und nicht in `packages`. Sie wird
 * hier deshalb NICHT als Betrag gefuehrt, sondern als eigenes Angebot mit
 * `nach-zuschnitt` — genau so, wie der Kanon sie beschreibt: „Die Zahl faellt
 * erst NACH der Pruefung." Damit bleibt die Regel intakt, dass jeder in
 * diesem Modul gefuehrte Betrag aus `site-data` stammt.
 */
export const angebote: Angebot[] = [
  {
    key: "website",
    kaufweg: "fester-umfang",
    betragArt: "festpreis",
    betrag: websitePaket?.amount ?? null,
    betragBis: websitePaket?.regularAmount ?? null,
    href: "/leistungen#pakete",
    kanon: "offer-canon.md §3, §4",
  },
  {
    key: "barrierefreiheit",
    kaufweg: "fester-umfang",
    betragArt: "festpreis",
    betrag: barrierefreiheit?.amount ?? null,
    betragBis: null,
    href: "/leistungen/barrierefreiheit-website",
    kanon: "offer-canon.md §5",
  },
  {
    key: "behebung",
    kaufweg: "umfang-zuerst",
    betragArt: "nach-zuschnitt",
    betrag: null,
    betragBis: null,
    href: "/leistungen/barrierefreiheit-website",
    kanon: "offer-canon.md §5",
  },
  {
    key: "systemprojekt",
    kaufweg: "umfang-zuerst",
    betragArt: "nach-zuschnitt",
    betrag: null,
    betragBis: null,
    href: "/termin?art=systemgespraech",
    kanon: "offer-canon.md §7 · qualification-canon.md §4",
  },
  {
    key: "betreuung",
    kaufweg: "laufend",
    betragArt: "monatlich",
    betrag: retainer.amount,
    betragBis: null,
    href: "/betrieb",
    kanon: "offer-canon.md §6",
  },
  {
    key: "systembetrieb",
    kaufweg: "laufend",
    betragArt: "nach-zuschnitt",
    betrag: null,
    betragBis: null,
    href: "/termin?art=systemgespraech",
    kanon: "offer-canon.md §6 — die Staffel darueber wird nicht verkauft",
  },
]

/** Die fünf Treiber aus `offer-canon.md` §7 — dieselbe Liste, die intern den Umfang schneidet. */
export const treiberAnzahl = 5

/**
 * Die drei Wege in der Reihenfolge, in der ein Kaeufer sie braucht: zuerst
 * das, was er sofort kaufen kann, zuletzt das, was laufend gilt.
 */
export const kaufwege: KaufwegSchluessel[] = ["fester-umfang", "umfang-zuerst", "laufend"]

export function angeboteZu(weg: KaufwegSchluessel): Angebot[] {
  return angebote.filter((a) => a.kaufweg === weg)
}

/**
 * Jeder Betrag, den dieses Modul ausliefert — fuer das Pruefskript, das ihn
 * gegen `site-data` haelt. Wenn hier je eine Zahl auftaucht, die dort nicht
 * steht, ist sie erfunden.
 */
export const gefuehrteBetraege: number[] = angebote
  .flatMap((a) => [a.betrag, a.betragBis])
  .filter((b): b is number => typeof b === "number")

/* =========================================================================
 * DER TEXT
 *
 * Liegt hier und nicht in `lib/dictionary.ts` — nach dem Muster von
 * `lib/service-pages.ts` und `lib/insights.ts`: Wo eine Aussage ihre
 * Fundstelle im Kanon hat, sollen Wort und Beleg in derselben Datei stehen.
 * Wer den Satz aendert, sieht den Kanon-Verweis daneben.
 * ========================================================================= */
import type { Localized } from "@/lib/site-data"

export const kaufwegeText = {
  eyebrow: {
    de: "Wie man hier kauft",
    tr: "Burada nasıl alınır",
    en: "How buying works here",
    ar: "كيف يتم الشراء هنا",
  } satisfies Localized,
  title: {
    de: "Drei Wege zu einem Preis.",
    tr: "Bir fiyata giden üç yol.",
    en: "Three routes to a price.",
    ar: "ثلاثة طرق إلى السعر.",
  } satisfies Localized,
  lead: {
    de: "Nicht jedes Vorhaben lässt sich vorher beziffern — aber jedes lässt sich einordnen. Welcher der drei Wege gilt, entscheidet, ob die Zahl schon auf dieser Seite steht, erst nach einem Gespräch entsteht oder monatlich läuft.",
    tr: "Her iş önceden rakama dökülemez — ama her iş sınıflandırılabilir. Hangi yolun geçerli olduğu, rakamın bu sayfada mı durduğunu, bir görüşmeden sonra mı oluştuğunu yoksa aylık mı işlediğini belirler.",
    en: "Not every undertaking can be priced in advance — but every one can be placed. Which of the three routes applies decides whether the number is already on this page, comes about after a conversation, or runs monthly.",
    ar: "ليس كل مشروع يمكن تسعيره مسبقًا — لكن كل مشروع يمكن تصنيفه. وأيُّ الطرق الثلاثة ينطبق هو ما يحدّد إن كان الرقم مذكورًا في هذه الصفحة، أم ينشأ بعد محادثة، أم يجري شهريًا.",
  } satisfies Localized,

  wannLabel: { de: "Wann", tr: "Ne zaman", en: "When", ar: "متى" } satisfies Localized,
  preisLabel: {
    de: "Wie der Preis entsteht",
    tr: "Fiyat nasıl oluşur",
    en: "How the price comes about",
    ar: "كيف ينشأ السعر",
  } satisfies Localized,
  ergebnisLabel: {
    de: "Was Sie bekommen",
    tr: "Ne alırsınız",
    en: "What you get",
    ar: "ما الذي تحصلون عليه",
  } satisfies Localized,
  grenzeLabel: {
    de: "Nicht enthalten",
    tr: "Dahil değil",
    en: "Not included",
    ar: "غير مشمول",
  } satisfies Localized,
  nettoHinweis: {
    de: "Alle Beträge netto. Die vollständige Preisleiter steht weiter unten.",
    tr: "Tüm tutarlar nettir. Tam fiyat listesi aşağıdadır.",
    en: "All amounts excl. VAT. The full price ladder is further down.",
    ar: "كل المبالغ دون ضريبة القيمة المضافة. وسلّم الأسعار الكامل أدناه.",
  } satisfies Localized,

  betragArt: {
    festpreis: { de: "Festpreis", tr: "Sabit fiyat", en: "Fixed price", ar: "سعر ثابت" } satisfies Localized,
    monatlich: { de: "je Monat", tr: "aylık", en: "per month", ar: "شهريًا" } satisfies Localized,
    "nach-zuschnitt": {
      de: "nach Zuschnitt",
      tr: "kapsam belirlendikten sonra",
      en: "after scoping",
      ar: "بعد تحديد النطاق",
    } satisfies Localized,
    spanne: { de: "Spanne", tr: "aralık", en: "range", ar: "نطاق" } satisfies Localized,
  },
  regulaerLabel: { de: "Regelpreis", tr: "Standart fiyat", en: "Standard price", ar: "السعر العادي" } satisfies Localized,

  /*
   * Der Rechner steht an genau EINEM Kaufweg: dort, wo der Preis erst nach
   * dem Gespraech entsteht. Das ist die Stelle, an der ein Leser „und was
   * kostet das?" denkt — und die einzige, an der die Antwort lautet: rechnen
   * Sie erst einmal aus, worum es ueberhaupt geht.
   */
  rechnerHinweis: {
    de: "Vorher lässt sich aber ausrechnen, was der Aufwand heute bindet.",
    tr: "Ama öncesinde bugünkü yükün ne bağladığı hesaplanabilir.",
    en: "What the effort ties up today can be worked out beforehand, though.",
    ar: "لكن يمكن مسبقًا حساب ما يستهلكه الجهد اليوم.",
  } satisfies Localized,
  rechnerCta: {
    de: "Aufwandsrechner",
    tr: "Yük hesaplayıcı",
    en: "Effort calculator",
    ar: "حاسبة الجهد",
  } satisfies Localized,

  wege: {
    "fester-umfang": {
      name: {
        de: "Der Umfang steht vorher fest",
        tr: "Kapsam önceden bellidir",
        en: "The scope is fixed in advance",
        ar: "النطاق محدَّد سلفًا",
      } satisfies Localized,
      wann: {
        de: "Sie wissen, was Sie brauchen, und es ist ein abgegrenztes Stück Arbeit.",
        tr: "Ne istediğinizi biliyorsunuz ve iş sınırları belli.",
        en: "You know what you need, and it is a bounded piece of work.",
        ar: "تعرفون ما تحتاجون إليه، والعمل محدود الحدود.",
      } satisfies Localized,
      preis: {
        de: "Die Zahl steht auf dieser Seite. Sie gilt für den vereinbarten Umfang und ändert sich danach nicht.",
        tr: "Rakam bu sayfada duruyor. Kararlaştırılan kapsam için geçerlidir ve sonrasında değişmez.",
        en: "The number is on this page. It applies to the agreed scope and does not change afterwards.",
        ar: "الرقم مذكور في هذه الصفحة. يسري على النطاق المتفق عليه ولا يتغير بعد ذلك.",
      } satisfies Localized,
    },
    "umfang-zuerst": {
      name: {
        de: "Der Umfang entsteht zuerst",
        tr: "Önce kapsam oluşur",
        en: "The scope comes first",
        ar: "النطاق يأتي أولًا",
      } satisfies Localized,
      wann: {
        de: "Mehrere Abläufe, mehrere Rollen, vorhandene Programme — oder etwas, das vorher niemand gesehen hat.",
        tr: "Birden fazla akış, birden fazla rol, mevcut programlar — ya da daha önce kimsenin görmediği bir şey.",
        en: "Several processes, several roles, existing programs — or something nobody has seen yet.",
        ar: "عدة مسارات، وعدة أدوار، وبرامج قائمة — أو شيء لم يره أحد من قبل.",
      } satisfies Localized,
      preis: {
        de: "Erst wird der Umfang geschnitten, dann fällt ein Festpreis für genau diesen Umfang. Vorher nennt Ihnen niemand seriös eine Zahl.",
        tr: "Önce kapsam belirlenir, sonra tam olarak o kapsam için sabit bir fiyat çıkar. Öncesinde kimse size ciddiyetle bir rakam söyleyemez.",
        en: "First the scope is cut, then a fixed price follows for exactly that scope. Before that, nobody can seriously quote you a number.",
        ar: "يُحدَّد النطاق أولًا، ثم يصدر سعر ثابت لذلك النطاق بالضبط. وقبل ذلك لا يستطيع أحد أن يذكر لكم رقمًا بجدية.",
      } satisfies Localized,
    },
    laufend: {
      name: {
        de: "Es ist ein laufender Zustand",
        tr: "Süregelen bir durumdur",
        en: "It is an ongoing state",
        ar: "إنها حالة مستمرة",
      } satisfies Localized,
      wann: {
        de: "Etwas ist gebaut und muss weiterlaufen.",
        tr: "Bir şey kuruldu ve işlemeye devam etmeli.",
        en: "Something is built and has to keep running.",
        ar: "شيءٌ بُني ويجب أن يستمر في العمل.",
      } satisfies Localized,
      preis: {
        de: "Die Zahl gilt pro Monat, der Umfang ist gedeckelt, und gekündigt wird monatlich.",
        tr: "Rakam aylıktır, kapsam tavanlıdır ve iptal aylıktır.",
        en: "The number applies per month, the scope is capped, and it is cancellable monthly.",
        ar: "الرقم شهري، والنطاق محدود بسقف، والإلغاء شهري.",
      } satisfies Localized,
    },
  },
} as const

/**
 * Die sechs Angebote in Kaeufersprache. `grenze` ist Pflicht und nicht
 * Kosmetik: Was ein Angebot NICHT enthaelt, entscheidet spaeter den Streit —
 * und `offer-canon.md` §3 und §6 fuehren beide Listen laengst, nur bisher
 * ohne oeffentliche Entsprechung.
 */
/*
 * `cta` ist nicht Kosmetik, sondern die Kaufreife in einem Wort. Zuerst stand
 * an allen sechs Angeboten „Ansehen" — auch am Systemprojekt, das auf eine
 * Terminanfrage fuehrt. Ein Aufruf, der nicht sagt, was als Naechstes
 * passiert, macht aus sechs verschiedenen Kaufwegen wieder einen Katalog.
 */
export const angebotText: Record<
  string,
  { name: Localized; ergebnis: Localized; grenze: Localized; cta: Localized }
> = {
  website: {
    name: { de: "Website-Paket", tr: "Web sitesi paketi", en: "Website package", ar: "باقة الموقع" },
    ergebnis: {
      de: "Eine Website mit Wegen für Anfragen und Bewerbungen, vier Wochen ab Materialeingang.",
      tr: "Talep ve başvuru yolları olan bir web sitesi; malzeme ulaştıktan sonra dört hafta.",
      en: "A website with paths for enquiries and applications, four weeks from receipt of your material.",
      ar: "موقع فيه مسارات للاستفسارات وطلبات التوظيف، خلال أربعة أسابيع من استلام موادّكم.",
    },
    grenze: {
      de: "Kein Shop, kein Buchungssystem, keine Anbindung an die Warenwirtschaft, keine mehreren Standorte mit eigenen Seiten. Das ist jeweils eigener Umfang.",
      tr: "Mağaza yok, randevu sistemi yok, stok sistemine bağlantı yok, kendi sayfaları olan birden fazla şube yok. Bunların her biri ayrı kapsamdır.",
      en: "No shop, no booking system, no link into inventory management, no multiple locations with their own pages. Each of those is its own scope.",
      ar: "لا متجر ولا نظام حجوزات ولا ربط بنظام المخزون ولا فروع متعددة بصفحات خاصة. كل واحد منها نطاق مستقل.",
    },
    cta: {
      de: "Paket und Preis ansehen",
      tr: "Paketi ve fiyatı görün",
      en: "See package and price",
      ar: "اطّلعوا على الباقة والسعر",
    },
  },
  barrierefreiheit: {
    name: {
      de: "Barrierefreiheits-Prüfung",
      tr: "Erişilebilirlik denetimi",
      en: "Accessibility audit",
      ar: "فحص إمكانية الوصول",
    },
    ergebnis: {
      de: "Ein Befundbericht nach WCAG 2.1 AA — je Fund mit Seite, Element, Kriterium und Messwert. Er gehört Ihnen, auch wenn Sie danach nichts tun.",
      tr: "WCAG 2.1 AA'ya göre bir bulgu raporu — her bulguda sayfa, öğe, ölçüt ve ölçüm değeri. Sonrasında hiçbir şey yapmasanız da rapor sizindir.",
      en: "A findings report against WCAG 2.1 AA — each finding with page, element, criterion and measured value. It belongs to you even if you do nothing afterwards.",
      ar: "تقرير نتائج وفق WCAG 2.1 AA — كل نتيجة بصفحتها وعنصرها ومعيارها وقيمتها المقيسة. والتقرير لكم حتى لو لم تفعلوا شيئًا بعده.",
    },
    grenze: {
      de: "Keine Konformitätszusage, keine Zertifizierung. Ein grüner automatischer Lauf heißt nicht barrierefrei.",
      tr: "Uygunluk taahhüdü yok, sertifikasyon yok. Yeşil bir otomatik geçiş erişilebilir demek değildir.",
      en: "No conformity assurance, no certification. A green automated run does not mean accessible.",
      ar: "لا تعهّد بالمطابقة ولا شهادة. والجولة الآلية الخضراء لا تعني أن الموقع متاح.",
    },
    cta: {
      de: "Prüfung ansehen",
      tr: "Denetimi görün",
      en: "See the audit",
      ar: "اطّلعوا على الفحص",
    },
  },
  behebung: {
    name: {
      de: "Behebung nach der Prüfung",
      tr: "Denetimden sonra giderme",
      en: "Remediation after the audit",
      ar: "المعالجة بعد الفحص",
    },
    ergebnis: {
      de: "Die gefundenen Mängel im Code behoben — ohne Overlay, ohne Zusatzwerkzeug, mit Nachprüfung und Zahlen vorher und nachher.",
      tr: "Bulunan eksikler kodun içinde giderilir — overlay olmadan, ek araç olmadan, yeniden denetim ve öncesi/sonrası rakamlarla.",
      en: "The defects found, fixed in the code — no overlay, no add-on tool, with a retest and numbers before and after.",
      ar: "تُعالَج العيوب المكتشفة داخل الشيفرة — دون طبقة تغطية ودون أداة إضافية، مع إعادة فحص وأرقام قبل وبعد.",
    },
    grenze: {
      de: "Die Zahl fällt erst nach der Prüfung. Für Ungesehenes nennt niemand seriös einen Festpreis.",
      tr: "Rakam ancak denetimden sonra çıkar. Görülmemiş bir şey için kimse ciddiyetle sabit fiyat vermez.",
      en: "The number only follows the audit. Nobody seriously quotes a fixed price for what they have not seen.",
      ar: "الرقم لا يصدر إلا بعد الفحص. ولا أحد يذكر بجدية سعرًا ثابتًا لشيء لم يره.",
    },
    cta: {
      de: "Erst prüfen lassen",
      tr: "Önce denetletin",
      en: "Have it audited first",
      ar: "اطلبوا الفحص أولًا",
    },
  },
  systemprojekt: {
    name: { de: "Systemprojekt", tr: "Sistem projesi", en: "System project", ar: "مشروع نظام" },
    ergebnis: {
      de: "Ein System für Ihre Abläufe. Der Umfang wird im Systemgespräch geschnitten, danach gilt ein Festpreis für genau diesen Umfang.",
      tr: "Akışlarınız için bir sistem. Kapsam sistem görüşmesinde belirlenir, ardından tam olarak o kapsam için sabit bir fiyat geçerli olur.",
      en: "A system for your processes. The scope is cut in the system conversation, after which a fixed price applies for exactly that scope.",
      ar: "نظام لمساراتكم. يُحدَّد النطاق في محادثة النظام، ثم يسري سعر ثابت لذلك النطاق بالضبط.",
    },
    grenze: {
      de: "Kein Listenpreis und keine Spanne. Es gibt keine Reihe abgeschlossener Systemprojekte, aus der sich eine ableiten ließe — eine geratene Spanne wäre entweder peinlich oder bindend.",
      tr: "Liste fiyatı yok, aralık yok. Aralık türetilebilecek tamamlanmış sistem projeleri dizisi yok — tahmini bir aralık ya utandırıcı ya da bağlayıcı olurdu.",
      en: "No list price and no range. There is no series of completed system projects from which one could be derived — a guessed range would be either embarrassing or binding.",
      ar: "لا سعر قائمة ولا نطاق سعري. فليست هناك سلسلة مشاريع أنظمة مكتملة يمكن اشتقاق نطاق منها — والنطاق المُخمَّن إما محرج وإما مُلزِم.",
    },
    cta: {
      de: "Systemgespräch anfragen",
      tr: "Sistem görüşmesi talep edin",
      en: "Request a system conversation",
      ar: "اطلبوا محادثة نظام",
    },
  },
  betreuung: {
    name: {
      de: "Laufende Betreuung",
      tr: "Sürekli bakım",
      en: "Ongoing care",
      ar: "الرعاية المستمرة",
    },
    /*
     * Hier stand zuerst der vollstaendige Leistungsumfang — dieselben fuenf
     * Punkte, die „Managed Betrieb" auf derselben Seite achtzig Zeilen
     * darueber bereits auffuehrt. Zwei Listen, ein Angebot: genau die
     * Doppelung, gegen die Gate 03 angetreten ist. Hier steht deshalb, was
     * die Kaufart ausmacht; was drin ist, steht dort, wo es hingehoert.
     */
    ergebnis: {
      de: "Der laufende Betrieb einer Seite oder eines Systems, das wir gebaut haben — gedeckelter Umfang, monatlich kündbar.",
      tr: "Kurduğumuz bir sitenin ya da sistemin süregelen işletimi — tavanlı kapsam, aylık iptal edilebilir.",
      en: "The ongoing operation of a site or system we built — capped scope, cancellable monthly.",
      ar: "التشغيل المستمر لموقع أو نظام بنيناه — نطاق محدود بسقف، وقابل للإلغاء شهريًا.",
    },
    /*
     * „Nur fuer Seiten und Systeme, die wir gebaut haben" stand hier und
     * links im Ergebnis — dieselbe Bedingung zweimal in zwei nebeneinander
     * liegenden Spalten. Der Platz gehoert der Auskunft, die daneben fehlte:
     * was mit einer FREMDEN Seite passiert (`offer-canon.md` §6).
     */
    grenze: {
      de: "Keine Rufbereitschaft, kein Wochenenddienst, keine zugesagte Reaktionszeit in Stunden. Alles, was verändert statt aktualisiert, ist ein eigenes Projekt. Steht Ihre Seite schon: Wir sehen sie uns an und sagen danach, ob wir sie übernehmen können.",
      tr: "Nöbet yok, hafta sonu servisi yok, saat cinsinden taahhüt edilmiş yanıt süresi yok. Güncellemek yerine değiştiren her şey ayrı bir projedir. Siteniz zaten varsa: Bakarız ve ardından devralıp devralamayacağımızı söyleriz.",
      en: "No on-call duty, no weekend service, no promised response time in hours. Anything that changes rather than updates is its own project. If your site already exists: we look at it and say afterwards whether we can take it on.",
      ar: "لا مناوبة طوارئ ولا خدمة في عطلة نهاية الأسبوع ولا زمن استجابة متعهَّد به بالساعات. وكل ما يُغيِّر بدل أن يُحدِّث فهو مشروع مستقل. وإن كان موقعكم قائمًا: ننظر فيه ثم نقول إن كنا نستطيع تولّيه.",
    },
    cta: {
      de: "Umfang im Detail",
      tr: "Kapsamı ayrıntılı görün",
      en: "The scope in detail",
      ar: "النطاق بالتفصيل",
    },
  },
  systembetrieb: {
    name: {
      de: "Betrieb einer Individualanwendung",
      tr: "Özel bir uygulamanın işletimi",
      en: "Operating a custom application",
      ar: "تشغيل تطبيق مخصَّص",
    },
    ergebnis: {
      de: "Für ein System mit eigener Datenbank, Anbindungen und betrieblicher Verantwortung entsteht der Umfang im Gespräch — nach Oberfläche, Überwachung, Änderungsfrequenz und Risiko.",
      tr: "Kendi veritabanı, bağlantıları ve operasyonel sorumluluğu olan bir sistemde kapsam görüşmede oluşur — arayüz, izleme, değişiklik sıklığı ve riske göre.",
      en: "For a system with its own database, integrations and operational responsibility, the scope comes about in conversation — by surface, monitoring, change frequency and risk.",
      ar: "لنظام له قاعدة بياناته وارتباطاته ومسؤوليته التشغيلية، ينشأ النطاق في المحادثة — بحسب الواجهة والمراقبة ووتيرة التغيير والمخاطر.",
    },
    grenze: {
      de: "Dafür gibt es heute keinen öffentlichen Preis und keine Betriebsstufe über der laufenden Betreuung. Reaktionszeit, Erreichbarkeit und Vertretung sind nicht zugesagt — solange das so ist, verkaufen wir darüber nichts.",
      tr: "Bunun için bugün kamuya açık bir fiyat ve sürekli bakımın üzerinde bir işletim kademesi yoktur. Yanıt süresi, erişilebilirlik ve vekâlet taahhüt edilmemiştir — bu böyle olduğu sürece üzerine bir şey satmayız.",
      en: "There is no public price for this today, and no operating tier above ongoing care. Response time, reachability and deputisation are not promised — while that is the case, we sell nothing above it.",
      ar: "لا يوجد لذلك سعر معلن اليوم ولا درجة تشغيل فوق الرعاية المستمرة. فزمن الاستجابة وإمكانية الوصول والإنابة غير متعهَّد بها — وما دام الأمر كذلك فإننا لا نبيع شيئًا فوقها.",
    },
    cta: {
      de: "Im Gespräch klären",
      tr: "Görüşmede netleştirin",
      en: "Clarify in conversation",
      ar: "نوضّحه في المحادثة",
    },
  },
}

/**
 * Die Fit-Frage. Sie steht hier, weil ein System-Haus, das nie „das brauchen
 * Sie nicht" sagt, nur eine Verkaufsseite mit Fachbegriffen ist.
 *
 * Alle vier Saetze verkleinern den Anspruch, keiner vergroessert ihn — sie
 * fuehren hoechstens VOM Systemprojekt weg. Fundstelle: `offer-canon.md` §7
 * („Trifft nichts zu → das Website-Paket reicht") und die Owner-Grundregel,
 * dass nicht ueber Angst verkauft wird.
 */
export const fitText = {
  title: {
    de: "Brauchen Sie dafür ein eigenes System?",
    tr: "Bunun için kendi sisteminize ihtiyacınız var mı?",
    en: "Do you need a system of your own for this?",
    ar: "هل تحتاجون إلى نظام خاص بكم لهذا؟",
  } satisfies Localized,
  lead: {
    de: "Oft nicht. Die Frage entscheidet sich an den fünf Treibern weiter unten — und an einer Antwort, die uns Arbeit kostet.",
    tr: "Çoğu zaman hayır. Bu soru aşağıdaki beş etkene göre belirlenir — ve bize iş kaybettiren bir cevaba göre.",
    en: "Often not. The question is decided by the five drivers further down — and by one answer that costs us work.",
    ar: "غالبًا لا. تُحسم المسألة بالمحرّكات الخمسة أدناه — وبإجابة واحدة تكلّفنا عملًا.",
  } satisfies Localized,
  faelle: [
    {
      de: "Löst eine vorhandene Standardsoftware Ihr Problem sauber, ist das die günstigere Antwort. Dann bauen wir nichts.",
      tr: "Mevcut bir standart yazılım sorununuzu düzgün çözüyorsa, ucuz olan cevap odur. O zaman biz bir şey kurmayız.",
      en: "If existing standard software solves your problem cleanly, that is the cheaper answer. Then we build nothing.",
      ar: "إن كان برنامج جاهز قائم يحلّ مشكلتكم على نحو سليم، فهذا هو الجواب الأرخص. وعندها لا نبني شيئًا.",
    },
    {
      de: "Trifft keiner der fünf Treiber zu, ist es kein Systemprojekt — dann reicht das Website-Paket.",
      tr: "Beş etkenden hiçbiri geçerli değilse bu bir sistem projesi değildir — o zaman web sitesi paketi yeter.",
      en: "If none of the five drivers apply, it is not a system project — then the website package is enough.",
      ar: "إن لم ينطبق أيٌّ من المحرّكات الخمسة فليس هذا مشروع نظام — وعندها تكفي باقة الموقع.",
    },
    {
      de: "Klemmt es nur an der Übergabe zwischen Programmen, die Sie schon haben, ist das eine Anbindung. Sie gehört zu einem Systemprojekt, aber sie ist der kleinere Teil davon.",
      tr: "Yalnızca hâlihazırda sahip olduğunuz programlar arasındaki devirde takılıyorsa bu bir bağlantıdır. Sistem projesine dahildir ama onun küçük parçasıdır.",
      en: "If the only thing stuck is the handover between programs you already have, that is an integration. It belongs to a system project, but it is the smaller part of one.",
      ar: "إن كان العالق هو التسليم بين برامج تملكونها فعلًا، فتلك عملية ربط. هي جزء من مشروع نظام، لكنها الجزء الأصغر منه.",
    },
    {
      de: "Treffen mehrere Treiber zu — mehrere Abläufe, Rollen, Standorte, Altdaten, Arbeit draußen —, dann ist Systemarchitektur die Frage, und das Gespräch ist der nächste Schritt.",
      tr: "Birden fazla etken geçerliyse — birden fazla akış, rol, konum, eski veri, saha çalışması — soru sistem mimarisidir ve sıradaki adım görüşmedir.",
      en: "If several drivers apply — several processes, roles, locations, legacy data, work out in the field — then system architecture is the question, and the conversation is the next step.",
      ar: "وإن انطبقت عدة محرّكات — عدة مسارات وأدوار ومواقع وبيانات قديمة وعمل في الميدان — فالمسألة هي هندسة الأنظمة، والمحادثة هي الخطوة التالية.",
    },
  ] satisfies Localized[],
}
