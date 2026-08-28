"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight, Check } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { contact } from "@/lib/site-data"

/**
 * BF-A4 — die eigene Erklärung zur Barrierefreiheit.
 *
 * ---------------------------------------------------------------------------
 * WARUM SIE ANDERS AUSSIEHT ALS DIE ÜBLICHEN
 * Die meisten Erklärungen im Netz sind Textbausteine: „Wir sind bemüht …",
 * „teilweise konform", darunter ein Datum, das seit drei Jahren steht. Sie
 * beweisen nichts, weil sie nichts nachprüfbar behaupten.
 *
 * Diese hier nennt Zahlen aus einem Prüflauf, den es wirklich gab, benennt die
 * gefundenen Mängel — auch die peinlichen — und sagt in einem eigenen
 * Abschnitt, was NICHT geprüft wurde. Jede Zahl im Text hat einen Beleg in
 * `docs/barrierefreiheit-befund-eigen.md`.
 *
 * ---------------------------------------------------------------------------
 * WAS SIE BEWUSST NICHT TUT
 * Sie behauptet keine Rechtsfolge. Ob diese Seite unter das BFSG fällt, ist
 * nicht geprüft; „freiwillig" steht deshalb im ersten Abschnitt und nicht im
 * Kleingedruckten. Eine Erklärung, die Konformität behauptet, ohne die
 * Schwelle geprüft zu haben, wäre genau die Sorte Aussage, gegen die dieses
 * Angebot antritt.
 *
 * ---------------------------------------------------------------------------
 * ZWEI FEEDBACK-WEGE, EINER DAVON AUF DER EIGENEN SEITE
 * Ein Melde-Weg, der über ein fremdes Programm läuft (E-Mail-Client), kann
 * selbst die Barriere sein. Deshalb steht das eigene Formular gleichwertig
 * daneben.
 */
export function AccessibilityPageBody() {
  const { t } = useLocale()
  const copy = t.accessibility

  return (
    <main>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        crumbLabel={copy.eyebrow}
        lead={copy.lead}
      />

      {/* Freiwillig — der erste Abschnitt, nicht der letzte. */}
      <section aria-labelledby="freiwillig" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <h2 id="freiwillig" className="type-h3 max-w-2xl text-balance">
              {copy.voluntaryTitle}
            </h2>
            <p className="type-body text-muted-foreground mt-6 max-w-2xl text-pretty">
              {copy.voluntaryBody}
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="stand" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-x-14 gap-y-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <h2 id="stand" className="type-h3 text-balance">
                {copy.statusTitle}
              </h2>
              <p className="text-meta text-muted-foreground mt-6">
                {copy.updatedLabel}: {copy.updated}
              </p>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-7">
              <p className="type-body text-foreground/85 text-pretty">{copy.statusBody}</p>
              {/* Die Einschraenkung steht direkt unter der guten Nachricht,
                  nicht drei Abschnitte spaeter. */}
              <p className="border-gold/45 text-muted-foreground type-small mt-8 border-l-2 py-2 pl-4 text-pretty">
                {copy.statusNote}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="geprueft" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <h2 id="geprueft" className="type-h3 text-balance">
              {copy.checkedTitle}
            </h2>
            <p className="type-body text-muted-foreground mt-6 max-w-2xl text-pretty">
              {copy.checkedIntro}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {copy.checked.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="text-gold mt-1 size-4 shrink-0" strokeWidth={1.5} />
                  <span className="type-small text-foreground/85 text-pretty">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.14} className="border-line mt-12 border-t pt-8">
            <p className="eyebrow text-gold-text">{copy.pagesLabel}</p>
            <p className="type-small text-muted-foreground mt-4 max-w-3xl text-pretty">
              {copy.pagesBody}
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="behoben" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <h2 id="behoben" className="type-h3 text-balance">
              {copy.fixedTitle}
            </h2>
            <p className="type-body text-muted-foreground mt-6 max-w-2xl text-pretty">
              {copy.fixedIntro}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className="mt-8 flex flex-col">
              {copy.fixed.map((item) => (
                <li key={item} className="border-line type-body text-foreground/85 border-t py-4 text-pretty">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="type-small text-muted-foreground mt-8 max-w-3xl text-pretty">
              {copy.fixedEarlier}
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="offen" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <h2 id="offen" className="type-h3 text-balance">
              {copy.openTitle}
            </h2>
            <p className="type-body text-muted-foreground mt-6 max-w-2xl text-pretty">
              {copy.openIntro}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className="mt-8 flex flex-col gap-6">
              {copy.open.map((item) => (
                <li key={item} className="flex gap-3.5">
                  <span aria-hidden="true" className="bg-gold mt-3 h-px w-5 shrink-0" />
                  <span className="type-body text-foreground/85 max-w-3xl text-pretty">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="melden" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <h2 id="melden" className="type-h3 text-balance">
              {copy.feedbackTitle}
            </h2>
            <p className="type-body text-muted-foreground mt-6 max-w-2xl text-pretty">
              {copy.feedbackBody}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${contact.email}`}
                className="border-line-strong hover:border-gold hover:text-gold-text inline-flex items-center gap-2.5 border px-6 py-3.5 text-sm tracking-wide transition-colors duration-500"
              >
                {copy.feedbackMail}
                <span className="text-muted-foreground font-mono text-xs">{contact.email}</span>
              </a>
              <Link
                href="/kontakt"
                className="border-line-strong hover:border-gold hover:text-gold-text inline-flex items-center gap-2.5 border px-6 py-3.5 text-sm tracking-wide transition-colors duration-500"
              >
                {copy.feedbackForm}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </Link>
            </div>
            <p className="type-small text-muted-foreground mt-6 max-w-2xl text-pretty">
              {copy.feedbackNote}
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="methode" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <h2 id="methode" className="type-h3 text-balance">
              {copy.methodTitle}
            </h2>
            <p className="type-body text-muted-foreground mt-6 max-w-3xl text-pretty">
              {copy.methodBody}
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
