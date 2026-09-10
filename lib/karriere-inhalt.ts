import type { Localized } from "@/lib/site-data"

/*
 * ===========================================================================
 * KARRIERE — DER TEXT
 * ===========================================================================
 *
 * Getrennt von `lib/karriere.ts`: Dort steht, was WAHR ist (Zustand, Spur,
 * Sprache, Nachweis). Hier steht, wie es gesagt wird.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESE DATEI EINMAL NEU GESCHRIEBEN WURDE
 *
 * Die erste Fassung war nicht falsch — sie war unlesbar. Gemessen bei
 * 1440 px: zehn Abschnitte, achtzehn Eyebrow-Label, neun H2, 1.035 Woerter,
 * 9.340 Pixel. Jeder Abschnitt hatte dieselbe Form: Label, Ueberschrift,
 * Absatz, Raster. Zehnmal dieselbe Lautstaerke ergibt keine Hierarchie,
 * sondern eine Liste — und in einer Liste verliert man sich.
 *
 * Dazu kam ein zweiter Fehler: Die Seite erzaehlte einen STANDORT. Wo ein
 * Team entstehen soll, war die Hauptfigur, obwohl der Owner Menschen sucht
 * und nicht ein Buero. Beides ist hier weg.
 *
 * Jetzt vier Kapitel, und jedes beantwortet genau eine Frage:
 *
 *   1 · DAS SYSTEM        Was baut creaDIG — und warum braucht das Menschen?
 *   2 · DEIN PLATZ        Wo koennte ich darin wirken?
 *   3 · KENNENLERNEN      Wie findet creaDIG heraus, ob wir zusammenpassen?
 *   4 · DER STAND         Was kann ich heute tun?
 *
 * Was keine dieser vier Fragen beantwortet, steht nicht mehr hier.
 *
 * ---------------------------------------------------------------------------
 * WAS ES NICHT GIBT — und zwar, weil es nicht existiert:
 * Buero, Buerofotos, Teamfotos, Mitarbeiterstimmen, Gehalt, Zusatzleistungen,
 * Anteile, ein zugesagtes Startdatum, Bewerberzahlen, Hochschulkooperationen.
 */

export type Punkt = { titel: Localized; text: Localized }

/** Beschriftungen, die in mehreren Bausteinen vorkommen. */
export const marken = {
  arbeitsmodell: { de: "Arbeitsmodell", tr: "Çalışma modeli", en: "Work model", ar: "نموذج العمل" } as Localized,
  sprachen: { de: "Sprachen", tr: "Diller", en: "Languages", ar: "اللغات" } as Localized,
  disziplinen: { de: "Handwerke", tr: "Alanlar", en: "Crafts", ar: "الحِرَف" } as Localized,
  mehr: { de: "Diesen Weg ansehen", tr: "Bu yolu incele", en: "See this path", ar: "اطّلع على هذا المسار" } as Localized,
  heisstEs: { de: "Das heißt es", tr: "Bu demek", en: "It means", ar: "يعني ذلك" } as Localized,
  heisstEsNicht: { de: "Das heißt es nicht", tr: "Bu demek değil", en: "It does not mean", ar: "لا يعني ذلك" } as Localized,
  sprachNiveau: {
    kern: { de: "Kern", tr: "Çekirdek", en: "Core", ar: "أساسية" } as Localized,
    hilfreich: { de: "Hilfreich", tr: "Yardımcı", en: "Helpful", ar: "مفيدة" } as Localized,
    nuetzlich: { de: "Nützlich", tr: "Faydalı", en: "Useful", ar: "نافعة" } as Localized,
  },
}

/* ═════════════════════════════════════════════════════════════════════════
 * KAPITEL 1 · DAS SYSTEM
 * ═════════════════════════════════════════════════════════════════════════ */

export const kopf = {
  eyebrow: { de: "Karriere", tr: "Kariyer", en: "Careers", ar: "الوظائف" } as Localized,
  /*
   * Die These sagt das ganze Modell in einem Satz: was gebaut wird, und die
   * zwei Arten von Menschen, die es dafuer braucht. Wer nur diese Zeile
   * liest, hat den Aufbau der Seite verstanden — Kapitel 2 ist ihre
   * Ausfaltung.
   */
  titel: {
    de: "Wir bauen das System hinter Betrieben. Dafür brauchen wir Menschen, die sehen — und Menschen, die bauen.",
    tr: "İşletmelerin arkasındaki sistemi kuruyoruz. Bunun için gören insanlara ve kuran insanlara ihtiyacımız var.",
    en: "We build the system behind businesses. For that we need people who see — and people who build.",
    ar: "نبني النظام الذي يقف خلف المنشآت. ولذلك نحتاج أشخاصًا يرون — وأشخاصًا يبنون.",
  } as Localized,
  lead: {
    de: "creaDIG ist ein System-Haus für digitale Betriebe. Diese Seite beschreibt, woran wir arbeiten, welche zwei Arten von Menschen dieses System braucht und wie wir sie kennenlernen.",
    tr: "creaDIG, dijital işletmeler için bir sistem evi. Bu sayfa neyin üzerinde çalıştığımızı, bu sistemin hangi iki tür insana ihtiyaç duyduğunu ve onlarla nasıl tanıştığımızı anlatıyor.",
    en: "creaDIG is a system house for digital operations. This page describes what we work on, which two kinds of people that system needs, and how we get to know them.",
    ar: "‏creaDIG بيت أنظمة للمنشآت الرقمية. تشرح هذه الصفحة ما نعمل عليه، وأيّ نوعين من الناس يحتاجهما هذا النظام، وكيف نتعرّف عليهم.",
  } as Localized,
  /* Die Wahrheit steht oben — aber als ruhige Zeile, nicht als Absage. */
  standKurz: {
    de: "Aktuell ist keine Stelle ausgeschrieben. Wir lernen Menschen kennen, bevor wir sie brauchen.",
    tr: "Şu anda açık pozisyon yok. İnsanları ihtiyaç duymadan önce tanıyoruz.",
    en: "No position is advertised right now. We get to know people before we need them.",
    ar: "لا توجد وظيفة معلنة حاليًا. نتعرّف على الأشخاص قبل أن نحتاجهم.",
  } as Localized,
  standCta: {
    de: "Die beiden Wege ansehen",
    tr: "İki yolu incele",
    en: "See the two paths",
    ar: "اطّلع على المسارين",
  } as Localized,
}

