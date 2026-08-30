import type { Localized } from "@/lib/site-data"
import { serviceLayers } from "@/lib/site-data"
import type { Locale } from "@/lib/dictionary"

/**
 * MP-D · DER BETRIEBSCHECK — Daten, Fragen und Rechnung.
 *
 * ---------------------------------------------------------------------------
 * WAS ER IST UND WAS ER AUSDRUECKLICH NICHT IST
 * Er ist eine Selbsteinschaetzung: Der Besucher beantwortet fuenfzehn Fragen
 * ueber SEINEN Betrieb, und die Seite rechnet daraus eine Ordnung. Er ist
 * KEINE Pruefung, kein Scan, kein Audit — niemand hier sieht den Betrieb.
 *
 * Der Unterschied ist derselbe, den `quick-check.tsx` schon einmal getroffen
 * hat: Ein Knopf, der eine fremde Sache automatisch bewertet und eine Ampel
 * ausgibt, verspricht dasselbe wie ein Barrierefreiheits-Overlay — ein
 * Ergebnis, fuer das niemand geradesteht. Hier bewertet der Betrieb sich
 * selbst; die Seite ordnet nur, was er gesagt hat. Deshalb darf sie eine Zahl
 * nennen, ohne etwas zu behaupten.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE FRAGEN SO KLINGEN
 * Keine Frage nennt ein Werkzeug, eine Technologie oder ein Kuerzel. Wer
 * „Nutzen Sie ein CRM?" fragt, bekommt die Antwort auf eine Vokabel, nicht
 * auf einen Zustand — und schliesst jeden aus, der das Wort nicht kennt,
 * obwohl er genau das Problem hat. Gefragt wird darum immer nach dem ALLTAG:
 * Sehen Sie den Stand? Tippen Sie zweimal? Findet ein Kollege den Vorgang?
 *
 * Jede Frage haengt an genau einer der fuenf Ebenen. Das ist der Punkt: Am
 * Ende steht nicht „Sie sind zu 62 % digital", sondern WO der Engpass liegt —
 * und weil die Ebenen aufeinander stehen, sagt die schwaechste zugleich,
 * welche darueber gerade nicht tragen kann.
 *
 * ---------------------------------------------------------------------------
 * DIE RECHNUNG IST ABSICHTLICH GROB
 * Drei Antworten (laeuft / teilweise / nicht), zwei Punkte, ein Punkt, null.
 * Fuenfzehn Fragen, dreissig Punkte, Prozent. Keine Gewichtung, keine
 * Nachkommastelle: Eine Selbsteinschaetzung, die auf 0,1 Prozent genau tut,
 * behauptet eine Genauigkeit, die sie nicht hat.
 */

export type CheckLayer = (typeof serviceLayers)[number]["key"]

export type CheckAnswerKey = "yes" | "partly" | "no"

export const CHECK_ANSWERS: { key: CheckAnswerKey; points: number; label: Localized }[] = [
  { key: "yes", points: 2, label: { de: "Läuft", tr: "Yürüyor", en: "Working", ar: "يعمل" } },
  { key: "partly", points: 1, label: { de: "Teilweise", tr: "Kısmen", en: "Partly", ar: "جزئيًا" } },
  { key: "no", points: 0, label: { de: "Nicht", tr: "Hayır", en: "Not yet", ar: "لا" } },
]

export const MAX_POINTS_PER_QUESTION = 2

export type CheckQuestion = {
  id: string
  layer: CheckLayer
  /** Als Zustand formuliert, nie als Werkzeug. */
  text: Localized
}

/**
 * Fuenfzehn Fragen, drei je Ebene. Die Reihenfolge ist die des Hauses:
 * Identity traegt Digital traegt Operations traegt Automation traegt
 * Intelligence.
 */
