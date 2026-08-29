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
    label: { de: "Anfrage", tr: "Talep" },
    ist: {
      de: "Telefon, WhatsApp, Zuruf auf der Baustelle. Wer gerade nicht drangeht, verliert sie — und merkt es nie.",
      tr: "Telefon, WhatsApp, şantiyede laf. O an açamayan talebi kaybeder — ve bunu hiç fark etmez.",
    },
    soll: {
      de: "Jede Anfrage landet an einer Stelle, mit Datum und Namen. Auch die vom Samstagabend.",
      tr: "Her talep tek bir yere düşer, tarihi ve adıyla. Cumartesi akşamı geleni de.",
    },
    layer: "digital",
  },
  {
    key: "angebot",
    label: { de: "Angebot", tr: "Teklif" },
    ist: {
      de: "Word-Vorlage vom letzten Mal, Preise aus dem Kopf, Adresse noch einmal getippt.",
      tr: "Geçen seferki Word şablonu, akıldan fiyatlar, adres bir kez daha yazılıyor.",
    },
    soll: {
      de: "Aus der Anfrage wird das Angebot — dieselben Daten, kein zweites Tippen.",
      tr: "Talepten teklif olur — aynı veri, ikinci kez yazmak yok.",
    },
    layer: "operations",
  },
  {
    key: "termin",
    label: { de: "Termin", tr: "Randevu" },
    ist: {
      de: "Ein Kalender im Kopf, einer im Handy, einer an der Wand. Drei Kalender sind kein Kalender.",
      tr: "Biri akılda, biri telefonda, biri duvarda. Planlama tek yerde değilse, kimse güncel durumu net göremez.",
    },
    soll: {
      de: "Ein Termin, den auch der sieht, der ihn nicht gemacht hat.",
      tr: "Randevuyu, onu almayan da görür.",
    },
    layer: "operations",
  },
  {
    key: "auftrag",
    label: { de: "Auftrag", tr: "İş emri" },
    ist: {
      de: "Der Stand steht auf einem Zettel im Fahrzeug. Wer krank wird, nimmt ihn mit.",
      tr: "Durum, araçtaki bir kâğıtta. Hasta olan onu da yanında götürür.",
    },
    soll: {
      de: "Der Stand hängt am Auftrag, nicht an einer Person.",
      tr: "Durum işe bağlıdır, kişiye değil.",
    },
    layer: "operations",
  },
  {
    key: "dokumentation",
    label: { de: "Dokumentation", tr: "Belgeleme" },
    ist: {
      de: "Fotos auf dem privaten Handy, Notizen auf der Rückseite des Lieferscheins.",
      tr: "Fotoğraflar özel telefonda, notlar irsaliyenin arkasında.",
    },
    soll: {
      de: "Foto und Notiz hängen sofort am Auftrag — vom Gerät aus, das ohnehin dabei ist.",
      tr: "Fotoğraf ve not anında işe eklenir — zaten yanında olan cihazdan.",
    },
    layer: "automation",
  },
  {
    key: "rechnung",
    label: { de: "Rechnung", tr: "Fatura" },
    ist: {
      de: "Abends am Küchentisch aus dem Gedächtnis rekonstruiert. Was fehlt, wird nicht abgerechnet.",
      tr: "Akşam mutfak masasında hafızadan toparlanır. Eksik kalan faturalanmaz.",
    },
    soll: {
      de: "Was dokumentiert ist, ist abgerechnet. Der Rest des Abends gehört Ihnen.",
      tr: "İş tamamlandığında belge ve faturalama da geride kalmamalı. Akşamın geri kalanı sizindir.",
    },
    layer: "automation",
  },
]

