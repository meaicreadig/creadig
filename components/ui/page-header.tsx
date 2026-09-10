"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ChevronRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/**
 * Seitenkopf der Unterseiten (PHASE A).
 *
 * Warum es die Komponente gibt: Mit der neuen Informations-Architektur kommen
 * sieben neue Routen dazu. Jede braucht denselben Kopf — Brotkrumen, Eyebrow,
 * H1, Einleitung, dazu den Abstand unter der festen Navigationsleiste. Ohne
 * eine Quelle waere dieselbe Rezeptur siebenmal im Markup gelandet und in
 * vier Wochen siebenfach auseinandergelaufen (genau der Fehler, den die
 * `section-*`-Utilities in globals.css schon einmal geheilt haben).
 *
 * Die Brotkrumen sind kein Zierrat: Sie sind der sichtbare Beweis, dass die
 * Seite eine Struktur hat und nicht eine Landingpage mit Ankern ist. „Startseite"
 * steht immer vorn; die uebergebenen Glieder kommen dahinter, das letzte ist
 * die aktuelle Seite und traegt `aria-current`.
 */
export type Crumb = { label: string; href: string }

export function PageHeader({
  eyebrow,
  title,
  crumbLabel,
  lead,
  crumbs = [],
  children,
}: {
  eyebrow: string
  title: string
  /**
   * Name der Seite in den Brotkrumen. Ohne Angabe steht dort die H1 — und die
   * ist auf einer Uebersichtsseite ein ganzer Satz („Vier Produkte, die wir
   * selbst betreiben."). In einer Brotkrumen-Zeile liest sich das wie ein
   * Fehler. Uebersichtsseiten geben darum den Bereichsnamen an; Detailseiten
   * (Produkt, Arbeit) tragen ohnehin nur ihren Eigennamen als H1.
   */
  crumbLabel?: string
  lead?: string
  /** Zwischenglieder OHNE Startseite und OHNE die aktuelle Seite. */
  crumbs?: Crumb[]
  /** Optionaler Zusatz unter der Einleitung (Chips, Signal-Zeile, CTA). */
  children?: React.ReactNode
}) {
  const { t } = useLocale()

  return (
    <header className="border-line relative overflow-hidden border-b">
      {/* pt-32/40 haelt den Kopf frei von der festen Leiste (h-[4.5rem]). */}
      <div className="section-gutter relative pt-32 pb-20 md:pt-40 md:pb-24">
        <nav aria-label="Brotkrumen">
          <ol className="text-muted-foreground flex flex-wrap items-center gap-2 text-meta">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors duration-[var(--dur-1)]">
                {t.nav.home}
              </Link>
            </li>
            {crumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-2">
                <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors duration-[var(--dur-1)]"
                >
                  {crumb.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
              <span aria-current="page" className="text-foreground">
                {crumbLabel ?? title}
              </span>
            </li>
          </ol>
        </nav>

        {/*
          G-VISUAL — DER KOPF STAND AUF EINER HALBEN SEITE.

          Eyebrow, H1 und Einleitung standen untereinander, jeweils mit
          `max-w`. Bei 1440 px hiess das: die rechten rund 45 Prozent jedes
          Seitenkopfs blieben leer — auf /leistungen, /produkte, /arbeiten,
          /insights, /kontakt und jeder Detailseite, also auf jeder
          Unterseite der Website dieselbe Leere an derselben Stelle.

          Genau das ist die Grammatik, die aus „aufgeraeumt" „unfertig"
          macht: creme, Ueberschrift, viel Nichts, naechste Ueberschrift.

          Jetzt zweispaltig, wie die Abschnittskoepfe im Rest des Hauses es
          laengst machen (`house-architecture`, `services`): Titel links,
          Einleitung rechts auf derselben Grundlinie. Kein neues Muster —
          das vorhandene, endlich auch hier.
        */}
        <div className="mt-12 grid gap-x-10 gap-y-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={eyebrow} />
            <h1 className="type-h1 mt-7 text-balance">{title}</h1>
          </Reveal>
          {lead && (
            <Reveal delay={0.08} className="lg:col-span-5">
              <p className="type-lead text-muted-foreground max-w-2xl text-pretty">{lead}</p>
            </Reveal>
          )}
        </div>

        {children && <Reveal delay={0.08}>{children}</Reveal>}
      </div>
    </header>
  )
}
