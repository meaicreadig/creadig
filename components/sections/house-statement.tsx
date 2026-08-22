"use client"

import { useLocale } from "@/components/locale-provider"
import { EditorialSection } from "@/components/ui/editorial-section"

/**
 * „creaDIG in einem Satz" (PHASE A, Master-Prompt 4 §4.2).
 *
 * Die zweite Sektion der Verteiler-Startseite — und die erste Pause nach dem
 * Hero. Sie trägt jetzt den Editorial-Archetyp (VIS-2, siehe
 * `components/ui/editorial-section.tsx`): Vorher stand hier derselbe
 * 12-Spalten-Kopf mit Gold-Eyebrow wie in den sechs Sektionen darunter — die
 * „ruhige Fläche", die der Kommentar an dieser Stelle versprach, war also
 * genau so getaktet wie alles andere.
 *
 * Das System-Diagramm (Marke → Digital → Operations → Automatisierung → KI)
 * gehört an diese Stelle, kommt aber in PHASE C. Es hier vorab als Textzeile
 * zu simulieren wäre die schlechtere Zwischenlösung: Die Kacheln der
 * Capabilities weiter unten sagen dasselbe schon.
 */
export function HouseStatement() {
  const { t } = useLocale()
  const copy = t.home.statement

  return (
    <EditorialSection
      id="haltung"
      eyebrow={copy.eyebrow}
      title={copy.title}
      body={copy.body}
      cta={copy.cta}
      href="/unternehmen"
    />
  )
}
