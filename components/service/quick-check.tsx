"use client"

import { useState } from "react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { Send } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { contact } from "@/lib/site-data"
import { trackLead } from "@/lib/track"
import { useLeadSubmit } from "@/lib/use-lead"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/**
 * BF-A8 — „Kurz-Check anfragen".
 *
 * ---------------------------------------------------------------------------
 * WAS DAS IST UND WAS ES AUSDRUECKLICH NICHT IST
 * Ein Formular mit genau einem zusaetzlichen Pflichtfeld: der Adresse der
 * Seite, um die es geht. KEIN Scanner. Ein Knopf, der eine fremde Seite
 * automatisch prueft und eine Ampel ausgibt, waere das staerkste Lockmittel
 * dieser Seite — und der Widerspruch zum eigenen Angebot: Er verspricht
 * dasselbe wie ein Overlay, naemlich ein Ergebnis, fuer das niemand
 * geradesteht. Wer eine Ampel verkauft, kann nicht erklaeren, warum die
 * Ampel des Nachbarn nichts taugt.
 *
 * ---------------------------------------------------------------------------
 * DERSELBE LEAD-WEG, KEINE ZWEITE TUER
 * Gesendet wird ueber `useLeadSubmit` an `/api/lead` — mit Honeypot,
 * signiertem Zeit-Token und IP-Fenster, unveraendert aus BF-2. Ein zweiter
 * Endpunkt fuer dasselbe Anliegen waere eine zweite Tuer mit einem zweiten
 * Schloss, und das schwaechere von beiden entscheidet.
 *
 * Der Honeypot heisst weiterhin `website`; das echte Feld heisst `siteUrl`.
 * Zwei Felder mit demselben Namen wuerden dazu fuehren, dass jede ehrliche
 * Anfrage still verschluckt wird — der teuerste denkbare Fehler an dieser
 * Stelle.
 */