export const system = {
  eyebrow: { de: "Kapitel 1 · Das System", tr: "Bölüm 1 · Sistem", en: "Chapter 1 · The system", ar: "الفصل 1 · النظام" } as Localized,
  titel: {
    de: "Nicht Websites. Betriebe, die danach anders laufen.",
    tr: "Web siteleri değil. Sonrasında farklı işleyen işletmeler.",
    en: "Not websites. Businesses that run differently afterwards.",
    ar: "ليست مواقع. بل منشآت تعمل بعدها بشكل مختلف.",
  } as Localized,
  text: {
    de: "Ein Betrieb bekommt eine Anfrage über WhatsApp. Jemand schreibt sie in eine Tabelle. Ein Angebot entsteht in Word, die Nachfassung im Kopf, der Status in einem Gespräch auf dem Flur. Sichtbar ist davon nichts — bis etwas untergeht. Diese unsichtbare Hälfte ist unsere Arbeit.",
    tr: "Bir işletmeye WhatsApp'tan talep gelir. Biri bunu tabloya yazar. Teklif Word'de doğar, takip akılda kalır, durum koridordaki bir konuşmada. Bunların hiçbiri görünmez — bir şey kaybolana kadar. Bu görünmeyen yarı bizim işimiz.",
    en: "A business receives an enquiry via WhatsApp. Someone types it into a spreadsheet. A quote appears in Word, the follow-up lives in someone's head, the status in a hallway conversation. None of it is visible — until something gets lost. That invisible half is our work.",
    ar: "تصل منشأةً طلبٌ عبر واتساب. يكتبه أحدهم في جدول. يُصاغ العرض في وورد، وتبقى المتابعة في الذاكرة، والحالة في حديث عابر. لا شيء من ذلك مرئي — حتى يضيع شيء. هذا النصف غير المرئي هو عملنا.",
  } as Localized,

  /*
   * DAS EINE BILD DER SEITE.
   *
   * Es ersetzt zwei Dinge, die vorher getrennt dastanden: die
   * Standort-Bruecke (weg) und die siebenstufige Arbeitsweise (hier
   * zusammengefasst). Und es tut, was keines von beiden tat — es zeigt, WO
   * ein Mensch in diesem System steht.
   *
   * Drei Saeulen, weil es drei Arten von Beitrag gibt. Darunter steht, wer
   * dort arbeitet: verstehen ist die eine Spur, bauen und betreiben die
   * andere. Damit ist Kapitel 2 schon beantwortet, bevor es anfaengt.
   */
  bild: {
    quelleLabel: { de: "Ausgangspunkt", tr: "Başlangıç", en: "Starting point", ar: "نقطة البداية" } as Localized,
    quelle: {
      de: "Ein Betrieb, in dem die Arbeit an Zetteln, Tabellen und drei Programmen hängt, die nichts voneinander wissen.",
      tr: "İşin kâğıtlara, tablolara ve birbirinden habersiz üç programa bağlı olduğu bir işletme.",
      en: "A business where the work hangs on notes, spreadsheets and three programs that know nothing about each other.",
      ar: "منشأة يتعلّق عملها بأوراق وجداول وثلاثة برامج لا يعرف أحدها الآخر.",
    } as Localized,
    saeulen: [
      {
        titel: { de: "Verstehen", tr: "Anlamak", en: "Understand", ar: "الفهم" },
        text: {
          de: "Sehen, was wirklich passiert. Fragen, bis die Annahme zur Tatsache wird oder fällt.",
          tr: "Gerçekte ne olduğunu görmek. Varsayım gerçeğe dönüşene ya da düşene kadar sormak.",
          en: "See what actually happens. Ask until the assumption becomes a fact or falls apart.",
          ar: "رؤية ما يحدث فعلًا. والسؤال حتى يصير الافتراض حقيقة أو يسقط.",
        },
        wer: { de: "Business Development", tr: "İş geliştirme", en: "Business development", ar: "تطوير الأعمال" },
      },
      {
        titel: { de: "Bauen", tr: "Kurmak", en: "Build", ar: "البناء" },
        text: {
          de: "Marke, Auftritt, Software, Automation — was der Ablauf braucht, damit er ohne Zuruf läuft.",
          tr: "Marka, görünüm, yazılım, otomasyon — akışın seslenmeden yürümesi için gereken ne varsa.",
          en: "Brand, presence, software, automation — whatever the process needs to run without being nudged.",
          ar: "العلامة والحضور والبرمجيات والأتمتة — ما يحتاجه المسار ليعمل دون تنبيه.",
        },
        wer: { de: "Produkt & Systeme", tr: "Ürün & Sistemler", en: "Product & systems", ar: "المنتج والأنظمة" },
      },
      {
        titel: { de: "Betreiben", tr: "İşletmek", en: "Operate", ar: "التشغيل" },
        text: {
          de: "Wir übergeben nicht und verschwinden. Was im Betrieb auffällt, ändert die Methode.",
          tr: "Teslim edip kaybolmuyoruz. İşleyişte fark edilen şey yöntemi değiştirir.",
          en: "We do not hand over and disappear. What surfaces in operation changes the method.",
          ar: "لا نُسلّم ونختفي. وما يظهر أثناء التشغيل يغيّر المنهج.",
        },
        wer: { de: "Produkt & Systeme", tr: "Ürün & Sistemler", en: "Product & systems", ar: "المنتج والأنظمة" },
      },
    ],
    ebenenLabel: {
      de: "Gebaut wird auf fünf Ebenen — jede ist eine Leistung und eine Aufgabe zugleich",
      tr: "Beş katmanda kuruluyor — her biri hem bir hizmet hem bir görev",
      en: "Built across five levels — each one is a service and a job at once",
      ar: "يُبنى على خمس طبقات — كل واحدة خدمة ومهمّة في آنٍ واحد",
    } as Localized,
  },
}

