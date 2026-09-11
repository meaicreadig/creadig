/*
 * ===========================================================================
 * fibero — DAS BELEGREGISTER ZUM EIGENEN BETRIEBSFALL
 * ===========================================================================
 *
 * PHASE 3 · COMMERCIAL COMPLETION, 11.09.2026.
 *
 * -------------------------------------------------------------------------
 * WAS fibero IST — UND WAS ES AUSDRUECKLICH NICHT IST
 *
 * fibero ist creaDIGs EIGENER Betrieb. Der Glasfaser-Arm des Hauses arbeitet
 * damit taeglich: eigenes Team, Subunternehmer, Auftragsabwicklung,
 * Rechnungen in beide Richtungen, Belege, Steuerauswertung.
 *
 * Das macht fibero zu einem BETRIEBSBELEG und nicht zu einem Kundenfall.
 * Diese Unterscheidung ist keine Formalie: Ein Kundenfall beweist, dass
 * jemand anderes creaDIG vertraut hat. Ein Betriebsbeleg beweist, dass
 * creaDIG einen realen betrieblichen Ablauf verstanden und in ein System
 * gebracht hat. Das Zweite ist weniger als das Erste — und es ist deutlich
 * mehr als ein Screenshot.
 *
 * `docs/ops/proof-kinds.md` kennt genau diese drei Arten. fibero ist
 * „Eigenes Produkt". Es wird nirgends als Kundenprojekt, Referenz oder
 * Erfolgsgeschichte gefuehrt, und die oeffentliche Zahl freigegebener
 * Kundenarbeiten bleibt null.
 *
 * -------------------------------------------------------------------------
 * WOHER DIE AUSSAGEN STAMMEN
 *
 * Gelesen am 11.09.2026 im fibero-Repository (`~/Documents/fibero`, aktiv,
 * letzte Tagesmeldung im Verlauf): `README.md`, `lib/db/schema.ts`,
 * `app/api/*`. Keine Aussage hier stammt aus einer Annahme darueber, was ein
 * solches System „normalerweise" tut.
 *
 * -------------------------------------------------------------------------
 * DIE REGEL, DIE DIESES REGISTER DURCHSETZT
 *
 * Jede Aussage traegt, ob sie GEMESSEN ist. Keine einzige ist es.
 *
 * Das ist kein Versaeumnis dieses Laufs, sondern der ehrliche Stand: Es gibt
 * keine Aufzeichnung darueber, wie lange dieselben Vorgaenge VOR fibero
 * gedauert haben. Ohne Vorher-Messung ist jede Ersparnis-Angabe eine
 * Ruecksrechnung — „frueher zwoelf Schritte, heute vier" waere erfunden,
 * auch wenn es sich plausibel anfuehlt.
 *
 * Was stattdessen belegbar ist: die STRUKTUR. Dass ein Datensatz einmal
 * entsteht und danach in Abrechnung, Beleglauf und Steuerauswertung
 * weiterlaeuft, ist im Schema nachlesbar und nicht Geschmackssache.
 *
 * Und was messbar WAERE, steht als Messpunkt dabei — nicht als Ergebnis,
 * sondern als die Angabe, welche Felder das System dafuer bereits fuehrt.
 */

/** Woher eine Aussage stammt. Kein Eintrag ohne Fundstelle. */
export type BelegQuelle = "schema" | "api" | "readme"

export type FiberoAussage = {
  key: string
  quelle: BelegQuelle
  /** Die Datei im fibero-Repository, in der es nachlesbar ist. */
  fundstelle: string
  /**
   * Ist die Aussage GEMESSEN — also durch eine Vorher/Nachher-Erhebung
   * belegt? Bei allen heute: nein. Die Spalte existiert trotzdem, damit
   * sichtbar bleibt, dass sie leer ist.
   */
  gemessen: false
  /** Was objektiv zaehlbar ist, wo etwas zaehlbar ist. */
  zahl: number | null
}

/*
 * Die neun strukturellen Aussagen. Jede ist im Schema oder in den Routen
 * nachlesbar; keine beschreibt eine Wirkung.
 */
