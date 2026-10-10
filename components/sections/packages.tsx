"use client"

import { ArrowUpRight } from "lucide-react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { formatPrice } from "@/lib/site-data"
import { findOffer, offerAmount } from "@/lib/offers"
import { steuerlage } from "@/lib/rechnung"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { PaketWahl } from "@/components/sections/paket-wahl"

export function Packages() {
  const { t, locale } = useLocale()
  const betreuung = offerAmount("betreuung")

  return (
    <section id="pakete" aria-labelledby="pakete-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={t.packages.eyebrow} />
            <h2 id="pakete-title" className="type-h2 mt-7 text-balance">
              {t.packages.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">
              {t.packages.lead}
            </p>
          </Reveal>
        </div>

        <PaketWahl />

        {/*
          BF-9 — die obere Oeffnung der Leiter.

          Sie endete bei 3.900 EUR. Wer mehr braucht, las das als Obergrenze
          und sortierte sich selbst aus — oder wir verhandelten uns an der
          eigenen Zahl nach unten. Hier steht deshalb bewusst KEINE zweite
          Zahl, sondern „auf Anfrage" und ein Gespraech: ein beworbenes
          Angebot, eine Leiter, ein offenes oberes Ende.
        */}
        <Reveal className="border-line mt-px flex flex-col gap-6 border-t p-8 md:flex-row md:items-start md:justify-between md:p-9">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="eyebrow text-muted-foreground">{t.packages.openEyebrow}</p>
              <p className="text-display text-gold-text text-2xl">{t.packages.openPrice}</p>
            </div>
            <p className="type-body text-muted-foreground mt-4 text-pretty">
              {t.packages.openNote}
            </p>
            {/* W2 — die fuenf Treiber stehen im Systemgespraech, nicht vor ihm
                (docs/sales/offer-canon.md §7). Hier genuegt der Weg. */}
          </div>
          {/*
            GATE 3 — der Verweis fuehrt jetzt in GENAU das Gespraech, das der
            Text verspricht, nicht auf die Auswahlseite davor.

            Vorher: `/termin`. Wer „Umfang besprechen" las und klickte, stand
            vor der Frage „Worum geht es?" und musste selbst herausfinden,
            dass das Systemgespraech gemeint war — ein Schritt, den der Text
            gerade beantwortet hatte.
          */}
          <Link
            href="/termin?art=systemgespraech"
            className="cta-quiet inline-flex shrink-0 items-center gap-2.5 px-6 py-3.5 text-sm tracking-wide"
          >
            {t.packages.openCta}
            <ArrowUpRight className="size-4" strokeWidth={1.5} />
          </Link>
        </Reveal>

        {/*
          W1 · R2 — die Website-Betreuung steht HIER, bei der Website, und
          nirgends als Preis fuer Systemarbeit. Betrag aus `lib/offers.ts`.
        */}
        {betreuung !== null && (
          <div className="border-line mt-px flex flex-col gap-3 border-t px-8 py-6 md:flex-row md:items-baseline md:justify-between md:px-9">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="eyebrow text-muted-foreground">{findOffer("betreuung").label[locale]}</span>
              <span className="text-subhead text-lg">
                {formatPrice(betreuung, locale)} {t.packages.monthly}
              </span>
              <span className="type-small text-muted-foreground">{t.packages.betreuungNote}</span>
            </p>
            <Link
              href="/betrieb"
              className="text-gold-text hover:text-foreground inline-flex shrink-0 items-center gap-1.5 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              {t.packages.betreuungCta}
              <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        )}

        {/* Netto ist eine Pflichtangabe, keine Fussnote (M12-4). */}
        <p className="type-small text-muted-foreground border-line mt-8 border-t pt-6">
          {/*
            GATE 04 — die Steuerzeile folgt dem Steuerstatus, nicht einer
            zweiten, unabhaengig gepflegten Zeichenkette. Setzt der Inhaber
            den Kleinunternehmer-Status, verschwindet der 19-%-Satz von selbst.

            G18 — SIE FRAGT JETZT DAS GATE, NICHT DAS FELD.

            Vorher stand hier `imprintDetails.smallBusiness === true`. Das ist
            dieselbe Frage wie in `steuerlage()`, nur mit einer anderen Latte:
            Ein gesetztes Feld haette die Preiszeile umgestellt, waehrend die
            Freigabe noch ausstand und das Impressum weiter „Status noch nicht
            freigegeben" schrieb — der Preis haette sich auf eine Entscheidung
            berufen, die es nicht gab.

            Solange der Status offen ist, bleibt der bisherige Satz stehen: Er
            ist die Annahme, die das Haus heute trifft, und sie steht als
            offener Punkt im Materialstand. Erfunden wird nichts.
          */}
          {steuerlage().art === "kleinunternehmer"
            ? t.packages.netNoteSmallBusiness
            : t.packages.netNote}
        </p>


      </div>
    </section>
  )
}
