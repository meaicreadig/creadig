"use client"

import { useState, useTransition } from "react"

import {
  linkedinTrennen,
  linkedinVeroeffentlichen,
  postEntwerfen,
  type Plattform,
  type PostAnlass,
} from "@/app/(admin)/admin/marketing/actions"
import type { LinkedinStatus } from "@/lib/linkedin"
import { entwurfAnlegen } from "@/app/(admin)/admin/veroeffentlichungen/actions"

const VORSCHAU_ZEILEN = 3
const PLATTFORMEN: Plattform[] = ["person", "firma", "instagram", "google"]

const PLATTFORM_INFO: Record<Plattform, { limit: number; oeffnen: string; speicherbar: boolean }> = {
  person: { limit: 3000, oeffnen: "https://www.linkedin.com/feed/?shareActive=true", speicherbar: true },
  firma: { limit: 3000, oeffnen: "https://www.linkedin.com/feed/?shareActive=true", speicherbar: true },
  instagram: { limit: 2200, oeffnen: "https://www.instagram.com/", speicherbar: false },
  google: { limit: 1500, oeffnen: "https://business.google.com/", speicherbar: false },
}

type Texte = {
  titel: string
  anlass: string
  anlaesse: Record<PostAnlass, string>
  plattformen: Record<Plattform, string>
  kopfzeile: Record<Plattform, string>
  stichpunkte: string
  platzhalter: string
  erzeugen: string
  erzeugt: string
  mehr: string
  weniger: string
  kopieren: string
  kopiert: string
  oeffnen: string
  speichern: string
  gespeichert: string
  nurKopieren: string
  leer: string
  li: {
    verbinden: string
    verbundenAls: string
    trennen: string
    veroeffentlichen: string
    bestaetigen: string
    sendet: string
    live: string
    ansehen: string
    firmaHinweis: string
  }
}

export function PostWerkstatt({ t, linkedin }: { t: Texte; linkedin: LinkedinStatus }) {
  const [bestaetigt, setBestaetigt] = useState(false)
  const [live, setLive] = useState<{ url: string | null } | null>(null)
  const [sendet, sende] = useTransition()

  const veroeffentlichen = () => {
    if (!bestaetigt) {
      setBestaetigt(true)
      return
    }
    sende(async () => {
      setFehler(null)
      const r = await linkedinVeroeffentlichen(text)
      setBestaetigt(false)
      if ("fehler" in r) setFehler(r.fehler)
      else setLive({ url: r.url })
    })
  }

  const [anlass, setAnlass] = useState<PostAnlass>("lieferung")
  const [stichpunkte, setStichpunkte] = useState("")
  const [texte, setTexte] = useState<Record<Plattform, string> | null>(null)
  const [aktiv, setAktiv] = useState<Plattform>("person")
  const [fehler, setFehler] = useState<string | null>(null)
  const [offen, setOffen] = useState(false)
  const [kopiert, setKopiert] = useState(false)
  const [gespeichert, setGespeichert] = useState<Partial<Record<Plattform, boolean>>>({})
  const [laeuft, starte] = useTransition()
  const [speichert, speichere] = useTransition()

  const text = texte?.[aktiv] ?? ""
  const info = PLATTFORM_INFO[aktiv]

  const erzeugen = () =>
    starte(async () => {
      setFehler(null)
      setGespeichert({})
      const r = await postEntwerfen(anlass, stichpunkte)
      if ("fehler" in r) setFehler(r.fehler)
      else {
        setTexte(r.texte)
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
      setGespeichert((g) => ({ ...g, [aktiv]: true }))
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
          <div role="tablist" aria-label={t.titel} className="border-border flex gap-1 overflow-x-auto border-b">
            {PLATTFORMEN.map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={aktiv === p}
                onClick={() => {
                  setAktiv(p)
                  setOffen(false)
                }}
                className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-sm transition-colors ${
                  aktiv === p
                    ? "border-gold text-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                {t.plattformen[p]}
              </button>
            ))}
          </div>

          <article role="tabpanel" className="border-border bg-background flex flex-col gap-3 rounded-lg border p-4" aria-live="polite">
            <header className="flex items-center gap-3">
              <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full font-serif text-sm font-semibold">
                {aktiv === "person" ? "EA" : "cD"}
              </span>
              <span className="flex flex-col">
                <span className="text-foreground text-sm font-semibold">{t.kopfzeile[aktiv]}</span>
                <span className="text-muted-foreground text-xs">{t.plattformen[aktiv]}</span>
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
                className={`font-mono text-xs tabular-nums ${text.length > info.limit ? "text-destructive" : "text-muted-foreground"}`}
              >
                {text.length} / {info.limit}
              </span>
              <button
                type="button"
                onClick={kopieren}
                className="border-border text-foreground hover:border-foreground/40 rounded-md border px-3 py-1.5 text-sm"
              >
                {kopiert ? t.kopiert : t.kopieren}
              </button>
              <a
                href={info.oeffnen}
                target="_blank"
                rel="noopener noreferrer"
                className="border-border text-foreground hover:border-foreground/40 rounded-md border px-3 py-1.5 text-sm"
              >
                {t.oeffnen}
              </a>
              {info.speicherbar ? (
                <button
                  type="button"
                  onClick={speichern}
                  disabled={speichert || gespeichert[aktiv]}
                  className="border-primary text-primary rounded-md border px-3 py-1.5 text-sm disabled:opacity-60"
                >
                  {gespeichert[aktiv] ? t.gespeichert : t.speichern}
                </button>
              ) : (
                <span className="text-muted-foreground text-xs">{t.nurKopieren}</span>
              )}
            </div>
          )}

          {aktiv === "person" && (
            <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
              {linkedin.verbunden ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-foreground text-sm">
                      <span aria-hidden className="bg-primary mr-2 inline-block size-2 rounded-full" />
                      {t.li.verbundenAls.replace("{name}", linkedin.name)}
                    </span>
                    <form action={linkedinTrennen}>
                      <button type="submit" className="text-muted-foreground hover:text-foreground text-xs underline">
                        {t.li.trennen}
                      </button>
                    </form>
                  </div>
                  {live ? (
                    <p className="text-foreground text-sm" role="status">
                      {t.li.live}{" "}
                      {live.url && (
                        <a href={live.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          {t.li.ansehen}
                        </a>
                      )}
                    </p>
                  ) : (
                    text && (
                      <button
                        type="button"
                        onClick={veroeffentlichen}
                        disabled={sendet || text.length > info.limit}
                        className="bg-primary text-primary-foreground self-start rounded-md px-4 py-2 text-sm font-medium disabled:opacity-40"
                      >
                        {sendet ? t.li.sendet : bestaetigt ? t.li.bestaetigen : t.li.veroeffentlichen}
                      </button>
                    )
                  )}
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-html-link-for-pages -- API-Route leitet zu LinkedIn weiter, braucht vollen Seitenwechsel
                <a
                  href="/api/linkedin/start"
                  className="bg-primary text-primary-foreground self-start rounded-md px-4 py-2 text-sm font-medium"
                >
                  {t.li.verbinden}
                </a>
              )}
            </div>
          )}
          {aktiv === "firma" && <p className="text-muted-foreground text-xs leading-relaxed">{t.li.firmaHinweis}</p>}
        </div>
      </div>
    </section>
  )
}
