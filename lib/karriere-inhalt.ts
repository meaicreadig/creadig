import type { Localized } from "@/lib/site-data"

/*
 * ===========================================================================
 * KARRIERE — DER TEXT
 * ===========================================================================
 *
 * Getrennt von `lib/karriere.ts`: Dort steht, was WAHR ist (Zustand, Spur,
 * Sprache, Nachweis). Hier steht, wie es gesagt wird. Wer den Text aendert,
 * aendert keine Tatsache — und wer eine Tatsache aendert, muss die Datei
 * daneben anfassen.
 *
 * Vier Sprachen, gleiche Abschnitte, gleiche Aufzaehlungen. Keine Sprache
 * bekommt eine kuerzere Karriereseite als die andere.
 *
 * WAS HIER NICHT VORKOMMT — und zwar, weil es nicht existiert:
 * Bueroadresse, Buerofotos, Teamfotos, Mitarbeiterstimmen, Gehalt,
 * Zusatzleistungen, Anteile, Zusagen zum Startdatum, Zahl der Bewerbungen,
 * Hochschulkooperationen, Auszeichnungen.
 */

export type Punkt = { titel: Localized; text: Localized }

/* ── 01 · Der Anfang ─────────────────────────────────────────────────────── */

export const kopf = {
  eyebrow: {
    de: "Karriere · Istanbul 2027",
    tr: "Kariyer · İstanbul 2027",
    en: "Careers · Istanbul 2027",
    ar: "الوظائف · إسطنبول 2027",
  } as Localized,
  titel: {
    de: "Wir bauen das System hinter Betrieben. Jetzt bauen wir das Team dahinter.",
    tr: "İşletmelerin arkasındaki sistemi kuruyoruz. Şimdi o sistemin arkasındaki ekibi kuruyoruz.",
    en: "We build the system behind businesses. Now we are building the team behind that system.",
    ar: "نبني النظام الذي يقف خلف المنشآت. والآن نبني الفريق الذي يقف خلف ذلك النظام.",
  } as Localized,
  lead: {
    de: "creaDIG ist ein System-Haus in Osnabrück. 2027 soll in Istanbul das erste feste Team dazukommen — nicht als verlängerte Werkbank, sondern als die Hälfte, die baut und betreibt. Diese Seite beschreibt, was das heißt, und was heute noch nicht feststeht.",
    tr: "creaDIG, Osnabrück merkezli bir sistem evi. 2027'de İstanbul'da ilk kalıcı ekip kurulacak — uzatılmış tezgâh olarak değil, kuran ve işleten yarısı olarak. Bu sayfa bunun ne anlama geldiğini ve bugün neyin henüz belli olmadığını anlatıyor.",
    en: "creaDIG is a system house in Osnabrück. In 2027 the first permanent team is meant to join in Istanbul — not as an extended workbench, but as the half that builds and operates. This page describes what that means, and what is not settled yet.",
    ar: "‏creaDIG بيت أنظمة في أوسنابروك. في 2027 يُفترض أن ينضم أول فريق دائم في إسطنبول — لا كورشة ملحقة، بل كالنصف الذي يبني ويشغّل. تشرح هذه الصفحة ما يعنيه ذلك، وما لم يُحسم بعد.",
  } as Localized,
  /** Steht direkt unter dem Kopf, damit niemand erst scrollen muss. */
  wahrheitLabel: {
    de: "Stand heute",
    tr: "Bugünkü durum",
    en: "As of today",
    ar: "الوضع اليوم",
  } as Localized,
  wahrheit: {
    de: "Keine der beiden Spuren ist heute eine offene Stelle. Es gibt kein freigegebenes Budget, kein zugesagtes Startdatum und kein Büro in Istanbul. Was es gibt: die Absicht, 2027 anzufangen — und die Zeit, vorher die richtigen Leute kennenzulernen.",
    tr: "Bugün iki yolun da açık pozisyonu yok. Onaylanmış bütçe, taahhüt edilmiş başlangıç tarihi ve İstanbul'da ofis yok. Olan şu: 2027'de başlama niyeti — ve öncesinde doğru insanlarla tanışacak zaman.",
    en: "Neither track is an open position today. There is no approved budget, no promised start date and no office in Istanbul. What there is: the intention to start in 2027 — and the time to meet the right people first.",
    ar: "لا يمثّل أيٌّ من المسارين وظيفة مفتوحة اليوم. لا ميزانية معتمدة، ولا تاريخ بدء مؤكّد، ولا مكتب في إسطنبول. الموجود: نيّة البدء في 2027 — ووقت للتعرّف على الأشخاص المناسبين قبل ذلك.",
  } as Localized,
}

/** Beschriftungen, die in mehreren Bausteinen vorkommen. */
export const marken = {
  ort: { de: "Ort", tr: "Yer", en: "Location", ar: "المكان" } as Localized,
  arbeitsmodell: { de: "Arbeitsmodell", tr: "Çalışma modeli", en: "Work model", ar: "نموذج العمل" } as Localized,
  sprachen: { de: "Sprachen", tr: "Diller", en: "Languages", ar: "اللغات" } as Localized,
  disziplinen: { de: "Handwerke", tr: "Alanlar", en: "Crafts", ar: "الحِرَف" } as Localized,
  spurA: { de: "Spur A", tr: "A yolu", en: "Track A", ar: "المسار A" } as Localized,
  spurB: { de: "Spur B", tr: "B yolu", en: "Track B", ar: "المسار B" } as Localized,
  mehr: { de: "Rolle ansehen", tr: "Rolü incele", en: "View the role", ar: "اطّلع على الدور" } as Localized,
  heisstEs: { de: "Das heißt es", tr: "Bu demek", en: "It means", ar: "يعني ذلك" } as Localized,
  heisstEsNicht: {
    de: "Das heißt es nicht",
    tr: "Bu demek değil",
    en: "It does not mean",
    ar: "لا يعني ذلك",
  } as Localized,
  sprachNiveau: {
    kern: { de: "Kern", tr: "Çekirdek", en: "Core", ar: "أساسية" } as Localized,
    hilfreich: { de: "Hilfreich", tr: "Yardımcı", en: "Helpful", ar: "مفيدة" } as Localized,
    nuetzlich: { de: "Nützlich", tr: "Faydalı", en: "Useful", ar: "نافعة" } as Localized,
  },
}

/* ── 02 · Was hier gebaut wird ───────────────────────────────────────────── */

export const wasWirBauen = {
  eyebrow: { de: "Die Arbeit", tr: "İş", en: "The work", ar: "العمل" } as Localized,
  titel: {
    de: "Nicht Websites. Betriebe, die danach anders laufen.",
    tr: "Web siteleri değil. Sonrasında farklı işleyen işletmeler.",
    en: "Not websites. Businesses that run differently afterwards.",
    ar: "ليست مواقع. بل منشآت تعمل بعدها بشكل مختلف.",
  } as Localized,
  text: {
    de: "Ein Handwerksbetrieb bekommt eine Anfrage über WhatsApp. Jemand schreibt sie in eine Tabelle. Ein Angebot entsteht in Word, die Nachfassung im Kopf, der Status in einem Gespräch auf dem Flur. Sichtbar ist davon nichts — bis etwas untergeht. Genau diese unsichtbare Hälfte ist unsere Arbeit: Wir sehen sie, ordnen sie und bauen sie so, dass sie ohne den Inhaber weiterläuft.",
    tr: "Bir zanaat işletmesine WhatsApp'tan talep gelir. Biri bunu tabloya yazar. Teklif Word'de doğar, takip akılda kalır, durum koridordaki bir konuşmada. Bunların hiçbiri görünmez — bir şey kaybolana kadar. İşte bu görünmeyen yarı bizim işimiz: Onu görürüz, düzene sokarız ve sahibi olmadan da yürüyecek şekilde kurarız.",
    en: "A trade business receives an enquiry via WhatsApp. Someone types it into a spreadsheet. A quote appears in Word, the follow-up lives in someone's head, the status in a hallway conversation. None of it is visible — until something gets lost. That invisible half is our work: we see it, order it, and build it so it keeps running without the owner.",
    ar: "تصل منشأة حِرفية طلبٌ عبر واتساب. يكتبه أحدهم في جدول. يُصاغ العرض في وورد، وتبقى المتابعة في الذاكرة، والحالة في حديث عابر بالممر. لا شيء من ذلك مرئي — حتى يضيع شيء. هذا النصف غير المرئي هو عملنا: نراه، ونرتّبه، ونبنيه ليستمر دون صاحب المنشأة.",
  } as Localized,
  ebenenLabel: {
    de: "Fünf Ebenen — jede ist eine Leistung, jede ist auch eine Aufgabe im Team",
    tr: "Beş katman — her biri bir hizmet, her biri aynı zamanda ekipte bir görev",
    en: "Five levels — each is a service, and each is also a job inside the team",
    ar: "خمس طبقات — كل واحدة خدمة، وكل واحدة أيضًا مهمّة داخل الفريق",
  } as Localized,
}

