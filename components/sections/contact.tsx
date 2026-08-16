"use client"

import { useState } from "react"
import { ArrowUpRight, CalendarDays, MessageSquare, Send } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { contact } from "@/lib/site-data"

/** Öffnet den Chat-Assistenten (siehe components/ai-assistant.tsx). */
function openAssistant() {
  window.dispatchEvent(new CustomEvent("creadig:open-assistant"))
}

export function Contact() {
  const { t } = useLocale()
  const [name, setName] = useState("")
  const [business, setBusiness] = useState("")
  const [message, setMessage] = useState("")

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
      <div className="mx-auto w-full max-w-[100rem] px-6 py-24 md:px-10 md:py-32 lg:px-16">
        <Reveal className="flex items-center gap-4">
          <span aria-hidden="true" className="bg-gold h-px w-10" />
          <p className="eyebrow text-muted-foreground">{t.contact.eyebrow}</p>
        </Reveal>

        <div className="mt-7 grid gap-x-14 gap-y-16 lg:grid-cols-12">
          {/* Formular */}
          <div className="lg:col-span-7">
            <Reveal>
              <h2 id="kontakt-title" className="text-display text-[clamp(2.25rem,6vw,5rem)] text-balance">
                {t.contact.title}
              </h2>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="text-muted-foreground mt-7 max-w-xl text-base leading-relaxed text-pretty md:text-lg">
                {t.contact.lead}
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <form
                className="mt-12 flex flex-col gap-8"
                onSubmit={(e) => {
                  e.preventDefault()
                  window.open(whatsappHref, "_blank", "noopener,noreferrer")
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
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.contact.namePlaceholder}
                        className={fieldClass}
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
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      placeholder={t.contact.messagePlaceholder}
                      className={`${fieldClass} resize-none`}
                    />
                  </Field>
                </FieldGroup>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="group bg-foreground text-background relative inline-flex items-center gap-2.5 overflow-hidden px-7 py-3.5 text-sm tracking-wide"
                  >
                    <span
                      aria-hidden="true"
                      className="from-gold-soft to-gold absolute inset-0 -translate-y-full bg-gradient-to-br transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                    />
                    <span className="relative z-10 flex items-center gap-2.5 transition-colors duration-500 group-hover:text-[#0a0a0b]">
                      <WhatsAppIcon className="size-4" />
                      {t.contact.submitWhatsapp}
                    </span>
                  </button>
                  <a
                    href={mailHref}
                    className="border-line-strong hover:border-gold inline-flex items-center gap-2.5 border px-7 py-3.5 text-sm tracking-wide transition-colors duration-500"
                  >
                    <Send className="size-4" strokeWidth={1.5} />
                    {t.contact.submitEmail}
                  </a>
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
                  className="text-line-strong group-hover:text-gold mt-1 size-4 transition-colors duration-500"
                  strokeWidth={1.5}
                />
              </a>
            </Reveal>

            <Reveal delay={0.12}>
              <a
                href={`${contact.whatsappHref}?text=${encodeURIComponent(
                  "Guten Tag creaDIG, ich möchte einen Termin vereinbaren.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
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
                  <span className="text-gold mt-3 block text-sm">{t.contact.appointmentCta}</span>
                </span>
                <ArrowUpRight
                  className="text-line-strong group-hover:text-gold mt-1 size-4 transition-colors duration-500"
                  strokeWidth={1.5}
                />
              </a>
            </Reveal>

            <Reveal delay={0.18}>
              <button
                type="button"
                onClick={openAssistant}
                className="group border-line hover:bg-foreground/[0.03] relative flex w-full items-start gap-5 border-t p-7 text-left transition-colors duration-500"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
                />
                <MessageSquare className="text-gold mt-1 size-5 shrink-0" strokeWidth={1.5} />
                <span className="flex-1">
                  <span className="text-display block text-xl">{t.contact.chatTitle}</span>
                  <span className="text-muted-foreground mt-2 block text-sm">{t.contact.chatNote}</span>
                  <span className="text-gold mt-3 block text-sm">{t.contact.chatCta}</span>
                </span>
                <ArrowUpRight
                  className="text-line-strong group-hover:text-gold mt-1 size-4 transition-colors duration-500"
                  strokeWidth={1.5}
                />
              </button>
            </Reveal>

            <Reveal delay={0.24} className="border-line mt-10 border-t pt-7">
              <p className="eyebrow text-gold">{t.contact.locationsLabel}</p>
              <p className="text-foreground/85 mt-4 text-[0.9375rem]">{contact.locations}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
