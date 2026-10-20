import type { AdminSprache } from "@/lib/admin-i18n/sprache"
import type { Abschnitt, Interesse } from "@/lib/gespraech"

export type GespraechText = {
  locale: string
  titel: string
  lead: string
  nichtVerfuegbar: string
  suche: string
  suchen: string
  kontakte: string
  keineKontakte: string
  neuerKontakt: string
  name: string
  firma: string
  telefon: string
  email: string
  anlegen: string
  waehlen: string
  waehlenText: string
  zuletzt: string
  verlauf: string
  keinVerlauf: string
  heuteFaellig: string
  raumLabel: string
  imGespraech: string
  ohneFirma: string
  anrufen: string
  mail: string
  dauer: string
  start: string
  pause: string
  weiter: string
  interesseLabel: string
  interessen: [Interesse, string][]
  abschnitte: Record<Abschnitt, string>
  platzhalter: Record<Exclude<Abschnitt, "notiz">, string>
  notizPlatzhalter: string
  zeitmarke: string
  folgeTitel: string
  folgePlatzhalter: string
  folgeAm: string
  folgeUm: string
  folgeStandard: string
  abschliessen: string
  speichertLaeuft: string
  entwurfHinweis: string
  fehlerLeer: string
  fehlerSpeicher: string
  gespeichertEyebrow: string
  /** Platzhalter {name} und {min} — keine Funktion, weil das Objekt an eine Client-Komponente geht. */
  gespeichertTitel: string
  folgeBereit: string
  ohneFolge: string
  icsLaden: string
  googleKalender: string
  neuesGespraech: string
  zurAkte: string
  kiEyebrow: string
  kiPunkte: string
  kiNaechster: string
  original: string
  inVertrieb: string
  kiAusstehend: string
  terminmail: string
  min: string
  zentrale: string
  gespraechChip: string
  status: string
  live: string
  pausiert: string
  bereit: string
  naechsterKontakt: string
  zuletztGesprochen: string
  themen: string
  leitfragen: string
  aktivitaet: string
  offen: string
  faelligListe: string
  zuletztKontakte: string
  sucheHinweis: string
  treffer: string
  schnellwahl: string
  /** [Bezeichnung, Tage ab heute] — erkannt wird per Stichwort in der Mitschrift. */
  vorlagen: [string, number, string][]
  erkannt: string
  uebernehmen: string
  inUebersicht: string
}