/* ── 03 · Deutschland ↔ Istanbul ─────────────────────────────────────────── */

export const bruecke = {
  eyebrow: {
    de: "Das Betriebsmodell",
    tr: "Çalışma modeli",
    en: "The operating model",
    ar: "نموذج التشغيل",
  } as Localized,
  titel: {
    de: "Zwei Orte, eine Verantwortung.",
    tr: "İki yer, tek sorumluluk.",
    en: "Two places, one responsibility.",
    ar: "مكانان، مسؤولية واحدة.",
  } as Localized,
  lead: {
    de: "Istanbul ist nicht die billige Hälfte. Die Aufteilung folgt der Nähe zum Kunden und der Nähe zum System — nicht dem Stundensatz.",
    tr: "İstanbul ucuz olan yarı değil. Bölüşüm, müşteriye ve sisteme yakınlığa göre — saat ücretine göre değil.",
    en: "Istanbul is not the cheap half. The split follows proximity to the client and proximity to the system — not the hourly rate.",
    ar: "إسطنبول ليست النصف الرخيص. التقسيم يتبع القرب من العميل والقرب من النظام — لا سعر الساعة.",
  } as Localized,
  seiten: [
    {
      ort: { de: "Osnabrück", tr: "Osnabrück", en: "Osnabrück", ar: "أوسنابروك" } as Localized,
      rolle: {
        de: "Markt und Verantwortung",
        tr: "Pazar ve sorumluluk",
        en: "Market and responsibility",
        ar: "السوق والمسؤولية",
      } as Localized,
      punkte: [
        { de: "Kundenbeziehung", tr: "Müşteri ilişkisi", en: "Client relationship", ar: "علاقة العميل" },
        { de: "Systemarchitektur", tr: "Sistem mimarisi", en: "System architecture", ar: "بنية النظام" },
        { de: "Angebot und Preis", tr: "Teklif ve fiyat", en: "Offer and price", ar: "العرض والسعر" },
        { de: "Abnahme gegenüber dem Kunden", tr: "Müşteriye karşı kabul", en: "Sign-off towards the client", ar: "الاعتماد أمام العميل" },
      ] as Localized[],
    },
    {
      ort: { de: "Istanbul", tr: "İstanbul", en: "Istanbul", ar: "إسطنبول" } as Localized,
      rolle: {
        de: "Bauen und betreiben",
        tr: "Kurmak ve işletmek",
        en: "Build and operate",
        ar: "البناء والتشغيل",
      } as Localized,
      punkte: [
        { de: "Recherche und Discovery-Zuarbeit", tr: "Araştırma ve keşif desteği", en: "Research and discovery support", ar: "البحث ودعم الاستكشاف" },
        { de: "Produkt, Design, Engineering", tr: "Ürün, tasarım, engineering", en: "Product, design, engineering", ar: "المنتج والتصميم والهندسة" },
        { de: "Automation und KI-Arbeit", tr: "Otomasyon ve yapay zekâ işi", en: "Automation and AI work", ar: "الأتمتة والعمل بالذكاء الاصطناعي" },
        { de: "Laufender Betrieb der Systeme", tr: "Sistemlerin sürekli işletimi", en: "Ongoing operation of the systems", ar: "التشغيل المستمر للأنظمة" },
      ] as Localized[],
    },
  ],
  mitteLabel: {
    de: "Was beide teilen",
    tr: "İkisinin ortak zemini",
    en: "What both share",
    ar: "ما يشترك فيه الطرفان",
  } as Localized,
  mitte: [
    { de: "Dieselbe Methode", tr: "Aynı yöntem", en: "The same method", ar: "المنهج نفسه" },
    { de: "Dieselben Belege", tr: "Aynı kanıtlar", en: "The same evidence", ar: "الأدلّة نفسها" },
    { de: "Dieselben Qualitätsregeln", tr: "Aynı kalite kuralları", en: "The same quality rules", ar: "قواعد الجودة نفسها" },
  ] as Localized[],
  fussnote: {
    de: "Ein Büro in Istanbul gibt es heute nicht. Der Plan ist remote-first mit geplanten gemeinsamen Tagen — und ein Raum, wenn er gebraucht wird.",
    tr: "Bugün İstanbul'da ofis yok. Plan: önce uzaktan, planlı ortak günlerle — ve gerektiğinde bir mekân.",
    en: "There is no office in Istanbul today. The plan is remote-first with planned days together — and a room when one is needed.",
    ar: "لا يوجد مكتب في إسطنبول اليوم. الخطة: العمل عن بُعد أولًا مع أيام حضور مخطّطة — ومكان عند الحاجة.",
  } as Localized,
}

/* ── 04 · Die Arbeitsweise ───────────────────────────────────────────────── */

export const arbeitsweise = {
  eyebrow: { de: "Wie wir arbeiten", tr: "Nasıl çalışıyoruz", en: "How we work", ar: "كيف نعمل" } as Localized,
  titel: {
    de: "Sehen. Verstehen. Ordnen. Bauen. Belegen. Betreiben. Lernen.",
    tr: "Görmek. Anlamak. Düzenlemek. Kurmak. Kanıtlamak. İşletmek. Öğrenmek.",
    en: "See. Understand. Order. Build. Prove. Operate. Learn.",
    ar: "نرى. نفهم. نُنظّم. نبني. نُثبت. نُشغّل. نتعلّم.",
  } as Localized,
  schritte: [
    {
      titel: { de: "Sehen", tr: "Görmek", en: "See", ar: "نرى" },
      text: {
        de: "Was tut der Betrieb wirklich — nicht, was auf seiner Website steht.",
        tr: "İşletme gerçekte ne yapıyor — sitesinde ne yazdığı değil.",
        en: "What the business actually does — not what its website says.",
        ar: "ما تفعله المنشأة فعلًا — لا ما يقوله موقعها.",
      },
    },
    {
      titel: { de: "Verstehen", tr: "Anlamak", en: "Understand", ar: "نفهم" },
      text: {
        de: "Fragen stellen, bis die Annahme zur Tatsache wird oder fällt.",
        tr: "Varsayım gerçeğe dönüşene ya da düşene kadar soru sormak.",
        en: "Ask until the assumption becomes a fact or falls apart.",
        ar: "نسأل حتى يصير الافتراض حقيقة أو يسقط.",
      },
    },
    {
      titel: { de: "Ordnen", tr: "Düzenlemek", en: "Order", ar: "نُنظّم" },
      text: {
        de: "Aus vielen Einzelheiten wird ein Ablauf, der einen Namen hat.",
        tr: "Dağınık ayrıntılardan adı olan bir akış çıkar.",
        en: "Many details become one process that has a name.",
        ar: "تتحوّل التفاصيل المبعثرة إلى مسار له اسم.",
      },
    },
    {
      titel: { de: "Bauen", tr: "Kurmak", en: "Build", ar: "نبني" },
      text: {
        de: "Marke, Auftritt, Software, Automation — was der Ablauf braucht.",
        tr: "Marka, görünüm, yazılım, otomasyon — akışın neye ihtiyacı varsa.",
        en: "Brand, presence, software, automation — whatever the process needs.",
        ar: "العلامة والحضور والبرمجيات والأتمتة — بحسب ما يحتاجه المسار.",
      },
    },
    {
      titel: { de: "Belegen", tr: "Kanıtlamak", en: "Prove", ar: "نُثبت" },
      text: {
        de: "Gemessen statt behauptet. Auch wenn das Ergebnis unbequem ist.",
        tr: "İddia değil ölçüm. Sonuç rahatsız edici olsa bile.",
        en: "Measured, not claimed. Even when the result is inconvenient.",
        ar: "قياس لا ادّعاء. حتى لو كانت النتيجة مزعجة.",
      },
    },
    {
      titel: { de: "Betreiben", tr: "İşletmek", en: "Operate", ar: "نُشغّل" },
      text: {
        de: "Wir übergeben nicht und verschwinden. Das System läuft weiter.",
        tr: "Teslim edip kaybolmuyoruz. Sistem çalışmaya devam ediyor.",
        en: "We do not hand over and disappear. The system keeps running.",
        ar: "لا نُسلّم ونختفي. النظام يستمر في العمل.",
      },
    },
    {
      titel: { de: "Lernen", tr: "Öğrenmek", en: "Learn", ar: "نتعلّم" },
      text: {
        de: "Was im Betrieb auffällt, ändert die Methode — nicht nur das Projekt.",
        tr: "İşleyişte fark edilen şey yöntemi değiştirir — sadece projeyi değil.",
        en: "What surfaces in operation changes the method — not just the project.",
        ar: "ما يظهر أثناء التشغيل يغيّر المنهج — لا المشروع وحده.",
      },
    },
  ] as Punkt[],
}

