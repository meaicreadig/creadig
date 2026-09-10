import type { Metadata } from "next"
import { StatusPageBody } from "@/components/pages/status-page-body"
import { dictionary } from "@/lib/dictionary"

/**
 * Die englische 404-Seite.
 *
 * ---------------------------------------------------------------------------
 * WEB-0010 — SIE HAT ANDERTHALB JAHRE LANG TUERKISCH GESPROCHEN.
 *
 * Diese Datei ist aus der tuerkischen Fassung kopiert worden, und mitkopiert
 * wurde die Zeile darunter: `dictionary.tr.errorPages.notFound`. Der
 * Kommentar hier oben sagte es sogar — „die tuerkische 404-Seite" — und stand
 * trotzdem ueber der englische Route.
 *
 * Gemessen am 11.09.2026 an `/en/produkte/gibtesnicht`: Der Titel lautete
 * „Sayfa bulunamadı · creaDIG". `StatusPageBody` bekam korrekt `locale="en"`,
 * die Texte kamen aus dem falschen Woerterbuch — das ist der Grund, warum es
 * keinem Typpruefer auffiel: Beide Zweige haben dieselbe Form.
 *
 * ---------------------------------------------------------------------------
 * WAS DAS FUER DEN ORT DER DATEI HEISST
 * Sie liegt unter `en/` und nicht in der Gruppe `(en)`: Nur so greift sie fuer
 * alles unterhalb von `/en/…`. Ohne sie fiele eine unbekannte Adresse auf die
 * deutsche Fassung zurueck — deutsche Ueberschrift ueber `<html lang="en">`.
 */
const copy = dictionary.en.errorPages.notFound

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