/* ═════════════════════════════════════════════════════════════════════════
 * KAPITEL 2 · DEIN PLATZ
 * ═════════════════════════════════════════════════════════════════════════ */

export const platz = {
  eyebrow: { de: "Kapitel 2 · Dein Platz", tr: "Bölüm 2 · Senin yerin", en: "Chapter 2 · Your place", ar: "الفصل 2 · مكانك" } as Localized,
  titel: {
    de: "Zwei Wege. Derselbe Betrieb, ein anderer Blick darauf.",
    tr: "İki yol. Aynı işletme, ona farklı bir bakış.",
    en: "Two paths. The same business, a different way of looking at it.",
    ar: "مساران. المنشأة نفسها، ونظرة مختلفة إليها.",
  } as Localized,
  lead: {
    de: "Beide arbeiten am selben System. Der Unterschied liegt darin, an welcher Stelle jemand hineingeht — vorn, wo man den Betrieb liest, oder dort, wo daraus etwas Gebautes wird.",
    tr: "İkisi de aynı sistem üzerinde çalışıyor. Fark, kişinin sisteme nereden girdiğinde — işletmenin okunduğu önde mi, yoksa bunun kurulmuş bir şeye dönüştüğü yerde mi.",
    en: "Both work on the same system. The difference is where you enter it — at the front, where the business is read, or where that turns into something built.",
    ar: "كلاهما يعمل على النظام نفسه. الفرق في نقطة الدخول — من المقدّمة حيث تُقرأ المنشأة، أو حيث يتحوّل ذلك إلى شيء مبني.",
  } as Localized,
}

/* ═════════════════════════════════════════════════════════════════════════
 * KAPITEL 3 · SO LERNEN WIR DICH KENNEN
 * ═════════════════════════════════════════════════════════════════════════ */

/*
 * Hier standen vorher DREI Abschnitte: sieben Arbeitsschritte, sechs
 * Haltungspunkte und fuenf Auswahlschritte — 18 Elemente, die alle dieselbe
 * Frage beantworteten. Jetzt vier Schritte und drei Regeln.
 */