/* ── 05 · Was wir suchen ─────────────────────────────────────────────────── */

export const haltung = {
  eyebrow: { de: "Haltung", tr: "Duruş", en: "How we behave", ar: "الموقف" } as Localized,
  titel: {
    de: "Woran man bei uns eine gute Woche erkennt.",
    tr: "Bizde iyi bir hafta neyden anlaşılır.",
    en: "What a good week looks like here.",
    ar: "كيف يبدو أسبوع جيّد عندنا.",
  } as Localized,
  punkte: [
    {
      titel: { de: "Zu Ende bringen", tr: "Sonuca götürmek", en: "Finish it", ar: "أنهِ الأمر" },
      text: {
        de: "Eine Aufgabe ist fertig, wenn ein Ergebnis dasteht und der nächste Schritt benannt ist — nicht, wenn sie abgegeben wurde.",
        tr: "Bir iş, ortada bir sonuç ve adı konmuş bir sonraki adım varsa biter — teslim edildiğinde değil.",
        en: "A task is done when there is a result and a named next step — not when it has been handed over.",
        ar: "المهمة تنتهي حين توجد نتيجة وخطوة تالية محدّدة — لا حين تُسلَّم.",
      },
    },
    {
      titel: { de: "Früh sagen", tr: "Erken söylemek", en: "Say it early", ar: "قُلها مبكرًا" },
      text: {
        de: "Ein Fehler am Dienstag ist eine Aufgabe. Derselbe Fehler am Freitag ist ein Problem für jemand anderen.",
        tr: "Salı günkü bir hata bir iştir. Aynı hata cuma günü başkasının sorunudur.",
        en: "A mistake on Tuesday is a task. The same mistake on Friday is someone else's problem.",
        ar: "الخطأ يوم الثلاثاء مهمّة. الخطأ نفسه يوم الجمعة مشكلة لشخص آخر.",
      },
    },
    {
      titel: { de: "Nach dem Beispiel fragen", tr: "Örneği sormak", en: "Ask for the example", ar: "اطلب المثال" },
      text: {
        de: "Bevor jemand eine Lösung vorschlägt, will er den echten Fall gesehen haben. Ein Vorschlag ohne Beispiel ist eine Vermutung mit Selbstbewusstsein.",
        tr: "Biri çözüm önermeden önce gerçek vakayı görmüş olmalı. Örneksiz öneri, kendine güvenen bir tahmindir.",
        en: "Before proposing a solution, you want to have seen the real case. A proposal without an example is a guess with confidence.",
        ar: "قبل اقتراح حلّ، عليك أن تكون رأيت الحالة الحقيقية. اقتراح بلا مثال تخمينٌ واثق.",
      },
    },
    {
      titel: { de: "Selbst prüfen", tr: "Kendin denetlemek", en: "Test your own work", ar: "افحص عملك بنفسك" },
      text: {
        de: "Wer etwas abgibt, hat es vorher selbst auseinandergenommen. Die Prüfung ist Teil der Arbeit, nicht der nächste Schritt.",
        tr: "Bir şeyi teslim eden, onu önce kendisi söküp bakmıştır. Denetim işin parçasıdır, sonraki adım değil.",
        en: "Whoever hands something over has taken it apart first. Checking is part of the work, not the step after it.",
        ar: "من يُسلّم شيئًا يكون قد فكّكه بنفسه أولًا. الفحص جزء من العمل، لا الخطوة التالية.",
      },
    },
    {
      titel: { de: "KI benutzen und prüfen", tr: "Yapay zekâyı kullanmak ve denetlemek", en: "Use AI, then verify it", ar: "استخدم الذكاء الاصطناعي ثم تحقّق" },
      text: {
        de: "Wir arbeiten mit KI, wo sie schneller ist. Wer sie benutzt, kann sagen, was sie gemacht hat, was er selbst gemacht hat und woran er es geprüft hat.",
        tr: "Hızlandırdığı yerde yapay zekâ ile çalışıyoruz. Kullanan kişi, onun ne yaptığını, kendisinin ne yaptığını ve neye göre denetlediğini söyleyebilir.",
        en: "We work with AI where it is faster. Whoever uses it can say what it did, what they did, and how they checked it.",
        ar: "نعمل بالذكاء الاصطناعي حيث يكون أسرع. من يستخدمه يستطيع أن يقول ما الذي فعله، وما الذي فعله هو، وكيف تحقّق.",
      },
    },
    {
      titel: { de: "Kein Theater", tr: "Tiyatro yok", en: "No theatre", ar: "بلا استعراض" },
      text: {
        de: "Aus Unsicherheit wird keine Gewissheit gemacht. „Weiß ich noch nicht“ ist eine vollständige Antwort, wenn danach steht, wie man es herausfindet.",
        tr: "Belirsizlik kesinliğe çevrilmez. Arkasından nasıl öğrenileceği geliyorsa, „henüz bilmiyorum“ tam bir cevaptır.",
        en: "Uncertainty is not converted into certainty. „I don't know yet“ is a complete answer if it is followed by how you would find out.",
        ar: "لا نحوّل عدم اليقين إلى يقين. «لا أعرف بعد» جواب كامل إذا تبعه كيف ستكتشف.",
      },
    },
  ] as Punkt[],
}

/* ── 06 · Auswahl ────────────────────────────────────────────────────────── */

export const auswahl = {
  eyebrow: { de: "Auswahl", tr: "Seçim", en: "Selection", ar: "الاختيار" } as Localized,
  titel: {
    de: "Fünf Schritte, und Sie wissen nach jedem, woran Sie sind.",
    tr: "Beş adım; her birinden sonra nerede durduğunuzu bilirsiniz.",
    en: "Five steps, and after each one you know where you stand.",
    ar: "خمس خطوات، وبعد كلٍّ منها تعرف أين تقف.",
  } as Localized,
  schritte: [
    {
      titel: { de: "Vorstellen", tr: "Tanışma", en: "Introduce yourself", ar: "التعريف" },
      text: {
        de: "Ein kurzes Formular. Kein Lebenslauf nötig, kein Anschreiben.",
        tr: "Kısa bir form. CV gerekmez, ön yazı gerekmez.",
        en: "A short form. No CV needed, no cover letter.",
        ar: "نموذج قصير. لا سيرة ذاتية ولا خطاب تقديم.",
      },
    },
    {
      titel: { de: "Arbeit zeigen", tr: "İşini göstermek", en: "Show your work", ar: "أرِ عملك" },
      text: {
        de: "Was Sie gebaut haben — Repository, Portfolio, ein laufendes Produkt, eine Aufzeichnung.",
        tr: "Yaptığınız şey — depo, portfolyo, çalışan bir ürün, bir kayıt.",
        en: "What you built — a repository, portfolio, a running product, a recording.",
        ar: "ما بنيتَه — مستودع، أو أعمال، أو منتج يعمل، أو تسجيل.",
      },
    },
    {
      titel: { de: "Gespräch", tr: "Görüşme", en: "Conversation", ar: "حديث" },
      text: {
        de: "Wir reden über eine Sache, die Sie gemacht haben. Was war Ihr Anteil, was ist kaputtgegangen, was haben Sie danach geändert.",
        tr: "Yaptığınız bir iş üzerine konuşuruz. Payınız neydi, ne bozuldu, sonrasında neyi değiştirdiniz.",
        en: "We talk about one thing you made. What was your part, what broke, what you changed afterwards.",
        ar: "نتحدّث عن شيء واحد صنعته. ما دورك، وما الذي انكسر، وما الذي غيّرته بعدها.",
      },
    },
    {
      titel: { de: "Kleine Aufgabe", tr: "Küçük görev", en: "A small task", ar: "مهمّة صغيرة" },
      text: {
        de: "Kurz, abgegrenzt, zur Rolle passend. Keine Kundenarbeit, kein unbezahltes Projekt.",
        tr: "Kısa, sınırlı, role uygun. Müşteri işi değil, ücretsiz proje değil.",
        en: "Short, bounded, matched to the role. Not client work, not an unpaid project.",
        ar: "قصيرة، محدّدة، مناسبة للدور. ليست عمل عميل ولا مشروعًا بلا أجر.",
      },
    },
    {
      titel: { de: "Gemeinsam entscheiden", tr: "Birlikte karar", en: "Decide together", ar: "قرار مشترك" },
      text: {
        de: "Sie bekommen eine Rückmeldung mit Begründung — auch wenn es nicht passt.",
        tr: "Gerekçeli bir geri bildirim alırsınız — uymadığında da.",
        en: "You get a response with reasons — including when it is not a fit.",
        ar: "تحصل على ردٍّ مع الأسباب — حتى عند عدم التوافق.",
      },
    },
  ] as Punkt[],
  aufgabeLabel: {
    de: "Zur kleinen Aufgabe",
    tr: "Küçük görev hakkında",
    en: "About the small task",
    ar: "عن المهمّة الصغيرة",
  } as Localized,
  aufgabeRegeln: [
    {
      de: "Sie ist nie echte Kundenarbeit. Wir lassen uns nichts kostenlos bauen.",
      tr: "Asla gerçek müşteri işi değildir. Kimseye bedava iş yaptırmayız.",
      en: "It is never real client work. We do not get anything built for free.",
      ar: "ليست أبدًا عمل عميل حقيقي. لا نحصل على شيء مجانًا.",
    },
    {
      de: "Sie ist kurz und hat eine Grenze. Wenn sie ein Wochenende kostet, ist sie falsch gestellt.",
      tr: "Kısadır ve sınırı vardır. Bir hafta sonunu alıyorsa yanlış kurulmuştur.",
      en: "It is short and bounded. If it costs a weekend, it was set badly.",
      ar: "قصيرة ولها حدّ. إن كلّفت عطلة أسبوع فقد صيغت خطأ.",
    },
    {
      de: "KI ist erlaubt. Sagen Sie dazu, wofür Sie sie benutzt haben und woran Sie das Ergebnis geprüft haben.",
      tr: "Yapay zekâ serbest. Ne için kullandığınızı ve sonucu neye göre denetlediğinizi belirtin.",
      en: "AI is allowed. Tell us what you used it for and how you checked the result.",
      ar: "الذكاء الاصطناعي مسموح. أخبرنا فيمَ استخدمته وكيف تحقّقت من النتيجة.",
    },
    {
      de: "Bewertet wird der Gedanke, nicht die Präsentation. Kamera, Licht, Raum und Akzent zählen nicht.",
      tr: "Sunum değil düşünce değerlendirilir. Kamera, ışık, mekân ve aksan sayılmaz.",
      en: "We assess the thinking, not the presentation. Camera, light, room and accent do not count.",
      ar: "نقيّم التفكير لا العرض. الكاميرا والإضاءة والمكان واللهجة لا تُحتسب.",
    },
  ] as Localized[],
}

