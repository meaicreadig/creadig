"use client"

import { useLocale } from "@/components/locale-provider"
import { EditorialSection } from "@/components/ui/editorial-section"

/**
 * Das Unternehmen — kurz (PHASE A, Master-Prompt 4 §4.9).
 *
 * Die ausführliche „Über uns"-Sektion mit Gründer, Netzwerk, Schwerpunkten
 * und Ehrlichkeits-Satz lebt auf /unternehmen. Hier steht der Anriss.
 *
 * Zweiter Träger des Editorial-Archetyps (VIS-2) und damit die zweite Pause
 * der Seite — bewusst gegen Ende, kurz bevor das Abschluss-Band kommt. Zwei
 * ruhige Flächen an Position 2 und 8 gliedern den Scroll in drei Kapitel;
 * vorher lief er in einer einzigen Lautstärke durch.
 *
 * VIS-5 — hier standen bis vor Kurzem dieselben vier Signale noch einmal, die
 * das Impact-Band schon als Bühne zeigt. Zwei Darstellungen derselben vier
 * Aussagen auf einer Seite lesen sich nicht als Betonung, sondern als
 * Wiederholung. Die Signale gehören ins Fundament-Band — dort haben sie Platz
 * und Kontext. Hier steht, was nur hier steht.
 */
export function CompanyTeaser() {
  const { t } = useLocale()
  const copy = t.home.company

  return (
    <EditorialSection
      id="unternehmen"
      eyebrow={copy.eyebrow}
      title={copy.title}
      body={copy.body}
      cta={copy.cta}
      href="/unternehmen"
    />
  )
}
