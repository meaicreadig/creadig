import type { Metadata } from "next"
import { StatusPageBody } from "@/components/pages/status-page-body"
import { dictionary } from "@/lib/dictionary"

/**
 * BF-3 — die deutsche 404-Seite.
 *
 * Sie liegt in der Sprachgruppe und nicht unter `app/`: Damit rendert sie
 * innerhalb von `DeLayout`, also mit Navigation, Fußzeile und Erscheinungsbild.
 * Eine 404-Seite ohne Navigation ist eine Sackgasse mit Logo.
 *
 * Erreicht wird sie über `app/(de)/[...notfound]/page.tsx` (jede unbekannte
 * Adresse) und über jedes `notFound()` aus dem deutschen Baum — etwa aus einer
 * Detailseite mit unbekanntem Slug.
 */
const copy = dictionary.de.errorPages.notFound

export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.metaDescription,
  robots: { index: false, follow: true },
}

/*
 * EIN UMWEG, DER SICH ERST IM BILD ZEIGTE
 * Zwischendurch stand hier ein eigenes `SiteShell`, weil das Server-HTML
 * dieser Seite weder <html lang> noch <nav> noch <footer> enthaelt: Next
 * liefert bei `notFound()` in einem Projekt mit ZWEI Wurzel-Layouts nur eine
 * Huelle aus und reicht den Inhalt als Stream nach. Aus dem gelieferten HTML
 * allein sah es also so aus, als fehle das Layout.
 *
 * Der erste Bildersatz aus `npm run shots` (D-1) hat es widerlegt: Auf dem
 * Bild stand die Fusszeile ZWEIMAL. Das Layout greift also sehr wohl — nur
 * eben erst im Browser. Das eigene Geruest war ein zweites obendrauf.
 *
 * Genau dafuer gibt es den Bildersatz: Diesen Fehler haette kein `curl` und
 * kein Typpruefer gefunden.
 */
export default function NotFound() {
  return (
    <StatusPageBody locale="de" eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />
  )
}