/* ── 07 · Häufige Fragen ─────────────────────────────────────────────────── */

export const fragen = {
  eyebrow: { de: "Offene Fragen", tr: "Sorular", en: "Open questions", ar: "أسئلة" } as Localized,
  titel: {
    de: "Was Sie vermutlich zuerst wissen wollen.",
    tr: "Muhtemelen önce merak ettikleriniz.",
    en: "What you probably want to know first.",
    ar: "ما تريد معرفته أولًا على الأرجح.",
  } as Localized,
  eintraege: [
    {
      titel: {
        de: "Gibt es schon ein Büro in Istanbul?",
        tr: "İstanbul'da ofis var mı?",
        en: "Is there already an office in Istanbul?",
        ar: "هل يوجد مكتب في إسطنبول؟",
      },
      text: {
        de: "Nein. Geplant ist remote-first mit gemeinsamen Tagen und einem Raum, wenn er gebraucht wird. Wo der liegt und ab wann, steht nicht fest.",
        tr: "Hayır. Plan: önce uzaktan, ortak günler ve gerektiğinde bir mekân. Nerede ve ne zaman olacağı belli değil.",
        en: "No. The plan is remote-first with shared days and a room when one is needed. Where and from when is not decided.",
        ar: "لا. الخطة عن بُعد أولًا مع أيام مشتركة ومكان عند الحاجة. أين ومتى غير محدَّد.",
      },
    },
    {
      titel: {
        de: "Sind das offene Stellen?",
        tr: "Bunlar açık pozisyon mu?",
        en: "Are these open positions?",
        ar: "هل هذه وظائف مفتوحة؟",
      },
      text: {
        de: "Nein. Beide Spuren stehen auf Talent Pool. Wir lernen jetzt Menschen kennen; eine Zusage kann daraus erst werden, wenn eine Stelle wirklich freigegeben ist.",
        tr: "Hayır. İki yol da yetenek havuzunda. Şimdi tanışıyoruz; taahhüt ancak bir pozisyon gerçekten onaylandığında doğabilir.",
        en: "No. Both tracks are talent pool. We are meeting people now; a commitment can only follow once a position is genuinely approved.",
        ar: "لا. كلا المسارين ضمن مجموعة المواهب. نتعرّف الآن؛ ولا يأتي الالتزام إلا بعد اعتماد وظيفة فعليًا.",
      },
    },
    {
      titel: {
        de: "Ist Januar 2027 zugesagt?",
        tr: "Ocak 2027 kesin mi?",
        en: "Is January 2027 guaranteed?",
        ar: "هل يناير 2027 مؤكّد؟",
      },
      text: {
        de: "Nein. 2027 ist die Absicht, kein Termin. Wer zuerst dazukommt, hängt daran, wo der Engpass liegt — bei der Nachfrage oder bei der Lieferung.",
        tr: "Hayır. 2027 bir niyet, tarih değil. Kimin önce katılacağı darboğazın nerede olduğuna bağlı — talepte mi, teslimde mi.",
        en: "No. 2027 is the intention, not a date. Who joins first depends on where the bottleneck is — demand or delivery.",
        ar: "لا. 2027 نيّة لا موعد. ومن ينضم أولًا يعتمد على موضع الاختناق — في الطلب أم في التسليم.",
      },
    },
    {
      titel: {
        de: "Brauche ich Deutsch?",
        tr: "Almanca gerekli mi?",
        en: "Do I need German?",
        ar: "هل أحتاج الألمانية؟",
      },
      text: {
        de: "Für Business Development ja — weil die Gespräche auf Deutsch stattfinden. Für Founding Talent nicht. Gemessen wird, ob Sie ein Gespräch führen können, nicht Herkunft, Pass oder Akzent.",
        tr: "İş geliştirme için evet — görüşmeler Almanca yapılıyor. Founding Talent için gerekmiyor. Ölçtüğümüz şey görüşme yürütebilmeniz; köken, pasaport ya da aksan değil.",
        en: "For business development yes — the conversations happen in German. For Founding Talent no. What is measured is whether you can hold a conversation, not origin, passport or accent.",
        ar: "لتطوير الأعمال نعم — فالأحاديث تجري بالألمانية. أما Founding Talent فلا. المقياس هو قدرتك على إدارة حديث، لا الأصل أو الجواز أو اللهجة.",
      },
    },
    {
      titel: {
        de: "Kann ich mich als Studentin oder Berufsanfänger melden?",
        tr: "Öğrenci ya da yeni mezun olarak başvurabilir miyim?",
        en: "Can I apply as a student or early in my career?",
        ar: "هل أستطيع التقدّم كطالب أو في بداية مساري؟",
      },
      text: {
        de: "Ja, über Founding Talent. Wir lesen, was Sie gebaut haben — nicht, wo Sie studiert haben. Ein Semesterprojekt, das läuft, sagt mehr als eine Note.",
        tr: "Evet, Founding Talent üzerinden. Nerede okuduğunuza değil, ne yaptığınıza bakarız. Çalışan bir dönem projesi, bir nottan fazlasını söyler.",
        en: "Yes, through Founding Talent. We read what you built — not where you studied. A term project that runs says more than a grade.",
        ar: "نعم، عبر Founding Talent. نقرأ ما بنيتَه — لا أين درست. مشروع فصلي يعمل يقول أكثر من درجة.",
      },
    },
    {
      titel: {
        de: "Was passiert mit meinen Angaben?",
        tr: "Verilerime ne oluyor?",
        en: "What happens to my information?",
        ar: "ماذا يحدث لبياناتي؟",
      },
      text: {
        de: "Heute nimmt die Seite noch keine Bewerbungen entgegen — es gibt keinen Speicher dafür, und in den Vertriebsbestand gehören Bewerbungen nicht. Der Weg, der heute funktioniert, steht am Ende des Formulars.",
        tr: "Bugün site henüz başvuru almıyor — bunun için bir kayıt yeri yok ve başvurular satış kayıtlarına ait değil. Bugün işleyen yol formun sonunda yazıyor.",
        en: "Today the site does not yet accept applications — there is no store for them, and applications do not belong in the sales records. The route that works today is stated at the end of the form.",
        ar: "اليوم لا يستقبل الموقع الطلبات بعد — لا يوجد مخزن لها، والطلبات لا تنتمي إلى سجلّات المبيعات. الطريق الذي يعمل اليوم مذكور في نهاية النموذج.",
      },
    },
  ] as Punkt[],
}

