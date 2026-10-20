import type { Locale } from "@/lib/dictionary"

/**
 * Alle Texte der Terminbuchung (Seite, Aktion, Bestätigungs- und Absagemail)
 * in den vier Sprachen der Seite. Dieselbe Idee wie das Wörterbuch des
 * Termin-Assistenten (`dictionary[locale].termin`): die Sprache ist ein
 * Schlüssel, nicht ein Umbau. Als eigene Datei, weil Server (Mails) und
 * Client (Auswahl) sie teilen und `lib/dictionary.ts` dafür zu groß ist.
 *
 * Die Sprache kommt NIE vom Browser des Buchenden, sondern aus dem Link
 * (`booking_links.locale`) — und der erbt sie von der Anfrage des Kontakts.
 */

export const TERMIN_LOCALES = ["de", "en", "tr", "ar"] as const
export const istTerminLocale = (v: unknown): v is Locale => typeof v === "string" && (TERMIN_LOCALES as readonly string[]).includes(v)

export type Gespraechsart = "kennenlernen" | "video" | "vorort"

export type TerminTexte = {
  /** BCP-47 für Datums-/Zeitformate. */
  intl: string
  /** Hinter der Uhrzeit ("14:00 Uhr"); in den anderen Sprachen leer. */
  uhrSuffix: string
  dir: "ltr" | "rtl"
  pfad: string
  art: Record<Gespraechsart, string>
  seiteTitel: string
  eyebrow: string
  ueberschrift: (art: string) => string
  intro: (dauer: number, tz: string) => string
  linkGrund: Record<"unbekannt" | "abgelaufen" | "benutzt" | "widerrufen" | "speicher", string>
  schreibenSie: string
  auswahl: {
    bestaetigt: string
    referenz: string
    bestaetigungUnterwegs: string
    keinTermin: string
    uhrzeitWaehlen: string
    bitteUhrzeit: string
    gewaehlt: string
    minuten: string
    nochKeine: string
    name: string
    email: string
    worum: string
    optional: string
    buchen: string
    laeuft: string
    datenschutzVor: string
    datenschutz: string
  }
  fehler: {
    abgelehnt: string
    name: string
    email: string
    start: string
    zuViele: string
    vergeben: string
    link: string
    spaeter: string
  }
  mail: {
    bestaetigtSubject: (zeit: string) => string
    bestaetigtVorschau: (zeit: string) => string
    bestaetigtTitel: string
    bestaetigtText: (name: string) => string[]
    ics: (art: string) => string
    absageSubject: (referenz: string) => string
    absageVorschau: string
    absageTitel: string
    absageText: (name: string, zeit: string, grund: string | null) => string[]
    terminWaehlen: string
    footerImpressum: string
    footerDatenschutz: string
    footerAbmelden: string
    labelTermin: string
    labelArt: string
    labelReferenz: string
  }
}

const GRUSS_DE = "Viele Grüße\nMuhammed Emin Akyol · creaDIG"

