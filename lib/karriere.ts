import type { Localized } from "@/lib/site-data"

/*
 * ===========================================================================
 * KARRIERE — DIE EINSTELLUNGS-WAHRHEIT
 * ===========================================================================
 *
 * Diese Datei ist die EINZIGE Quelle dafuer, was creaDIG oeffentlich ueber
 * offene Stellen sagt. Sie steht hier und nicht im JSX, aus demselben Grund
 * wie die Steuerlage in `lib/rechnung.ts`: Eine Aussage ueber den eigenen
 * Betrieb, die an drei Stellen im Markup wiederholt wird, ist beim naechsten
 * Bearbeiten an zwei Stellen falsch.
 *
 * ---------------------------------------------------------------------------
 * DREI ZUSTAENDE — UND WARUM DER UNTERSCHIED TEUER IST
 *
 *   talent-pool  Wir lernen Menschen kennen, bevor wir sie brauchen. Es gibt
 *                keine Stelle, auf die man sich bewerben koennte.
 *   planned      Die Rolle steht in der Personalplanung. Start, Budget und
 *                Freigabe stehen NICHT fest.
 *   open         Die Stelle ist freigegeben und wird besetzt.
 *
 * „Jetzt bewerben" ueber einem Talent Pool ist keine Marketing-Freiheit,
 * sondern eine Falschangabe: Der Leser investiert Zeit in der Annahme, dass
 * am Ende ein Arbeitsvertrag stehen kann. Deshalb leitet sich die
 * Handlungsaufforderung aus dem Zustand ab und wird nirgends von Hand
 * gesetzt.
 *
 * ---------------------------------------------------------------------------
 * WAS DIESE DATEI BEWUSST NICHT IST
 *
 * Kein Bewerbermanagement. Es gibt hier keine Kandidaten, keine Bewertungen,
 * keine Entscheidungen und keine Pipeline. Die kuenftige Trennung
 * Mensch / Bewerbung / Nachweis / Beurteilung / Entscheidung ist unten als
 * Typ angedeutet, damit die oeffentliche Seite sich nicht in eine Sackgasse
 * baut — mehr nicht. Wer daraus ein ATS macht, hat die Grenze ueberschritten.
 */

/* ── Zustand einer Rolle ─────────────────────────────────────────────────── */

export const ROLLEN_ZUSTAENDE = ["talent-pool", "geplant", "offen"] as const
export type RollenZustand = (typeof ROLLEN_ZUSTAENDE)[number]

/* ── Die zwei Spuren ─────────────────────────────────────────────────────── */

export const TALENT_SPUREN = ["dach-business-development", "founding-talent"] as const
export type TalentSpur = (typeof TALENT_SPUREN)[number]

/**
 * Wofuer sich jemand meldet. Heute deckungsgleich mit der Spur — als eigener
 * Typ, weil eine Bewerbung spaeter auf eine konkrete Rolle zeigen kann, die
 * Spur aber bleibt.
 */
export type Bewerbungsabsicht = TalentSpur

/* ── Sprache ─────────────────────────────────────────────────────────────── */

export type Sprachniveau = "kern" | "hilfreich" | "nuetzlich"

export type Sprachanforderung = {
  sprache: Localized
  niveau: Sprachniveau
  /**
   * WOFUER die Sprache gebraucht wird — nicht, welches Zertifikat.
   *
   * Deutsch wird hier an der Aufgabe gemessen: ein Gespraech mit einem
   * deutschen Betrieb fuehren. Nicht an Herkunft, Pass, Nachname oder
   * Akzent. Das ist keine Hoeflichkeit, sondern die einzige Anforderung, die
   * mit der Arbeit zu tun hat.
   */
  wofuer: Localized
}

/* ── Nachweise ───────────────────────────────────────────────────────────── */

export const NACHWEIS_ARTEN = [
  "arbeitsprobe",
  "repository",
  "portfolio",
  "live-produkt",
  "aufzeichnung",
  "gespraech",
] as const
export type NachweisArt = (typeof NACHWEIS_ARTEN)[number]

