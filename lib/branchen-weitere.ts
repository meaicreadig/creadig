import type { WorkflowStep } from "@/lib/branchen"
import type { Localized } from "@/lib/site-data"

/**
 * WEITERE BRANCHEN-EINSTIEGE — 24.10.2026.
 *
 * Owner: „Biz bütün şirketler için açık bir şirketiz – ama Nish sayfaları
 * kesinlikle doğru.“ Die Firma bleibt breit (Startseite, Menü); jede Nische
 * bekommt eine eigene Experten-Seite, die über die Suche und den Footer
 * gefunden wird – nicht über das Hauptmenü.
 *
 * Dieselben Regeln wie /branchen/handwerk (lib/branchen.ts):
 * - Ist gegen Soll, keine Prozentzahl, keine erfundene Ersparnis.
 * - Referenzen NUR aus genannteClientWorks (Namensfreigabe gedeckt); eine
 *   Branche ohne eigene Referenz sagt das nicht und zeigt keine.
 * - Eigenbetriebe (meaqam) erscheinen als Eigenbetrieb, nie als Kunde.
 */

export type Branche = {
  slug: string
  eyebrow: Localized
  metaTitle: Localized
  metaDescription: Localized
  title: Localized
  lead: Localized
  workflowEyebrow: Localized
  workflowTitle: Localized
  workflow: WorkflowStep[]
  buildTitle: Localized
  buildBody: Localized
  /** Slugs aus genannteClientWorks / productWorks – werden beim Rendern gegen die Freigabe gefiltert. */
  works: string[]
  /** Passende Leistungsseite, falls vorhanden. */
  leistung?: { path: string; label: Localized }
}

