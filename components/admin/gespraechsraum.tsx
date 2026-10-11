"use client"

import { useEffect, useRef, useState, useTransition } from "react"

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

export function Gespraechsraum({ kontakt, t }: { kontakt: GespraechKontakt; t: GespraechText }) {
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

  if (gespeichert) {
    const titel = `${gespeichert.folge || t.folgeStandard} – ${kontakt.name}${firma}`
    const details = [kontakt.phone && `Tel. ${kontakt.phone}`, gespeichert.abschnitte.bedarf].filter(Boolean).join("\n")
    return (
      <section aria-live="polite" className="border-line bg-surface flex flex-col gap-5 border p-6 sm:p-8">
        <p className="eyebrow text-gold-text">{t.gespeichertEyebrow}</p>
        <h2 className="type-h3 text-balance">{t.gespeichertTitel(kontakt.name, Math.max(1, Math.round(gespeichert.sek / 60)))}</h2>
        {gespeichert.folge && gespeichert.folgeAm ? (
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground leading-relaxed">
              {t.folgeBereit}: <span className="text-foreground">{gespeichert.folge}</span> ·{" "}
              {new Date(`${gespeichert.folgeAm}T${gespeichert.folgeUm || "10:00"}`).toLocaleString(t.locale, {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => icsLaden(titel, details, gespeichert.folgeAm, gespeichert.folgeUm || "10:00")}
                className="bg-gold text-background hover:bg-gold-deep px-5 py-3 text-sm font-medium transition-colors"
              >
                {t.icsLaden}
              </button>
              <a
                href={googleLink(titel, details, gespeichert.folgeAm, gespeichert.folgeUm || "10:00")}
                target="_blank"
                rel="noreferrer"
                className="border-line-strong hover:border-gold border px-5 py-3 text-sm transition-colors"
              >
                {t.googleKalender}
              </a>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground leading-relaxed">{t.ohneFolge}</p>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => setGespeichert(null)}
            className="border-line-strong hover:border-gold border px-5 py-3 text-sm transition-colors"
          >
            {t.neuesGespraech}
          </button>
          <a
            href={`/admin/vertrieb/beziehungen/${kontakt.id}`}
            className="text-gold-text px-1 py-3 text-sm underline-offset-4 hover:underline"
          >
            {t.zurAkte}
          </a>
        </div>
      </section>
    )
  }

  return (
    <section aria-label={t.raumLabel} className="flex flex-col gap-6">
      <div className="border-line bg-surface flex flex-wrap items-center justify-between gap-4 border p-5">
        <div className="min-w-0">
          <p className="eyebrow text-gold-text">{t.imGespraech}</p>
          <h2 className="type-h3 mt-1 truncate">{kontakt.name}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {[kontakt.role, kontakt.organisation].filter(Boolean).join(" · ") || t.ohneFirma}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {kontakt.phone && (
            <a
              href={`tel:${kontakt.phone.replace(/[^\d+]/g, "")}`}
              onClick={() => setLaeuft(true)}
              className="bg-gold text-background hover:bg-gold-deep px-4 py-2.5 text-sm font-medium transition-colors"
            >
              {t.anrufen} {kontakt.phone}
            </a>
          )}
          {kontakt.email && (
            <a
              href={`mailto:${kontakt.email}`}
              className="border-line-strong hover:border-gold border px-4 py-2.5 text-sm transition-colors"
            >
              {t.mail}
            </a>
          )}
          <div
            className="border-line-strong flex items-center gap-3 border px-4 py-2"
            role="timer"
            aria-label={t.dauer}
          >
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full ${laeuft ? "bg-gold animate-pulse" : "bg-line-strong"}`}
            />
            <span className="font-mono text-lg tabular-nums">{uhr(e.sek)}</span>
            <button
              type="button"
              onClick={() => setLaeuft((l) => !l)}
              className="text-gold-text text-sm underline-offset-4 hover:underline"
            >
              {laeuft ? t.pause : e.sek > 0 ? t.weiter : t.start}
            </button>
          </div>
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-muted-foreground mb-3 text-sm">{t.interesseLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {t.interessen.map(([key, label]) => {
            const an = e.interessen.includes(key)
            return (
              <button
                key={key}
                type="button"
                aria-pressed={an}
                onClick={() => umschalten(key)}
                className={`border px-3 py-1.5 text-sm transition-all duration-200 ${
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
      </fieldset>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between gap-3">
            <label htmlFor="g-notiz" className="text-sm font-medium">
              {t.abschnitte.notiz}
            </label>
            <button
              type="button"
              onClick={zeitmarke}
              className="text-gold-text text-sm underline-offset-4 hover:underline"
            >
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
            className="border-line bg-surface focus:border-gold min-h-80 w-full resize-y border p-4 leading-relaxed outline-none transition-colors xl:min-h-[30rem]"
          />
        </div>

        <div className="flex flex-col gap-4">
          {NEBEN.map((a) => (
            <div key={a} className="flex flex-col gap-2">
              <label htmlFor={`g-${a}`} className="text-sm font-medium">
                {t.abschnitte[a]}
              </label>
              <textarea
                id={`g-${a}`}
                rows={3}
                value={e.abschnitte[a] ?? ""}
                onChange={(ev) => setze(a, ev.target.value)}
                placeholder={t.platzhalter[a]}
                className="border-line bg-surface focus:border-gold w-full resize-y border p-3 text-sm leading-relaxed outline-none transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-line flex flex-col gap-4 border-t pt-6">
        <p className="text-sm font-medium">{t.folgeTitel}</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <label className="sr-only" htmlFor="g-folge">
            {t.folgeTitel}
          </label>
          <input
            id="g-folge"
            value={e.folge}
            onChange={(ev) => setE((v) => ({ ...v, folge: ev.target.value }))}
            placeholder={t.folgePlatzhalter}
            className="border-line bg-surface focus:border-gold border px-3 py-2.5 text-sm outline-none transition-colors"
          />
          <label className="sr-only" htmlFor="g-folge-am">
            {t.folgeAm}
          </label>
          <input
            id="g-folge-am"
            type="date"
            value={e.folgeAm}
            onChange={(ev) => setE((v) => ({ ...v, folgeAm: ev.target.value }))}
            className="border-line bg-surface focus:border-gold border px-3 py-2.5 text-sm outline-none transition-colors"
          />
          <label className="sr-only" htmlFor="g-folge-um">
            {t.folgeUm}
          </label>
          <input
            id="g-folge-um"
            type="time"
            value={e.folgeUm}
            onChange={(ev) => setE((v) => ({ ...v, folgeUm: ev.target.value }))}
            className="border-line bg-surface focus:border-gold border px-3 py-2.5 text-sm outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={abschliessen}
          disabled={pending || !hatInhalt}
          className="bg-gold text-background hover:bg-gold-deep px-6 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? t.speichertLaeuft : t.abschliessen}
        </button>
        <p className="text-muted-foreground text-sm">{t.entwurfHinweis}</p>
        {fehler && (
          <p role="alert" className="text-destructive text-sm">
            {fehler}
          </p>
        )}
      </div>
    </section>
  )
}
