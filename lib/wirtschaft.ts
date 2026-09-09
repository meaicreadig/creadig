/**
 * G23 · WIRTSCHAFTLICHKEIT & KAPAZITAET — und die G05-Schuld.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DER VERTRAG STELLT ZWEI FRAGEN — UND DIE ANTWORT IST HEUTE „NICHT ERHOBEN"
 *
 *     „Marge je Projekt, wiederkehrender Anteil, Kapazitaetsgrenze. Hier
 *      wird die G05-Schuld eingeloest: Traegt der Pilotpreis von 2.400 €?
 *      Traegt 149 €/Monat?"
 *
 * Beide Fragen sind heute NICHT BEANTWORTBAR, und das ist der Befund. Nicht
 * weil die Rechnung schwer waere, sondern weil die eine Zahl fehlt, aus der
 * sie entsteht: Es wird kein Aufwand erfasst. Nirgends.
 *
 * Ein System, das aus dieser Lage eine Marge SCHAETZT, hat die Frage nicht
 * beantwortet, sondern uebertuencht. „2.400 € traegt vermutlich" ist keine
 * kaufmaennische Aussage, sondern eine Hoffnung mit Ziffern.
 *
 * Deshalb rechnet dieses Modul nur, wenn alles da ist — und sagt sonst
 * GENAU, was fehlt. UNBEKANNT IST NICHT NULL, und es ist erst recht nicht
 * „in Ordnung".
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE KNAPPHEIT, DIE KEINE WAR
 *
 * `docs/sales/offers.md` fuehrt unter „was dieses Haus nicht tut":
 *
 *     „Knappheit ohne Zustand („die ersten zwei Betriebe") — wenn niemand
 *      zaehlt und niemand abschaltet, ist es keine Knappheit."
 *
 * Und zwei Absaetze darueber steht die Bedingung des Pilotpreises:
 *
 *     „Bedingung ist, der ERSTE BETRIEB IN EINEM GEWERK zu sein."
 *
 * Das ist eine Knappheit mit Zustand — sie ist zaehlbar. Gezaehlt hat sie
 * nur niemand. Damit galt der Pilotpreis faktisch fuer jeden, der fragte,
 * und die eigene Regel stand gegen die eigene Praxis.
 *
 * `pilotpreisLage()` beantwortet die Frage, bevor der Preis genannt wird.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * UND DIE KAPAZITAET
 *
 * Die Roadmap sagt es in einer Zeile: „Wer ausgelastet ist, darf nicht mehr
 * verkaufen." Das ist eine kaufmaennische Aussage, keine technische — und
 * sie braucht eine Zahl, die nur eine Person kennt. Sie steht hier als
 * Feld, sie steht auf `null`, und das Gate sagt es bei jedem Build.
 */

import { packages, retainer } from "@/lib/site-data"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · WAS FEHLT, UM UEBERHAUPT ZU RECHNEN
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Der interne Stundensatz — was eine Stunde dieses Hauses KOSTET.
 *
 * Nicht der Verkaufspreis: Dieses Haus verkauft keine Stunden
 * (`offers.md`: „Stundensaetze als Standardmodell" steht ausdruecklich auf
 * der Verbotsliste). Gemeint ist der Satz, mit dem man einen Festpreis
 * NACHRECHNET.
 *
 * `null`, und das bleibt so, bis der Owner ihn nennt. Ein geschaetzter Satz
 * waere die zweite Haelfte einer erfundenen Marge.
 */
export const STUNDENSATZ_INTERN_CENT: number | null = null

/**
 * Wie viele Projekte und Betreuungen gleichzeitig getragen werden koennen.
 *
 * `null` — nur eine Person kennt diese Zahl. Solange sie fehlt, gibt es
 * keine Auslastung, und „wir sind voll" bleibt ein Gefuehl.
 */
export const KAPAZITAET: { projekte: number | null; betreuungen: number | null } = {
  projekte: null,
  betreuungen: null,
}

