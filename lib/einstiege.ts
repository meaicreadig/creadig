import { packages, retainer, serviceLayers } from "@/lib/site-data"
import { publishedServicePages, type ServiceLayerKey } from "@/lib/service-pages"

/* ==========================================================================
 * GATE 01 · DIE ANGEBOTSARCHITEKTUR — EIN EINSTIEG JE EBENE
 * ==========================================================================
 *
 * ---------------------------------------------------------------------------
 * DER BEFUND, DER DIESE DATEI AUSGELOEST HAT
 * WEB-0004: „Operations und Intelligence sind Kategorien, kein kaufbarer
 * Einstieg." Gemessen in Gate 00: fuer beide Ebenen kein Preis, keine
 * Projektgroesse, kein Beispiel. Die Ursache lag nicht im Text, sondern in der
 * Struktur — `publishedServicePages` deckt heute `identity` (1), `digital` (4)
 * und `automation` (1) ab. Fuer `operations` und `intelligence` gibt es keine
 * Leistungsseite, also stand unter ihrer Ueberschrift nichts, woran sich ein
 * Kaeufer festhalten kann.
 *
 * Zwei der fuenf Ebenen hatten damit kein Ziel. Die anderen drei hatten eins,
 * aber niemand sah es an der Ebene — es stand als Pille in einer Reihe daneben.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER STEHT UND WAS BEWUSST FEHLT
 * Je Ebene: die ART des Einstiegs, der BETRAG (falls es einen bestaetigten
 * gibt), die ROUTE, an der er beginnt, und ein BELEG — etwas, das es
 * tatsaechlich gibt und das diese Ebene zeigt.
 *
 * Kein Betrag wird hier getippt. `betrag` liest ausschliesslich aus
 * `packages` und `retainer` in `lib/site-data.ts`; wo dort nichts steht, steht
 * hier `null` und die Seite sagt „Angebot nach Analyse" statt einer Zahl. Eine
 * erfundene Zahl fuer Intelligence waere der teuerste Satz der ganzen Website:
 * Sie waere die einzige Zahl auf der Seite, die niemand halten muss.
 *
 * Genau diese Luecke ist ein Owner-Punkt (OD-6), kein Redaktionsproblem.
 *
 * ---------------------------------------------------------------------------
 * WARUM NICHT IN `site-data.ts`
 * Weil `lib/site-data.ts` unter G18 gesperrt ist. Diese Datei liest von dort
 * und schreibt nichts zurueck. Die Preise bleiben an genau einer Stelle.
 *
 * ---------------------------------------------------------------------------
 * ABGRENZUNG ZU `lib/angebot.ts`
 * `lib/angebot.ts` ist die INNENSEITE (G17): ein konkretes Angebot an einen
 * konkreten Interessenten, mit Positionen, Zustaenden und einem Ja. Diese
 * Datei ist die AUSSENSEITE: was ein Besucher auf der oeffentlichen Seite als
 * Einstieg angeboten bekommt. Beide fassen einander nicht an.
 * ========================================================================== */

/**
 * Wie ein Einstieg in diese Ebene aussieht.
 *
 *   `festpreis`      — ein bestaetigter Festpreis fuer einen vereinbarten Umfang
 *   `monatlich`      — ein bestaetigter Monatsbetrag
 *   `nach-analyse`   — kein Listenpreis; das Angebot entsteht nach dem Gespraech
 *
 * `nach-analyse` ist keine Ausweichformel: Es ist der Zustand, in dem sich
 * Systementwicklung heute tatsaechlich befindet, und er steht so auch in
 * `leistungenPage.pricingNote`.
 */
export type EinstiegsArt = "festpreis" | "monatlich" | "nach-analyse"

export type EbenenEinstieg = {
  layer: ServiceLayerKey
  art: EinstiegsArt
  /** Netto-Betrag, ausschliesslich aus `site-data`. `null` = kein Listenpreis. */
  betrag: number | null
  /** Wo der Einstieg tatsaechlich beginnt. Immer eine existierende Route. */
  einstiegHref: string
  /**
   * Etwas, das es gibt und das diese Ebene zeigt — ein eigenes Produkt oder
   * eine offengelegte Pruefung an der eigenen Seite. Kein Marketing-Beispiel.
   *
   * `null` heisst: fuer diese Ebene gibt es heute nichts Zeigbares. Das ist
   * kein Versehen und wird nicht mit einem zweiten Link auf die
   * Leistungsseite kaschiert — ein Beleg, der auf das Angebot zeigt, ist
   * kein Beleg. Die Luecke steht als WEB-0001 bei Gate 02.
   */
  belegHref: string | null
  /**
   * Woher die Beschriftung des Belegs kommt. Explizit statt aus der URL
   * geraten: `produkt` liest den Namen aus `productWorks`, `eigenpruefung`
   * ist die veroeffentlichte Pruefung der eigenen Seite.
   */
  belegArt: "produkt" | "eigenpruefung" | null
  /**
   * `true`, wenn an diesem Einstieg eine Bedingung haengt, die vor dem Preis
   * genannt werden muss (heute nur der Retainer: nur fuer Systeme, die wir
   * gebaut haben — `retainer.precondition`).
   */
  bedingung: boolean
}

