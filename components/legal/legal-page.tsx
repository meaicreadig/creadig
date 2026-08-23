"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowLeft, SlidersHorizontal } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import {
  contact,
  imprintComplete,
  imprintDetails,
  processors,
  processorsConfirmed,
} from "@/lib/site-data"
import { openConsentSettings } from "@/lib/consent"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

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

  /*
    `pending` heisst: Die Zeile steht da, damit das Impressum vollstaendig
    aussieht — aber sie traegt sichtbar die Kennzeichnung "Platzhalter". Ein
    unmarkierter Platzhalter waere eine falsche Angabe; eine fehlende Zeile
    waere ein halbes Impressum. Beides ist schlechter als das hier, und der
    Pending-Hinweis unten bleibt ohnehin stehen, bis die echten Werte da sind.
  */
  const formalRows: { label: string; value: string; pending?: boolean }[] = [
    ...(imprintDetails.legalForm
      ? [{ label: t.legal.legalFormLabel, value: imprintDetails.legalForm }]
      : []),
    ...(vatValue
      ? [{ label: t.legal.vatLabel, value: vatValue }]
      : imprintDetails.taxStatusPending
        ? [{ label: t.legal.vatLabel, value: t.legal.taxStatusPending, pending: true }]
        : []),
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

        <SectionEyebrow label="creaDIG" className="mt-10" />
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
                ) : imprintDetails.phonePending ? (
                  /*
                    Bewusst KEIN `tel:`-Link: Ein Anruf-Knopf, der ins Leere
                    fuehrt, ist schlimmer als kein Knopf. Die Zeile sagt, dass
                    die Nummer folgt, und ist als Platzhalter gekennzeichnet.
                  */
                  <li className="flex flex-wrap items-center gap-2">
                    <span>{t.legal.phonePending}</span>
                    <span className="border-gold/50 text-gold-text eyebrow border px-2 py-0.5">
                      {t.legal.placeholderMark}
                    </span>
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
                      <dd className="text-foreground flex flex-wrap items-center gap-2 leading-relaxed text-pretty">
                        <span>{row.value}</span>
                        {row.pending && (
                          <span className="border-gold/50 text-gold-text eyebrow border px-2 py-0.5">
                            {t.legal.placeholderMark}
                          </span>
                        )}
                      </dd>
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

            {/*
              SEC-2 — die Dienstleister an EINER Stelle, aus lib/site-data.ts.
              Vorher standen sie verstreut in drei Absaetzen; wer wissen
              wollte, wohin seine Daten gehen, musste sie zusammensuchen, und
              wer die Seite pflegt, haette beim naechsten Dienst einen davon
              vergessen.
            */}
            <section className="border-line border-t pt-8">
              <p className="eyebrow text-gold-text">{t.legal.processorsLabel}</p>
              <p className="type-body text-muted-foreground mt-4 text-pretty">
                {t.legal.processorsIntro}
              </p>

              <ul className="mt-8 flex flex-col gap-px">
                {processors.map((processor) => (
                  <li key={processor.key} className="border-line border-t pt-5 pb-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-foreground text-base font-semibold">
                        {processor.company}
                      </p>
                      <span className="text-muted-foreground type-small font-mono">
                        {processor.country}
                      </span>
                      {/* Kein behaupteter Vertrag: solange der Owner ihn nicht
                          bestaetigt hat, steht das sichtbar dran. */}
                      {!processor.dpaConfirmed && (
                        <span className="border-gold/50 text-gold-text eyebrow border px-2 py-0.5">
                          {t.legal.processorPendingMark}
                        </span>
                      )}
                    </div>
                    {/* R-1: die Dienste mit Namen. "Vercel Inc." allein sagt
                        nicht, dass dort zwei getrennte Messungen laufen. */}
                    <p className="eyebrow text-muted-foreground mt-4">
                      {t.legal.processorServicesLabel}
                    </p>
                    <ul className="mt-2.5 flex flex-wrap gap-2">
                      {processor.services.map((service) => (
                        <li
                          key={service}
                          className="border-line-strong text-muted-foreground type-small border px-2.5 py-1"
                        >
                          {service}
                        </li>
                      ))}
                    </ul>
                    <p className="type-small text-muted-foreground mt-3 text-pretty">
                      {t.legal.processorPurposes[processor.key]}
                    </p>
                    <p className="type-small text-muted-foreground mt-2.5">
                      {t.legal.processorSafeguardLabel}: {t.legal.processorSafeguardScc}
                      {" · "}
                      <a
                        href={processor.dpaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-text underline underline-offset-4 hover:opacity-80"
                      >
                        {t.legal.processorDpaLink}
                      </a>
                    </p>
                  </li>
                ))}
              </ul>

              {/* Faellt automatisch weg, sobald alle Vertraege bestaetigt sind. */}
              {!processorsConfirmed && (
                <p className="border-gold/40 bg-muted type-small text-muted-foreground mt-6 border-l-2 py-4 pl-5 text-pretty">
                  {t.legal.processorPendingNote}
                </p>
              )}
            </section>

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

            <p className="text-muted-foreground text-meta">
              {t.legal.privacyNote}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
