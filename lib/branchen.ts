import type { Localized } from "@/lib/site-data"
import type { serviceLayers } from "@/lib/site-data"

/**
 * MP-E · BRANCHEN-EINSTIEG — heute genau einer: Handwerk.
 *
 * ---------------------------------------------------------------------------
 * WARUM EINE UND NICHT FÜNFZEHN
 * Die naheliegende Marketing-Bewegung wäre eine Landing je Gewerk und je
 * Stadt. Das ist die Bewegung, die diese Seite nicht macht: Fünfzehn Seiten,
 * die dasselbe sagen und sich im Ortsnamen unterscheiden, sind kein Angebot,
 * sondern Streu. Eine Seite, die den Alltag eines Betriebs so beschreibt, dass
 * er sich wiedererkennt, ist eine.
 *
 * ---------------------------------------------------------------------------
 * ABGRENZUNG ZU `/leistungen/website-handwerk`
 * Es gibt bereits eine Handwerk-Seite — sie verkauft den AUFTRITT. Diese hier
 * verkauft nichts, sie stellt eine Frage: Wie viel läuft noch von Hand? Ihr
 * Ziel ist der Betriebscheck, nicht das Angebot. Zwei Seiten zum selben Wort
 * sind nur dann keine Dublette, wenn sie verschiedene Aufgaben haben — hier
 * ist es Einstieg gegen Leistung, und beide verlinken aufeinander.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER NICHT STEHT (Black Lock)
 * Keine Prozentzahl, keine „bis zu 40 % Zeitersparnis", keine Studie, kein
 * Handwerks-Kunde. creaDIG hat heute zwei veröffentlichte Kundenarbeiten
 * (NV SWISS, maqam) — keine davon ist ein Handwerksbetrieb. Eine Landing, die
 * das verschweigt und trotzdem Vertrauen einsammelt, wäre genau der Fake-Proof,
 * den MP-C verbietet.
 *
 * Was stattdessen trägt: die Beschreibung des Ablaufs. Sie behauptet nichts
 * über creaDIG — sie beschreibt, was der Leser selbst kennt. Wer sich nicht
 * wiedererkennt, ist nicht gemeint, und das ist in Ordnung.
 */

type LayerKey = (typeof serviceLayers)[number]["key"]

export type WorkflowStep = {
  /** Der Schritt im Ablauf — in Versalien im Markup, hier als Wort. */
  key: string
  label: Localized
  /** Wie es heute meistens läuft. */
  ist: Localized
  /** Wie es läuft, wenn der Betrieb ein System hat. */
  soll: Localized
  /** Die Ebene des Hauses, die diesen Schritt trägt. */
  layer: LayerKey
}

/**
 * Sechs Schritte, ein Auftrag. Die Reihenfolge ist nicht erfunden, sie ist
 * die Reihenfolge, in der Geld durch einen Handwerksbetrieb läuft.
 */
