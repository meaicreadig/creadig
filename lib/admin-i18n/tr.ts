import type { AdminTexte } from "@/lib/admin-i18n"

/**
 * ADM-01 · Admin-Texte TÜRKÇE.
 *
 * Gegen den Typ von `de.ts` geschrieben — ein fehlender Schlüssel ist ein
 * Build-Fehler, kein leerer Knopf. Maschinenwerte (Status-Schlüssel) werden
 * nie übersetzt gespeichert; übersetzt wird nur, was ein Mensch liest.
 */
export const tr: AdminTexte = {
  sprache: {
    name: "Türkçe",
    kurz: "TR",
    umschalterLabel: "Arayüz dili",
    hinweis: "Yalnızca arayüzü değiştirir — müşteri iletişimini değil.",
  },
  shell: {
    produkt: "Kontrol Merkezi",
    springen: "Çalışma alanına geç",
    navLabel: "Ana gezinme",
    menueOeffnen: "Menüyü aç",
    menueSchliessen: "Menüyü kapat",
    abmelden: "Çıkış yap",
    abmeldenLaeuft: "Çıkış yapılıyor …",
  },
  nav: {
    uebersicht: { label: "Genel bakış", hint: "Bugün önemli olan" },
    anfragen: { label: "Talepler", hint: "Gelen, değerlendirme, sonraki adım" },
    kunden: { label: "Müşteriler ve kişiler", hint: "Kuruluşlar, kişiler, geçmiş" },
    vertrieb: { label: "Satış", hint: "Fırsatlar, süreç, araştırma, kayıp" },
    nachweise: { label: "Kanıtlar ve onaylar", hint: "Sırada kanıtlanabilecek olan" },
    system: { label: "Sistem", hint: "Kurulum, materyal, tanılama" },
  },
  login: {
    titel: "Giriş",
    passwort: "Şifre",
    anmelden: "Giriş yap",
    pruefen: "Kontrol ediliyor …",
    weiter: "Giriş yapıldı — genel bakış yükleniyor …",
    abgelaufen: "Oturumun süresi doldu. Lütfen yeniden giriş yapın.",
    widerrufen: "Bu oturum kapatıldı. Lütfen yeniden giriş yapın.",
    fehler: {
      ungueltig: "Giriş yapılamadı.",
      "zu-viele": "Çok fazla deneme. Lütfen daha sonra tekrar deneyin.",
      "nicht-eingerichtet": "Kurulmamış.",
      zeitueberschreitung: "Sunucu zamanında yanıt vermedi. Lütfen tekrar deneyin.",
      offline: "İnternet bağlantısı yok. Lütfen bağlantıyı kontrol edip tekrar deneyin.",
      stoerung: "Sunucuda şu an bir arıza var. Lütfen biraz sonra tekrar deneyin.",
    },
  },
  uebersicht: {
    titel: "Genel bakış",
    lead: "Bugün yapılması gerekenler, bekleyenler ve sizin karar vermeniz gerekenler.",
    stand: (zeit) => `Güncelleme ${zeit}`,
    kennzahlenLabel: "Bugünün göstergeleri",
    kennzahl: {
      ueberfaellig: "Gecikmiş",
      heuteFaellig: "Bugün vadesi gelen",
      neueAnfragen: "Yeni talepler",
      ohneSchritt: "Sonraki adımı yok",
    },
    nichtGemessen: "ölçülmedi",
    heuteTitel: "Bugün yapılacaklar",
    heuteLeer: "Vadesi gelen bir şey yok. Hiçbir süreç bugün bir adım beklemiyor, bekleyen talep yok.",
    heuteLeerNaechstes: "Mantıklı sonraki adım: talepleri gözden geçirin ya da tarihi olmayan süreçleri planlayın.",
    zurPipeline: "Satış sürecine git",
    zuDenAnfragen: "Taleplere git",
    weitere: (n) => `Her türden yalnızca ilk kayıtlar listelenir — toplam ${n}. Tam listeler göstergelerden açılır.`,
    anfrageMeta: (quelle, referenz) => `${quelle} üzerinden · ${referenz}`,
    faelligAm: (datum) => `vade ${datum}`,
    systemTitel: "Sistem durumu",
    systemOk: "Arızalı bir işletim noktası yok.",
    zumSystem: "Sisteme git",
    entscheidungenTitel: "Kararlarınız",
    entscheidungenLeer: "Açık karar yok.",
    alleEntscheidungen: (n) => `Tümü (${n}) Sistem altında`,
    materialZeile: (offen) => `Web sitesi için materyal: ${offen} açık`,
    punkte: (n) => `${n} madde`,
    vertriebNichtEingerichtetTitel: "Satış kurulmamış",
    vertriebNichtEingerichtet: "Müşteri ve talep veritabanı bu ortam için kurulmamış. Yeni talepler, vadesi gelen adımlar ve ilişki takibi bu yüzden burada görünemez — bu sıfır değil, eksik bir bağlantıdır.",
    vertriebNichtErreichbarTitel: "Satışa ulaşılamıyor — ölçülmedi",
    vertriebNichtErreichbar: "Veritabanı kurulu, ancak şu an yanıt vermedi. Vadesi gelen süreçler, yeni talepler ve ilişki takibi bu yüzden bu listede eksik. Bu sıfır değil, eksik bir ölçümdür.",
  },
  rang: {
    betriebsblocker: "İşletim arızası",
    ueberfaellig: "Gecikmiş",
    "heute-faellig": "Bugün vadeli",
    "neue-anfrage": "Yeni talep",
    "schritt-ohne-termin": "Tarihsiz adım",
    "ohne-schritt": "Sonraki adım yok",
    "beziehung-faellig": "İlişki takibi zamanı",
    entscheidung: "Sizin kararınız",
  },
  nichtGefunden: {
    titel: "Bulunamadı",
    hinweisTitel: "Bu adres burada yok",
    hinweis: "Veri kaynağı yanıt verdi — yalnızca bu kimliğe ait bir kayıt yok. Eski bir bağlantı, elle yazılmış bir kimlik ya da artık var olmayan bir kayıt olabilir.",
    zurUebersicht: "Genel bakışa dön",
  },
  speicher: {
    nichtEingerichtetTitel: (bereich) => `${bereich}: veritabanı kurulmamış`,
    nichtEingerichtetText: (inhalt) =>
      `${inhalt} müşteri ve talep veritabanında tutulur. Bu ortam için henüz kurulmadı. Bu boş bir liste değil, eksik bir bağlantıdır — kurulum Sistem altında.`,
    nichtErreichbarTitel: (bereich) => `${bereich}: veritabanına şu an ulaşılamıyor`,
    nichtErreichbarText: (inhalt) =>
      `${inhalt} müşteri ve talep veritabanında tutulur. Kurulu, ancak şu an yanıt vermedi. Bu boş bir liste değil, bir arızadır — hiçbir şey silinmedi.`,
    erneutLaden: "Yeniden yükle",
    inhaltVertrieb: "Talepler, kişiler ve satış fırsatları",
    inhaltKunden: "Kuruluşlar, lokasyonlar ve irtibat kişileri",
  },
}