export const CHECK_QUESTIONS: CheckQuestion[] = [
  {
    id: "id-1",
    layer: "identity",
    text: {
      de: "Ihr Betrieb tritt überall gleich auf — Fahrzeug, Angebot, Rechnung, Website.",
      tr: "İşletmeniz her yerde aynı görünüyor — araç, teklif, fatura, web sitesi.",
      en: "Your business looks the same everywhere — van, quote, invoice, website.",
      ar: "منشأتكم تظهر بالشكل نفسه في كل مكان — المركبة والعرض والفاتورة والموقع.",
    },
  },
  {
    id: "id-2",
    layer: "identity",
    text: {
      de: "Wer Sie zum ersten Mal sieht, versteht in zehn Sekunden, was Sie tun.",
      tr: "Sizi ilk kez gören, on saniyede ne yaptığınızı anlıyor.",
      en: "Someone seeing you for the first time understands in ten seconds what you do.",
      ar: "من يراكم أول مرة يفهم في عشر ثوانٍ ما الذي تفعلونه.",
    },
  },
  {
    id: "id-3",
    layer: "identity",
    text: {
      de: "Logos, Farben und Vorlagen liegen an einer Stelle — nicht auf drei Rechnern.",
      tr: "Logolar, renkler ve şablonlar tek bir yerde — üç ayrı bilgisayarda değil.",
      en: "Logos, colours and templates are in one place — not on three computers.",
      ar: "الشعارات والألوان والقوالب في موضع واحد — لا على ثلاثة حواسيب.",
    },
  },

  {
    id: "dg-1",
    layer: "digital",
    text: {
      de: "Ihre Website ist so aktuell, dass Sie sie jemandem ungefragt schicken würden.",
      tr: "Web siteniz, birine çekinmeden gönderebileceğiniz kadar güncel.",
      en: "Your website is current enough that you would send it to someone unprompted.",
      ar: "موقعكم محدَّث بما يكفي لترسلوه لأحدهم دون أن يطلبه.",
    },
  },
  {
    id: "dg-2",
    layer: "digital",
    text: {
      de: "Wer Ihre Leistung sucht, findet Sie — nicht nur, wer Ihren Namen schon kennt.",
      tr: "Hizmetinizi arayan sizi buluyor — sadece adınızı bilen değil.",
      en: "People searching for your service find you — not only those who already know your name.",
      ar: "من يبحث عن خدمتكم يجدكم — لا من يعرف اسمكم فقط.",
    },
  },
  {
    id: "dg-3",
    layer: "digital",
    text: {
      de: "Eine Anfrage kommt strukturiert bei Ihnen an, nicht als Zuruf zwischen Tür und Angel.",
      tr: "Gelen talep size düzenli ulaşıyor, iki iş arasında laf olarak değil.",
      en: "An enquiry reaches you in a structured form, not as a remark in passing.",
      ar: "الاستفسار يصلكم منظَّمًا، لا كملاحظة عابرة.",
    },
  },

  {
    id: "op-1",
    layer: "operations",
    text: {
      de: "Sie sehen den Stand eines Auftrags, ohne jemanden anzurufen.",
      tr: "Bir işin durumunu kimseyi aramadan görebiliyorsunuz.",
      en: "You can see the status of a job without calling anyone.",
      ar: "ترون حالة الطلب دون الاتصال بأحد.",
    },
  },
  {
    id: "op-2",
    layer: "operations",
    text: {
      de: "Angebot, Auftrag und Rechnung hängen zusammen — dieselben Daten werden nicht zweimal getippt.",
      tr: "Teklif, iş emri ve fatura birbirine bağlı — aynı veri iki kez yazılmıyor.",
      en: "Quote, job and invoice are connected — the same data is not typed twice.",
      ar: "العرض والطلب والفاتورة مترابطة — والبيانات نفسها لا تُكتب مرتين.",
    },
  },
  {
    id: "op-3",
    layer: "operations",
    text: {
      de: "Fällt jemand aus, findet ein anderer den Vorgang ohne Rückfrage.",
      tr: "Biri olmadığında, bir başkası işi kimseye sormadan bulabiliyor.",
      en: "If someone is away, another person finds the case without having to ask.",
      ar: "إن غاب أحدهم وجد غيره المعاملة دون سؤال.",
    },
  },

  {
    id: "au-1",
    layer: "automation",
    text: {
      de: "Wiederkehrende Schritte laufen ohne Sie — Erinnerungen, Bestätigungen, Übergaben.",
      tr: "Tekrar eden adımlar sizsiz yürüyor — hatırlatma, onay, devir.",
      en: "Recurring steps run without you — reminders, confirmations, handovers.",
      ar: "الخطوات المتكررة تجري دونكم — التذكيرات والتأكيدات والتسليمات.",
    },
  },
  {
    id: "au-2",
    layer: "automation",
    text: {
      de: "Zahlen aus dem Betrieb entstehen nebenbei, nicht am Monatsende in einer Tabelle.",
      tr: "İşletme rakamları iş akarken oluşuyor, ay sonunda bir tabloda değil.",
      en: "Figures from the business arise along the way, not in a spreadsheet at month end.",
      ar: "أرقام المنشأة تنشأ في أثناء العمل، لا في جدول نهاية الشهر.",
    },
  },
  {
    id: "au-3",
    layer: "automation",
    text: {
      de: "In den letzten sechs Monaten ist mindestens ein Handgriff dauerhaft weggefallen.",
      tr: "Son altı ayda en az bir el işi kalıcı olarak ortadan kalktı.",
      en: "In the last six months at least one manual step has gone away for good.",
      ar: "في الأشهر الستة الماضية زالت خطوة يدوية واحدة على الأقل نهائيًا.",
    },
  },

  {
    id: "in-1",
    layer: "intelligence",
    text: {
      de: "Sie können sagen, welcher Auftragstyp bei Ihnen tatsächlich Geld bringt.",
      tr: "Hangi iş türünün gerçekten para kazandırdığını söyleyebiliyorsunuz.",
      en: "You can say which type of job actually makes you money.",
      ar: "تستطيعون قول أي نوع من الطلبات يدرّ عليكم المال فعلًا.",
    },
  },
  {
    id: "in-2",
    layer: "intelligence",
    text: {
      de: "Entscheidungen stützen sich auf Zahlen, die Sie am selben Tag sehen — nicht auf ein Gefühl.",
      tr: "Kararlar aynı gün görebildiğiniz rakamlara dayanıyor — hisse değil.",
      en: "Decisions rest on figures you see the same day — not on a feeling.",
      ar: "القرارات تستند إلى أرقام ترونها في اليوم نفسه — لا إلى إحساس.",
    },
  },
  {
    id: "in-3",
    layer: "intelligence",
    text: {
      de: "Ihre Systeme melden sich, bevor Sie fragen — Auslastung, Termine, Engpässe.",
      tr: "Sistemleriniz siz sormadan haber veriyor — doluluk, randevu, darboğaz.",
      en: "Your systems report before you ask — capacity, appointments, bottlenecks.",
      ar: "أنظمتكم تُبلغ قبل أن تسألوا — الطاقة والمواعيد والاختناقات.",
    },
  },
]