export const HANDWERK_WORKFLOW: WorkflowStep[] = [
  {
    key: "anfrage",
    label: { de: "Anfrage", tr: "Talep", en: "Enquiry", ar: "الاستفسار" },
    ist: {
      de: "Telefon, WhatsApp, Zuruf auf der Baustelle. Wer gerade nicht drangeht, verliert sie — und merkt es nie.",
      tr: "Telefon, WhatsApp, şantiyede laf. O an açamayan talebi kaybeder — ve bunu hiç fark etmez.",
      en: "Phone, WhatsApp, a shout across the site. Whoever cannot pick up loses it — and never finds out.",
      ar: "هاتف، واتساب، نداء في الورشة. من لا يستطيع الردّ يفقدها — ولا يعلم بذلك أبدًا.",
    },
    soll: {
      de: "Jede Anfrage landet an einer Stelle, mit Datum und Namen. Auch die vom Samstagabend.",
      tr: "Her talep tek bir yere düşer, tarihi ve adıyla. Cumartesi akşamı geleni de.",
      en: "Every enquiry lands in one place, with a date and a name. Including the one from Saturday night.",
      ar: "كل استفسار يحطّ في موضع واحد، بتاريخ واسم. حتى استفسار مساء السبت.",
    },
    layer: "digital",
  },
  {
    key: "angebot",
    label: { de: "Angebot", tr: "Teklif", en: "Quote", ar: "العرض" },
    ist: {
      de: "Word-Vorlage vom letzten Mal, Preise aus dem Kopf, Adresse noch einmal getippt.",
      tr: "Geçen seferki Word şablonu, akıldan fiyatlar, adres bir kez daha yazılıyor.",
      en: "Last time's Word template, prices from memory, the address typed out again.",
      ar: "قالب Word من المرة الماضية، وأسعار من الذاكرة، وعنوان يُكتب من جديد.",
    },
    soll: {
      de: "Aus der Anfrage wird das Angebot — dieselben Daten, kein zweites Tippen.",
      tr: "Talepten teklif olur — aynı veri, ikinci kez yazmak yok.",
      en: "The enquiry becomes the quote — same data, no second round of typing.",
      ar: "الاستفسار يصير عرضًا — البيانات نفسها، دون كتابة ثانية.",
    },
    layer: "operations",
  },
  {
    key: "termin",
    label: { de: "Termin", tr: "Randevu", en: "Appointment", ar: "الموعد" },
    ist: {
      de: "Ein Kalender im Kopf, einer im Handy, einer an der Wand. Drei Kalender sind kein Kalender.",
      tr: "Biri akılda, biri telefonda, biri duvarda. Planlama tek yerde değilse, kimse güncel durumu net göremez.",
      en: "One calendar in your head, one on the phone, one on the wall. Three calendars are no calendar.",
      ar: "تقويم في الرأس، وآخر في الهاتف، وثالث على الجدار. ثلاثة تقاويم ليست تقويمًا.",
    },
    soll: {
      de: "Ein Termin, den auch der sieht, der ihn nicht gemacht hat.",
      tr: "Randevuyu, onu almayan da görür.",
      en: "An appointment that the person who did not make it can see too.",
      ar: "موعد يراه أيضًا من لم يضعه.",
    },
    layer: "operations",
  },
  {
    key: "auftrag",
    label: { de: "Auftrag", tr: "İş emri", en: "Job", ar: "الطلب" },
    ist: {
      de: "Der Stand steht auf einem Zettel im Fahrzeug. Wer krank wird, nimmt ihn mit.",
      tr: "Durum, araçtaki bir kâğıtta. Hasta olan onu da yanında götürür.",
      en: "The status is on a note in the van. Whoever falls ill takes it with them.",
      ar: "الحالة مكتوبة على ورقة في المركبة. ومن يمرض يأخذها معه.",
    },
    soll: {
      de: "Der Stand hängt am Auftrag, nicht an einer Person.",
      tr: "Durum işe bağlıdır, kişiye değil.",
      en: "The status belongs to the job, not to a person.",
      ar: "الحالة معلّقة بالطلب، لا بشخص.",
    },
    layer: "operations",
  },
  {
    key: "dokumentation",
    label: { de: "Dokumentation", tr: "Belgeleme", en: "Documentation", ar: "التوثيق" },
    ist: {
      de: "Fotos auf dem privaten Handy, Notizen auf der Rückseite des Lieferscheins.",
      tr: "Fotoğraflar özel telefonda, notlar irsaliyenin arkasında.",
      en: "Photos on a private phone, notes on the back of the delivery slip.",
      ar: "صور على هاتف شخصي، وملاحظات على ظهر سند التسليم.",
    },
    soll: {
      de: "Foto und Notiz hängen sofort am Auftrag — vom Gerät aus, das ohnehin dabei ist.",
      tr: "Fotoğraf ve not anında işe eklenir — zaten yanında olan cihazdan.",
      en: "Photo and note attach to the job immediately — from the device that is on site anyway.",
      ar: "الصورة والملاحظة تُلحقان بالطلب فورًا — من الجهاز الموجود أصلًا في الموقع.",
    },
    layer: "automation",
  },
  {
    key: "rechnung",
    label: { de: "Rechnung", tr: "Fatura", en: "Invoice", ar: "الفاتورة" },
    ist: {
      de: "Abends am Küchentisch aus dem Gedächtnis rekonstruiert. Was fehlt, wird nicht abgerechnet.",
      tr: "Akşam mutfak masasında hafızadan toparlanır. Eksik kalan faturalanmaz.",
      en: "Reconstructed from memory at the kitchen table in the evening. What is missing never gets invoiced.",
      ar: "يُعاد تركيبها مساءً على طاولة المطبخ من الذاكرة. وما ينقص لا يُفوتَر.",
    },
    soll: {
      de: "Was dokumentiert ist, ist abgerechnet. Der Rest des Abends gehört Ihnen.",
      tr: "İş tamamlandığında belge ve faturalama da geride kalmamalı. Akşamın geri kalanı sizindir.",
      en: "What is documented is invoiced. The rest of the evening is yours.",
      ar: "ما هو موثَّق مفوتَر. وبقية المساء لكم.",
    },
    layer: "automation",
  },
]

