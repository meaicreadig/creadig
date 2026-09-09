/**
 * G24 · PRODUKTWAHRHEIT & RUECKMELDUNG — ein Portfolio, das gefuehrt wird.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DER GATE-VERTRAG
 *
 *     „Heute: fibero, meAI, CASSAMEA, meahv haben Regionen, aber KEINEN
 *      GEFUEHRTEN REIFEGRAD. Ziel: Portfolio mit Stand, Eigentuemer,
 *      Rueckmeldeweg."
 *
 * Drei Dinge, und alle drei fehlten. Gemessen am 09.09.2026:
 *
 *   Stand         `ProductWorld.maturity` existiert als Feld — und steht bei
 *                 allen vier auf `null`.
 *   Eigentuemer   gibt es nicht. Kein Feld, keine Angabe.
 *   Rueckmeldeweg gibt es nicht. Wer fibero im Tagesbetrieb benutzt und
 *                 etwas findet, hat keinen Weg ausser dem allgemeinen
 *                 Kontaktformular — das nach einem PROJEKT fragt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIESE DATEI DEN REIFEGRAD NICHT AUSFUELLT
 *
 * Im Kommentar an `ProductMaturity` steht der Grund, und er stimmt weiter:
 *
 *     „Diese Stufe kann man nicht ausrechnen. Sie weiss genau eine Person."
 *
 * Das Gate verlangt aber auch nichts anderes. Es verlangt einen GEFUEHRTEN
 * Reifegrad — und gefuehrt heisst: Es steht dabei, WER ihn bestaetigt hat,
 * WANN, und WORAN man ihn sieht. Genau das fehlte.
 *
 * Ein Reifegrad ohne diese drei ist keine Angabe, sondern eine Erinnerung.
 * Und er ALTERT: „Im Aufbau", vor acht Monaten bestaetigt, sagt heute nichts
 * — nur sieht man dem Wort das Alter nicht an.
 *
 * Dieselbe Bauart wie ueberall in diesem Haus: die Freigabe (G13), das Ja
 * (G17), die Abnahme (G19) — Person, Zeitpunkt, Fundstelle. Ein Feld, das
 * man einfach setzen kann, wird einfach gesetzt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * UND WARUM SIE DEN ABGELEITETEN STATUS NICHT ERSETZT
 *
 * `productStatus()` rechnet seit V2-4b aus `live` und `href` einen groben
 * Zustand. Der Kommentar dort warnt ausdruecklich vor einem zweiten Feld
 * daneben: „‚Im Aufbau‘ im Text, ‚LIVE‘ im Badge, und niemand merkt es, weil
 * beides nie nebeneinander gelesen wird."
 *
 * Diese Warnung wird hier nicht ignoriert, sondern DURCHGESETZT:
 * `widerspruch()` haelt den erklaerten Stand gegen den abgeleiteten, und das
 * Gate bricht ab, wenn beide auseinanderfallen. Ein Register einzufuehren,
 * ohne diese Pruefung mitzubauen, waere genau der Fehler gewesen, vor dem
 * der alte Kommentar warnt.
 */

import { productStatus, productWorks, type ProductMaturity, type Work } from "@/lib/site-data"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DIE STUFEN
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Was jede Stufe behauptet — und was sie ausdruecklich NICHT behauptet.
 *
 * Der zweite Teil ist der wichtigere. `PROOF_KINDS` in Gate 13 fuehrt ihn
 * als `belegtNicht`, und aus demselben Grund: Eine Stufe, die nur sagt, was
 * sie bedeutet, wird beim Lesen groesser gemacht, als sie ist.
 */
