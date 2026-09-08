/**
 * G14 · AUFTRITT — die Sichtschuld bekommt einen Eigentuemer und ein Mass.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WORAN DIESES GATE HAENGT
 *
 * `docs/roadmap/master-architecture.md` fuehrt in Abschnitt 8 eine Tabelle
 * „Owner-Sichtschuld → Eigentuemer". Vier Zeilen darin tragen **G14**. Der
 * Gate-Vertrag sagt dazu genau einen Satz:
 *
 *     „Heute: die Owner-Sichtschuld hat KEINEN EIGENTUEMER.
 *      Ziel: sie ist geschlossen."
 *
 * Eine Schuld ohne Eigentuemer ist keine Aufgabe, sie ist eine Stimmung.
 * Sie steht in einer Markdown-Tabelle, jeder liest sie, niemand schuldet
 * sie, und beim naechsten Durchgang steht sie unveraendert wieder da.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS „GESCHLOSSEN" HIER HEISST — UND WAS NICHT
 *
 * NICHT: dass die Seite jetzt schoen ist. Schoenheit ist kein Zustand, den
 * ein Skript feststellt, und ein Gate, das behauptet, er sei erreicht,
 * luegt beim ersten Lauf.
 *
 * SONDERN, fuer jede einzelne Zeile:
 *
 *   1 · Sie hat einen EIGENTUEMER — System oder Owner, nie „—".
 *   2 · Sie hat ein MASS — den Satz, der sie entscheidet. Ohne Mass bleibt
 *       sie Geschmack, und Geschmack kann man nicht schliessen.
 *   3 · Ihr ZUSTAND kommt aus einer Messung, nicht aus einer Meinung.
 *
 * Zeilen, die dem Owner gehoeren (eine Erzaehlung schreiben, eine Freigabe
 * erteilen), sind damit NICHT erledigt — aber sie sind zugeordnet, und das
 * war die Schuld: nicht „unfertig", sondern „herrenlos".
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIE REGELN HIER STEHEN UND NICHT IM SKRIPT
 *
 * Dieselbe Haus-Doktrin wie bei `lib/proof.ts` (G13): Das Gate und die
 * Oberflaeche muessen DIESELBE Funktion rufen. Wuerde `optischeHoehe()` im
 * Pruefskript noch einmal gerechnet, pruefte das Gate seine eigene
 * Zweitfassung — und ein gruener Lauf hiesse nur, dass zwei Kopien
 * uebereinstimmen, nicht dass die Seite stimmt.
 */

import { LOGO_MASSE, OHNE_MASS, type LogoMass } from "@/lib/logo-masse.generated"

export { LOGO_MASSE, OHNE_MASS }
export type { LogoMass }

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DIE SCHULD
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Wem die Zeile gehoert.
 *
 * `system` — entscheidbar aus Code, Datei oder gerendertem Bild. Dafuer gibt
 *            es ein Skript, und dann gibt es keine Ausrede mehr.
 * `owner`  — verlangt eine Entscheidung oder einen Text, den nur der
 *            Eigentuemer des Hauses geben kann. Ein Gate, das so etwas
 *            gruen faerbt, faelscht eine Zustimmung.
 */
export type Eigentuemer = "system" | "owner"

export type Schuld = {
  id: string
  /** Die Zeile, wie sie in der Roadmap steht — unveraendert zitiert. */
  satz: string
  eigentuemer: Eigentuemer
  /**
   * DER SATZ, DER SIE ENTSCHEIDET. Kein Ziel, kein Wunsch: eine Bedingung,
   * die wahr oder falsch ist. Steht hier „…sollte besser wirken", ist die
   * Zeile nicht messbar und gehoert dem Owner, nicht dem System.
   */
  mass: string
  /** Wo gemessen wird. `null` nur bei Owner-Zeilen. */
  wo: string | null
}

/**
 * Die vier G14-Zeilen aus Abschnitt 8, aufgebrochen in das, was einzeln
 * entschieden werden kann. Aufgebrochen, weil „Sichtrhythmus, Fusszeile,
 * Logo-Kontrast, Unternehmen-Erzaehlung" in EINER Zeile vier verschiedene
 * Eigentuemer hat — drei davon sind Mechanik, einer ist ein Text.
 */