export const fiberoAussagen: FiberoAussage[] = [
  { key: "objekt", quelle: "schema", fundstelle: "lib/db/schema.ts · work_objects", gemessen: false, zahl: null },
  { key: "herkunft", quelle: "schema", fundstelle: "lib/db/schema.ts · work_objects.sourceType", gemessen: false, zahl: 3 },
  { key: "fakten", quelle: "schema", fundstelle: "lib/db/schema.ts · work_objects (a,g,f,v,s,b,u,maw)", gemessen: false, zahl: 8 },
  { key: "pruefstand", quelle: "schema", fundstelle: "lib/db/schema.ts · work_objects.reviewStatus", gemessen: false, zahl: 2 },
  { key: "abrechnung", quelle: "api", fundstelle: "app/api/check-invoice · app/api/invoice-pdf", gemessen: false, zahl: null },
  { key: "belege", quelle: "api", fundstelle: "app/api/belege-mail-sync · app/api/extract-receipt", gemessen: false, zahl: null },
  { key: "steuer", quelle: "api", fundstelle: "app/api/belege-steuerberater-pack", gemessen: false, zahl: null },
  { key: "protokoll", quelle: "schema", fundstelle: "lib/db/schema.ts · audit_log", gemessen: false, zahl: null },
  { key: "fahrtenbuch", quelle: "api", fundstelle: "app/api/fahrtenbuch-nachweise · fahrtenbuch-pdf", gemessen: false, zahl: null },
]

/**
 * Die Messpunkte. NICHT „so viel wurde gespart", sondern: Diese Felder fuehrt
 * das System bereits, also laesst sich daran messen. Genau das ist der
 * Unterschied zwischen einer Methode und einem Werbeversprechen.
 */
export type Messpunkt = {
  key: string
  /** Das Feld, aus dem sich der Wert ergibt. */
  feld: string
}

export const fiberoMesspunkte: Messpunkt[] = [
  { key: "vorgaenge", feld: "work_objects · Zeilen je Zeitraum" },
  { key: "herkunft", feld: "work_objects.sourceType" },
  { key: "offen", feld: "work_objects.reviewStatus = open" },
  { key: "durchlauf", feld: "work_objects.timeline (created · visited · completed)" },
  { key: "belegweg", feld: "email_import_log" },
]

/** Die Grenzen. Was fibero nicht tut, steht genauso oeffentlich wie was es tut. */
export const fiberoGrenzen = ["kein-produkt", "keine-adresse", "kein-kundenfall", "keine-planung"] as const

/**
 * Harte Zusicherung fuer das Pruefskript: Solange keine Aussage `gemessen`
 * ist, darf auf der Seite keine Ersparnis-, Prozent- oder Zeitgewinnzahl
 * stehen. Diese Konstante ist der Schalter, den ein spaeterer Lauf umlegt —
 * erst nach einer echten Erhebung.
 */
export const fiberoHatMessung = fiberoAussagen.some((a) => a.gemessen)

/* =========================================================================
 * DER TEXT DES BETRIEBSFALLS
 *
 * Jeder Satz unten hat oben im Register eine Fundstelle. Wer einen Satz
 * aendert, ohne die Fundstelle zu aendern, faellt beim Pruefskript auf.
 * ========================================================================= */
import type { Localized } from "@/lib/site-data"

