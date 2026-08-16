"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { contact } from "@/lib/site-data"

/**
 * Gemeinsames Gerüst für /impressum und /datenschutz.
 * Die Pflichtangaben stehen noch aus — die Seiten existieren aber echt
 * (kein `#`, kein 404) und benennen den offenen Punkt ehrlich.
 */
export function LegalPage({ kind }: { kind: "imprint" | "privacy" }) {
  const { t } = useLocale()
  const title = kind === "imprint" ? t.legal.imprintTitle : t.legal.privacyTitle

  return (
    <main className="min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-6 pt-32 pb-24 md:px-10 md:pt-40">
        <Link
          href="/"
          className="text-muted-foreground hover:text-gold inline-flex items-center gap-2 text-[0.8125rem] transition-colors duration-300"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          {t.legal.back}
        </Link>

        <div className="mt-10 flex items-center gap-4">
          <span aria-hidden="true" className="bg-gold h-px w-10" />
          <p className="eyebrow text-muted-foreground">creaDIG</p>
        </div>
        <h1 className="text-display mt-6 text-[clamp(2.25rem,6vw,4rem)]">{title}</h1>

        {kind === "imprint" ? (
          <div className="mt-12 flex flex-col gap-10">
            <section className="border-line border-t pt-8">
              <p className="eyebrow text-gold">{t.legal.responsible}</p>
              <p className="text-foreground mt-4 text-lg">Muhammed Emin Akyol</p>
              <p className="text-muted-foreground mt-2 text-[0.9375rem]">{contact.locations}</p>
            </section>

            <section className="border-line border-t pt-8">
              <p className="eyebrow text-gold">{t.legal.contactLabel}</p>
              <ul className="mt-4 flex flex-col gap-2 text-[0.9375rem]">
                <li>
                  <a
                    href={contact.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold font-mono transition-colors duration-300"
                  >
                    {contact.whatsapp}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-gold transition-colors duration-300"
                  >
                    {contact.email}
                  </a>
                </li>
              </ul>
            </section>

            <section className="border-gold/40 bg-gold/[0.05] border-l-2 py-5 pl-6">
              <p className="eyebrow text-gold">{t.legal.pending}</p>
              <p className="text-muted-foreground mt-3 text-[0.9375rem] leading-relaxed text-pretty">
                {t.legal.pendingNote}
              </p>
            </section>
          </div>
        ) : (
          <div className="mt-12 flex flex-col gap-10">
            <p className="text-foreground text-base leading-relaxed text-pretty md:text-lg">
              {t.legal.privacyIntro}
            </p>

            {t.legal.privacyPoints.map((point) => (
              <section key={point.title} className="border-line border-t pt-8">
                <p className="eyebrow text-gold">{point.title}</p>
                <p className="text-muted-foreground mt-4 text-[0.9375rem] leading-relaxed text-pretty">
                  {point.body}
                </p>
              </section>
            ))}

            <section className="border-line border-t pt-8">
              <p className="eyebrow text-gold">{t.legal.contactLabel}</p>
              <p className="text-muted-foreground mt-4 text-[0.9375rem]">
                <a href={`mailto:${contact.email}`} className="hover:text-gold transition-colors">
                  {contact.email}
                </a>
                {" · "}
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold font-mono transition-colors"
                >
                  {contact.whatsapp}
                </a>
              </p>
            </section>

            <p className="text-muted-foreground/70 font-mono text-[0.6875rem] tracking-wide">
              {t.legal.privacyNote}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