export const QUESTIONS_PER_LAYER = CHECK_QUESTIONS.length / serviceLayers.length

/* ==========================================================================
 * DIE RECHNUNG
 * ========================================================================== */

export type LayerResult = {
  key: CheckLayer
  level: string
  points: number
  maxPoints: number
  /** 0–100, ganzzahlig. */
  percent: number
}

export type CheckResult = {
  /** Gesamtscore 0–100, ganzzahlig. */
  score: number
  layers: LayerResult[]
  /** Die schwächste Ebene. Bei Gleichstand die untere — sie trägt die andere. */
  bottleneck: LayerResult
  /**
   * Die Ebene direkt über dem Engpass — die, die deshalb nicht tragen kann.
   * `null`, wenn der Engpass schon ganz oben liegt.
   */
  blocked: LayerResult | null
  /**
   * Wie viele Fragen mit „Nicht" beantwortet wurden. Das ist keine Schätzung:
   * Jede davon ist eine Stelle, die der Betrieb selbst als offen benannt hat.
   */
  manualSpots: number
  /** Wurden alle Fragen beantwortet? Vorher gibt es kein Ergebnis. */
  complete: boolean
  /**
   * Alle fuenf Ebenen gleich stark.
   *
   * Ohne dieses Feld behauptet die Seite auch dann einen Engpass, wenn es
   * keinen gibt: `bottleneck` ist immer gesetzt, weil eine Liste immer ein
   * Minimum hat. Bei fuenfmal 100 Prozent stand dort „Identity → Digital:
   * Solange Identity nicht traegt …" — ein Satz ueber eine Luecke, die der
   * Besucher gerade selbst als geschlossen gemeldet hat. Das ist genau die
   * Sorte Behauptung, die diese Seite nicht macht.
   */
  evenlyBalanced: boolean
}

export type CheckAnswers = Partial<Record<string, CheckAnswerKey>>

function pointsOf(answer: CheckAnswerKey | undefined): number {
  return CHECK_ANSWERS.find((option) => option.key === answer)?.points ?? 0
}

