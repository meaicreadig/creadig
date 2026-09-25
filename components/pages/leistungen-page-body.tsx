"use client"

import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Services } from "@/components/sections/services"
import { Packages } from "@/components/sections/packages"
import { Faq } from "@/components/sections/faq"
import { ClosingCta } from "@/components/sections/closing-cta"

/**
 * Körper der Leistungs-Übersicht.
 *
 * Zweisprachig, deshalb Client-Komponente — Titel, Description und die
 * strukturierten Daten liefert die Server-Seite darüber.
 *
 * Die Reihenfolge folgt der Frage, in der jemand liest: Was können Sie? (die
 * fünf Ebenen) → Was ist noch offen? (FAQ) → Was kostet das? (Pakete).
 *
 * Pakete und FAQ standen bis PHASE A auf der Startseite. Sie sind dort nicht
 * gestrichen worden, sie sind hierher gezogen: Eine Preistabelle auf der
 * Startseite macht ein System-Haus zur produktisierten Agentur — hier, eine
 * Ebene tiefer, steht sie am richtigen Ort.
 */
export function LeistungenPageBody() {
  const { t } = useLocale()

  return (
    <main>
      <PageHeader
        eyebrow={t.leistungenPage.eyebrow}
        title={t.leistungenPage.title}
        crumbLabel={t.nav.leistungen}
        lead={t.leistungenPage.lead}
      >
        {/*
          Die Kategorie (KIZILELMA §10.1) steht VOR dem Preis-Rahmen und nicht
          darunter: Wer nicht weiss, was fuer ein Haus das ist, liest jede
          Preisangabe als die einer Agentur.
        */}
        <div className="border-line mt-12 border-t pt-6">
          <p className="eyebrow text-gold-text">{t.brand.categoryLabel}</p>
          <p className="type-statement mt-4 max-w-3xl text-balance">{t.brand.category}</p>
        </div>

        {/* Kategorie-Korrektur (§7): der Preis-Rahmen als Satz, nicht als Tabelle. */}
        <div className="border-line mt-10 border-t pt-6">
          <p className="eyebrow text-gold-text">{t.leistungenPage.pricingLabel}</p>
          <p className="type-body text-foreground/85 mt-4 max-w-2xl text-pretty">
            {t.leistungenPage.pricingNote}
          </p>
        </div>
      </PageHeader>

      {/* Die H1 steht im Kopf — die Ebenen kommen ohne zweite Überschrift. */}
      <Services heading={false} />
      {/*
        W2 — DIE SEITE HALBIERT (gemessen 2.266 Woerter im Hauptteil).

        Gegangen sind drei Sektionen, die jeweils eine zweite Ordnung neben die
        Preistabelle stellten: „Drei Wege zu einem Preis" (Kaufwege), der
        Managed Betrieb mit seinen sieben Punkten (steht vollstaendig auf
        /betrieb) und der dreistufige Ablauf (die FAQ beantwortet „Wie laeuft
        ein Projekt ab?" in zwei Saetzen). Es bleibt EINE Preistabelle aus
        `lib/offers.ts` — Website, Pilotplatz, Pruefung, Betreuung, und der
        Weg fuer alles Groessere.
      */}
      <Faq />
      <Packages />
      {/* MP10-2 (Zusatz) — hier steht der Abschluss unmittelbar unter der
          Preistabelle. „Projekt starten" waere die dritte Schaltflaeche mit
          derselben Aufschrift; „Festpreis-Angebot anfragen" ist der Schritt,
          der auf das Gelesene folgt. */}
      <ClosingCta variant="prices" />
    </main>
  )
}