export const kennenlernen = {
  eyebrow: { de: "Kapitel 3 · Kennenlernen", tr: "Bölüm 3 · Tanışma", en: "Chapter 3 · Getting to know you", ar: "الفصل 3 · التعارف" } as Localized,
  titel: {
    de: "Wir lesen, was Sie gebaut haben — nicht, wo Sie waren.",
    tr: "Nerede bulunduğunuzu değil, ne yaptığınızı okuruz.",
    en: "We read what you built — not where you have been.",
    ar: "نقرأ ما بنيتَه — لا أين كنت.",
  } as Localized,
  lead: {
    de: "Kein Lebenslauf, kein Anschreiben, keine Notenübersicht. Vier Schritte, und nach jedem wissen Sie, woran Sie sind.",
    tr: "CV yok, ön yazı yok, not dökümü yok. Dört adım; her birinden sonra nerede durduğunuzu bilirsiniz.",
    en: "No CV, no cover letter, no transcript. Four steps, and after each one you know where you stand.",
    ar: "لا سيرة ذاتية ولا خطاب تقديم ولا كشف درجات. أربع خطوات، وبعد كلٍّ منها تعرف أين تقف.",
  } as Localized,
  schritte: [
    {
      titel: { de: "Zeigen", tr: "Göstermek", en: "Show", ar: "أرِنا" },
      text: {
        de: "Ein kurzes Formular und ein Link auf etwas, das Sie gemacht haben — Repository, Portfolio, ein laufendes Produkt, eine Aufzeichnung.",
        tr: "Kısa bir form ve yaptığınız bir şeye bağlantı — depo, portfolyo, çalışan bir ürün, bir kayıt.",
        en: "A short form and a link to something you made — repository, portfolio, a running product, a recording.",
        ar: "نموذج قصير ورابط لشيء صنعته — مستودع أو أعمال أو منتج يعمل أو تسجيل.",
      },
    },
    {
      titel: { de: "Sprechen", tr: "Konuşmak", en: "Talk", ar: "نتحدّث" },
      text: {
        de: "Wir reden über eine Sache, die Sie gemacht haben. Was war Ihr Anteil, was ist kaputtgegangen, was haben Sie danach geändert.",
        tr: "Yaptığınız bir iş üzerine konuşuruz. Payınız neydi, ne bozuldu, sonrasında neyi değiştirdiniz.",
        en: "We talk about one thing you made. What was your part, what broke, what you changed afterwards.",
        ar: "نتحدّث عن شيء واحد صنعته. ما دورك، وما الذي انكسر، وما الذي غيّرته بعدها.",
      },
    },
    {
      titel: { de: "Ausprobieren", tr: "Denemek", en: "Try it", ar: "نجرّب" },
      text: {
        de: "Eine kleine, abgegrenzte Denkaufgabe, die zur Spur passt. Kurz, nie echte Kundenarbeit — und KI dürfen Sie benutzen.",
        tr: "Yola uygun, küçük ve sınırlı bir düşünme görevi. Kısa, asla gerçek müşteri işi değil — ve yapay zekâyı kullanabilirsiniz.",
        en: "A small, bounded thinking task that fits the path. Short, never real client work — and you may use AI.",
        ar: "مهمّة تفكير صغيرة ومحدّدة تناسب المسار. قصيرة، وليست عمل عميل حقيقي أبدًا — ويمكنك استخدام الذكاء الاصطناعي.",
      },
    },
    {
      titel: { de: "Entscheiden", tr: "Karar", en: "Decide", ar: "نقرّر" },
      text: {
        de: "Gemeinsam, mit einer Rückmeldung, die eine Begründung trägt — auch wenn es nicht passt.",
        tr: "Birlikte; gerekçesi olan bir geri bildirimle — uymadığında da.",
        en: "Together, with a response that carries a reason — including when it is not a fit.",
        ar: "معًا، مع ردٍّ يحمل سببًا — حتى عند عدم التوافق.",
      },
    },
  ] as Punkt[],
  regelnLabel: {
    de: "Drei Regeln, die dabei gelten",
    tr: "Bu sırada geçerli üç kural",
    en: "Three rules that apply throughout",
    ar: "ثلاث قواعد تسري طوال ذلك",
  } as Localized,
  regeln: [
    {
      titel: { de: "Belege statt Vermutungen", tr: "Varsayım değil kanıt", en: "Evidence, not assumptions", ar: "أدلّة لا افتراضات" },
      text: {
        de: "„Weiß ich noch nicht“ ist eine vollständige Antwort, wenn danach steht, wie man es herausfindet. Aus Unsicherheit wird bei uns keine Gewissheit gemacht.",
        tr: "Arkasından nasıl öğrenileceği geliyorsa, „henüz bilmiyorum“ tam bir cevaptır. Belirsizliği kesinliğe çevirmeyiz.",
        en: "„I don't know yet“ is a complete answer if it is followed by how you would find out. We do not convert uncertainty into certainty.",
        ar: "«لا أعرف بعد» جواب كامل إذا تبعه كيف ستكتشف. لا نحوّل عدم اليقين إلى يقين.",
      },
    },
    {
      titel: { de: "Keine Gratisarbeit", tr: "Bedava iş yok", en: "No free work", ar: "لا عمل مجّاني" },
      text: {
        de: "Die Aufgabe ist nie ein echtes Kundenprojekt. Wenn sie ein Wochenende kostet, ist sie falsch gestellt.",
        tr: "Görev asla gerçek bir müşteri projesi değildir. Bir hafta sonunu alıyorsa yanlış kurulmuştur.",
        en: "The task is never a real client project. If it costs a weekend, it was set badly.",
        ar: "المهمّة ليست مشروع عميل حقيقي أبدًا. وإن كلّفت عطلة أسبوع فقد صيغت خطأ.",
      },
    },
    {
      titel: { de: "KI mit Urteil", tr: "Yargıyla yapay zekâ", en: "AI with judgment", ar: "ذكاء اصطناعي مع حُكم" },
      text: {
        de: "Benutzen Sie KI, wo sie schneller ist. Sagen Sie dazu, was sie gemacht hat, was Sie gemacht haben und woran Sie das Ergebnis geprüft haben.",
        tr: "Hızlandırdığı yerde yapay zekâyı kullanın. Onun ne yaptığını, sizin ne yaptığınızı ve sonucu neye göre denetlediğinizi söyleyin.",
        en: "Use AI where it is faster. Tell us what it did, what you did, and how you checked the result.",
        ar: "استخدم الذكاء الاصطناعي حيث يكون أسرع. وأخبرنا ماذا فعل، وماذا فعلت أنت، وكيف تحقّقت من النتيجة.",
      },
    },
  ] as Punkt[],
  nichtBewertet: {
    de: "Nicht bewertet werden Kamera, Licht, Raum, Kleidung, Akzent und Schnitt. Wir sehen auf den Gedanken, nicht auf die Vorführung.",
    tr: "Kamera, ışık, mekân, kıyafet, aksan ve kurgu değerlendirilmez. Sunuma değil düşünceye bakarız.",
    en: "We do not assess camera, light, room, clothing, accent or editing. We look at the thinking, not the performance.",
    ar: "لا نقيّم الكاميرا أو الإضاءة أو المكان أو الملابس أو اللهجة أو المونتاج. ننظر إلى التفكير لا إلى العرض.",
  } as Localized,
}