export function evaluateCheck(answers: CheckAnswers): CheckResult {
  const layers: LayerResult[] = serviceLayers.map((layer) => {
    const questions = CHECK_QUESTIONS.filter((question) => question.layer === layer.key)
    const points = questions.reduce((sum, question) => sum + pointsOf(answers[question.id]), 0)
    const maxPoints = questions.length * MAX_POINTS_PER_QUESTION
    return {
      key: layer.key,
      level: layer.level,
      points,
      maxPoints,
      percent: Math.round((points / maxPoints) * 100),
    }
  })

  const totalPoints = layers.reduce((sum, layer) => sum + layer.points, 0)
  const totalMax = layers.reduce((sum, layer) => sum + layer.maxPoints, 0)

  /*
   * Bei Gleichstand gewinnt die UNTERE Ebene. Das ist keine Willkür: Die
   * Ebenen stehen aufeinander, und eine Luecke unten macht jede Anstrengung
   * darueber teurer. `reduce` mit `<` statt `<=` behaelt darum den ersten
   * Fund — und die Liste ist von 01 nach 05 sortiert.
   */
  const bottleneck = layers.reduce((worst, layer) =>
    layer.percent < worst.percent ? layer : worst,
  )
  const bottleneckIndex = layers.findIndex((layer) => layer.key === bottleneck.key)
  const blocked = layers[bottleneckIndex + 1] ?? null

  const manualSpots = CHECK_QUESTIONS.filter(
    (question) => answers[question.id] === "no",
  ).length

  return {
    score: Math.round((totalPoints / totalMax) * 100),
    layers,
    bottleneck,
    blocked,
    manualSpots,
    evenlyBalanced: layers.every((layer) => layer.percent === layers[0].percent),
    complete: CHECK_QUESTIONS.every((question) => answers[question.id] !== undefined),
  }
}

/**
 * Die Zusammenfassung, die mit dem Lead ins Postfach geht.
 *
 * Sie steht bewusst als Klartext im `message`-Feld des bestehenden
 * Lead-Wegs — kein zweiter Endpunkt, keine zweite Ablage. Wer die Anfrage
 * liest, sieht dieselbe Ordnung, die der Absender auf dem Bildschirm hatte.
 */
export function checkSummary(
  result: CheckResult,
  answers: CheckAnswers,
  locale: Locale,
  layerName: (key: CheckLayer) => string,
): string {
  const head =
    locale === "tr"
      ? [
          `Betriebscheck sonucu: ${result.score}/100`,
          `Darboğaz: ${layerName(result.bottleneck.key)} (${result.bottleneck.percent}%)`,
          `„Hayır" sayısı: ${result.manualSpots}`,
        ]
      : [
          `Betriebscheck-Ergebnis: ${result.score}/100`,
          `Engpass: ${layerName(result.bottleneck.key)} (${result.bottleneck.percent} %)`,
          `Mit „Nicht" beantwortet: ${result.manualSpots}`,
        ]

  const perLayer = result.layers.map(
    (layer) => `  ${layer.level} ${layerName(layer.key)}: ${layer.percent} %`,
  )

  const detail = CHECK_QUESTIONS.map((question) => {
    const answer = CHECK_ANSWERS.find((option) => option.key === answers[question.id])
    return `  [${answer?.label[locale] ?? "—"}] ${question.text[locale]}`
  })

  return [...head, "", ...perLayer, "", ...detail].join("\n")
}

/* ==========================================================================
 * SEITENTEXTE
 *
 * Sie liegen hier und nicht im Woerterbuch — dieselbe Entscheidung wie bei
 * `site-data.ts` und `service-pages.ts`: Was zu einem Datensatz gehoert,
 * steht bei ihm. Beide Sprachen stehen nebeneinander, damit keine Fassung
 * unbemerkt zurueckfaellt.
 * ========================================================================== */