export const handwerkCopy = {
  metaTitle: {
    de: "Handwerk: Ihr Betrieb läuft — aber wie viel davon noch per Hand? | creaDIG",
    tr: "Zanaat: İşletmeniz yürüyor — peki ne kadarı hâlâ elle? | creaDIG",
    en: "Trades: your business runs — but how much of it still by hand? | creaDIG",
    ar: "الحِرف: منشأتكم تعمل — لكن كم منها ما يزال يدويًا؟ | creaDIG",
  },
  metaDescription: {
    de: "Anfrage, Angebot, Termin, Auftrag, Dokumentation, Rechnung — sechs Schritte, meist sechs Werkzeuge. Der Betriebscheck zeigt in zwei Minuten, wo es klemmt.",
    tr: "Talep, teklif, randevu, iş emri, belgeleme, fatura — altı adım, çoğu zaman altı ayrı araç. İşletme kontrolü iki dakikada nerede takıldığını gösterir.",
    en: "Enquiry, quote, appointment, job, documentation, invoice — six steps, usually six tools. The operations check shows in two minutes where it snags.",
    ar: "استفسار، عرض، موعد، طلب، توثيق، فاتورة — ست خطوات، وغالبًا ست أدوات. فحص المنشأة يُظهر في دقيقتين أين يعلق الأمر.",
  },
  eyebrow: { de: "Branche · Handwerk", tr: "Sektör · Zanaat", en: "Sector · trades", ar: "قطاع · الحِرف" },
  /* Owner-Vorgabe aus dem Master-Prompt — nicht umformuliert. */
  title: {
    de: "Ihr Betrieb läuft. Aber wie viel davon noch per Hand?",
    tr: "İşletmeniz yürüyor. Peki ne kadarı hâlâ elle?",
    en: "Your business runs. But how much of it still by hand?",
    ar: "منشأتكم تعمل. لكن كم منها ما يزال يدويًا؟",
  },
  lead: {
    de: "Ein Auftrag geht durch sechs Schritte. In den meisten Betrieben geht er dabei durch sechs verschiedene Werkzeuge — und an jedem Übergang bleibt etwas liegen.",
    tr: "Bir iş altı adımdan geçer. Çoğu işletmede bu altı adım altı farklı araçtan geçer — ve her geçişte bir şey yolda kalır.",
    en: "A job goes through six steps. In most businesses it goes through six different tools on the way — and something gets left behind at every handover.",
    ar: "الطلب يمرّ بست خطوات. وفي معظم المنشآت يمرّ خلالها بست أدوات مختلفة — وعند كل انتقال يبقى شيء في الطريق.",
  },
  workflowEyebrow: { de: "Ein Auftrag, sechs Schritte", tr: "Bir iş, altı adım", en: "One job, six steps", ar: "طلب واحد، ست خطوات" },
  workflowTitle: {
    de: "Sechs Schritte. Wie viele Werkzeuge?",
    tr: "Altı adım. Kaç araç?",
    en: "Six steps. How many tools?",
    ar: "ست خطوات. كم أداة؟",
  },
  istLabel: { de: "Wie es meistens läuft", tr: "Çoğunlukla nasıl yürür", en: "How it usually goes", ar: "كيف يجري غالبًا" },
  sollLabel: { de: "Wie es laufen kann", tr: "Nasıl yürüyebilir", en: "How it could go", ar: "كيف يمكن أن يجري" },
  layerLabel: { de: "Ebene", tr: "Katman", en: "Level", ar: "الطبقة" },
  /*
   * Der Satz, der die Landing ehrlich hält: Die Zahl kennt nur der Betrieb.
   * Hier steht bewusst KEINE Prozentangabe und keine Zeitersparnis.
   */
  bridgeEyebrow: { de: "Die Zahl kennen Sie", tr: "Sayıyı siz biliyorsunuz", en: "You know the number", ar: "الرقم تعرفونه أنتم" },
  bridgeTitle: {
    de: "Wir wissen nicht, wie viele Stellen es bei Ihnen sind. Sie schon.",
    tr: "Sizde kaç nokta olduğunu biz bilmiyoruz. Siz biliyorsunuz.",
    en: "We do not know how many places there are in your business. You do.",
    ar: "نحن لا نعرف كم موضعًا لديكم. أنتم تعرفون.",
  },
  bridgeBody: {
    de: "Fünfzehn Fragen zu Ihrem Alltag, zwei Minuten, kein Anruf davor. Am Ende sehen Sie, auf welcher Ebene der Engpass liegt und wie viele Stellen Sie selbst als offen benannt haben.",
    tr: "Günlük işinize dair on beş soru, iki dakika, öncesinde telefon yok. Sonunda darboğazın hangi katmanda olduğunu ve kaç noktayı kendinizin açık işaretlediğini görürsünüz.",
    en: "Fifteen questions about your working day, two minutes, no call beforehand. At the end you see which level the bottleneck sits on and how many places you marked as open yourself.",
    ar: "خمسة عشر سؤالًا عن يومكم العملي، دقيقتان، دون مكالمة مسبقة. وفي النهاية ترون على أي طبقة يقع الاختناق وكم موضعًا وسمتموه أنتم مفتوحًا.",
  },
  checkCta: { de: "Betriebscheck starten", tr: "İşletme kontrolünü başlat", en: "Start the operations check", ar: "بدء فحص المنشأة" },
  talkCta: { de: "Lieber direkt sprechen", tr: "Doğrudan konuşalım", en: "Rather talk directly", ar: "أفضّل الحديث مباشرةً" },
  buildEyebrow: { de: "Was wir dann bauen", tr: "Sonra ne kurarız", en: "What we build then", ar: "ما نبنيه عندها" },
  buildTitle: {
    de: "Erst der Betrieb, dann die Software.",
    tr: "Önce işletme, sonra yazılım.",
    en: "The business first, the software second.",
    ar: "المنشأة أولًا، ثم البرمجيات.",
  },
  buildBody: {
    de: "Wir bauen kein Werkzeug für einen Schritt, sondern die Verbindung zwischen ihnen. Wo der Auftritt fehlt, fangen wir dort an; wo er steht, fangen wir hinter ihm an.",
    tr: "Tek bir adım için araç kurmayız, adımlar arasındaki bağı kurarız. Görünüm eksikse oradan başlarız; duruyorsa arkasından başlarız.",
    en: "We do not build a tool for one step, we build the connection between them. Where the presence is missing we start there; where it stands, we start behind it.",
    ar: "لا نبني أداة لخطوة واحدة، بل الرابط بينها. فحيث ينقص الحضور نبدأ من هناك؛ وحيث هو قائم نبدأ من خلفه.",
  },
  buildWebsite: { de: "Website fürs Handwerk", tr: "Zanaat için web sitesi", en: "Website for trades", ar: "موقع للحِرف" },
  buildLayers: { de: "Die fünf Ebenen", tr: "Beş katman", en: "The five levels", ar: "الطبقات الخمس" },
  buildWorks: { de: "Was wir gebaut haben", tr: "Neler kurduk", en: "What we built", ar: "ما الذي بنيناه" },
  /* MP-E.5 · Der Rückweg von der Leistungsseite auf den Einstieg. */
  backlinkLead: {
    de: "Noch nicht sicher, wo es im Betrieb klemmt?",
    tr: "İşletmede tam olarak nerede takıldığından emin değil misiniz?",
    en: "Not yet sure where your business is stuck?",
    ar: "لستم متأكدين بعد أين تعلق المنشأة؟",
  },
  backlinkCta: {
    de: "Der Einstieg für Handwerksbetriebe",
    tr: "Zanaat işletmeleri için giriş",
    en: "The entry point for trade businesses",
    ar: "نقطة البداية للمنشآت الحِرفية",
  },
} as const