/* ── 08 · Der Abschluss ──────────────────────────────────────────────────── */

export const abschluss = {
  eyebrow: { de: "Nächster Schritt", tr: "Sonraki adım", en: "Next step", ar: "الخطوة التالية" } as Localized,
  titel: {
    de: "Wenn Sie das hier gelesen haben und weitermachen wollen.",
    tr: "Buraya kadar okuduysanız ve devam etmek istiyorsanız.",
    en: "If you have read this far and want to continue.",
    ar: "إن قرأت إلى هنا وأردت المتابعة.",
  } as Localized,
  text: {
    de: "Ein kurzes Formular, ein Link auf etwas, das Sie gebaut haben, und drei Sätze dazu, warum creaDIG. Mehr braucht es für den ersten Schritt nicht.",
    tr: "Kısa bir form, yaptığınız bir şeye bağlantı ve neden creaDIG olduğuna dair üç cümle. İlk adım için fazlası gerekmez.",
    en: "A short form, a link to something you built, and three sentences on why creaDIG. Nothing more is needed for the first step.",
    ar: "نموذج قصير، ورابط لشيء بنيتَه، وثلاث جمل عن سبب اختيارك creaDIG. لا حاجة لأكثر من ذلك في الخطوة الأولى.",
  } as Localized,
}

/* ═════════════════════════════════════════════════════════════════════════
 * SPUR A · DACH BUSINESS DEVELOPMENT
 * ═════════════════════════════════════════════════════════════════════════ */