/* ── Die Rolle ───────────────────────────────────────────────────────────── */

export type RolleDefinition = {
  id: TalentSpur
  spur: TalentSpur
  zustand: RollenZustand
  /** Der Pfad unter /karriere. Deutsch ist kanonisch — siehe `lib/routes.ts`. */
  pfad: string
  titel: Localized
  /** Ein Satz, der die Rolle von ihrem naechsten Nachbarn unterscheidet. */
  unterschied: Localized
  /*
   * KEIN `ort`.
   *
   * Die erste Fassung erklaerte beide Rollen ueber einen Standort — welche
   * Stadt, welcher Markt, welche Haelfte des Betriebs. Der Owner hat das
   * zurueckgewiesen, und zu Recht: Er sucht Menschen, nicht einen Standort.
   * Wo jemand spaeter sitzt, ist eine Folge der Einstellung und nicht ihr
   * Grund; solange keine Stelle offen ist, ist es ausserdem eine Behauptung.
   *
   * Geblieben ist das Arbeitsmodell — es beschreibt, WIE gearbeitet wird,
   * und das gilt unabhaengig davon, wo jemand wohnt.
   */
  arbeitsmodell: Localized
  sprachen: Sprachanforderung[]
  /** Nur bei „Produkt & Systeme“ gefuellt — der Weg buendelt mehrere Handwerke. */
  disziplinen: Localized[]
  nachweise: NachweisArt[]
}

/* ── Die kuenftige Grenze, nur als Form ──────────────────────────────────── */

/*
 * Mensch, Bewerbung, Nachweis, Beurteilung und Entscheidung sind fuenf
 * verschiedene Dinge. Ein Mensch kann sich zweimal bewerben; eine Bewerbung
 * traegt mehrere Nachweise; eine Beurteilung liest Nachweise; eine
 * Entscheidung trifft ein Mensch.
 *
 * Hier steht nur die Bewerbung, weil nur sie das Formular braucht. Die
 * uebrigen vier bekommen KEINE Tabelle und KEINEN Typ, solange es sie nicht
 * gibt — ein leeres Datenmodell ist kein Fundament, sondern eine Behauptung.
 */
export type Bewerbung = {
  absicht: Bewerbungsabsicht
  /** Bei „Produkt & Systeme“: welche Handwerke. Sonst leer. */
  disziplinen: string[]
  name: string
  email: string
  ort: string
  /** Links auf Gebautes. Mindestens einer — siehe `bewerbungTraegt`. */
  nachweise: string[]
  warumCreadig: string
  gebaut: string
  /** Freiwillig. Wer nichts angibt, wird deswegen nicht schlechter gelesen. */
  verfuegbarAb: string
  sprachen: string
}

/* ══════════════════════════════════════════════════════════════════════════
 * DIE ROLLEN — WAS HEUTE WAHR IST
 * ══════════════════════════════════════════════════════════════════════════
 *
 * BEIDE STEHEN AUF `talent-pool`.
 *
 * Es gibt heute keine freigegebene Stelle: kein Startdatum, kein Budget,
 * keine Zusage. Wer daraus „offen" macht, luegt den Leser an — und zwar den,
 * der uns am wichtigsten waere, weil er als Einziger seine Zeit investiert.
 *
 * Auch die Reihenfolge der Einstellungen steht nicht fest. Ob zuerst jemand
 * kommt, der Nachfrage findet, oder jemand, der liefert, haengt daran, wo
 * der Engpass wirklich liegt — und das entscheidet sich am Auftragsbuch,
 * nicht auf einer Karriereseite.
 */
