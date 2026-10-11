"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react"
import {
  Building2,
  CalendarClock,
  ChevronDown,
  Clock,
  History,
  Mail,
  Pause,
  Phone,
  Play,
  Tags,
  Timer,
} from "lucide-react"

import { gespraechSpeichern } from "@/app/(admin)/admin/gespraech/actions"
import type { Abschnitt, GespraechKontakt, Interesse } from "@/lib/gespraech"
import type { GespraechText } from "@/lib/gespraech-text"

type Entwurf = {
  abschnitte: Partial<Record<Abschnitt, string>>
  interessen: Interesse[]
  folge: string
  folgeAm: string
  folgeUm: string
  sek: number
}

const LEER: Entwurf = { abschnitte: {}, interessen: [], folge: "", folgeAm: "", folgeUm: "10:00", sek: 0 }
const NEBEN: Exclude<Abschnitt, "notiz">[] = ["ausgangslage", "bedarf", "rahmen", "einwaende"]

function uhr(sek: number): string {
  const h = Math.floor(sek / 3600)
  const m = Math.floor((sek % 3600) / 60)
  const s = sek % 60
  const mm = String(m).padStart(2, "0")
  const ss = String(s).padStart(2, "0")
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function kalenderZeit(datum: string, zeit: string, plusMin = 0): string {
  const [y, mo, d] = datum.split("-").map(Number)
  const [h, mi] = zeit.split(":").map(Number)
  const t = new Date(y, mo - 1, d, h, mi + plusMin)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${t.getFullYear()}${p(t.getMonth() + 1)}${p(t.getDate())}T${p(t.getHours())}${p(t.getMinutes())}00`
}

function icsLaden(titel: string, details: string, datum: string, zeit: string) {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`)
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//creaDIG//Zentrale//DE",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@creadig`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${kalenderZeit(datum, zeit)}`,
    `DTEND:${kalenderZeit(datum, zeit, 30)}`,
    `SUMMARY:${esc(titel)}`,
    `DESCRIPTION:${esc(details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url
  a.download = "termin.ics"
  a.click()
  URL.revokeObjectURL(url)
}

function googleLink(titel: string, details: string, datum: string, zeit: string): string {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: titel,
    details,
    dates: `${kalenderZeit(datum, zeit)}/${kalenderZeit(datum, zeit, 30)}`,
    ctz: "Europe/Berlin",
  })
  return `https://calendar.google.com/calendar/render?${p.toString()}`
}

function Eigenschaft({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-10 items-center gap-3">
      <dt className="text-muted-foreground flex w-40 shrink-0 items-center gap-2.5 text-sm">
        <span aria-hidden="true" className="flex size-4 items-center justify-center">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-sm">{children}</dd>
    </div>
  )
}

const FLAECHE_FELD =
  "border-line bg-transparent hover:bg-surface focus:bg-surface focus:border-gold rounded-md border px-3 py-2 text-sm outline-none transition-colors"