export const SICHTSCHULD: readonly Schuld[] = [
  {
    id: "cta-radien",
    satz: "CTA-Radien",
    eigentuemer: "system",
    mass:
      "Jede Schaltflaeche und jeder als Schaltflaeche gestaltete Link traegt " +
      "einen Radius aus der Rollen-Tabelle (8 / 12 / 20 px) oder bewusst 0. " +
      "Zwei CTA nebeneinander tragen denselben.",
    wo: "auftritt-drill · gerendeter border-radius",
  },
  {
    id: "kollisionsfreiheit",
    satz: "Kollisionsfreiheit ueber alle Breiten",
    eigentuemer: "system",
    mass:
      "Auf keiner gepruefte Breite ueberlappen sich zwei Bedienelemente, und " +
      "kein Bedienelement ueberlappt Text, der nicht zu ihm gehoert.",
    wo: "auftritt-drill · Rechtecke gegeneinander",
  },
  {
    id: "responsive-regression",
    satz: "responsive Regression",
    eigentuemer: "system",
    mass:
      "Der Lauf faehrt dieselben Breiten wie mobile.mjs und bricht ab, sobald " +
      "eine davon einen Befund hat — nicht erst, wenn jemand hinsieht.",
    wo: "auftritt-drill · sechs Breiten, zwei Erscheinungsbilder",
  },
  {
    id: "logo-verhaeltnis",
    satz: "Oekosystem-Logotreue · Seitenverhaeltnis",
    eigentuemer: "system",
    mass:
      "Das gerenderte Rechteck jedes Markenzeichens haelt das Verhaeltnis der " +
      "Quelldatei auf 2 % genau. Kein `max-w` gegen ein festes `h-*` ohne " +
      "`object-contain`.",
    wo: "auftritt-drill · Rechteck gegen LOGO_MASSE",
  },
  {
    id: "logo-optische-groesse",
    satz: "Oekosystem-Logotreue · optische statt rechnerischer Groesse",
    eigentuemer: "system",
    mass:
      `Die belegte Flaeche zweier Markenzeichen auf derselben Reihe unterscheidet ` +
      `sich hoechstens um Faktor ${2.0}. Gleiche Hoehe ist rechnerisch, nicht optisch.`,
    wo: "auftritt-drill · Flaechen einer Reihe",
  },
  {
    id: "logo-farbe",
    satz: "Oekosystem-Logotreue · MAQAM-Q-Farbe originalgetreu, fibero nicht kuenstlich vergroessert",
    eigentuemer: "system",
    mass:
      "Die Behandlung auf dunklem Grund ist je Marke DEKLARIERT (`dunkel`), " +
      "nicht pauschal. Wo `original` steht, laeuft kein Filter, der die Farbe " +
      "entfernt — auch nicht in Ruhe auf einem Geraet ohne Zeiger.",
    wo: "auftritt-drill · computed filter je Marke",
  },
  {
    id: "logo-kontrast",
    satz: "Logo-Kontrast",
    eigentuemer: "system",
    mass:
      "Jedes Markenzeichen ist auf seinem eigenen Grund sichtbar — hell wie " +
      "dunkel. Gemessen wird die Deckkraft der gerenderten Flaeche, nicht die " +
      "Absicht im Kommentar.",
    wo: "auftritt-drill · Deckkraft und Filter auf beiden Graenden",
  },
  {
    id: "bewegung-ruhig",
    satz: "Oekosystem-Logotreue · Bewegung ruhig",
    eigentuemer: "system",
    mass:
      `Der Logo-Streifen laeuft hoechstens ${40} px/s, und bei ` +
      "`prefers-reduced-motion: reduce` gar nicht. Eine Bahn, die man lesen " +
      "will, darf man nicht jagen muessen.",
    wo: "auftritt-drill · gemessener Versatz ueber Zeit",
  },
  {
    id: "sichtrhythmus",
    satz: "Sichtrhythmus",
    eigentuemer: "system",
    mass:
      "Der senkrechte Abstand zwischen zwei Abschnitten einer Seite kommt aus " +
      "einer kleinen Menge von Werten. Zehn verschiedene Abstaende auf einer " +
      "Seite sind kein Rhythmus, sondern Zufall.",
    wo: "auftritt-drill · Abstaende zwischen <section>",
  },
  {
    id: "fusszeile",
    satz: "Fusszeile",
    eigentuemer: "system",
    mass:
      "Die Fusszeile traegt auf jeder Breite dieselben Rollen (Marke, " +
      "Navigation, Recht, Einwilligung, Sprache) und bricht auf 320 px nicht um " +
      "in eine Spalte, die laenger ist als die Seite darueber.",
    wo: "auftritt-drill · Rollen und Hoehe der Fusszeile",
  },
  {
    id: "seitenrollen",
    satz: "Seitenrollen Leistungen/Produkte/Arbeiten",
    eigentuemer: "system",
    mass:
      "Jede der drei Seiten beantwortet eine eigene Frage und sagt sie im " +
      "Kopf. Zwei Seiten mit derselben Ueberschriften-Rolle sind eine Seite " +
      "zu viel.",
    wo: "auftritt-drill · h1 und Rollensatz je Seite",
  },
  {
    id: "unternehmen-erzaehlung",
    satz: "Unternehmen-Erzaehlung",
    eigentuemer: "owner",
    mass:
      "Kein System kann entscheiden, ob die Geschichte des Hauses stimmt. Der " +
      "Owner schreibt sie oder er laesst sie weg; ein Gate, das sie gruen " +
      "faerbt, erfindet eine Herkunft.",
    wo: null,
  },
]