export const REIFEGRADE: Record<ProductMaturity, { label: string; heisst: string; heisstNicht: string }> = {
  "in-development": {
    label: "In Entwicklung",
    heisst: "Es wird gebaut. Niemand ausserhalb des Hauses arbeitet damit.",
    heisstNicht: "Dass es bald fertig ist — ein Datum steht hier nicht.",
  },
  "private-beta": {
    label: "Geschlossene Testphase",
    heisst: "Echte Nutzer ausserhalb des Hauses, eingeladen, in begrenzter Zahl.",
    heisstNicht: "Dass man es kaufen kann. Das entscheidet G25.",
  },
  pilot: {
    label: "Pilot",
    heisst: "Ein Betrieb setzt es im Alltag ein, mit uns daneben.",
    heisstNicht: "Dass es ohne uns laeuft.",
  },
  live: {
    label: "Live",
    heisst: "Im Betrieb, ohne dass jemand danebensteht.",
    heisstNicht: "Dass es fertig ist. Kein Produkt ist fertig.",
  },
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DER STAND — eine Aussage mit Herkunft
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Stand = {
  stufe: ProductMaturity
  /** Wer es bestaetigt hat. Ein Mensch, keine Rolle im Allgemeinen. */
  bestaetigtVon: string
  /** Wann — ISO-Tag. */
  bestaetigtAm: string
  /**
   * WORAN man es sieht. Der beobachtbare Umstand, nicht die Absicht:
   * „laeuft seit Maerz im Glasfaser-Alltag, zwei Monteure, taeglich" —
   * nicht „ist reif".
   */
  woran: string
}

/**
 * Wie lange ein bestaetigter Stand traegt.
 *
 * Sechs Monate, und die Zahl ist begruendbar: Kuerzer waere Buerokratie fuer
 * ein Haus mit vier Produkten; laenger deckt einen ganzen Umbau ab, ohne
 * dass jemand hinsieht. Der Punkt ist nicht die Zahl, sondern dass es
 * ueberhaupt eine gibt — ein Stand, der nie verfaellt, ist eine Behauptung
 * mit Datum darauf.
 */
export const STAND_HAELT_MONATE = 6

export function standTraegt(s: Stand | null | undefined): boolean {
  if (!s) return false
  if (!REIFEGRADE[s.stufe]) return false
  if (!s.bestaetigtVon?.trim()) return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.bestaetigtAm ?? "")) return false
  /* „reif" ist kein Woran. Gesucht ist ein beobachtbarer Umstand. */
  return (s.woran?.trim().length ?? 0) >= 15
}

