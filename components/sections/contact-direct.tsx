"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight, CalendarDays, Mail } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { contact } from "@/lib/site-data"

/**
 * MP10-2.6 — /kontakt TRAEGT KEIN ZWEITES FORMULAR MEHR.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER STAND UND WARUM ES GEGANGEN IST
 * An dieser Stelle stand ein vollstaendiges Anfrageformular: Name, Betrieb,
 * E-Mail, Telefon, Anliegen, Einwilligung, zwei Absende-Knoepfe. Daneben, in
 * der rechten Spalte, ein Verweis auf `/termin` — wo dieselben Angaben noch
 * einmal abgefragt werden, nur gefuehrt und in vier Schritten.
 *
 * Zwei Formulare fuer denselben Vorgang sind keine zwei Angebote, sondern
 * eine Entscheidung, die der Seite gehoert und die sie an den Besucher
 * weiterreicht: „Welches von beiden ist das richtige?" Wer sie falsch trifft,
 * tippt zweimal — oder gar nicht.
 *
 * Die Hierarchie ist jetzt festgelegt (MP10-2.6):
 *
 *   /termin    DER Abschluss. Vier Schritte, Paket-Vorauswahl, Wunschzeit.
 *              Dorthin zeigen der Kopfzeilen-Knopf und jeder Startseiten-CTA.
 *   /kontakt   Die direkten Wege — schreiben, anrufen, wissen wo wir sitzen.
 *              Fuer alle, die kein Erstgespraech wollen, sondern eine Antwort.
 *
 * Kein Weg geht verloren: WhatsApp und E-Mail waren vorher schon da, sie sind
 * nur nicht mehr die Alternative zu einem Formular, sondern die Sache selbst.
 */
export function ContactDirect() {
  const { t } = useLocale()

  return (
    /*
      Der Anker `#kontakt` bleibt, obwohl das Formular gegangen ist: Er steht
      in aelteren Verweisen und in der Fusszeile. Ein Sprungziel abzuschaffen
      ist teurer als es zu behalten — es zeigt jetzt auf die Wege statt auf
      ein Eingabefeld.
    */
    <section id="kontakt" aria-labelledby="kontakt-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-x-14 gap-y-16 lg:grid-cols-12">
          {/* Links: was diese Seite ist — und der Sitz. */}
          <div className="lg:col-span-5">
            <Reveal>
              <SectionEyebrow label={t.contact.eyebrow} />
              <h2 id="kontakt-title" className="type-h2 mt-7 text-balance">
                {t.contact.directTitle}
              </h2>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="type-lead text-muted-foreground mt-7 max-w-md text-pretty">
                {t.contact.directLead}
              </p>
            </Reveal>

            {/* Sitz = Osnabrück (ICO). Die Schweiz ist Markt, nicht Standort. */}
            <Reveal delay={0.12} className="border-line mt-14 border-t pt-7">
              <p className="eyebrow text-gold-text">{t.contact.locationsLabel}</p>
              <address className="type-small text-foreground/85 mt-4 not-italic">
                {contact.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <p className="eyebrow text-gold-text mt-7">{t.contact.marketsLabel}</p>
              <p className="type-small text-foreground/85 mt-3">{contact.markets}</p>
            </Reveal>
          </div>

          {/* Rechts: die drei Wege, in der Reihenfolge ihrer Verbindlichkeit. */}
          <div className="flex flex-col gap-px lg:col-span-7">
            <Reveal>
              <Link
                href="/termin"
                className="group border-line hover:bg-foreground/[0.03] relative flex items-start gap-5 border-t p-7 transition-colors duration-500"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
                />
                <CalendarDays className="text-gold mt-1 size-5 shrink-0" strokeWidth={1.5} />
                <span className="flex-1">
                  <span className="text-display block text-xl">{t.contact.appointmentTitle}</span>
                  <span className="text-muted-foreground mt-2 block text-sm">
                    {t.contact.appointmentNote}
                  </span>
                  {/*
                    E-K8: Was der Termin dem Gegenueber bringt, bevor er etwas
                    kostet. Kein neues Versprechen — beschrieben ist, was
                    ohnehin passiert (siehe Prozess-Schritt „Verstehen" und der
                    Foerder-Hinweis „sagen wir das offen").
                  */}
                  <span className="type-small text-foreground/85 mt-3 block text-pretty">
                    {t.contact.appointmentValue}
                  </span>
                  <span className="text-gold-text mt-3 block text-sm">
                    {t.contact.appointmentCta}
                  </span>
                </span>
                <ArrowUpRight
                  className="text-line-strong group-hover:text-gold-text mt-1 size-4 transition-colors duration-500"
                  strokeWidth={1.5}
                />
              </Link>
            </Reveal>

            <Reveal delay={0.06}>
              <a
                href={contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group border-line hover:bg-foreground/[0.03] relative flex items-start gap-5 border-t p-7 transition-colors duration-500"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
                />
                <WhatsAppIcon className="text-gold mt-1 size-5 shrink-0" />
                <span className="flex-1">
                  <span className="text-display block text-xl">{t.contact.whatsappTitle}</span>
                  <span className="text-muted-foreground mt-2 block text-sm">
                    {t.contact.whatsappNote}
                  </span>
                  <span className="text-foreground/85 mt-3 block font-mono text-sm tracking-wide">
                    {contact.whatsapp}
                  </span>
                </span>
                <ArrowUpRight
                  className="text-line-strong group-hover:text-gold-text mt-1 size-4 transition-colors duration-500"
                  strokeWidth={1.5}
                />
              </a>
            </Reveal>

            <Reveal delay={0.12}>
              <a
                href={`mailto:${contact.email}`}
                className="group border-line hover:bg-foreground/[0.03] relative flex items-start gap-5 border-y p-7 transition-colors duration-500"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
                />
                <Mail className="text-gold mt-1 size-5 shrink-0" strokeWidth={1.5} />
                <span className="flex-1">
                  <span className="text-display block text-xl">{t.contact.mailTitle}</span>
                  <span className="text-muted-foreground mt-2 block text-sm">
                    {t.contact.mailNote}
                  </span>
                  <span className="text-foreground/85 mt-3 block font-mono text-sm tracking-wide">
                    {contact.email}
                  </span>
                </span>
                <ArrowUpRight
                  className="text-line-strong group-hover:text-gold-text mt-1 size-4 transition-colors duration-500"
                  strokeWidth={1.5}
                />
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
