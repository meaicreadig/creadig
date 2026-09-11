"use client"

import { useId, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { berechneAufwand, zahlAusEingabe, type AufwandEingabe } from "@/lib/wirtschaftlichkeit"
import { rechnerText } from "@/lib/rechner-text"

/**
 * DER AUFWANDSRECHNER (PHASE 3 · Commercial Completion).
 *
 * ---------------------------------------------------------------------------
 * WAS ER IST
 *
 * Fuenf Felder, vier Multiplikationen, eine Division. Die Rechnung steht in
 * `lib/wirtschaftlichkeit.ts` und ist dort mit 45 Pruefungen nachgerechnet;
 * diese Datei zeigt sie nur an.
 *
 * ---------------------------------------------------------------------------
 * WARUM KEINE FELDER VORBELEGT SIND
 *
 * Ein Rechner, der beim Aufruf „2.800 EUR im Monat" zeigt, hat diese Zahl
 * erfunden — auch wenn die Felder daneben als Beispiel beschriftet sind.
 * Jeder Besucher liest sie zuerst und die Beschriftung danach. Deshalb sind
 * alle Felder leer, und solange die ersten vier es sind, steht im Ergebnis
 * ein Satz statt einer Zahl.
 *
 * ---------------------------------------------------------------------------
 * WARUM DER ROHTEXT IM ZUSTAND BLEIBT UND NICHT DIE ZAHL
 *
 * Waere hier `number` gespeichert, wuerde „12," beim Tippen sofort zu 12 und
 * das Komma verschwaende unter den Fingern. Gespeichert wird deshalb, was
 * getippt wurde; `zahlAusEingabe` macht daraus bei jedem Rendern eine Zahl.
 * Das ist auch die Stelle, an der „1.250,50" und „1,250.50" beide richtig
 * gelesen werden — ein deutscher Betrieb tippt anders als ein englischer.
 *
 * ---------------------------------------------------------------------------
 * WAS DIESE KOMPONENTE NICHT TUT
 *
 * Kein `localStorage`, kein Query-Parameter, kein Ereignis an die Messung,
 * keine Schnittstelle. Was ein Besucher hier eintippt, sind betriebliche
 * Angaben — Vorgangszahlen und interne Kostensaetze. Die gehoeren niemandem
 * ausser ihm, und der einzige Weg, das zu garantieren, ist, sie nirgends
 * hinzuschreiben.
 */

type FeldSchluessel = "vorgaenge" | "minutenHeute" | "minutenNachher" | "stundensatz" | "investition"

const PFLICHT: FeldSchluessel[] = ["vorgaenge", "minutenHeute", "minutenNachher", "stundensatz"]
const ALLE: FeldSchluessel[] = [...PFLICHT, "investition"]

export function Aufwandsrechner() {
  const { locale } = useLocale()
  const idBasis = useId()

  const [roh, setRoh] = useState<Record<FeldSchluessel, string>>({
    vorgaenge: "",
    minutenHeute: "",
    minutenNachher: "",
    stundensatz: "",
    investition: "",
  })

  const eingabe: AufwandEingabe = {
    vorgaengeProMonat: zahlAusEingabe(roh.vorgaenge),
    minutenHeute: zahlAusEingabe(roh.minutenHeute),
    minutenNachher: zahlAusEingabe(roh.minutenNachher),
    stundensatz: zahlAusEingabe(roh.stundensatz),
    investition: zahlAusEingabe(roh.investition),
  }

  const ergebnis = berechneAufwand(eingabe)

  /* Eine getippte, aber unlesbare Zahl ist ein Fehler — ein leeres Feld nicht. */
  const unlesbar = (k: FeldSchluessel) => roh[k].trim() !== "" && zahlAusEingabe(roh[k]) === null

  const zahlFormat = new Intl.NumberFormat(locale === "ar" ? "de" : locale, {
    maximumFractionDigits: 1,
  })
  const euroFormat = new Intl.NumberFormat(locale === "ar" ? "de" : locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })

  const inputClass =
    "w-full rounded-none border-0 border-b border-line-strong bg-transparent px-0 py-3 text-base text-foreground outline-none transition-colors duration-[var(--dur-1)] focus:border-gold"

  return (
    <section aria-labelledby="rechner-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-x-14 gap-y-12 lg:grid-cols-12">
          {/* ------------------------------------------------ EINGABE ---- */}
          <Reveal className="lg:col-span-6">
            {/*
              Die Frage steht bereits als H1 im Seitenkopf. Hier braucht die
              Sektion einen eigenen, KURZEN Namen — sonst hoert ein
              Screenreader-Nutzer denselben Satz zweimal hintereinander.
            */}
            <h2 id="rechner-title" className="sr-only">
              {rechnerText.name[locale]}
            </h2>
            <p className="eyebrow text-gold-text">{rechnerText.eingabenLabel[locale]}</p>

            <div className="mt-8 flex flex-col gap-9">
              {ALLE.map((key) => {
                const feld = rechnerText.felder[key]
                const hilfeId = `${idBasis}-${key}-hilfe`
                return (
                  <label key={key} className="flex flex-col gap-2">
                    <span className="type-small text-foreground font-medium text-pretty">
                      {feld.label[locale]}
                      {key === "investition" ? "" : " *"}
                    </span>
                    <span id={hilfeId} className="text-meta text-muted-foreground text-pretty">
                      {feld.hilfe[locale]}
                    </span>
                    <span className="mt-1 flex items-baseline gap-3">
                      {/*
                        `inputMode="decimal"` holt auf dem Telefon die
                        Zifferntastatur samt Komma. Kein `type="number"`: Das
                        wuerde in deutschen Browsern das Komma verweigern und
                        haengt ausserdem Spinner an ein Feld, an dem niemand
                        hoch- und runterklickt.
                      */}
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        autoComplete="off"
                        value={roh[key]}
                        aria-describedby={hilfeId}
                        aria-invalid={unlesbar(key) || undefined}
                        onChange={(e) => setRoh((s) => ({ ...s, [key]: e.target.value }))}
                        className={`${inputClass} ${unlesbar(key) ? "border-destructive focus:border-destructive" : ""}`}
                      />
                      <span className="eyebrow text-muted-foreground shrink-0">
                        {feld.einheit[locale]}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>

            <p className="text-meta text-muted-foreground border-line mt-10 border-t pt-5 text-pretty">
              {rechnerText.datenschutzHinweis[locale]}
            </p>
          </Reveal>

          {/* ----------------------------------------------- ERGEBNIS ---- */}
          <Reveal delay={0.08} className="lg:col-span-6">
            <p className="eyebrow text-gold-text">{rechnerText.ergebnisLabel[locale]}</p>

            {/*
              Eine Live-Region: Wer mit einem Screenreader tippt, bekommt das
              Ergebnis angesagt, ohne es suchen zu muessen. `polite`, damit es
              den Tippfluss nicht unterbricht.
            */}
            <div aria-live="polite" className="mt-8">
              {ergebnis === null ? (
                <p className="type-body text-muted-foreground max-w-md text-pretty">
                  {rechnerText.leer[locale]}
                </p>
              ) : (
                <>
                  <dl className="flex flex-col">
                    <Zeile
                      label={rechnerText.zeilen.heute[locale]}
                      wert={`${zahlFormat.format(ergebnis.stundenHeute)} ${rechnerText.einheiten.stunden[locale]}`}
                    />
                    <Zeile
                      label={rechnerText.zeilen.nachher[locale]}
                      wert={`${zahlFormat.format(ergebnis.stundenNachher)} ${rechnerText.einheiten.stunden[locale]}`}
                    />
                    <Zeile
                      label={rechnerText.zeilen.differenzZeit[locale]}
                      wert={`${zahlFormat.format(ergebnis.differenzStunden)} ${rechnerText.einheiten.stunden[locale]}`}
                      stark
                    />
                    <Zeile
                      label={rechnerText.zeilen.differenzGeld[locale]}
                      wert={euroFormat.format(ergebnis.differenzEuro)}
                      stark
                    />
                    {ergebnis.amortisationMonate !== null && (
                      <Zeile
                        label={rechnerText.zeilen.amortisation[locale]}
                        wert={`${zahlFormat.format(ergebnis.amortisationMonate)} ${rechnerText.einheiten.monate[locale]}`}
                      />
                    )}
                    {ergebnis.stundenFuerZwoelfMonate !== null && (
                      <Zeile
                        label={rechnerText.zeilen.gegenprobe[locale]}
                        wert={`${zahlFormat.format(ergebnis.stundenFuerZwoelfMonate)} ${rechnerText.einheiten.stunden[locale]}`}
                      />
                    )}
                  </dl>

                  {/*
                    Der Satz zur Richtung steht UNTER den Zahlen und nicht
                    darueber: Erst die Rechnung, dann die Einordnung. Bei
                    Mehraufwand steht hier ausdruecklich, dass das kein Fehler
                    des Rechners ist — sonst sucht jemand den Fehler bei uns.
                  */}
                  <p className="type-small text-muted-foreground mt-7 max-w-md text-pretty">
                    {rechnerText.richtung[ergebnis.richtung][locale]}
                  </p>
                </>
              )}
            </div>

            {/* Die Formel steht immer da — auch ohne Ergebnis. */}
            <div className="border-line mt-12 border-t pt-8">
              <p className="eyebrow text-muted-foreground">{rechnerText.formelLabel[locale]}</p>
              <ul dir="ltr" className="mt-4 flex flex-col gap-2">
                {rechnerText.formel.map((zeile) => (
                  <li key={zeile.de} className="text-meta text-muted-foreground font-mono">
                    {zeile[locale]}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-line mt-10 border-t pt-8">
              <p className="eyebrow text-muted-foreground">{rechnerText.grenzeLabel[locale]}</p>
              <p className="type-small text-muted-foreground mt-4 max-w-md text-pretty">
                {rechnerText.grenze[locale]}
              </p>
            </div>

            <div className="border-line mt-10 border-t pt-8">
              <p className="eyebrow text-gold-text">{rechnerText.weiterLabel[locale]}</p>
              <p className="type-small text-foreground/85 mt-4 max-w-md text-pretty">
                {rechnerText.weiter[locale]}
              </p>
              <Link
                href="/termin?art=systemgespraech"
                className="text-gold-text eyebrow mt-5 inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
              >
                {rechnerText.weiterCta[locale]}
                <ArrowUpRight className="size-3" strokeWidth={1.5} />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Zeile({ label, wert, stark = false }: { label: string; wert: string; stark?: boolean }) {
  return (
    <div className="border-line flex flex-col gap-1 border-b py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
      <dt className="type-small text-muted-foreground text-pretty">{label}</dt>
      {/*
        `dir="ltr"` an der Zahl: Auf Arabisch laeuft der Satz von rechts nach
        links, eine Zahl mit Waehrungszeichen aber nicht. Ohne das steht das
        Euro-Zeichen auf der falschen Seite und ein Minus wandert ans Ende.
      */}
      <dd
        dir="ltr"
        className={`shrink-0 font-mono ${stark ? "text-foreground text-lg" : "text-muted-foreground type-small"}`}
      >
        {wert}
      </dd>
    </div>
  )
}
