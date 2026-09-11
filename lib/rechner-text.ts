/*
 * ===========================================================================
 * DER AUFWANDSRECHNER — DIE WORTE
 * ===========================================================================
 *
 * PHASE 3 · COMMERCIAL COMPLETION, 11.09.2026.
 *
 * Die Rechnung steht in `lib/wirtschaftlichkeit.ts`. Hier stehen nur die
 * Woerter — und die sind bei einem Rechner die haelfte der Wahrheit: Ob eine
 * Zahl als Modellrechnung oder als Zusage gelesen wird, entscheidet sich am
 * Satz daneben, nicht an der Zahl.
 *
 * Drei Sprachregeln, die hier durchgehalten werden:
 *
 *   1 · „Auf Basis Ihrer Eingaben ergibt sich rechnerisch …" — nie
 *       „Sie sparen …". Das eine ist eine Division, das andere ein
 *       Versprechen.
 *   2 · Der Stundensatz heisst „interner Kostenansatz", nicht „Lohn". Wer
 *       den Bruttolohn einsetzt, rechnet zu niedrig; das Feld sagt das.
 *   3 · Keine Beispielwerte in den Feldern. Ein vorbelegter Rechner zeigt
 *       beim ersten Blick ein Ergebnis, das niemand eingegeben hat — und
 *       genau so entstehen Zahlen, die sich niemand zuschreiben laesst.
 */
import type { Localized } from "@/lib/site-data"

