"use client"

import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Services } from "@/components/sections/services"
import { ManagedOperations } from "@/components/sections/managed-operations"
import { Process } from "@/components/sections/process"
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
 * fünf Ebenen) → Wie läuft das? (Prozess und die vier operativen Schritte) →
 * Was kostet das? (Pakete) → Und die Fragen, die dann noch offen sind (FAQ).
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
        Der Betrieb steht direkt unter der Pyramide — er ist die Schicht, die
        quer unter allen fuenf Ebenen liegt, nicht die sechste Stufe darin
        (KIZILELMA §10.1). Danach erst der Ablauf: Was gebaut wird, dann was
        laufend gilt, dann wie es zustande kommt.
      */}
      <ManagedOperations />
      <Process />
      {/*
        MP10-2.2 — DIE FRAGEN STEHEN JETZT VOR DEN PREISEN.

        Bis hierher stand die Preistabelle direkt hinter dem Ablauf und die
        FAQ dahinter. Das ist die Reihenfolge eines Katalogs: erst die Zahl,
        dann die Erklaerung. Ein Leser, der bei 2.400 EUR haengen bleibt,
        liest die Erklaerung nicht mehr — er hat schon entschieden.

        Umgekehrt beantwortet die FAQ genau die zwei Fragen, die vor dem Preis
        stehen muessen: was das kostet und wie es ablaeuft. Wer beide gelesen
        hat, liest die Tabelle als Bestaetigung statt als Ueberraschung. Die
        Sektionen selbst sind unveraendert — nur ihre Reihenfolge ist ein
        anderes Argument.
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
