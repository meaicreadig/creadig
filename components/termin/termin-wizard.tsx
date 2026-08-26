"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Clock, Send } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { contact } from "@/lib/site-data"
import { trackLead } from "@/lib/track"
import { useLeadSubmit } from "@/lib/use-lead"
import { cn } from "@/lib/utils"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/*
 * Vier Schritte zum Gespräch — als WUNSCH, nicht als Buchung (BF-1).
 *
 * ---------------------------------------------------------------------------
 * WAS HIER FALSCH WAR
 * An dieser Stelle standen zwei Listen fester Uhrzeiten (`SLOTS_INITIAL`,
 * `SLOTS_ARCHITECTURE`). Sie waren mit nichts verbunden: kein Kalender, keine
 * Belegung, keine Sperre. Der Assistent zeigte "09:00 · 10:00 · 11:00 …" und
 * meldete danach "Anfrage angekommen" — der Interessent hielt 10:00 für
 * vereinbart, während bei uns niemand davon wusste. Das ist dieselbe Klasse
 * von Unwahrheit wie der frühere Fake-Erfolg nach 800 Millisekunden: eine
 * Zusage, hinter der nichts steht.
 *
 * ---------------------------------------------------------------------------
 * WIE ES JETZT LÄUFT
 * Der Assistent FRAGT: bis zu drei Wunschtage, ein oder mehrere grobe
 * Zeitfenster. Nirgends steht "gebucht" oder "bestätigt"; an Schritt 2, an
 * Schritt 4 und im Erfolgsschritt steht, dass die verbindliche Bestätigung von
 * uns kommt. Ein echter Kalenderabgleich ist ein eigenes Projekt und bewusst
 * nicht Teil dieser Stufe — bis dahin verspricht die Seite nur, was ein Mensch
 * dahinter auch halten kann.
 */

