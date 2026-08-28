"use client"

import { useState } from "react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { Send } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { cn } from "@/lib/utils"
import { contact } from "@/lib/site-data"
import { trackLead } from "@/lib/track"
import { useLeadSubmit } from "@/lib/use-lead"

/**
 * FEAT-1 — der Nachfragepfad je Produkt.
 *
 * ---------------------------------------------------------------------------
 * WARUM
 * Die Produktseiten waren Sackgassen. Wer bis ans Ende einer Produkt-Welt
 * gelesen hat, hat das Maximum an Interesse erreicht, das diese Seite erzeugen
 * kann — und fand dort zwei Knöpfe: „Kontakt" und „Alle Produkte". Beide
 * führen weg vom Produkt. Wer wissen will, wann CASSAMEA kommt, musste ein
 * allgemeines Formular ausfüllen und selbst hinschreiben, worum es ging.
 *
 * Hier steht genau eine Frage: Adresse hinterlassen, wir melden uns, wenn es
 * so weit ist. Ein Pflichtfeld, ein Knopf.
 *
 * ---------------------------------------------------------------------------
 * KEIN ZWEITER VERSANDWEG
 * Es läuft durch denselben Endpunkt wie alles andere (`/api/lead`), nur mit
 * `source: "produkt-<slug>"`. Dadurch ist im Postfach sofort erkennbar, woher
 * die Anfrage kam, ohne dass jemand eine zweite Zustellstrecke pflegen muss.
 * Auch hier: Erfolg erst nach `ok: true`, nie nach dem Klick allein.
 *
 * ---------------------------------------------------------------------------
 * KEIN TELEFON-PFLICHTFELD
 * Anders als im Kontaktformular. Dort ist der Rückruf der eigentliche Weg;
 * hier geht es um „sag mir Bescheid", und eine Pflicht-Telefonnummer kostet an
 * dieser Stelle mehr Einträge, als sie wert ist. Der Endpunkt bekommt deshalb
 * einen ausdrücklichen Vermerk statt einer erfundenen Nummer.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER NICHT STEHT
 * Kein Datum, keine Roadmap, kein „Q3". Wann ein Produkt öffnet, weiß nur der
 * Owner, und geraten wird es nicht. Der Text verspricht deshalb nur das, was
 * sicher eingehalten werden kann: eine Nachricht, wenn es so weit ist.
 */
export function ProductInterest({
  slug,
  productName,
}: {
  slug: string
  productName: string
}) {
  const { t, locale } = useLocale()
  const submitLead = useLeadSubmit()
  const copy = t.produktPage.interest

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [website, setWebsite] = useState("")
  const [privacyOk, setPrivacyOk] = useState(false)
  const [invalid, setInvalid] = useState<{ email?: boolean; privacy?: boolean }>({})
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState<string | null>(null)

  const fieldClass =
    "w-full rounded-none border-0 border-b border-line-strong bg-transparent px-0 py-3 text-base text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground focus:border-gold"

  /** Dieselben Codes wie Kontakt, Kurz-Check und Termin — ein Endpunkt, eine Sprache. */
  function errorText(code: string | undefined) {
    if (code === "not_configured") return `${t.contact.errNotConfigured} ${contact.email}.`
    if (code === "rate_limited") return t.contact.errRateLimited
    if (code === "token_expired" || code === "token_invalid") return t.contact.errFormExpired
    return t.contact.errSendFailed
  }

  if (status === "sent") {
    return (
      <section aria-labelledby={`interesse-${slug}-title`} className="section-seam">
        <div className="section-shell-tight">
          <Reveal>
            <div
              role="status"
              className="border-gold bg-muted border-l-2 py-6 pl-6"
            >
              <h2 id={`interesse-${slug}-title`} className="type-h4">
                {copy.sentTitle}
              </h2>
              <p className="type-body text-muted-foreground mt-3 max-w-xl text-pretty">
                {copy.sentBody}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby={`interesse-${slug}-title`} className="section-seam">
      <div className="section-shell-tight">
        <div className="grid gap-x-14 gap-y-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id={`interesse-${slug}-title`} className="type-h3 mt-7 text-balance">
              {copy.title}
            </h2>
            <p className="type-body text-muted-foreground mt-5 max-w-md text-pretty">
              {copy.body.replace("{product}", productName)}
            </p>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7">
            <form
              className="relative flex flex-col gap-7"
              noValidate
              onSubmit={async (e) => {
                e.preventDefault()
                const bad = {
                  email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()),
                  privacy: !privacyOk,
                }
                setInvalid(bad)
                if (bad.email) {
                  setError(t.contact.errEmail)
                  return
                }
                if (bad.privacy) {
                  setError(t.contact.errPrivacy)
                  return
                }
                setError(null)
                setStatus("sending")

                try {
                  const data = await submitLead({
                    name: name.trim() || productName,
                    email,
                    phone: copy.phoneOmitted,
                    privacyOk,
                    locale,
                    website,
                    source: `produkt-${slug}`,
                    message: copy.messageTemplate.replace("{product}", productName),
                  })

                  if (data.status >= 200 && data.status < 300 && data.ok) {
                    setStatus("sent")
                    trackLead(`produkt-${slug}`)
                    return
                  }
                  setStatus("idle")
                  setError(errorText(data.error))
                } catch {
                  setStatus("idle")
                  setError(t.contact.errSendFailed)
                }
              }}
            >
              <label className="flex flex-col gap-2">
                <span className="eyebrow text-muted-foreground">{copy.emailLabel}</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setInvalid((v) => ({ ...v, email: false }))
                  }}
                  aria-invalid={invalid.email || undefined}
                  placeholder={copy.emailPlaceholder}
                  className={cn(fieldClass, invalid.email && "border-destructive")}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="eyebrow text-muted-foreground">{copy.nameLabel}</span>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={copy.namePlaceholder}
                  className={fieldClass}
                />
              </label>

              {/* Honeypot — ausserhalb des Sichtbereichs statt display:none. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
              >
                <label htmlFor={`interest-website-${slug}`}>Website</label>
                <input
                  id={`interest-website-${slug}`}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3.5">
                <input
                  type="checkbox"
                  checked={privacyOk}
                  onChange={(e) => {
                    setPrivacyOk(e.target.checked)
                    setInvalid((v) => ({ ...v, privacy: false }))
                  }}
                  aria-invalid={invalid.privacy || undefined}
                  className={cn(
                    "accent-gold mt-1 size-4 shrink-0 rounded-none",
                    invalid.privacy && "outline-destructive outline-2 outline-offset-2",
                  )}
                />
                <span className="type-small text-muted-foreground text-pretty">
                  {t.contact.privacyConsentPrefix}{" "}
                  <Link href="/datenschutz" className="text-gold-text underline underline-offset-4">
                    {t.contact.privacyConsentLink}
                  </Link>{" "}
                  {t.contact.privacyConsentSuffix}
                </span>
              </label>

              {error && (
                <p
                  role="alert"
                  className="border-destructive/40 text-destructive border-l-2 py-1 pl-4 text-sm"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="cta-outline inline-flex items-center gap-2.5 self-start px-7 py-3.5 text-sm tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="size-4" strokeWidth={1.5} />
                {status === "sending" ? t.contact.sending : copy.submit}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
