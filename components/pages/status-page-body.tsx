import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { contact } from "@/lib/site-data"
import { dictionary, type Locale } from "@/lib/dictionary"
import { localePath } from "@/lib/routes"

/**
 * BF-3 — der gemeinsame Körper von 404 und Fehlerseite.
 *
 * ---------------------------------------------------------------------------
 * WARUM EINE GEMEINSAME KOMPONENTE
 * Es sind fünf Einstiegspunkte: `not-found` für Deutsch und Türkisch,
 * `error` für beide Sprachbäume und `global-error` als letzte Instanz. Fünf
 * Mal dasselbe Markup wäre fünf Mal die Gelegenheit, dass eine Fassung
 * unbemerkt anders aussieht als die anderen — und Fehlerseiten sieht beim
 * Bauen niemand.
 *
 * ---------------------------------------------------------------------------
 * WARUM KEIN `useLocale`
 * `global-error.tsx` ersetzt das Wurzel-Layout und läuft damit außerhalb von
 * `LocaleProvider`. Eine Komponente, die den Kontext braucht, wäre genau dort
 * kaputt, wo sie zuletzt noch funktionieren muss. Die Sprache kommt deshalb
 * als Eigenschaft herein, und die Pfade baut `localePath` — dieselbe Regel wie
 * in `LocaleLink`, nur ohne Kontext.
 *
 * ---------------------------------------------------------------------------
 * WARUM WHATSAPP UND E-MAIL DANEBEN STEHEN
 * Die Kontaktseite ist einer der drei Wege zurück, und sie ist selbst eine
 * Seite, die geladen werden muss. Auf einer Fehlerseite ist das ein Weg zu
 * viel: WhatsApp und E-Mail hängen an nichts, was in diesem Moment gerade
 * kaputt sein könnte — kein Routing, keine API, keine Konfiguration.
 *
 * MP10-2.6: Hier stand, das Formular auf /kontakt hänge an `app/api/lead`.
 * Das Formular gibt es dort nicht mehr; der Grund für die beiden direkten
 * Wege bleibt derselbe.
 */
export function StatusPageBody({
  locale,
  eyebrow,
  title,
  lead,
  action,
}: {
  locale: Locale
  eyebrow: string
  title: string
  lead: string
  /** Nur die Fehlerseite hat einen: „Noch einmal versuchen". */
  action?: { label: string; onClick: () => void }
}) {
  const copy = dictionary[locale].errorPages
  const ways = [
    { ...copy.ways.home, href: "/" },
    { ...copy.ways.services, href: "/leistungen" },
    { ...copy.ways.contact, href: "/kontakt" },
  ]

  return (
    <main className="relative min-h-dvh">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] overflow-hidden">
        <SignatureMotif direction="down" className="motif-band h-full w-full" />
        <div className="from-background absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t to-transparent" />
      </div>

      <div className="section-gutter relative pt-32 pb-24 md:pt-40 md:pb-32">
        <SectionEyebrow label={eyebrow} />
        <h1 className="type-h1 mt-7 max-w-3xl text-balance">{title}</h1>
        <p className="type-lead text-muted-foreground mt-8 max-w-2xl text-pretty">{lead}</p>

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="cta-outline mt-10 inline-flex items-center gap-2.5 px-7 py-3.5 text-sm tracking-wide"
          >
            <span className="group-hover:text-gold-soft relative z-10 transition-colors duration-[var(--dur-2)]">
              {action.label}
            </span>
          </button>
        )}

        {/* Drei Wege zurück — benannt, nicht nur verlinkt. */}
        <h2 className="eyebrow text-gold-text border-line mt-16 border-t pt-8">{copy.waysLabel}</h2>
        <ul className="mt-6 flex flex-col">
          {ways.map((way) => (
            <li key={way.href}>
              <Link
                href={localePath(way.href, locale)}
                className="group border-line hover:bg-foreground/[0.03] relative flex items-start gap-5 border-b py-6 transition-colors duration-[var(--dur-2)]"
              >
                <span className="flex-1">
                  <span className="text-display block text-xl">{way.label}</span>
                  <span className="text-muted-foreground type-small mt-2 block text-pretty">
                    {way.note}
                  </span>
                </span>
                <ArrowUpRight
                  className="text-line-strong group-hover:text-gold-text mt-1 size-4 shrink-0 transition-colors duration-[var(--dur-2)]"
                  strokeWidth={1.5}
                />
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="eyebrow text-gold-text mt-14">{copy.directLabel}</h2>
        <p className="text-muted-foreground type-small mt-3 max-w-xl text-pretty">
          {copy.directNote}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={contact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-quiet inline-flex items-center gap-2.5 px-6 py-3.5 text-sm tracking-wide"
          >
            <WhatsAppIcon className="size-4" />
            {copy.whatsapp}
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="cta-quiet inline-flex items-center gap-2.5 px-6 py-3.5 text-sm tracking-wide"
          >
            {copy.mail}
            <span className="text-muted-foreground font-mono text-xs">{contact.email}</span>
          </a>
        </div>
      </div>
    </main>
  )
}
