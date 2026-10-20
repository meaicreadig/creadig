"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"

import type { Locale } from "@/lib/dictionary"
import { TERMIN_TEXTE } from "@/lib/termine/texte"
import { useRouter } from "next/navigation"
import { CalendarCheck } from "lucide-react"

import { terminBuchen } from "@/app/(de)/termin/buchen/[token]/actions"

const FELD =
  "border-line bg-background focus:border-gold w-full rounded-md border px-3 py-2.5 text-base outline-none transition-colors"

export function BuchungsAuswahl({ token, slots, timezone, dauer, locale = "de" }: { token: string; slots: number[]; timezone: string; dauer: number; locale?: Locale }) {
  const T = TERMIN_TEXTE[locale]
  const A = T.auswahl
  const router = useRouter()
  const [gewaehlt, setGewaehlt] = useState<number | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [fertig, setFertig] = useState<{ reference: string; zeit: string } | null>(null)
  const [laeuft, starte] = useTransition()

  const tage = useMemo(() => {
    const tagFmt = new Intl.DateTimeFormat(T.intl, { timeZone: timezone, weekday: "long", day: "numeric", month: "long" })
    const m = new Map<string, number[]>()
    for (const s of slots) {
      const k = tagFmt.format(new Date(s))
      m.set(k, [...(m.get(k) ?? []), s])
    }
    return [...m.entries()]
  }, [slots, timezone, T.intl])
  const uhr = (ms: number) => new Date(ms).toLocaleTimeString(T.intl, { timeZone: timezone, hour: "2-digit", minute: "2-digit" })

  if (fertig) {
    return (
      <div role="status" className="border-gold/40 bg-gold/10 flex flex-col gap-3 rounded-lg border p-6">
        <CalendarCheck aria-hidden="true" className="text-gold size-6" />
        <h2 className="font-display text-xl font-semibold">{A.bestaetigt}</h2>
        <p className="leading-relaxed">{fertig.zeit}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {A.referenz} <span className="font-mono">{fertig.reference}</span>. {A.bestaetigungUnterwegs}
        </p>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <p className="text-muted-foreground leading-relaxed">
        {A.keinTermin}
      </p>
    )
  }

  function absenden(form: FormData) {
    if (gewaehlt === null) return setFehler(A.bitteUhrzeit)
    setFehler(null)
    starte(async () => {
      const r = await terminBuchen({
        token,
        start: gewaehlt,
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        note: String(form.get("note") ?? ""),
        website: String(form.get("website") ?? ""),
      })
      if (r.ok) return setFertig({ reference: r.reference, zeit: r.zeit })
      setFehler(r.fehler)
      if (r.neuLaden) {
        setGewaehlt(null)
        router.refresh()
      }
    })
  }

  return (
    <div dir={T.dir} className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">{A.uhrzeitWaehlen}</legend>
        {tage.map(([tag, liste]) => (
          <div key={tag} className="flex flex-col gap-3">
            <h2 className="text-sm font-medium">{tag}</h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {liste.map((s) => {
                const aktiv = s === gewaehlt
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={aktiv}
                    onClick={() => setGewaehlt(s)}
                    className={`min-h-11 rounded-md border font-mono text-sm tabular-nums transition-colors ${
                      aktiv ? "border-gold bg-gold text-background" : "border-line hover:border-gold"
                    }`}
                  >
                    {uhr(s)}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </fieldset>

      <form action={absenden} className="border-line flex flex-col gap-4 border-t pt-8">
        <p className="text-sm">
          {gewaehlt !== null ? (
            <>
              {A.gewaehlt} <span className="font-medium">{new Date(gewaehlt).toLocaleString(T.intl, { timeZone: timezone, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}{T.uhrSuffix}</span> · {dauer} {A.minuten}
            </>
          ) : (
            <span className="text-muted-foreground">{A.nochKeine}</span>
          )}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            {A.name}
            <input name="name" required autoComplete="name" maxLength={120} className={FELD} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            {A.email}
            <input name="email" type="email" required autoComplete="email" maxLength={200} className={FELD} />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-sm">
          {A.worum} <span className="text-muted-foreground">{A.optional}</span>
          <textarea name="note" rows={3} maxLength={1000} className={FELD} />
        </label>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        {fehler && (
          <p role="alert" className="text-sm text-destructive">
            {fehler}
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={laeuft}
            className="bg-gold text-background hover:bg-gold/90 inline-flex min-h-11 items-center rounded-md px-5 font-medium disabled:opacity-60"
          >
            {laeuft ? A.laeuft : A.buchen}
          </button>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {A.datenschutzVor}{" "}
          <Link href={`${T.pfad}/datenschutz`} className="underline underline-offset-4">
            {A.datenschutz}
          </Link>
          .
        </p>
      </form>
    </div>
  )
}
