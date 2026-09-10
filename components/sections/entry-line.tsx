"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { Disclosure } from "@/components/ui/disclosure"
import { formatPrice } from "@/lib/site-data"
import { ebenenEinstiege, type EinstiegsArt } from "@/lib/einstiege"

/**
 * DER EINSTIEG AUF DER STARTSEITE — GATE 01 · WEB-0024.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER VORHER STAND
 * Eine Ueberschrift und eine Zahl: „Website-Paket ab 2.400 EUR netto." Sie war
 * der einzige Preis der Startseite. Das externe Audit hat daraus den Befund
 * gemacht, der diese Datei ausgeloest hat (AUDIT-24): Der Preis ankert creaDIG
 * als Website-Anbieter. Wer ihn zuerst liest, ordnet Betrieb, Automatisierung
 * und ein eigenes KI-System darunter als Zusatzleistungen ein.
 *
 * ---------------------------------------------------------------------------
 * WAS JETZT DASTEHT — UND WARUM DAS KEIN RUECKZIEHER IST
 * Der Preis ist nicht verschwunden; er ist einer von dreien geworden. Die
 * Sektion zeigt die drei ARTEN, auf die ein Anfang zustande kommt:
 *
 *   Festpreis            ein vereinbarter Umfang, eine Zahl
 *   Monatlich            der laufende Betrieb eines Systems, das wir bauten
 *   Angebot nach Analyse kein Listenpreis, sondern ein Gespraech davor
 *
 * Zwei davon tragen heute einen bestaetigten Betrag. Zwei Zahlen nebeneinander
 * ankern nicht — sie zeigen eine Spanne und eine Form; eine allein ist ein
 * Preisschild. Und die dritte Art sagt aus, dass es dort keinen Listenpreis
 * gibt, statt die Frage offen zu lassen: Wer keine Auskunft findet,
 * beantwortet sie selbst, und zwar gegen uns.
 *
 * ---------------------------------------------------------------------------
 * WO DIE ZAHLEN HERKOMMEN
 * Aus `lib/einstiege.ts`, und die liest ausschliesslich `packages` und
 * `retainer` aus `lib/site-data.ts`. Hier wird kein Betrag getippt. Wo `betrag`
 * `null` ist, steht das Etikett ohne Zahl — nicht „auf Anfrage" als Floskel,
 * sondern die Art des Einstiegs als Aussage.
 *
 * Die vollstaendige Preisleiter bleibt an genau einer Stelle:
 * `/leistungen#pakete`.
 *
 * ---------------------------------------------------------------------------
 * DIE ZWEI FRAGEN DANEBEN BLEIBEN
 * Dieselben zwei, die im Erstgespraech zuerst kommen. Sie kommen aus
 * `t.faq.items` und werden nicht zweitgeschrieben, damit die Antwort hier
 * nicht in vier Wochen anders lautet als auf `/leistungen`.
 */

/** Reihenfolge der Arten: erst was eine Zahl hat, dann was keine hat. */
const ARTEN: EinstiegsArt[] = ["festpreis", "monatlich", "nach-analyse"]

