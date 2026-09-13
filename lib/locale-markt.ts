import type { Locale } from "@/lib/dictionary"
import { DEFAULT_LOCALE, locales } from "@/lib/routes"

/**
 * LOCALE INTELLIGENCE — welche Sprache ein Erstbesucher bekommt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE EINE REGEL, DIE ALLES ANDERE SCHLAEGT
 *
 *     Der Mensch entscheidet. Die Erkennung raet nur.
 *
 * Deshalb steht die gespeicherte Wahl ganz oben und die Herkunft ganz unten.
 * Wer einmal umgeschaltet hat, wird nie wieder umgeleitet — auch nicht, wenn
 * er aus einem Land kommt, dessen Markt eine andere Sprache nahelegt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIE BROWSERSPRACHE UEBER DER HERKUNFT STEHT
 *
 * Ein Land sagt, wo jemand gerade ist. Eine Browsersprache sagt, was er
 * lesen will. Das Zweite ist die bessere Auskunft: Ein Tuerke auf
 * Geschaeftsreise in Frankfurt liest weiter Tuerkisch, und ein Deutscher in
 * Dubai liest weiter Deutsch.
 *
 * Die Herkunft ist deshalb nur der Rueckfall, wenn die Browsersprache keine
 * der vier unterstuetzten nennt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER ABSICHTLICH NICHT PASSIERT
 *
 * Keine Karte der Welt nach Gefuehl. Ein Land steht nur dann in einer
 * Liste, wenn seine Amtssprache eine der vier ist, die diese Seite
 * wirklich spricht.
 *
 * Besonders: Aserbaidschanisch, Kasachisch, Usbekisch, Turkmenisch und
 * Kirgisisch sind NICHT Tuerkisch. Sie sind verwandt, und genau deshalb ist
 * der Fehler so verfuehrerisch. Wer Baku automatisch auf Tuerkisch schickt,
 * behandelt eine eigene Sprache als Dialekt — und liegt dabei auch praktisch
 * falsch. Diese Laender fallen auf Englisch, es sei denn, die Browsersprache
 * sagt ausdruecklich `tr`.
 *
 * Dasselbe gilt fuer die Schweiz: Sie ist kein deutschsprachiges Land,
 * sondern ein viersprachiges. Ohne Browsersprache waere jede Zuordnung
 * geraten — siehe `SCHWEIZ`.
 */

/** Laender, deren Markt auf Deutsch laeuft. */
const DEUTSCH = ["DE", "AT", "LI"] as const

/**
 * Laender mit arabischer Amtssprache.
 *
 * Die Liste ist bewusst lang und bewusst begruendbar: Jeder Eintrag hat
 * Arabisch als Amts- oder Ko-Amtssprache. Sie ist keine geopolitische
 * Aussage, sondern eine sprachliche.
 */
const ARABISCH = [
  "SA", "AE", "QA", "KW", "BH", "OM", "YE", "JO", "LB", "SY", "IQ", "PS",
  "EG", "LY", "TN", "DZ", "MA", "MR", "SD", "SO", "DJ", "KM", "TD",
] as const

/** Laender, deren Markt auf Tuerkisch laeuft. */
const TUERKISCH = ["TR"] as const

/**
 * Die Schweiz bekommt keine feste Sprache.
 *
 * Deutsch fuehrt dort nur, wenn die Browsersprache das sagt. Franzoesisch
 * und Italienisch sprechen wir nicht — fuer diese Faelle ist Englisch die
 * ehrlichere Antwort als ein Deutsch, das der Leser nicht gewaehlt hat.
 */
const SCHWEIZ = "CH"

/** Ist dieses Kuerzel eine Sprache, die wir wirklich sprechen? */
function unterstuetzt(code: string): Locale | null {
  const kurz = code.trim().toLowerCase().split("-")[0]
  return (locales as readonly string[]).includes(kurz) ? (kurz as Locale) : null
}

/**
 * Die erste unterstuetzte Sprache aus einem `Accept-Language`-Kopf.
 *
 * Der Kopf ist nach Gewicht sortiert (`de;q=0.9`), und genau diese
 * Reihenfolge ist die Aussage des Nutzers. Wir lesen sie von vorne und
 * nehmen die erste, die wir bedienen koennen — statt nach der „besten"
 * Uebereinstimmung zu suchen, die niemand so gemeint hat.
 */