export const TERMIN_TEXTE: Record<Locale, TerminTexte> = {
  de: {
    intl: "de-DE",
    uhrSuffix: " Uhr",
    dir: "ltr",
    pfad: "",
    art: { kennenlernen: "Kennenlernen", video: "Videogespräch", vorort: "Termin vor Ort" },
    seiteTitel: "Termin wählen",
    eyebrow: "creaDIG · Termin",
    ueberschrift: (art) => `${art} wählen`,
    intro: (dauer, tz) => `${dauer} Minuten. Alle Zeiten in deutscher Zeit (${tz}). Sie erhalten sofort eine Bestätigung mit Kalenderdatei.`,
    linkGrund: {
      unbekannt: "Diesen Buchungslink kennen wir nicht.",
      abgelaufen: "Dieser Buchungslink ist abgelaufen.",
      benutzt: "Mit diesem Link wurde bereits ein Termin gebucht.",
      widerrufen: "Dieser Buchungslink wurde zurückgezogen.",
      speicher: "Die Terminbuchung ist gerade nicht erreichbar.",
    },
    schreibenSie: "Schreiben Sie uns gern an",
    auswahl: {
      bestaetigt: "Termin bestätigt",
      referenz: "Referenz",
      bestaetigungUnterwegs: "Die Bestätigung mit Kalenderdatei ist unterwegs.",
      keinTermin: "Gerade ist kein Termin frei. Antworten Sie einfach auf unsere Mail — wir finden einen.",
      uhrzeitWaehlen: "Uhrzeit wählen",
      bitteUhrzeit: "Bitte zuerst eine Uhrzeit wählen.",
      gewaehlt: "Gewählt:",
      minuten: "Min.",
      nochKeine: "Noch keine Uhrzeit gewählt.",
      name: "Name",
      email: "E-Mail",
      worum: "Worum geht es?",
      optional: "(optional)",
      buchen: "Termin verbindlich buchen",
      laeuft: "Wird gebucht …",
      datenschutzVor: "Ihre Angaben nutzen wir nur für diesen Termin. Mehr in der",
      datenschutz: "Datenschutzerklärung",
    },
    fehler: {
      abgelehnt: "Anfrage abgelehnt.",
      name: "Bitte Ihren Namen angeben.",
      email: "Bitte eine gültige E-Mail-Adresse angeben.",
      start: "Bitte einen Termin wählen.",
      zuViele: "Zu viele Versuche. Bitte in einigen Minuten erneut.",
      vergeben: "Dieser Termin wurde gerade vergeben. Bitte einen anderen wählen.",
      link: "Dieser Buchungslink ist nicht mehr gültig.",
      spaeter: "Buchung gerade nicht möglich. Bitte später erneut.",
    },
    mail: {
      bestaetigtSubject: (zeit) => `Termin bestätigt · ${zeit}`,
      bestaetigtVorschau: (zeit) => `Ihr Termin am ${zeit}`,
      bestaetigtTitel: "Ihr Termin ist bestätigt",
      bestaetigtText: (name) => [
        `Hallo ${name},`,
        "vielen Dank – Ihr Termin ist eingetragen. Die Kalenderdatei hängt an.",
        "Falls etwas dazwischenkommt, antworten Sie einfach auf diese Mail.",
        GRUSS_DE,
      ],
      ics: (art) => `${art} mit creaDIG`,
      absageSubject: (r) => `Termin abgesagt · ${r}`,
      absageVorschau: "Ihr Termin wurde abgesagt",
      absageTitel: "Termin abgesagt",
      absageText: (name, zeit, grund) => [
        `Hallo ${name},`,
        `leider muss ich unseren Termin am ${zeit} absagen.${grund ? ` ${grund}` : ""}`,
        "Ich melde mich mit einem neuen Vorschlag.",
        GRUSS_DE,
      ],
      terminWaehlen: "Termin wählen",
      footerImpressum: "Impressum",
      footerDatenschutz: "Datenschutz",
      footerAbmelden: "Sie möchten keine weiteren Nachrichten? Eine kurze Antwort auf diese Mail genügt.",
      labelTermin: "Termin",
      labelArt: "Art",
      labelReferenz: "Referenz",
    },
  },
  en: {
    intl: "en-GB",
    uhrSuffix: "",
    dir: "ltr",
    pfad: "/en",
    art: { kennenlernen: "Introductory call", video: "Video call", vorort: "On-site meeting" },
    seiteTitel: "Choose a time",
    eyebrow: "creaDIG · Appointment",
    ueberschrift: (art) => `${art}: choose a time`,
    intro: (dauer, tz) => `${dauer} minutes. All times are in German time (${tz}). You will receive a confirmation with a calendar file straight away.`,
    linkGrund: {
      unbekannt: "We don't recognise this booking link.",
      abgelaufen: "This booking link has expired.",
      benutzt: "An appointment has already been booked with this link.",
      widerrufen: "This booking link has been withdrawn.",
      speicher: "Booking is currently unavailable.",
    },
    schreibenSie: "Please write to us at",
    auswahl: {
      bestaetigt: "Appointment confirmed",
      referenz: "Reference",
      bestaetigungUnterwegs: "The confirmation with a calendar file is on its way.",
      keinTermin: "No time slot is free right now. Simply reply to our email — we will find one.",
      uhrzeitWaehlen: "Choose a time",
      bitteUhrzeit: "Please choose a time first.",
      gewaehlt: "Selected:",
      minuten: "min.",
      nochKeine: "No time selected yet.",
      name: "Name",
      email: "Email",
      worum: "What is it about?",
      optional: "(optional)",
      buchen: "Book appointment",
      laeuft: "Booking …",
      datenschutzVor: "We only use your details for this appointment. More in our",
      datenschutz: "privacy policy",
    },
    fehler: {
      abgelehnt: "Request declined.",
      name: "Please enter your name.",
      email: "Please enter a valid email address.",
      start: "Please choose a time.",
      zuViele: "Too many attempts. Please try again in a few minutes.",
      vergeben: "That slot has just been taken. Please choose another.",
      link: "This booking link is no longer valid.",
      spaeter: "Booking is not possible right now. Please try again later.",
    },
    mail: {
      bestaetigtSubject: (zeit) => `Appointment confirmed · ${zeit}`,
      bestaetigtVorschau: (zeit) => `Your appointment on ${zeit}`,
      bestaetigtTitel: "Your appointment is confirmed",
      bestaetigtText: (name) => [
        `Hello ${name},`,
        "thank you — your appointment is booked. The calendar file is attached.",
        "If something comes up, just reply to this email.",
        "Kind regards\nMuhammed Emin Akyol · creaDIG",
      ],
      ics: (art) => `${art} with creaDIG`,
      absageSubject: (r) => `Appointment cancelled · ${r}`,
      absageVorschau: "Your appointment has been cancelled",
      absageTitel: "Appointment cancelled",
      absageText: (name, zeit, grund) => [
        `Hello ${name},`,
        `unfortunately I have to cancel our appointment on ${zeit}.${grund ? ` ${grund}` : ""}`,
        "I will get back to you with a new proposal.",
        "Kind regards\nMuhammed Emin Akyol · creaDIG",
      ],
      terminWaehlen: "Choose a time",
      footerImpressum: "Legal notice",
      footerDatenschutz: "Privacy",
      footerAbmelden: "Don't want further messages? A short reply to this email is enough.",
      labelTermin: "Appointment",
      labelArt: "Type",
      labelReferenz: "Reference",
    },
  },
  tr: {
    intl: "tr-TR",
    uhrSuffix: "",
    dir: "ltr",
    pfad: "/tr",
    art: { kennenlernen: "Tanışma görüşmesi", video: "Video görüşmesi", vorort: "Yüz yüze görüşme" },
    seiteTitel: "Randevu seçin",
    eyebrow: "creaDIG · Randevu",
    ueberschrift: (art) => `${art}: zamanınızı seçin`,
    intro: (dauer, tz) => `${dauer} dakika. Tüm saatler Almanya saatine göredir (${tz}). Takvim dosyalı onayı hemen e-posta ile alırsınız.`,
    linkGrund: {
      unbekannt: "Bu randevu bağlantısını tanımıyoruz.",
      abgelaufen: "Bu randevu bağlantısının süresi dolmuş.",
      benutzt: "Bu bağlantıyla zaten bir randevu alınmış.",
      widerrufen: "Bu randevu bağlantısı geri çekildi.",
      speicher: "Randevu sistemi şu anda ulaşılamıyor.",
    },
    schreibenSie: "Bize şu adresten yazabilirsiniz:",
    auswahl: {
      bestaetigt: "Randevu onaylandı",
      referenz: "Referans",
      bestaetigungUnterwegs: "Takvim dosyalı onay e-postası yolda.",
      keinTermin: "Şu anda boş randevu yok. E-postamıza yanıt vermeniz yeterli — birlikte bir zaman buluruz.",
      uhrzeitWaehlen: "Saat seçin",
      bitteUhrzeit: "Lütfen önce bir saat seçin.",
      gewaehlt: "Seçilen:",
      minuten: "dk.",
      nochKeine: "Henüz saat seçilmedi.",
      name: "Ad soyad",
      email: "E-posta",
      worum: "Konu nedir?",
      optional: "(isteğe bağlı)",
      buchen: "Randevuyu kesinleştir",
      laeuft: "Randevu alınıyor …",
      datenschutzVor: "Bilgilerinizi yalnızca bu randevu için kullanırız. Ayrıntılar:",
      datenschutz: "Gizlilik politikası",
    },
    fehler: {
      abgelehnt: "İstek reddedildi.",
      name: "Lütfen adınızı yazın.",
      email: "Lütfen geçerli bir e-posta adresi yazın.",
      start: "Lütfen bir randevu seçin.",
      zuViele: "Çok fazla deneme. Lütfen birkaç dakika sonra tekrar deneyin.",
      vergeben: "Bu randevu az önce alındı. Lütfen başka bir zaman seçin.",
      link: "Bu randevu bağlantısı artık geçerli değil.",
      spaeter: "Randevu şu anda alınamıyor. Lütfen daha sonra tekrar deneyin.",
    },
    mail: {
      bestaetigtSubject: (zeit) => `Randevu onaylandı · ${zeit}`,
      bestaetigtVorschau: (zeit) => `Randevunuz: ${zeit}`,
      bestaetigtTitel: "Randevunuz onaylandı",
      bestaetigtText: (name) => [
        `Merhaba ${name},`,
        "teşekkürler — randevunuz kaydedildi. Takvim dosyası ekte.",
        "Bir aksilik çıkarsa bu e-postaya yanıt vermeniz yeterli.",
        "Saygılarımla\nMuhammed Emin Akyol · creaDIG",
      ],
      ics: (art) => `creaDIG ile ${art.toLowerCase()}`,
      absageSubject: (r) => `Randevu iptal edildi · ${r}`,
      absageVorschau: "Randevunuz iptal edildi",
      absageTitel: "Randevu iptal edildi",
      absageText: (name, zeit, grund) => [
        `Merhaba ${name},`,
        `maalesef ${zeit} tarihli randevumuzu iptal etmem gerekiyor.${grund ? ` ${grund}` : ""}`,
        "Yeni bir öneriyle size döneceğim.",
        "Saygılarımla\nMuhammed Emin Akyol · creaDIG",
      ],
      terminWaehlen: "Randevu seçin",
      footerImpressum: "Künye",
      footerDatenschutz: "Gizlilik",
      footerAbmelden: "Başka mesaj almak istemiyor musunuz? Bu e-postaya kısa bir yanıt yeterli.",
      labelTermin: "Randevu",
      labelArt: "Tür",
      labelReferenz: "Referans",
    },
  },
  ar: {
    intl: "ar-u-nu-latn",
    uhrSuffix: "",
    dir: "rtl",
    pfad: "/ar",
    art: { kennenlernen: "مكالمة تعارف", video: "مكالمة فيديو", vorort: "لقاء حضوري" },
    seiteTitel: "اختر موعدًا",
    eyebrow: "creaDIG · موعد",
    ueberschrift: (art) => `${art}: اختر الموعد`,
    intro: (dauer, tz) => `${dauer} دقيقة. جميع الأوقات بالتوقيت الألماني (${tz}). ستصلك رسالة تأكيد مع ملف التقويم فورًا.`,
    linkGrund: {
      unbekannt: "لا نعرف رابط الحجز هذا.",
      abgelaufen: "انتهت صلاحية رابط الحجز هذا.",
      benutzt: "تم حجز موعد بالفعل بهذا الرابط.",
      widerrufen: "تم سحب رابط الحجز هذا.",
      speicher: "خدمة حجز المواعيد غير متاحة حاليًا.",
    },
    schreibenSie: "يسعدنا أن تراسلنا على",
    auswahl: {
      bestaetigt: "تم تأكيد الموعد",
      referenz: "المرجع",
      bestaetigungUnterwegs: "رسالة التأكيد مع ملف التقويم في الطريق إليك.",
      keinTermin: "لا يوجد موعد متاح الآن. يكفي أن تردّ على رسالتنا — وسنجد وقتًا مناسبًا.",
      uhrzeitWaehlen: "اختر الوقت",
      bitteUhrzeit: "يرجى اختيار الوقت أولًا.",
      gewaehlt: "المحدد:",
      minuten: "دقيقة",
      nochKeine: "لم يتم اختيار وقت بعد.",
      name: "الاسم",
      email: "البريد الإلكتروني",
      worum: "ما موضوع اللقاء؟",
      optional: "(اختياري)",
      buchen: "تأكيد حجز الموعد",
      laeuft: "جارٍ الحجز …",
      datenschutzVor: "نستخدم بياناتك لهذا الموعد فقط. المزيد في",
      datenschutz: "سياسة الخصوصية",
    },
    fehler: {
      abgelehnt: "تم رفض الطلب.",
      name: "يرجى إدخال اسمك.",
      email: "يرجى إدخال بريد إلكتروني صحيح.",
      start: "يرجى اختيار موعد.",
      zuViele: "محاولات كثيرة. يرجى المحاولة مرة أخرى بعد بضع دقائق.",
      vergeben: "تم حجز هذا الموعد للتو. يرجى اختيار موعد آخر.",
      link: "رابط الحجز هذا لم يعد صالحًا.",
      spaeter: "الحجز غير ممكن حاليًا. يرجى المحاولة لاحقًا.",
    },
    mail: {
      bestaetigtSubject: (zeit) => `تم تأكيد الموعد · ${zeit}`,
      bestaetigtVorschau: (zeit) => `موعدك: ${zeit}`,
      bestaetigtTitel: "تم تأكيد موعدك",
      bestaetigtText: (name) => [
        `مرحبًا ${name}،`,
        "شكرًا لك — تم تسجيل موعدك. ملف التقويم مرفق.",
        "إذا طرأ أي ظرف، يكفي أن تردّ على هذه الرسالة.",
        "مع خالص التحية\nMuhammed Emin Akyol · creaDIG",
      ],
      ics: (art) => `${art} مع creaDIG`,
      absageSubject: (r) => `تم إلغاء الموعد · ${r}`,
      absageVorschau: "تم إلغاء موعدك",
      absageTitel: "تم إلغاء الموعد",
      absageText: (name, zeit, grund) => [
        `مرحبًا ${name}،`,
        `للأسف عليّ إلغاء موعدنا في ${zeit}.${grund ? ` ${grund}` : ""}`,
        "سأتواصل معك باقتراح جديد.",
        "مع خالص التحية\nMuhammed Emin Akyol · creaDIG",
      ],
      terminWaehlen: "اختر موعدًا",
      footerImpressum: "البيانات القانونية",
      footerDatenschutz: "الخصوصية",
      footerAbmelden: "لا ترغب في مزيد من الرسائل؟ يكفي ردّ قصير على هذه الرسالة.",
      labelTermin: "الموعد",
      labelArt: "النوع",
      labelReferenz: "المرجع",
    },
  },
}

/** "Dienstag, 21. Oktober 2026, 14:00–14:45 Uhr" in der Sprache des Gastes. */
export function terminZeit(t: { startsAt: string; endsAt: string }, locale: Locale, timezone = "Europe/Berlin"): string {
  const x = TERMIN_TEXTE[locale]
  const s = new Date(t.startsAt)
  const e = new Date(t.endsAt)
  const tag = s.toLocaleDateString(x.intl, { timeZone: timezone, weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const von = s.toLocaleTimeString(x.intl, { timeZone: timezone, hour: "2-digit", minute: "2-digit" })
  const bis = e.toLocaleTimeString(x.intl, { timeZone: timezone, hour: "2-digit", minute: "2-digit" })
  return `${tag}, ${von}–${bis}${x.uhrSuffix}`
}
