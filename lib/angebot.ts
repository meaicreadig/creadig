/**
 * G17 · ANGEBOT & ABSCHLUSS — aus Angebotsreife wird ein Angebot und ein Ja.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS ES SCHON GAB
 *
 * `lib/offer-readiness.ts` (G07/G08) beantwortet, WANN eine Zahl genannt
 * werden darf. `docs/sales/proposal-outline.md` beschreibt auf 112 Zeilen,
 * WAS in einem Angebot steht — neun Abschnitte, vier formale Regeln, und
 * einen Satz, der ueber allem steht:
 *
 *     „Jede Zahl im Angebot steht in `docs/sales/offers.md` oder ist vom
 *      Owner freigegeben. Keine ca.-Zahl, kein Korridor, kein Platzhalter,
 *      der nachher zur Zahl wird."
 *
 * Das Schema ist gut. Es band nur nichts: Es ist ein Dokument, und ein
 * Angebot entstand — wenn ueberhaupt — in einem Textprogramm daneben. Was
 * dort steht, hat nie jemand gegen dieses Schema gehalten.
 *
 * Und der Vertrag von G17 nennt dazu den Zustand: „`offer_kind` + Belege,
 * aber kein Angebotsdokument, kein Vertrag."
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE ZWEI SAETZE, DIE DIESES GATE TRAEGT
 *
 * 1 · EINE ZAHL KANN MAN HIER NICHT TIPPEN.
 *
 *     Eine Position verweist auf den Katalog (`packages`, `retainer`) und
 *     der Betrag wird AUFGELOEST. Wer einen eigenen Betrag braucht — beim
 *     Systemprojekt ist das der Normalfall —, muss die Freigabe des Owners
 *     danebenschreiben: wer, wann, worauf. Ohne sie ist es keine Position.
 *
 *     Der Unterschied zu einem Freitextfeld mit guter Absicht ist derselbe
 *     wie bei `approved: true` (G13) und `published: true` (G15): Ein Feld,
 *     das man ausfuellen kann, wird ausgefuellt.
 *
 * 2 · EIN JA IST EINE AUSSAGE UEBER EINEN MENSCHEN.
 *
 *     `status = "won"` gibt es in der Pipeline seit jeher — ein Haken ohne
 *     Wer, Wann und Worueber. Ein Angebot gilt hier erst als angenommen,
 *     wenn dieselben vier Angaben dastehen, die Gate 13 fuer eine Freigabe
 *     verlangt: Person, Form, Datum, Fundstelle. Ein Ja am Telefon ist ein
 *     Ja — aber dann steht das da, mit dem Datum und dem Namen dessen, der
 *     es gesagt hat.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER AUSDRUECKLICH NICHT ENTSTEHT
 *
 * Ein Vertragstext oder AGB-Entwurf. Das steht so im Schema („Rechtsberatung
 * ist nichts, was hier entsteht — Grundregel 1"), und es gilt hier weiter:
 * Diese Datei erzeugt kein Recht. Sie prueft, ob ein Angebot dem eigenen
 * Schema folgt.
 *
 * Ebenso wenig ein PDF-Erzeuger oder ein Kundenportal — das ist MP-F mit
 * eigenem Build-Gate.
 */

import { formatPrice, packages, retainer } from "@/lib/site-data"
import { OFFERS, readinessFor, type OfferKind } from "@/lib/offer-readiness"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DIE NEUN ABSCHNITTE
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Abschnitt = {
  key: string
  nummer: string
  titel: string
  /** Der Satz, der diesen Abschnitt entscheidet — aus dem Schema. */
  regel: string
  /**
   * Ohne ihn ist es kein Angebot. `false` nur, wo das Schema selbst einen
   * Fall kennt, in dem der Abschnitt entfaellt.
   */
  pflicht: boolean
}