export const spurA = {
  lead: {
    de: "Wir suchen keinen Verkäufer. Wir suchen jemanden, der einen Betrieb ansieht und erkennt, was darin nicht funktioniert — und der den Unterschied kennt zwischen dem, was er sieht, und dem, was er deshalb annimmt.",
    tr: "Satışçı aramıyoruz. Bir işletmeye bakıp içinde neyin yürümediğini gören birini arıyoruz — ve gördüğü şeyle ondan çıkardığı varsayım arasındaki farkı bilen birini.",
    en: "We are not looking for a salesperson. We are looking for someone who looks at a business and sees what is not working — and who knows the difference between what they see and what they therefore assume.",
    ar: "لا نبحث عن بائع. نبحث عمّن ينظر إلى منشأة فيرى ما لا يعمل فيها — ويعرف الفرق بين ما يراه وما يفترضه بناءً عليه.",
  } as Localized,

  warumEsGibt: {
    eyebrow: { de: "Warum es diese Rolle gibt", tr: "Bu rol neden var", en: "Why this role exists", ar: "لماذا يوجد هذا الدور" } as Localized,
    text: {
      de: "creaDIG verkauft heute über den Inhaber. Das funktioniert, solange er selbst im Gespräch sitzt — und es hört auf zu funktionieren, sobald er gleichzeitig bauen soll. Was fehlt, ist niemand, der Angebote hinterherruft. Was fehlt, ist jemand, der Betriebe findet, versteht und so beschreibt, dass ein Systemgespräch überhaupt Sinn ergibt.",
      tr: "creaDIG bugün sahibi üzerinden satıyor. Bu, o görüşmede oturduğu sürece işliyor — aynı anda üretmesi gerektiğinde işlemez oluyor. Eksik olan, tekliflerin peşinden koşan biri değil. Eksik olan; işletmeleri bulan, anlayan ve sistem görüşmesini anlamlı kılacak şekilde tarif eden biri.",
      en: "Today creaDIG sells through its owner. That works as long as he is in the conversation himself — and stops working the moment he is also supposed to build. What is missing is not someone chasing quotes. What is missing is someone who finds businesses, understands them, and describes them so that a system conversation makes sense at all.",
      ar: "تبيع creaDIG اليوم عبر صاحبها. ينجح ذلك ما دام حاضرًا في الحديث — ويتوقّف حين يُطلب منه البناء في الوقت نفسه. الناقص ليس من يلاحق العروض، بل من يجد المنشآت ويفهمها ويصفها بحيث يصبح حديث النظام ذا معنى.",
    } as Localized,
  },

  tut: {
    eyebrow: { de: "Was Sie tun würden", tr: "Ne yapardınız", en: "What you would do", ar: "ما ستفعله" } as Localized,
    punkte: [
      {
        titel: { de: "Betriebe lesen", tr: "İşletmeleri okumak", en: "Read businesses", ar: "قراءة المنشآت" },
        text: {
          de: "Öffentlich sichtbare Signale sammeln: Auftritt, Kontaktwege, Bewertungen, Stellenanzeigen, Öffnungszeiten, Terminbuchung. Und daraus eine Frage bauen, keine Behauptung.",
          tr: "Herkese açık sinyalleri toplamak: görünüm, iletişim yolları, yorumlar, ilanlar, çalışma saatleri, randevu. Ve bundan bir iddia değil, bir soru kurmak.",
          en: "Collect publicly visible signals: presence, contact routes, reviews, job ads, opening hours, booking. And build a question from them, not a claim.",
          ar: "جمع الإشارات العلنية: الحضور، وقنوات التواصل، والتقييمات، وإعلانات التوظيف، وساعات العمل، والحجز. ثم بناء سؤال منها، لا ادّعاء.",
        },
      },
      {
        titel: { de: "Gespräche führen", tr: "Görüşme yürütmek", en: "Hold conversations", ar: "إدارة الأحاديث" },
        text: {
          de: "Auf Deutsch, mit Inhaberinnen und Betriebsleitern. Zuhören, nachfragen, mitschreiben — und aushalten, wenn die Antwort die eigene Vermutung widerlegt.",
          tr: "Almanca, işletme sahipleri ve yöneticileriyle. Dinlemek, sormak, not almak — ve cevap kendi varsayımınızı çürüttüğünde buna katlanmak.",
          en: "In German, with owners and operations managers. Listen, ask, write it down — and accept it when the answer disproves your own assumption.",
          ar: "بالألمانية، مع أصحاب المنشآت ومديري التشغيل. الإصغاء والسؤال والتدوين — وتقبّل أن يدحض الجواب افتراضك.",
        },
      },
      {
        titel: { de: "Befunde festhalten", tr: "Bulguları kayda geçirmek", en: "Record findings", ar: "توثيق النتائج" },
        text: {
          de: "Ein kurzer Vorgangs-Befund: was beobachtet, was gefragt, was bestätigt, was offen. Mit Fundstelle. Ohne Fundstelle ist es eine Erinnerung.",
          tr: "Kısa bir vaka bulgusu: ne gözlendi, ne soruldu, ne doğrulandı, ne açık kaldı. Kaynağıyla. Kaynağı yoksa o bir hatıradır.",
          en: "A short case finding: what was observed, asked, confirmed, still open. With a source. Without a source it is a memory.",
          ar: "تقرير حالة قصير: ما لوحظ، وما سُئل، وما تأكّد، وما بقي مفتوحًا. مع المصدر. وبلا مصدر يصبح ذكرى.",
        },
      },
      {
        titel: { de: "Nachfassen", tr: "Takip etmek", en: "Follow up", ar: "المتابعة" },
        text: {
          de: "Verabredetes einhalten. Der Unterschied zwischen einem Gespräch und einem Vorgang ist meistens der zweite Kontakt.",
          tr: "Söz verileni tutmak. Bir görüşmeyle bir vaka arasındaki fark çoğu zaman ikinci temastır.",
          en: "Keep what was agreed. The difference between a conversation and a case is usually the second contact.",
          ar: "الوفاء بما اتُّفق عليه. الفرق بين حديث وحالة هو غالبًا التواصل الثاني.",
        },
      },
    ] as Punkt[],
  },

  tutNicht: {
    eyebrow: { de: "Was Sie nicht tun würden", tr: "Ne yapmazdınız", en: "What you would not do", ar: "ما لن تفعله" } as Localized,
    punkte: [
      {
        de: "Probleme erfinden, die niemand bestätigt hat.",
        tr: "Kimsenin doğrulamadığı sorunlar uydurmak.",
        en: "Invent problems nobody has confirmed.",
        ar: "اختلاق مشكلات لم يؤكّدها أحد.",
      },
      {
        de: "Architektur, Umfang oder Termine zusagen.",
        tr: "Mimari, kapsam ya da tarih taahhüt etmek.",
        en: "Promise architecture, scope or dates.",
        ar: "الوعد ببنية أو نطاق أو مواعيد.",
      },
      {
        de: "Preise verhandeln oder Nachlässe geben.",
        tr: "Fiyat pazarlığı yapmak ya da indirim vermek.",
        en: "Negotiate prices or grant discounts.",
        ar: "التفاوض على الأسعار أو منح خصومات.",
      },
      {
        de: "Recherchierte Betriebe in Massen anschreiben.",
        tr: "Araştırılan işletmelere toplu mesaj atmak.",
        en: "Mass-contact researched businesses.",
        ar: "مراسلة المنشآت المبحوثة بالجملة.",
      },
      {
        de: "Aus jedem recherchierten Betrieb einen Vorgang machen.",
        tr: "Araştırılan her işletmeyi bir vakaya çevirmek.",
        en: "Turn every researched business into a case.",
        ar: "تحويل كل منشأة مبحوثة إلى حالة.",
      },
    ] as Localized[],
    grenze: {
      de: "Angebot, Preis, Architektur und die tiefere Systemberatung bleiben beim Inhaber. Das ist keine Bevormundung, sondern die Grenze, die verhindert, dass jemand im Gespräch etwas zusagt, das danach gebaut werden muss.",
      tr: "Teklif, fiyat, mimari ve derin sistem danışmanlığı sahipte kalır. Bu vesayet değil; görüşmede sonradan inşa edilmesi gereken bir şeyin söz verilmesini önleyen sınırdır.",
      en: "Offer, price, architecture and the deeper system consulting stay with the owner. That is not paternalism — it is the boundary that stops someone promising in a conversation what has to be built afterwards.",
      ar: "يبقى العرض والسعر والبنية والاستشارة النظامية العميقة لدى صاحب المنشأة. ليس هذا وصاية، بل الحدّ الذي يمنع الوعد في حديثٍ بما يجب بناؤه لاحقًا.",
    } as Localized,
  },

  /* Die Kette — das eine Diagramm dieser Seite. */
  kette: {
    eyebrow: { de: "Beleg statt Vermutung", tr: "Varsayım değil kanıt", en: "Evidence, not assumption", ar: "دليل لا افتراض" } as Localized,
    titel: {
      de: "Wie aus einem sichtbaren Signal ein Vorgang wird — und wo die meisten abkürzen.",
      tr: "Görünür bir sinyal nasıl vakaya dönüşür — ve çoğu kişi nerede kestirmeden gider.",
      en: "How a visible signal becomes a case — and where most people take a shortcut.",
      ar: "كيف تتحوّل إشارة ظاهرة إلى حالة — وأين يختصر معظم الناس الطريق.",
    } as Localized,
    stufen: [
      {
        stufe: { de: "Signal", tr: "Sinyal", en: "Signal", ar: "إشارة" },
        text: {
          de: "Auf der Website steht ein WhatsApp-Knopf.",
          tr: "Sitede bir WhatsApp düğmesi var.",
          en: "There is a WhatsApp button on the website.",
          ar: "يوجد زر واتساب على الموقع.",
        },
        art: "beleg" as const,
      },
      {
        stufe: { de: "Beobachtung", tr: "Gözlem", en: "Observation", ar: "ملاحظة" },
        text: {
          de: "Kunden können den Betrieb über WhatsApp erreichen.",
          tr: "Müşteriler işletmeye WhatsApp'tan ulaşabiliyor.",
          en: "Customers can reach the business via WhatsApp.",
          ar: "يستطيع العملاء الوصول إلى المنشأة عبر واتساب.",
        },
        art: "beleg" as const,
      },
      {
        stufe: { de: "Vermutung", tr: "Varsayım", en: "Hypothesis", ar: "افتراض" },
        text: {
          de: "Vielleicht wird jede Anfrage von Hand weiterverarbeitet.",
          tr: "Belki her talep elle işleniyordur.",
          en: "Perhaps every enquiry is processed by hand.",
          ar: "ربما يُعالَج كل طلب يدويًا.",
        },
        art: "vermutung" as const,
      },
      {
        stufe: { de: "Frage", tr: "Soru", en: "Question", ar: "سؤال" },
        text: {
          de: "„Was passiert bei Ihnen intern, nachdem so eine Nachricht ankommt?“",
          tr: "„Böyle bir mesaj geldikten sonra içeride ne oluyor?“",
          en: "„What happens internally after a message like that arrives?“",
          ar: "«ماذا يحدث داخليًا بعد وصول رسالة كهذه؟»",
        },
        art: "frage" as const,
      },
      {
        stufe: { de: "Bestätigter Bedarf", tr: "Doğrulanmış ihtiyaç", en: "Confirmed need", ar: "حاجة مؤكَّدة" },
        text: {
          de: "Erst nach dem Gespräch — und nur, wenn der Betrieb es selbst so sagt.",
          tr: "Ancak görüşmeden sonra — ve yalnızca işletme kendisi böyle söylerse.",
          en: "Only after the conversation — and only if the business says so itself.",
          ar: "بعد الحديث فقط — وفقط إن قالت المنشأة ذلك بنفسها.",
        },
        art: "erst-danach" as const,
      },
    ],
    fussnote: {
      de: "Die Abkürzung wäre, aus dem Signal gleich den Bedarf zu machen und ein Angebot zu schicken. Sie funktioniert manchmal — und kostet jedes Mal, wenn sie danebenliegt, das Gespräch.",
      tr: "Kestirme yol, sinyalden doğrudan ihtiyaç çıkarıp teklif göndermek olurdu. Bazen işe yarar — ve yanlış olduğu her seferinde görüşmeye mal olur.",
      en: "The shortcut would be to turn the signal straight into a need and send an offer. It sometimes works — and every time it is wrong, it costs the conversation.",
      ar: "الاختصار هو تحويل الإشارة مباشرة إلى حاجة وإرسال عرض. ينجح أحيانًا — وفي كل مرة يخطئ يكلّف الحديث كلّه.",
    } as Localized,
  },

  entwicklung: {
    eyebrow: { de: "Die ersten Monate", tr: "İlk aylar", en: "The first months", ar: "الأشهر الأولى" } as Localized,
    hinweis: {
      de: "Als Erwartung an die Einarbeitung gedacht, nicht als Zielvorgabe. Es gibt keine Stückzahlen.",
      tr: "Bir hedef değil, uyum sürecine dair beklenti olarak. Adet hedefi yoktur.",
      en: "Meant as an expectation for onboarding, not a target. There are no quotas.",
      ar: "بوصفها توقّعًا لفترة التهيئة لا هدفًا. لا توجد حصص.",
    } as Localized,
    stufen: [
      {
        titel: { de: "Nach 30 Tagen", tr: "30 gün sonra", en: "After 30 days", ar: "بعد 30 يومًا" },
        text: {
          de: "Sie kennen creaDIG, die fünf Ebenen, die Angebotslogik und den Unterschied zwischen Beobachtung und Vermutung.",
          tr: "creaDIG'i, beş katmanı, teklif mantığını ve gözlemle varsayım arasındaki farkı biliyorsunuz.",
          en: "You know creaDIG, the five levels, the offer logic and the difference between observation and assumption.",
          ar: "تعرف creaDIG والطبقات الخمس ومنطق العرض والفرق بين الملاحظة والافتراض.",
        },
      },
      {
        titel: { de: "Nach 60 Tagen", tr: "60 gün sonra", en: "After 60 days", ar: "بعد 60 يومًا" },
        text: {
          de: "Sie führen begleitete Gespräche und schreiben Befunde, die jemand anders lesen und weiterverwenden kann.",
          tr: "Eşlik edilen görüşmeler yürütüyor ve başkasının okuyup kullanabileceği bulgular yazıyorsunuz.",
          en: "You run accompanied conversations and write findings someone else can read and reuse.",
          ar: "تدير أحاديث برفقة، وتكتب نتائج يستطيع غيرك قراءتها والبناء عليها.",
        },
      },
      {
        titel: { de: "Nach 90 Tagen", tr: "90 gün sonra", en: "After 90 days", ar: "بعد 90 يومًا" },
        text: {
          de: "Sie führen freigegebene Vorgänge eigenständig, fassen zuverlässig nach und wissen, wann Sie abgeben müssen.",
          tr: "Onaylanmış vakaları kendiniz yürütüyor, düzenli takip ediyor ve ne zaman devretmeniz gerektiğini biliyorsunuz.",
          en: "You run approved cases on your own, follow up reliably and know when to hand over.",
          ar: "تدير الحالات المعتمدة بنفسك، وتتابع بانتظام، وتعرف متى تُحيل.",
        },
      },
    ] as Punkt[],
  },
}

