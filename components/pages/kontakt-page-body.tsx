"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { checkCopy } from "@/lib/betriebscheck"
import { rechnerText } from "@/lib/rechner-text"
import { ArrowRight, ArrowUpRight, CalendarDays, Layers, MessageSquare, Package } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { ContactDirect } from "@/components/sections/contact-direct"
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
 * Darum steht oben eine Absichtszeile mit vier gleichwertigen Wegen. Zwei
 * führen ins Gespräch, zwei führen tiefer in die Seite — und das ist kein
 * Umweg, sondern für ein System-Haus der ehrlichere Einstieg: Wer vier eigene
 * Produkte gesehen hat, braucht weniger Überzeugungsarbeit.
 *
 * MP10-2.6: Das Formular unter dieser Zeile ist gegangen. Es war das zweite
 * für denselben Vorgang — /termin fragt dasselbe, nur geführt.
 */
const INTENT_ICONS = {
  talk: MessageSquare,
  appointment: CalendarDays,
  system: Layers,
  products: Package,
  works: Layers,
} as const

/** Reihenfolge = Reihenfolge auf der Seite. */
/*
 * MP10-2.6 — „Projekt besprechen" fuehrte zum Formular unten auf dieser
 * Seite. Das Formular gibt es nicht mehr; der Anker fuehrt jetzt auf die
 * direkten Wege, und die Beschriftung sagt das auch.
 */
/*
 * PHASE 4 · COMMERCIAL COMPLETION — DREI GLEICH GROSSE KACHELN WAREN KEINE
 * REIHENFOLGE.
 *
 * Vorher standen „Projekt besprechen", „Termin vereinbaren" und „Produkte
 * ansehen" gleichwertig nebeneinander, darunter noch WhatsApp und E-Mail.
 * Fuenf gleichrangige Wege sind keine Auswahl, sondern eine Abwaelzung der
 * Entscheidung auf den Besucher.
 *
 * Schwerer wog, was FEHLTE: Das Systemgespraech kam auf dieser Seite gar
 * nicht vor. „Termin vereinbaren" nannte es im Fliesstext als Nebensatz und
 * fuehrte auf `/termin` — also in den kurzen Weg. Wer ein Betriebsproblem
 * hat, landete damit zuverlaessig in der falschen Erwartung.
 *
 * Jetzt zwei Raenge:
 *   GESPRAECH   zwei Kacheln, zwei Dauern, zwei Ziele
 *   OHNE TERMIN eine Zeile: selbst pruefen, selbst rechnen, direkt schreiben
 */
const GESPRAECHE = [
  { key: "appointment" as const, href: "/termin" },
  { key: "system" as const, href: "/termin?art=systemgespraech" },
] as const

const INTENTS = [
  { key: "talk" as const, href: "#kontakt", external: false },
  { key: "products" as const, href: "/produkte", external: false },
  /*
   * GATE 01 · WEB-0005 — der vierte Weg fuehrte nach `/arbeiten`.
   *
   * Seit `/produkte` der kanonische Ort der eigenen Produkte ist, zeigt
   * `/arbeiten` nichts, solange keine Kundenfreigabe vorliegt. Zwei
   * benachbarte Wege, von denen einer auf eine leere Seite fuehrt, sind
   * kein Angebot — sie sind eine Enttaeuschung mit zwei Klicks Vorlauf.
   *
   * Der Eintrag kommt zurueck, sobald `/arbeiten` traegt (OD-2); die
   * Beschriftung `kontaktPage.intents.works` bleibt dafuer im Woerterbuch.
   */
]

