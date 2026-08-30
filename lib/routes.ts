import type { Locale } from "@/lib/dictionary"

/**
 * GROW-1 — die Sprache steht in der URL, nicht im Browser.
 *
 * ---------------------------------------------------------------------------
 * WAS VORHER FALSCH WAR
 * Die türkische Fassung existierte, aber nur im Browser: `dictionary.tr` wurde
 * nach der Hydration eingeblendet, die URL blieb dieselbe. Damit gab es für
 * Google keine türkische Seite — ein Crawler sieht das Server-HTML, und das
 * war deutsch. Ein halbes Jahr Übersetzungsarbeit lag hinter einem Schalter,
 * den nur findet, wer schon da ist.
 *
 * Dazu kam: Ein türkischer Link ließ sich nicht weitergeben. `/leistungen`
 * öffnete beim Empfänger deutsch, egal was der Absender gesehen hatte.
 *
 * ---------------------------------------------------------------------------
 * WIE ES JETZT LÄUFT
 * Jede Seite hat zwei Adressen: `/leistungen` (deutsch) und `/tr/leistungen`
 * (türkisch). Beide werden zur Bauzeit statisch erzeugt, beide in ihrer
 * eigenen Sprache — inklusive `<html lang>`, Titel, Beschreibung und
 * strukturierten Daten. `hreflang` verbindet sie, damit Google weiß, dass es
 * dieselbe Seite in zwei Sprachen ist und nicht doppelter Inhalt.
 *
 * Deutsch bleibt ohne Präfix. Das ist Absicht und keine Bequemlichkeit:
 * Schwerpunkt ist Deutschland, und ein Umzug aller deutschen Adressen nach
 * `/de/` würde jede bestehende Verlinkung brechen, um ein Präfix zu gewinnen,
 * das niemand braucht.
 *
 * ---------------------------------------------------------------------------
 * DIESE DATEI IST DIE EINZIGE STELLE, DIE DAS WEISS
 * Wer hier die Sprachliste ändert, ändert Routing, Navigation, Sitemap,
 * Canonicals und hreflang zugleich. Keine zweite Stelle darf ein Präfix
 * selbst zusammensetzen.
 *
 * ---------------------------------------------------------------------------
 * WARUM HIER NICHTS MEHR "TR" HEISST  (30.08.2026)
 * Bis hierher stand in dieser Datei fünfmal `TR_PREFIX` und einmal eine
 * Tabelle `TR_PATHS` — die Zweisprachigkeit war in die LOGIK geschrieben,
 * nicht in die DATEN. Eine dritte Sprache hätte deshalb nicht bedeutet, einen
 * Eintrag zu ergänzen, sondern vier Funktionen umzubauen: `localePath`,
 * `splitLocale`, `localeAlternates`, `openGraphLocale` — jede mit eigenen
 * Sonderfällen, jede eine eigene Gelegenheit für einen 404.
 *
 * Jetzt leiten alle vier aus `locales` ab. Eine Sprache hinzuzufügen ist ein
 * Eintrag in dieser Liste plus ihr Wörterbuch; an der Logik ändert sich
 * nichts. Das ist bewusst VOR den Inhalten geschehen: den Umbau später
 * gleichzeitig mit 15 000 Wörtern neuer Übersetzung zu machen, hiesse zwei
 * Fehlerquellen zu einer zu verrühren.
 *
 * Was das NICHT tut: eine Sprache veröffentlichen. `locales` bleibt
 * `["de","tr"]`, weil es genau zwei vollständige Wörterbücher gibt. Die
 * Typen erzwingen das — `Localized<T>` verlangt einen Eintrag je Sprache,
 * eine halbe Sprache lässt sich gar nicht erst bauen. Genau so soll es sein
 * (Canon: „Keine Sprache halb veröffentlichen").
 */

/** Deutsch trägt kein Präfix — Schwerpunktmarkt, und jede bestehende Adresse bleibt gültig. */
export const DEFAULT_LOCALE = "de" satisfies Locale

/**
 * Das Adresspräfix einer Sprache. Die Default-Sprache hat keins.
 * Einzige Stelle, an der ein Präfix entsteht.
 */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`
}

/** @deprecated Nur noch für `app/global-error.tsx`. Neuer Code nimmt `localePrefix`. */
export const TR_PREFIX = "/tr"

/**
 * Domain-ready wie überall sonst: eine Variable steuert alle absoluten URLs.
 * Der Umzug auf creadig.de ist damit eine Umgebungsvariable, kein Rebuild.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"

/** Alle Sprachen, in denen die Seite ausgeliefert wird — Reihenfolge = Rang. */
export const locales = ["de", "tr", "en"] as const

/**
 * Deutscher Pfad → Pfad in der Zielsprache.
 *
 * Alles, was nicht mit `/` anfängt, bleibt unangetastet: `mailto:`, `tel:`,
 * `https://` und reine Anker (`#pakete`) sind keine Seitenpfade und dürfen
 * kein Sprachpräfix bekommen.
 */