/* ═════════════════════════════════════════════════════════════════════════
 * KAPITEL 4 · DER STAND
 * ═════════════════════════════════════════════════════════════════════════ */

export const stand = {
  eyebrow: { de: "Kapitel 4 · Der Stand", tr: "Bölüm 4 · Durum", en: "Chapter 4 · Where things stand", ar: "الفصل 4 · الوضع" } as Localized,
  titel: {
    de: "Was Sie heute tun können.",
    tr: "Bugün ne yapabilirsiniz.",
    en: "What you can do today.",
    ar: "ما يمكنك فعله اليوم.",
  } as Localized,
  text: {
    de: "Keine der beiden Spuren ist heute eine ausgeschriebene Stelle. Wir lernen jetzt Menschen kennen, mit denen wir arbeiten wollen, sobald es so weit ist — mit Gespräch, ohne Zusage. Wer sich vorstellt, bekommt eine Antwort.",
    tr: "İki yol da bugün ilan edilmiş bir pozisyon değil. Zamanı geldiğinde birlikte çalışmak istediğimiz insanlarla şimdiden tanışıyoruz — görüşme var, taahhüt yok. Kendini tanıtan bir cevap alır.",
    en: "Neither path is an advertised position today. We are getting to know the people we want to work with once the time comes — a conversation, not a commitment. Everyone who introduces themselves gets a reply.",
    ar: "لا يمثّل أيٌّ من المسارين وظيفة معلنة اليوم. نتعرّف الآن على من نريد العمل معهم حين يحين الوقت — حديث، لا التزام. وكل من يعرّف بنفسه يحصل على ردّ.",
  } as Localized,
  fragen: [
    {
      titel: {
        de: "Ist das eine offene Stelle?",
        tr: "Bu açık bir pozisyon mu?",
        en: "Is this an open position?",
        ar: "هل هذه وظيفة مفتوحة؟",
      },
      text: {
        de: "Nein. Beide Wege stehen auf Talent Pool. Eine Zusage kann daraus erst werden, wenn eine Stelle wirklich freigegeben ist.",
        tr: "Hayır. İki yol da yetenek havuzunda. Taahhüt ancak bir pozisyon gerçekten onaylandığında doğabilir.",
        en: "No. Both paths are talent pool. A commitment can only follow once a position is genuinely approved.",
        ar: "لا. كلا المسارين ضمن مجموعة المواهب. ولا يأتي الالتزام إلا بعد اعتماد وظيفة فعليًا.",
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
        de: "Für Business Development ja — die Gespräche mit Betrieben finden auf Deutsch statt. Für Produkt & Systeme nicht. Gemessen wird, ob Sie ein Gespräch führen können, nicht Herkunft, Pass oder Akzent.",
        tr: "İş geliştirme için evet — işletmelerle görüşmeler Almanca yapılıyor. Ürün & Sistemler için gerekmiyor. Ölçtüğümüz şey görüşme yürütebilmeniz; köken, pasaport ya da aksan değil.",
        en: "For business development yes — the conversations with businesses happen in German. For product & systems, no. What is measured is whether you can hold a conversation, not origin, passport or accent.",
        ar: "لتطوير الأعمال نعم — فالأحاديث مع المنشآت تجري بالألمانية. أمّا المنتج والأنظمة فلا. المقياس قدرتك على إدارة حديث، لا الأصل أو الجواز أو اللهجة.",
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
        de: "Ja. Ein Semesterprojekt, das läuft, sagt mehr als eine Note. Wir lesen, was Sie gebaut haben.",
        tr: "Evet. Çalışan bir dönem projesi, bir nottan fazlasını söyler. Ne yaptığınıza bakarız.",
        en: "Yes. A term project that runs says more than a grade. We read what you built.",
        ar: "نعم. مشروع فصلي يعمل يقول أكثر من درجة. نقرأ ما بنيتَه.",
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
        de: "Wir führen noch kein Bewerbersystem. Sie stellen Ihre Angaben am Ende des Formulars zusammen und übergeben sie selbst — in den Vertriebsbestand gehören sie nicht.",
        tr: "Henüz bir başvuru sistemimiz yok. Bilgilerinizi formun sonunda derleyip kendiniz iletiyorsunuz — satış kayıtlarına ait değiller.",
        en: "We do not run an applicant system yet. You assemble your answers at the end of the form and hand them over yourself — they do not belong in the sales records.",
        ar: "لا نُشغّل نظام متقدّمين بعد. تجمع إجاباتك في نهاية النموذج وتسلّمها بنفسك — وهي لا تنتمي إلى سجلّات المبيعات.",
      },
    },
  ] as Punkt[],
}