export const handwerkCopy = {
  metaTitle: {
    de: "Handwerk: Ihr Betrieb läuft — aber wie viel davon noch per Hand? | creaDIG",
    tr: "Zanaat: İşletmeniz yürüyor — peki ne kadarı hâlâ elle? | creaDIG",
  },
  metaDescription: {
    de: "Anfrage, Angebot, Termin, Auftrag, Dokumentation, Rechnung — sechs Schritte, meist sechs Werkzeuge. Der Betriebscheck zeigt in zwei Minuten, wo es klemmt.",
    tr: "Talep, teklif, randevu, iş emri, belgeleme, fatura — altı adım, çoğu zaman altı ayrı araç. İşletme kontrolü iki dakikada nerede takıldığını gösterir.",
  },
  eyebrow: { de: "Branche · Handwerk", tr: "Sektör · Zanaat" },
  /* Owner-Vorgabe aus dem Master-Prompt — nicht umformuliert. */
  title: {
    de: "Ihr Betrieb läuft. Aber wie viel davon noch per Hand?",
    tr: "İşletmeniz yürüyor. Peki ne kadarı hâlâ elle?",
  },
  lead: {
    de: "Ein Auftrag geht durch sechs Schritte. In den meisten Betrieben geht er dabei durch sechs verschiedene Werkzeuge — und an jedem Übergang bleibt etwas liegen.",
    tr: "Bir iş altı adımdan geçer. Çoğu işletmede bu altı adım altı farklı araçtan geçer — ve her geçişte bir şey yolda kalır.",
  },
  workflowEyebrow: { de: "Ein Auftrag, sechs Schritte", tr: "Bir iş, altı adım" },
  workflowTitle: {
    de: "Sechs Schritte. Wie viele Werkzeuge?",
    tr: "Altı adım. Kaç araç?",
  },
  istLabel: { de: "Wie es meistens läuft", tr: "Çoğunlukla nasıl yürür" },
  sollLabel: { de: "Wie es laufen kann", tr: "Nasıl yürüyebilir" },
  layerLabel: { de: "Ebene", tr: "Katman" },
  /*
   * Der Satz, der die Landing ehrlich hält: Die Zahl kennt nur der Betrieb.
   * Hier steht bewusst KEINE Prozentangabe und keine Zeitersparnis.
   */
  bridgeEyebrow: { de: "Die Zahl kennen Sie", tr: "Sayıyı siz biliyorsunuz" },
  bridgeTitle: {
    de: "Wir wissen nicht, wie viele Stellen es bei Ihnen sind. Sie schon.",
    tr: "Sizde kaç nokta olduğunu biz bilmiyoruz. Siz biliyorsunuz.",
  },
  bridgeBody: {
    de: "Fünfzehn Fragen zu Ihrem Alltag, zwei Minuten, kein Anruf davor. Am Ende sehen Sie, auf welcher Ebene der Engpass liegt und wie viele Stellen Sie selbst als offen benannt haben.",
    tr: "Günlük işinize dair on beş soru, iki dakika, öncesinde telefon yok. Sonunda darboğazın hangi katmanda olduğunu ve kaç noktayı kendinizin açık işaretlediğini görürsünüz.",
  },
  checkCta: { de: "Betriebscheck starten", tr: "İşletme kontrolünü başlat" },
  talkCta: { de: "Lieber direkt sprechen", tr: "Doğrudan konuşalım" },
  buildEyebrow: { de: "Was wir dann bauen", tr: "Sonra ne kurarız" },
  buildTitle: {
    de: "Erst der Betrieb, dann die Software.",
    tr: "Önce işletme, sonra yazılım.",
  },
  buildBody: {
    de: "Wir bauen kein Werkzeug für einen Schritt, sondern die Verbindung zwischen ihnen. Wo der Auftritt fehlt, fangen wir dort an; wo er steht, fangen wir hinter ihm an.",
    tr: "Tek bir adım için araç kurmayız, adımlar arasındaki bağı kurarız. Görünüm eksikse oradan başlarız; duruyorsa arkasından başlarız.",
  },
  buildWebsite: { de: "Website fürs Handwerk", tr: "Zanaat için web sitesi" },
  buildLayers: { de: "Die fünf Ebenen", tr: "Beş katman" },
  buildWorks: { de: "Was wir gebaut haben", tr: "Neler kurduk" },
  /* MP-E.5 · Der Rückweg von der Leistungsseite auf den Einstieg. */
  backlinkLead: {
    de: "Noch nicht sicher, wo es im Betrieb klemmt?",
    tr: "İşletmede tam olarak nerede takıldığından emin değil misiniz?",
  },
  backlinkCta: {
    de: "Der Einstieg für Handwerksbetriebe",
    tr: "Zanaat işletmeleri için giriş",
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
