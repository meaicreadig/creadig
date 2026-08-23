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
 * Wer hier `TR_PREFIX` ändert, ändert Routing, Navigation, Sitemap, Canonicals
 * und hreflang zugleich. Keine zweite Stelle darf `"/tr"` selbst
 * zusammensetzen.
 */
export const TR_PREFIX = "/tr"

/**
 * Domain-ready wie überall sonst: eine Variable steuert alle absoluten URLs.
 * Der Umzug auf creadig.de ist damit eine Umgebungsvariable, kein Rebuild.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"

/** Alle Sprachen, in denen die Seite ausgeliefert wird — Reihenfolge = Rang. */
export const locales = ["de", "tr"] as const

/**
 * Deutscher Pfad → Pfad in der Zielsprache.
 *
 * Alles, was nicht mit `/` anfängt, bleibt unangetastet: `mailto:`, `tel:`,
 * `https://` und reine Anker (`#pakete`) sind keine Seitenpfade und dürfen
 * kein Sprachpräfix bekommen.
 */
export function localePath(path: string, locale: Locale): string {
  if (locale === "de") return path
  if (!path.startsWith("/")) return path
  if (path === "/") return TR_PREFIX
  return `${TR_PREFIX}${path}`
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
  if (pathname === TR_PREFIX) return { locale: "tr", path: "/" }
  if (pathname.startsWith(`${TR_PREFIX}/`)) {
    return { locale: "tr", path: pathname.slice(TR_PREFIX.length) }
  }
  return { locale: "de", path: pathname }
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
  return {
    canonical: localePath(path, locale),
    languages: {
      de: path,
      tr: localePath(path, "tr"),
      "x-default": path,
    },
  }
}

/** `de_DE` / `tr_TR` für OpenGraph. */
export const openGraphLocale: Record<Locale, string> = {
  de: "de_DE",
  tr: "tr_TR",
}