/* ═════════════════════════════════════════════════════════════════════════
 * SPUR A · BUSINESS DEVELOPMENT
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
      de: "creaDIG verkauft heute über den Inhaber. Das funktioniert, solange er selbst im Gespräch sitzt — und es hört auf zu funktionieren, sobald er gleichzeitig bauen soll. Was fehlt, ist niemand, der Angeboten hinterherruft. Was fehlt, ist jemand, der Betriebe findet, versteht und so beschreibt, dass ein Systemgespräch überhaupt Sinn ergibt.",
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
          de: "Öffentlich sichtbare Signale sammeln — und daraus eine Frage bauen, keine Behauptung.",
          tr: "Herkese açık sinyalleri toplamak — ve bundan bir iddia değil, bir soru kurmak.",
          en: "Collect publicly visible signals — and build a question from them, not a claim.",
          ar: "جمع الإشارات العلنية — وبناء سؤال منها، لا ادّعاء.",
        },
      },
      {
        titel: { de: "Gespräche führen", tr: "Görüşme yürütmek", en: "Hold conversations", ar: "إدارة الأحاديث" },
        text: {
          de: "Auf Deutsch, mit Inhaberinnen und Betriebsleitern. Zuhören, nachfragen — und aushalten, wenn die Antwort die eigene Vermutung widerlegt.",
          tr: "Almanca, işletme sahipleri ve yöneticileriyle. Dinlemek, sormak — ve cevap kendi varsayımınızı çürüttüğünde buna katlanmak.",
          en: "In German, with owners and operations managers. Listen, ask — and accept it when the answer disproves your own assumption.",
          ar: "بالألمانية، مع أصحاب المنشآت ومديري التشغيل. الإصغاء والسؤال — وتقبّل أن يدحض الجواب افتراضك.",
        },
      },
      {
        titel: { de: "Befunde festhalten", tr: "Bulguları kayda geçirmek", en: "Record findings", ar: "توثيق النتائج" },
        text: {
          de: "Was beobachtet, was gefragt, was bestätigt, was offen — mit Fundstelle. Ohne Fundstelle ist es eine Erinnerung.",
          tr: "Ne gözlendi, ne soruldu, ne doğrulandı, ne açık kaldı — kaynağıyla. Kaynağı yoksa o bir hatıradır.",
          en: "What was observed, asked, confirmed, still open — with a source. Without a source it is a memory.",
          ar: "ما لوحظ وما سُئل وما تأكّد وما بقي مفتوحًا — مع المصدر. وبلا مصدر يصبح ذكرى.",
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
    eyebrow: { de: "Und was nicht", tr: "Ve ne değil", en: "And what not", ar: "وما لا" } as Localized,
    punkte: [
      { de: "Probleme erfinden, die niemand bestätigt hat.", tr: "Kimsenin doğrulamadığı sorunlar uydurmak.", en: "Invent problems nobody has confirmed.", ar: "اختلاق مشكلات لم يؤكّدها أحد." },
      { de: "Architektur, Umfang oder Termine zusagen.", tr: "Mimari, kapsam ya da tarih taahhüt etmek.", en: "Promise architecture, scope or dates.", ar: "الوعد ببنية أو نطاق أو مواعيد." },
      { de: "Preise verhandeln oder Nachlässe geben.", tr: "Fiyat pazarlığı yapmak ya da indirim vermek.", en: "Negotiate prices or grant discounts.", ar: "التفاوض على الأسعار أو منح خصومات." },
      { de: "Recherchierte Betriebe in Massen anschreiben.", tr: "Araştırılan işletmelere toplu mesaj atmak.", en: "Mass-contact researched businesses.", ar: "مراسلة المنشآت المبحوثة بالجملة." },
    ] as Localized[],
    grenze: {
      de: "Angebot, Preis, Architektur und die tiefere Systemberatung bleiben beim Inhaber. Das ist keine Bevormundung, sondern die Grenze, die verhindert, dass jemand im Gespräch etwas zusagt, das danach gebaut werden muss.",
      tr: "Teklif, fiyat, mimari ve derin sistem danışmanlığı sahipte kalır. Bu vesayet değil; görüşmede sonradan inşa edilmesi gereken bir şeyin söz verilmesini önleyen sınırdır.",
      en: "Offer, price, architecture and the deeper system consulting stay with the owner. That is not paternalism — it is the boundary that stops someone promising in a conversation what has to be built afterwards.",
      ar: "يبقى العرض والسعر والبنية والاستشارة النظامية العميقة لدى صاحب المنشأة. ليس هذا وصاية، بل الحدّ الذي يمنع الوعد في حديثٍ بما يجب بناؤه لاحقًا.",
    } as Localized,
  },

  /* Das stärkste Element der ersten Fassung — bleibt, unverändert in der Sache. */
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
        text: { de: "Auf der Website steht ein WhatsApp-Knopf.", tr: "Sitede bir WhatsApp düğmesi var.", en: "There is a WhatsApp button on the website.", ar: "يوجد زر واتساب على الموقع." },
        art: "beleg" as const,
      },
      {
        stufe: { de: "Beobachtung", tr: "Gözlem", en: "Observation", ar: "ملاحظة" },
        text: { de: "Kunden können den Betrieb über WhatsApp erreichen.", tr: "Müşteriler işletmeye WhatsApp'tan ulaşabiliyor.", en: "Customers can reach the business via WhatsApp.", ar: "يستطيع العملاء الوصول إلى المنشأة عبر واتساب." },
        art: "beleg" as const,
      },
      {
        stufe: { de: "Vermutung", tr: "Varsayım", en: "Hypothesis", ar: "افتراض" },
        text: { de: "Vielleicht wird jede Anfrage von Hand weiterverarbeitet.", tr: "Belki her talep elle işleniyordur.", en: "Perhaps every enquiry is processed by hand.", ar: "ربما يُعالَج كل طلب يدويًا." },
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
}