/* ═════════════════════════════════════════════════════════════════════════
 * SPUR B · FOUNDING TALENT
 * ═════════════════════════════════════════════════════════════════════════ */

export const spurB = {
  lead: {
    de: "Founding Talent ist kein Praktikum und kein Trainee-Pool. Es ist die Spur für Leute, die ein Handwerk ernst nehmen — Produkt, Engineering, Design, Automation, KI — und die dabei sein wollen, wenn eine Arbeitsweise entsteht, statt eine fertige zu übernehmen.",
    tr: "Founding Talent ne staj ne de trainee havuzu. Bir zanaatı ciddiye alanlar için bir yol — ürün, engineering, tasarım, otomasyon, yapay zekâ — ve hazır bir çalışma biçimini devralmak yerine biçimin kurulduğu anda orada olmak isteyenler için.",
    en: "Founding Talent is not an internship and not a trainee pool. It is the track for people who take a craft seriously — product, engineering, design, automation, AI — and who want to be there while a way of working is formed, instead of inheriting a finished one.",
    ar: "‏Founding Talent ليس تدريبًا ولا مجموعة متدرّبين. إنه مسار لمن يأخذ حرفته على محمل الجدّ — المنتج والهندسة والتصميم والأتمتة والذكاء الاصطناعي — ولمن يريد الحضور بينما تتشكّل طريقة العمل، بدل أن يرث واحدة جاهزة.",
  } as Localized,

  wasFounding: {
    eyebrow: { de: "Was „Founding“ heißt", tr: "„Founding“ ne demek", en: "What „founding“ means", ar: "ما معنى «Founding»" } as Localized,
    ist: [
      {
        de: "Sie sind unter den Ersten, die in Istanbul für creaDIG bauen.",
        tr: "İstanbul'da creaDIG için üretecek ilk kişilerden birisiniz.",
        en: "You are among the first to build for creaDIG in Istanbul.",
        ar: "أنت من أوائل من يبنون لـ creaDIG في إسطنبول.",
      },
      {
        de: "Sie arbeiten direkt mit dem Inhaber und Systemarchitekten, nicht über drei Ebenen hinweg.",
        tr: "Üç kademe üzerinden değil, doğrudan sahibi ve sistem mimarıyla çalışırsınız.",
        en: "You work directly with the owner and system architect, not across three layers.",
        ar: "تعمل مباشرة مع صاحب المنشأة ومهندس النظام، لا عبر ثلاث طبقات.",
      },
      {
        de: "Was Sie an der Arbeitsweise verbessern, bleibt — es gibt noch keinen Prozess, der Sie überstimmt.",
        tr: "Çalışma biçiminde iyileştirdiğiniz şey kalır — sizi geçersiz kılacak bir süreç henüz yok.",
        en: "What you improve about the way of working stays — there is no process yet to overrule you.",
        ar: "ما تحسّنه في طريقة العمل يبقى — لا توجد عملية بعدُ تُلغي رأيك.",
      },
    ] as Localized[],
    istNicht: [
      {
        de: "Keine Gründerrolle, keine Firmenanteile, kein Titel als Mitgründer.",
        tr: "Kurucu rolü değil, hisse değil, kurucu ortak unvanı değil.",
        en: "Not a founder role, no equity, no co-founder title.",
        ar: "ليس دور مؤسّس، ولا حصص، ولا لقب شريك مؤسّس.",
      },
      {
        de: "Kein „jeder macht alles“. Ihr Handwerk bleibt Ihr Handwerk.",
        tr: "„Herkes her işi yapar“ değil. Zanaatınız zanaatınız olarak kalır.",
        en: "Not „everyone does everything“. Your craft stays your craft.",
        ar: "ليس «الجميع يفعل كل شيء». حرفتك تبقى حرفتك.",
      },
      {
        de: "Keine unbezahlte Arbeit und keine Probeprojekte für Kunden.",
        tr: "Ücretsiz çalışma yok, müşteri için deneme projesi yok.",
        en: "No unpaid work and no trial projects for clients.",
        ar: "لا عمل بلا أجر ولا مشاريع تجريبية لعملاء.",
      },
    ] as Localized[],
  },

  worauf: {
    eyebrow: { de: "Worauf wir sehen", tr: "Neye bakıyoruz", en: "What we look at", ar: "على ماذا ننظر" } as Localized,
    titel: {
      de: "Wir lesen, was Sie gebaut haben — nicht, wo Sie waren.",
      tr: "Nerede bulunduğunuzu değil, ne yaptığınızı okuruz.",
      en: "We read what you built — not where you have been.",
      ar: "نقرأ ما بنيتَه — لا أين كنت.",
    } as Localized,
    fragen: [
      { de: "Was haben Sie gemacht — und was davon war Ihr Anteil?", tr: "Ne yaptınız — ve bunun ne kadarı sizin payınızdı?", en: "What did you make — and which part was yours?", ar: "ماذا صنعت — وأيّ جزء كان لك؟" },
      { de: "Was ist dabei kaputtgegangen?", tr: "Bu sırada ne bozuldu?", en: "What broke along the way?", ar: "ما الذي انكسر أثناء ذلك؟" },
      { de: "Was haben Sie daraus gelernt?", tr: "Bundan ne öğrendiniz?", en: "What did you learn from it?", ar: "ماذا تعلّمت منه؟" },
      { de: "Was haben Sie nach einer Rückmeldung geändert?", tr: "Bir geri bildirimden sonra neyi değiştirdiniz?", en: "What did you change after feedback?", ar: "ما الذي غيّرته بعد ملاحظة؟" },
      { de: "Wo hat KI geholfen — und woran haben Sie das Ergebnis geprüft?", tr: "Yapay zekâ nerede yardımcı oldu — ve sonucu neye göre denetlediniz?", en: "Where did AI help — and how did you check the result?", ar: "أين ساعد الذكاء الاصطناعي — وكيف تحقّقت من النتيجة؟" },
    ] as Localized[],
    nachweisLabel: {
      de: "Als Nachweis zählt alles, was man sich ansehen kann",
      tr: "Bakılabilen her şey kanıt sayılır",
      en: "Anything one can actually look at counts as evidence",
      ar: "كل ما يمكن الاطّلاع عليه يُعدّ دليلًا",
    } as Localized,
    nachweise: [
      { de: "Repository", tr: "Depo", en: "Repository", ar: "مستودع" },
      { de: "Portfolio", tr: "Portfolyo", en: "Portfolio", ar: "معرض أعمال" },
      { de: "Ein laufendes Produkt", tr: "Çalışan bir ürün", en: "A running product", ar: "منتج يعمل" },
      { de: "Eine Bildschirmaufzeichnung", tr: "Ekran kaydı", en: "A screen recording", ar: "تسجيل شاشة" },
      { de: "Ein Semester- oder Eigenprojekt", tr: "Dönem ya da kişisel proje", en: "A term or personal project", ar: "مشروع فصلي أو شخصي" },
      { de: "Eine Automation, die etwas erledigt", tr: "Bir işi halleden otomasyon", en: "An automation that does something", ar: "أتمتة تنجز شيئًا" },
    ] as Localized[],
    keinLebenslauf: {
      de: "Ein Lebenslauf ist nicht nötig. Wenn Sie einen schicken wollen, lesen wir ihn — aber er entscheidet nichts, was der Link auf Ihre Arbeit nicht besser beantwortet.",
      tr: "CV gerekmez. Göndermek isterseniz okuruz — ama işinize giden bağlantının daha iyi cevapladığı hiçbir şeyi belirlemez.",
      en: "A CV is not required. If you want to send one we will read it — but it decides nothing that the link to your work answers better.",
      ar: "السيرة الذاتية ليست مطلوبة. إن أردت إرسالها فسنقرأها — لكنها لا تحسم شيئًا يجيب عنه رابط عملك بشكل أفضل.",
    } as Localized,
  },

  ki: {
    eyebrow: { de: "KI im Alltag", tr: "Günlük işte yapay zekâ", en: "AI in daily work", ar: "الذكاء الاصطناعي في العمل اليومي" } as Localized,
    titel: {
      de: "Wir arbeiten mit KI. Die Verantwortung bleibt beim Menschen.",
      tr: "Yapay zekâ ile çalışıyoruz. Sorumluluk insanda kalıyor.",
      en: "We work with AI. The responsibility stays human.",
      ar: "نعمل بالذكاء الاصطناعي. وتبقى المسؤولية بشرية.",
    } as Localized,
    text: {
      de: "Wir erwarten nicht, dass jemand ohne KI arbeitet, und wir erwarten auch nicht, dass jemand ihr glaubt. Der Unterschied, auf den es ankommt: Zerlegt jemand eine Aufgabe so, dass er das Ergebnis überhaupt prüfen kann — und weiß er, was er nicht automatisieren würde und wo Kundendaten nichts zu suchen haben.",
      tr: "Kimsenin yapay zekâsız çalışmasını beklemiyoruz; ona inanmasını da beklemiyoruz. Asıl fark şu: Kişi görevi, sonucu denetleyebilecek şekilde parçalara ayırıyor mu — ve neyi otomatikleştirmeyeceğini, müşteri verisinin nerede işi olmadığını biliyor mu.",
      en: "We do not expect anyone to work without AI, and we do not expect anyone to believe it either. The difference that matters: does someone break a task down so the result can be checked at all — and do they know what they would not automate and where client data has no business being.",
      ar: "لا نتوقّع أن يعمل أحد دون ذكاء اصطناعي، ولا نتوقّع أن يصدّقه. الفارق المهم: هل يفكّك المهمة بحيث يمكن التحقّق من النتيجة أصلًا — وهل يعرف ما لن يُؤتمته وأين لا مكان لبيانات العملاء.",
    } as Localized,
  },
}