/** Eine Schuld ohne Eigentuemer ist der Zustand, den G14 beendet. */
export function herrenlos(liste: readonly Schuld[] = SICHTSCHULD): Schuld[] {
  return liste.filter((s) => !s.eigentuemer || !s.mass?.trim())
}

/** System-Zeilen ohne Messort waeren Zusagen ohne Beleg. */
export function ohneMessort(liste: readonly Schuld[] = SICHTSCHULD): Schuld[] {
  return liste.filter((s) => s.eigentuemer === "system" && !s.wo)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · RADIUS — die Rolle entscheidet, nicht das Auge
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Die drei Groessen aus `globals.css` (Owner 27.08.2026: rund), plus die
 * bewusste Null.
 *
 * Warum die Null dazugehoert: Ein Eingabefeld, das nur eine untere Linie
 * traegt (`betriebscheck`, `quick-check`, `termin-wizard`), ist keine
 * Flaeche mit Ecken — dort waeren 8 px eine Rundung an einer Kante, die es
 * nicht gibt. Verboten ist nicht die Null, verboten ist der WILLKUERLICHE
 * Wert dazwischen.
 */
export const RADIUS_ROLLEN = {
  scharf: 0,
  bedienelement: 8,
  kachel: 12,
  flaeche: 20,
} as const

export const ERLAUBTE_RADIEN: readonly number[] = Object.values(RADIUS_ROLLEN)

/**
 * `rounded-full` ist kein vierter Wert, sondern eine Form: Punkt, Abzeichen,
 * runder Knopf. Der Browser meldet dafuer einen Prozentwert oder die halbe
 * Hoehe — beides erkennt man daran, dass der Radius mindestens die halbe
 * kleinere Kante ist.
 */
export function istPille(radiusPx: number, breite: number, hoehe: number): boolean {
  return radiusPx >= Math.min(breite, hoehe) / 2 - 0.5
}

/** Haelt dieser gerenderte Radius eine Rolle? */
export function radiusErlaubt(radiusPx: number, breite: number, hoehe: number): boolean {
  if (istPille(radiusPx, breite, hoehe)) return true
  return ERLAUBTE_RADIEN.some((r) => Math.abs(r - radiusPx) < 0.6)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · LOGO — Verhaeltnis und optische Groesse
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Wie weit das gerenderte Verhaeltnis vom echten abweichen darf. */
export const VERHAELTNIS_TOLERANZ = 0.02

/** Groesster erlaubter Flaechenunterschied zweier Zeichen derselben Reihe. */
export const MASSE_SPREIZUNG = 2.0

/**
 * DIE OPTISCHE HOEHE.
 *
 * Gesucht ist nicht gleiche Hoehe, sondern gleiche WIRKUNG — und die haengt
 * an der Flaeche. Soll jedes Zeichen dieselbe Flaeche `basis²` belegen, gilt
 * bei Breite = Hoehe × Verhaeltnis:
 *
 *     hoehe² × verhaeltnis = basis²   →   hoehe = basis / √verhaeltnis
 *
 * Ergebnis auf der Wand (basis 46): meahv 47 px hoch, CASSAMEA 16 px hoch,
 * beide rund 2.100 px² — vorher standen sie bei 960 gegen 4.608.
 *
 * Die Klammern sind kein Geschmack, sondern die Grenzen des Lesbaren: unter
 * `minHoehe` verschwindet die Wortmarke, ueber `maxHoehe` sprengt ein
 * quadratisches Zeichen die Kachel. Wo geklammert wird, ist die Flaeche
 * nicht mehr gleich — genau das meldet `spreizung()` dann auch, statt es zu
 * verstecken.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * WARUM DIE UNTERE KLAMMER BEI 0,30 STEHT UND NICHT BEI 0,42
 *
 * Bei 0,42 hat sie zum ersten Mal GEBUNDEN — und dabei das Gegenteil ihres
 * Zwecks getan. CASSAMEA (8,38 : 1) haette bei Basis 52 optisch 18 px hoch
 * sein muessen; die Klammer hob es auf 22 px, und damit wurde das Zeichen
 * 183 px breit. In die Kachel passen 176. Der Flexraster hat es
 * zusammengeschoben, und der Drill hat gemeldet, was dabei herauskam: 7,97
 * statt 8,38.
 *
 * Eine Klammer, die eine Wortmarke vor dem Verschwinden schuetzen soll und
 * sie dafuer aus der Kachel druckt, schuetzt nichts. Bei 0,30 bindet sie
 * erst ab 11 : 1 — jenseits jedes Zeichens, das dieses Haus fuehrt. Sie
 * bleibt als Fangnetz fuer den Tag, an dem jemand ein absurdes Verhaeltnis
 * ablegt; im Alltag gilt wieder die reine Flaechengleichheit.
 */
export function optischeHoehe(
  verhaeltnis: number,
  basis: number,
  { minHoehe = basis * 0.3, maxHoehe = basis * 1.25 }: { minHoehe?: number; maxHoehe?: number } = {},
): number {
  if (!(verhaeltnis > 0)) return basis
  const roh = basis / Math.sqrt(verhaeltnis)
  return Math.round(Math.min(maxHoehe, Math.max(minHoehe, roh)))
}

/**
 * Dieselbe Rechnung fuer den Browser.
 *
 * Die Oberflaeche kann die Hoehe nicht in Javascript setzen: `basis` haengt
 * an der Breite (auf dem Telefon kleiner als auf dem Schirm), und ein
 * Umschaltpunkt ist eine CSS-Frage. Also steht die Formel zweimal — einmal
 * als Funktion fuer das Gate, einmal als `clamp()` fuer das Stylesheet.
 *
 * Zwei Fassungen einer Formel laufen normalerweise auseinander. Hier nicht:
 * `auftritt-drill` misst die GERENDERTE Hoehe und haelt sie gegen
 * `optischeHoehe()` mit der gemessenen Basis. Weicht das Stylesheet ab,
 * faellt der Lauf — die zweite Fassung wird also bei jedem Durchgang gegen
 * die erste geprueft, statt ihr zu gleichen.
 */
export function optischeHoeheCss(verhaeltnis: number, basisVar = "--zeichen-basis"): string {
  if (!(verhaeltnis > 0)) return `var(${basisVar})`
  const teiler = Math.sqrt(verhaeltnis).toFixed(4)
  return (
    `clamp(calc(var(${basisVar}) * 0.3), ` +
    `calc(var(${basisVar}) / ${teiler}), ` +
    `calc(var(${basisVar}) * 1.25))`
  )
}

/** Die Flaeche, die ein Zeichen bei dieser Hoehe belegt. */
export function flaeche(verhaeltnis: number, hoehe: number): number {
  return hoehe * hoehe * verhaeltnis
}

/** Faktor zwischen groesster und kleinster Flaeche einer Reihe. */
export function spreizung(flaechen: readonly number[]): number {
  const echte = flaechen.filter((f) => f > 0)
  if (echte.length < 2) return 1
  return Math.max(...echte) / Math.min(...echte)
}

/** Verhaeltnistreue eines gerenderten Rechtecks gegen die Quelldatei. */
export function verhaeltnisAbweichung(breite: number, hoehe: number, soll: number): number {
  if (hoehe <= 0 || soll <= 0) return Infinity
  return Math.abs(breite / hoehe - soll) / soll
}

/** Das Mass eines Zeichens, oder `null` — nie eine geratene Eins. */
export function massVon(pfad: string | null | undefined): LogoMass | null {
  if (!pfad) return null
  return LOGO_MASSE[pfad] ?? null
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · BEWEGUNG
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Hoechstgeschwindigkeit des Logo-Streifens.
 *
 * 40 px/s ist keine Zahl aus dem Gefuehl: Eine Logokachel ist rund 208 px
 * breit; bei 40 px/s steht sie gut fuenf Sekunden im Blick. Darunter wirkt
 * die Bahn stehend, darueber muss das Auge mitziehen — und genau das meint
 * „Bewegung ruhig".
 */
export const BEWEGUNG_MAX_PX_S = 40

/* ═══════════════════════════════════════════════════════════════════════════
 * 5 · KOLLISION
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Rechteck = { x: number; y: number; w: number; h: number }

/**
 * Ueberlappen zwei Rechtecke?
 *
 * `spiel` faengt das ab, was keine Kollision ist: Der Browser rechnet in
 * Teilpixeln, und zwei Knoepfe, die exakt aneinander stossen, melden sich
 * sonst als Ueberlappung von 0,3 px. Gesucht ist die Stelle, an der ein
 * Element WIRKLICH auf einem anderen liegt.
 */
export function ueberlappt(a: Rechteck, b: Rechteck, spiel = 1): number {
  const x = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const y = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  if (x <= spiel || y <= spiel) return 0
  return Math.round(x * y)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 6 · SICHTRHYTHMUS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * DIE TAKTSKALA — aus welchen Schritten die senkrechte Luft einer Seite
 * kommen darf.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * WARUM EINE SKALA UND KEINE OBERGRENZE
 *
 * Der erste Anlauf lautete „hoechstens drei verschiedene Abstaende je Seite",
 * weil `globals.css` drei Sektionsrollen kennt (section-shell 8rem,
 * -band 9rem, -tight 6rem). Gemessen war die Regel falsch:
 *
 *   · Die Seitenkoepfe der Unterseiten tragen 10rem. Das ist keine
 *     Nachlaessigkeit, sondern eine vierte Rolle — ein Seitenkopf oeffnet
 *     eine Seite, er steht nicht mitten drin.
 *   · Der Logo-Streifen unter dem Hero traegt 3,5rem. Auch das ist Absicht:
 *     Er gehoert zum Hero, er folgt ihm nicht.
 *   · Und weil zwei Abschnitte aneinanderstossen, ergeben drei Rollen in
 *     Paaren bis zu sechs Summen — eine Obergrenze auf die SUMME haette
 *     Gleichfoermigkeit verlangt und sie Rhythmus genannt.
 *
 * Ein Takt ist nicht „wenige Werte". Ein Takt ist: JEDER Wert liegt auf dem
 * Raster. Deshalb steht hier die Skala und keine Zahl — sie erlaubt jeder
 * Seite ihre eigene Auswahl und verbietet den Wert, der zu keiner Rolle
 * gehoert.
 *
 * Gemessen am 09.09.2026 fielen genau zwei Werte heraus: 11rem auf
 * /produkte und 9,5rem auf /arbeiten. Beide von Hand gesetzt, beide ohne
 * Rolle — die „Sichtrhythmus"-Zeile der Owner-Sichtschuld in Zahlen.
 */
export const TAKT_SKALA_REM: readonly number[] = [2.5, 3.5, 5, 6, 7, 8, 9, 10]

/** Ein Grundwert (16 px) — die Skala ist in rem gedacht, gemessen wird in px. */
export const WURZEL_PX = 16

/**
 * Wie weit ein gemessener Wert danebenliegen darf.
 *
 * 3 px, weil zwischen Rechnung und Bild drei Dinge stehen: die Haarlinie
 * einer Sektionskante (1 px), das Aufrunden auf ganze Geraetepixel und die
 * Unterlaenge einer Schrift, die den Inhaltsrand um ein bis zwei Pixel
 * verschiebt. Wer hier enger misst, meldet Schriftmetrik als Designfehler.
 */
export const TAKT_TOLERANZ_PX = 3

/** Liegt dieser Wert auf der Skala? */
export function aufTakt(px: number): boolean {
  return TAKT_SKALA_REM.some((r) => Math.abs(r * WURZEL_PX - px) <= TAKT_TOLERANZ_PX)
}

/** Die Werte einer Seite, die auf keiner Stufe liegen — in rem benannt. */
export function ausserTakt(werte: readonly number[]): { px: number; rem: number }[] {
  const raus = new Map<number, { px: number; rem: number }>()
  for (const px of werte) {
    if (px <= 0 || aufTakt(px)) continue
    raus.set(px, { px, rem: Math.round((px / WURZEL_PX) * 100) / 100 })
  }
  return [...raus.values()].sort((a, b) => a.px - b.px)
}