export const ROLLEN: readonly RolleDefinition[] = [
  {
    id: "dach-business-development",
    spur: "dach-business-development",
    zustand: "talent-pool",
    pfad: "/karriere/dach-business-development",
    titel: {
      de: "DACH Business Development",
      tr: "DACH İş Geliştirme",
      en: "DACH Business Development",
      ar: "تطوير الأعمال في منطقة DACH",
    },
    unterschied: {
      de: "Sieht einem Betrieb an, wo er hakt — und prüft es, statt es zu behaupten.",
      tr: "Bir işletmeye bakıp nerede takıldığını görür — ve bunu iddia etmek yerine doğrular.",
      en: "Sees where a business is stuck — and verifies it instead of claiming it.",
      ar: "يرى أين تتعثّر المنشأة — ويتحقّق من ذلك بدل أن يدّعيه.",
    },
    arbeitsmodell: {
      de: "Remote-first, mit geplanten gemeinsamen Tagen",
      tr: "Önce uzaktan, planlı ortak günlerle",
      en: "Remote-first, with planned days together",
      ar: "العمل عن بُعد أولًا، مع أيام مشتركة مخطّطة",
    },
    sprachen: [
      {
        sprache: { de: "Deutsch", tr: "Almanca", en: "German", ar: "الألمانية" },
        niveau: "kern",
        wofuer: {
          de: "Ein Gespräch mit einer Inhaberin führen, nachfragen, einen Befund schriftlich festhalten.",
          tr: "Bir işletme sahibiyle görüşme yürütmek, soru sormak, bulguyu yazıya dökmek.",
          en: "Hold a conversation with an owner, ask follow-up questions, write the finding down.",
          ar: "إجراء حديث مع صاحب منشأة، وطرح أسئلة المتابعة، وتدوين النتيجة.",
        },
      },
      {
        sprache: { de: "Türkisch", tr: "Türkçe", en: "Turkish", ar: "التركية" },
        niveau: "hilfreich",
        wofuer: {
          de: "Die tägliche Arbeit im Team.",
          tr: "Ekipteki günlük çalışma.",
          en: "The daily work inside the team.",
          ar: "العمل اليومي داخل الفريق.",
        },
      },
      {
        sprache: { de: "Englisch", tr: "İngilizce", en: "English", ar: "الإنجليزية" },
        niveau: "nuetzlich",
        wofuer: {
          de: "Werkzeuge, Dokumentation, Recherche.",
          tr: "Araçlar, dokümantasyon, araştırma.",
          en: "Tools, documentation, research.",
          ar: "الأدوات والتوثيق والبحث.",
        },
      },
    ],
    disziplinen: [],
    nachweise: ["gespraech", "aufzeichnung"],
  },
  {
    id: "founding-talent",
    spur: "founding-talent",
    zustand: "talent-pool",
    pfad: "/karriere/founding-talent",
    /*
     * HIESS „FOUNDING TALENT“ — UND WURDE UMBENANNT.
     *
     * Der Name trug zwei Versprechen, die creaDIG nicht halten kann: Er
     * klingt nach Gruenderrolle mit Anteilen, und er hing an einem
     * Gruendungsereignis, das es so nicht gibt. Ein Bewerber musste erst
     * einen Absatz lesen, um zu verstehen, dass beides nicht gemeint ist —
     * ein Name, der erklaert werden muss, ist keiner.
     *
     * „Produkt & Systeme“ sagt in zwei Woertern, worum es geht, benutzt die
     * Sprache, die das Haus ohnehin spricht (System-Haus), und verspricht
     * nichts.
     */
    titel: {
      de: "Produkt & Systeme",
      tr: "Ürün & Sistemler",
      en: "Product & Systems",
      ar: "المنتج والأنظمة",
    },
    unterschied: {
      de: "Baut das System — und übernimmt die Verantwortung dafür, dass es im Betrieb hält.",
      tr: "Sistemi kurar — ve işleyişte ayakta kalmasının sorumluluğunu üstlenir.",
      en: "Builds the system — and owns the fact that it has to hold in daily operation.",
      ar: "يبني النظام — ويتحمّل مسؤولية صموده في التشغيل اليومي.",
    },
    arbeitsmodell: {
      de: "Remote-first, mit geplanten gemeinsamen Tagen",
      tr: "Önce uzaktan, planlı ortak günlerle",
      en: "Remote-first, with planned days together",
      ar: "العمل عن بُعد أولًا، مع أيام مشتركة مخطّطة",
    },
    sprachen: [
      {
        sprache: { de: "Türkisch", tr: "Türkçe", en: "Turkish", ar: "التركية" },
        niveau: "kern",
        wofuer: {
          de: "Die tägliche Arbeit im Team.",
          tr: "Ekipteki günlük çalışma.",
          en: "The daily work inside the team.",
          ar: "العمل اليومي داخل الفريق.",
        },
      },
      {
        sprache: { de: "Englisch", tr: "İngilizce", en: "English", ar: "الإنجليزية" },
        niveau: "kern",
        wofuer: {
          de: "Quelltext, Dokumentation, Werkzeuge, Fachliteratur.",
          tr: "Kaynak kod, dokümantasyon, araçlar, teknik literatür.",
          en: "Source code, documentation, tooling, technical reading.",
          ar: "الشيفرة والتوثيق والأدوات والقراءة التقنية.",
        },
      },
      {
        sprache: { de: "Deutsch", tr: "Almanca", en: "German", ar: "الألمانية" },
        niveau: "nuetzlich",
        wofuer: {
          de: "Kein Muss. Wer es kann, versteht die Kundenseite früher.",
          tr: "Şart değil. Bilen, müşteri tarafını daha erken anlar.",
          en: "Not required. Those who have it understand the client side sooner.",
          ar: "ليست شرطًا. من يتقنها يفهم جانب العميل أبكر.",
        },
      },
    ],
    disziplinen: [
      { de: "Produkt", tr: "Ürün", en: "Product", ar: "المنتج" },
      { de: "Engineering", tr: "Engineering", en: "Engineering", ar: "الهندسة" },
      { de: "Design", tr: "Tasarım", en: "Design", ar: "التصميم" },
      { de: "Automation", tr: "Otomasyon", en: "Automation", ar: "الأتمتة" },
      { de: "KI", tr: "Yapay zekâ", en: "AI", ar: "الذكاء الاصطناعي" },
    ],
    nachweise: ["repository", "portfolio", "live-produkt", "arbeitsprobe"],
  },
]

