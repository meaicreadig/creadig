"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { contact } from "@/lib/site-data"
import { cn } from "@/lib/utils"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/*
 * Portierung des alten `termin.html` / `termin.js` (Vanilla) nach Next.
 * Gleiche 4-Schritt-UX, gleiche Verfügbarkeitsregeln, gleicher WhatsApp-Versand.
 * Bewusst ohne Backend: Die Nachricht wird im Browser gebaut, abgeschickt wird
 * sie vom Nutzer selbst in WhatsApp.
 */

const WA_NUMBER = "41765045879"
/** Bevorzugte Gesprächstage: Di / Mi / Do (Montag = 0). */
const PREFERRED_WEEKDAYS = [1, 2, 3]
const SLOTS_INITIAL = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
const SLOTS_ARCHITECTURE = ["10:00", "11:00", "14:00", "15:00", "16:00"]

type MeetingType = "vg" | "ar"
type MeetingLang = "de" | "tr" | "de-tr"

type FormState = {
  name: string
  phone: string
  email: string
  org: string
  city: string
  interest: string
  size: string
  note: string
}

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  org: "",
  city: "",
  interest: "",
  size: "",
  note: "",
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function TerminWizard() {
  const { t } = useLocale()
  const params = useSearchParams()

  const [step, setStep] = useState(1)
  const [type, setType] = useState<MeetingType | null>(null)
  const [dateKey, setDateKey] = useState<string | null>(null)
  const [dateLabel, setDateLabel] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [meetingLang, setMeetingLang] = useState<MeetingLang>("de")
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [invalid, setInvalid] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  // „Heute" erst nach dem Mount bestimmen — sonst weichen Server- und
  // Client-Render voneinander ab.
  const [today, setToday] = useState<Date | null>(null)
  const [cursor, setCursor] = useState<{ year: number; month: number } | null>(null)

  useEffect(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    setToday(now)
    setCursor({ year: now.getFullYear(), month: now.getMonth() })
  }, [])

  // Paket-Vorauswahl aus der Pakete-Sektion (`/termin?paket=growth`).
  useEffect(() => {
    const paket = params.get("paket")
    if (!paket) return
    if (paket === "architecture") {
      setType("ar")
      setForm((f) => ({ ...f, interest: t.termin.step3.interests[2] }))
    } else if (paket === "growth") {
      setType("vg")
      setForm((f) => ({ ...f, interest: t.termin.step3.interests[1] }))
    } else if (paket === "identity") {
      setType("vg")
      setForm((f) => ({ ...f, interest: t.termin.step3.interests[0] }))
    }
    // Nur beim ersten Lauf — eine spätere Sprachumschaltung soll die
    // Auswahl des Nutzers nicht überschreiben.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const slots = type === "ar" ? SLOTS_ARCHITECTURE : SLOTS_INITIAL

  const typeLabel =
    type === "ar" ? t.termin.step1.arName : type === "vg" ? t.termin.step1.vgName : ""

  const langLabel =
    meetingLang === "tr"
      ? t.termin.step3.langTr
      : meetingLang === "de-tr"
        ? t.termin.step3.langBoth
        : t.termin.step3.langDe

  /** Kalenderzellen des angezeigten Monats. */
  const calendar = useMemo(() => {
    if (!cursor || !today) return null
    const { year, month } = cursor
    const firstDow = new Date(year, month, 1).getDay()
    const leading = firstDow === 0 ? 6 : firstDow - 1 // Woche beginnt montags
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: ({ day: number; key: string; past: boolean; preferred: boolean; today: boolean } | null)[] =
      Array.from({ length: leading }, () => null)

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dow = date.getDay()
      const dowMon = dow === 0 ? 6 : dow - 1
      const past = date < today
      cells.push({
        day,
        key: toDateKey(year, month, day),
        past,
        preferred: PREFERRED_WEEKDAYS.includes(dowMon) && !past,
        today: date.getTime() === today.getTime(),
      })
    }
    return cells
  }, [cursor, today])

  /** Zurückblättern nur, solange der Monat nicht komplett in der Vergangenheit liegt. */
  const canGoBack =
    cursor && today
      ? cursor.year > today.getFullYear() ||
        (cursor.year === today.getFullYear() && cursor.month > today.getMonth())
      : false

  function shiftMonth(delta: number) {
    setCursor((c) => {
      if (!c) return c
      const next = new Date(c.year, c.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  function selectDate(cell: { day: number; key: string; past: boolean }) {
    if (cell.past || !cursor) return
    setDateKey(cell.key)
    setDateLabel(`${cell.day}. ${t.termin.months[cursor.month]} ${cursor.year}`)
    setTime(null)
    setError(null)
  }

  function goTo(next: number) {
    if (next === 3) {
      if (!dateKey) return setError(t.termin.step2.errDate)
      if (!time) return setError(t.termin.step2.errTime)
    }
    if (next === 4 && !validateForm()) return
    setError(null)
    setStep(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function validateForm() {
    const bad: Record<string, boolean> = {
      name: !form.name.trim(),
      phone: !form.phone.trim(),
      org: !form.org.trim(),
      email: !form.email.trim() || !EMAIL_RE.test(form.email.trim()),
    }
    setInvalid(bad)
    const hasError = Object.values(bad).some(Boolean)
    if (hasError) {
      setError(
        form.email.trim() && !EMAIL_RE.test(form.email.trim())
          ? t.termin.step3.errEmail
          : t.termin.step3.errRequired,
      )
    }
    return !hasError
  }

  const summaryRows = [
    { k: t.termin.step4.typeLabel, v: typeLabel, accent: true },
    { k: t.termin.step4.dateLabel, v: dateLabel ?? "–" },
    { k: t.termin.step4.timeLabel, v: time ?? "–" },
    { k: t.termin.step3.name, v: form.name },
    { k: t.termin.step3.phone, v: form.phone },
    { k: t.termin.step3.email, v: form.email },
    { k: t.termin.step3.org, v: form.org },
    { k: t.termin.step3.city, v: form.city || "–" },
    { k: t.termin.step3.interest, v: form.interest || "–" },
    { k: t.termin.step3.size, v: form.size || "–" },
    { k: t.termin.step4.langLabel, v: langLabel },
    { k: t.termin.step3.note, v: form.note || "–" },
  ]

  const waMessage = [
    `*${t.termin.waTitle}*`,
    "",
    `📋 *${t.termin.waType}:* ${typeLabel}`,
    `📅 *${t.termin.waDate}:* ${dateLabel ?? "–"}`,
    `🕐 *${t.termin.waTime}:* ${time ?? "–"}`,
    "",
    `👤 *${t.termin.waName}:* ${form.name}`,
    `🏢 *${t.termin.waOrg}:* ${form.org}`,
    `📍 *${t.termin.waCity}:* ${form.city || "–"}`,
    `📧 *${t.termin.step3.email}:* ${form.email}`,
    `📱 *${t.termin.waPhone}:* ${form.phone}`,
    "",
    `💡 *${t.termin.waInterest}:* ${form.interest || "–"}`,
    `👥 *${t.termin.waSize}:* ${form.size || "–"}`,
    `🌍 *${t.termin.waLang}:* ${langLabel}`,
    "",
    `💬 *${t.termin.waNote}:* ${form.note || "–"}`,
  ].join("\n")

  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`

  const inputClass =
    "w-full rounded-none border-0 border-b border-line-strong bg-transparent px-0 py-3 text-base text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground/60 focus:border-gold"
  const invalidClass = "border-destructive focus:border-destructive"

  function field(key: keyof FormState) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }))
        setInvalid((v) => ({ ...v, [key]: false }))
      },
    }
  }

  const progress = step === 5 ? 100 : [0, 25, 50, 75, 95][step] ?? 25

  return (
    <main className="relative min-h-dvh">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] overflow-hidden">
        <SignatureMotif className="motif-feature h-full w-full" density={0.42} />
        <div className="from-background absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-6 pt-32 pb-24 md:px-10 md:pt-40">
        <Link
          href="/"
          className="text-muted-foreground hover:text-gold-text type-small inline-flex items-center gap-2 transition-colors duration-300"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          {t.termin.back}
        </Link>

        <SectionEyebrow label={t.termin.eyebrow} className="mt-10" />
        <h1 className="type-h1 mt-6 text-balance">
          {t.termin.title}
        </h1>
        <p className="type-lead text-muted-foreground mt-6 max-w-xl text-pretty">
          {t.termin.lead}
        </p>

        {/* Fortschritt */}
        <div className="mt-14">
          <div className="text-muted-foreground eyebrow flex items-baseline justify-between">
            <span>
              {t.termin.stepOf} {Math.min(step, 4)} / 4
            </span>
            <span>{progress}%</span>
          </div>
          <div className="bg-line mt-3 h-px w-full">
            <div
              className="from-gold-soft to-gold h-px bg-gradient-to-r transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="border-destructive/40 text-destructive mt-8 border-l-2 py-2 pl-4 text-sm"
          >
            {error}
          </p>
        )}

        {/* ── Schritt 1: Art des Gesprächs ── */}
        {step === 1 && (
          <section className="mt-14">
            <h2 className="text-display text-2xl">{t.termin.step1.title}</h2>
            <p className="type-body text-muted-foreground mt-3">{t.termin.step1.lead}</p>

            <div className="mt-8 grid gap-px sm:grid-cols-2">
              {(
                [
                  {
                    id: "vg" as const,
                    name: t.termin.step1.vgName,
                    desc: t.termin.step1.vgDesc,
                    meta: t.termin.step1.vgMeta,
                  },
                  {
                    id: "ar" as const,
                    name: t.termin.step1.arName,
                    desc: t.termin.step1.arDesc,
                    meta: t.termin.step1.arMeta,
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setType(option.id)
                    setTime(null)
                  }}
                  aria-pressed={type === option.id}
                  className={cn(
                    "border-line group relative flex flex-col border p-7 text-left transition-colors duration-500",
                    type === option.id ? "bg-gold/[0.07] border-gold" : "hover:bg-foreground/[0.02]",
                  )}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className="text-display text-xl">{option.name}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1 flex size-5 shrink-0 items-center justify-center border transition-colors duration-300",
                        type === option.id ? "border-gold bg-gold" : "border-line-strong",
                      )}
                    >
                      {type === option.id && <Check className="size-3 text-[#201e1b]" strokeWidth={3} />}
                    </span>
                  </span>
                  <span className="type-body text-muted-foreground mt-4 text-pretty">
                    {option.desc}
                  </span>
                  <span className="text-gold-text eyebrow mt-5 inline-flex items-center gap-2">
                    <Clock className="size-3.5" strokeWidth={1.5} />
                    {option.meta}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-10 flex justify-end">
              <StepButton disabled={!type} onClick={() => goTo(2)} label={t.termin.next} />
            </div>
          </section>
        )}

        {/* ── Schritt 2: Wunschtermin ── */}
        {step === 2 && (
          <section className="mt-14">
            <h2 className="text-display text-2xl">{t.termin.step2.title}</h2>
            <p className="type-body text-muted-foreground mt-3 max-w-xl text-pretty">
              {t.termin.step2.lead}
            </p>

            <div className="border-line mt-8 border">
              <div className="border-line flex items-center justify-between border-b px-5 py-4">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  disabled={!canGoBack}
                  aria-label="Vorheriger Monat"
                  className="text-muted-foreground hover:text-gold-text disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronLeft className="size-5" strokeWidth={1.5} />
                </button>
                <p className="text-display text-base">
                  {cursor ? `${t.termin.months[cursor.month]} ${cursor.year}` : " "}
                </p>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  aria-label="Nächster Monat"
                  className="text-muted-foreground hover:text-gold-text"
                >
                  <ChevronRight className="size-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-px p-4">
                {t.termin.days.map((d) => (
                  <div
                    key={d}
                    className="text-muted-foreground eyebrow py-2 text-center"
                  >
                    {d}
                  </div>
                ))}
                {(calendar ?? Array.from({ length: 35 }, () => null)).map((cell, i) =>
                  cell === null ? (
                    <div key={`e${i}`} className="aspect-square" />
                  ) : (
                    <button
                      key={cell.key}
                      type="button"
                      disabled={cell.past}
                      onClick={() => selectDate(cell)}
                      aria-pressed={dateKey === cell.key}
                      className={cn(
                        "relative flex aspect-square items-center justify-center text-sm transition-colors duration-300",
                        cell.past && "text-muted-foreground/35 pointer-events-none",
                        !cell.past && "hover:bg-gold/10",
                        cell.today && "font-semibold",
                        dateKey === cell.key && "bg-gold text-[#201e1b]",
                      )}
                    >
                      {cell.day}
                      {cell.preferred && dateKey !== cell.key && (
                        <span
                          aria-hidden="true"
                          className="bg-gold absolute bottom-1.5 size-1 rounded-full"
                        />
                      )}
                    </button>
                  ),
                )}
              </div>

              <p className="border-line text-muted-foreground flex items-center gap-2 text-meta border-t px-5 py-3">
                <span aria-hidden="true" className="bg-gold size-1 rounded-full" />
                {t.termin.step2.preferred}
              </p>
            </div>

            {dateKey && (
              <div className="mt-10">
                <h3 className="text-display text-xl">{t.termin.step2.timeTitle}</h3>
                <p className="type-small text-muted-foreground mt-2">{t.termin.step2.timeLead}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setTime(slot)
                        setError(null)
                      }}
                      aria-pressed={time === slot}
                      className={cn(
                        "border px-5 py-3 font-mono text-sm tracking-wide transition-colors duration-300",
                        time === slot
                          ? "border-gold bg-gold text-[#201e1b]"
                          : "border-line-strong hover:border-gold hover:text-gold-text",
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 flex items-center justify-between gap-4">
              <BackButton onClick={() => setStep(1)} label={t.termin.prev} />
              <StepButton disabled={!dateKey || !time} onClick={() => goTo(3)} label={t.termin.next} />
            </div>
          </section>
        )}

        {/* ── Schritt 3: Angaben ── */}
        {step === 3 && (
          <section className="mt-14">
            <h2 className="text-display text-2xl">{t.termin.step3.title}</h2>
            <p className="type-body text-muted-foreground mt-3">{t.termin.step3.lead}</p>

            <form
              className="mt-10 grid gap-8 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault()
                goTo(4)
              }}
            >
              <label className="flex flex-col gap-2">
                <span className="eyebrow text-muted-foreground">{t.termin.step3.name} *</span>
                <input
                  {...field("name")}
                  required
                  autoComplete="name"
                  className={cn(inputClass, invalid.name && invalidClass)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="eyebrow text-muted-foreground">{t.termin.step3.org} *</span>
                <input
                  {...field("org")}
                  required
                  autoComplete="organization"
                  className={cn(inputClass, invalid.org && invalidClass)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="eyebrow text-muted-foreground">{t.termin.step3.phone} *</span>
                <input
                  {...field("phone")}
                  required
                  type="tel"
                  autoComplete="tel"
                  className={cn(inputClass, invalid.phone && invalidClass)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="eyebrow text-muted-foreground">{t.termin.step3.email} *</span>
                <input
                  {...field("email")}
                  required
                  type="email"
                  autoComplete="email"
                  className={cn(inputClass, invalid.email && invalidClass)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="eyebrow text-muted-foreground">{t.termin.step3.city}</span>
                <input {...field("city")} autoComplete="address-level2" className={inputClass} />
              </label>
              <label className="flex flex-col gap-2">
                <span className="eyebrow text-muted-foreground">{t.termin.step3.size}</span>
                <select {...field("size")} className={inputClass}>
                  <option value="">{t.termin.step3.choose}</option>
                  {t.termin.step3.sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="eyebrow text-muted-foreground">{t.termin.step3.interest}</span>
                <select {...field("interest")} className={inputClass}>
                  <option value="">{t.termin.step3.choose}</option>
                  {t.termin.step3.interests.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="sm:col-span-2">
                <legend className="eyebrow text-muted-foreground">{t.termin.step3.langLabel}</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(
                    [
                      { id: "de" as const, label: t.termin.step3.langDe },
                      { id: "tr" as const, label: t.termin.step3.langTr },
                      { id: "de-tr" as const, label: t.termin.step3.langBoth },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMeetingLang(option.id)}
                      aria-pressed={meetingLang === option.id}
                      className={cn(
                        "border px-5 py-2.5 text-sm transition-colors duration-300",
                        meetingLang === option.id
                          ? "border-gold bg-gold text-[#201e1b]"
                          : "border-line-strong hover:border-gold hover:text-gold-text",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="eyebrow text-muted-foreground">{t.termin.step3.note}</span>
                <textarea
                  {...field("note")}
                  rows={3}
                  placeholder={t.termin.step3.notePlaceholder}
                  className={cn(inputClass, "resize-none")}
                />
              </label>

              <div className="flex items-center justify-between gap-4 sm:col-span-2">
                <BackButton onClick={() => setStep(2)} label={t.termin.prev} />
                <StepButton onClick={() => goTo(4)} label={t.termin.next} />
              </div>
            </form>
          </section>
        )}

        {/* ── Schritt 4: Zusammenfassung + WhatsApp ── */}
        {step === 4 && (
          <section className="mt-14">
            <h2 className="text-display text-2xl">{t.termin.step4.title}</h2>
            <p className="type-body text-muted-foreground mt-3 max-w-xl text-pretty">
              {t.termin.step4.lead}
            </p>

            <dl className="border-line mt-8 border">
              {summaryRows.map((row) => (
                <div
                  key={row.k}
                  className="border-line grid grid-cols-1 gap-1 border-b px-5 py-4 last:border-b-0 sm:grid-cols-[12rem_1fr] sm:gap-4"
                >
                  <dt className="text-muted-foreground eyebrow">
                    {row.k}
                  </dt>
                  <dd
                    className={cn(
                      "type-small break-words",
                      row.accent ? "text-gold-text" : "text-foreground",
                    )}
                  >
                    {row.v}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
              <BackButton onClick={() => setStep(3)} label={t.termin.prev} />
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => window.setTimeout(() => setStep(5), 800)}
                className="group from-gold-soft to-gold relative inline-flex items-center gap-3 overflow-hidden bg-gradient-to-br px-8 py-4 text-base tracking-wide text-[#201e1b]"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-y-full bg-[#201e1b] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                />
                <span className="group-hover:text-gold-soft relative z-10 flex items-center gap-3 transition-colors duration-500">
                  <WhatsAppIcon className="size-4" />
                  {t.termin.step4.send}
                </span>
              </a>
            </div>
          </section>
        )}

        {/* ── Erfolg ── */}
        {step === 5 && (
          <section className="mt-16">
            <span
              aria-hidden="true"
              className="border-gold text-gold flex size-14 items-center justify-center border"
            >
              <Check className="size-6" strokeWidth={1.5} />
            </span>
            <h2 className="type-h3 mt-8">{t.termin.done.title}</h2>
            <p className="text-muted-foreground mt-5 max-w-xl text-base leading-relaxed text-pretty">
              {t.termin.done.lead}
            </p>

            <div className="border-line mt-10 flex flex-col gap-3 type-small border-t pt-8 font-mono">
              <p className="text-foreground">
                {dateLabel} · {time}
              </p>
              <p className="text-muted-foreground">{t.termin.done.reply}</p>
              <a href={contact.whatsappHref} className="text-gold-text" target="_blank" rel="noopener noreferrer">
                {contact.whatsapp}
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/"
                className="border-line-strong hover:border-gold hover:text-gold-text inline-flex items-center gap-2 border px-6 py-3.5 text-sm tracking-wide transition-colors duration-500"
              >
                {t.termin.done.home}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setType(null)
                  setDateKey(null)
                  setDateLabel(null)
                  setTime(null)
                  setForm(EMPTY_FORM)
                  setInvalid({})
                }}
                className="border-line-strong hover:border-gold hover:text-gold-text inline-flex items-center gap-2 border px-6 py-3.5 text-sm tracking-wide transition-colors duration-500"
              >
                {t.termin.done.again}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function StepButton({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group from-gold-soft to-gold relative inline-flex items-center gap-2.5 overflow-hidden bg-gradient-to-br px-7 py-3.5 text-sm tracking-wide text-[#201e1b] transition-opacity duration-300 disabled:pointer-events-none disabled:opacity-35"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-y-full bg-[#201e1b] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
      />
      <span className="group-hover:text-gold-soft relative z-10 flex items-center gap-2.5 transition-colors duration-500">
        {label}
        <ArrowRight className="size-4" strokeWidth={1.5} />
      </span>
    </button>
  )
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-muted-foreground hover:text-gold-text inline-flex items-center gap-2 text-sm transition-colors duration-300"
    >
      <ArrowLeft className="size-4" strokeWidth={1.5} />
      {label}
    </button>
  )
}