export function QuickCheck() {
  const { t, locale } = useLocale()
  const submitLead = useLeadSubmit()

  const [name, setName] = useState("")
  const [siteUrl, setSiteUrl] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [website, setWebsite] = useState("")
  const [privacyOk, setPrivacyOk] = useState(false)
  const [invalid, setInvalid] = useState<{
    name?: boolean
    siteUrl?: boolean
    email?: boolean
    phone?: boolean
    privacy?: boolean
  }>({})
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")

  const copy = t.quickCheck

  /**
   * Dieselbe Nachsicht wie auf dem Server: „meinbetrieb.de" ist eine richtige
   * Antwort. Streng geprueft wird nur, dass ueberhaupt ein Name mit Punkt
   * dasteht — ob die Seite erreichbar ist, sehen wir beim Ansehen.
   */
  function looksLikeSite(value: string) {
    const trimmed = value.trim()
    if (!trimmed || /\s/.test(trimmed)) return false
    try {
      const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
      return /^[^\s.]+(\.[^\s.]+)+$/.test(url.hostname)
    } catch {
      return false
    }
  }

  function validate() {
    const bad = {
      name: !name.trim(),
      siteUrl: !looksLikeSite(siteUrl),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()),
      phone: !phone.trim(),
      privacy: !privacyOk,
    }
    setInvalid(bad)
    if (bad.name) {
      setError(t.contact.errRequired)
      return false
    }
    if (bad.siteUrl) {
      setError(copy.errSite)
      return false
    }
    if (bad.email) {
      setError(t.contact.errEmail)
      return false
    }
    if (bad.phone) {
      setError(t.contact.errPhone)
      return false
    }
    if (bad.privacy) {
      setError(t.contact.errPrivacy)
      return false
    }
    setError(null)
    return true
  }

  /** Dieselben Zustaende wie im Kontaktformular — dieselbe Route, dieselben Codes. */
  function errorText(code: string | undefined) {
    if (code === "not_configured") return `${t.contact.errNotConfigured} ${contact.email}.`
    if (code === "rate_limited") return t.contact.errRateLimited
    if (code === "token_expired" || code === "token_invalid") return t.contact.errFormExpired
    return t.contact.errSendFailed
  }

  const fieldClass =
    "rounded-none border-0 border-b border-line-strong bg-transparent px-0 py-3.5 h-auto text-base shadow-none focus-visible:border-gold focus-visible:ring-0 dark:bg-transparent"

  return (
    <section
      id="kurz-check"
      aria-labelledby="kurz-check-title"
      className="border-line scroll-mt-28 border-t pt-12"
    >
      <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="kurz-check-title" className="type-h3 mt-6 text-balance">
              {copy.title}
            </h2>
            <p className="type-body text-muted-foreground mt-6 text-pretty">{copy.lead}</p>

            {/*
              Die Grenze steht VOR dem Formular, nicht im Kleingedruckten
              danach. Wer sie erst nach dem Absenden liest, fuehlt sich
              verkauft — und der Kurz-Check soll ein Gespraech eroeffnen,
              keine Erwartung, die wir nicht halten.
            */}
            <div className="border-line mt-9 border-t pt-6">
              <p className="eyebrow text-muted-foreground">{copy.limitTitle}</p>
              <p className="type-small text-muted-foreground mt-4 text-pretty">{copy.limitBody}</p>
            </div>
            <p className="type-small text-foreground/85 mt-6 text-pretty">{copy.humanNote}</p>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={0.08}>
            <form
              className="relative flex flex-col gap-8"
              noValidate
              onSubmit={async (e) => {
                e.preventDefault()
                if (!validate()) return

                setStatus("sending")
                setError(null)
                try {
                  const data = await submitLead({
                    name,
                    email,
                    phone,
                    message,
                    siteUrl,
                    privacyOk,
                    locale,
                    website,
                    source: "kurzcheck",
                  })

                  if (data.ok) {
                    setStatus("sent")
                    // Nur der Herkunftsname, nie ein Feldinhalt — auch nicht
                    // die Adresse: Sie waere hier eine fremde Firma in einer
                    // Messreihe, und dafuer gibt es keine Einwilligung.
                    trackLead("kurzcheck")
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
              <FieldGroup className="gap-8">
                {/*
                  Die Adresse steht als ERSTES Feld. Sie ist der Grund, aus
                  dem dieses Formular anders ist als das Kontaktformular —
                  und das einzige Feld, ohne das die Anfrage nicht bearbeitbar
                  ist.
                */}
                <Field>
                  <FieldLabel htmlFor="quickcheck-site" className="eyebrow text-muted-foreground">
                    {copy.siteLabel}
                  </FieldLabel>
                  <Input
                    id="quickcheck-site"
                    name="siteUrl"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={siteUrl}
                    onChange={(e) => {
                      setSiteUrl(e.target.value)
                      setInvalid((v) => ({ ...v, siteUrl: false }))
                    }}
                    aria-invalid={invalid.siteUrl || undefined}
                    placeholder={copy.sitePlaceholder}
                    className={`${fieldClass} ${invalid.siteUrl ? "border-destructive" : ""}`}
                  />
                </Field>

                <div className="grid gap-8 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="quickcheck-name" className="eyebrow text-muted-foreground">
                      {t.contact.nameLabel}
                    </FieldLabel>
                    <Input
                      id="quickcheck-name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setInvalid((v) => ({ ...v, name: false }))
                      }}
                      aria-invalid={invalid.name || undefined}
                      placeholder={t.contact.namePlaceholder}
                      className={`${fieldClass} ${invalid.name ? "border-destructive" : ""}`}
                    />
                  </Field>
                  <Field>
                    <FieldLabel
                      htmlFor="quickcheck-email"
                      className="eyebrow text-muted-foreground"
                    >
                      {t.contact.emailLabel}
                    </FieldLabel>
                    <Input
                      id="quickcheck-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setInvalid((v) => ({ ...v, email: false }))
                      }}
                      aria-invalid={invalid.email || undefined}
                      placeholder={t.contact.emailPlaceholder}
                      className={`${fieldClass} ${invalid.email ? "border-destructive" : ""}`}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="quickcheck-phone" className="eyebrow text-muted-foreground">
                    {t.contact.phoneLabel}
                  </FieldLabel>
                  <Input
                    id="quickcheck-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setInvalid((v) => ({ ...v, phone: false }))
                    }}
                    aria-invalid={invalid.phone || undefined}
                    placeholder={t.contact.phonePlaceholder}
                    className={`${fieldClass} ${invalid.phone ? "border-destructive" : ""}`}
                  />
                </Field>

                {/* Freiwillig — die Adresse hat die Frage schon beantwortet. */}
                <Field>
                  <FieldLabel htmlFor="quickcheck-message" className="eyebrow text-muted-foreground">
                    {copy.messageLabel}
                  </FieldLabel>
                  <Textarea
                    id="quickcheck-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    placeholder={copy.messagePlaceholder}
                    className={`${fieldClass} resize-none`}
                  />
                </Field>

                {/*
                  Honeypot, gleiche Bauart wie im Kontaktformular: kein
                  `display:none` (manche Bots erkennen das), ausserhalb des
                  sichtbaren Bereichs, aus der Tab-Reihenfolge genommen und
                  fuer Screenreader ausgeblendet.
                */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
                >
                  <label htmlFor="quickcheck-website">Website</label>
                  <input
                    id="quickcheck-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </FieldGroup>

              <div className="border-line border-t pt-7">
                <label
                  htmlFor="quickcheck-privacy"
                  className="flex cursor-pointer items-start gap-3.5"
                >
                  <input
                    id="quickcheck-privacy"
                    type="checkbox"
                    checked={privacyOk}
                    onChange={(e) => {
                      setPrivacyOk(e.target.checked)
                      setInvalid((v) => ({ ...v, privacy: false }))
                    }}
                    aria-invalid={invalid.privacy || undefined}
                    className={`accent-gold mt-1 size-4 shrink-0 rounded-none ${
                      invalid.privacy ? "outline-destructive outline-2 outline-offset-2" : ""
                    }`}
                  />
                  <span className="type-small text-muted-foreground text-pretty">
                    {t.contact.privacyConsentPrefix}{" "}
                    <Link
                      href="/datenschutz"
                      className="text-gold-text underline underline-offset-4 hover:opacity-80"
                    >
                      {t.contact.privacyConsentLink}
                    </Link>{" "}
                    {t.contact.privacyConsentSuffix}
                  </span>
                </label>
              </div>

              {error && (
                <p
                  role="alert"
                  className="border-destructive/40 text-destructive border-l-2 py-1 pl-4 text-sm"
                >
                  {error}
                </p>
              )}

              {/* „Angekommen" erscheint erst, wenn der Server es bestaetigt hat. */}
              {status === "sent" && (
                <div role="status" className="border-gold bg-muted border-l-2 py-4 pl-5">
                  <p className="type-small text-foreground">{copy.sentTitle}</p>
                  <p className="type-small text-muted-foreground mt-2 text-pretty">
                    {copy.sentBody}
                  </p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="group from-gold-soft to-gold relative inline-flex items-center gap-2.5 overflow-hidden bg-gradient-to-br px-7 py-3.5 text-sm tracking-wide text-[#201e1b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -translate-y-full bg-[#201e1b] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                  />
                  <span className="group-hover:text-gold-soft relative z-10 flex items-center gap-2.5 transition-colors duration-500">
                    <Send className="size-4" strokeWidth={1.5} />
                    {status === "sending" ? t.contact.sending : copy.submit}
                  </span>
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