export function rolleFuer(spur: TalentSpur): RolleDefinition {
  const gefunden = ROLLEN.find((r) => r.id === spur)
  if (!gefunden) throw new Error(`Keine Rolle fuer die Spur „${spur}".`)
  return gefunden
}

/* ── Was ein Zustand bedeutet und erlaubt ────────────────────────────────── */

export type ZustandsText = {
  /** Das Etikett am Status-Baustein. */
  label: Localized
  /** Ein Satz, der die Erwartung setzt, bevor jemand Zeit investiert. */
  bedeutet: Localized
  /** Die Handlungsaufforderung. Leitet sich AUS dem Zustand ab. */
  cta: Localized
}

export const ZUSTANDS_TEXTE: Record<RollenZustand, ZustandsText> = {
  "talent-pool": {
    label: {
      de: "Talent Pool",
      tr: "Yetenek havuzu",
      en: "Talent pool",
      ar: "مجموعة المواهب",
    },
    bedeutet: {
      /*
       * KEIN JAHR MEHR.
       *
       * Hier stand „mit denen wir 2027 anfangen wollen“. Das klang nach
       * einem Termin, den es nicht gibt: Wann eine Stelle entsteht, haengt
       * am Auftragsbuch und nicht am Kalender. Eine Jahreszahl in der
       * Handlungsaufforderung ist eine Zusage in Zahlenform.
       */
      de: "Keine ausgeschriebene Stelle. Wir lernen Menschen kennen, bevor wir sie brauchen — mit Gespräch, ohne Zusage.",
      tr: "İlan edilmiş pozisyon yok. İnsanları ihtiyaç duymadan önce tanıyoruz — görüşme var, taahhüt yok.",
      en: "No advertised position. We get to know people before we need them — a conversation, not a commitment.",
      ar: "لا وظيفة معلنة. نتعرّف على الأشخاص قبل أن نحتاجهم — حديث، لا التزام.",
    },
    cta: {
      de: "Sich vorstellen",
      tr: "Kendini tanıt",
      en: "Introduce yourself",
      ar: "عرِّف بنفسك",
    },
  },
  geplant: {
    label: { de: "Geplant", tr: "Planlanıyor", en: "Planned", ar: "مخطَّط" },
    bedeutet: {
      de: "Die Rolle steht in der Planung. Start, Budget und Freigabe stehen noch nicht fest.",
      tr: "Rol planlamada. Başlangıç, bütçe ve onay henüz kesin değil.",
      en: "The role is in planning. Start, budget and approval are not locked.",
      ar: "الدور ضمن التخطيط. البدء والميزانية والموافقة غير محسومة بعد.",
    },
    cta: {
      de: "Interesse vormerken",
      tr: "İlgini bildir",
      en: "Register your interest",
      ar: "سجّل اهتمامك",
    },
  },
  offen: {
    label: { de: "Offen", tr: "Açık", en: "Open", ar: "مفتوحة" },
    bedeutet: {
      de: "Die Stelle ist freigegeben und wird besetzt.",
      tr: "Pozisyon onaylandı ve doldurulacak.",
      en: "The position is approved and actively being filled.",
      ar: "الوظيفة معتمدة ويجري شغلها.",
    },
    cta: { de: "Jetzt bewerben", tr: "Şimdi başvur", en: "Apply now", ar: "قدّم الآن" },
  },
}

