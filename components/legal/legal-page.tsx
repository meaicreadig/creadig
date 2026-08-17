"use client"

import Link from "next/link"
import { ArrowLeft, SlidersHorizontal } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { contact, imprintComplete, imprintDetails } from "@/lib/site-data"
import { openConsentSettings } from "@/lib/consent"

/**
 * Gemeinsames Gerüst für /impressum und /datenschutz.
 * Die förmlichen Pflichtangaben stehen noch aus — die Struktur dafür existiert
 * aber (siehe `imprintDetails`): jedes Feld erscheint, sobald der Inhaber den
 * Wert geliefert hat, und der Pending-Hinweis verschwindet erst, wenn alle
 * Pflichtfelder vollständig sind. Bis dahin benennen die Seiten den offenen
 * Punkt ehrlich, statt etwas zu behaupten.
 */
export function LegalPage({ kind }: { kind: "imprint" | "privacy" }) {
  const { t } = useLocale()
  const title = kind === "imprint" ? t.legal.imprintTitle : t.legal.privacyTitle

  // Umsatzsteuer: entweder USt-IdNr. (§ 27 a UStG) oder § 19-Hinweis — nie beides.
  const vatValue = imprintDetails.vatId
    ? imprintDetails.vatId
    : imprintDetails.smallBusiness
      ? t.legal.smallBusinessNote
      : null

  const formalRows: { label: string; value: string }[] = [
    ...(imprintDetails.legalForm
      ? [{ label: t.legal.legalFormLabel, value: imprintDetails.legalForm }]
      : []),
    ...(vatValue ? [{ label: t.legal.vatLabel, value: vatValue }] : []),
    ...(imprintDetails.mstvResponsible
      ? [{ label: t.legal.mstvLabel, value: imprintDetails.mstvResponsible }]
      : []),
  ]

  return (
    <main className="min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-6 pt-32 pb-24 md:px-10 md:pt-40">
        <Link
          href="/"
          className="text-muted-foreground hover:text-gold-text type-small inline-flex items-center gap-2 transition-colors duration-300"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          {t.legal.back}
        </Link>

        <div className="mt-10 flex items-center gap-4">
          <span aria-hidden="true" className="bg-gold h-px w-10" />
          <p className="eyebrow text-muted-foreground">creaDIG</p>
        </div>
        <h1 className="type-h1 mt-6">{title}</h1>

        {kind === "imprint" ? (
          <div className="mt-12 flex flex-col gap-10">
            <section className="border-line border-t pt-8">
              <p className="eyebrow text-gold-text">{t.legal.providerLabel}</p>
              <p className="text-foreground mt-4 text-lg">
                {contact.address.company} — {contact.address.owner}
              </p>
              <address className="type-small text-muted-foreground mt-3 not-italic">
                {contact.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </section>

            <section className="border-line border-t pt-8">
              <p className="eyebrow text-gold-text">{t.legal.responsible}</p>
              <p className="text-foreground mt-4 text-lg">{contact.address.owner}</p>
              <p className="type-small text-muted-foreground mt-2">{t.legal.sameAddress}</p>
            </section>

            <section className="border-line border-t pt-8">
              <p className="eyebrow text-gold-text">{t.legal.contactLabel}</p>
              <ul className="type-small mt-4 flex flex-col gap-2">
                <li>
                  <a
                    href={contact.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold-text font-mono transition-colors duration-300"
                  >
                    {contact.whatsapp}
                  </a>
                </li>
                {imprintDetails.phone ? (
                  <li>
                    <a
                      href={`tel:${imprintDetails.phone.replace(/[^+\d]/g, "")}`}
                      className="hover:text-gold-text font-mono transition-colors duration-300"
                    >
                      {imprintDetails.phone}
                    </a>
                  </li>
                ) : null}
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-gold-text transition-colors duration-300"
                  >
                    {contact.email}
                  </a>
                </li>
              </ul>
            </section>

            {/* Erscheint Feld für Feld, sobald der Inhaber die Werte liefert. */}
            {formalRows.length > 0 ? (
              <section className="border-line border-t pt-8">
                <p className="eyebrow text-gold-text">{t.legal.formalLabel}</p>
                <dl className="type-small mt-4 flex flex-col gap-4">
                  {formalRows.map((row) => (
                    <div key={row.label} className="flex flex-col gap-1">
                      <dt className="text-muted-foreground">{row.label}</dt>
                      <dd className="text-foreground leading-relaxed text-pretty">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {/* Fällt automatisch weg, sobald alle Pflichtfelder vollständig sind. */}
            {!imprintComplete ? (
              <section className="border-gold/40 bg-muted border-l-2 py-5 pl-6">
                <p className="eyebrow text-gold-text">{t.legal.pending}</p>
                <p className="type-body text-muted-foreground mt-3 text-pretty">
                  {t.legal.pendingNote}
                </p>
              </section>
            ) : null}
          </div>
        ) : (
          <div className="mt-12 flex flex-col gap-10">
            <p className="type-lead text-foreground text-pretty">
              {t.legal.privacyIntro}
            </p>

            {t.legal.privacyPoints.map((point) => (
              <section key={point.title} className="border-line border-t pt-8">
                <p className="eyebrow text-gold-text">{point.title}</p>
                <p className="type-body text-muted-foreground mt-4 text-pretty">
                  {point.body}
                </p>
              </section>
            ))}

            {/* Widerruf muss so leicht sein wie die Einwilligung. */}
            <section className="border-line border-t pt-8">
              <p className="eyebrow text-gold-text">{t.consent.settingsTitle}</p>
              <button
                type="button"
                onClick={openConsentSettings}
                className="border-line-strong hover:border-gold hover:text-gold-text mt-5 inline-flex items-center gap-2.5 border px-6 py-3 text-sm tracking-wide transition-colors duration-500"
              >
                <SlidersHorizontal className="size-4" strokeWidth={1.5} />
                {t.consent.settingsLabel}
              </button>
            </section>

            <section className="border-line border-t pt-8">
              <p className="eyebrow text-gold-text">{t.legal.responsible}</p>
              <p className="type-small text-foreground mt-4">
                {contact.address.company} — {contact.address.owner}
              </p>
              <address className="type-small text-muted-foreground mt-3 not-italic">
                {contact.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </section>

            <section className="border-line border-t pt-8">
              <p className="eyebrow text-gold-text">{t.legal.contactLabel}</p>
              <p className="type-small text-muted-foreground mt-4">
                <a href={`mailto:${contact.email}`} className="hover:text-gold-text transition-colors">
                  {contact.email}
                </a>
                {" · "}
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-text font-mono transition-colors"
                >
                  {contact.whatsapp}
                </a>
              </p>
            </section>

            <p className="text-muted-foreground/70 text-meta">
              {t.legal.privacyNote}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