export const BRANCHEN: Branche[] = [
  {
    slug: "gemeinden-vereine",
    eyebrow: { de: "Branche · Gemeinden & Vereine", tr: "Sektör · Cemaatler ve dernekler", en: "Sector · communities & associations", ar: "قطاع · الجماعات والجمعيات" },
    metaTitle: {
      de: "Gemeinden, Vereine & Verbände: Mitglieder, Programme und Spenden in einem System",
      tr: "Cemaatler, dernekler ve birlikler: üyeler, programlar ve bağışlar tek sistemde",
      en: "Communities, associations & federations: members, programmes and donations in one system",
      ar: "الجماعات والجمعيات والاتحادات: الأعضاء والبرامج والتبرعات في نظام واحد",
    },
    metaDescription: {
      de: "Mitgliederlisten in Excel, Programme in WhatsApp-Gruppen, Spenden auf Zetteln. Wir bauen Gemeinden und Verbänden ein System, in dem Vorstand und Ehrenamt dieselbe Lage sehen.",
      tr: "Üye listeleri Excel'de, programlar WhatsApp gruplarında, bağışlar kâğıtta. Cemaat ve birliklere, yönetim ile gönüllülerin aynı tabloyu gördüğü bir sistem kuruyoruz.",
      en: "Member lists in Excel, programmes in WhatsApp groups, donations on slips of paper. We build communities and federations one system in which board and volunteers see the same picture.",
      ar: "قوائم الأعضاء في Excel، والبرامج في مجموعات واتساب، والتبرعات على أوراق. نبني للجماعات والاتحادات نظامًا يرى فيه المجلس والمتطوعون الصورة نفسها.",
    },
    title: {
      de: "Viel Ehrenamt. Wie viel davon geht in Listen verloren?",
      tr: "Çok fazla gönüllü emek. Ne kadarı listelerde kayboluyor?",
      en: "So much volunteer work. How much of it gets lost in lists?",
      ar: "عمل تطوعي كثير. كم منه يضيع في القوائم؟",
    },
    lead: {
      de: "Eine Gemeinde oder ein Verband lebt von Menschen, die Zeit schenken. Wenn Mitglieder, Programme, Aufgaben und Spenden in fünf verschiedenen Listen stehen, geht ein Teil dieser Zeit an die Suche statt an die Arbeit.",
      tr: "Bir cemaat ya da birlik, zamanını veren insanlarla yaşar. Üyeler, programlar, görevler ve bağışlar beş ayrı listede durunca, o zamanın bir kısmı işe değil aramaya gider.",
      en: "A community or federation lives on people who give their time. When members, programmes, tasks and donations sit in five different lists, part of that time goes into searching instead of working.",
      ar: "تعيش الجماعة أو الاتحاد بأناس يهبون وقتهم. وحين تكون العضوية والبرامج والمهام والتبرعات في خمس قوائم مختلفة، يذهب جزء من هذا الوقت إلى البحث بدل العمل.",
    },
    workflowEyebrow: { de: "Ein Jahr, fünf Abläufe", tr: "Bir yıl, beş akış", en: "One year, five workflows", ar: "سنة واحدة، خمسة مسارات" },
    workflowTitle: { de: "Wo bleibt die Zeit des Vorstands?", tr: "Yönetimin zamanı nereye gidiyor?", en: "Where does the board's time go?", ar: "أين يذهب وقت المجلس؟" },
    workflow: [
      {
        key: "mitglieder",
        label: { de: "Mitglieder", tr: "Üyeler", en: "Members", ar: "الأعضاء" },
        ist: {
          de: "Eine Excel-Datei, mehrere Stände, und niemand weiß genau, welche die aktuelle ist.",
          tr: "Bir Excel dosyası, birkaç sürümü var ve hangisinin güncel olduğunu kimse tam bilmiyor.",
          en: "One Excel file, several versions, and nobody quite knows which is current.",
          ar: "ملف Excel واحد بعدة نسخ، ولا يعرف أحد على وجه الدقة أيها الأحدث.",
        },
        soll: {
          de: "Ein Mitgliederstand für alle, mit Rechten je Rolle – der Kassierer sieht anderes als die Jugendleitung.",
          tr: "Herkes için tek bir üye kaydı, role göre yetkilerle – sayman gençlik kolundan farklı şeyler görür.",
          en: "One member record for everyone, with rights per role – the treasurer sees something different from the youth lead.",
          ar: "سجل أعضاء واحد للجميع، بصلاحيات حسب الدور – أمين الصندوق يرى غير ما يراه مسؤول الشباب.",
        },
        layer: "digital",
      },
      {
        key: "programme",
        label: { de: "Programme & Termine", tr: "Programlar ve etkinlikler", en: "Programmes & events", ar: "البرامج والمواعيد" },
        ist: {
          de: "Angekündigt in drei WhatsApp-Gruppen, gezählt wird hinterher von Hand – wenn überhaupt.",
          tr: "Üç WhatsApp grubunda duyuruluyor, katılım sonradan elle sayılıyor – sayılırsa.",
          en: "Announced in three WhatsApp groups, attendance counted by hand afterwards – if at all.",
          ar: "يُعلَن عنها في ثلاث مجموعات واتساب، ويُعدّ الحضور يدويًا بعدها – إن عُدّ.",
        },
        soll: {
          de: "Ein Kalender für alle Ortsgruppen, Anmeldung per Link, Teilnahme auf einen Blick.",
          tr: "Tüm şubeler için tek takvim, bağlantıyla kayıt, katılım tek bakışta.",
          en: "One calendar for all local groups, sign-up by link, attendance at a glance.",
          ar: "تقويم واحد لكل الفروع، تسجيل عبر رابط، والحضور بنظرة واحدة.",
        },
        layer: "digital",
      },
      {
        key: "aufgaben",
        label: { de: "Aufgaben & Ehrenamt", tr: "Görevler ve gönüllüler", en: "Tasks & volunteers", ar: "المهام والتطوع" },
        ist: {
          de: "Zugesagt in der Sitzung, vergessen bis zur nächsten. Nachgefragt wird persönlich.",
          tr: "Toplantıda söz veriliyor, bir sonrakine kadar unutuluyor. Takip şahsen yapılıyor.",
          en: "Promised in the meeting, forgotten until the next one. Follow-up happens in person.",
          ar: "يُوعَد بها في الاجتماع، وتُنسى حتى الاجتماع التالي. والمتابعة شخصية.",
        },
        soll: {
          de: "Jede Aufgabe hat einen Namen und ein Datum; der Vorstand sieht, was offen ist, ohne zu fragen.",
          tr: "Her görevin bir sorumlusu ve tarihi var; yönetim sormadan neyin açık olduğunu görür.",
          en: "Every task has a name and a date; the board sees what is open without having to ask.",
          ar: "لكل مهمة اسم وتاريخ؛ ويرى المجلس ما هو مفتوح دون أن يسأل.",
        },
        layer: "automation",
      },
      {
        key: "spenden",
        label: { de: "Spenden & Beiträge", tr: "Bağışlar ve aidatlar", en: "Donations & dues", ar: "التبرعات والاشتراكات" },
        ist: {
          de: "Bar, per Überweisung, per PayPal – zusammengeführt am Jahresende, für die Zuwendungsbestätigung.",
          tr: "Nakit, havale, PayPal – yıl sonunda bağış makbuzu için bir araya getiriliyor.",
          en: "Cash, bank transfer, PayPal – pulled together at year end for the donation receipts.",
          ar: "نقدًا، بالتحويل، عبر PayPal – تُجمع في نهاية السنة من أجل إيصالات التبرع.",
        },
        soll: {
          de: "Jeder Eingang an einer Stelle, dem Mitglied zugeordnet; die Bestätigung entsteht aus den Daten, nicht aus der Suche.",
          tr: "Her giriş tek yerde, üyeyle eşleşmiş; makbuz aramadan değil verilerden çıkar.",
          en: "Every payment in one place, matched to the member; the receipt comes out of the data, not out of a search.",
          ar: "كل وارد في مكان واحد، منسوب إلى العضو؛ ويخرج الإيصال من البيانات لا من البحث.",
        },
        layer: "automation",
      },
      {
        key: "bericht",
        label: { de: "Bericht an den Verband", tr: "Üst birime rapor", en: "Reporting upward", ar: "التقرير إلى الاتحاد" },
        ist: {
          de: "Jede Ortsgemeinde schickt ihre Zahlen anders, die Region tippt sie zusammen.",
          tr: "Her cemaat rakamlarını farklı gönderiyor, bölge bunları elle birleştiriyor.",
          en: "Every local community sends its figures differently, the region types them together.",
          ar: "كل جماعة محلية ترسل أرقامها بطريقة مختلفة، والمنطقة تجمعها يدويًا.",
        },
        soll: {
          de: "Die Region sieht alle Ortsgemeinden auf einer Karte und einem Stand – der Bericht ist eine Ansicht, keine Arbeit.",
          tr: "Bölge tüm cemaatleri tek haritada ve tek tabloda görür – rapor bir iş değil, bir görünümdür.",
          en: "The region sees every local community on one map and one status – the report is a view, not a job.",
          ar: "ترى المنطقة كل الجماعات المحلية على خريطة واحدة وحالة واحدة – فالتقرير عرضٌ لا عمل.",
        },
        layer: "operations",
      },
    ],
    buildTitle: { de: "Gebaut mit Gemeinden, nicht für sie.", tr: "Cemaatler için değil, cemaatlerle birlikte kuruldu.", en: "Built with communities, not just for them.", ar: "بُني مع الجماعات، لا لها فقط." },
    buildBody: {
      de: "Unser Gemeinde- und Verbandssystem läuft bereits bei einem Regionalverband mit vielen Ortsgemeinden. Wir beraten auf Deutsch und Türkisch und kennen die Arbeit von innen.",
      tr: "Cemaat ve birlik sistemimiz, çok sayıda cemaati olan bir bölge teşkilatında zaten çalışıyor. Almanca ve Türkçe danışmanlık veriyoruz ve bu işi içeriden tanıyoruz.",
      en: "Our community and federation system already runs at a regional federation with many local communities. We advise in German and Turkish and know the work from the inside.",
      ar: "نظامنا للجماعات والاتحادات يعمل بالفعل لدى اتحاد إقليمي يضم جماعات محلية كثيرة. نقدّم الاستشارة بالألمانية والتركية ونعرف هذا العمل من الداخل.",
    },
    works: ["igmg-nord-ruhr", "big-bielefeld", "integrationsrat-bielefeld", "ennur", "bir-damla-hayir"],
  },
  {
    slug: "elektrohandwerk",
    eyebrow: { de: "Branche · Elektrohandwerk", tr: "Sektör · Elektrik işletmeleri", en: "Sector · electrical contractors", ar: "قطاع · الأعمال الكهربائية" },
    metaTitle: {
      de: "Elektrohandwerk: Anfragen, Prüffristen und Wartungsverträge ohne Zettelwirtschaft",
      tr: "Elektrik işletmeleri: talepler, muayene süreleri ve bakım sözleşmeleri kâğıt karmaşası olmadan",
      en: "Electrical contractors: enquiries, inspection deadlines and maintenance contracts without paper chaos",
      ar: "الأعمال الكهربائية: الاستفسارات ومواعيد الفحص وعقود الصيانة دون فوضى الأوراق",
    },
    metaDescription: {
      de: "PV, Wallbox, E-Check, Prüfprotokolle: Im Elektrohandwerk hängt Umsatz an Fristen. Wir verbinden Anfrage, Termin, Prüfung und Wiedervorlage zu einem Ablauf.",
      tr: "PV, şarj ünitesi, E-Check, muayene tutanakları: elektrik işinde ciro sürelere bağlıdır. Talep, randevu, muayene ve hatırlatmayı tek akışta birleştiriyoruz.",
      en: "PV, wallbox, E-Check, inspection reports: in electrical contracting, revenue hangs on deadlines. We connect enquiry, appointment, inspection and reminder into one workflow.",
      ar: "الألواح الشمسية، شواحن السيارات، فحص E-Check، محاضر الفحص: في الأعمال الكهربائية يتعلّق الدخل بالمواعيد. نربط الاستفسار والموعد والفحص والتذكير في مسار واحد.",
    },
    title: {
      de: "Die nächste Prüfung ist fällig. Weiß es Ihr System – oder nur Ihr Gedächtnis?",
      tr: "Bir sonraki muayene zamanı geldi. Bunu sisteminiz mi biliyor, yoksa sadece hafızanız mı?",
      en: "The next inspection is due. Does your system know – or only your memory?",
      ar: "الفحص التالي مستحق. هل يعرف ذلك نظامكم – أم ذاكرتكم فقط؟",
    },
    lead: {
      de: "Im Elektrohandwerk kommen Aufträge nicht nur über neue Anfragen, sondern über Fristen: Wiederholungsprüfungen, Wartungen, Zählerwechsel. Wer sie aus dem Kopf verwaltet, verschenkt planbaren Umsatz.",
      tr: "Elektrik işinde işler sadece yeni taleplerle değil, sürelerle de gelir: tekrar muayeneleri, bakımlar, sayaç değişimleri. Bunları akılda tutan, planlanabilir ciroyu kaçırır.",
      en: "In electrical contracting, work comes not only from new enquiries but from deadlines: repeat inspections, maintenance, meter changes. Managing them from memory gives away predictable revenue.",
      ar: "في الأعمال الكهربائية لا تأتي الطلبات من الاستفسارات الجديدة فقط، بل من المواعيد: الفحوص الدورية، الصيانة، تغيير العدادات. ومن يديرها من الذاكرة يفرّط في دخل يمكن التخطيط له.",
    },
    workflowEyebrow: { de: "Ein Kunde, viele Jahre", tr: "Bir müşteri, uzun yıllar", en: "One customer, many years", ar: "عميل واحد، سنوات كثيرة" },
    workflowTitle: { de: "Wo geht planbarer Umsatz verloren?", tr: "Planlanabilir ciro nerede kayboluyor?", en: "Where does predictable revenue get lost?", ar: "أين يضيع الدخل الذي يمكن التخطيط له؟" },
    workflow: [
      {
        key: "anfrage",
        label: { de: "Anfrage", tr: "Talep", en: "Enquiry", ar: "الاستفسار" },
        ist: {
          de: "PV, Wallbox, Smart Home – jede Anfrage braucht andere Angaben, und die fehlen beim ersten Anruf.",
          tr: "PV, şarj ünitesi, akıllı ev – her talep farklı bilgi ister ve ilk aramada bunlar eksiktir.",
          en: "PV, wallbox, smart home – every enquiry needs different details, and they are missing on the first call.",
          ar: "طاقة شمسية، شاحن، منزل ذكي – كل استفسار يحتاج معلومات مختلفة، وهي ناقصة في المكالمة الأولى.",
        },
        soll: {
          de: "Ein Anfrageweg je Leistung, der Zählerschrank-Foto und Eckdaten gleich mitnimmt.",
          tr: "Her hizmet için ayrı bir talep yolu; sigorta kutusu fotoğrafını ve temel bilgileri baştan alır.",
          en: "One enquiry path per service that collects the meter-cabinet photo and key data right away.",
          ar: "مسار استفسار لكل خدمة يأخذ صورة لوحة العدادات والبيانات الأساسية من البداية.",
        },
        layer: "digital",
      },
      {
        key: "angebot",
        label: { de: "Angebot", tr: "Teklif", en: "Quote", ar: "العرض" },
        ist: {
          de: "Material aus dem Großhandelskatalog abgetippt, Stunden geschätzt, Vorlage vom letzten Mal.",
          tr: "Malzeme toptancı kataloğundan elle yazılıyor, saatler tahmin ediliyor, geçen seferki şablon.",
          en: "Materials typed from the wholesaler catalogue, hours estimated, last time's template.",
          ar: "المواد تُنسخ يدويًا من كتالوج تاجر الجملة، والساعات تُقدَّر، والقالب من المرة الماضية.",
        },
        soll: {
          de: "Bausteine je Leistung mit aktuellen Preisen – das Angebot steht am selben Tag.",
          tr: "Güncel fiyatlarla hizmete göre hazır bloklar – teklif aynı gün hazır.",
          en: "Building blocks per service with current prices – the quote is ready the same day.",
          ar: "وحدات جاهزة لكل خدمة بأسعار محدّثة – والعرض جاهز في اليوم نفسه.",
        },
        layer: "automation",
      },
      {
        key: "pruefung",
        label: { de: "Prüfung & Protokoll", tr: "Muayene ve tutanak", en: "Inspection & report", ar: "الفحص والمحضر" },
        ist: {
          de: "Protokolle auf Papier oder als PDF im Postfach – auffindbar, solange man weiß, wo.",
          tr: "Tutanaklar kâğıtta ya da e-postada PDF olarak – nerede olduğunu bildiğiniz sürece bulunur.",
          en: "Reports on paper or as a PDF in the inbox – findable as long as you know where.",
          ar: "المحاضر على الورق أو ملف PDF في البريد – يمكن إيجادها ما دمت تعرف أين.",
        },
        soll: {
          de: "Jedes Protokoll hängt am Kunden und an der Anlage, mit dem Datum der nächsten Fälligkeit.",
          tr: "Her tutanak müşteriye ve tesise bağlı, bir sonraki vadesiyle birlikte.",
          en: "Every report is attached to the customer and the installation, with the next due date.",
          ar: "كل محضر مرتبط بالعميل وبالمنشأة، مع تاريخ الاستحقاق التالي.",
        },
        layer: "operations",
      },
      {
        key: "wiedervorlage",
        label: { de: "Wiedervorlage & Wartung", tr: "Hatırlatma ve bakım", en: "Reminders & maintenance", ar: "التذكير والصيانة" },
        ist: {
          de: "Der Kunde meldet sich, wenn ihm die Prüfung einfällt – oder ein anderer Betrieb ihn vorher anspricht.",
          tr: "Müşteri, muayene aklına gelince arar – ya da başka bir işletme ondan önce ulaşır.",
          en: "The customer calls when they remember the inspection – or another firm reaches them first.",
          ar: "يتصل العميل حين يتذكر الفحص – أو تصل إليه شركة أخرى قبل ذلك.",
        },
        soll: {
          de: "Fällige Termine werden rechtzeitig vorgeschlagen; Wartungsverträge laufen, ohne dass jemand daran denken muss.",
          tr: "Vadesi gelen randevular zamanında önerilir; bakım sözleşmeleri kimsenin aklında tutmasına gerek kalmadan işler.",
          en: "Due appointments are proposed in time; maintenance contracts run without anyone having to remember them.",
          ar: "تُقترح المواعيد المستحقة في وقتها؛ وتسير عقود الصيانة دون أن يتذكرها أحد.",
        },
        layer: "automation",
      },
      {
        key: "rechnung",
        label: { de: "Rechnung", tr: "Fatura", en: "Invoice", ar: "الفاتورة" },
        ist: {
          de: "Am Wochenende nachgetragen, aus Stundenzetteln und Lieferscheinen.",
          tr: "Hafta sonu, saat çizelgeleri ve irsaliyelerden sonradan giriliyor.",
          en: "Caught up at the weekend, from timesheets and delivery notes.",
          ar: "تُستكمل في عطلة الأسبوع من أوراق الساعات وإيصالات التسليم.",
        },
        soll: {
          de: "Aus dem abgeschlossenen Auftrag entsteht die Rechnung, als E-Rechnung, mit Zahlungsüberwachung.",
          tr: "Tamamlanan işten fatura çıkar; e-fatura olarak, ödeme takibiyle birlikte.",
          en: "The invoice comes out of the finished job, as an e-invoice, with payment tracking.",
          ar: "تنشأ الفاتورة من الطلب المنجز، كفاتورة إلكترونية، مع متابعة الدفع.",
        },
        layer: "automation",
      },
    ],
    buildTitle: { de: "Erst der Ablauf, dann die Software.", tr: "Önce akış, sonra yazılım.", en: "The workflow first, the software second.", ar: "المسار أولًا، ثم البرمجيات." },
    buildBody: {
      de: "Wir fangen nicht bei einem neuen Programm an, sondern bei Ihren Fristen und Anfragen. Was Sie schon nutzen, bleibt, wo es trägt; wir verbinden die Lücken dazwischen.",
      tr: "Yeni bir programla değil, sizin süreleriniz ve taleplerinizle başlıyoruz. Zaten kullandığınız şey işini görüyorsa kalır; aradaki boşlukları biz bağlarız.",
      en: "We do not start with a new program but with your deadlines and enquiries. What you already use stays where it works; we connect the gaps in between.",
      ar: "لا نبدأ ببرنامج جديد، بل بمواعيدكم واستفساراتكم. ما تستخدمونه يبقى حيث ينفع؛ ونحن نربط الفجوات بينها.",
    },
    works: [],
    leistung: { path: "/leistungen/website-handwerk", label: { de: "Website fürs Handwerk", tr: "Usta işletmeleri için web sitesi", en: "Website for trades", ar: "موقع للحِرف" } },
  },
  {
    slug: "gastronomie",
    eyebrow: { de: "Branche · Gastronomie & Catering", tr: "Sektör · Gastronomi ve catering", en: "Sector · hospitality & catering", ar: "قطاع · المطاعم والتموين" },
    metaTitle: {
      de: "Gastronomie & Catering: Speisekarte, Bestellung und Anfragen ohne Telefonzettel",
      tr: "Gastronomi ve catering: menü, sipariş ve talepler telefon notu olmadan",
      en: "Hospitality & catering: menu, orders and enquiries without phone notes",
      ar: "المطاعم والتموين: قائمة الطعام والطلبات والاستفسارات دون أوراق الهاتف",
    },
    metaDescription: {
      de: "Speisekarte als Foto, Catering-Anfragen per Telefon, Preise an drei Stellen. Wir bauen Imbiss, Restaurant und Catering einen Auftritt, der Bestellungen und Anfragen sauber annimmt.",
      tr: "Fotoğraf olarak menü, telefonla catering talepleri, üç ayrı yerde fiyatlar. Büfe, restoran ve catering için siparişleri ve talepleri düzgünce alan bir görünüm kuruyoruz.",
      en: "Menu as a photo, catering enquiries by phone, prices in three places. We build snack bars, restaurants and caterers a presence that takes orders and enquiries cleanly.",
      ar: "قائمة طعام كصورة، استفسارات تموين بالهاتف، أسعار في ثلاثة أماكن. نبني للمطاعم والوجبات السريعة والتموين حضورًا يستقبل الطلبات والاستفسارات بشكل مرتب.",
    },
    title: {
      de: "Die Küche läuft. Läuft auch alles davor?",
      tr: "Mutfak çalışıyor. Peki öncesindeki her şey de çalışıyor mu?",
      en: "The kitchen runs. Does everything before it run too?",
      ar: "المطبخ يعمل. فهل يعمل كل ما قبله أيضًا؟",
    },
    lead: {
      de: "Gäste entscheiden am Handy: Karte, Öffnungszeiten, Bewertungen, Bestellweg. Eine Catering-Anfrage, die im Trubel am Telefon landet, ist oft der größte Auftrag der Woche – und der am leichtesten verlorene.",
      tr: "Misafirler kararı telefonda verir: menü, açılış saatleri, yorumlar, sipariş yolu. Yoğunlukta telefona düşen bir catering talebi çoğu zaman haftanın en büyük işidir – ve en kolay kaybedilenidir.",
      en: "Guests decide on their phone: menu, opening hours, reviews, how to order. A catering enquiry that lands on the phone during the rush is often the biggest job of the week – and the easiest one to lose.",
      ar: "يقرر الضيوف عبر الهاتف: القائمة، ساعات العمل، التقييمات، طريقة الطلب. واستفسار التموين الذي يصل بالهاتف وقت الزحام كثيرًا ما يكون أكبر طلب في الأسبوع – وأسهلها ضياعًا.",
    },
    workflowEyebrow: { de: "Ein Gast, vier Berührungen", tr: "Bir misafir, dört temas", en: "One guest, four touchpoints", ar: "ضيف واحد، أربع نقاط تواصل" },
    workflowTitle: { de: "Wo springt der Gast ab?", tr: "Misafir nerede vazgeçiyor?", en: "Where does the guest drop off?", ar: "أين يتراجع الضيف؟" },
    workflow: [
      {
        key: "karte",
        label: { de: "Speisekarte", tr: "Menü", en: "Menu", ar: "قائمة الطعام" },
        ist: {
          de: "Ein Foto der Tafel oder ein altes PDF – Preise und Gerichte stimmen nicht mehr.",
          tr: "Tahtanın fotoğrafı ya da eski bir PDF – fiyatlar ve yemekler artık tutmuyor.",
          en: "A photo of the board or an old PDF – prices and dishes no longer match.",
          ar: "صورة للوحة أو ملف PDF قديم – الأسعار والأطباق لم تعد مطابقة.",
        },
        soll: {
          de: "Eine Karte, an einer Stelle gepflegt, überall gleich: Website, Google, Aushang.",
          tr: "Tek yerde güncellenen, her yerde aynı olan bir menü: web sitesi, Google, vitrin.",
          en: "One menu, maintained in one place, the same everywhere: website, Google, window.",
          ar: "قائمة واحدة تُحدَّث في مكان واحد، وهي نفسها في كل مكان: الموقع، Google، الواجهة.",
        },
        layer: "digital",
      },
      {
        key: "bestellung",
        label: { de: "Bestellung & Reservierung", tr: "Sipariş ve rezervasyon", en: "Orders & bookings", ar: "الطلبات والحجوزات" },
        ist: {
          de: "Telefon während des Hochbetriebs, Plattformen mit hoher Provision.",
          tr: "En yoğun saatte telefon, yüksek komisyonlu platformlar.",
          en: "Phone calls during the rush, platforms with high commission.",
          ar: "مكالمات وقت الذروة، ومنصات بعمولات مرتفعة.",
        },
        soll: {
          de: "Ein eigener Bestell- oder Reservierungsweg, der ohne Anruf funktioniert.",
          tr: "Telefonsuz çalışan kendi sipariş ya da rezervasyon yolunuz.",
          en: "Your own ordering or booking path that works without a phone call.",
          ar: "مسار طلب أو حجز خاص بكم يعمل دون مكالمة.",
        },
        layer: "digital",
      },
      {
        key: "catering",
        label: { de: "Catering-Anfrage", tr: "Catering talebi", en: "Catering enquiry", ar: "استفسار التموين" },
        ist: {
          de: "Personenzahl, Datum, Wünsche – auf einem Zettel neben der Kasse.",
          tr: "Kişi sayısı, tarih, istekler – kasanın yanında bir kâğıtta.",
          en: "Headcount, date, wishes – on a note next to the till.",
          ar: "عدد الأشخاص، التاريخ، الطلبات – على ورقة بجانب الصندوق.",
        },
        soll: {
          de: "Ein Anfrageformular, das alles Nötige abfragt, und ein Angebot aus Bausteinen am selben Tag.",
          tr: "Gereken her şeyi soran bir talep formu ve aynı gün hazır bloklardan bir teklif.",
          en: "An enquiry form that asks for everything needed, and a quote from building blocks the same day.",
          ar: "نموذج استفسار يطلب كل ما يلزم، وعرض من وحدات جاهزة في اليوم نفسه.",
        },
        layer: "automation",
      },
      {
        key: "bewertungen",
        label: { de: "Bewertungen", tr: "Yorumlar", en: "Reviews", ar: "التقييمات" },
        ist: {
          de: "Zufriedene Gäste schreiben selten, unzufriedene sofort.",
          tr: "Memnun misafirler nadiren yazar, memnun olmayanlar hemen.",
          en: "Happy guests rarely write, unhappy ones immediately.",
          ar: "الضيوف الراضون نادرًا ما يكتبون، وغير الراضين فورًا.",
        },
        soll: {
          de: "Jeder Gast wird freundlich und ohne Gegenleistung gefragt – das Bild wird ehrlich.",
          tr: "Her misafire nazikçe ve karşılık beklemeden sorulur – tablo dürüst olur.",
          en: "Every guest is asked politely and with nothing in return – the picture becomes honest.",
          ar: "يُسأل كل ضيف بلطف ودون مقابل – فتصبح الصورة صادقة.",
        },
        layer: "automation",
      },
    ],
    buildTitle: { de: "Vom Imbiss bis zum Catering.", tr: "Büfeden catering'e kadar.", en: "From snack bar to catering.", ar: "من الوجبات السريعة إلى التموين." },
    buildBody: {
      de: "Wir haben Speisekarten-Auftritte für Imbisse und Websites für Caterer gebaut – in Deutschland und der Schweiz, auf Deutsch und Türkisch.",
      tr: "Büfeler için menü sayfaları ve catering firmaları için web siteleri kurduk – Almanya ve İsviçre'de, Almanca ve Türkçe.",
      en: "We have built menu sites for snack bars and websites for caterers – in Germany and Switzerland, in German and Turkish.",
      ar: "بنينا مواقع قوائم طعام لمطاعم الوجبات السريعة ومواقع لشركات التموين – في ألمانيا وسويسرا، بالألمانية والتركية.",
    },
    works: ["star-imbiss", "vegancatering"],
  },
  {
    slug: "online-handel",
    eyebrow: { de: "Branche · Online-Handel", tr: "Sektör · Online ticaret", en: "Sector · online retail", ar: "قطاع · التجارة الإلكترونية" },
    metaTitle: {
      de: "Online-Handel: Shop, Barrierefreiheit (BFSG) und Abläufe hinter der Bestellung",
      tr: "Online ticaret: mağaza, erişilebilirlik (BFSG) ve siparişin arkasındaki süreçler",
      en: "Online retail: shop, accessibility (BFSG) and the workflows behind the order",
      ar: "التجارة الإلكترونية: المتجر وإمكانية الوصول (BFSG) والإجراءات خلف الطلب",
    },
    metaDescription: {
      de: "Ein Shop ist mehr als Produktseiten: Barrierefreiheit seit dem BFSG, Bestellung, Versand, Retoure, Kundenservice. Wir betreiben selbst einen Shop – und bauen Händlern den Ablauf dahinter.",
      tr: "Bir mağaza ürün sayfalarından ibaret değildir: BFSG'den beri erişilebilirlik, sipariş, kargo, iade, müşteri hizmetleri. Kendimiz de bir mağaza işletiyoruz – ve satıcılara arkadaki süreci kuruyoruz.",
      en: "A shop is more than product pages: accessibility since the BFSG, ordering, shipping, returns, customer service. We run a shop ourselves – and build retailers the workflow behind it.",
      ar: "المتجر أكثر من صفحات منتجات: إمكانية الوصول منذ قانون BFSG، الطلب، الشحن، الإرجاع، خدمة العملاء. نحن نشغّل متجرًا بأنفسنا – ونبني للتجار الإجراءات خلفه.",
    },
    title: {
      de: "Die Bestellung ist der Anfang, nicht das Ende.",
      tr: "Sipariş başlangıçtır, son değil.",
      en: "The order is the beginning, not the end.",
      ar: "الطلب هو البداية، لا النهاية.",
    },
    lead: {
      de: "Hinter jeder Bestellung stehen Lager, Versand, Rechnung, Rückfragen und Retouren. Und seit Juni 2025 gilt für viele Shops das Barrierefreiheitsstärkungsgesetz. Ob es Ihren betrifft, klären wir gern ehrlich – ohne Panik.",
      tr: "Her siparişin arkasında depo, kargo, fatura, sorular ve iadeler vardır. Haziran 2025'ten beri pek çok mağaza için Erişilebilirlik Güçlendirme Yasası (BFSG) geçerli. Sizinkini kapsayıp kapsamadığına birlikte, panik yapmadan, dürüstçe bakarız.",
      en: "Behind every order are stock, shipping, invoicing, questions and returns. And since June 2025 the Accessibility Strengthening Act (BFSG) applies to many shops. Whether it affects yours, we are happy to check honestly – without panic.",
      ar: "خلف كل طلب مخزون وشحن وفاتورة واستفسارات ومرتجعات. ومنذ يونيو 2025 يسري قانون تعزيز إمكانية الوصول (BFSG) على متاجر كثيرة. وهل يشمل متجركم؟ نتحقق من ذلك بصدق – دون ذعر.",
    },
    workflowEyebrow: { de: "Eine Bestellung, fünf Stationen", tr: "Bir sipariş, beş durak", en: "One order, five stations", ar: "طلب واحد، خمس محطات" },
    workflowTitle: { de: "Wo hakt es nach dem Klick?", tr: "Tıklamadan sonra nerede takılıyor?", en: "Where does it snag after the click?", ar: "أين يتعثر الأمر بعد النقر؟" },
    workflow: [
      {
        key: "shop",
        label: { de: "Shop & Barrierefreiheit", tr: "Mağaza ve erişilebilirlik", en: "Shop & accessibility", ar: "المتجر وإمكانية الوصول" },
        ist: {
          de: "Ein Theme, das gut aussieht, aber mit Tastatur oder Screenreader nicht bedienbar ist.",
          tr: "Güzel görünen ama klavye ya da ekran okuyucuyla kullanılamayan bir tema.",
          en: "A theme that looks good but cannot be used with a keyboard or screen reader.",
          ar: "قالب جميل المظهر لكنه غير قابل للاستخدام بلوحة المفاتيح أو قارئ الشاشة.",
        },
        soll: {
          de: "Ein Shop, der nach WCAG geprüft ist – von Hand, nicht mit einem Overlay-Plugin.",
          tr: "Eklenti katmanıyla değil, elle WCAG'a göre test edilmiş bir mağaza.",
          en: "A shop tested against WCAG – by hand, not with an overlay plugin.",
          ar: "متجر مفحوص وفق WCAG – يدويًا، لا بإضافة طبقة جاهزة.",
        },
        layer: "digital",
      },
      {
        key: "bestellung",
        label: { de: "Bestellung & Versand", tr: "Sipariş ve kargo", en: "Order & shipping", ar: "الطلب والشحن" },
        ist: {
          de: "Bestellung im Shop, Etikett im Versandportal, Bestand in einer Tabelle – dreimal getippt.",
          tr: "Sipariş mağazada, etiket kargo portalında, stok bir tabloda – üç kez yazılıyor.",
          en: "Order in the shop, label in the shipping portal, stock in a spreadsheet – typed three times.",
          ar: "الطلب في المتجر، الملصق في بوابة الشحن، المخزون في جدول – يُكتب ثلاث مرات.",
        },
        soll: {
          de: "Die Bestellung erzeugt Etikett, Bestandsbuchung und Rechnung in einem Schritt.",
          tr: "Sipariş; etiketi, stok kaydını ve faturayı tek adımda oluşturur.",
          en: "The order creates label, stock booking and invoice in one step.",
          ar: "الطلب يُنشئ الملصق وقيد المخزون والفاتورة في خطوة واحدة.",
        },
        layer: "automation",
      },
      {
        key: "service",
        label: { de: "Rückfragen & Retouren", tr: "Sorular ve iadeler", en: "Questions & returns", ar: "الاستفسارات والمرتجعات" },
        ist: {
          de: "„Wo ist mein Paket?“ per Mail, Instagram und WhatsApp – jedes Mal von Hand beantwortet.",
          tr: "„Paketim nerede?“ e-postayla, Instagram'dan ve WhatsApp'tan – her seferinde elle cevaplanıyor.",
          en: "“Where is my parcel?” by e-mail, Instagram and WhatsApp – answered by hand every time.",
          ar: "„أين طردي؟“ عبر البريد وإنستغرام وواتساب – يُجاب عنه يدويًا في كل مرة.",
        },
        soll: {
          de: "Ein Postfach für alle Kanäle, Sendungsstatus automatisch, Retoure per Link.",
          tr: "Tüm kanallar için tek gelen kutusu, kargo durumu otomatik, iade bağlantıyla.",
          en: "One inbox for all channels, shipment status automatic, returns by link.",
          ar: "صندوق وارد واحد لكل القنوات، حالة الشحنة تلقائيًا، والإرجاع عبر رابط.",
        },
        layer: "automation",
      },
      {
        key: "wiederkauf",
        label: { de: "Wiederkauf", tr: "Tekrar alışveriş", en: "Repeat purchase", ar: "الشراء المتكرر" },
        ist: {
          de: "Wer einmal gekauft hat, hört nie wieder vom Shop – oder bekommt Werbung ohne Einwilligung.",
          tr: "Bir kez alan, mağazadan bir daha hiç haber almaz – ya da izinsiz reklam alır.",
          en: "Whoever bought once never hears from the shop again – or gets advertising without consent.",
          ar: "من اشترى مرة لا يسمع من المتجر أبدًا – أو يتلقى إعلانات دون موافقة.",
        },
        soll: {
          de: "Newsletter nur mit bestätigter Einwilligung, Stempelkarte im Wallet, Bewertungsbitte nach der Lieferung.",
          tr: "Yalnızca onaylanmış izinle bülten, cüzdanda damga kartı, teslimattan sonra yorum ricası.",
          en: "Newsletter only with confirmed consent, stamp card in the wallet, review request after delivery.",
          ar: "نشرة بريدية بموافقة مؤكدة فقط، بطاقة أختام في المحفظة، وطلب تقييم بعد التسليم.",
        },
        layer: "operations",
      },
    ],
    buildTitle: { de: "Wir handeln selbst online.", tr: "Kendimiz de online satış yapıyoruz.", en: "We sell online ourselves.", ar: "نحن نبيع عبر الإنترنت بأنفسنا." },
    buildBody: {
      de: "meaqam ist unser eigener Online-Shop – dort testen wir jeden Ablauf, bevor wir ihn Kunden empfehlen. Dazu kommen Shops und Kataloge für Kunden in Deutschland und der Schweiz.",
      tr: "meaqam bizim kendi online mağazamız – her süreci müşterilere önermeden önce orada deniyoruz. Buna Almanya ve İsviçre'deki müşteriler için mağazalar ve kataloglar eklenir.",
      en: "meaqam is our own online shop – we test every workflow there before recommending it to clients. On top come shops and catalogues for clients in Germany and Switzerland.",
      ar: "meaqam هو متجرنا الإلكتروني الخاص – نجرّب فيه كل إجراء قبل أن نوصي به العملاء. ويُضاف إلى ذلك متاجر وكتالوجات لعملاء في ألمانيا وسويسرا.",
    },
    works: ["meaqam", "allrein-ofra"],
    leistung: { path: "/leistungen/barrierefreiheit-website", label: { de: "Barrierefreiheit prüfen", tr: "Erişilebilirliği kontrol et", en: "Check accessibility", ar: "فحص إمكانية الوصول" } },
  },
]