export function EntryLine() {
  const { t, locale } = useLocale()
  const copy = t.home.entry

  /*
   * Gruppiert, nicht aufgezaehlt: Drei der fuenf Ebenen laufen ueber „Angebot
   * nach Analyse". Fuenf Zeilen zu zeigen, von denen drei dasselbe sagen,
   * waere eine Liste; drei Arten mit den Ebenen daneben sind eine Ordnung.
   */
  const gruppen = ARTEN.map((art) => ({
    art,
    eintraege: ebenenEinstiege.filter((e) => e.art === art),
  })).filter((g) => g.eintraege.length > 0)

  const questions = t.faq.items.slice(0, 2)

  return (
    <section id="einstieg" aria-labelledby="einstieg-title" className="section-seam">
      <div className="section-shell-tight">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionEyebrow label={copy.eyebrow} />
              <h2 id="einstieg-title" className="type-h3 mt-7 max-w-xl text-balance">
                {copy.title}
              </h2>
              <p className="type-body text-muted-foreground mt-5 max-w-xl text-pretty">
                {copy.lead}
              </p>
            </Reveal>

            <ul className="border-line mt-10 flex flex-col border-t">
              {gruppen.map((gruppe, i) => {
                const artCopy = copy.arten[gruppe.art]
                /*
                 * Der Betrag steht an der Art, nicht an der Ebene: Innerhalb
                 * einer Art gibt es heute genau einen (`festpreis` das
                 * Website-Paket, `monatlich` die Betreuung). Faende sich je
                 * ein zweiter, stuende hier der niedrigste mit „ab" davor —
                 * bis dahin waere eine Spanne eine Behauptung ueber ein
                 * Angebot, das es nicht gibt.
                 */
                const mitBetrag = gruppe.eintraege.find((e) => e.betrag !== null)
                const ebenen = gruppe.eintraege
                  .map((e) => t.services.layers[e.layer].name)
                  .join(" · ")
                return (
                  <Reveal key={gruppe.art} as="li" delay={0.06 * i} className="border-line border-b">
                    <div className="grid gap-x-8 gap-y-3 py-7 md:grid-cols-12 md:items-baseline">
                      <p className="md:col-span-4">
                        <span className="eyebrow text-gold-text block">{artCopy.label}</span>
                        {mitBetrag?.betrag != null && (
                          <span className="type-h4 mt-2.5 block">
                            {formatPrice(mitBetrag.betrag, locale)}
                            {gruppe.art === "monatlich" && (
                              <span className="type-small text-muted-foreground ms-1.5">
                                {t.packages.monthly}
                              </span>
                            )}
                          </span>
                        )}
                      </p>
                      <div className="md:col-span-8">
                        <p className="type-small text-foreground/85 max-w-md text-pretty">
                          {artCopy.body}
                        </p>
                        {/*
                          Die Bedingung steht VOR dem Klick und nicht auf der
                          Zielseite: Die laufende Betreuung gibt es nur fuer
                          Systeme, die wir gebaut haben (`retainer.precondition`).
                          Wer sie erst auf `/betrieb` liest, hat den Preis
                          bereits als sein Angebot verstanden.
                        */}
                        {gruppe.eintraege.some((e) => e.bedingung) && (
                          <p className="text-meta text-muted-foreground mt-2">
                            {t.services.angebotBedingung}
                          </p>
                        )}
                        <p className="text-meta text-muted-foreground mt-3">
                          <span className="text-gold-text">{copy.ebenenLabel}: </span>
                          {ebenen}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </ul>

            <Reveal delay={0.2}>
              <p className="text-meta text-muted-foreground mt-6">{copy.nettoNote}</p>
              <Link
                href="/leistungen#pakete"
                className="text-gold-text hover:text-foreground mt-6 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
              >
                {copy.priceCta}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </Link>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.08}>
              <p className="eyebrow text-gold-text">{copy.questionsLabel}</p>
            </Reveal>
            {/*
              Dieselbe Mechanik wie in der FAQ: `<details>` statt eines
              React-Accordions, damit Tastatur, Screenreader und die
              Seitensuche des Browsers ohne eine Zeile JavaScript funktionieren.
            */}
            <div className="mt-6 flex flex-col">
              {questions.map((item, i) => (
                <Reveal key={item.q} delay={0.12 + 0.06 * i}>
                  <Disclosure label={item.q} size="sm" heading>
                    <p className="type-small text-muted-foreground text-pretty">{item.a}</p>
                  </Disclosure>
                </Reveal>
              ))}
              <div className="border-line border-t" />
            </div>
            <Reveal delay={0.24}>
              <Link
                href="/leistungen#faq"
                className="text-gold-text hover:text-foreground mt-7 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
              >
                {copy.questionsCta}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
