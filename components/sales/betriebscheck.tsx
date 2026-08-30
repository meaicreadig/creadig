"use client"

import { useMemo, useRef, useState } from "react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { Send } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { contact, serviceLayers } from "@/lib/site-data"
import { trackEvent, trackLead } from "@/lib/track"
import { useLeadSubmit } from "@/lib/use-lead"
import { cn } from "@/lib/utils"
import {
  CHECK_ANSWERS,
  CHECK_QUESTIONS,
  type CheckAnswerKey,
  type CheckAnswers,
  type CheckLayer,
  checkCopy,
  checkSummary,
  evaluateCheck,
} from "@/lib/betriebscheck"

/**
 * MP-D · Betriebscheck — die Oberfläche.
 *
 * ---------------------------------------------------------------------------
 * DREI ENTSCHEIDUNGEN, DIE MAN SPÄTER SONST NICHT MEHR VERSTEHT
 *
 * 1. ECHTE RADIOS, KEINE GEBAUTEN KNÖPFE.
 *    Der Termin-Assistent benutzt an vergleichbarer Stelle Knöpfe mit
 *    `aria-pressed`. Hier sind es fünfzehn Gruppen zu je drei Optionen —
 *    das ist genau der Fall, für den `<fieldset>` + `<input type="radio">`
 *    gemacht ist: Pfeiltasten wechseln innerhalb der Gruppe, Tab springt zur
 *    nächsten, und ein Screenreader sagt „3 von 15". Nachgebaut bekommt man
 *    das nur mit Aufwand und meistens falsch.
 *
 * 2. DAS ERGEBNIS ERSCHEINT ERST VOLLSTÄNDIG.
 *    Kein Live-Zähler, der bei Frage drei schon „37 %" zeigt. Eine Zahl, die
 *    sich beim Antworten bewegt, wird zum Spiel — und die Antworten richten
 *    sich nach der Zahl statt nach dem Betrieb.
 *
 * 3. DAS FORMULAR KOMMT NACH DEM ERGEBNIS, NICHT DAVOR.
 *    Wer erst die Adresse verlangt und dann rechnet, verkauft ein Ergebnis,
 *    das er schon hat. Hier steht das Ergebnis vollständig da; die Anfrage
 *    ist danach ein Angebot, kein Zoll.
 *
 * Gesendet wird über `useLeadSubmit` an `/api/lead` — derselbe Weg wie
 * Kontakt, Kurz-Check und Termin. Kein zweiter Endpunkt für dasselbe
 * Anliegen.
 */