export function Gespraechsraum({
  kontakt,
  t,
  verlauf,
}: {
  kontakt: GespraechKontakt
  t: GespraechText
  verlauf: ReactNode
}) {
  const schluessel = `gespraech-entwurf:${kontakt.id}`
  const [e, setE] = useState<Entwurf>(LEER)
  const [laeuft, setLaeuft] = useState(false)
  const [geladen, setGeladen] = useState(false)
  const [gespeichert, setGespeichert] = useState<Entwurf | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const notizRef = useRef<HTMLTextAreaElement>(null)

  /* Absturzschutz: Der Entwurf überlebt einen Neuladen dieses Tabs — gespeichert wird er erst in der Akte. */
  useEffect(() => {
    try {
      const roh = sessionStorage.getItem(schluessel)
      if (roh) setE({ ...LEER, ...(JSON.parse(roh) as Entwurf) })
    } catch {}
    setGeladen(true)
  }, [schluessel])

  useEffect(() => {
    if (!geladen) return
    try {
      sessionStorage.setItem(schluessel, JSON.stringify(e))
    } catch {}
  }, [e, geladen, schluessel])

  useEffect(() => {
    if (!laeuft) return
    const id = window.setInterval(() => setE((v) => ({ ...v, sek: v.sek + 1 })), 1000)
    return () => window.clearInterval(id)
  }, [laeuft])

  const setze = (a: Abschnitt, wert: string) => setE((v) => ({ ...v, abschnitte: { ...v.abschnitte, [a]: wert } }))

  const zeitmarke = () => {
    const feld = notizRef.current
    const marke = `[${uhr(e.sek)}] `
    const alt = e.abschnitte.notiz ?? ""
    const pos = feld?.selectionStart ?? alt.length
    const davor = alt.slice(0, pos)
    const neu = `${davor}${davor && !davor.endsWith("\n") ? "\n" : ""}${marke}${alt.slice(pos)}`
    setze("notiz", neu)
    requestAnimationFrame(() => {
      if (!feld) return
      const ziel = neu.length - alt.slice(pos).length
      feld.focus()
      feld.setSelectionRange(ziel, ziel)
    })
  }

  const umschalten = (i: Interesse) =>
    setE((v) => ({
      ...v,
      interessen: v.interessen.includes(i) ? v.interessen.filter((x) => x !== i) : [...v.interessen, i],
    }))

  const abschliessen = () => {
    setFehler(null)
    setLaeuft(false)
    const stand = e
    startTransition(async () => {
      const r = await gespraechSpeichern({
        kontaktId: kontakt.id,
        dauerSek: stand.sek,
        abschnitte: stand.abschnitte as Record<string, string>,
        interessen: stand.interessen,
        folge: stand.folge,
        folgeAm: stand.folgeAm,
        folgeUm: stand.folgeUm,
      })
      if (r.ok) {
        setGespeichert(stand)
        setE(LEER)
        try {
          sessionStorage.removeItem(schluessel)
        } catch {}
      } else {
        setFehler(r.fehler === "leer" ? t.fehlerLeer : t.fehlerSpeicher)
      }
    })
  }

  const hatInhalt = Object.values(e.abschnitte).some((s) => s?.trim()) || e.folge.trim().length > 0
  const firma = kontakt.organisation ? ` · ${kontakt.organisation}` : ""
  const status = laeuft ? t.live : e.sek > 0 ? t.pausiert : t.bereit
  const datumKurz = (iso: string) =>
    new Date(iso.length === 10 ? `${iso}T12:00` : iso).toLocaleDateString(t.locale, { dateStyle: "medium" })

  const abschlussKarte = gespeichert ? (
    <div aria-live="polite" className="flex flex-col gap-4">
      <p className="eyebrow text-gold-text">{t.gespeichertEyebrow}</p>
      <p className="font-display text-lg font-semibold text-balance">
        {t.gespeichertTitel
          .replace("{name}", kontakt.name)
          .replace("{min}", String(Math.max(1, Math.round(gespeichert.sek / 60))))}
      </p>
      {gespeichert.folge && gespeichert.folgeAm ? (
        <>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t.folgeBereit}: <span className="text-foreground">{gespeichert.folge}</span>
            {" · "}
            {new Date(`${gespeichert.folgeAm}T${gespeichert.folgeUm || "10:00"}`).toLocaleString(t.locale, {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                icsLaden(
                  `${gespeichert.folge || t.folgeStandard} – ${kontakt.name}${firma}`,
                  [kontakt.phone && `Tel. ${kontakt.phone}`, gespeichert.abschnitte.bedarf].filter(Boolean).join("\n"),
                  gespeichert.folgeAm,
                  gespeichert.folgeUm || "10:00",
                )
              }
              className="bg-gold text-primary-foreground hover:bg-gold-deep rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              {t.icsLaden}
            </button>
            <a
              href={googleLink(
                `${gespeichert.folge || t.folgeStandard} – ${kontakt.name}${firma}`,
                [kontakt.phone && `Tel. ${kontakt.phone}`, gespeichert.abschnitte.bedarf].filter(Boolean).join("\n"),
                gespeichert.folgeAm,
                gespeichert.folgeUm || "10:00",
              )}
              target="_blank"
              rel="noreferrer"
              className="border-line-strong hover:border-gold rounded-md border px-4 py-2 text-sm transition-colors"
            >
              {t.googleKalender}
            </a>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-sm leading-relaxed">{t.ohneFolge}</p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setGespeichert(null)}
          className="border-line-strong hover:border-gold rounded-md border px-4 py-2 text-sm transition-colors"
        >
          {t.neuesGespraech}
        </button>
        <Link
          href={`/admin/vertrieb/beziehungen/${kontakt.id}`}
          className="text-gold-text text-sm underline-offset-4 hover:underline"
        >
          {t.zurAkte}
        </Link>
      </div>
    </div>
  ) : null

  return (
    <section
      aria-label={t.raumLabel}
      className="border-line bg-surface/40 grid overflow-hidden rounded-xl border xl:grid-cols-[minmax(0,1fr)_22rem]"
    >
      {/* Dokument */}
      <div className="flex min-w-0 flex-col gap-8 p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="border-line-strong text-muted-foreground inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${laeuft ? "bg-gold animate-pulse" : "bg-line-strong"}`}
            />
            {t.gespraechChip}
          </span>
          <span className="text-muted-foreground font-mono text-xs">
            {t.zentrale} / {t.titel}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {kontakt.name}
          </h2>
          <p className="text-muted-foreground text-sm">
            {[kontakt.role, kontakt.organisation].filter(Boolean).join(" · ") || t.ohneFirma}
          </p>
        </div>

        <dl className="grid gap-x-10 gap-y-1 lg:grid-cols-2">
          <Eigenschaft icon={<Timer className="size-4" />} label={t.status}>
            <span
              role="timer"
              aria-label={t.dauer}
              className={`inline-flex items-center overflow-hidden rounded-md text-xs font-medium tracking-wide uppercase ${
                laeuft ? "bg-gold text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              <span className="px-2.5 py-1.5">{status}</span>
              <span className="border-background/20 border-l px-2.5 py-1.5 font-mono tabular-nums normal-case">
                {uhr(e.sek)}
              </span>
              <button
                type="button"
                onClick={() => setLaeuft((l) => !l)}
                aria-label={laeuft ? t.pause : e.sek > 0 ? t.weiter : t.start}
                className="border-background/20 hover:bg-background/15 border-l px-2 py-1.5 transition-colors"
              >
                {laeuft ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              </button>
            </span>
          </Eigenschaft>

          <Eigenschaft icon={<Phone className="size-4" />} label={t.telefon}>
            {kontakt.phone ? (
              <a
                href={`tel:${kontakt.phone.replace(/[^\d+]/g, "")}`}
                onClick={() => setLaeuft(true)}
                className="hover:text-gold-text inline-flex items-center gap-2 font-mono tabular-nums transition-colors"
              >
                {kontakt.phone}
                <span className="bg-gold text-primary-foreground rounded px-1.5 py-0.5 font-sans text-[11px] font-medium">
                  {t.anrufen}
                </span>
              </a>
            ) : (
              <span className="text-muted-foreground">{t.offen}</span>
            )}
          </Eigenschaft>

          <Eigenschaft icon={<Building2 className="size-4" />} label={t.firma}>
            {kontakt.organisation ?? <span className="text-muted-foreground">{t.offen}</span>}
          </Eigenschaft>

          <Eigenschaft icon={<Mail className="size-4" />} label={t.email}>
            {kontakt.email ? (
              <a href={`mailto:${kontakt.email}`} className="hover:text-gold-text truncate transition-colors">
                {kontakt.email}
              </a>
            ) : (
              <span className="text-muted-foreground">{t.offen}</span>
            )}
          </Eigenschaft>

          <Eigenschaft icon={<Clock className="size-4" />} label={t.zuletztGesprochen}>
            {kontakt.lastInteractionAt ? (
              datumKurz(kontakt.lastInteractionAt)
            ) : (
              <span className="text-muted-foreground">{t.offen}</span>
            )}
          </Eigenschaft>

          <Eigenschaft icon={<CalendarClock className="size-4" />} label={t.naechsterKontakt}>
            {kontakt.nextTouch || kontakt.nextTouchAt ? (
              <span className="truncate">
                {kontakt.nextTouch}
                {kontakt.nextTouchAt && (
                  <span className="text-gold-text ml-2 font-mono text-xs">{datumKurz(kontakt.nextTouchAt)}</span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">{t.offen}</span>
            )}
          </Eigenschaft>
        </dl>

        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground flex items-center gap-2.5 text-sm">
            <Tags aria-hidden="true" className="size-4" />
            {t.themen}
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.interesseLabel}>
            {t.interessen.map(([key, label]) => {
              const an = e.interessen.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={an}
                  onClick={() => umschalten(key)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    an
                      ? "border-gold bg-gold/15 text-foreground"
                      : "border-line text-muted-foreground hover:border-line-strong hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-line flex flex-col gap-3 border-t pt-8">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="g-notiz" className="font-display text-lg font-semibold">
              {t.abschnitte.notiz}
            </label>
            <button
              type="button"
              onClick={zeitmarke}
              className="border-line hover:border-gold text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-xs transition-colors"
            >
              <Clock aria-hidden="true" className="size-3.5" />
              {t.zeitmarke}
            </button>
          </div>
          <textarea
            id="g-notiz"
            ref={notizRef}
            value={e.abschnitte.notiz ?? ""}
            onChange={(ev) => setze("notiz", ev.target.value)}
            onFocus={() => e.sek === 0 && !laeuft && setLaeuft(true)}
            placeholder={t.notizPlatzhalter}
            className="placeholder:text-muted-foreground/70 min-h-72 w-full resize-y bg-transparent text-base leading-relaxed outline-none"
          />
        </div>

        <details className="group border-line border-t pt-6" open>
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium">
            <ChevronDown
              aria-hidden="true"
              className="size-4 -rotate-90 transition-transform group-open:rotate-0"
            />
            {t.leitfragen}
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {NEBEN.map((a) => (
              <div key={a} className="flex flex-col gap-1.5">
                <label htmlFor={`g-${a}`} className="text-muted-foreground text-xs">
                  {t.abschnitte[a]}
                </label>
                <textarea
                  id={`g-${a}`}
                  rows={3}
                  value={e.abschnitte[a] ?? ""}
                  onChange={(ev) => setze(a, ev.target.value)}
                  placeholder={t.platzhalter[a]}
                  className={`${FLAECHE_FELD} w-full resize-y leading-relaxed`}
                />
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Aktivität */}
      <aside
        aria-label={t.aktivitaet}
        className="border-line bg-background/60 flex min-h-[32rem] flex-col border-t xl:border-t-0 xl:border-l"
      >
        <div className="border-line flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-display text-base font-semibold">{t.aktivitaet}</h2>
          <History aria-hidden="true" className="text-muted-foreground size-4" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">{abschlussKarte ?? verlauf}</div>

        {!gespeichert && (
          <div className="border-line bg-surface flex flex-col gap-3 border-t p-4">
            <label htmlFor="g-folge" className="text-muted-foreground text-xs">
              {t.folgeTitel}
            </label>
            <input
              id="g-folge"
              value={e.folge}
              onChange={(ev) => setE((v) => ({ ...v, folge: ev.target.value }))}
              placeholder={t.folgePlatzhalter}
              className={FLAECHE_FELD}
            />
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <label className="sr-only" htmlFor="g-folge-am">
                {t.folgeAm}
              </label>
              <input
                id="g-folge-am"
                type="date"
                value={e.folgeAm}
                onChange={(ev) => setE((v) => ({ ...v, folgeAm: ev.target.value }))}
                className={FLAECHE_FELD}
              />
              <label className="sr-only" htmlFor="g-folge-um">
                {t.folgeUm}
              </label>
              <input
                id="g-folge-um"
                type="time"
                value={e.folgeUm}
                onChange={(ev) => setE((v) => ({ ...v, folgeUm: ev.target.value }))}
                className={FLAECHE_FELD}
              />
            </div>
            <button
              type="button"
              onClick={abschliessen}
              disabled={pending || !hatInhalt}
              className="bg-gold text-primary-foreground hover:bg-gold-deep rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? t.speichertLaeuft : t.abschliessen}
            </button>
            {fehler ? (
              <p role="alert" className="text-destructive text-xs">
                {fehler}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs leading-relaxed">{t.entwurfHinweis}</p>
            )}
          </div>
        )}
      </aside>
    </section>
  )
}
