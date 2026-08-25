"use client"

import { ArrowUpRight, Check } from "lucide-react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { packages } from "@/lib/site-data"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

export function Packages() {
  const { t } = useLocale()

  return (
    <section id="pakete" aria-labelledby="pakete-title" className="border-line border-b">
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

        {/*
          Spaltenzahl folgt der Kartenzahl. Vorher stand hier fest
          `lg:grid-cols-3` — mit einem einzigen Angebot haette die Karte auf
          einem Drittel der Breite geklebt und der Rest waere leer geblieben.
          Kein Design-Eingriff, nur die Vermeidung eines Bruchs.
        */}
        <div
          className={`mt-20 grid gap-px ${
            packages.length >= 3
              ? "lg:grid-cols-3"
              : packages.length === 2
                ? "lg:grid-cols-2"
                : "lg:grid-cols-1"
          }`}
        >
          {packages.map((pkg, i) => {
            const copy = t.packages.items[pkg.key]

            return (
              <Reveal
                key={pkg.key}
                delay={0.08 * i}
                className={`group border-line relative flex flex-col border-t p-8 transition-[background-color,box-shadow] duration-500 md:p-9 ${
                  // Das empfohlene Paket liegt eine Stufe hoeher — die einzige
                  // Karte der Seite, die den Grund verlaesst.
                  pkg.recommended
                    ? "bg-surface-raised elevation-2 relative z-10"
                    : "hover:bg-foreground/[0.02]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`bg-gold absolute top-0 left-0 h-px transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    pkg.recommended ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />

                <div className="flex items-start justify-between gap-4">
                  <p className="eyebrow text-muted-foreground">
                    {t.packages.tierLabel} {pkg.tier}
                  </p>
                  {pkg.recommended && (
                    <span className="border-gold text-gold-text eyebrow shrink-0 border px-2.5 py-1">
                      {t.packages.recommended}
                    </span>
                  )}
                </div>

                {/*
                  Feste Hoehe fuer den Namen: „Growth Partner" bricht auf zwei
                  Zeilen um, „Identity" nicht — ohne Reserve sassen die drei
                  Preise auf drei verschiedenen Hoehen und liessen sich nicht
                  mehr vergleichen. Genau das soll eine Preistabelle koennen.
                */}
                <h3 className="type-h3 mt-5 lg:min-h-[2.24em]">{copy.name}</h3>

                <div className="mt-6 flex items-baseline gap-2.5">
                  <span className="type-stat">{pkg.price}</span>
                  <span className="eyebrow text-muted-foreground">
                    {pkg.period ? t.packages.monthly : t.packages.once}
                  </span>
                </div>

                {/*
                  Der Referenzpreis wird offen als solcher benannt, mit dem
                  Regelpreis daneben. Ein Nachlass, den der Kunde erst bei der
                  zweiten Rechnung bemerkt, ist kein Entgegenkommen.
                */}
                {pkg.regularPrice && (
                  <div className="mt-5 flex flex-col gap-2">
                    <p className="type-small text-muted-foreground text-pretty">
                      {t.packages.referenceNote}
                    </p>
                    <p className="text-meta text-muted-foreground">
                      {t.packages.regularLabel}: {pkg.regularPrice}
                    </p>
                  </div>
                )}

                {/* „Für wen" — Zeile aus der bisherigen Live-Seite übernommen. */}
                <div className="border-line mt-8 border-t pt-6">
                  <p className="eyebrow text-muted-foreground group-hover:text-gold-text transition-colors duration-500">
                    {t.packages.forWhom}
                  </p>
                  {/* Zweizeilige Reserve, gleiche Begruendung wie beim Namen. */}
                  <p className="type-body text-foreground/85 mt-3 text-pretty lg:min-h-[3.4em]">
                    {copy.who}
                  </p>
                  <p className="type-body text-gold-text mt-4 flex gap-2 text-pretty">
                    <span aria-hidden="true">→</span>
                    <span>{copy.outcome}</span>
                  </p>
                </div>

                <ul className="mt-8 flex flex-1 flex-col gap-3.5">
                  {copy.includes.map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check className="text-gold mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                      <span className="type-small text-muted-foreground text-pretty">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="text-muted-foreground text-meta mt-8">
                  {copy.note}
                </p>

                {/* Führt wie auf der alten Seite in den Termin-Wizard.
                    Auch hier ein LocaleLink: Das nackte <a> sprang auf
                    /tr/... in die deutsche Fassung — der Regel-Pruefer sieht
                    das bei einem Template-Literal nicht. */}
                <Link
                  /*
                    Ohne eigenes Ziel in den Termin-Assistenten. Die Pruefung
                    hat eins: eine Seite mit Grenze, Preisleiter und
                    Kurz-Check. Wer aus einer Kachel heraus direkt in ein
                    Terminformular faellt, hat nicht gelesen, was er bucht.
                  */
                  href={pkg.ctaHref ?? `/termin?paket=${pkg.key}`}
                  className={
                    pkg.recommended
                      ? "from-gold-soft to-gold group/cta relative mt-7 inline-flex items-center justify-between gap-2 overflow-hidden bg-gradient-to-br px-5 py-3.5 text-sm tracking-wide text-[#201e1b]"
                      : "border-line-strong hover:border-gold hover:text-gold-text mt-7 inline-flex items-center justify-between gap-2 border px-5 py-3.5 text-sm tracking-wide transition-colors duration-500"
                  }
                >
                  {pkg.recommended && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -translate-y-full bg-[#201e1b] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-y-0"
                    />
                  )}
                  <span className="group-hover/cta:text-gold-soft relative z-10 flex w-full items-center justify-between gap-2 transition-colors duration-500">
                    {copy.cta}
                    <ArrowUpRight className="size-4" strokeWidth={1.5} />
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>

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
          </div>
          <Link
            href="/termin"
            className="border-line-strong hover:border-gold hover:text-gold-text inline-flex shrink-0 items-center gap-2.5 border px-6 py-3.5 text-sm tracking-wide transition-colors duration-500"
          >
            {t.packages.openCta}
            <ArrowUpRight className="size-4" strokeWidth={1.5} />
          </Link>
        </Reveal>

        {/* Netto ist eine Pflichtangabe, keine Fussnote (M12-4). */}
        <p className="type-small text-muted-foreground border-line mt-8 border-t pt-6">
          {t.packages.netNote}
        </p>

        {/*
          V2-3 — der Satz, der die Rubrik einordnet.

          Ohne ihn steht eine Preistabelle unter fuenf Ebenen und macht das
          Groessere klein: Wer 2.400 EUR liest, hat die Antwort auf „was ist
          das hier" gefunden, bevor er die Ebenen zu Ende gelesen hat. Der
          Satz sagt ausdruecklich, dass dies der Einstieg ist und nicht die
          Hauptarchitektur (KIZILELMA §10.7).
        */}
        <p className="type-body text-foreground/85 border-line mt-6 max-w-3xl border-t pt-6 text-pretty">
          {t.packages.entryNote}
        </p>

      </div>
    </section>
  )
}