export function Betriebscheck() {
  const { t, locale } = useLocale()
  const submitLead = useLeadSubmit()
  const resultRef = useRef<HTMLDivElement>(null)

  const [answers, setAnswers] = useState<CheckAnswers>({})
  const [revealed, setRevealed] = useState(false)

  const [name, setName] = useState("")
  const [business, setBusiness] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [privacyOk, setPrivacyOk] = useState(false)
  const [invalid, setInvalid] = useState<{
    name?: boolean
    email?: boolean
    phone?: boolean
    privacy?: boolean
  }>({})
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)

  const result = useMemo(() => evaluateCheck(answers), [answers])
  const answered = CHECK_QUESTIONS.filter((q) => answers[q.id] !== undefined).length

  const layerName = (key: CheckLayer) => t.services.layers[key].name

  const fieldClass =
    "w-full rounded-none border-0 border-b border-line-strong bg-transparent px-0 py-3 text-base text-foreground outline-none transition-colors duration-[var(--dur-1)] placeholder:text-muted-foreground focus:border-gold"

  /** Dieselben Codes wie Kontakt, Kurz-Check und Termin — ein Endpunkt, eine Sprache. */
  function errorText(code: string | undefined) {
    if (code === "not_configured") return `${t.contact.errNotConfigured} ${contact.email}.`
    if (code === "rate_limited") return t.contact.errRateLimited
    if (code === "token_expired" || code === "token_invalid") return t.contact.errFormExpired
    return t.contact.errSendFailed
  }

  function choose(questionId: string, answer: CheckAnswerKey) {
    setAnswers((previous) => {
      const next = { ...previous, [questionId]: answer }
      /* Der Start wird genau einmal gemeldet: bei der ersten Antwort. */
      if (Object.keys(previous).length === 0) trackEvent("audit_started", { locale })
      return next
    })
  }

  function reveal() {
    setRevealed(true)
    /*
     * Nicht der Rohscore, sondern der Zwanziger-Korb. Ein exakter Wert je
     * Besucher wäre feiner, als die Frage es hergibt — und feiner, als eine
     * Messung sein muss, die nur den Trichter erklären soll.
     */
    const bucket = `${Math.floor(result.score / 20) * 20}-${Math.floor(result.score / 20) * 20 + 19}`
    trackEvent("audit_completed", { locale, score_bucket: bucket })
    window.requestAnimationFrame(() => {
      resultRef.current?.focus({ preventScroll: false })
    })
  }

  return (
    <>
      {/* ── Die Fragen ── */}
      <section aria-labelledby="check-title" className="section-seam">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow label={checkCopy.eyebrow[locale]} />
              <h1 id="check-title" className="type-h1 mt-7 text-balance">
                {checkCopy.title[locale]}
              </h1>
            </Reveal>
            <Reveal delay={0.1} className="flex items-end lg:col-span-5">
              <p className="type-lead text-muted-foreground max-w-md text-pretty">
                {checkCopy.lead[locale]}
              </p>
            </Reveal>
          </div>

          {/*
            Die Ehrlichkeitszeile steht VOR den Fragen. Wer sie erst unter dem
            Ergebnis liest, hat die Zahl schon geglaubt.
          */}
          <Reveal delay={0.16}>
            <p className="border-gold/45 text-foreground/80 type-small mt-12 max-w-2xl border-s-2 ps-4 text-pretty">
              {checkCopy.disclaimer[locale]}
            </p>
          </Reveal>

          <div className="mt-16 flex flex-col gap-2.5">
            {serviceLayers.map((layer, layerIndex) => {
              const questions = CHECK_QUESTIONS.filter((q) => q.layer === layer.key)
              return (
                <Reveal key={layer.key} delay={0.05 * layerIndex}>
                  <fieldset className="tile bg-background p-7 md:p-8">
                    <legend className="flex items-baseline gap-4 px-1">
                      <span className="eyebrow text-gold-text">{layer.level}</span>
                      <span className="type-h4">{layerName(layer.key)}</span>
                    </legend>

                    <div className="mt-6 flex flex-col gap-7">
                      {questions.map((question) => (
                        <div
                          key={question.id}
                          role="group"
                          aria-labelledby={`q-${question.id}`}
                          className="grid gap-4 md:grid-cols-12 md:items-baseline"
                        >
                          <p
                            id={`q-${question.id}`}
                            className="type-body text-foreground/85 text-pretty md:col-span-7"
                          >
                            {question.text[locale]}
                          </p>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 md:col-span-5 md:justify-end">
                            {CHECK_ANSWERS.map((option) => (
                              <label
                                key={option.key}
                                className="flex cursor-pointer items-center gap-2.5"
                              >
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={option.key}
                                  checked={answers[question.id] === option.key}
                                  onChange={() => choose(question.id, option.key)}
                                  className="accent-gold size-4 shrink-0"
                                />
                                <span
                                  className={cn(
                                    "type-small transition-colors duration-[var(--dur-1)]",
                                    answers[question.id] === option.key
                                      ? "text-gold-text"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {option.label[locale]}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </Reveal>
              )
            })}
          </div>

          <div className="border-line mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t pt-8">
            <p className="text-meta text-muted-foreground" aria-live="polite">
              {checkCopy.progress[locale](answered, CHECK_QUESTIONS.length)}
            </p>
            <button
              type="button"
              onClick={reveal}
              disabled={!result.complete}
              className="cta-outline inline-flex items-center gap-2.5 px-7 py-3.5 text-sm tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checkCopy.showResult[locale]}
            </button>
          </div>
        </div>
      </section>

      {/* ── Das Ergebnis ── */}
      {revealed && result.complete && (
        <section aria-labelledby="check-result-title" className="section-seam">
          <div className="section-shell">
            <div
              ref={resultRef}
              tabIndex={-1}
              className="outline-none"
            >
              <SectionEyebrow label={checkCopy.resultTitle[locale]} />
              <div className="mt-7 flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <span className="type-display">{result.score}</span>
                <span className="eyebrow text-muted-foreground">
                  / 100 · {checkCopy.scoreLabel[locale]}
                </span>
              </div>
            </div>

            {/* Fünf Balken — dieselbe Reihenfolge wie überall im Haus. */}
            <div className="mt-12 flex flex-col gap-5">
              {result.layers.map((layer) => (
                <div key={layer.key} className="grid gap-2 md:grid-cols-12 md:items-center">
                  <div className="flex items-baseline gap-4 md:col-span-4">
                    <span className="eyebrow text-gold-text">{layer.level}</span>
                    <span className="text-subhead">{layerName(layer.key)}</span>
                  </div>
                  <div className="md:col-span-7">
                    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-sm">
                      <div
                        className="bg-gold h-full rounded-sm"
                        style={{ width: `${layer.percent}%` }}
                      />
                    </div>
                  </div>
                  <span className="type-stat text-muted-foreground text-sm md:col-span-1 md:text-right">
                    {layer.percent}%
                  </span>
                </div>
              ))}
            </div>

            {/* Der Engpass-Satz. Das ist die eigentliche Aussage der Seite. */}
            <div className="border-line mt-12 border-t pt-8">
              <p className="eyebrow text-gold-text">
                {result.evenlyBalanced
                  ? checkCopy.bottleneckEvenLabel[locale]
                  : checkCopy.bottleneckLabel[locale]}
              </p>
              <p className="type-statement mt-4 max-w-3xl text-pretty">
                {result.evenlyBalanced
                  ? checkCopy.bottleneckEven[locale]
                  : result.blocked
                    ? checkCopy.bottleneckBlocked[locale](
                        layerName(result.bottleneck.key),
                        layerName(result.blocked.key),
                      )
                    : checkCopy.bottleneckTop[locale](layerName(result.bottleneck.key))}
              </p>
              <p className="type-body text-muted-foreground mt-6 text-pretty">
                {result.manualSpots === 0
                  ? checkCopy.manualNone[locale]
                  : checkCopy.manualLabel[locale](result.manualSpots)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Ergebnis besprechen ── */}
      {revealed && result.complete && (
        <section aria-labelledby="check-form-title" className="section-seam">
          <div className="section-shell">
            {status === "sent" ? (
              <div role="status">
                <SectionEyebrow label={checkCopy.formTitle[locale]} />
                <h2 id="check-form-title" className="type-h2 mt-7 text-balance">
                  {checkCopy.sentTitle[locale]}
                </h2>
                <p className="type-lead text-muted-foreground mt-6 max-w-xl text-pretty">
                  {checkCopy.sentBody[locale]}
                </p>
                {reference && (
                  <p className="border-line text-meta text-muted-foreground mt-8 border-t pt-6">
                    {checkCopy.referenceLabel[locale]}:{" "}
                    <span className="text-gold-text font-mono">{reference}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <SectionEyebrow label={checkCopy.formTitle[locale]} />
                  <h2 id="check-form-title" className="type-h2 mt-7 text-balance">
                    {checkCopy.formHeadline[locale]}
                  </h2>
                  <p className="type-body text-muted-foreground mt-6 max-w-md text-pretty">
                    {checkCopy.formLead[locale]}
                  </p>
                </div>

                <form
                  className="flex flex-col gap-7 lg:col-span-7"
                  onSubmit={async (event) => {
                    event.preventDefault()
                    const bad = {
                      name: name.trim() === "",
                      email: !email.includes("@"),
                      phone: phone.trim() === "",
                      privacy: !privacyOk,
                    }
                    setInvalid(bad)
                    if (bad.name || bad.email || bad.phone || bad.privacy) return

                    setError(null)
                    setStatus("sending")
                    const data = await submitLead({
                      name,
                      business,
                      email,
                      phone,
                      message: checkSummary(result, answers, locale, layerName),
                      website,
                      privacyOk,
                      locale,
                      source: "betriebscheck",
                    })
                    if (data.ok) {
                      setReference(data.reference ?? null)
                      setStatus("sent")
                      trackLead("betriebscheck")
                      return
                    }
                    setStatus("idle")
                    setError(errorText(data.error))
                  }}
                >
                  <label className="flex flex-col gap-2">
                    <span className="eyebrow text-muted-foreground">
                      {checkCopy.nameLabel[locale]}
                    </span>
                    <input
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setInvalid((v) => ({ ...v, name: false }))
                      }}
                      aria-invalid={invalid.name || undefined}
                      className={cn(fieldClass, invalid.name && "border-destructive")}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="eyebrow text-muted-foreground">
                      {checkCopy.businessLabel[locale]}
                    </span>
                    <input
                      name="business"
                      autoComplete="organization"
                      value={business}
                      onChange={(e) => setBusiness(e.target.value)}
                      className={fieldClass}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="eyebrow text-muted-foreground">
                      {checkCopy.emailLabel[locale]}
                    </span>
                    <input
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setInvalid((v) => ({ ...v, email: false }))
                      }}
                      aria-invalid={invalid.email || undefined}
                      className={cn(fieldClass, invalid.email && "border-destructive")}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="eyebrow text-muted-foreground">
                      {checkCopy.phoneLabel[locale]}
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value)
                        setInvalid((v) => ({ ...v, phone: false }))
                      }}
                      aria-invalid={invalid.phone || undefined}
                      className={cn(fieldClass, invalid.phone && "border-destructive")}
                    />
                  </label>

                  {/* Honigtopf — heißt `website`, wie überall auf dieser Seite. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
                  >
                    <label htmlFor="check-website">Website</label>
                    <input
                      id="check-website"
                      name="website"
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
                      <Link
                        href="/datenschutz"
                        className="text-gold-text underline underline-offset-4"
                      >
                        {t.contact.privacyConsentLink}
                      </Link>{" "}
                      {t.contact.privacyConsentSuffix}
                    </span>
                  </label>

                  {error && (
                    <p
                      role="alert"
                      className="border-destructive/40 text-destructive border-s-2 py-1 ps-4 text-sm"
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
                    {status === "sending"
                      ? checkCopy.sending[locale]
                      : checkCopy.submit[locale]}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}