export function ausBrowsersprache(header: string | null | undefined): Locale | null {
  if (!header) return null
  for (const teil of header.split(",")) {
    const treffer = unterstuetzt(teil.split(";")[0] ?? "")
    if (treffer) return treffer
  }
  return null
}

/**
 * Nennt dieser Kopf ueberhaupt eine Sprache?
 *
 * `Accept-Language: *` heisst woertlich „egal". Werkzeuge und Crawler
 * schicken genau das — Node selbst tut es, was diesen Fall im Drill
 * aufgedeckt hat. Ein „egal" ist kein Sprachwunsch, und wo kein Wunsch ist,
 * wird nicht geraten: Die Herkunft allein soll niemandem eine Sprache
 * aufdraengen, der keine genannt hat.
 */
export function nenntSprache(header: string | null | undefined): boolean {
  if (!header) return false
  return header
    .split(",")
    .map((t) => (t.split(";")[0] ?? "").trim())
    .some((t) => t.length > 0 && t !== "*")
}

/** Die Sprache, die ein Land nahelegt — ohne Browsersprache. */
export function ausHerkunft(land: string | null | undefined): Locale | null {
  if (!land) return null
  const l = land.trim().toUpperCase()
  if ((DEUTSCH as readonly string[]).includes(l)) return "de"
  if ((ARABISCH as readonly string[]).includes(l)) return "ar"
  if ((TUERKISCH as readonly string[]).includes(l)) return "tr"
  /* Die Schweiz und alles Uebrige: keine Aussage. */
  return null
}

/**
 * Die Entscheidung.
 *
 * Reihenfolge, und sie ist der ganze Punkt:
 *
 *   1 · was der Mensch gewaehlt hat
 *   2 · was sein Browser lesen will
 *   3 * was sein Land nahelegt
 *   4 · Englisch
 *
 * Die Schweiz erscheint in Schritt 3 nie — sie faellt auf Englisch, sofern
 * Schritt 2 nicht ohnehin Deutsch gesagt hat.
 */
export function spracheFuer(eingabe: {
  gespeichert?: string | null
  browsersprache?: string | null
  land?: string | null
}): Locale {
  const gewaehlt = eingabe.gespeichert ? unterstuetzt(eingabe.gespeichert) : null
  if (gewaehlt) return gewaehlt

  const browser = ausBrowsersprache(eingabe.browsersprache)
  if (browser) return browser

  const land = (eingabe.land ?? "").trim().toUpperCase()
  if (land === SCHWEIZ) return "en"

  return ausHerkunft(land) ?? "en"
}

/**
 * Die Reihenfolge im Sprachumschalter.
 *
 * Sie folgt dem Markt, nicht dem Alphabet: Wer in Riad sitzt, findet
 * Arabisch zuerst und danach Englisch — nicht Deutsch, das er mit hoher
 * Wahrscheinlichkeit nicht liest.
 *
 * Englisch steht ueberall an zweiter Stelle, wo es nicht schon fuehrt. Es
 * ist die Sprache, auf die zwei Menschen ohne gemeinsame Muttersprache
 * ausweichen.
 */
export function umschalterReihenfolge(aktiv: Locale): Locale[] {
  const ordnungen: Record<Locale, Locale[]> = {
    de: ["de", "en", "tr", "ar"],
    ar: ["ar", "en", "tr", "de"],
    tr: ["tr", "en", "ar", "de"],
    en: ["en", "de", "tr", "ar"],
  }
  return ordnungen[aktiv] ?? ordnungen[DEFAULT_LOCALE]
}

/** Der Name des Kekses, in dem die ausdrueckliche Wahl liegt. */
export const LOCALE_COOKIE = "creadig-locale"

/**
 * Ein Jahr.
 *
 * Kuerzer waere eine Schikane: Wer seine Sprache einmal gewaehlt hat, will
 * sie nicht jeden Monat neu waehlen. Laenger waere eine Anmassung.
 */
export const LOCALE_COOKIE_MAXALTER = 60 * 60 * 24 * 365
