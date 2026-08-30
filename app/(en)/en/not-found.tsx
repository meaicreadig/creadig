import type { Metadata } from "next"
import { StatusPageBody } from "@/components/pages/status-page-body"
import { dictionary } from "@/lib/dictionary"

/**
 * BF-3 — die türkische 404-Seite.
 *
 * Sie liegt unter `tr/` und nicht in der Gruppe `(tr)`: Nur so greift sie für
 * alles unterhalb von `/tr/…`. Ohne sie fiele eine unbekannte türkische
 * Adresse auf die deutsche Fassung zurück — deutsche Überschrift über
 * türkischem `<html lang="tr">`.
 */
const copy = dictionary.tr.errorPages.notFound

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
    <StatusPageBody locale="en" eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />
  )
}
