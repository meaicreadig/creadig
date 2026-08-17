"use client"

import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { certifications, contact } from "@/lib/site-data"

/**
 * Zertifizierungen & Mitgliedschaften — nur echte, nachprüfbare Nachweise.
 *
 * Solange die offiziellen Badge-Logos nicht vorliegen (`logoPath === null`),
 * rendert die Kachel eine getypte Variante: kleines Kürzel-Quadrat, Über-Label,
 * Name. Kein kaputtes <img>, kein 404. Ruhig und grau — Gold erst bei Hover,
 * wie in der Logo-Wand.
 */
export function Certifications() {
  const { t } = useLocale()

  const fundingHref = `${contact.whatsappHref}?text=${encodeURIComponent(
    t.certs.funding.waText,
  )}`

  return (
    <section
      id="zertifizierungen"
      aria-labelledby="zertifizierungen-title"
      className="border-line border-b"
    >
      <div className="mx-auto w-full max-w-[100rem] px-6 py-24 md:px-10 md:py-32 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="bg-gold h-px w-10" />
              <p className="eyebrow text-muted-foreground">{t.certs.eyebrow}</p>
            </div>
            <h2
              id="zertifizierungen-title"
              className="type-h2 mt-7 text-balance"
            >
              {t.certs.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">
              {t.certs.lead}
            </p>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-px sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {certifications.map((cert, i) => {
            const copy = t.certs.items[cert.slug]

            return (
              <Reveal
                key={cert.slug}
                delay={0.06 * i}
                className="border-line group hover:bg-foreground/[0.02] relative flex flex-col border-t p-7 transition-colors duration-500"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                />

                {cert.logoPath ? (
                  <img
                    src={cert.logoPath}
                    alt={cert.name}
                    className="h-11 w-auto max-w-[9rem] opacity-70 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="border-line-strong text-muted-foreground group-hover:border-gold group-hover:text-gold-text flex h-11 min-w-11 items-center justify-center self-start text-meta border px-2.5 transition-colors duration-500"
                  >
                    {cert.mark}
                  </span>
                )}

                <p className="text-muted-foreground mt-7 text-[0.75rem] leading-relaxed tracking-wide text-pretty">
                  {copy.label}
                </p>
                <p className="text-foreground mt-2 text-[0.9375rem] leading-snug font-semibold text-pretty">
                  {cert.name}
                </p>

                {copy.note && (
                  <p className="text-muted-foreground group-hover:text-gold-text text-meta mt-4 transition-colors duration-500">
                    {copy.note}
                  </p>
                )}

                <a
                  href={cert.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-gold-text mt-auto inline-flex items-center gap-1.5 pt-8 text-[0.75rem] transition-colors duration-500"
                >
                  {t.certs.verify}
                  <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
                </a>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.12}>
          <p className="type-small border-line text-muted-foreground mt-14 border-t pt-6">
            {t.certs.note}
          </p>
        </Reveal>

        {/* Förder-Angle: go-digital ist der konkreteste Grund, jetzt zu sprechen. */}
        <Reveal delay={0.06}>
          <div className="border-gold/45 bg-muted mt-16 grid gap-10 border-l-2 px-7 py-9 md:px-10 md:py-11 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <p className="eyebrow text-gold-text">{t.certs.funding.eyebrow}</p>
              <h3 className="type-h3 mt-5 text-balance">
                {t.certs.funding.title}
              </h3>
              <p className="text-foreground/85 mt-6 max-w-2xl text-base leading-relaxed text-pretty">
                {t.certs.funding.body}
              </p>
            </div>

            <div className="flex flex-col justify-end lg:col-span-5">
              <p className="type-body text-muted-foreground max-w-md text-pretty">
                {t.certs.funding.detail}
              </p>
              <a
                href={fundingHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group/cta from-gold-soft to-gold relative mt-8 inline-flex items-center justify-between gap-3 self-start overflow-hidden bg-gradient-to-br px-7 py-3.5 text-sm tracking-wide text-[#201e1b]"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-y-full bg-[#201e1b] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-y-0"
                />
                <span className="group-hover/cta:text-gold-soft relative z-10 flex items-center gap-2.5 transition-colors duration-500">
                  <WhatsAppIcon className="size-4" />
                  {t.certs.funding.cta}
                </span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