/** Ist dieser Stand zu alt, um heute noch etwas zu sagen? */
export function veraltet(s: Stand | null | undefined, heute = new Date()): boolean {
  if (!standTraegt(s)) return false
  const d = new Date(`${s!.bestaetigtAm}T00:00:00Z`)
  const grenze = new Date(d)
  grenze.setUTCMonth(grenze.getUTCMonth() + STAND_HAELT_MONATE)
  return heute > grenze
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DER RUECKMELDEWEG
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Wohin jemand geht, der mit dem Produkt ARBEITET und etwas findet.
 *
 * Nicht dasselbe wie das Kontaktformular: Das fragt nach einem Projekt. Wer
 * fibero morgens im Auto benutzt und einen Fehler sieht, hat eine andere
 * Frage — und heute keinen Weg dafuer.
 *
 * `fuer` trennt Stoerung von Wunsch, weil die beiden verschieden dringend
 * sind. Ein Weg, der beides in denselben Eingang kippt, behandelt sie auch
 * gleich — und dann wartet die Stoerung hinter dem Wunsch.
 */
export const RUECKMELDE_ARTEN = ["person", "postfach", "im-produkt"] as const
export type RueckmeldeArt = (typeof RUECKMELDE_ARTEN)[number]

export type Rueckmeldeweg = {
  art: RueckmeldeArt
  /** Die Adresse: ein Name, ein Postfach, eine Stelle im Produkt. */
  an: string
  fuer: "stoerung" | "wunsch" | "beides"
}

export function wegTraegt(w: Rueckmeldeweg | null | undefined): boolean {
  if (!w) return false
  if (!(RUECKMELDE_ARTEN as readonly string[]).includes(w.art)) return false
  return (w.an?.trim().length ?? 0) >= 5
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · DAS PORTFOLIO
 * ═══════════════════════════════════════════════════════════════════════════ */

export type PortfolioEintrag = {
  slug: string
  /**
   * WER FUER DAS PRODUKT ANTWORTET.
   *
   * Heute steht bei allen vier dieselbe Person, und das ist keine
   * Nachlaessigkeit dieser Datei — es ist der Zustand des Hauses („heute ein
   * Mensch, ein Passwort", G32). Er steht hier ausdruecklich, weil G33 den
   * Beweis verlangt, dass das Unternehmen ohne den Owner laeuft, und dieser
   * Beweis faengt damit an, den Ist-Zustand hinzuschreiben.
   */
  eigentuemer: string
  /** `null` heisst: Niemand hat den Reifegrad bestaetigt. Kein Etikett ohne Beleg. */
  stand: Stand | null
  rueckmeldung: Rueckmeldeweg | null
}

/*
 * DER BESTAND, WIE ER IST.
 *
 * `stand` steht bei allen vier auf `null`, und das ist die WAHRE Angabe:
 * `ProductWorld.maturity` war bisher ueberall null, und niemand hat je
 * bestaetigt, welche Stufe gilt. Ein Wert hier waere aus `outcome`
 * abgeschrieben — und `outcome` ist ein Satz fuer die Seite, keine
 * Bestaetigung mit Datum.
 *
 * `eigentuemer` und `rueckmeldung` sind dagegen KEINE Vermutung: Wer
 * antwortet und wohin man sich meldet, steht heute fest — es stand nur
 * nirgends.
 */
export const PORTFOLIO: readonly PortfolioEintrag[] = [
  {
    slug: "fibero",
    eigentuemer: "Owner",
    stand: null,
    rueckmeldung: {
      art: "person",
      an: "Owner, direkt — fibero laeuft im eigenen Glasfaser-Alltag",
      fuer: "beides",
    },
  },
  {
    slug: "meai",
    eigentuemer: "Owner",
    stand: null,
    rueckmeldung: { art: "postfach", an: "info@creadig.de, Betreff meAI", fuer: "beides" },
  },
  {
    slug: "cassamea",
    eigentuemer: "Owner",
    stand: null,
    rueckmeldung: { art: "postfach", an: "info@creadig.de, Betreff CASSAMEA", fuer: "beides" },
  },
  {
    slug: "meahv",
    eigentuemer: "Owner",
    stand: null,
    rueckmeldung: { art: "postfach", an: "info@creadig.de, Betreff meahv", fuer: "beides" },
  },
]

export function eintragZu(slug: string): PortfolioEintrag | null {
  return PORTFOLIO.find((e) => e.slug === slug) ?? null
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 5 · DER WIDERSPRUCH — die Pruefung, ohne die dieses Register gefaehrlich waere
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Was der bestaetigte Stand mindestens verlangt, um zum abgeleiteten Status
 * zu passen.
 *
 * `productStatus()` kennt drei Zustaende: `live` (live + oeffentliche
 * Adresse), `intern` (live ohne Adresse), `aufbau` (nicht live).
 *
 * Die Regel ist absichtlich nur in EINE Richtung streng: Ein Produkt, das
 * nicht live ist, darf sich nicht „live" nennen. Umgekehrt ist ein live
 * geschaltetes Produkt, dessen Stand „Pilot" sagt, kein Widerspruch — es
 * kann oeffentlich erreichbar und trotzdem ein Pilot sein.
 */
export function widerspruch(work: Work, eintrag: PortfolioEintrag): string | null {
  const stand = eintrag.stand
  if (!standTraegt(stand)) return null
  const abgeleitet = productStatus(work)
  if (stand!.stufe === "live" && abgeleitet === "aufbau") {
    return (
      `${work.name}: Der bestaetigte Stand sagt „live", die Daten sagen „im Aufbau" ` +
      `(live=${String(work.live)}). Zwei Wahrheiten ueber dasselbe Produkt — und die, ` +
      `die niemand nachliest, gewinnt.`
    )
  }
  if (stand!.stufe === "in-development" && abgeleitet === "live") {
    return (
      `${work.name}: Der bestaetigte Stand sagt „in Entwicklung", das Produkt ist aber ` +
      `oeffentlich erreichbar (${work.href}). Wer es aufruft, liest etwas anderes als die Seite.`
    )
  }
  return null
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 6 · WAS EINEM EINTRAG FEHLT
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Luecke = { produkt: string; feld: string; satz: string }

/**
 * Die Luecken eines Eintrags.
 *
 * Ein fehlender STAND ist ausdruecklich ein Owner-Punkt und kein Fehler des
 * Systems — er steht als Luecke da, damit man ihn sieht, und bricht nichts.
 * Ein fehlender RUECKMELDEWEG dagegen ist ein Systemmangel: Wer ein Produkt
 * betreibt, schuldet einen Weg dafuer.
 */
export function luecken(eintrag: PortfolioEintrag, work: Work, heute = new Date()): Luecke[] {
  const l: Luecke[] = []

  if (!eintrag.eigentuemer?.trim()) {
    l.push({
      produkt: work.name,
      feld: "Eigentuemer",
      satz: "Niemand antwortet fuer dieses Produkt. Ein Portfolio ohne Eigentuemer ist eine Liste.",
    })
  }

  if (!eintrag.stand) {
    l.push({
      produkt: work.name,
      feld: "Stand",
      satz:
        "Kein bestaetigter Reifegrad. Die Stufe kann man nicht ausrechnen — sie weiss genau " +
        "eine Person, und solange sie es nicht sagt, steht hier nichts.",
    })
  } else if (!standTraegt(eintrag.stand)) {
    l.push({
      produkt: work.name,
      feld: "Stand",
      satz:
        "Der Reifegrad steht ohne Wer, Wann oder Woran da. Ein Stand ohne diese drei ist " +
        "keine Angabe, sondern eine Erinnerung.",
    })
  } else if (veraltet(eintrag.stand, heute)) {
    l.push({
      produkt: work.name,
      feld: "Stand",
      satz:
        `Zuletzt bestaetigt am ${eintrag.stand.bestaetigtAm} — laenger als ${STAND_HAELT_MONATE} Monate her. ` +
        "Ein Stand, den niemand nachbestaetigt, altert unsichtbar.",
    })
  }

  if (!wegTraegt(eintrag.rueckmeldung)) {
    l.push({
      produkt: work.name,
      feld: "Rueckmeldeweg",
      satz:
        "Kein Weg fuer jemanden, der mit dem Produkt arbeitet und etwas findet. Das " +
        "Kontaktformular fragt nach einem Projekt — das ist eine andere Frage.",
    })
  }

  return l
}

/** Alle Luecken des Portfolios, gegen die echten Werke gehalten. */
export function portfolioLuecken(heute = new Date()): Luecke[] {
  const l: Luecke[] = []
  for (const eintrag of PORTFOLIO) {
    const work = productWorks.find((w) => w.slug === eintrag.slug)
    if (!work) {
      l.push({
        produkt: eintrag.slug,
        feld: "Produkt",
        satz: "Das Portfolio fuehrt ein Produkt, das es in `productWorks` nicht gibt.",
      })
      continue
    }
    l.push(...luecken(eintrag, work, heute))
  }
  return l
}

/** Produkte ohne Portfolio-Eintrag — die stille Luecke in die andere Richtung. */
export function ohneEintrag(): Work[] {
  return productWorks.filter((w) => !PORTFOLIO.some((e) => e.slug === w.slug))
}