export type Aufwand = {
  projektId: string
  /** Volle Viertelstunden. Keine Schaetzung, keine Spanne. */
  minuten: number
  wofuer: string
  am: string
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE MARGE — oder ein benannter Grund, warum es keine gibt
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Margenlage =
  | {
      art: "gerechnet"
      erloesCent: number
      kostenCent: number
      margeCent: number
      /** Anteil in Prozentpunkten, nur zur Anzeige — nie als Urteil. */
      anteil: number
      stunden: number
    }
  | { art: "unbekannt"; fehlt: string[] }

/**
 * Die Marge eines Projekts.
 *
 * Zwei Wege, und nur zwei: gerechnet oder unbekannt. Es gibt bewusst keinen
 * dritten („geschaetzt", „ungefaehr", „vorlaeufig") — jeder davon wird nach
 * zwei Wochen wie eine Zahl gelesen.
 */
export function marge(
  erloesCent: number | null,
  aufwand: readonly Aufwand[],
  stundensatzCent: number | null = STUNDENSATZ_INTERN_CENT,
): Margenlage {
  const fehlt: string[] = []

  if (erloesCent === null || erloesCent <= 0) {
    fehlt.push("Kein Erloes. Ohne gestellte Rechnung (G18) gibt es nichts zu verteilen.")
  }
  if (aufwand.length === 0) {
    fehlt.push(
      "Kein erfasster Aufwand. Das ist die G05-Schuld: Ohne Stunden ist jede Marge geraten, " +
        "und eine geratene Marge beantwortet die Frage nicht, sie uebertuencht sie.",
    )
  }
  if (stundensatzCent === null || stundensatzCent <= 0) {
    fehlt.push(
      "Kein interner Stundensatz. Er sagt, was eine Stunde dieses Hauses kostet — " +
        "nicht, was sie verkauft wird. Nur der Owner kennt ihn.",
    )
  }

  if (fehlt.length > 0) return { art: "unbekannt", fehlt }

  const minuten = aufwand.reduce((n, a) => n + a.minuten, 0)
  const stunden = minuten / 60
  const kostenCent = Math.round(stunden * (stundensatzCent as number))
  const margeCent = (erloesCent as number) - kostenCent
  return {
    art: "gerechnet",
    erloesCent: erloesCent as number,
    kostenCent,
    margeCent,
    anteil: Math.round((margeCent / (erloesCent as number)) * 100),
    stunden: Math.round(stunden * 10) / 10,
  }
}

/**
 * Traegt ein Paketpreis?
 *
 * Genau die G05-Frage — und sie wird nicht beantwortet, solange die Marge
 * unbekannt ist. Der Rueckgabewert sagt das auch so, statt „vermutlich ja".
 */
export function traegtDerPreis(
  paketKey: "website" | "audit",
  aufwand: readonly Aufwand[],
): Margenlage {
  const paket = packages.find((p) => p.key === paketKey)
  const preis = paket ? (paket.regularAmount ?? paket.amount) : null
  return marge(preis === null ? null : preis * 100, aufwand)
}

/** Und dieselbe Frage fuer die monatliche Betreuung. */
export function traegtDieBetreuung(aufwandImMonat: readonly Aufwand[]): Margenlage {
  return marge(retainer.amount === null ? null : retainer.amount * 100, aufwandImMonat)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DER WIEDERKEHRENDE ANTEIL
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Anteilslage =
  | { art: "gerechnet"; einmaligCent: number; wiederkehrendCent: number; anteil: number }
  | { art: "unbekannt"; fehlt: string }

/**
 * Wie viel des Umsatzes wiederkehrt.
 *
 * Die Zahl, die ein Systemhaus von einer Agentur unterscheidet — und sie
 * bleibt unbekannt, solange nichts gestellt wurde. Eine Null waere hier
 * besonders irrefuehrend: Sie liesse sich als „nichts kehrt wieder" lesen,
 * und richtig ist „es ist noch nichts abgerechnet worden".
 */
export function wiederkehrenderAnteil(
  einmaligCent: number | null,
  wiederkehrendCent: number | null,
): Anteilslage {
  if (einmaligCent === null || wiederkehrendCent === null) {
    return { art: "unbekannt", fehlt: "Keine abgerechneten Betraege (G18). Null waere hier eine Aussage, keine Leere." }
  }
  const gesamt = einmaligCent + wiederkehrendCent
  if (gesamt === 0) {
    return { art: "unbekannt", fehlt: "Nichts abgerechnet. Ein Anteil von nichts ist kein Anteil." }
  }
  return {
    art: "gerechnet",
    einmaligCent,
    wiederkehrendCent,
    anteil: Math.round((wiederkehrendCent / gesamt) * 100),
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · KAPAZITAET — „wer ausgelastet ist, darf nicht mehr verkaufen"
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Auslastung =
  | { art: "unbekannt"; fehlt: string }
  | { art: "gemessen"; projekte: number; grenze: number; frei: number; voll: boolean }

export function auslastung(laufendeProjekte: number): Auslastung {
  if (KAPAZITAET.projekte === null) {
    return {
      art: "unbekannt",
      fehlt:
        "Keine Kapazitaetsgrenze hinterlegt. Der Satz „wir sind voll“ ist eine kaufmaennische " +
        "Aussage — " +
        "ohne Zahl bleibt sie ein Gefuehl, und ein Gefuehl schaltet nichts ab.",
    }
  }
  const frei = KAPAZITAET.projekte - laufendeProjekte
  return {
    art: "gemessen",
    projekte: laufendeProjekte,
    grenze: KAPAZITAET.projekte,
    frei: Math.max(0, frei),
    voll: frei <= 0,
  }
}

/**
 * Darf noch verkauft werden?
 *
 * Bei unbekannter Kapazitaet ist die Antwort JA — mit Vorbehalt. Das ist
 * bewusst so herum: Ein System, das den Verkauf sperrt, weil eine Zahl
 * fehlt, waere ein Betriebsstillstand aus Buchhaltungsgruenden. Der
 * Vorbehalt steht dafuer im Satz und verschwindet nicht.
 */
export function darfVerkaufen(laufendeProjekte: number): { ja: boolean; satz: string } {
  const a = auslastung(laufendeProjekte)
  if (a.art === "unbekannt") {
    return { ja: true, satz: `Ungeprueft: ${a.fehlt}` }
  }
  return a.voll
    ? { ja: false, satz: `${a.projekte} von ${a.grenze} Projekten. Wer ausgelastet ist, verkauft nicht mehr.` }
    : { ja: true, satz: `${a.projekte} von ${a.grenze} Projekten, ${a.frei} frei.` }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 5 · DIE KNAPPHEIT, DIE GEZAEHLT WERDEN MUSS
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Pilotpreislage =
  | { gilt: true; grund: string }
  | { gilt: false; grund: string }
  | { gilt: null; grund: string }

/**
 * Gilt der Pilotpreis fuer dieses Gewerk?
 *
 * `offers.md` bindet ihn an eine Bedingung: „der ERSTE BETRIEB IN EINEM
 * GEWERK zu sein." Und dieselbe Datei verbietet zwei Absaetze weiter
 * „Knappheit ohne Zustand — wenn niemand zaehlt und niemand abschaltet, ist
 * es keine Knappheit."
 *
 * Gezaehlt hat sie niemand. Damit galt der Pilotpreis faktisch fuer jeden,
 * der fragte — die eigene Regel stand gegen die eigene Praxis.
 *
 * `null` heisst hier: Die Gewerke der bestehenden Kunden sind nicht
 * erfasst. Das ist NICHT „ja" und nicht „nein" — es ist der Grund, warum
 * die Bedingung heute nicht traegt.
 */
export function pilotpreisLage(
  gewerk: string | null,
  belegteGewerke: readonly string[] | null,
): Pilotpreislage {
  if (!gewerk?.trim()) {
    return { gilt: null, grund: "Kein Gewerk genannt. Die Bedingung des Pilotpreises ist ein Gewerk, kein Betrieb." }
  }
  if (belegteGewerke === null) {
    return {
      gilt: null,
      grund:
        "Die Gewerke der bestehenden Kunden sind nicht erfasst. Ohne Zaehlung ist die Bedingung " +
        "keine Bedingung — und dann ist der Pilotpreis kein Pilotpreis, sondern der Preis.",
    }
  }
  const schon = belegteGewerke.some((g) => g.trim().toLowerCase() === gewerk.trim().toLowerCase())
  return schon
    ? { gilt: false, grund: `In „${gewerk}" gibt es bereits einen Betrieb. Der Pilotpreis ist vergeben.` }
    : { gilt: true, grund: `Erster Betrieb in „${gewerk}".` }
}