/**
 * Gibt es heute ueberhaupt eine freigegebene Stelle?
 *
 * Wird von der Seite und vom Gate gelesen. Solange das `false` ist, darf
 * nirgends „Jetzt bewerben" stehen und es darf KEINE `JobPosting`-Auszeichnung
 * ausgeliefert werden: Ein Talent Pool ist keine Stelle, und Google als
 * Stellenanzeige zu melden, was keine ist, ist dieselbe Luege — nur an eine
 * Maschine gerichtet.
 */
export const gibtOffeneStelle = ROLLEN.some((r) => r.zustand === "offen")

/* ── Bewerbung: was das Formular verlangt ────────────────────────────────── */

/**
 * IST DIE ANNAHME SCHARF?
 *
 * Heute nein. Es gibt keinen Speicher fuer Bewerbungen — und der Vertriebs-
 * Datenbestand ist ausdruecklich keiner: Ein Mensch, der sich bewirbt, ist
 * kein Lead und gehoert nicht in `contacts`, `leads` oder `opportunities`.
 * Wer Bewerbungen dorthin schreibt, verdirbt beide Wahrheiten auf einmal.
 *
 * Solange das `false` ist, zeigt das Formular am Ende KEINE Bestaetigung,
 * sondern den Weg, der heute wirklich funktioniert. Kein Ladebalken ohne
 * Empfaenger, keine erfundene Vorgangsnummer, keine Bestaetigungs-E-Mail,
 * die niemand verschickt.
 */
export const bewerbungAnnahmeAktiv = false

/** Pflichtfelder — bewusst wenige. Was fehlt, steht in `karriere-inhalt.ts`. */
export function bewerbungFehlt(b: Partial<Bewerbung>): (keyof Bewerbung)[] {
  const fehlt: (keyof Bewerbung)[] = []
  if (!b.absicht) fehlt.push("absicht")
  if (!b.name?.trim()) fehlt.push("name")
  if (!b.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(b.email)) fehlt.push("email")
  /*
   * Mindestens ein Nachweis. Das ist die einzige inhaltliche Huerde des
   * Formulars und der Grund, warum es sie gibt: creaDIG liest, was jemand
   * gebaut hat — nicht, wo er studiert hat. Ein Lebenslauf wird nicht
   * verlangt.
   */
  if (!(b.nachweise ?? []).some((n) => n.trim().length > 0)) fehlt.push("nachweise")
  if (!b.warumCreadig?.trim()) fehlt.push("warumCreadig")
  return fehlt
}
