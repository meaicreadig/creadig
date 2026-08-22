"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, CalendarDays, Send } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { contact } from "@/lib/site-data"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

export function Contact() {
  const { t } = useLocale()
  const [name, setName] = useState("")
  const [business, setBusiness] = useState("")
  const [message, setMessage] = useState("")
  // Ohne Einwilligung wird nichts uebergeben — weder an WhatsApp noch per Mail.
  const [privacyOk, setPrivacyOk] = useState(false)
  const [invalid, setInvalid] = useState<{
    name?: boolean
    message?: boolean
    privacy?: boolean
  }>({})
  const [error, setError] = useState<string | null>(null)
  /*
   * UX-2: Nach dem Klick stand bisher nichts da. Ein blockiertes Popup und
   * eine geglueckte Uebergabe sahen exakt gleich aus — beide unsichtbar.
   * `handoff` ist bewusst KEINE Erfolgsmeldung: Die Nachricht ist erst raus,
   * wenn der Absender sie in WhatsApp bzw. seinem Mailprogramm bestaetigt,
   * und genau das steht dann dort.
   */
  const [handoff, setHandoff] = useState<"whatsapp" | "mail" | null>(null)

  /** Beide Wege laufen durch dieselbe Pruefung. `true` = darf uebergeben werden. */
  function validate() {
    const bad = {
      name: !name.trim(),
      message: !message.trim(),
      privacy: !privacyOk,
    }
    setInvalid(bad)
    if (bad.name || bad.message) {
      setError(t.contact.errRequired)
      return false
    }
    if (bad.privacy) {
      setError(t.contact.errPrivacy)
      return false
    }
    setError(null)
    return true
  }

  const composed = [
    name && `${t.contact.nameLabel}: ${name}`,
    business && `${t.contact.businessLabel}: ${business}`,
    message,
  ]
    .filter(Boolean)
    .join("\n")

  const whatsappHref = `${contact.whatsappHref}?text=${encodeURIComponent(
    composed || "Guten Tag creaDIG, ich interessiere mich für ein Projekt.",
  )}`
  const mailHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    "Projektanfrage — creaDIG",
  )}&body=${encodeURIComponent(composed)}`

  // Editorial-Variante: nur Grundlinie, kein Kasten — passend zum Hairline-Raster der Seite.
  const fieldClass =
    "rounded-none border-0 border-b border-line-strong bg-transparent px-0 py-3.5 h-auto text-base shadow-none focus-visible:border-gold focus-visible:ring-0 dark:bg-transparent"

  return (
    <section id="kontakt" aria-labelledby="kontakt-title" className="border-line border-b">
      <div className="section-shell">
        <Reveal>
          <SectionEyebrow label={t.contact.eyebrow} />
        </Reveal>

        <div className="mt-7 grid gap-x-14 gap-y-16 lg:grid-cols-12">
          {/* Formular */}
          <div className="lg:col-span-7">
            <Reveal>
              <h2 id="kontakt-title" className="type-h2 text-balance">
                {t.contact.title}
              </h2>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="type-lead text-muted-foreground mt-7 max-w-xl text-pretty">
                {t.contact.lead}
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <form
                className="mt-12 flex flex-col gap-8"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()
                  // Gleiche Regel wie in der alten `ct_*`-Logik: ohne Name und
                  // ohne Anliegen wird nichts verschickt. Neu: ohne Einwilligung
                  // ebenfalls nicht.
                  if (!validate()) {
                    setHandoff(null)
                    return
                  }
                  /*
                    Der Rueckgabewert von `window.open` ist die einzige Stelle,
                    an der ein blockiertes Popup ueberhaupt bemerkbar ist. Ohne
                    diese Pruefung sah "Browser hat es geblockt" genauso aus wie
                    "hat geklappt": naemlich nach gar nichts.
                  */
                  const opened = window.open(whatsappHref, "_blank", "noopener,noreferrer")
                  if (!opened) {
                    setHandoff(null)
                    setError(`${t.contact.errBlocked} ${contact.email}.`)
                    return
                  }
                  setHandoff("whatsapp")
                }}
              >
                <FieldGroup className="gap-8">
                  <div className="grid gap-8 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="contact-name" className="eyebrow text-muted-foreground">
                        {t.contact.nameLabel}
                      </FieldLabel>
                      <Input
                        id="contact-name"
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
                        htmlFor="contact-business"
                        className="eyebrow text-muted-foreground"
                      >
                        {t.contact.businessLabel}
                      </FieldLabel>
                      <Input
                        id="contact-business"
                        value={business}
                        onChange={(e) => setBusiness(e.target.value)}
                        placeholder={t.contact.businessPlaceholder}
                        className={fieldClass}
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="contact-message" className="eyebrow text-muted-foreground">
                      {t.contact.messageLabel}
                    </FieldLabel>
                    <Textarea
                      id="contact-message"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value)
                        setInvalid((v) => ({ ...v, message: false }))
                      }}
                      aria-invalid={invalid.message || undefined}
                      rows={3}
                      placeholder={t.contact.messagePlaceholder}
                      className={`${fieldClass} resize-none ${invalid.message ? "border-destructive" : ""}`}
                    />
                  </Field>
                </FieldGroup>

                {/*
                  Pflicht-Einwilligung. Bewusst NICHT vorangekreuzt und
                  bewusst vor dem Absende-Knopf: erst lesen, dann uebergeben.
                */}
                <div className="border-line border-t pt-7">
                  <label
                    htmlFor="contact-privacy"
                    className="flex cursor-pointer items-start gap-3.5"
                  >
                    <input
                      id="contact-privacy"
                      type="checkbox"
                      checked={privacyOk}
                      onChange={(e) => {
                        setPrivacyOk(e.target.checked)
                        setInvalid((v) => ({ ...v, privacy: false }))
                      }}
                      aria-invalid={invalid.privacy || undefined}
                      aria-describedby="contact-handoff"
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
                  <p id="contact-handoff" className="text-muted-foreground text-meta mt-4">
                    {t.contact.handoffNote}
                  </p>
                </div>

                {error && (
                  <p role="alert" className="border-destructive/40 text-destructive border-l-2 py-1 pl-4 text-sm">
                    {error}
                  </p>
                )}

                {/*
                  Kein Erfolgs-Haken: Die Anfrage ist an dieser Stelle noch
                  NICHT bei uns. `role="status"` statt `role="alert"`, weil es
                  eine Zustandsmeldung ist und keine Fehlermeldung.
                */}
                {handoff && !error && (
                  <div
                    role="status"
                    className="border-gold/45 bg-muted border-l-2 py-4 pl-5"
                  >
                    <p className="type-small text-foreground">{t.contact.handoffTitle}</p>
                    <p className="type-small text-muted-foreground mt-2 text-pretty">
                      {handoff === "whatsapp" ? t.contact.handoffWhatsapp : t.contact.handoffMail}
                    </p>
                    <a
                      href={handoff === "whatsapp" ? whatsappHref : mailHref}
                      {...(handoff === "whatsapp"
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="text-gold-text hover:text-foreground text-meta mt-3 inline-block transition-colors duration-500"
                    >
                      {t.contact.handoffRetry}
                    </a>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="group from-gold-soft to-gold relative inline-flex items-center gap-2.5 overflow-hidden bg-gradient-to-br px-7 py-3.5 text-sm tracking-wide text-[#201e1b]"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -translate-y-full bg-[#201e1b] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                    />
                    <span className="group-hover:text-gold-soft relative z-10 flex items-center gap-2.5 transition-colors duration-500">
                      <WhatsAppIcon className="size-4" />
                      {t.contact.submitWhatsapp}
                    </span>
                  </button>
                  {/*
                    Kein <a href="mailto:…">: der Link haette die Pflichtfelder
                    und die Einwilligung umgangen. Beide Wege laufen jetzt durch
                    dieselbe Pruefung.
                  */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!validate()) {
                        setHandoff(null)
                        return
                      }
                      setHandoff("mail")
                      window.location.href = mailHref
                    }}
                    className="border-line-strong hover:border-gold inline-flex items-center gap-2.5 border px-7 py-3.5 text-sm tracking-wide transition-colors duration-500"
                  >
                    <Send className="size-4" strokeWidth={1.5} />
                    {t.contact.submitEmail}
                  </button>
                </div>
              </form>
            </Reveal>
          </div>

          {/* Direkte Wege */}
          <div className="flex flex-col gap-px lg:col-span-5">
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
                    kostet. Kein neues Versprechen - beschrieben ist, was
                    ohnehin passiert (siehe Prozess-Schritt „Verstehen" und der
                    Foerder-Hinweis „sagen wir das offen").
                  */}
                  <span className="type-small text-foreground/85 mt-3 block text-pretty">
                    {t.contact.appointmentValue}
                  </span>
                  <span className="text-gold-text mt-3 block text-sm">{t.contact.appointmentCta}</span>
                </span>
                <ArrowUpRight
                  className="text-line-strong group-hover:text-gold-text mt-1 size-4 transition-colors duration-500"
                  strokeWidth={1.5}
                />
              </Link>
            </Reveal>

            {/* Sitz = Osnabrück (ICO). Die Schweiz ist Markt, nicht Standort. */}
            <Reveal delay={0.24} className="border-line mt-10 border-t pt-7">
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
        </div>
      </div>
    </section>
  )
}