/*
 * BF-A4 — die eine Adresse, deren Wort sich uebersetzt.
 *
 * Regel im Projekt: Slugs bleiben in beiden Sprachen gleich (siehe
 * app/_routes/leistung-detail.tsx). Uebersetzte Slugs sind huebscher, machen
 * aber aus jedem Sprachwechsel eine Uebersetzungstabelle, die jemand pflegen
 * muss — und aus jedem vergessenen Eintrag einen 404.
 *
 * Genau eine Ausnahme: die Erklaerung zur Barrierefreiheit. Sie ist der
 * einzige Ort, an dem ein tuerkischsprachiger Besucher nach dem WORT sucht,
 * nicht nach dem Weg — „erisilebilirlik" ist der Begriff, unter dem er sie
 * erwartet. Die Tabelle steht deshalb hier, in der einzigen Datei, die vom
 * Sprachpraefix weiss, und nicht verstreut in den Routen.
 */
const TRANSLATED_PATHS: Partial<Record<Locale, Record<string, string>>> = {
  tr: { "/barrierefreiheit": "/erisilebilirlik" },
}

/** Umgekehrte Tabellen je Sprache — fuer `splitLocale`. */
const SOURCE_PATHS: Partial<Record<Locale, Record<string, string>>> = Object.fromEntries(
  Object.entries(TRANSLATED_PATHS).map(([locale, table]) => [
    locale,
    Object.fromEntries(Object.entries(table).map(([source, target]) => [target, source])),
  ]),
)

/** Trennt Anker und Suchparameter ab; die gehoeren nicht in die Tabelle. */
function splitSuffix(path: string): [string, string] {
  const cut = path.search(/[?#]/)
  return cut === -1 ? [path, ""] : [path.slice(0, cut), path.slice(cut)]
}

export function localePath(path: string, locale: Locale): string {
  const prefix = localePrefix(locale)
  if (prefix === "") return path
  if (!path.startsWith("/")) return path
  if (path === "/") return prefix
  const [bare, suffix] = splitSuffix(path)
  return `${prefix}${TRANSLATED_PATHS[locale]?.[bare] ?? bare}${suffix}`
}

/** Wie `localePath`, nur absolut — für Canonicals, Sitemap und JSON-LD. */
export function localeUrl(path: string, locale: Locale): string {
  const localised = localePath(path, locale)
  return localised === "/" ? `${SITE_URL}/` : `${SITE_URL}${localised}`
}

/**
 * Umgekehrt: Aus einem laufenden Pfad die Sprache und den deutschen
 * Basispfad lesen. Braucht die Navigation, um zu wissen, welcher Menüpunkt
 * aktiv ist und wohin der Sprachschalter führt.
 *
 * `/tr` allein ist die türkische Startseite, also Basispfad `/` — nicht der
 * leere String, sonst zeigt der Schalter ins Nichts.
 */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  for (const locale of locales) {
    const prefix = localePrefix(locale)
    if (prefix === "") continue
    if (pathname === prefix) return { locale, path: "/" }
    if (pathname.startsWith(`${prefix}/`)) {
      const [bare, suffix] = splitSuffix(pathname.slice(prefix.length))
      return { locale, path: `${SOURCE_PATHS[locale]?.[bare] ?? bare}${suffix}` }
    }
  }
  return { locale: DEFAULT_LOCALE, path: pathname }
}

/**
 * Der hreflang-Block für `metadata.alternates`.
 *
 * `canonical` zeigt auf die eigene Sprachfassung — sonst erklärt die
 * türkische Seite die deutsche zum Original und verschwindet aus dem Index.
 * `x-default` zeigt auf Deutsch: Wer keiner der beiden Sprachen zugeordnet
 * werden kann, landet in der Sprache des Schwerpunktmarkts.
 *
 * `path` ist immer der DEUTSCHE Pfad (`/leistungen`); das Präfix setzt diese
 * Funktion.
 */
export function localeAlternates(path: string, locale: Locale) {
  /*
    Ein hreflang-Ziel darf nie ins Leere zeigen. Weil die Liste aus `locales`
    entsteht und eine Sprache erst dort steht, wenn sie ein vollstaendiges
    Woerterbuch hat, kann hier keine Adresse auftauchen, die es nicht gibt.
  */
  const languages: Record<string, string> = {}
  for (const other of locales) languages[other] = localePath(path, other)
  languages["x-default"] = localePath(path, DEFAULT_LOCALE)

  return { canonical: localePath(path, locale), languages }
}

/**
 * OpenGraph erwartet `sprache_LAND`. Fuer die gepflegten Sprachen steht das
 * Land hier explizit — es laesst sich nicht zuverlaessig aus dem Sprachcode
 * ableiten (Arabisch hat kein "AR"-Land, Englisch ein Dutzend).
 */
export const openGraphLocale: Record<Locale, string> = {
  de: "de_DE",
  tr: "tr_TR",
  en: "en_GB",
}
