"use client"

import { useState, useTransition } from "react"

import { postEntwerfen, type PostAnlass } from "@/app/(admin)/admin/marketing/actions"
import { entwurfAnlegen } from "@/app/(admin)/admin/veroeffentlichungen/actions"

const LIMIT = 3000
const VORSCHAU_ZEILEN = 3

type Texte = {
  titel: string
  anlass: string
  anlaesse: Record<PostAnlass, string>
  stichpunkte: string
  platzhalter: string
  erzeugen: string
  erzeugt: string
  vorschau: string
  mehr: string
  weniger: string
  kopieren: string
  kopiert: string
  speichern: string
  gespeichert: string
  leer: string
}

export function PostWerkstatt({ t }: { t: Texte }) {
  const [anlass, setAnlass] = useState<PostAnlass>("lieferung")
  const [stichpunkte, setStichpunkte] = useState("")
  const [text, setText] = useState("")
  const [fehler, setFehler] = useState<string | null>(null)
  const [offen, setOffen] = useState(false)
  const [kopiert, setKopiert] = useState(false)
  const [gespeichert, setGespeichert] = useState(false)
  const [laeuft, starte] = useTransition()
  const [speichert, speichere] = useTransition()

  const erzeugen = () =>
    starte(async () => {
      setFehler(null)
      setGespeichert(false)
      const r = await postEntwerfen(anlass, stichpunkte)
      if ("fehler" in r) setFehler(r.fehler)
      else {
        setText(r.text)
        setOffen(false)
      }
    })

  const kopieren = async () => {
    await navigator.clipboard.writeText(text)
    setKopiert(true)
    setTimeout(() => setKopiert(false), 1800)
  }

  const speichern = () =>
    speichere(async () => {
      const fd = new FormData()
      fd.set("was", text)
      fd.set("kanal", "linkedin")
      fd.set("quelle", anlass)
      await entwurfAnlegen(fd)
      setGespeichert(true)
    })

  const zeilen = text.split("\n")
  const gekuerzt = !offen && zeilen.length > VORSCHAU_ZEILEN
  const sichtbar = gekuerzt ? zeilen.slice(0, VORSCHAU_ZEILEN).join("\n") : text

  return (
    <section className="border-border bg-surface flex flex-col gap-5 rounded-lg border p-4 md:p-6">
      <h2 className="text-muted-foreground font-mono text-[11px] uppercase tracking-widest">{t.titel}</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-muted-foreground mb-2 text-xs">{t.anlass}</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(t.anlaesse) as PostAnlass[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAnlass(a)}
                  aria-pressed={anlass === a}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    anlass === a
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {t.anlaesse[a]}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-2">
            <span className="text-muted-foreground text-xs">{t.stichpunkte}</span>
            <textarea
              value={stichpunkte}
              onChange={(e) => setStichpunkte(e.target.value)}
              placeholder={t.platzhalter}
              rows={7}
              maxLength={2000}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary rounded-md border p-3 text-sm leading-relaxed outline-none focus-visible:ring-2"
            />
          </label>

          <button
            type="button"
            onClick={erzeugen}
            disabled={laeuft || stichpunkte.trim().length < 10}
            className="bg-primary text-primary-foreground self-start rounded-md px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-40"
          >
            {laeuft ? t.erzeugt : t.erzeugen}
          </button>
          {fehler && (
            <p role="alert" className="text-destructive text-sm">
              {fehler}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-muted-foreground text-xs">{t.vorschau}</span>
          <article className="border-border bg-background flex flex-col gap-3 rounded-lg border p-4" aria-live="polite">
            <header className="flex items-center gap-3">
              <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full font-serif text-sm font-semibold">
                cD
              </span>
              <span className="flex flex-col">
                <span className="text-foreground text-sm font-semibold">creaDIG</span>
                <span className="text-muted-foreground text-xs">System-Haus für digitale Betriebe</span>
              </span>
            </header>
            {text ? (
              <div className="text-foreground text-sm leading-relaxed">
                <p className="whitespace-pre-line">{sichtbar}</p>
                {zeilen.length > VORSCHAU_ZEILEN && (
                  <button
                    type="button"
                    onClick={() => setOffen((o) => !o)}
                    className="text-muted-foreground hover:text-foreground mt-1 text-sm"
                  >
                    {gekuerzt ? t.mehr : t.weniger}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t.leer}</p>
            )}
          </article>

          {text && (
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`font-mono text-xs tabular-nums ${text.length > LIMIT ? "text-destructive" : "text-muted-foreground"}`}
              >
                {text.length} / {LIMIT}
              </span>
              <button
                type="button"
                onClick={kopieren}
                className="border-border text-foreground hover:border-foreground/40 rounded-md border px-3 py-1.5 text-sm"
              >
                {kopiert ? t.kopiert : t.kopieren}
              </button>
              <button
                type="button"
                onClick={speichern}
                disabled={speichert || gespeichert}
                className="border-primary text-primary rounded-md border px-3 py-1.5 text-sm disabled:opacity-60"
              >
                {gespeichert ? t.gespeichert : t.speichern}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