export function KontaktPageBody() {
  const { t, locale } = useLocale()
  const copy = t.kontaktPage

  return (
    <main>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title}
        crumbLabel={t.nav.kontakt} lead={copy.lead}>
        {/*
          E-Mail steht bewusst schon hier: Sie ist der einzige Weg, der ohne
          Messenger und ohne Assistent auskommt — und für alles Schriftliche
          (Angebote, Unterlagen, Förderanträge) der richtige.

          MP10-2.6: Der erklärende Halbsatz daneben ist gegangen. Seit die
          direkten Wege unten eine eigene E-Mail-Kachel tragen, stand er
          zweimal wörtlich auf derselben Seite — einmal hier und einmal
          dort. Die Kachel behält ihn, weil sie ihn braucht; diese Zeile ist
          der schnelle Griff, nicht die Erklärung.
        */}
        <div className="border-line mt-12 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t pt-6">
          <p className="eyebrow text-gold-text">{copy.mailLabel}</p>
          <a
            href={`mailto:${contact.email}`}
            className="text-foreground hover:text-gold-text type-body transition-colors duration-[var(--dur-2)]"
          >
            {contact.email}
          </a>
        </div>
      </PageHeader>

      <section aria-labelledby="wege-title" className="section-seam">
        <div className="section-shell">
          <Reveal>
            <SectionEyebrow label={copy.intentsLabel} />
            <h2 id="wege-title" className="sr-only">
              {copy.intentsLabel}
            </h2>
          </Reveal>

          {/*
            GATE 01 · WEB-0005 — vier Spalten fuer drei Kacheln haetten eine
            Luecke gelassen, wo vorher der vierte Weg stand. Die Spaltenzahl
            folgt jetzt der Zahl der Wege und nicht umgekehrt.
          */}
          <div className="mt-12 grid gap-2.5 sm:grid-cols-2">
            {GESPRAECHE.map((intent, i) => {
              const item = copy.intents[intent.key]
              const Icon = INTENT_ICONS[intent.key]

              return (
                <Reveal key={intent.key} delay={0.06 * i} className="flex">
                  <Link
                    href={intent.href}
                    className="group tile bg-background hover:bg-surface relative flex w-full flex-col justify-between gap-8 p-7 transition-colors duration-[var(--dur-2)] lg:p-8"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-gold absolute top-0 start-0 h-px w-0 transition-all duration-[var(--dur-3)] ease-brand group-hover:w-full"
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
                          className="size-4 transition-transform duration-[var(--dur-2)] group-hover:translate-x-1"
                          strokeWidth={1.5}
                        />
                      ) : (
                        <ArrowUpRight
                          className="size-4 transition-transform duration-[var(--dur-2)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          strokeWidth={1.5}
                        />
                      )}
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>

          {/*
            ZWEITER RANG. Kein Termin noetig — und deshalb auch keine Kachel
            in derselben Groesse. Drei Zeilen, die alle ohne Gespraech
            weiterfuehren: selbst einschaetzen, selbst rechnen, direkt
            schreiben.
          */}
          <Reveal delay={0.14} className="border-line mt-12 border-t pt-8">
            <p className="eyebrow text-muted-foreground">{copy.ohneTerminLabel}</p>
            <ul className="mt-5 flex flex-col gap-x-10 gap-y-3.5 sm:flex-row sm:flex-wrap">
              <li>
                <Link href="/betriebscheck" className="text-gold-text type-small underline-offset-4 hover:underline">
                  {checkCopy.eyebrow[locale]}
                </Link>
              </li>
              <li>
                <Link href="/aufwandsrechner" className="text-gold-text type-small underline-offset-4 hover:underline">
                  {rechnerText.name[locale]}
                </Link>
              </li>
              {INTENTS.map((intent) => (
                <li key={intent.key}>
                  <Link href={intent.href} className="text-gold-text type-small underline-offset-4 hover:underline">
                    {copy.intents[intent.key].name}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* MP10-2.6 — direkte Wege und Sitz. Das Formular, das hier stand,
          ist gegangen: /termin ist der Abschluss, /kontakt der direkte Weg.
          Die Begründung steht in `contact-direct.tsx`. */}
      <ContactDirect />
    </main>
  )
}