const DE: GespraechText = {
  locale: "de-DE",
  titel: "Gesprächsraum",
  lead: "Kontakt wählen, anrufen, mitschreiben. Beim Abschliessen landet alles in der Kundenakte, der nächste Schritt geht direkt in deinen Kalender.",
  nichtVerfuegbar: "Die Datenbank ist gerade nicht erreichbar. Notizen bitte vorerst anderswo festhalten.",
  suche: "Name, Firma, Telefon oder E-Mail",
  suchen: "Suchen",
  kontakte: "Kontakte",
  keineKontakte: "Kein Kontakt gefunden. Lege ihn rechts kurz an.",
  neuerKontakt: "Neuer Kontakt",
  name: "Name",
  firma: "Firma",
  telefon: "Telefon",
  email: "E-Mail",
  anlegen: "Anlegen und Gespräch öffnen",
  waehlen: "Mit wem sprichst du?",
  waehlenText: "Wähle links einen Kontakt oder lege einen neuen an. Danach öffnet sich die Arbeitsfläche mit Uhr, Notizen und Folgetermin.",
  zuletzt: "Letzte Gespräche",
  verlauf: "Bisherige Gespräche",
  keinVerlauf: "Noch kein Gespräch mit diesem Kontakt.",
  heuteFaellig: "fällig",
  raumLabel: "Gesprächsnotizen",
  imGespraech: "Im Gespräch mit",
  ohneFirma: "Ohne Firma",
  anrufen: "Anrufen",
  mail: "E-Mail",
  dauer: "Gesprächsdauer",
  start: "Start",
  pause: "Pause",
  weiter: "Weiter",
  interesseLabel: "Worüber gesprochen wurde",
  interessen: [
    ["webseite", "Webseite"],
    ["sichtbarkeit", "Sichtbarkeit & Google"],
    ["anfragen", "Anfragen & Buchung"],
    ["automatisierung", "Automatisierung"],
    ["plattform", "App & Plattform"],
    ["barrierefreiheit", "Barrierefreiheit"],
    ["betriebscheck", "Betriebscheck"],
  ],
  abschnitte: {
    notiz: "Mitschrift",
    ausgangslage: "Ausgangslage",
    bedarf: "Ziele & Bedarf",
    rahmen: "Budget & Zeitrahmen",
    einwaende: "Einwände & offene Fragen",
  },
  platzhalter: {
    ausgangslage: "Was läuft heute, was hakt?",
    bedarf: "Was soll am Ende anders sein?",
    rahmen: "Budget, Starttermin, wer entscheidet",
    einwaende: "Bedenken, Rückfragen, was wir klären müssen",
  },
  notizPlatzhalter: "Einfach lostippen. Die Uhr startet automatisch. „Zeitmarke“ setzt die aktuelle Gesprächszeit an den Zeilenanfang.",
  zeitmarke: "Zeitmarke setzen",
  folgeTitel: "Nächster Schritt",
  folgePlatzhalter: "z. B. Angebot schicken, Rückruf, Vor-Ort-Termin",
  folgeAm: "Datum",
  folgeUm: "Uhrzeit",
  folgeStandard: "Folgetermin",
  abschliessen: "Gespräch abschliessen und speichern",
  speichertLaeuft: "Wird gespeichert …",
  entwurfHinweis: "Der Entwurf bleibt in diesem Tab erhalten, auch nach dem Neuladen.",
  fehlerLeer: "Es gibt noch nichts zu speichern.",
  fehlerSpeicher: "Speichern fehlgeschlagen. Der Entwurf ist noch da, bitte erneut versuchen.",
  gespeichertEyebrow: "In der Akte",
  gespeichertTitel: "Gespräch mit {name} gespeichert ({min} Min).",
  folgeBereit: "Nächster Schritt",
  ohneFolge: "Kein nächster Schritt gesetzt. Du kannst ihn jederzeit in der Kundenakte nachtragen.",
  icsLaden: "In Kalender eintragen (.ics)",
  googleKalender: "Google Kalender",
  neuesGespraech: "Neues Gespräch",
  zurAkte: "Zur Kundenakte",
  kiEyebrow: "KI-Zusammenfassung",
  kiPunkte: "Kernpunkte",
  kiNaechster: "Nächster Schritt",
  original: "Originalnotiz anzeigen",
  inVertrieb: "Im Vertrieb öffnen",
  kiAusstehend: "Wird gerade von der KI aufbereitet – beim nächsten Laden sichtbar.",
  terminmail: "Terminmail senden",
  min: "Min",
  zentrale: "Zentrale",
  gespraechChip: "Gespräch",
  status: "Status",
  live: "Läuft",
  pausiert: "Pausiert",
  bereit: "Bereit",
  naechsterKontakt: "Nächster Kontakt",
  zuletztGesprochen: "Zuletzt gesprochen",
  themen: "Themen",
  leitfragen: "Leitfragen",
  aktivitaet: "Aktivität",
  offen: "Nicht gesetzt",
  faelligListe: "Heute dran",
  zuletztKontakte: "Zuletzt gesprochen",
  sucheHinweis: "Tippe einen Namen, eine Firma oder Nummer. Hier stehen nur fällige und zuletzt gesprochene Kontakte.",
  treffer: "Treffer",
  schnellwahl: "Schnellwahl",
  vorlagen: [
    ["Rückruf", 2, "rückruf|zurückrufen|anrufen"],
    ["Angebot schicken", 3, "angebot|preis|kosten"],
    ["Vor-Ort-Termin", 7, "vor ort|treffen|besuch|termin"],
    ["Nachfassen", 14, "überlegen|melden|später|nachfassen"],
  ],
  erkannt: "Aus der Mitschrift erkannt",
  uebernehmen: "Übernehmen",
  inUebersicht: "Erscheint am Tag automatisch in deiner Übersicht unter „Heute zu tun“.",
}

