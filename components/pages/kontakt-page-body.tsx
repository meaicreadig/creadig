"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowRight, ArrowUpRight, CalendarDays, Layers, MessageSquare, Package } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { Contact } from "@/components/sections/contact"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { contact } from "@/lib/site-data"

/**
 * Kontaktseite (PHASE A, Master-Prompt 4 §7).
 *
 * Die Kategorie-Korrektur: Kontakt war bisher ein Formular plus „Termin in 20
 * Minuten". Das bedient genau eine Absicht — die von jemandem, der schon
 * entschieden hat. Drei andere Absichten kamen im Alltag mindestens so oft
 * vor und hatten keinen Weg: erst schauen, erst prüfen, erst fragen.
 *
 * Darum steht über dem Formular eine Absichtszeile mit vier gleichwertigen
 * Wegen. Zwei führen ins Gespräch, zwei führen tiefer in die Seite — und das
 * ist kein Umweg, sondern für ein System-Haus der ehrlichere Einstieg: Wer
 * vier eigene Produkte gesehen hat, braucht weniger Überzeugungsarbeit.
 */
const INTENT_ICONS = {
  talk: MessageSquare,
  appointment: CalendarDays,
  products: Package,
  works: Layers,
} as const

/** Reihenfolge = Reihenfolge auf der Seite. */
const INTENTS = [
  { key: "talk" as const, href: "#kontakt", external: false },
  { key: "appointment" as const, href: "/termin", external: false },
  { key: "products" as const, href: "/produkte", external: false },
  { key: "works" as const, href: "/arbeiten", external: false },
]

export function KontaktPageBody() {
  const { t } = useLocale()
  const copy = t.kontaktPage

  return (
    <main>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title}
        crumbLabel={t.nav.kontakt} lead={copy.lead}>
        {/* E-Mail steht bewusst schon hier: Sie ist der einzige Weg, der ohne
            Formular und ohne Messenger auskommt — und für alles Schriftliche
            (Angebote, Unterlagen, Förderanträge) der richtige. */}
        <div className="border-line mt-12 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t pt-6">
          <p className="eyebrow text-gold-text">{copy.mailLabel}</p>
          <a
            href={`mailto:${contact.email}`}
            className="text-foreground hover:text-gold-text type-body transition-colors duration-500"
          >
            {contact.email}
          </a>
          <p className="type-small text-muted-foreground">{copy.mailNote}</p>
        </div>
      </PageHeader>

      <section aria-labelledby="wege-title" className="border-line border-b">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={copy.intentsLabel} />
            <h2 id="wege-title" className="sr-only">
              {copy.intentsLabel}
            </h2>
          </Reveal>

          <div className="bg-line border-line mt-12 grid gap-px border sm:grid-cols-2 lg:grid-cols-4">
            {INTENTS.map((intent, i) => {
              const item = copy.intents[intent.key]
              const Icon = INTENT_ICONS[intent.key]

              return (
                <Reveal key={intent.key} delay={0.06 * i} className="flex">
                  <Link
                    href={intent.href}
                    className="group bg-background hover:bg-surface relative flex w-full flex-col justify-between gap-8 p-7 transition-colors duration-500 lg:p-8"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                    />
                    <div>
                      <Icon className="text-gold size-5" strokeWidth={1.5} aria-hidden="true" />
                      <h3 className="type-h4 mt-6">{item.name}</h3>
                      <p className="type-small text-muted-foreground mt-4 text-pretty">
                        {item.what}
                      </p>
                    </div>
                    <span className="text-gold-text inline-flex items-center gap-2 text-sm tracking-wide">
                      {item.cta}
                      {intent.href.startsWith("#") ? (
                        <ArrowRight
                          className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                          strokeWidth={1.5}
                        />
                      ) : (
                        <ArrowUpRight
                          className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          strokeWidth={1.5}
                        />
                      )}
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Formular, direkte Wege und Sitz — unverändert aus der Startseite
          übernommen, hier aber am richtigen Ort. */}
      <Contact />
    </main>
  )
}