export const fiberoText = {
  eyebrow: {
    de: "Eigener Betrieb, kein Kundenfall",
    tr: "Kendi işletimimiz, müşteri vakası değil",
    en: "Our own operation, not a customer case",
    ar: "تشغيلنا الخاص، لا حالة عميل",
  } satisfies Localized,
  title: {
    de: "Woran creaDIG selbst arbeitet.",
    tr: "creaDIG'in kendi üzerinde çalıştığı şey.",
    en: "What creaDIG works with itself.",
    ar: "ما تعمل به creaDIG نفسها.",
  } satisfies Localized,
  lead: {
    de: "fibero wird hier nicht verkauft und ist kein Kundenprojekt. Es ist der Glasfaser-Arm von creaDIG — eigenes Team, Subunternehmer, Aufträge, Rechnungen in beide Richtungen. Was unten steht, ist im Quelltext dieses Systems nachlesbar; gelesen am 11. September 2026.",
    tr: "fibero burada satılmıyor ve bir müşteri projesi değil. creaDIG'in fiber optik kolu: kendi ekibi, taşeronları, iş emirleri ve iki yöne giden faturaları. Aşağıdakiler bu sistemin kaynak kodunda okunabilir; 11 Eylül 2026'da okundu.",
    en: "fibero is not sold here and is not a customer project. It is creaDIG's fibre-optic arm — our own crew, subcontractors, jobs, invoices in both directions. What follows is readable in this system's source; read on 11 September 2026.",
    ar: "fibero لا يُباع هنا وليس مشروع عميل. إنه ذراع الألياف الضوئية لدى creaDIG — فريقنا ومقاولوه وأوامر العمل والفواتير في الاتجاهين. وما يلي مقروء في شيفرة هذا النظام؛ قُرئ في 11 سبتمبر 2026.",
  } satisfies Localized,

  lageLabel: { de: "Der Vorgang", tr: "Süreç", en: "The process", ar: "العملية" } satisfies Localized,
  lage: {
    de: "Glasfaser-Ausbau heißt: Aufträge an Adressen. Ein Team oder ein Subunternehmer fährt hin, kundschaftet aus, bereitet vor, führt aus — oder bricht ab. Daraus entstehen eine Ausgangsrechnung an den Auftraggeber, Eingangsrechnungen der Subunternehmer, Belege, Fahrtkilometer und am Ende eine Auswertung für den Steuerberater.",
    tr: "Fiber optik yapımı şu demek: adreslere iş emirleri. Bir ekip ya da taşeron gider, keşif yapar, hazırlar, uygular — ya da işi bırakır. Bundan işverene giden bir satış faturası, taşeronlardan gelen alış faturaları, belgeler, yol kilometreleri ve sonunda mali müşavir için bir değerlendirme doğar.",
    en: "Fibre-optic rollout means jobs at addresses. A crew or a subcontractor drives out, surveys, prepares, executes — or aborts. Out of that come an outgoing invoice to the client, incoming invoices from subcontractors, receipts, mileage and, at the end, a report for the tax adviser.",
    ar: "مدُّ الألياف الضوئية يعني أوامر عمل على عناوين. يذهب فريق أو مقاول، فيستكشف ويُجهّز وينفّذ — أو يتوقف. وينشأ عن ذلك فاتورة صادرة إلى العميل، وفواتير واردة من المقاولين، وإيصالات، وكيلومترات سفر، وفي النهاية تقرير للمحاسب الضريبي.",
  } satisfies Localized,

  reibungLabel: {
    de: "Woran das System ansetzt",
    tr: "Sistemin tutunduğu noktalar",
    en: "Where the system takes hold",
    ar: "أين يمسك النظام",
  } satisfies Localized,
  reibungNote: {
    de: "Kein Vorher-Nachher. Das beschreibt den Vorgang, den fibero abbildet — nicht einen gemessenen früheren Zustand.",
    tr: "Öncesi-sonrası değil. Bu, fibero'nun karşıladığı süreci tarif eder — ölçülmüş bir eski durumu değil.",
    en: "Not a before-and-after. This describes the process fibero addresses — not a measured earlier state.",
    ar: "ليست مقارنة قبل وبعد. هذا وصف للعملية التي يعالجها fibero — لا لحالة سابقة مقيسة.",
  } satisfies Localized,
  reibung: [
    {
      de: "Dieselben Auftragsdaten erreichen den Betrieb in drei Formen: als PDF-Rechnung eines Subunternehmers, als Excel-Liste, oder von Hand.",
      tr: "Aynı iş emri verileri işletmeye üç biçimde ulaşır: taşeronun PDF faturası, Excel listesi ya da elle.",
      en: "The same job data reaches the business in three forms: as a subcontractor's PDF invoice, as an Excel list, or by hand.",
      ar: "تصل بيانات أوامر العمل نفسها إلى المنشأة بثلاث صور: فاتورة PDF من مقاول، أو قائمة Excel، أو إدخالًا يدويًا.",
    },
    {
      de: "Die Auftragsart entscheidet über die Abrechnung — Auskundung, Erstauftrag, Folgeauftrag, Vorbereitung, Storno, Bulk, Abbruch, Mehraufwand. Als Freitext ist sie nicht rechenbar.",
      tr: "İş türü hakedişi belirler — keşif, ilk iş, takip işi, hazırlık, iptal, toplu iş, saha durdurma, mehraufwand. Serbest metin olarak hesaplanamaz.",
      en: "The job type decides the billing — survey, first job, follow-up, preparation, cancellation, bulk, on-site abort, extra effort. As free text it cannot be computed.",
      ar: "نوع أمر العمل يحدّد الفوترة — استكشاف، أمر أول، أمر تابع، تحضير، إلغاء، دفعة، توقّف ميداني، جهد إضافي. وبصيغة نص حر لا يمكن حسابه.",
    },
    {
      de: "Ein Abbruch vor Ort ist kein Storno. Wer beides gleich behandelt, rechnet falsch ab.",
      tr: "Sahada durdurma bir iptal değildir. İkisini aynı sayan yanlış hakediş yapar.",
      en: "An on-site abort is not a cancellation. Treat the two alike and you bill wrongly.",
      ar: "التوقّف في الموقع ليس إلغاءً. ومن يعاملهما سواءً يُفوتر خطأً.",
    },
    {
      de: "Belege kommen als Kassenbon, als Rechnung und per E-Mail — und müssen am Ende in einer Auswertung liegen, die ein Steuerberater lesen kann.",
      tr: "Belgeler fiş, fatura ve e-posta olarak gelir — ve sonunda mali müşavirin okuyabileceği bir değerlendirmede durmalıdır.",
      en: "Receipts arrive as till slips, as invoices and by email — and have to end up in a report a tax adviser can read.",
      ar: "تصل الإيصالات كقسائم صندوق وفواتير وعبر البريد — ويجب أن تنتهي في تقرير يقرؤه المحاسب الضريبي.",
    },
  ] satisfies Localized[],

  antwortLabel: {
    de: "Was das System daraus macht",
    tr: "Sistemin bundan çıkardığı",
    en: "What the system makes of it",
    ar: "ما الذي يصنعه النظام من ذلك",
  } satisfies Localized,
  antwort: [
    {
      de: "Ein Objekt ist der eine Datensatz: Adresse, Datum, Team, Monteur. Alles andere hängt daran.",
      tr: "Bir obje tek kayıttır: adres, tarih, ekip, montör. Diğer her şey ona bağlıdır.",
      en: "An object is the one record: address, date, crew, fitter. Everything else hangs off it.",
      ar: "الكائن هو السجل الواحد: العنوان والتاريخ والفريق والفني. وكل شيء آخر معلَّق به.",
    },
    {
      de: "Die drei Herkünfte laufen in denselben Datensatz — mit Vermerk, woher er kam und aus welcher Quelle.",
      tr: "Üç köken aynı kayda akar — nereden ve hangi kaynaktan geldiği kaydıyla.",
      en: "The three origins run into the same record — with a note of where it came from and from which source.",
      ar: "تصبّ المصادر الثلاثة في السجل نفسه — مع بيان من أين أتى وعن أي مصدر.",
    },
    {
      de: "Die Auftragsart steht als acht gezählte Felder, nicht als Text. Mehraufwand gilt nur für das eigene Team; ein Abbruch ist nie abrechenbar.",
      tr: "İş türü sekiz sayılı alan olarak durur, metin olarak değil. Mehraufwand yalnızca kendi ekibimiz için geçerlidir; saha durdurma asla hakedişe girmez.",
      en: "The job type sits in eight counted fields, not in text. Extra effort applies only to our own crew; an abort is never billable.",
      ar: "نوع أمر العمل قائم في ثمانية حقول معدودة، لا في نص. والجهد الإضافي يسري على فريقنا وحده؛ والتوقّف لا يُفوتر أبدًا.",
    },
    {
      de: "Jeder importierte Fakt hat einen Prüfstand: offen oder geprüft. Was die maschinelle Auslesung aus einer PDF gezogen hat, gilt erst danach.",
      tr: "İçe aktarılan her olgunun bir denetim durumu vardır: açık ya da denetlenmiş. Makinenin PDF'ten çektiği ancak ondan sonra geçerlidir.",
      en: "Every imported fact carries a review state: open or reviewed. What the machine pulled out of a PDF counts only afterwards.",
      ar: "لكل واقعة مستوردة حالة مراجعة: مفتوحة أو مُراجَعة. وما استخرجته الآلة من ملف PDF لا يُعتدّ به إلا بعدها.",
    },
    {
      de: "Aus denselben Fakten entstehen die Ausgangsrechnung und der Abgleich der Eingangsrechnungen.",
      tr: "Aynı olgulardan hem satış faturası hem de alış faturalarının mutabakatı doğar.",
      en: "From the same facts come the outgoing invoice and the reconciliation of incoming invoices.",
      ar: "من الوقائع نفسها تنشأ الفاتورة الصادرة ومطابقة الفواتير الواردة.",
    },
    {
      de: "Belege werden aus dem Postfach eingesammelt, ausgelesen und kategorisiert — mit Vermerk, was abzugsfähig ist.",
      tr: "Belgeler posta kutusundan toplanır, okunur ve kategorilenir — neyin gider yazılabileceği kaydıyla.",
      en: "Receipts are collected from the mailbox, read out and categorised — with a note of what is deductible.",
      ar: "تُجمَع الإيصالات من صندوق البريد وتُقرأ وتُصنَّف — مع بيان ما هو قابل للخصم.",
    },
    {
      de: "Am Ende steht ein Paket für den Steuerberater und ein DATEV-Export aus demselben Bestand.",
      tr: "Sonunda mali müşavir için bir paket ve aynı veriden bir DATEV dışa aktarımı durur.",
      en: "At the end there is a pack for the tax adviser and a DATEV export from the same stock.",
      ar: "وفي النهاية حزمة للمحاسب الضريبي وتصدير DATEV من الرصيد نفسه.",
    },
    {
      de: "Wer was geändert hat, steht im Prüfprotokoll.",
      tr: "Kimin neyi değiştirdiği denetim kaydında durur.",
      en: "Who changed what is in the audit log.",
      ar: "ومن غيَّر ماذا مذكور في سجل التدقيق.",
    },
  ] satisfies Localized[],

  messenLabel: {
    de: "Woran sich das messen lässt",
    tr: "Bunun neyle ölçülebileceği",
    en: "What this can be measured by",
    ar: "بماذا يمكن قياس ذلك",
  } satisfies Localized,
  messenNote: {
    de: "Diese Felder führt das System bereits. Sie sind die Messmethode, nicht ein Ergebnis: Der Zustand vor fibero wurde nicht erhoben, deshalb steht hier keine Ersparnis.",
    tr: "Bu alanları sistem zaten tutuyor. Bunlar ölçüm yöntemidir, sonuç değil: fibero'dan önceki durum ölçülmedi, bu yüzden burada bir tasarruf yazmıyor.",
    en: "The system already keeps these fields. They are the measurement method, not a result: the state before fibero was never recorded, so no saving is stated here.",
    ar: "هذه الحقول يحفظها النظام فعلًا. وهي طريقة القياس لا نتيجته: فالحالة قبل fibero لم تُرصد، ولذلك لا يُذكر هنا أي توفير.",
  } satisfies Localized,
  messpunkte: {
    vorgaenge: {
      de: "Wie viele Objekte in einem Zeitraum entstanden sind",
      tr: "Bir dönemde kaç obje oluştuğu",
      en: "How many objects came about in a period",
      ar: "كم كائنًا نشأ في فترة",
    },
    herkunft: {
      de: "Wie viele davon aus PDF, Excel oder Handeingabe kamen",
      tr: "Bunların kaçının PDF, Excel ya da elle girildiği",
      en: "How many of them came from PDF, Excel or hand entry",
      ar: "كم منها جاء من PDF أو Excel أو إدخال يدوي",
    },
    offen: {
      de: "Wie viele Fakten noch ungeprüft sind",
      tr: "Kaç olgunun hâlâ denetlenmemiş olduğu",
      en: "How many facts are still unreviewed",
      ar: "كم واقعة ما زالت غير مُراجَعة",
    },
    durchlauf: {
      de: "Wie lange ein Objekt von der Anlage bis zum Abschluss braucht",
      tr: "Bir objenin açılıştan tamamlanmaya kadar ne kadar sürdüğü",
      en: "How long an object takes from creation to completion",
      ar: "كم يستغرق الكائن من الإنشاء إلى الإتمام",
    },
    belegweg: {
      de: "Wie viele Belege automatisch hereinkamen",
      tr: "Kaç belgenin otomatik olarak geldiği",
      en: "How many receipts arrived automatically",
      ar: "كم إيصالًا وصل تلقائيًا",
    },
  } as Record<string, Localized>,

  wirkungLabel: {
    de: "Was das belegt — und was nicht",
    tr: "Bunun kanıtladığı — ve kanıtlamadığı",
    en: "What this proves — and what it does not",
    ar: "ما يُثبته هذا — وما لا يُثبته",
  } satisfies Localized,
  wirkungBelegt: {
    de: "Belegt ist die Struktur: Ein Vorgang entsteht einmal und trägt danach Abrechnung, Beleglauf und Steuerauswertung. Das ist im Schema nachlesbar und keine Geschmacksfrage.",
    tr: "Kanıtlanan yapıdır: Bir süreç bir kez oluşur ve sonrasında hakedişi, belge akışını ve vergi değerlendirmesini taşır. Bu şemada okunabilir, zevk meselesi değildir.",
    en: "What is proven is the structure: a case comes about once and then carries billing, the receipt trail and the tax report. That is readable in the schema and not a matter of taste.",
    ar: "المُثبَت هو البنية: تنشأ الحالة مرة واحدة ثم تحمل بعدها الفوترة ومسار الإيصالات والتقرير الضريبي. وذلك مقروء في المخطط وليس مسألة ذوق.",
  } satisfies Localized,
  wirkungOffen: {
    de: "Nicht belegt ist eine Zeitersparnis. Es gibt keine Aufzeichnung darüber, wie lange dieselben Vorgänge vorher gedauert haben — ohne Vorher-Messung wäre jede Prozentzahl zurückgerechnet. Was ein solcher Effekt in Ihrem Betrieb wert wäre, rechnen Sie mit Ihren eigenen Zahlen.",
    tr: "Kanıtlanmayan bir zaman tasarrufudur. Aynı süreçlerin öncesinde ne kadar sürdüğüne dair bir kayıt yok — öncesi ölçüm olmadan her yüzde geriye dönük hesap olurdu. Böyle bir etkinin sizin işletmenizde ne değerde olacağını kendi rakamlarınızla hesaplayın.",
    en: "What is not proven is a time saving. There is no record of how long the same cases took before — without a before-measurement any percentage would be back-calculated. What such an effect would be worth in your business, you can work out with your own numbers.",
    ar: "وغير المُثبَت هو توفير الوقت. فلا سجل لكم استغرقت العمليات نفسها من قبل — ودون قياس سابق تكون أي نسبة مئوية حسابًا رجعيًا. أما قيمة أثرٍ كهذا في منشأتكم فاحسبوها بأرقامكم أنتم.",
  } satisfies Localized,

  rechnerCta: {
    de: "Mit eigenen Zahlen rechnen",
    tr: "Kendi rakamlarınızla hesaplayın",
    en: "Work it out with your own numbers",
    ar: "احسبوا بأرقامكم أنتم",
  } satisfies Localized,

  grenzenLabel: {
    de: "Was fibero nicht tut",
    tr: "fibero'nun yapmadıkları",
    en: "What fibero does not do",
    ar: "ما لا يفعله fibero",
  } satisfies Localized,
  grenzen: {
    "kein-produkt": {
      de: "Es wird nicht verkauft und hat keine Preisliste.",
      tr: "Satılmıyor ve fiyat listesi yok.",
      en: "It is not sold and has no price list.",
      ar: "لا يُباع وليست له قائمة أسعار.",
    },
    "keine-adresse": {
      de: "Es hat keine öffentliche Adresse — es läuft im eigenen Betrieb.",
      tr: "Kamuya açık bir adresi yok — kendi işletmemizde çalışıyor.",
      en: "It has no public address — it runs inside our own operation.",
      ar: "ليس له عنوان عام — يعمل داخل تشغيلنا الخاص.",
    },
    "kein-kundenfall": {
      de: "Es ist kein Kundenprojekt und kein Beleg dafür, dass ein Kunde zufrieden war. Freigegebene Kundenarbeit steht unter Arbeiten; heute liegt keine vor.",
      tr: "Bir müşteri projesi değil ve bir müşterinin memnun olduğunun kanıtı değil. Onaylı müşteri işi İşler altındadır; bugün yok.",
      en: "It is not a customer project and no evidence that a customer was satisfied. Released customer work is under Work; today there is none.",
      ar: "ليس مشروع عميل ولا دليلًا على رضا عميل. وأعمال العملاء المُصرَّح بها تحت الأعمال؛ ولا يوجد اليوم شيء منها.",
    },
    "keine-planung": {
      de: "Es plant keine Einsätze. Die Planung liegt in einem anderen System, gegen das fibero abgleicht.",
      tr: "Görev planlaması yapmaz. Planlama başka bir sistemdedir; fibero ona karşı mutabakat yapar.",
      en: "It does not plan deployments. Planning lives in another system, against which fibero reconciles.",
      ar: "لا يخطّط للمهمات. فالتخطيط في نظام آخر يُطابق fibero بيانَه معه.",
    },
  } as Record<string, Localized>,

  warumLabel: {
    de: "Warum das hier steht",
    tr: "Bunun burada olma nedeni",
    en: "Why this is here",
    ar: "لماذا هذا هنا",
  } satisfies Localized,
  warum: {
    de: "Weil es die Frage beantwortet, die vor jedem Systemprojekt steht: Versteht dieses Haus einen betrieblichen Ablauf weit genug, um ihn in Datenfelder zu übersetzen — einschließlich der Fälle, die man erst im Betrieb bemerkt? Ein Abbruch vor Ort, der kein Storno ist, steht in keinem Lastenheft. Er steht in diesem Schema.",
    tr: "Çünkü her sistem projesinin önündeki soruyu yanıtlar: Bu ev, işletmedeki bir akışı veri alanlarına çevirecek kadar anlıyor mu — ancak işletimde fark edilen durumlar dahil? Sahada durdurmanın iptal olmadığı hiçbir şartnamede yazmaz. Bu şemada yazar.",
    en: "Because it answers the question that stands before every system project: does this house understand an operational process far enough to translate it into data fields — including the cases you only notice in operation? An on-site abort that is not a cancellation appears in no specification document. It appears in this schema.",
    ar: "لأنه يجيب عن السؤال الذي يسبق كل مشروع نظام: هل يفهم هذا البيت مسارًا تشغيليًا فهمًا يكفي لترجمته إلى حقول بيانات — بما في ذلك الحالات التي لا تُلاحَظ إلا في التشغيل؟ إن توقّفًا ميدانيًا ليس إلغاءً لا يرد في أي كرّاسة مواصفات. إنه يرد في هذا المخطط.",
  } satisfies Localized,
} as const