/* ═════════════════════════════════════════════════════════════════════════
 * SPUR B · PRODUKT & SYSTEME
 * ═════════════════════════════════════════════════════════════════════════ */

export const spurB = {
  lead: {
    de: "Diese Spur ist für Leute, die ein Handwerk ernst nehmen — Produkt, Engineering, Design, Automation, KI — und die etwas bauen wollen, das danach im Alltag eines Betriebs bestehen muss.",
    tr: "Bu yol, bir zanaatı ciddiye alanlar için — ürün, engineering, tasarım, otomasyon, yapay zekâ — ve sonrasında bir işletmenin gündelik akışında ayakta kalması gereken bir şey kurmak isteyenler için.",
    en: "This path is for people who take a craft seriously — product, engineering, design, automation, AI — and who want to build something that then has to hold up in a business's daily work.",
    ar: "هذا المسار لمن يأخذ حرفته على محمل الجدّ — المنتج والهندسة والتصميم والأتمتة والذكاء الاصطناعي — ولمن يريد بناء شيء عليه أن يصمد في العمل اليومي لمنشأة.",
  } as Localized,

  wasEsIst: {
    eyebrow: { de: "Der Unterschied", tr: "Fark", en: "The difference", ar: "الفرق" } as Localized,
    ist: [
      { de: "Sie bauen an einem System, das jemand danach wirklich benutzt.", tr: "Sonrasında birinin gerçekten kullanacağı bir sistemi kurarsınız.", en: "You build a system that someone actually uses afterwards.", ar: "تبني نظامًا يستخدمه أحدهم فعلًا بعد ذلك." },
      { de: "Sie arbeiten direkt mit dem Inhaber und Systemarchitekten, nicht über drei Ebenen hinweg.", tr: "Üç kademe üzerinden değil, doğrudan sahibi ve sistem mimarıyla çalışırsınız.", en: "You work directly with the owner and system architect, not across three layers.", ar: "تعمل مباشرة مع صاحب المنشأة ومهندس النظام، لا عبر ثلاث طبقات." },
      { de: "Was Sie an der Arbeitsweise verbessern, bleibt.", tr: "Çalışma biçiminde iyileştirdiğiniz şey kalır.", en: "What you improve about the way of working stays.", ar: "ما تحسّنه في طريقة العمل يبقى." },
    ] as Localized[],
    istNicht: [
      { de: "Kein „jeder macht alles“. Ihr Handwerk bleibt Ihr Handwerk.", tr: "„Herkes her işi yapar“ değil. Zanaatınız zanaatınız olarak kalır.", en: "Not „everyone does everything“. Your craft stays your craft.", ar: "ليس «الجميع يفعل كل شيء». حرفتك تبقى حرفتك." },
      { de: "Keine unbezahlte Arbeit und keine Probeprojekte für Kunden.", tr: "Ücretsiz çalışma yok, müşteri için deneme projesi yok.", en: "No unpaid work and no trial projects for clients.", ar: "لا عمل بلا أجر ولا مشاريع تجريبية لعملاء." },
      { de: "Keine Firmenanteile und kein Titel als Mitgründer.", tr: "Şirket hissesi yok, kurucu ortak unvanı yok.", en: "No equity and no co-founder title.", ar: "لا حصص ولا لقب شريك مؤسّس." },
    ] as Localized[],
  },

  gemeinsam: {
    eyebrow: { de: "Was die Handwerke verbindet", tr: "Alanları birleştiren şey", en: "What connects the crafts", ar: "ما يجمع الحِرَف" } as Localized,
    titel: {
      de: "Anderes Handwerk. Dieselbe Verantwortung für das Ergebnis.",
      tr: "Farklı zanaat. Sonuç için aynı sorumluluk.",
      en: "A different craft. The same responsibility for the result.",
      ar: "حرفة مختلفة. المسؤولية ذاتها عن النتيجة.",
    } as Localized,
    punkte: [
      { de: "Das Problem verstehen, bevor etwas entsteht.", tr: "Bir şey doğmadan önce sorunu anlamak.", en: "Understand the problem before anything is made.", ar: "فهم المشكلة قبل أن يُصنع شيء." },
      { de: "Etwas Echtes bauen, nicht eine Ansicht davon.", tr: "Gerçek bir şey kurmak, onun bir görüntüsünü değil.", en: "Build something real, not a view of it.", ar: "بناء شيء حقيقي، لا صورة عنه." },
      { de: "Die eigene Arbeit selbst prüfen, bevor sie jemand anders sieht.", tr: "Kendi işinizi, başkası görmeden önce kendiniz denetlemek.", en: "Test your own work before anyone else sees it.", ar: "فحص عملك بنفسك قبل أن يراه غيرك." },
      { de: "Nach der Übergabe wissen, was im Betrieb daraus geworden ist.", tr: "Teslimden sonra, işleyişte ne olduğunu bilmek.", en: "After handover, know what became of it in daily operation.", ar: "بعد التسليم، معرفة ما آل إليه الأمر في التشغيل." },
    ] as Localized[],
  },

  nachweise: {
    eyebrow: { de: "Was als Nachweis zählt", tr: "Neler kanıt sayılır", en: "What counts as evidence", ar: "ما يُعدّ دليلًا" } as Localized,
    liste: [
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
}

/* ═════════════════════════════════════════════════════════════════════════
 * VORSTELLEN
 * ═════════════════════════════════════════════════════════════════════════ */

export const bewerben = {
  eyebrow: { de: "Vorstellen", tr: "Tanışma", en: "Introduce yourself", ar: "التعريف" } as Localized,
  titel: { de: "Vier Schritte. Kein Lebenslauf.", tr: "Dört adım. CV yok.", en: "Four steps. No CV.", ar: "أربع خطوات. بلا سيرة ذاتية." } as Localized,
  lead: {
    de: "Wir fragen nur, was wir für den ersten Schritt wirklich brauchen. Kein Geburtsdatum, keine Adresse, kein Foto.",
    tr: "İlk adım için gerçekten gerekeni soruyoruz. Doğum tarihi yok, adres yok, fotoğraf yok.",
    en: "We only ask for what the first step genuinely needs. No date of birth, no address, no photo.",
    ar: "نسأل فقط عمّا تحتاجه الخطوة الأولى فعلًا. لا تاريخ ميلاد ولا عنوان ولا صورة.",
  } as Localized,
  schritte: [
    { de: "Ihr Weg", tr: "Yolunuz", en: "Your path", ar: "مسارك" },
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
    gebaut: { de: "Woran haben Sie zuletzt gearbeitet? (optional)", tr: "Son olarak ne üzerinde çalıştınız? (isteğe bağlı)", en: "What did you work on most recently? (optional)", ar: "على ماذا عملت مؤخرًا؟ (اختياري)" } as Localized,
    sprachen: { de: "Sprachen (optional)", tr: "Diller (isteğe bağlı)", en: "Languages (optional)", ar: "اللغات (اختياري)" } as Localized,
    verfuegbar: { de: "Ab wann könnten Sie? (optional)", tr: "Ne zamandan itibaren müsaitsiniz? (isteğe bağlı)", en: "From when would you be available? (optional)", ar: "متى يمكنك البدء؟ (اختياري)" } as Localized,
  },
  weiter: { de: "Weiter", tr: "Devam", en: "Continue", ar: "متابعة" } as Localized,
  abschliessen: { de: "Angaben zusammenstellen", tr: "Bilgileri derle", en: "Assemble your answers", ar: "اجمع إجاباتك" } as Localized,
  zurueck: { de: "Zurück", tr: "Geri", en: "Back", ar: "رجوع" } as Localized,
  pflichtFehlt: { de: "Diese Angabe brauchen wir noch.", tr: "Bu bilgi hâlâ gerekli.", en: "We still need this.", ar: "ما زلنا بحاجة إلى هذه المعلومة." } as Localized,
  emailUngueltig: { de: "Diese E-Mail-Adresse können wir nicht lesen.", tr: "Bu e-posta adresini okuyamıyoruz.", en: "We cannot read this email address.", ar: "لا نستطيع قراءة هذا البريد الإلكتروني." } as Localized,

  /*
   * Der Schluss sagt, was ist — aber als Übergabe, nicht als Störung.
   * Vorher stand dort „Die Annahme ist noch nicht scharf“; das erklärte
   * unsere Technik statt seinen nächsten Schritt.
   */
  abschlussTitel: {
    de: "Ihre Angaben stehen. Jetzt übergeben Sie sie.",
    tr: "Bilgileriniz hazır. Şimdi iletin.",
    en: "Your answers are ready. Now hand them over.",
    ar: "إجاباتك جاهزة. سلّمها الآن.",
  } as Localized,
  abschlussText: {
    de: "Wir führen noch kein Bewerbersystem — und zeigen Ihnen deshalb keine Bestätigung, hinter der niemand steht. Prüfen Sie, was unten steht, und schicken Sie es direkt an uns. Sie bekommen eine Antwort.",
    tr: "Henüz bir başvuru sistemi işletmiyoruz — bu yüzden arkasında kimsenin olmadığı bir onay göstermiyoruz. Aşağıdakini kontrol edin ve doğrudan bize gönderin. Cevap alacaksınız.",
    en: "We do not run an applicant system yet — so we will not show you a confirmation with nobody behind it. Check what is below and send it straight to us. You will get a reply.",
    ar: "لا نُشغّل نظام متقدّمين بعد — لذلك لن نعرض تأكيدًا لا أحد خلفه. راجع ما في الأسفل وأرسله إلينا مباشرة. وستحصل على ردّ.",
  } as Localized,
  abschlussCta: { de: "Als E-Mail öffnen", tr: "E-posta olarak aç", en: "Open as an email", ar: "افتح كبريد إلكتروني" } as Localized,
  abschlussKopieren: { de: "Angaben kopieren", tr: "Bilgileri kopyala", en: "Copy your answers", ar: "انسخ إجاباتك" } as Localized,
  kopiert: { de: "Kopiert.", tr: "Kopyalandı.", en: "Copied.", ar: "تم النسخ." } as Localized,
}
