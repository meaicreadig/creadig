"use client"

import { useCallback, useEffect, useState } from "react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { Check, ShieldCheck, SlidersHorizontal, X } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import {
  ACCEPT_ALL,
  CONSENT_OPEN_EVENT,
  ESSENTIAL_ONLY,
  optionalCategories,
  readConsent,
  writeConsent,
  type ConsentChoice,
  type OptionalCategory,
} from "@/lib/consent"

/** Kleiner Schalter im Hairline-Stil der Seite — Gold, wenn aktiv. */
function Switch({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  label: string
  onChange?: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-6 w-11 shrink-0 border transition-colors duration-[var(--dur-2)] ${
        checked ? "border-gold bg-gold/25" : "border-line-strong bg-transparent"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1/2 size-4 -translate-y-1/2 transition-all duration-[var(--dur-2)] ease-brand ${
          checked ? "bg-gold left-[1.5rem]" : "bg-line-strong left-[0.15rem]"
        }`}
      />
    </button>
  )
}

/**
 * Cookie-Consent nach DSGVO / § 25 TDDDG.
 *
 * Drei Wege beim Erstbesuch: alles akzeptieren, nur essenzielle, oder
 * individuelle Präferenzen. Essenziell ist immer aktiv und nicht abwählbar.
 * Nicht-essenzielle Speicherung passiert erst NACH der Einwilligung —
 * Sprache und Erscheinungsbild werden ohne Einwilligung nur in der laufenden
 * Sitzung gehalten (siehe locale-provider / theme-provider).
 *
 * SEC-4 — der Drittland-Hinweis steht jetzt drin, und zwar OBEN, nicht im
 * aufklappbaren Detail. „Alle akzeptieren" schaltet die Reichweitenmessung
 * mit ein, und die läuft über Vercel Inc. in den USA; eine Einwilligung nach
 * Art. 49 Abs. 1 lit. a DSGVO ist nur wirksam, wenn der Betroffene das
 * Drittland und dessen Risiken vorher kennt. Wer den Knopf sieht, muss den
 * Satz gelesen haben können. Begründung siehe lib/consent.ts.
 */
export function CookieConsent() {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState(false)
  const [choice, setChoice] = useState<ConsentChoice>(ESSENTIAL_ONLY)
  /** Erst nach der Hydration entscheiden, sonst Markup-Mismatch. */
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = readConsent()
    if (stored) {
      setChoice({ functional: stored.functional, statistics: stored.statistics })
    } else {
      setOpen(true)
    }
    setReady(true)
  }, [])

  // Footer-Link „Cookie-Einstellungen" öffnet das Banner erneut — mit Details.
  useEffect(() => {
    const reopen = () => {
      const stored = readConsent()
      if (stored) setChoice({ functional: stored.functional, statistics: stored.statistics })
      setDetails(true)
      setOpen(true)
    }
    window.addEventListener(CONSENT_OPEN_EVENT, reopen)
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen)
  }, [])

  const decide = useCallback((next: ConsentChoice) => {
    writeConsent(next)
    setChoice(next)
    setOpen(false)
    setDetails(false)
  }, [])

  if (!ready || !open) return null

  const decided = readConsent() !== null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 md:px-6 md:pb-6"
    >
      <div className="border-line-strong bg-background/97 relative mx-auto w-full max-w-4xl rounded-lg border elevation-3 backdrop-blur-xl">
        <span aria-hidden="true" className="bg-gold absolute inset-x-0 top-0 h-px" />

        {/* Erneut geöffnet? Dann darf man ohne neue Entscheidung wieder zumachen. */}
        {decided && (
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setDetails(false)
            }}
            aria-label={t.consent.close}
            className="text-muted-foreground hover:text-gold-text absolute top-4 right-4 transition-colors duration-[var(--dur-2)]"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        )}

        <div className="max-h-[75dvh] overflow-y-auto px-6 py-7 md:px-9 md:py-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-gold size-4 shrink-0" strokeWidth={1.5} />
            <p id="consent-title" className="eyebrow text-muted-foreground">
              {details ? t.consent.settingsTitle : t.consent.title}
            </p>
          </div>

          <p className="type-body text-foreground/90 mt-5 max-w-2xl text-pretty">
            {t.consent.intro}
          </p>
          <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
            {t.consent.minors}
          </p>
          <p className="type-small text-muted-foreground mt-3 max-w-2xl text-pretty">
            {t.consent.privacyPrefix}{" "}
            <Link
              href="/datenschutz"
              className="text-gold-text underline underline-offset-4 hover:opacity-80"
            >
              {t.consent.privacyLink}
            </Link>
            . {t.consent.revoke}
          </p>

          {/* Art. 49 Abs. 1 lit. a DSGVO — abgesetzt, damit er nicht als
              Kleingedrucktes durchgeht. */}
          <p className="border-gold/45 text-foreground/80 type-small mt-6 max-w-2xl border-l-2 pl-4 text-pretty">
            {t.consent.thirdCountry}
          </p>

          {details && (
            <div className="border-line mt-8 flex flex-col border-t">
              {/* Essenziell — immer aktiv, nicht abwählbar. */}
              <div className="border-line flex items-start gap-5 border-b py-5">
                <Switch checked disabled label={t.consent.categories.essential.name} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-foreground text-base font-semibold">
                      {t.consent.categories.essential.name}
                    </p>
                    <span className="border-gold/45 text-gold-text eyebrow border px-2 py-0.5">
                      {t.consent.alwaysActive}
                    </span>
                  </div>
                  <p className="type-small text-muted-foreground mt-2.5 text-pretty">
                    {t.consent.categories.essential.body}
                  </p>
                </div>
              </div>

              {optionalCategories.map((category: OptionalCategory) => (
                <div key={category} className="border-line flex items-start gap-5 border-b py-5">
                  <Switch
                    checked={choice[category]}
                    label={t.consent.categories[category].name}
                    onChange={(next) => setChoice((prev) => ({ ...prev, [category]: next }))}
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-foreground text-base font-semibold">
                        {t.consent.categories[category].name}
                      </p>
                    </div>
                    <p className="type-small text-muted-foreground mt-2.5 text-pretty">
                      {t.consent.categories[category].body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => decide(ACCEPT_ALL)}
              className="cta-outline inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm tracking-wide"
            >
              <span className="group-hover/cta:text-gold-soft relative z-10 flex items-center gap-2.5 transition-colors duration-[var(--dur-2)]">
                <Check className="size-4" strokeWidth={1.5} />
                {t.consent.acceptAll}
              </span>
            </button>

            <button
              type="button"
              onClick={() => decide(ESSENTIAL_ONLY)}
              className="cta-quiet inline-flex items-center justify-center px-7 py-3.5 text-sm tracking-wide"
            >
              {t.consent.essentialOnly}
            </button>

            {details ? (
              <button
                type="button"
                onClick={() => decide(choice)}
                className="cta-quiet inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm tracking-wide"
              >
                <Check className="size-4" strokeWidth={1.5} />
                {t.consent.save}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDetails(true)}
                className="text-muted-foreground hover:text-gold-text inline-flex items-center justify-center gap-2 py-3.5 text-sm tracking-wide transition-colors duration-[var(--dur-2)] sm:px-2"
              >
                <SlidersHorizontal className="size-4" strokeWidth={1.5} />
                {t.consent.customize}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