/**
 * MP-E.5 · WELCHE LEISTUNGSSEITE AUF WELCHEN EINSTIEG ZURUECKVERWEIST.
 *
 * Die Abnahme hat gezeigt: Der Weg lief nur in eine Richtung. Der Einstieg
 * verlinkte die Leistungsseite, die Leistungsseite kannte den Einstieg nicht.
 * Fuer einen Besucher heisst das: Wer ueber die Suche direkt auf "Website fuer
 * Handwerksbetriebe" landet und noch gar nicht weiss, ob er eine Website
 * braucht, hat keinen Weg zur Diagnose. Fuer eine Suchmaschine heisst es:
 * zwei Seiten zum selben Wort ohne erkennbare Beziehung.
 *
 * Die Zuordnung steht HIER und nicht als Feld an ServicePage: Sie ist Wissen
 * der Branche ueber die Leistung, nicht umgekehrt. Kommt eine zweite Branche,
 * waechst diese Tabelle — der Leistungs-Datensatz bleibt unangetastet.
 */
export const BRANCH_ENTRY_FOR_SERVICE: Record<
  string,
  { path: string; lead: Localized; cta: Localized }
> = {
  "website-handwerk": {
    path: "/branchen/handwerk",
    lead: handwerkCopy.backlinkLead,
    cta: handwerkCopy.backlinkCta,
  },
}