export const rechnerText = {
  eyebrow: { de: "Werkzeug", tr: "Araç", en: "Tool", ar: "أداة" } satisfies Localized,
  /*
   * Der Name des Werkzeugs — getrennt von der Eyebrow. In der Fusszeile
   * stand zuerst „Werkzeug" unter der Ueberschrift „Werkzeuge"; das ist
   * keine Beschriftung, das ist ein Echo. Derselbe Name traegt die
   * unsichtbare Ueberschrift der Sektion.
   */
  name: {
    de: "Aufwandsrechner",
    tr: "Yük hesaplayıcı",
    en: "Effort calculator",
    ar: "حاسبة الجهد",
  } satisfies Localized,
  title: {
    de: "Was kostet der Schritt, der jedes Mal von Hand passiert?",
    tr: "Her seferinde elle yapılan adım ne kadara mal oluyor?",
    en: "What does the step that happens by hand every time cost?",
    ar: "كم تكلّف الخطوة التي تُنفَّذ يدويًا في كل مرة؟",
  } satisfies Localized,
  lead: {
    de: "Ein Rechner ohne Annahmen. Wir kennen Ihren Betrieb nicht und setzen deshalb keine Werte ein — Sie geben vier Zahlen an, und die Rechnung steht offen daneben.",
    tr: "Varsayımsız bir hesap makinesi. İşletmenizi bilmiyoruz, bu yüzden hiçbir değer koymuyoruz — dört rakam girersiniz, hesap yanında açıkça durur.",
    en: "A calculator without assumptions. We do not know your business and therefore fill in nothing — you give four numbers, and the arithmetic stands open beside them.",
    ar: "حاسبة بلا افتراضات. نحن لا نعرف منشأتكم ولذلك لا نملأ شيئًا — تُدخلون أربعة أرقام، والحساب مكشوف إلى جانبها.",
  } satisfies Localized,

  eingabenLabel: { de: "Ihre Zahlen", tr: "Rakamlarınız", en: "Your numbers", ar: "أرقامكم" } satisfies Localized,
  ergebnisLabel: { de: "Die Rechnung", tr: "Hesap", en: "The arithmetic", ar: "الحساب" } satisfies Localized,

  felder: {
    vorgaenge: {
      label: {
        de: "Wie oft kommt der Vorgang im Monat vor?",
        tr: "Bu süreç ayda kaç kez oluyor?",
        en: "How often does the case occur per month?",
        ar: "كم مرة تتكرر العملية في الشهر؟",
      },
      hilfe: {
        de: "Ein Vorgang ist eine Sache, die von vorn bis hinten durchläuft — ein Auftrag, eine Rechnung, eine Übergabe.",
        tr: "Bir süreç, baştan sona işleyen tek bir iştir — bir iş emri, bir fatura, bir devir.",
        en: "A case is one thing that runs from start to finish — a job, an invoice, a handover.",
        ar: "العملية شيء واحد يجري من البداية إلى النهاية — أمر عمل، أو فاتورة، أو تسليم.",
      },
      einheit: { de: "im Monat", tr: "ayda", en: "per month", ar: "شهريًا" },
    },
    minutenHeute: {
      label: {
        de: "Wie viele Minuten kostet er heute?",
        tr: "Bugün kaç dakika sürüyor?",
        en: "How many minutes does it cost today?",
        ar: "كم دقيقة يكلّف اليوم؟",
      },
      hilfe: {
        de: "Pro Vorgang, alle beteiligten Personen zusammen. Das Suchen und das Nachfragen zählen mit.",
        tr: "Süreç başına, ilgili tüm kişiler birlikte. Arama ve tekrar sorma da sayılır.",
        en: "Per case, all people involved together. Looking things up and asking again count too.",
        ar: "لكل عملية، بجميع الأشخاص المعنيين معًا. والبحث وإعادة السؤال يُحتسبان أيضًا.",
      },
      einheit: { de: "Minuten", tr: "dakika", en: "minutes", ar: "دقيقة" },
    },
    minutenNachher: {
      label: {
        de: "Wie viele Minuten blieben übrig?",
        tr: "Geriye kaç dakika kalırdı?",
        en: "How many minutes would be left?",
        ar: "كم دقيقة ستبقى؟",
      },
      hilfe: {
        de: "Ihre eigene Einschätzung, nicht unsere. Null ist erlaubt, wenn der Schritt ganz entfiele — und mehr als heute ist auch erlaubt.",
        tr: "Bizim değil, sizin kendi tahmininiz. Adım tamamen kalkacaksa sıfır olabilir — bugünkünden fazla da olabilir.",
        en: "Your own estimate, not ours. Zero is allowed if the step would disappear entirely — and more than today is allowed too.",
        ar: "تقديركم أنتم، لا تقديرنا. والصفر مسموح إن كانت الخطوة ستختفي تمامًا — وأكثر من اليوم مسموح أيضًا.",
      },
      einheit: { de: "Minuten", tr: "dakika", en: "minutes", ar: "دقيقة" },
    },
    stundensatz: {
      label: {
        de: "Was kostet eine Arbeitsstunde intern?",
        tr: "Bir iş saati içeride ne kadara mal oluyor?",
        en: "What does an hour of work cost internally?",
        ar: "كم تكلّف ساعة العمل داخليًا؟",
      },
      hilfe: {
        de: "Interner Kostenansatz, nicht der Bruttolohn — Lohn plus Nebenkosten plus Arbeitsplatz. Wer nur den Lohn einsetzt, rechnet zu niedrig.",
        tr: "Brüt maaş değil, içsel maliyet yaklaşımı — maaş artı yan maliyetler artı iş yeri. Yalnızca maaşı koyan düşük hesaplar.",
        en: "Internal cost basis, not gross pay — pay plus overheads plus workplace. Anyone using pay alone is calculating too low.",
        ar: "أساس التكلفة الداخلية لا الأجر الإجمالي — الأجر زائد الأعباء زائد مكان العمل. ومن يضع الأجر وحده يحسب أقل من الواقع.",
      },
      einheit: { de: "€ je Stunde", tr: "€ / saat", en: "€ per hour", ar: "€ للساعة" },
    },
    investition: {
      label: {
        de: "Was dürfte die Lösung einmalig kosten?",
        tr: "Çözüm tek seferlik ne kadar olabilir?",
        en: "What could the solution cost as a one-off?",
        ar: "كم يمكن أن تكلّف الحلول مرة واحدة؟",
      },
      hilfe: {
        de: "Optional. Eine Zahl, die Sie selbst setzen — wir nennen für Systemprojekte keine, weil es keine Reihe abgeschlossener Projekte gibt, aus der sich eine ableiten ließe.",
        tr: "İsteğe bağlı. Kendi koyduğunuz bir rakam — sistem projeleri için biz rakam vermiyoruz, çünkü türetilebilecek tamamlanmış proje dizisi yok.",
        en: "Optional. A number you set yourself — we name none for system projects, because there is no series of completed projects from which to derive one.",
        ar: "اختياري. رقم تضعونه أنتم — نحن لا نذكر رقمًا لمشاريع الأنظمة، لأنه ليست هناك سلسلة مشاريع مكتملة يُشتقّ منها.",
      },
      einheit: { de: "€ einmalig", tr: "€ tek seferlik", en: "€ one-off", ar: "€ مرة واحدة" },
    },
  },

  leer: {
    de: "Sobald die ersten vier Felder stehen, erscheint hier die Rechnung. Vorher steht hier nichts — ein vorbelegtes Ergebnis wäre unsere Zahl und nicht Ihre.",
    tr: "İlk dört alan dolduğunda hesap burada belirir. Öncesinde burada bir şey yok — hazır bir sonuç bizim rakamımız olurdu, sizin değil.",
    en: "As soon as the first four fields are filled, the arithmetic appears here. Before that, nothing does — a pre-filled result would be our number, not yours.",
    ar: "بمجرد ملء الحقول الأربعة الأولى تظهر هنا نتيجة الحساب. وقبل ذلك لا شيء — فالنتيجة المُعبّأة سلفًا تكون رقمنا لا رقمكم.",
  } satisfies Localized,

  zeilen: {
    heute: { de: "Aufwand heute", tr: "Bugünkü yük", en: "Effort today", ar: "الجهد اليوم" },
    nachher: { de: "Aufwand danach", tr: "Sonraki yük", en: "Effort afterwards", ar: "الجهد بعدها" },
    differenzZeit: { de: "Unterschied", tr: "Fark", en: "Difference", ar: "الفرق" },
    differenzGeld: { de: "Rechnerisch je Monat", tr: "Hesaben aylık", en: "Arithmetically per month", ar: "حسابيًا شهريًا" },
    amortisation: { de: "Rechnerisch gedeckt nach", tr: "Hesaben karşılanma süresi", en: "Arithmetically covered after", ar: "يُغطّى حسابيًا بعد" },
    gegenprobe: {
      de: "Damit sich der Betrag in zwölf Monaten rechnet, müsste der Vorgang monatlich einsparen",
      tr: "Tutarın on iki ayda karşılanması için sürecin aylık kazandırması gereken",
      en: "For the amount to pay for itself in twelve months, the case would have to save monthly",
      ar: "لكي يغطّي المبلغ نفسه في اثني عشر شهرًا، ينبغي أن توفّر العملية شهريًا",
    },
  } as Record<string, Localized>,

  einheiten: {
    stunden: { de: "Stunden im Monat", tr: "saat / ay", en: "hours per month", ar: "ساعة شهريًا" },
    monate: { de: "Monaten", tr: "ay", en: "months", ar: "شهرًا" },
  } as Record<string, Localized>,

  richtung: {
    ersparnis: {
      de: "Die Rechnung geht nach unten: Der Vorgang würde weniger Zeit kosten als heute.",
      tr: "Hesap aşağı gidiyor: Süreç bugünkünden az zaman alırdı.",
      en: "The arithmetic points down: the case would cost less time than today.",
      ar: "الحساب يميل إلى الانخفاض: ستكلّف العملية وقتًا أقل من اليوم.",
    },
    neutral: {
      de: "Kein Unterschied. Mit diesen Werten ändert sich der Aufwand nicht — dann lohnt sich an dieser Stelle auch kein Projekt.",
      tr: "Fark yok. Bu değerlerle yük değişmez — o hâlde burada bir proje de değmez.",
      en: "No difference. With these values the effort does not change — then no project is worth it at this point either.",
      ar: "لا فرق. بهذه القيم لا يتغير الجهد — وعندها لا يستحق أي مشروع هنا.",
    },
    mehraufwand: {
      de: "Die Rechnung geht nach oben: Mit diesen Werten würde der Vorgang mehr kosten als heute. Das ist kein Fehler des Rechners — es ist das Ergebnis Ihrer Eingabe.",
      tr: "Hesap yukarı gidiyor: Bu değerlerle süreç bugünkünden fazlaya mal olurdu. Bu hesap makinesinin hatası değil — girdinizin sonucudur.",
      en: "The arithmetic points up: with these values the case would cost more than today. That is not a fault of the calculator — it is the result of your input.",
      ar: "الحساب يميل إلى الارتفاع: بهذه القيم ستكلّف العملية أكثر من اليوم. وهذا ليس خطأ الحاسبة — بل نتيجة ما أدخلتم.",
    },
  } as Record<string, Localized>,

  formelLabel: {
    de: "Die Formel, offen",
    tr: "Formül, açıkça",
    en: "The formula, in the open",
    ar: "الصيغة، مكشوفة",
  } satisfies Localized,
  formel: [
    {
      de: "Stunden heute = Vorgänge × Minuten heute ÷ 60",
      tr: "Bugünkü saat = Süreç sayısı × bugünkü dakika ÷ 60",
      en: "Hours today = cases × minutes today ÷ 60",
      ar: "ساعات اليوم = عدد العمليات × دقائق اليوم ÷ 60",
    },
    {
      de: "Stunden danach = Vorgänge × Minuten danach ÷ 60",
      tr: "Sonraki saat = Süreç sayısı × sonraki dakika ÷ 60",
      en: "Hours afterwards = cases × minutes afterwards ÷ 60",
      ar: "ساعات ما بعد = عدد العمليات × دقائق ما بعد ÷ 60",
    },
    {
      de: "Unterschied in Euro = (Stunden heute − Stunden danach) × Kostenansatz",
      tr: "Euro cinsinden fark = (bugünkü saat − sonraki saat) × maliyet yaklaşımı",
      en: "Difference in euros = (hours today − hours afterwards) × cost basis",
      ar: "الفرق باليورو = (ساعات اليوم − ساعات ما بعد) × أساس التكلفة",
    },
    {
      de: "Gedeckt nach = Investition ÷ Unterschied in Euro",
      tr: "Karşılanma süresi = Yatırım ÷ Euro cinsinden fark",
      en: "Covered after = investment ÷ difference in euros",
      ar: "يُغطّى بعد = الاستثمار ÷ الفرق باليورو",
    },
  ] satisfies Localized[],

  grenzeLabel: {
    de: "Was diese Rechnung nicht kann",
    tr: "Bu hesabın yapamadığı",
    en: "What this arithmetic cannot do",
    ar: "ما لا يستطيعه هذا الحساب",
  } satisfies Localized,
  grenze: {
    de: "Eine Modellrechnung auf Basis Ihrer Eingaben — keine Zusage und keine Prognose. Nicht enthalten sind Einführung und Umgewöhnung, Sonderfälle, laufende Softwarekosten und alles, was sich im Betrieb erst zeigt. Umsatzwirkung und Fehlerkosten rechnen wir bewusst nicht ein: Beide wären geraten.",
    tr: "Girdilerinize dayalı bir model hesabıdır — taahhüt ya da tahmin değildir. Devreye alma ve alışma, istisnai durumlar, süregelen yazılım maliyetleri ve ancak işletimde ortaya çıkan her şey dahil değildir. Ciro etkisi ve hata maliyetlerini bilerek hesaba katmıyoruz: ikisi de tahmin olurdu.",
    en: "A model calculation based on your inputs — not a promise and not a forecast. It excludes rollout and getting used to it, special cases, ongoing software costs and everything that only shows up in operation. Revenue effects and error costs we deliberately leave out: both would be guesses.",
    ar: "حساب نموذجي مبني على مدخلاتكم — لا تعهّد ولا تنبؤ. لا يشمل الإطلاق والتعوّد، ولا الحالات الخاصة، ولا تكاليف البرمجيات الجارية، ولا كل ما يظهر في التشغيل فقط. أما أثر الإيرادات وتكاليف الأخطاء فنتركهما عمدًا: كلاهما سيكون تخمينًا.",
  } satisfies Localized,
  datenschutzHinweis: {
    de: "Diese Zahlen bleiben in Ihrem Browser. Sie werden nicht gespeichert, nicht gesendet und nicht gemessen.",
    tr: "Bu rakamlar tarayıcınızda kalır. Saklanmaz, gönderilmez ve ölçülmez.",
    en: "These numbers stay in your browser. They are not stored, not sent and not measured.",
    ar: "تبقى هذه الأرقام في متصفحكم. لا تُحفظ ولا تُرسَل ولا تُقاس.",
  } satisfies Localized,

  /* Der Aufruf sagt, was passiert — nicht noch einmal, worum es geht. */
  weiterCta: {
    de: "Systemgespräch anfragen",
    tr: "Sistem görüşmesi talep edin",
    en: "Request a system conversation",
    ar: "اطلبوا محادثة نظام",
  } satisfies Localized,
  weiterLabel: {
    de: "Wenn die Größenordnung passt",
    tr: "Büyüklük uyuyorsa",
    en: "If the order of magnitude fits",
    ar: "إن كان الحجم مناسبًا",
  } satisfies Localized,
  weiter: {
    de: "Dann ist der nächste Schritt kein Angebot, sondern ein Blick auf den Betrieb. Im Systemgespräch wird der Umfang geschnitten; der Festpreis kommt danach.",
    tr: "O zaman sıradaki adım bir teklif değil, işletmeye bir bakıştır. Sistem görüşmesinde kapsam belirlenir; sabit fiyat sonra gelir.",
    en: "Then the next step is not an offer but a look at the business. In the system conversation the scope is cut; the fixed price comes afterwards.",
    ar: "عندها تكون الخطوة التالية ليست عرضًا بل نظرة إلى المنشأة. في محادثة النظام يُحدَّد النطاق؛ والسعر الثابت يأتي بعده.",
  } satisfies Localized,

  metaTitle: {
    de: "Aufwandsrechner — was ein manueller Schritt im Monat kostet",
    tr: "Yük hesaplayıcı — elle yapılan bir adım ayda ne kadar tutuyor",
    en: "Effort calculator — what a manual step costs per month",
    ar: "حاسبة الجهد — كم تكلّف خطوة يدوية شهريًا",
  } satisfies Localized,
  metaDescription: {
    de: "Rechnen Sie mit Ihren eigenen Zahlen aus, was ein wiederkehrender manueller Schritt im Monat an Zeit und internen Kosten bindet. Offene Formel, keine Voreinstellung, keine Speicherung.",
    tr: "Tekrar eden elle bir adımın ayda ne kadar zaman ve içsel maliyet bağladığını kendi rakamlarınızla hesaplayın. Açık formül, ön ayar yok, kayıt yok.",
    en: "Work out with your own numbers what a recurring manual step ties up per month in time and internal cost. Open formula, no presets, no storage.",
    ar: "احسبوا بأرقامكم أنتم ما تستهلكه خطوة يدوية متكررة شهريًا من وقت وتكلفة داخلية. صيغة مكشوفة، دون قيم مسبقة، ودون حفظ.",
  } satisfies Localized,
} as const