const websitePaket = packages.find((p) => p.key === "website") ?? null

export const ebenenEinstiege: EbenenEinstieg[] = [
  {
    layer: "identity",
    art: "nach-analyse",
    betrag: null,
    einstiegHref: "/leistungen/corporate-design",
    belegHref: null,
    belegArt: null,
    bedingung: false,
  },
  {
    /*
     * Die einzige Ebene mit einem beworbenen Festpreis. Er steht auf
     * `/leistungen#pakete` und nirgends sonst als Zahl — siehe WEB-0024.
     */
    layer: "digital",
    art: websitePaket ? "festpreis" : "nach-analyse",
    betrag: websitePaket?.amount ?? null,
    einstiegHref: "/leistungen#pakete",
    belegHref: "/barrierefreiheit",
    belegArt: "eigenpruefung",
    bedingung: false,
  },
  {
    /*
     * WEB-0004, erste Haelfte. Der Einstieg existierte — er stand nur nirgends
     * an der Ebene: die laufende Betreuung, Betrag bestaetigt, eigene Route,
     * sieben benannte Bestandteile. Die Bedingung (`retainer.precondition`)
     * gehoert davor und nicht ins Kleingedruckte.
     */
    layer: "operations",
    art: retainer.amount === null ? "nach-analyse" : "monatlich",
    betrag: retainer.amount,
    einstiegHref: "/betrieb",
    belegHref: "/produkte/fibero",
    belegArt: "produkt",
    bedingung: true,
  },
  {
    layer: "automation",
    art: "nach-analyse",
    betrag: null,
    einstiegHref: "/leistungen/ki-automatisierung",
    belegHref: null,
    belegArt: null,
    bedingung: false,
  },
  {
    /*
     * WEB-0004, zweite Haelfte — und die ehrlichste Zeile der Seite.
     *
     * Fuer Intelligence gibt es keinen bestaetigten Preis und keine
     * Leistungsseite. Was es gibt, ist ein definierter erster Schritt (das
     * Systemgespraech, dieselbe Strecke wie in der Fusszeile) und ein Beleg,
     * den sonst niemand hat: meAI laeuft, ist selbst gebaut und wird im
     * eigenen Betrieb benutzt.
     *
     * Damit hat die Ebene, was ihr fehlte — ein Ziel, einen Ablauf und einen
     * Beleg. Was ihr weiterhin fehlt, ist eine Zahl, und die kommt vom Owner
     * (OD-6) oder gar nicht.
     */
    layer: "intelligence",
    art: "nach-analyse",
    betrag: null,
    einstiegHref: "/termin?art=systemgespraech",
    belegHref: "/produkte/meai",
    belegArt: "produkt",
    bedingung: false,
  },
]

/** Einstieg einer Ebene. `undefined` waere ein Loch — deshalb der Gate-Check. */
export function einstiegFuer(layer: ServiceLayerKey): EbenenEinstieg | undefined {
  return ebenenEinstiege.find((e) => e.layer === layer)
}

/**
 * Jede Ebene hat genau einen Einstieg — die Bedingung, die
 * `scripts/check-einstiege.mjs` prueft. Sie steht hier als ausfuehrbarer Satz,
 * damit sie nicht nur in einem Dokument behauptet wird.
 */
export const alleEbenenHabenEinstieg = serviceLayers.every((l) =>
  ebenenEinstiege.some((e) => e.layer === l.key),
)

/**
 * Ebenen, die heute keinen bestaetigten Betrag haben. Genau diese Liste steht
 * als offener Punkt auf `/status` und als OD-6 in den Owner-Entscheidungen.
 */
/**
 * Ebenen ohne zeigbaren Beleg. Heute `identity` und `automation` — beides
 * Ebenen, fuer die es weder ein eigenes Produkt noch eine veroeffentlichte
 * Pruefung gibt. Die Liste ist der Grund, warum WEB-0001 bei Gate 02 liegt.
 */
export const ebenenOhneBeleg = ebenenEinstiege
  .filter((e) => e.belegHref === null)
  .map((e) => e.layer)

export const ebenenOhneBetrag = ebenenEinstiege
  .filter((e) => e.betrag === null)
  .map((e) => e.layer)

/**
 * Leistungsseiten einer Ebene. Schon vorher moeglich, aber viermal im Markup
 * ausgeschrieben — hier einmal, damit „welche Ebene hat wie viele Seiten"
 * eine Antwort hat und nicht vier.
 */
export function seitenFuer(layer: ServiceLayerKey) {
  return publishedServicePages.filter((page) => page.layer === layer)
}