export const checkCopy = {
  metaTitle: {
    de: "Betriebscheck — wo Ihr Betrieb noch von Hand läuft | creaDIG",
    tr: "İşletme kontrolü — işletmeniz nerede hâlâ elle yürüyor | creaDIG",
    en: "Operations check — where your business still runs by hand | creaDIG",
    ar: "فحص المنشأة — أين تعمل منشأتكم يدويًا | creaDIG",
  },
  metaDescription: {
    de: "Fünfzehn Fragen zu Ihrem Alltag, fünf Ebenen, ein Ergebnis: wo der Engpass liegt und was er kostet. Kostenlos, ohne Anmeldung.",
    tr: "Günlük işinize dair on beş soru, beş katman, tek sonuç: darboğaz nerede ve neye mal oluyor. Ücretsiz, kayıt gerekmez.",
    en: "Fifteen questions about your working day, five levels, one result: where the bottleneck is and what it costs. Free, no sign-up.",
    ar: "خمسة عشر سؤالًا عن يومكم العملي، وخمس طبقات، ونتيجة واحدة: أين الاختناق وكم يكلّف. مجانًا ودون تسجيل.",
  },
  eyebrow: { de: "Betriebscheck", tr: "İşletme kontrolü", en: "Operations check", ar: "فحص المنشأة" },
  title: {
    de: "Ihr Betrieb läuft. Aber wie viel davon noch von Hand?",
    tr: "İşletmeniz yürüyor. Peki ne kadarı hâlâ elle?",
    en: "Your business runs. But how much of it still by hand?",
    ar: "منشأتكم تعمل. لكن كم منها ما يزال يدويًا؟",
  },
  lead: {
    de: "Fünfzehn Fragen, fünf Ebenen, zwei Minuten. Am Ende sehen Sie, wo der Engpass liegt — und wie viele Stellen Sie selbst als offen benannt haben.",
    tr: "On beş soru, beş katman, iki dakika. Sonunda darboğazın nerede olduğunu ve kaç noktayı kendinizin açık olarak işaretlediğini görürsünüz.",
    en: "Fifteen questions, five levels, two minutes. At the end you see where the bottleneck is — and how many places you yourself marked as open.",
    ar: "خمسة عشر سؤالًا، وخمس طبقات، ودقيقتان. وفي النهاية ترون أين يقع الاختناق — وكم موضعًا وسمتموه أنتم مفتوحًا.",
  },
  /* Die Ehrlichkeitszeile. Sie steht VOR dem Ergebnis, nicht im Kleingedruckten. */
  disclaimer: {
    de: "Das ist Ihre eigene Einschätzung, keine Prüfung — wir sehen Ihren Betrieb nicht. Die Seite ordnet nur, was Sie angegeben haben.",
    tr: "Bu sizin kendi değerlendirmeniz, bir denetim değil — işletmenizi görmüyoruz. Sayfa yalnızca verdiğiniz yanıtları düzenler.",
    en: "This is your own assessment, not an audit — we do not see your business. The page only orders what you entered.",
    ar: "هذا تقديركم أنتم، لا فحصٌ — نحن لا نرى منشأتكم. والصفحة تُرتّب ما أدخلتموه فحسب.",
  },
  progress: {
    de: (done: number, total: number) => `${done} von ${total} beantwortet`,
    tr: (done: number, total: number) => `${total} sorudan ${done} tanesi yanıtlandı`,
    en: (done: number, total: number) => `${done} of ${total} answered`,
    ar: (done: number, total: number) => `أُجيب عن ${done} من ${total}`,
  },
  resultTitle: { de: "Ihr Ergebnis", tr: "Sonucunuz", en: "Your result", ar: "نتيجتكم" },
  showResult: { de: "Ergebnis zeigen", tr: "Sonucu göster", en: "Show the result", ar: "عرض النتيجة" },
  scoreLabel: { de: "Gesamt", tr: "Toplam", en: "Total", ar: "الإجمالي" },
  bottleneckLabel: { de: "Größte Lücke", tr: "En büyük boşluk", en: "Biggest gap", ar: "أكبر فجوة" },
  bottleneckBlocked: {
    de: (weak: string, blocked: string) =>
      `${weak} → ${blocked}: Solange ${weak} nicht trägt, kostet jeder Schritt in ${blocked} mehr, als er müsste.`,
    tr: (weak: string, blocked: string) =>
      `${weak} → ${blocked}: ${weak} taşımadığı sürece, ${blocked} tarafındaki her adım olması gerekenden pahalıya gelir.`,
    en: (weak: string, blocked: string) =>
      `${weak} → ${blocked}: as long as ${weak} does not carry, every step in ${blocked} costs more than it should.`,
    ar: (weak: string, blocked: string) =>
      `${weak} ← ${blocked}: ما دامت ${weak} لا تحمل، فكل خطوة في ${blocked} تكلّف أكثر مما ينبغي.`,
  },
  /* Wenn keine Ebene abfaellt, gibt es keine Luecke — und die Seite sagt das. */
  bottleneckEven: {
    de: "Keine Ebene fällt ab. Dann ist die Frage nicht, wo es klemmt, sondern was als Nächstes dazukommt.",
    tr: "Hiçbir katman geride kalmıyor. O hâlde soru nerede takıldığı değil, sırada ne olduğu.",
    en: "No level falls behind. Then the question is not where it is stuck, but what comes next.",
    ar: "لا طبقة متأخرة. عندها لا يكون السؤال أين يعلق الأمر، بل ما الذي يأتي تاليًا.",
  },
  bottleneckEvenLabel: { de: "Kein Engpass", tr: "Darboğaz yok", en: "No bottleneck", ar: "لا اختناق" },
  bottleneckTop: {
    de: (weak: string) =>
      `${weak} ist die schwächste Ebene — und die oberste. Darunter steht bereits etwas, auf dem sie aufbauen kann.`,
    tr: (weak: string) =>
      `${weak} en zayıf katman — ve en üstteki. Altında, üzerine kurulabileceği bir şey zaten var.`,
    en: (weak: string) =>
      `${weak} is the weakest level — and the topmost. Below it there is already something it can build on.`,
    ar: (weak: string) =>
      `${weak} هي أضعف طبقة — وهي العليا أيضًا. وتحتها يوجد بالفعل ما يمكن أن تقوم عليه.`,
  },
  manualLabel: {
    de: (count: number) =>
      count === 1
        ? "1 Stelle haben Sie selbst als offen benannt."
        : `${count} Stellen haben Sie selbst als offen benannt.`,
    tr: (count: number) => `${count} noktayı kendiniz açık olarak işaretlediniz.`,
    en: (count: number) =>
      count === 1
        ? "You marked 1 place as open yourself."
        : `You marked ${count} places as open yourself.`,
    ar: (count: number) => `وسمتم ${count} موضعًا مفتوحًا بأنفسكم.`,
  },
  manualNone: {
    de: "Sie haben keine Stelle als offen benannt. Dann geht es nicht um Aufräumen, sondern um den nächsten Schritt.",
    tr: "Hiçbir noktayı açık olarak işaretlemediniz. O hâlde mesele toparlamak değil, bir sonraki adım.",
    en: "You marked no place as open. Then this is not about tidying up, but about the next step.",
    ar: "لم تسموا أي موضع مفتوحًا. عندها لا يكون الأمر ترتيبًا، بل الخطوة التالية.",
  },
  formTitle: {
    de: "Ergebnis besprechen",
    tr: "Sonucu konuşalım",
    en: "Discuss the result",
    ar: "مناقشة النتيجة",
  },
  formHeadline: {
    de: "Zwanzig Minuten auf Ihre Antworten.",
    tr: "Yanıtlarınız üzerine yirmi dakika.",
    en: "Twenty minutes based on your answers.",
    ar: "عشرون دقيقة مبنية على إجاباتكم.",
  },
  formLead: {
    de: "Wenn Sie wollen, sehen wir uns die Antworten gemeinsam an — zwanzig Minuten, kostenlos, ohne Verpflichtung. Ihre Antworten kommen mit.",
    tr: "İsterseniz yanıtlara birlikte bakalım — yirmi dakika, ücretsiz, yükümlülük yok. Yanıtlarınız da gelir.",
    en: "If you like, we can go through the answers together — twenty minutes, free, no obligation. Your answers come along.",
    ar: "إن رغبتم نراجع الإجابات معًا — عشرون دقيقة، مجانًا، دون التزام. وإجاباتكم تأتي معها.",
  },
  nameLabel: { de: "Name", tr: "Ad", en: "Name", ar: "الاسم" },
  businessLabel: { de: "Betrieb", tr: "İşletme", en: "Business", ar: "المنشأة" },
  emailLabel: { de: "E-Mail", tr: "E-posta", en: "Email", ar: "البريد الإلكتروني" },
  phoneLabel: { de: "Telefon", tr: "Telefon", en: "Phone", ar: "الهاتف" },
  submit: { de: "Ergebnis senden", tr: "Sonucu gönder", en: "Send the result", ar: "إرسال النتيجة" },
  sending: { de: "Wird gesendet …", tr: "Gönderiliyor …", en: "Sending …", ar: "جارٍ الإرسال …" },
  sentTitle: { de: "Angekommen.", tr: "Ulaştı.", en: "Received.", ar: "وصل." },
  sentBody: {
    de: "Ihre Antworten liegen bei uns. Wir melden uns innerhalb von zwei Werktagen — mit Ihrer Vorgangsnummer.",
    tr: "Yanıtlarınız bize ulaştı. İki iş günü içinde dönüş yaparız — işlem numaranızla birlikte.",
    en: "Your answers have reached us. We will be in touch within two working days — with your reference number.",
    ar: "إجاباتكم وصلتنا. سنتواصل معكم خلال يومَي عمل — مع رقم معاملتكم.",
  },
  referenceLabel: { de: "Ihre Vorgangsnummer", tr: "İşlem numaranız", en: "Your reference number", ar: "رقم معاملتكم" },
} as const
