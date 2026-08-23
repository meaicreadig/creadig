import type { Metadata } from "next"
import { SiteShell } from "@/components/site-shell"
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
    <SiteShell locale="de">
      <StatusPageBody locale="de" eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />
    </SiteShell>
  )
}
