"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CalendarCheck } from "lucide-react"

import { terminBuchen } from "@/app/(de)/termin/buchen/[token]/actions"

const FELD =
  "border-line bg-background focus:border-gold w-full rounded-md border px-3 py-2.5 text-base outline-none transition-colors"

export function BuchungsAuswahl({ token, slots, timezone, dauer }: { token: string; slots: number[]; timezone: string; dauer: number }) {
  const router = useRouter()
  const [gewaehlt, setGewaehlt] = useState<number | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [fertig, setFertig] = useState<{ reference: string; zeit: string } | null>(null)
  const [laeuft, starte] = useTransition()

  const tage = useMemo(() => {
    const tagFmt = new Intl.DateTimeFormat("de-DE", { timeZone: timezone, weekday: "long", day: "numeric", month: "long" })
    const m = new Map<string, number[]>()
    for (const s of slots) {
      const k = tagFmt.format(new Date(s))
      m.set(k, [...(m.get(k) ?? []), s])
    }
    return [...m.entries()]
  }, [slots, timezone])
  const uhr = (ms: number) => new Date(ms).toLocaleTimeString("de-DE", { timeZone: timezone, hour: "2-digit", minute: "2-digit" })

  if (fertig) {
    return (
      <div role="status" className="border-gold/40 bg-gold/10 flex flex-col gap-3 rounded-lg border p-6">
        <CalendarCheck aria-hidden="true" className="text-gold size-6" />
        <h2 className="font-display text-xl font-semibold">Termin bestätigt</h2>
        <p className="leading-relaxed">{fertig.zeit}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Referenz <span className="font-mono">{fertig.reference}</span>. Die Bestätigung mit Kalenderdatei ist unterwegs.
        </p>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <p className="text-muted-foreground leading-relaxed">
        Gerade ist kein Termin frei. Antworten Sie einfach auf unsere Mail — wir finden einen.
      </p>
    )
  }

  function absenden(form: FormData) {
    if (gewaehlt === null) return setFehler("Bitte zuerst eine Uhrzeit wählen.")
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
    <div className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">Uhrzeit wählen</legend>
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
              Gewählt: <span className="font-medium">{new Date(gewaehlt).toLocaleString("de-DE", { timeZone: timezone, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })} Uhr</span> · {dauer} Min.
            </>
          ) : (
            <span className="text-muted-foreground">Noch keine Uhrzeit gewählt.</span>
          )}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            Name
            <input name="name" required autoComplete="name" maxLength={120} className={FELD} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            E-Mail
            <input name="email" type="email" required autoComplete="email" maxLength={200} className={FELD} />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-sm">
          Worum geht es? <span className="text-muted-foreground">(optional)</span>
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
            {laeuft ? "Wird gebucht …" : "Termin verbindlich buchen"}
          </button>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Ihre Angaben nutzen wir nur für diesen Termin. Mehr in der{" "}
          <a href="/datenschutz" className="underline underline-offset-4">
            Datenschutzerklärung
          </a>
          .
        </p>
      </form>
    </div>
  )
}
