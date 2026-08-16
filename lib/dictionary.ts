// i18n-ready dictionary. DE ist primär, TR ist gleichwertig.
// Alle Inhalte sind echt. Keine erfundenen Zahlen, Zitate oder Auszeichnungen.

export type Locale = "de" | "tr"

export const WHATSAPP_NUMBER = "+41 76 504 58 79"
export const WHATSAPP_LINK =
  "https://wa.me/41765045879?text=" +
  encodeURIComponent("Guten Tag creaDIG, ich interessiere mich für ein Projekt.")

export const dictionary = {
  de: {
    nav: {
      leistungen: "Leistungen",
      produkte: "Produkte",
      arbeiten: "Arbeiten",
      ueber: "Über uns",
      pakete: "Pakete",
      kontakt: "Kontakt",
      cta: "Projekt starten",
      menu: "Menü öffnen",
      close: "Menü schließen",
      menuTitle: "Navigation",
      theme: "Erscheinungsbild wechseln",
      language: "Sprache wechseln",
    },
    hero: {
      eyebrow: "System-Haus · seit 2018 · Deutschland & Schweiz",
      headlineLine1: "Wir bauen,",
      headlineLine2: "was andere",
      headlineLine3: "nicht sehen.",
      subline:
        "creaDIG ist das Dach über unseren Systemen — von Marke bis KI. Wir bauen sie. Und wir betreiben sie.",
      ctaPrimary: "Projekt starten",
      ctaSecondary: "Unsere Arbeit ansehen",
      location: "Diepholz · Zürich",
      scroll: "Scrollen",
    },
    impact: {
      eyebrow: "Das Fundament",
      title: "Kein Konzept. Ein laufender Betrieb.",
      signals: {
        since: { label: "Seit", detail: "Aus der Agentur zum System-Haus gewachsen." },
        products: { label: "Eigene Produkte", detail: "Selbst gebaut, selbst betrieben." },
        regions: { label: "Märkte", detail: "Deutschland und Schweiz, zweisprachig." },
        scope: { label: "Von Marke bis KI", detail: "Fünf Ebenen, ein Haus." },
      },
      note: "Systeme im Tagesbetrieb — nicht in der Präsentation.",
    },
    logos: {
      eyebrow: "Ökosystem",
      title: "Marken, mit denen wir arbeiten",
      ownProducts: "Eigene Produkte",
      brands: "Marken & Auftraggeber",
      note: "Namensnennung zur Einordnung unserer Arbeit. Freigaben stehen teilweise aus; eine Geschäfts- oder Partnerbeziehung wird damit nicht behauptet.",
    },
    portfolio: {
      eyebrow: "Werkschau",
      title: "Gebaut. Und betrieben.",
      lead: "Sechs Systeme, die täglich laufen — eigene Produkte und Kundenwerke aus Deutschland und der Schweiz.",
      built: "Was wir gebaut haben",
      more: "Weitere Projekte",
      viewLive: "Live ansehen",
    },
    services: {
      eyebrow: "Leistungen",
      title: "Fünf Ebenen. Ein System.",
      lead: "Wir arbeiten von A bis Z — vom ersten Logo bis zum eigenen KI-System. Jede Ebene baut auf der darunter auf.",
      forWhom: "Für wen",
      layers: {
        identity: {
          name: "Identity",
          what: "Marke, Name, Logo, Auftritt — das Fundament, auf dem alles steht.",
          who: "Gründer, neue Betriebe, Handwerk vor dem ersten Auftritt.",
        },
        digital: {
          name: "Digital",
          what: "Website, Shop, Landingpages — sichtbar, schnell, auffindbar.",
          who: "Bäckerei, Praxis, Restaurant, Handwerksbetrieb.",
        },
        operations: {
          name: "Operations",
          what: "Kasse, Planung, Abrechnung, Verwaltung — der Betrieb im System.",
          who: "Gastronomie, Außendienst, Verwaltung, Dienstleister.",
        },
        automation: {
          name: "Automation",
          what: "Wiederkehrende Arbeit übernimmt das System, nicht der Mensch.",
          who: "Betriebe mit 6–20 Mitarbeitern und wachsendem Papierberg.",
        },
        intelligence: {
          name: "Intelligence · meAI",
          what: "Ein KI-System, das mitdenkt, vorbereitet und den Überblick behält.",
          who: "Etablierte Betriebe, die Entscheidungen schneller treffen wollen.",
        },
      },
    },
    meai: {
      eyebrow: "Flagship · meai.run",
      title: "Ihr unsichtbarer Geschäftsführer.",
      lead: "meAI ist unser KI-Business-Betriebssystem. Es liest den Betrieb, bereitet Entscheidungen vor und hält zusammen, was sonst in Köpfen und Zetteln verteilt liegt.",
      dna: "Die seltene Doppel-DNA: Wir bauen ein eigenes KI-System — und betreiben mit FIBERO ein echtes operatives Geschäft. Wir kennen beide Seiten.",
      cta: "meai.run öffnen",
      capabilities: {
        overview: {
          name: "Überblick",
          what: "Zahlen, Aufgaben und Termine an einem Ort, immer aktuell.",
        },
        tasks: {
          name: "Priorisierung",
          what: "Das System sagt, was heute zuerst dran ist — und warum.",
        },
        documents: {
          name: "Dokumente",
          what: "Rechnungen und Belege werden gelesen, sortiert und zugeordnet.",
        },
        decisions: {
          name: "Entscheidungen",
          what: "Vorbereitete Optionen statt leerer Tabellen.",
        },
      },
    },
    process: {
      eyebrow: "Wie wir arbeiten",
      title: "Verstehen. Bauen. Betreiben.",
      bridge: "creaDIG baut das System — das System betreibt sich — Sie behalten den Überblick.",
      steps: {
        understand: {
          name: "Verstehen",
          what: "Wir sehen uns den Betrieb an, bevor wir eine Zeile bauen. Wo geht Zeit verloren, was blockiert, was ist unsichtbar?",
        },
        build: {
          name: "Bauen",
          what: "Marke, Oberfläche, Logik, Automatisierung — als ein zusammenhängendes System, nicht als Sammlung von Werkzeugen.",
        },
        operate: {
          name: "Betreiben",
          what: "Wir übergeben nicht und verschwinden. Wir betreiben, überwachen und entwickeln weiter.",
        },
      },
    },
    about: {
      eyebrow: "Über uns",
      title: "Ein Haus, das wächst.",
      founderLabel: "Gründer",
      founder: "Muhammed Emin Akyol",
      body1:
        "creaDIG startete 2018 als Agentur. Aus Aufträgen wurden Produkte, aus Produkten ein System-Haus — heute laufen unter dem Dach eigene Systeme und ein operatives Telekom-Geschäft.",
      body2:
        "Wir arbeiten mit einem spezialisierten Netzwerk aus Entwicklern, Textern und Strategen im DACH-Raum. Das Team wächst; die nächsten Stellen sind in Vorbereitung.",
      nicheLabel: "Schwerpunkte",
      niches: [
        "Handwerk mit 6–20 Mitarbeitern (NRW & Niedersachsen)",
        "Türkisch-deutscher Mittelstand — WhatsApp-Kultur, DE + TR",
        "Gastronomie in Deutschland und der Schweiz",
      ],
      locationsLabel: "Sitz",
      honesty:
        "Wir nennen keine erfundenen Mitarbeiter- oder Umsatzzahlen. Unser Beweis ist gebaute Arbeit.",
    },
    packages: {
      eyebrow: "Pakete",
      title: "Transparente Preise. Kein Riba.",
      lead: "Feste Beträge, klar benannt. Sie sehen vorher, was Sie zahlen.",
      forWhom: "Für wen",
      recommended: "Empfohlen",
      once: "einmalig",
      monthly: "pro Monat",
      cta: "Auswählen",
      items: {
        identity: {
          name: "Identity",
          who: "Gründer und neue Betriebe, die ihren ersten professionellen Auftritt brauchen.",
          includes: [
            "Marke, Logo, Farb- und Schriftsystem",
            "Website als Auftritt",
            "Grundlagen für Auffindbarkeit",
          ],
          note: "Einmalig. Kein Abo-Risiko.",
        },
        growth: {
          name: "Growth Partner",
          who: "Betriebe mit 5–15 Mitarbeitern, die laufend betreut werden wollen.",
          includes: [
            "Laufende Betreuung von Marke und Web",
            "Inhalte und Weiterentwicklung",
            "Erste Automatisierungen",
          ],
          note: "Monatlich kündbar.",
        },
        architecture: {
          name: "Architecture",
          who: "Etablierte Betriebe mit Bedarf an Operations, Automation und meAI.",
          includes: [
            "Operative Systeme und Abrechnung",
            "Automatisierung der Kernprozesse",
            "meAI-Anbindung und Betrieb",
          ],
          note: "Monatlich kündbar.",
        },
      },
    },
    contact: {
      eyebrow: "Kontakt",
      title: "In 20 Minuten unverbindlich.",
      lead: "Deutsch und Türkisch. Wählen Sie den Weg, der Ihnen am schnellsten passt.",
      nameLabel: "Name",
      namePlaceholder: "Ihr Name",
      businessLabel: "Betrieb",
      businessPlaceholder: "Firma oder Branche",
      messageLabel: "Worum geht es?",
      messagePlaceholder: "Kurz in eigenen Worten — ein bis zwei Sätze genügen.",
      submitWhatsapp: "Per WhatsApp senden",
      submitEmail: "Per E-Mail senden",
      whatsappTitle: "WhatsApp",
      whatsappNote: "Schnellste Antwort, DE & TR.",
      appointmentTitle: "Termin",
      appointmentNote: "20 Minuten, unverbindlich, per Video.",
      appointmentCta: "Termin anfragen",
      chatTitle: "KI-Assistent",
      chatNote: "Fragen Sie direkt auf der Seite.",
      chatCta: "Assistent öffnen",
      locationsLabel: "Standorte",
    },
    footer: {
      tagline: "System-Haus für Marke, Web, Operations, Automation und KI.",
      productsLabel: "Produkte",
      navLabel: "Seite",
      legalLabel: "Rechtliches",
      imprint: "Impressum",
      privacy: "Datenschutz",
      legalNote: "Rechtstexte in Vorbereitung.",
      socialLabel: "Social",
      rights: "Alle Rechte vorbehalten.",
    },
    chat: {
      title: "creaDIG Assistent",
      subtitle: "Antwortet in DE & TR",
      open: "Assistent öffnen",
      close: "Assistent schließen",
      placeholder: "Frage stellen …",
      send: "Senden",
      greeting:
        "Guten Tag. Ich beantworte Fragen zu creaDIG, unseren Systemen und Paketen. Womit können wir helfen?",
      demoNote: "Demo-Antworten. Die Anbindung an die KI folgt.",
      suggestions: [
        "Was kostet ein Auftritt?",
        "Was ist meAI?",
        "Arbeiten Sie in der Schweiz?",
        "Wie läuft ein Projekt ab?",
      ],
      answerPrice:
        "Wir arbeiten mit drei festen Paketen: Identity €350 einmalig, Growth Partner €500 pro Monat und Architecture €1.500 pro Monat. Transparent, ohne versteckte Kosten.",
      answerMeai:
        "meAI ist unser KI-Business-Betriebssystem — es bündelt Zahlen, Aufgaben und Dokumente und bereitet Entscheidungen vor. Live unter meai.run.",
      answerSwiss:
        "Ja. Wir sind in Diepholz und in der Schweiz vertreten; CASSAMEA ist speziell für die schweizerische Gastronomie gebaut.",
      answerProcess:
        "In drei Schritten: verstehen, bauen, betreiben. Wir sehen uns den Betrieb an, bauen das System und betreiben es anschließend weiter.",
      answerFallback:
        "Das klären wir am besten direkt. Schreiben Sie uns per WhatsApp an +41 76 504 58 79 — oder nutzen Sie das Kontaktformular.",
    },
  },

  tr: {
    nav: {
      leistungen: "Hizmetler",
      produkte: "Ürünler",
      arbeiten: "İşler",
      ueber: "Hakkımızda",
      pakete: "Paketler",
      kontakt: "İletişim",
      cta: "Projeye başla",
      menu: "Menüyü aç",
      close: "Menüyü kapat",
      menuTitle: "Gezinme",
      theme: "Görünümü değiştir",
      language: "Dili değiştir",
    },
    hero: {
      eyebrow: "Sistem evi · 2018'den beri · Almanya & İsviçre",
      headlineLine1: "Başkalarının",
      headlineLine2: "görmediğini",
      headlineLine3: "inşa ediyoruz.",
      subline:
        "creaDIG, kendi sistemlerimizin çatısıdır — markadan yapay zekâya. Onları biz kurarız. Ve biz işletiriz.",
      ctaPrimary: "Projeye başla",
      ctaSecondary: "İşlerimizi gör",
      location: "Diepholz · Zürih",
      scroll: "Kaydır",
    },
    impact: {
      eyebrow: "Temel",
      title: "Konsept değil. İşleyen bir yapı.",
      signals: {
        since: { label: "Beri", detail: "Ajanstan sistem evine büyüdük." },
        products: { label: "Kendi ürünümüz", detail: "Kendimiz kurduk, kendimiz işletiyoruz." },
        regions: { label: "Pazarlar", detail: "Almanya ve İsviçre, iki dilde." },
        scope: { label: "Markadan yapay zekâya", detail: "Beş katman, tek çatı." },
      },
      note: "Sistemler günlük kullanımda — sunumda değil.",
    },
    logos: {
      eyebrow: "Ekosistem",
      title: "Birlikte çalıştığımız markalar",
      ownProducts: "Kendi ürünlerimiz",
      brands: "Markalar & iş verenler",
      note: "İsimler çalışmamızı konumlandırmak için anılmıştır. Bazı onaylar beklemededir; bu bir iş veya ortaklık ilişkisi iddiası değildir.",
    },
    portfolio: {
      eyebrow: "Seçki",
      title: "Kuruldu. Ve işletiliyor.",
      lead: "Her gün çalışan altı sistem — Almanya ve İsviçre'den kendi ürünlerimiz ve müşteri işleri.",
      built: "Ne inşa ettik",
      more: "Diğer projeler",
      viewLive: "Canlı gör",
    },
    services: {
      eyebrow: "Hizmetler",
      title: "Beş katman. Tek sistem.",
      lead: "A'dan Z'ye çalışıyoruz — ilk logodan kendi yapay zekâ sistemine kadar. Her katman altındakinin üzerine kurulur.",
      forWhom: "Kimler için",
      layers: {
        identity: {
          name: "Identity",
          what: "Marka, isim, logo, görünüm — her şeyin durduğu temel.",
          who: "Girişimciler, yeni işletmeler, ilk kimliğini arayan esnaf.",
        },
        digital: {
          name: "Digital",
          what: "Web sitesi, mağaza, açılış sayfaları — görünür, hızlı, bulunabilir.",
          who: "Fırın, klinik, restoran, esnaf işletmesi.",
        },
        operations: {
          name: "Operations",
          what: "Kasa, planlama, faturalama, yönetim — işleyiş sistem içinde.",
          who: "Gastronomi, saha ekipleri, yönetim, hizmet sağlayıcılar.",
        },
        automation: {
          name: "Automation",
          what: "Tekrar eden işi insan değil, sistem üstlenir.",
          who: "6–20 çalışanı ve büyüyen evrak yükü olan işletmeler.",
        },
        intelligence: {
          name: "Intelligence · meAI",
          what: "Düşünen, hazırlayan ve genel görünümü koruyan bir yapay zekâ sistemi.",
          who: "Daha hızlı karar almak isteyen yerleşik işletmeler.",
        },
      },
    },
    meai: {
      eyebrow: "Amiral gemisi · meai.run",
      title: "Görünmeyen genel müdürünüz.",
      lead: "meAI, yapay zekâ tabanlı iş işletim sistemimizdir. İşletmeyi okur, kararları hazırlar ve kafalarda ile kâğıtlarda dağılan her şeyi bir arada tutar.",
      dna: "Ender bir çifte DNA: Kendi yapay zekâ sistemimizi kuruyoruz — ve FIBERO ile gerçek bir operasyonel iş işletiyoruz. İki tarafı da biliyoruz.",
      cta: "meai.run'ı aç",
      capabilities: {
        overview: {
          name: "Genel görünüm",
          what: "Sayılar, görevler ve randevular tek yerde, her zaman güncel.",
        },
        tasks: {
          name: "Önceliklendirme",
          what: "Sistem bugün önce neyin yapılacağını söyler — ve nedenini.",
        },
        documents: {
          name: "Belgeler",
          what: "Faturalar ve fişler okunur, sıralanır ve eşleştirilir.",
        },
        decisions: {
          name: "Kararlar",
          what: "Boş tablolar yerine hazırlanmış seçenekler.",
        },
      },
    },
    process: {
      eyebrow: "Nasıl çalışıyoruz",
      title: "Anlamak. Kurmak. İşletmek.",
      bridge: "creaDIG sistemi kurar — sistem kendini işletir — siz genel görünümü korursunuz.",
      steps: {
        understand: {
          name: "Anlamak",
          what: "Tek satır yazmadan önce işletmeye bakıyoruz. Zaman nerede kayboluyor, ne tıkanıyor, ne görünmüyor?",
        },
        build: {
          name: "Kurmak",
          what: "Marka, arayüz, mantık, otomasyon — araç yığını değil, bütünlüklü tek sistem.",
        },
        operate: {
          name: "İşletmek",
          what: "Teslim edip kaybolmuyoruz. İşletiyor, izliyor ve geliştirmeye devam ediyoruz.",
        },
      },
    },
    about: {
      eyebrow: "Hakkımızda",
      title: "Büyüyen bir çatı.",
      founderLabel: "Kurucu",
      founder: "Muhammed Emin Akyol",
      body1:
        "creaDIG 2018'de ajans olarak başladı. İşlerden ürünler, ürünlerden bir sistem evi doğdu — bugün bu çatı altında kendi sistemlerimiz ve operasyonel bir telekom işi yürüyor.",
      body2:
        "DACH bölgesinde geliştirici, metin yazarı ve stratejistlerden oluşan uzman bir ağ ile çalışıyoruz. Ekip büyüyor; yeni pozisyonlar hazırlanıyor.",
      nicheLabel: "Odak alanları",
      niches: [
        "6–20 çalışanlı esnaf işletmeleri (NRW & Aşağı Saksonya)",
        "Türk-Alman KOBİ'ler — WhatsApp kültürü, DE + TR",
        "Almanya ve İsviçre'de gastronomi",
      ],
      locationsLabel: "Merkez",
      honesty: "Uydurma çalışan veya ciro sayıları vermiyoruz. Kanıtımız yaptığımız işlerdir.",
    },
    packages: {
      eyebrow: "Paketler",
      title: "Şeffaf fiyatlar. Riba yok.",
      lead: "Sabit tutarlar, açıkça belirtilmiş. Ne ödeyeceğinizi önceden görürsünüz.",
      forWhom: "Kimler için",
      recommended: "Önerilen",
      once: "tek seferlik",
      monthly: "aylık",
      cta: "Seç",
      items: {
        identity: {
          name: "Identity",
          who: "İlk profesyonel kimliğine ihtiyaç duyan girişimciler ve yeni işletmeler.",
          includes: [
            "Marka, logo, renk ve yazı sistemi",
            "Kimlik olarak web sitesi",
            "Bulunabilirlik için temel yapı",
          ],
          note: "Tek seferlik. Abonelik riski yok.",
        },
        growth: {
          name: "Growth Partner",
          who: "Sürekli destek isteyen 5–15 çalışanlı işletmeler.",
          includes: [
            "Marka ve web için sürekli destek",
            "İçerik ve geliştirme",
            "İlk otomasyonlar",
          ],
          note: "Aylık iptal edilebilir.",
        },
        architecture: {
          name: "Architecture",
          who: "Operations, automation ve meAI ihtiyacı olan yerleşik işletmeler.",
          includes: [
            "Operasyonel sistemler ve faturalama",
            "Temel süreçlerin otomasyonu",
            "meAI bağlantısı ve işletimi",
          ],
          note: "Aylık iptal edilebilir.",
        },
      },
    },
    contact: {
      eyebrow: "İletişim",
      title: "20 dakikada, bağlayıcı olmadan.",
      lead: "Almanca ve Türkçe. Size en hızlı gelen yolu seçin.",
      nameLabel: "İsim",
      namePlaceholder: "Adınız",
      businessLabel: "İşletme",
      businessPlaceholder: "Firma veya sektör",
      messageLabel: "Konu nedir?",
      messagePlaceholder: "Kendi cümlelerinizle kısaca — bir iki cümle yeterli.",
      submitWhatsapp: "WhatsApp ile gönder",
      submitEmail: "E-posta ile gönder",
      whatsappTitle: "WhatsApp",
      whatsappNote: "En hızlı yanıt, DE & TR.",
      appointmentTitle: "Randevu",
      appointmentNote: "20 dakika, bağlayıcı değil, görüntülü.",
      appointmentCta: "Randevu talep et",
      chatTitle: "Yapay zekâ asistanı",
      chatNote: "Doğrudan sayfada sorun.",
      chatCta: "Asistanı aç",
      locationsLabel: "Konumlar",
    },
    footer: {
      tagline: "Marka, web, operations, automation ve yapay zekâ için sistem evi.",
      productsLabel: "Ürünler",
      navLabel: "Sayfa",
      legalLabel: "Yasal",
      imprint: "Künye",
      privacy: "Gizlilik",
      legalNote: "Yasal metinler hazırlanıyor.",
      socialLabel: "Sosyal",
      rights: "Tüm hakları saklıdır.",
    },
    chat: {
      title: "creaDIG Asistanı",
      subtitle: "DE & TR yanıt verir",
      open: "Asistanı aç",
      close: "Asistanı kapat",
      placeholder: "Soru sorun …",
      send: "Gönder",
      greeting:
        "Merhaba. creaDIG, sistemlerimiz ve paketlerimiz hakkındaki soruları yanıtlıyorum. Nasıl yardımcı olabiliriz?",
      demoNote: "Demo yanıtlar. Yapay zekâ bağlantısı sonra eklenecek.",
      suggestions: [
        "Bir kimlik ne kadar?",
        "meAI nedir?",
        "İsviçre'de çalışıyor musunuz?",
        "Proje nasıl ilerler?",
      ],
      answerPrice:
        "Üç sabit paketle çalışıyoruz: Identity tek seferlik €350, Growth Partner aylık €500 ve Architecture aylık €1.500. Şeffaf, gizli maliyet yok.",
      answerMeai:
        "meAI, yapay zekâ tabanlı iş işletim sistemimizdir — sayıları, görevleri ve belgeleri toplar, kararları hazırlar. meai.run adresinde canlı.",
      answerSwiss:
        "Evet. Diepholz'da ve İsviçre'de bulunuyoruz; CASSAMEA özellikle İsviçre gastronomisi için kuruldu.",
      answerProcess:
        "Üç adımda: anlamak, kurmak, işletmek. İşletmeye bakar, sistemi kurar ve ardından işletmeye devam ederiz.",
      answerFallback:
        "Bunu en iyi doğrudan netleştiririz. WhatsApp'tan +41 76 504 58 79 numarasına yazın — veya iletişim formunu kullanın.",
    },
  },
} as const

export type Dictionary = (typeof dictionary)["de"]
