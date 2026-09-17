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