const TR: GespraechText = {
  ...DE,
  locale: "tr-TR",
  titel: "Görüşme odası",
  lead: "Kişiyi seç, ara, not al. Kapatınca her şey müşteri dosyasına yazılır, sonraki adım doğrudan takvimine gider.",
  nichtVerfuegbar: "Veritabanına şu an ulaşılamıyor. Notları şimdilik başka yerde tut.",
  suche: "İsim, firma, telefon veya e-posta",
  suchen: "Ara",
  kontakte: "Kişiler",
  keineKontakte: "Kişi bulunamadı. Sağda hızlıca oluştur.",
  neuerKontakt: "Yeni kişi",
  name: "İsim",
  firma: "Firma",
  telefon: "Telefon",
  email: "E-posta",
  anlegen: "Oluştur ve görüşmeyi aç",
  waehlen: "Kiminle görüşüyorsun?",
  waehlenText: "Soldan bir kişi seç veya yeni oluştur. Ardından saat, notlar ve takip randevusuyla çalışma alanı açılır.",
  zuletzt: "Son görüşmeler",
  verlauf: "Önceki görüşmeler",
  keinVerlauf: "Bu kişiyle henüz görüşme yok.",
  heuteFaellig: "vadesi",
  raumLabel: "Görüşme notları",
  imGespraech: "Görüşülen kişi",
  ohneFirma: "Firma yok",
  anrufen: "Ara",
  mail: "E-posta",
  dauer: "Görüşme süresi",
  start: "Başlat",
  pause: "Duraklat",
  weiter: "Devam",
  interesseLabel: "Konuşulan konular",
  interessen: [
    ["webseite", "Web sitesi"],
    ["sichtbarkeit", "Görünürlük & Google"],
    ["anfragen", "Talepler & rezervasyon"],
    ["automatisierung", "Otomasyon"],
    ["plattform", "Uygulama & platform"],
    ["barrierefreiheit", "Erişilebilirlik"],
    ["betriebscheck", "İşletme kontrolü"],
  ],
  abschnitte: {
    notiz: "Görüşme notu",
    ausgangslage: "Mevcut durum",
    bedarf: "Hedef & ihtiyaç",
    rahmen: "Bütçe & zaman",
    einwaende: "İtirazlar & açık sorular",
  },
  platzhalter: {
    ausgangslage: "Bugün ne çalışıyor, nerede takılıyor?",
    bedarf: "Sonunda ne farklı olmalı?",
    rahmen: "Bütçe, başlangıç, kim karar veriyor",
    einwaende: "Çekinceler, sorular, netleştirilecekler",
  },
  notizPlatzhalter: "Yazmaya başla, saat kendiliğinden başlar. „Zaman işareti“ o anki görüşme süresini satır başına ekler.",
  zeitmarke: "Zaman işareti",
  folgeTitel: "Sonraki adım",
  folgePlatzhalter: "ör. teklif gönder, geri ara, yerinde görüşme",
  folgeAm: "Tarih",
  folgeUm: "Saat",
  folgeStandard: "Takip randevusu",
  abschliessen: "Görüşmeyi kapat ve kaydet",
  speichertLaeuft: "Kaydediliyor …",
  entwurfHinweis: "Taslak bu sekmede, sayfa yenilense bile korunur.",
  fehlerLeer: "Kaydedilecek bir şey yok.",
  fehlerSpeicher: "Kayıt başarısız. Taslak duruyor, lütfen tekrar dene.",
  gespeichertEyebrow: "Dosyada",
  gespeichertTitel: "{name} ile görüşme kaydedildi ({min} dk).",
  folgeBereit: "Sonraki adım",
  ohneFolge: "Sonraki adım girilmedi. Müşteri dosyasından istediğin zaman ekleyebilirsin.",
  icsLaden: "Takvime ekle (.ics)",
  googleKalender: "Google Takvim",
  neuesGespraech: "Yeni görüşme",
  zurAkte: "Müşteri dosyasına git",
  kiEyebrow: "Yapay zekâ özeti",
  kiPunkte: "Ana maddeler",
  kiNaechster: "Sonraki adım",
  original: "Orijinal notu göster",
  inVertrieb: "Satışta aç",
  kiAusstehend: "Yapay zekâ tarafından hazırlanıyor – bir sonraki yüklemede görünür.",
  terminmail: "Randevu e-postası gönder",
  min: "dk",
  zentrale: "Merkez",
  gespraechChip: "Görüşme",
  status: "Durum",
  live: "Sürüyor",
  pausiert: "Duraklatıldı",
  bereit: "Hazır",
  naechsterKontakt: "Sonraki temas",
  zuletztGesprochen: "Son görüşme",
  themen: "Konular",
  leitfragen: "Yönlendirici sorular",
  aktivitaet: "Aktivite",
  offen: "Belirlenmedi",
  faelligListe: "Bugün sırada",
  zuletztKontakte: "Son konuşulanlar",
  sucheHinweis: "İsim, firma veya numara yaz. Burada yalnızca vadesi gelen ve son konuşulan kişiler görünür.",
  treffer: "Sonuç",
  schnellwahl: "Hızlı seçim",
  vorlagen: [
    ["Geri ara", 2, "geri ara|arayacak|ara"],
    ["Teklif gönder", 3, "teklif|fiyat|maliyet"],
    ["Yerinde görüşme", 7, "yerinde|buluş|ziyaret|randevu"],
    ["Takip et", 14, "düşün|haber|sonra|takip"],
  ],
  erkannt: "Notlardan algılandı",
  uebernehmen: "Uygula",
  inUebersicht: "O gün otomatik olarak Genel bakış’ta „Bugün yapılacaklar“ altında görünür.",
}

export function gespraechText(sprache: AdminSprache): GespraechText {
  return sprache === "tr" ? TR : DE
}
