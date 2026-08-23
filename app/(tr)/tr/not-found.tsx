import type { Metadata } from "next"
import { SiteShell } from "@/components/site-shell"
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
 * WARUM HIER `SiteShell` STEHT UND NICHT DAS LAYOUT GREIFT
 * Next rendert eine `not-found`-Seite in einem Projekt mit MEHREREN
 * Wurzel-Layouts ohne jedes Layout — geprueft gegen `next start`: kein
 * <html lang>, kein <nav>, kein <footer>, nur der nackte Inhalt. Genau das
 * ist der englische Standard-Bildschirm, den BF-3 abschaffen soll.
 *
 * Deshalb rendert diese Seite das Geruest selbst. Sie bekommt damit dieselbe
 * Navigation, dieselbe Fusszeile, dieselben Schriften und dasselbe
 * <html lang> wie jede andere Seite — und behaelt den Status 404, den
 * `notFound()` gesetzt hat.
 */
export default function NotFound() {
  return (
    <SiteShell locale="tr">
      <StatusPageBody locale="tr" eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />
    </SiteShell>
  )
}
