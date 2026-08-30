import type { Metadata } from "next"
import { dictionary, type Locale } from "@/lib/dictionary"
import { SITE_URL, localeAlternates, localeUrl, locales, openGraphLocale } from "@/lib/routes"

/**
 * T-1 / SEO-1 — die Kopfdaten jeder Unterseite, an einer Stelle.
 *
 * ---------------------------------------------------------------------------
 * DER FEHLER, DEN ES BESEITIGT
 * Jede Unterseite baute ihre Kopfdaten selbst zusammen: Titel, Beschreibung,
 * Canonical, `openGraph` mit Titel, Beschreibung, Adresse und Sprache. Elf Mal
 * fast dieselben zwanzig Zeilen. Was in keiner davon stand, war das
 * Vorschaubild — und weil ein eigenes `openGraph`-Objekt das der Ebene darüber
 * ERSETZT, fiel damit auch das Bild aus der Dateikonvention heraus.
 *
 * Gemessen an der gebauten Seite: `/leistungen`, `/produkte`, `/arbeiten`,
 * `/kontakt`, `/unternehmen`, `/termin`, `/insights`, `/produkte/meai` und der
 * gesamte `/tr/`-Baum lieferten kein `og:image`. Wer einen dieser Links in
 * WhatsApp schickte — und das ist bei dieser Zielgruppe der Regelfall —
 * verschickte einen grauen Kasten mit einer URL.
 *
 * ---------------------------------------------------------------------------
 * WARUM EIN HELFER UND NICHT ELF ERGÄNZUNGEN
 * Elf Stellen um `images` zu ergänzen wäre die schnellere Antwort und die
 * schlechtere: Die zwölfte Seite, die jemand in vier Wochen anlegt, hat es
 * wieder nicht. Hier hat sie es automatisch, und wer eine Regel ändert, ändert
 * sie für alle.
 *
 * Die Bildadresse ist bewusst eine feste Route (`/og/de.png`, `/og/tr.png`)
 * und nicht die gestreute Adresse der Dateikonvention — begründet in
 * `app/og/de.png/route.tsx`.
 */

const OG_IMAGE_PATH: Record<Locale, string> = { de: "/og/de.png", tr: "/og/tr.png", en: "/og/en.png" }

/** 1200 × 630 — das Maß, das WhatsApp, LinkedIn und X als große Karte zeigen. */
export function ogImage(locale: Locale) {
  return [
    {
      url: `${SITE_URL}${OG_IMAGE_PATH[locale]}`,
      width: 1200,
      height: 630,
      alt: dictionary[locale].meta.ogImageAlt,
    },
  ]
}

export function pageMetadata({
  locale,
  /** Der DEUTSCHE Pfad. Das Präfix setzt `localePath`, nicht der Aufrufer. */
  path,
  title,
  description,
  /** „article" für Detailseiten, sonst „website". */
  type = "website",
  /** Suchmaschinen von einer Seite fernhalten (Rechtstexte, Fehlerseiten). */
  noIndex = false,
}: {
  locale: Locale
  path: string
  title: string
  description: string
  type?: "website" | "article"
  noIndex?: boolean
}): Metadata {
  return {
    title,
    description,
    alternates: localeAlternates(path, locale),
    openGraph: {
      title: `${title} · creaDIG`,
      description,
      url: localeUrl(path, locale),
      locale: openGraphLocale[locale],
      /*
       * Gate 3 — bis hierher stand hier `locale === "de" ? "tr" : "de"`: bei
       * zwei Sprachen ist „die andere" eindeutig, bei dreien nicht mehr.
       * OpenGraph erlaubt mehrere `alternateLocale`; hier stehen alle
       * gepflegten ausser der eigenen.
       */
      alternateLocale: locales.filter((l) => l !== locale).map((l) => openGraphLocale[l]),
      siteName: "creaDIG",
      type,
      images: ogImage(locale),
    },
    /*
     * Ohne diesen Block zeigt X eine kleine quadratische Vorschau statt der
     * grossen Karte — dasselbe Bild, ein Viertel der Wirkung.
     */
    twitter: {
      card: "summary_large_image",
      title: `${title} · creaDIG`,
      description,
      images: ogImage(locale),
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  }
}