export const brancheVon = (slug: string) => BRANCHEN.find((b) => b.slug === slug)

/** Gemeinsame Beschriftungen der Branchen-Seiten. */
export const brancheText = {
  referenzen: { de: "Gebaut in dieser Branche", tr: "Bu sektörde kurduklarımız", en: "Built in this sector", ar: "ما بنيناه في هذا القطاع" },
  eigen: { de: "Eigenbetrieb", tr: "Kendi işletmemiz", en: "Our own business", ar: "مشروعنا الخاص" },
  alleBranchen: { de: "Weitere Branchen", tr: "Diğer sektörler", en: "Other sectors", ar: "قطاعات أخرى" },
  offen: {
    de: "Ihre Branche steht nicht dabei? Wir arbeiten für Betriebe und Organisationen jeder Art – die Seiten hier zeigen nur, wo wir besonders tief drinstecken.",
    tr: "Sektörünüz burada yok mu? Her türlü işletme ve kuruluş için çalışıyoruz – buradaki sayfalar yalnızca özellikle derinlemesine bildiğimiz alanları gösteriyor.",
    en: "Your sector is not listed? We work for businesses and organisations of every kind – these pages only show where we are especially deep in.",
    ar: "قطاعكم غير مذكور؟ نعمل لمنشآت ومنظمات من كل نوع – وهذه الصفحات تُظهر فقط حيث نتعمق بشكل خاص.",
  },
} as const