export const ABSCHNITTE: readonly Abschnitt[] = [
  {
    key: "ausgangslage",
    nummer: "01",
    titel: "Ausgangslage — in den Worten des Kunden",
    regel:
      "Wuerde der Kunde diesen Absatz unterschreiben, ohne etwas zu korrigieren? " +
      "Wenn nein, war das Gespraech zu kurz.",
    pflicht: true,
  },
  {
    key: "verstanden",
    nummer: "02",
    titel: "Was wir daraus verstanden haben",
    regel: "Wo bricht es, und warum kostet das. Keine Schuldzuweisung.",
    pflicht: true,
  },
  {
    key: "umfang",
    nummer: "03",
    titel: "Was wir bauen",
    regel:
      "Bausteine, und die Abgrenzung gehoert HIERHIN, nicht in die Fussnote. " +
      "Ein Angebot ohne sie erzeugt die Nachforderung, die es vermeiden sollte.",
    pflicht: true,
  },
  {
    key: "architektur",
    nummer: "04",
    titel: "Architektur",
    regel: "So viel, wie oeffentlich sein darf, so wenig wie noetig. Kein Tech-Stack als Imponierliste.",
    /*
     * Der einzige Abschnitt, den das Schema selbst relativiert („ein Bild,
     * wenn es hilft"). Bei einem Festpreis-Paket gibt es keine Architektur
     * zu zeichnen — sie waere Fuellmaterial.
     */
    pflicht: false,
  },
  {
    key: "zeit",
    nummer: "05",
    titel: "Zeit",
    regel:
      "Abschnitte mit Zwischenstaenden, nicht ein Datum am Ende. Und was der Kunde " +
      "liefern muss — ein Angebot, das die Mitwirkung nicht benennt, verschiebt spaeter die Schuld.",
    pflicht: true,
  },
  {
    key: "preis",
    nummer: "06",
    titel: "Preis",
    regel: "Eine Zahl, netto, mit Zahlungsschritten. Einmalig und laufend werden nie addiert dargestellt.",
    pflicht: true,
  },
  {
    key: "betrieb",
    nummer: "07",
    titel: "Betrieb danach",
    regel:
      "Der Absatz, der creaDIG von einer Agentur unterscheidet — er fehlt in KEINEM Angebot, " +
      "auch nicht in einem, das nur einen Auftritt enthaelt.",
    pflicht: true,
  },
  {
    key: "nicht-versprochen",
    nummer: "08",
    titel: "Was wir nicht versprechen",
    regel: "Ein Angebot, das nichts ausschliesst, hat alles versprochen.",
    pflicht: true,
  },
  {
    key: "naechster-schritt",
    nummer: "09",
    titel: "Naechster Schritt",
    regel: "Genau einer. Mit Datum.",
    pflicht: true,
  },
] as const

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE POSITIONEN — eine Zahl kann man hier nicht tippen
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Was der Katalog hergibt. Mehr Quellen gibt es nicht. */
export const KATALOG = {
  "paket-website": () => packages.find((p) => p.key === "website")?.amount ?? null,
  "paket-website-regulaer": () => packages.find((p) => p.key === "website")?.regularAmount ?? null,
  "paket-pruefung": () => packages.find((p) => p.key === "audit")?.amount ?? null,
  "betrieb-monatlich": () => retainer.amount,
} as const

export type KatalogKey = keyof typeof KATALOG

/**
 * Wie eine Katalogposition im Angebot heisst.
 *
 * Getrennt vom Katalog selbst, weil der Katalog BETRAEGE aufloest und diese
 * Tabelle BENENNT. Zusammengelegt haette der Aufrufer eine Funktion, die je
 * nach Feld etwas anderes tut.
 */
export const KATALOG_LABEL: Record<KatalogKey, string> = {
  "paket-website": "Website-Paket",
  "paket-website-regulaer": "Website-Paket (Regelpreis)",
  "paket-pruefung": "Barrierefreiheits-Pruefung",
  "betrieb-monatlich": "Betrieb, monatlich",
}