/* ═════════════════════════════════════════════════════════════════════════
 * BEWERBEN
 * ═════════════════════════════════════════════════════════════════════════ */

export const bewerben = {
  eyebrow: { de: "Vorstellen", tr: "Tanışma", en: "Introduce yourself", ar: "التعريف" } as Localized,
  titel: {
    de: "Vier Schritte. Kein Lebenslauf.",
    tr: "Dört adım. CV yok.",
    en: "Four steps. No CV.",
    ar: "أربع خطوات. بلا سيرة ذاتية.",
  } as Localized,
  lead: {
    de: "Wir fragen nur, was wir für den ersten Schritt wirklich brauchen. Kein Geburtsdatum, keine Adresse, kein Foto.",
    tr: "İlk adım için gerçekten gerekeni soruyoruz. Doğum tarihi yok, adres yok, fotoğraf yok.",
    en: "We only ask for what the first step genuinely needs. No date of birth, no address, no photo.",
    ar: "نسأل فقط عمّا تحتاجه الخطوة الأولى فعلًا. لا تاريخ ميلاد ولا عنوان ولا صورة.",
  } as Localized,
  schritte: [
    { de: "Ihre Spur", tr: "Yolunuz", en: "Your track", ar: "مسارك" },
    { de: "Kontakt", tr: "İletişim", en: "Contact", ar: "التواصل" },
    { de: "Ihre Arbeit", tr: "İşiniz", en: "Your work", ar: "عملك" },
    { de: "Kurz zu Ihnen", tr: "Kısaca siz", en: "A little context", ar: "لمحة عنك" },
  ] as Localized[],
  felder: {
    name: { de: "Name", tr: "Ad", en: "Name", ar: "الاسم" } as Localized,
    email: { de: "E-Mail", tr: "E-posta", en: "Email", ar: "البريد الإلكتروني" } as Localized,
    ort: { de: "Wo Sie leben (optional)", tr: "Yaşadığınız yer (isteğe bağlı)", en: "Where you live (optional)", ar: "أين تعيش (اختياري)" } as Localized,
    disziplinen: { de: "Welche Handwerke?", tr: "Hangi alanlar?", en: "Which crafts?", ar: "أيّ الحِرَف؟" } as Localized,
    nachweise: { de: "Links auf Ihre Arbeit", tr: "İşinize bağlantılar", en: "Links to your work", ar: "روابط إلى عملك" } as Localized,
    nachweisHinweis: {
      de: "Mindestens einer. Repository, Portfolio, ein laufendes Produkt, eine Aufzeichnung — was Sie zeigen können.",
      tr: "En az bir tane. Depo, portfolyo, çalışan bir ürün, bir kayıt — gösterebildiğiniz ne varsa.",
      en: "At least one. Repository, portfolio, a running product, a recording — whatever you can show.",
      ar: "واحد على الأقل. مستودع أو أعمال أو منتج يعمل أو تسجيل — ما تستطيع عرضه.",
    } as Localized,
    warum: { de: "Warum creaDIG?", tr: "Neden creaDIG?", en: "Why creaDIG?", ar: "لماذا creaDIG؟" } as Localized,
    gebaut: {
      de: "Woran haben Sie zuletzt gearbeitet? (optional)",
      tr: "Son olarak ne üzerinde çalıştınız? (isteğe bağlı)",
      en: "What did you work on most recently? (optional)",
      ar: "على ماذا عملت مؤخرًا؟ (اختياري)",
    } as Localized,
    sprachen: {
      de: "Sprachen (optional)",
      tr: "Diller (isteğe bağlı)",
      en: "Languages (optional)",
      ar: "اللغات (اختياري)",
    } as Localized,
    verfuegbar: {
      de: "Ab wann könnten Sie? (optional)",
      tr: "Ne zamandan itibaren müsaitsiniz? (isteğe bağlı)",
      en: "From when would you be available? (optional)",
      ar: "متى يمكنك البدء؟ (اختياري)",
    } as Localized,
  },
  weiter: { de: "Weiter", tr: "Devam", en: "Continue", ar: "متابعة" } as Localized,
  abschliessen: {
    de: "Angaben zusammenstellen",
    tr: "Bilgileri derle",
    en: "Assemble your answers",
    ar: "اجمع إجاباتك",
  } as Localized,
  zurueck: { de: "Zurück", tr: "Geri", en: "Back", ar: "رجوع" } as Localized,
  pflichtFehlt: {
    de: "Diese Angabe brauchen wir noch.",
    tr: "Bu bilgi hâlâ gerekli.",
    en: "We still need this.",
    ar: "ما زلنا بحاجة إلى هذه المعلومة.",
  } as Localized,
  emailUngueltig: {
    de: "Diese E-Mail-Adresse können wir nicht lesen.",
    tr: "Bu e-posta adresini okuyamıyoruz.",
    en: "We cannot read this email address.",
    ar: "لا نستطيع قراءة هذا البريد الإلكتروني.",
  } as Localized,

  /*
   * DER SCHLUSS — und der Grund, warum hier kein „Danke, gespeichert" steht.
   *
   * Es gibt heute keinen Speicher fuer Bewerbungen. Eine Bestaetigung waere
   * die teuerste Luege dieser Seite: Jemand haette seine Arbeit geschickt und
   * wuerde warten. Also sagt der letzte Schritt, was wirklich ist — und nennt
   * den Weg, der heute funktioniert.
   */
  abschlussTitel: {
    de: "Die Annahme über dieses Formular ist noch nicht scharf.",
    tr: "Bu form üzerinden alım henüz aktif değil.",
    en: "Intake through this form is not live yet.",
    ar: "الاستقبال عبر هذا النموذج ليس مفعّلًا بعد.",
  } as Localized,
  abschlussText: {
    de: "Wir speichern hier noch nichts — und wir wollen Ihnen keine Bestätigung zeigen, hinter der niemand steht. Bis die Annahme steht, geht der Weg über eine E-Mail: Nehmen Sie Ihre Angaben von hier, schicken Sie sie an uns, und wir antworten.",
    tr: "Burada henüz hiçbir şey kaydetmiyoruz — ve arkasında kimsenin olmadığı bir onay göstermek istemiyoruz. Alım devreye girene kadar yol e-posta üzerinden: Buradaki bilgileri alın, bize gönderin, cevap verelim.",
    en: "We do not store anything here yet — and we will not show you a confirmation with nobody behind it. Until intake is live, the route is email: take your answers from here, send them to us, and we will reply.",
    ar: "لا نخزّن شيئًا هنا بعد — ولن نعرض تأكيدًا لا أحد خلفه. وحتى يُفعَّل الاستقبال، الطريق عبر البريد: خذ إجاباتك من هنا وأرسلها إلينا، وسنردّ.",
  } as Localized,
  abschlussCta: {
    de: "Angaben als E-Mail öffnen",
    tr: "Bilgileri e-posta olarak aç",
    en: "Open your answers as an email",
    ar: "افتح إجاباتك كبريد إلكتروني",
  } as Localized,
  abschlussKopieren: {
    de: "Angaben kopieren",
    tr: "Bilgileri kopyala",
    en: "Copy your answers",
    ar: "انسخ إجاباتك",
  } as Localized,
  kopiert: { de: "Kopiert.", tr: "Kopyalandı.", en: "Copied.", ar: "تم النسخ." } as Localized,
}