const WA_NUMBER = "41765045879"
/** Bevorzugte Gesprächstage: Di / Mi / Do (Montag = 0). */
const PREFERRED_WEEKDAYS = [1, 2, 3]
/** Mehr Wunschtage helfen niemandem — sie machen die Rückmeldung nur länger. */
const MAX_DATES = 3

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
  const { t, locale } = useLocale()
  const params = useSearchParams()
  /* BF-2: dasselbe signierte Zeit-Token wie im Kontaktformular. */
  const submitLead = useLeadSubmit()

  const [step, setStep] = useState(1)
  const [type, setType] = useState<MeetingType | null>(null)
  /* Wunschtage (bis zu MAX_DATES) statt eines "gebuchten" Datums. */
  const [dates, setDates] = useState<{ key: string; label: string }[]>([])
  /* Zeitfenster statt Uhrzeiten — wir fragen nach der Tageszeit, nicht nach
     einem Slot, den niemand freigehalten hat. */
  const [windows, setWindows] = useState<string[]>([])
  const [meetingLang, setMeetingLang] = useState<MeetingLang>("de")
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [invalid, setInvalid] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  /*
   * Pflicht-Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Die Woerterbuch-
   * Eintraege dafuer lagen seit Langem in DE und TR bereit, wurden hier aber
   * nie benutzt: Der Assistent sammelte Name, Telefon, E-Mail, Betrieb, Ort
   * und Betriebsgroesse ein — mehr personenbezogene Daten als das
   * Kontaktformular — und fragte als Einziger nicht.
   */
  const [privacyOk, setPrivacyOk] = useState(false)
  const [sending, setSending] = useState(false)

  /*
   * BF-A3 / F8 — der Schrittwechsel war fuer Tastatur und Screenreader ein
   * Loch.
   *
   * Gemessen: Nach „Weiter" tauschte der Assistent den Inhalt aus, scrollte
   * nach oben — und liess den Fokus auf <body> fallen. Wer nur mit der
   * Tastatur arbeitet, faengt danach wieder ganz vorn an. Und angesagt wurde
   * gar nichts: Auf der Seite gab es keine einzige Live-Region. Man drueckte
   * „Weiter" und hoerte Stille.
   *
   * Jetzt zwei Dinge zugleich: Der Fokus wandert auf die Ueberschrift des
   * neuen Schritts (`tabIndex={-1}`, damit sie ihn ueberhaupt annehmen kann),
   * und eine hoeflich vorlesende Region sagt Nummer und Titel an. Beides ist
   * noetig — der Fokus fuer die Tastatur, die Ansage fuer den Screenreader.
   */
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [announcement, setAnnouncement] = useState("")
  const firstRender = useRef(true)

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

  // Vorauswahl aus der Angebots-Sektion (`/termin?paket=website`).
  useEffect(() => {
    const paket = params.get("paket")
    if (!paket) return
    if (paket === "website") {
      setType("vg")
      setForm((f) => ({ ...f, interest: t.termin.step3.interests[0] }))
    } else if (paket === "retainer") {
      setType("vg")
      setForm((f) => ({ ...f, interest: t.termin.step3.interests[1] }))
    }
    // Nur beim ersten Lauf — eine spätere Sprachumschaltung soll die
    // Auswahl des Nutzers nicht überschreiben.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

    const cells: ({
      day: number
      key: string
      past: boolean
      preferred: boolean
      today: boolean
      /** Sprechender Name fuer Screenreader (BF-A3 / F6). */
      label: string
    } | null)[] =
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
        /*
         * BF-A3 / F6 — die Schaltflaeche hiess fuer einen Screenreader nur
         * „31". Ohne Monat, ohne Wochentag, ohne den Hinweis, dass dies einer
         * unserer bevorzugten Gespraechstage ist. Der Name traegt das jetzt.
         */
        label: `${t.termin.step2.daysLong[dowMon]}, ${day}. ${t.termin.months[month]} ${year}`,
      })
    }
    return cells
    // `t` haengt an der Sprache, und die Sprache wechselt nur ueber einen
    // vollen Seitenwechsel (zwei Wurzel-Layouts, siehe site-shell.tsx). Die
    // Monats- und Wochentagsnamen koennen sich waehrend der Lebensdauer
    // dieser Komponente also nicht aendern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const stepTitle =
    step === 1
      ? t.termin.step1.title
      : step === 2
        ? t.termin.step2.title
        : step === 3
          ? t.termin.step3.title
          : step === 4
            ? t.termin.step4.title
            : t.termin.done.title

  useEffect(() => {
    // Beim ersten Rendern nichts ansagen und nichts fokussieren — der Mensch
    // hat den Assistenten gerade erst geoeffnet.
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus({ preventScroll: true })
    setAnnouncement(
      step === 5 ? t.termin.done.title : t.termin.stepAnnounce(step, stepTitle),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const isChosen = (key: string) => dates.some((d) => d.key === key)

  /** Anklicken wählt aus, nochmal anklicken wieder ab — bis zu MAX_DATES. */
  function toggleDate(cell: { day: number; key: string; past: boolean }) {
    if (cell.past || !cursor) return
    setError(null)
    setDates((current) => {
      if (current.some((d) => d.key === cell.key)) {
        return current.filter((d) => d.key !== cell.key)
      }
      if (current.length >= MAX_DATES) return current
      const label = `${cell.day}. ${t.termin.months[cursor.month]} ${cursor.year}`
      return [...current, { key: cell.key, label }].sort((a, b) => a.key.localeCompare(b.key))
    })
  }

  function toggleWindow(id: string) {
    setError(null)
    setWindows((current) =>
      current.includes(id) ? current.filter((w) => w !== id) : [...current, id],
    )
  }

  /** Zeitfenster in der Reihenfolge des Wörterbuchs, nicht der Anklick-Folge. */
  const chosenWindows = t.termin.step2.windows.filter((w) => windows.includes(w.id))
  const dateSummary = dates.length > 0 ? dates.map((d) => d.label).join(" · ") : "–"
  const windowSummary =
    chosenWindows.length > 0
      ? chosenWindows.map((w) => `${w.label} (${w.time})`).join(" · ")
      : "–"

  function goTo(next: number) {
    if (next === 3) {
      if (dates.length === 0) return setError(t.termin.step2.errDate)
      if (windows.length === 0) return setError(t.termin.step2.errTime)
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
      privacy: !privacyOk,
    }
    setInvalid(bad)
    const hasError = Object.values(bad).some(Boolean)
    if (hasError) {
      setError(
        bad.name || bad.phone || bad.org
          ? t.termin.step3.errRequired
          : bad.email
            ? t.termin.step3.errEmail
            : t.contact.errPrivacy,
      )
    }
    return !hasError
  }

  const summaryRows = [
    { k: t.termin.step4.typeLabel, v: typeLabel, accent: true },
    { k: t.termin.step4.dateLabel, v: dateSummary },
    { k: t.termin.step4.timeLabel, v: windowSummary },
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
    `📅 *${t.termin.waDate}:* ${dateSummary}`,
    `🕐 *${t.termin.waTime}:* ${windowSummary}`,
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

  /* Dieselben vier Zustaende wie im Kontaktformular — eine Route, eine Sprache. */
  function errorText(code: string | undefined) {
    if (code === "not_configured") return `${t.contact.errNotConfigured} ${contact.email}.`
    if (code === "rate_limited") return t.contact.errRateLimited
    if (code === "token_expired" || code === "token_invalid") return t.contact.errFormExpired
    return t.contact.errSendFailed
  }

  const inputClass =
    "w-full rounded-none border-0 border-b border-line-strong bg-transparent px-0 py-3 text-base text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground focus:border-gold"
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

        {/*
          Hoeflich vorlesende Region: Sie unterbricht nicht, sondern meldet
          sich, wenn der Screenreader gerade Pause hat. Fuer den Schrittwechsel
          ist das richtig — fuer Fehler ist es `role="alert"` weiter unten.
        */}
        <p aria-live="polite" role="status" className="sr-only">
          {announcement}
        </p>

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
            <h2 ref={headingRef} tabIndex={-1} className="text-display text-2xl outline-none">
              {t.termin.step1.title}
            </h2>
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
                  onClick={() => setType(option.id)}
                  aria-pressed={type === option.id}
                  /*
                    V2-6 — DER AUSWAHL-ZUSTAND WAR ZU LEISE.

                    Er bestand aus 7 % Gold-Tonung und einem 1 px goldenen
                    Rahmen. Auf einem Laptop bei Tageslicht ist der
                    Unterschied zur zweiten Karte kaum zu sehen — und diese
                    Auswahl ist die erste Entscheidung, die jemand auf dieser
                    Seite trifft. Wer nicht sieht, was er gewaehlt hat,
                    klickt zurueck oder bricht ab.

                    Jetzt drei Signale statt eines: kraeftigere Tonung, eine
                    durchgehende Gold-Kante oben (dieselbe Linie, die
                    anderswo beim Hover laeuft, hier dauerhaft) und ein
                    breiterer Rahmen. Das Haekchen rechts bleibt — es ist
                    das einzige Signal, das auch ohne Farbe funktioniert.
                  */
                  className={cn(
                    "border-line group relative flex flex-col border p-7 text-left transition-colors duration-500",
                    type === option.id
                      ? "bg-gold/[0.14] border-gold ring-gold/35 ring-1"
                      : "hover:bg-foreground/[0.02]",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "bg-gold absolute top-0 left-0 h-0.5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      type === option.id ? "w-full" : "w-0",
                    )}
                  />
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
            <h2 ref={headingRef} tabIndex={-1} className="text-display text-2xl outline-none">
              {t.termin.step2.title}
            </h2>
            <p className="type-body text-muted-foreground mt-3 max-w-xl text-pretty">
              {t.termin.step2.lead}
            </p>

            <div className="border-line mt-8 border">
              <div className="border-line flex items-center justify-between border-b px-5 py-4">
                {/*
                  MP10-5 — `-m-3 p-3` ist kein Zierrat, sondern die Bedienflaeche.

                  Beide Pfeile waren genau so gross wie ihr Symbol: 20 × 20 px.
                  Am Bildschirm faellt das nicht auf, mit dem Daumen schon —
                  und WCAG 2.2 verlangt seit 2.5.8 mindestens 24 × 24 px, wenn
                  ringsum kein Platz ist. Hier ist keiner: Der Monatsname sitzt
                  daneben, die Kalenderzellen darunter.

                  Gefunden hat das `npm run mobile`, nicht das Auge und nicht
                  das axe-Gate — das faehrt WCAG 2.1 und kennt das Kriterium
                  noch nicht. Fuer ein Haus, das Barrierefreiheits-Pruefungen
                  verkauft, ist die eigene Terminseite der falsche Ort dafuer.

                  Das Innenmass waechst auf 44 px, das Aussenmass bleibt bei
                  20: Die negative Aussenmarge nimmt genau zurueck, was der
                  Innenabstand hinzufuegt. Die Zeile ist danach keinen Pixel
                  hoeher — nur treffbar.
                */}
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  disabled={!canGoBack}
                  aria-label={t.termin.step2.prevMonth}
                  className="text-muted-foreground hover:text-gold-text -m-3 p-3 disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronLeft className="size-5" strokeWidth={1.5} />
                </button>
                <p className="text-display text-base">
                  {cursor ? `${t.termin.months[cursor.month]} ${cursor.year}` : " "}
                </p>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  aria-label={t.termin.step2.nextMonth}
                  className="text-muted-foreground hover:text-gold-text -m-3 p-3"
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
                      disabled={cell.past || (dates.length >= MAX_DATES && !isChosen(cell.key))}
                      onClick={() => toggleDate(cell)}
                      aria-pressed={isChosen(cell.key)}
                      aria-label={[
                        cell.label,
                        cell.preferred ? t.termin.step2.dayPreferred : null,
                        isChosen(cell.key) ? t.termin.step2.daySelected : null,
                      ]
                        .filter(Boolean)
                        .join(" — ")}
                      className={cn(
                        "relative flex aspect-square items-center justify-center text-sm transition-colors duration-300",
                        cell.past && "text-muted-foreground/35 pointer-events-none",
                        !cell.past && "hover:bg-gold/10",
                        cell.today && "font-semibold",
                        isChosen(cell.key) && "bg-gold text-[#201e1b]",
                        !cell.past &&
                          !isChosen(cell.key) &&
                          dates.length >= MAX_DATES &&
                          "text-muted-foreground/35 pointer-events-none",
                      )}
                    >
                      {cell.day}
                      {cell.preferred && !isChosen(cell.key) && (
                        <span
                          aria-hidden="true"
                          className="bg-gold absolute bottom-1.5 size-1 rounded-full"
                        />
                      )}
                    </button>
                  ),
                )}
              </div>

              <p className="border-line text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-meta border-t px-5 py-3">
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="bg-gold size-1 rounded-full" />
                  {t.termin.step2.preferred}
                </span>
                <span>{t.termin.step2.maxDates}</span>
              </p>
            </div>

            {/* Zeitfenster statt Uhrzeiten — und sichtbar, bevor ein Tag gewählt ist. */}
            <div className="mt-10">
              <h3 className="text-display text-xl">{t.termin.step2.timeTitle}</h3>
              <p className="type-small text-muted-foreground mt-2">{t.termin.step2.timeLead}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {t.termin.step2.windows.map((window) => (
                  <button
                    key={window.id}
                    type="button"
                    onClick={() => toggleWindow(window.id)}
                    aria-pressed={windows.includes(window.id)}
                    className={cn(
                      "flex flex-col items-start gap-1 border px-5 py-3 text-left transition-colors duration-300",
                      windows.includes(window.id)
                        ? "border-gold bg-gold text-[#201e1b]"
                        : "border-line-strong hover:border-gold hover:text-gold-text",
                    )}
                  >
                    <span className="text-sm tracking-wide">{window.label}</span>
                    {/*
                      V2-6 — hier stand `opacity-75`. Auf der gewaehlten,
                      goldenen Flaeche ergab das im Hellmodus 3,81 : 1 —
                      unter den 4,5 : 1, die WCAG 1.4.3 fuer Text dieser
                      Groesse verlangt. Nachgerechnet mit den echten Tokens:
                      #201e1b auf #be904e (hell) und auf #d3a763 (dunkel).
                      90 % ergibt 4,98 : 1 hell und 6,24 : 1 dunkel.

                      axe hat das nicht gemeldet: Es kann eine Deckkraft auf
                      Text ueber einer Token-Flaeche nicht zuverlaessig
                      aufloesen. Ein gruenes Gate heisst nicht, dass nichts
                      da ist — es heisst, dass die Maschine nichts gefunden
                      hat.
                    */}
                    <span className="font-mono text-xs opacity-90">{window.time}</span>
                  </button>
                ))}
              </div>
            </div>

            {/*
              Der Satz, der die ganze Stufe trägt: Hier wird nichts gebucht.
              Er steht bewusst VOR dem Weiter-Knopf und nicht im Kleingedruckten.
            */}
            <p className="border-gold/45 text-muted-foreground type-small mt-10 border-l-2 py-2 pl-4 text-pretty">
              {t.termin.step2.notBooked}
            </p>

            <div className="mt-12 flex items-center justify-between gap-4">
              <BackButton onClick={() => setStep(1)} label={t.termin.prev} />
              <StepButton
                disabled={dates.length === 0 || windows.length === 0}
                onClick={() => goTo(3)}
                label={t.termin.next}
              />
            </div>
          </section>
        )}

        {/* ── Schritt 3: Angaben ── */}
        {step === 3 && (
          <section className="mt-14">
            <h2 ref={headingRef} tabIndex={-1} className="text-display text-2xl outline-none">
              {t.termin.step3.title}
            </h2>
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

              {/*
                Derselbe Datenschutz-Baustein wie im Kontaktformular. Die
                Woerterbuch-Eintraege lagen in DE und TR bereit und wurden hier
                nie benutzt — dabei sammelt dieser Assistent MEHR
                personenbezogene Daten ein als das Formular.
              */}
              <div className="border-line border-t pt-7 sm:col-span-2">
                <label htmlFor="termin-privacy" className="flex cursor-pointer items-start gap-3.5">
                  <input
                    id="termin-privacy"
                    type="checkbox"
                    checked={privacyOk}
                    onChange={(e) => {
                      setPrivacyOk(e.target.checked)
                      setInvalid((v) => ({ ...v, privacy: false }))
                    }}
                    aria-invalid={invalid.privacy || undefined}
                    aria-describedby="termin-handoff"
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
                <p id="termin-handoff" className="text-muted-foreground text-meta mt-4">
                  {t.termin.step4.privacyNote}
                </p>
              </div>

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
            <h2 ref={headingRef} tabIndex={-1} className="text-display text-2xl outline-none">
              {t.termin.step4.title}
            </h2>
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

            {error && (
              <p
                role="alert"
                className="border-destructive/40 text-destructive mt-8 border-l-2 py-1 pl-4 text-sm"
              >
                {error}
              </p>
            )}

            {/*
              HIER LAG DER SCHLIMMSTE FEHLER DER SEITE.

              Vorher: `onClick={() => window.setTimeout(() => setStep(5), 800)}`
              auf einem Link nach WhatsApp. Der Erfolgsschritt kam nach 800
              Millisekunden — unabhaengig davon, ob WhatsApp ueberhaupt
              geoeffnet wurde, und garantiert bevor der Interessent dort auf
              Senden tippen konnte. Ohne Netz, mit Popup-Blocker, ohne
              WhatsApp auf dem Geraet: immer "Anfrage steht." Der Mensch
              wartete auf einen Rueckruf, der nie kommen konnte, weil nie
              jemand von ihm erfahren hat.

              Jetzt entscheidet der Server. Schritt 5 erscheint nur nach
              `ok: true` von `/api/lead`.
            */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
              <BackButton onClick={() => setStep(3)} label={t.termin.prev} />
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-line-strong hover:border-gold hover:text-gold-text inline-flex items-center gap-2.5 border px-6 py-4 text-sm tracking-wide transition-colors duration-500"
                >
                  <WhatsAppIcon className="size-4" />
                  {t.termin.step4.sendWhatsapp}
                </a>
                <button
                  type="button"
                  disabled={sending}
                  onClick={async () => {
                    setSending(true)
                    setError(null)
                    try {
                      const data = await submitLead({
                        name: form.name,
                        business: form.org,
                        email: form.email,
                        phone: form.phone,
                        privacyOk,
                        locale,
                        source: "termin",
                        // Der Assistent sammelt mehr als das Formular — alles,
                        // was er weiss, gehoert in die Mail, sonst muss der
                        // Rueckruf noch einmal von vorn fragen.
                        message: summaryRows
                          .map((row) => `${row.k}: ${row.v}`)
                          .join("\n"),
                      })

                      if (data.ok) {
                        trackLead("termin")
                        setStep(5)
                        window.scrollTo({ top: 0, behavior: "smooth" })
                        return
                      }
                      setError(errorText(data.error))
                    } catch {
                      setError(t.contact.errSendFailed)
                    } finally {
                      setSending(false)
                    }
                  }}
                  className="group from-gold-soft to-gold relative inline-flex items-center gap-3 overflow-hidden bg-gradient-to-br px-8 py-4 text-base tracking-wide text-[#201e1b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -translate-y-full bg-[#201e1b] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                  />
                  <span className="group-hover:text-gold-soft relative z-10 flex items-center gap-3 transition-colors duration-500">
                    <Send className="size-4" strokeWidth={1.5} />
                    {sending ? t.contact.sending : t.termin.step4.send}
                  </span>
                </button>
              </div>
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
            <h2 ref={headingRef} tabIndex={-1} className="type-h3 mt-8 outline-none">
              {t.termin.done.title}
            </h2>
            <p className="text-muted-foreground mt-5 max-w-xl text-base leading-relaxed text-pretty">
              {t.termin.done.lead}
            </p>

            <div className="border-line mt-10 flex flex-col gap-3 type-small border-t pt-8 font-mono">
              <p className="text-foreground">{dateSummary}</p>
              <p className="text-foreground">{windowSummary}</p>
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
                  setDates([])
                  setWindows([])
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