/**
 * Eine Owner-Freigabe fuer einen Betrag, den der Katalog nicht kennt.
 *
 * Dieselben vier Angaben wie bei einer Kundenfreigabe in Gate 13, und aus
 * demselben Grund: Ein „der Owner hat zugestimmt" ohne Wer, Wann und Worauf
 * ist ein Haken, den sich jeder selbst setzen kann.
 */
export type Betragsfreigabe = {
  von: string
  am: string
  /** Wo die Zustimmung liegt — Postfach, Notiz, Gespraechsprotokoll. */
  fundstelle: string
}

export type Position =
  | { art: "katalog"; was: string; quelle: KatalogKey; wiederkehrend?: boolean }
  | {
      art: "zuschnitt"
      was: string
      betrag: number
      wiederkehrend?: boolean
      freigabe: Betragsfreigabe
    }

/** Der Betrag einer Position — aufgeloest, nie getippt. */
export function betragVon(p: Position): number | null {
  return p.art === "katalog" ? KATALOG[p.quelle]?.() ?? null : p.betrag
}

export function betragText(p: Position): string | null {
  const b = betragVon(p)
  return b === null ? null : formatPrice(b, "de")
}

/** Traegt eine Freigabe genug, um eine Zahl zu rechtfertigen? */
export function freigabeTraegt(f: Betragsfreigabe | undefined): boolean {
  if (!f) return false
  if (!f.von?.trim() || !f.am?.trim()) return false
  const fundstelle = f.fundstelle?.trim() ?? ""
  if (fundstelle.length < 8) return false
  return !/^(intern|muendlich|bekannt|siehe oben)$/i.test(fundstelle)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DAS JA
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Wie eine Annahme zustande kam.
 *
 * `muendlich` steht bewusst mit drin: Die meisten Abschluesse in diesem
 * Geschaeft fallen am Telefon. Es zu verbieten hiesse, dass jemand
 * „schriftlich" ankreuzt, weil es das einzige Feld ist — und dann steht dort
 * eine Unwahrheit statt einer Wahrheit.
 *
 * Es traegt trotzdem weniger: Ein muendliches Ja verlangt eine Fundstelle
 * (die Notiz, wer wann was gesagt hat) und ist kein Ersatz fuer eine
 * Unterschrift, wo eine noetig ist.
 */
export const JA_FORMEN = ["schriftlich", "e-mail", "unterschrift", "muendlich"] as const
export type JaForm = (typeof JA_FORMEN)[number]

export type Annahme = {
  /** Wer zugesagt hat — der Mensch, nicht die Firma. */
  von: string
  rolle: string
  form: JaForm
  am: string
  /** Wo es steht. Ohne sie ist ein muendliches Ja eine Erinnerung. */
  fundstelle: string
}

export function annahmeTraegt(a: Annahme | null | undefined): boolean {
  if (!a) return false
  if (!a.von?.trim() || !a.rolle?.trim() || !a.am?.trim()) return false
  if (!(JA_FORMEN as readonly string[]).includes(a.form)) return false
  return (a.fundstelle?.trim().length ?? 0) >= 8
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · DER ZUSTAND
 * ═══════════════════════════════════════════════════════════════════════════ */

export const ANGEBOT_ZUSTAENDE = {
  entwurf: {
    label: "Entwurf",
    was: "Existiert. Ging nirgendwohin.",
    verlangt: "nichts — ein Entwurf darf unfertig sein.",
  },
  gesendet: {
    label: "Gesendet",
    was: "Beim Kunden. Ab hier ist es eine Zusage.",
    verlangt:
      "Angebotsreife nach G07/G08, alle Pflichtabschnitte, jede Zahl aus dem Katalog " +
      "oder mit Owner-Freigabe, ein Gueltigkeitsdatum ohne Verknappungssprache.",
  },
  angenommen: {
    label: "Angenommen",
    was: "Das Ja.",
    verlangt: "alles aus dem Senden, plus eine Annahme mit Person, Form, Datum und Fundstelle.",
  },
  abgelehnt: {
    label: "Abgelehnt",
    was: "Ein Nein. Der Grund gehoert an den Vorgang (G16), nicht ans Angebot.",
    verlangt: "nichts weiter.",
  },
  abgelaufen: {
    label: "Abgelaufen",
    was: "Das Gueltigkeitsdatum ist vorbei, ohne Antwort.",
    verlangt: "nichts weiter.",
  },
} as const

export type AngebotZustand = keyof typeof ANGEBOT_ZUSTAENDE

export function istVerbindlich(z: AngebotZustand): boolean {
  return z === "gesendet" || z === "angenommen"
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 5 · DAS ANGEBOT
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Angebot = {
  id: string
  opportunityId: string
  /** `CD-YYMMDD-####` — dieselbe Nummer wie in der Eingangsbestaetigung. */
  referenz: string
  kind: OfferKind
  /** Die Sprache des GESPRAECHS. Eine TR-Fassung ist keine Uebersetzung. */
  sprache: "de" | "tr" | "en" | "ar"
  /** Ein Datum. Ohne Verknappungssprache. */
  gueltigBis: string
  abschnitte: Record<string, string>
  positionen: Position[]
  zustand: AngebotZustand
  annahme: Annahme | null
  erstelltAm: string
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 6 · DIE PRUEFUNG
 * ═══════════════════════════════════════════════════════════════════════════ */

/** `CD-YYMMDD-####`, so wie `lib/lead-id.ts` sie vergibt. */
export const REFERENZ_MUSTER = /^CD-\d{6}-[0-9a-f]{4}$/i

/**
 * Verknappungssprache.
 *
 * Das Schema verbietet sie ausdruecklich („Ohne Verknappungssprache — nur
 * noch heute"). Der Grund steht nicht dort, aber er ist derselbe wie beim
 * Newsletter-Feld und bei den Sternen: Ein Haus, das „zeigen statt
 * behaupten" als Regel hat, darf keine Dringlichkeit erfinden, die es nicht
 * gibt. Ein Angebot laeuft ab, weil Preise sich aendern — nicht, um jemanden
 * zu druecken.
 */
const VERKNAPPUNG =
  /(nur noch heute|nur heute|letzte chance|jetzt zugreifen|solange der vorrat|nur diese woche|einmalige gelegenheit|sichern sie sich)/i

export type Befund = { abschnitt: string; satz: string }

/**
 * Was einem Angebot fehlt, um in diesen Zustand zu gehen.
 *
 * Reine Rechnung: kein Speicher, keine Abfrage. Damit ruft die Oberflaeche
 * dieselbe Funktion wie das Gate und der Probelauf — es gibt keine zweite
 * Fassung der Regel, die auseinanderlaufen koennte.
 */
export function fehltFuer(
  angebot: Angebot,
  ziel: AngebotZustand,
  belege: readonly string[],
): Befund[] {
  const fehlt: Befund[] = []

  if (!REFERENZ_MUSTER.test(angebot.referenz)) {
    fehlt.push({
      abschnitt: "Formales",
      satz:
        `Die Referenz „${angebot.referenz}" folgt nicht dem Muster CD-YYMMDD-####. ` +
        "Sie soll dieselbe Nummer sein wie in der Eingangsbestaetigung — sonst hat der Kunde zwei.",
    })
  }

  if (!istVerbindlich(ziel)) return fehlt

  /* ── Angebotsreife (G07/G08) ─────────────────────────────────────────── */
  const reife = readinessFor(angebot.kind, belege)
  for (const offen of reife.open) {
    fehlt.push({
      abschnitt: "Angebotsreife",
      satz: `${offen.label} — ${offen.why}`,
    })
  }

  /* ── Die Pflichtabschnitte ───────────────────────────────────────────── */
  for (const a of ABSCHNITTE) {
    if (!a.pflicht) continue
    const text = (angebot.abschnitte[a.key] ?? "").trim()
    if (text.length === 0) {
      fehlt.push({ abschnitt: `${a.nummer} ${a.titel}`, satz: a.regel })
    }
  }

  /* ── Jede Zahl aus dem Katalog oder mit Freigabe ──────────────────────── */
  if (angebot.positionen.length === 0) {
    fehlt.push({
      abschnitt: "06 Preis",
      satz: "Keine Position. Ein Angebot ohne Zahl ist ein Gespraechsprotokoll.",
    })
  }
  for (const p of angebot.positionen) {
    if (p.art === "katalog") {
      if (betragVon(p) === null) {
        fehlt.push({
          abschnitt: "06 Preis",
          satz: `„${p.was}" verweist auf ${p.quelle}, und dort steht keine Zahl.`,
        })
      }
    } else if (!freigabeTraegt(p.freigabe)) {
      fehlt.push({
        abschnitt: "06 Preis",
        satz:
          `„${p.was}" traegt einen eigenen Betrag ohne belastbare Owner-Freigabe. ` +
          "Jede Zahl steht im Katalog oder ist freigegeben — mit Wer, Wann und Fundstelle.",
      })
    }
  }

  /* ── Gueltigkeit ─────────────────────────────────────────────────────── */
  if (!/^\d{4}-\d{2}-\d{2}$/.test(angebot.gueltigBis)) {
    fehlt.push({ abschnitt: "Formales", satz: "Kein Gueltigkeitsdatum (YYYY-MM-DD)." })
  }

  /*
   * Verknappung wird im GANZEN Angebot gesucht, nicht nur bei der
   * Gueltigkeit: Der Satz „nur noch heute" wirkt an jeder Stelle gleich.
   */
  for (const [key, text] of Object.entries(angebot.abschnitte)) {
    const treffer = text.match(VERKNAPPUNG)
    if (treffer) {
      const a = ABSCHNITTE.find((x) => x.key === key)
      fehlt.push({
        abschnitt: a ? `${a.nummer} ${a.titel}` : key,
        satz: `„${treffer[0]}" ist Verknappungssprache. Ein Angebot laeuft ab, weil Preise sich aendern — nicht um zu druecken.`,
      })
    }
  }

  /* ── Das Ja ──────────────────────────────────────────────────────────── */
  if (ziel === "angenommen" && !annahmeTraegt(angebot.annahme)) {
    fehlt.push({
      abschnitt: "Annahme",
      satz:
        "Ein Ja ohne Person, Form, Datum und Fundstelle ist ein Haken. " +
        "Ein muendliches Ja ist ein Ja — dann steht das da, mit dem Namen dessen, der es gesagt hat.",
    })
  }

  return fehlt
}

/** Darf dieses Angebot in diesen Zustand? */
export function darf(angebot: Angebot, ziel: AngebotZustand, belege: readonly string[]): boolean {
  return fehltFuer(angebot, ziel, belege).length === 0
}

/**
 * Die Laengenregel aus dem Schema.
 *
 *     „Wenn es laenger als sechs Seiten wird, fehlt eine ENTSCHEIDUNG —
 *      nicht eine Seite."
 *
 * Sie ist ein Hinweis und kein Abbruch: Ein langes Angebot ist kein Fehler,
 * es ist ein Verdacht. Wer daraus ein Verbot macht, erzeugt kleinere Schrift.
 */
export const ZEICHEN_JE_SEITE = 2800
export const SEITEN_HINWEIS_AB = 6

export function seiten(angebot: Angebot): number {
  const zeichen = Object.values(angebot.abschnitte).join(" ").length
  return Math.max(1, Math.ceil(zeichen / ZEICHEN_JE_SEITE))
}

/** Was das Angebot verkauft — Label aus dem bestehenden Katalog, keine zweite Liste. */
export function artLabel(kind: OfferKind): string {
  return OFFERS[kind].label
}
