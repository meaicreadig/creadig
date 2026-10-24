"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { ArrowUp, Check, Clock, HelpCircle, ImagePlus, Loader2, Mic, Square, X } from "lucide-react"

/** Verkleinert auf max. 1600 px (JPEG) – Text bleibt lesbar, Bildkosten bleiben klein. */
async function verkleinere(datei: File): Promise<string> {
  const url = URL.createObjectURL(datei)
  try {
    const img = await new Promise<HTMLImageElement>((ok, fehler) => {
      const i = new Image()
      i.onload = () => ok(i)
      i.onerror = fehler
      i.src = url
    })
    const faktor = Math.min(1, 1600 / Math.max(img.width, img.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(img.width * faktor)
    canvas.height = Math.round(img.height * faktor)
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/jpeg", 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}

import { frage, frageBeantworten, frageSpaeter, nachrichtenSeit } from "@/app/(admin)/admin/assistent/actions"
import type { EminFrage } from "@/lib/assistent/fragen"
import type { Nachricht } from "@/lib/assistent/store"
import { personVon, type Uebernahme } from "@/lib/zentrale/personen"

const STAND = {
  erledigt: { text: "erledigt", klasse: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  laeuft: { text: "arbeitet daran", klasse: "bg-primary/15 text-primary" },
  wartet: { text: "wartet", klasse: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
} as const

/** Wer hat übernommen – ein Kasten je KI-Mitarbeiter (Name, Abteilung, was, Stand). */
function Uebernahmen({ liste }: { liste: Uebernahme[] }) {
  return (
    <ul className="mt-2 flex w-full max-w-[85%] flex-col gap-2" aria-label="Übernommen von">
      {liste.map((u, i) => {
        const p = personVon(u.agent)
        const st = STAND[u.stand]
        return (
          <li key={`${u.agent}-${i}`} className="flex items-start gap-3 rounded-2xl border border-border bg-card px-3 py-2.5 text-sm">
            <span aria-hidden="true" className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {p.name.slice(0, 2)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-foreground">{p.name}</span>
                <span className="text-xs text-muted-foreground">{p.rolle.de} · KI</span>
                <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${st.klasse}`}>
                  {u.stand === "erledigt" ? <Check className="size-3" aria-hidden="true" /> : <Clock className="size-3" aria-hidden="true" />}
                  {st.text}
                  {u.bis ? ` · ${u.bis}` : ""}
                </span>
              </span>
              <span className="mt-0.5 block break-words text-muted-foreground [overflow-wrap:anywhere]">{u.was}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Fragen an dich – die KI-Kollegen fragen, was nur Emin weiß (Wie lief das
 * Gespräch? Wie geht es weiter?). Ein Klick oder ein Satz, dann macht Aylin weiter.
 */
function FragenAnDich({ fragen, beantworte, spaeter, gesperrt }: { fragen: EminFrage[]; beantworte: (f: EminFrage, a: string) => void; spaeter: (f: EminFrage) => void; gesperrt: boolean }) {
  const [frei, setFrei] = useState<Record<string, string>>({})
  if (!fragen.length) return null
  return (
    <div className="flex flex-col gap-2 border-b border-border bg-primary/5 p-4 md:p-5" aria-label="Fragen an dich">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
        <HelpCircle className="size-4" aria-hidden="true" />
        Fragen an dich · {fragen.length}
      </p>
      <ul className="flex flex-col gap-2">
        {fragen.map((f) => {
          const p = personVon(f.agent)
          const text = frei[f.id] ?? ""
          return (
            <li key={f.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 text-sm">
              <span className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {p.name.slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2">
                    <span className="font-semibold text-foreground">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.rolle.de} · KI</span>
                  </span>
                  <span className="mt-0.5 block font-medium text-foreground [overflow-wrap:anywhere]">{f.frage}</span>
                  {f.kontext ? <span className="mt-0.5 block text-xs text-muted-foreground [overflow-wrap:anywhere]">{f.kontext}</span> : null}
                </span>
              </span>
              {f.optionen.length ? (
                <span className="flex flex-wrap gap-2">
                  {f.optionen.map((o) => (
                    <button
                      key={o}
                      type="button"
                      disabled={gesperrt}
                      onClick={() => beantworte(f, o)}
                      className="rounded-full bg-secondary px-3 py-1.5 text-left text-xs text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
                    >
                      {o}
                    </button>
                  ))}
                </span>
              ) : null}
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (text.trim()) beantworte(f, text)
                }}
              >
                <label htmlFor={`antwort-${f.id}`} className="sr-only">
                  Eigene Antwort an {p.name}
                </label>
                <input
                  id={`antwort-${f.id}`}
                  value={text}
                  onChange={(e) => setFrei((v) => ({ ...v, [f.id]: e.target.value }))}
                  placeholder="Oder kurz selbst antworten …"
                  className="min-w-0 flex-1 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button type="submit" disabled={gesperrt || !text.trim()} aria-label="Antwort senden" className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40">
                  <ArrowUp className="size-3.5" aria-hidden="true" />
                </button>
                <button type="button" disabled={gesperrt} onClick={() => spaeter(f)} className="rounded-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40">
                  Morgen
                </button>
              </form>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

type Erkennung = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
}

const VORSCHLAEGE = [
  "Was ist heute mein wichtigster Schritt?",
  "Schreib mir einen LinkedIn-Artikel aus einem echten Projekt.",
  "Wie bringe ich den Regionalverband zum Abschluss?",
  "Welche Förderungen könnten für creaDIG passen?",
]

export function AssistentChat({ start, rest, fragen: startFragen = [] }: { start: Nachricht[]; rest: number; fragen?: EminFrage[] }) {
  const [verlauf, setVerlauf] = useState(start)
  const [fragen, setFragen] = useState(startFragen)
  const [eingabe, setEingabe] = useState("")
  const [fehler, setFehler] = useState<string | null>(null)
  const [laeuft, startTransition] = useTransition()
  const [hoert, setHoert] = useState(false)
  const [sprache, setSprache] = useState<"de-DE" | "tr-TR">("de-DE")
  const erkennung = useRef<Erkennung | null>(null)
  const ende = useRef<HTMLDivElement>(null)
  const dateiFeld = useRef<HTMLInputElement>(null)
  const [bild, setBild] = useState<string | null>(null)

  async function bildWaehlen(datei: File | undefined) {
    if (!datei) return
    if (!datei.type.startsWith("image/")) {
      setFehler("Bitte ein Bild wählen (PNG, JPG, WebP).")
      return
    }
    try {
      setBild(await verkleinere(datei))
      setFehler(null)
    } catch {
      setFehler("Bild konnte nicht gelesen werden.")
    }
  }

  useEffect(() => {
    ende.current?.scrollIntoView({ block: "end" })
  }, [verlauf, laeuft])

  /* Arbeitet noch jemand („arbeitet daran“)? Dann alle 20 s nachsehen, bis zu 8 Minuten – die Nacharbeit meldet sich selbst im Chat. */
  const offen = verlauf.some((m) => m.uebernahmen?.some((u) => u.stand === "laeuft") && Date.now() - Date.parse(m.zeit) < 8 * 60_000)
  useEffect(() => {
    if (!offen) return
    const t = setInterval(async () => {
      const letzte = verlauf.filter((m) => !m.id.startsWith("tmp-")).at(-1)?.zeit
      if (!letzte) return
      const neu = await nachrichtenSeit(letzte).catch(() => [])
      if (neu.length) setVerlauf((v) => [...v, ...neu.filter((n) => !v.some((x) => x.id === n.id))])
    }, 20_000)
    return () => clearInterval(t)
  }, [offen, verlauf])

  function senden(text: string) {
    const t = text.trim()
    const b = bild
    if ((!t && !b) || laeuft) return
    setFehler(null)
    setEingabe("")
    setBild(null)
    const anzeige = b ? `[Bild angehängt] ${t}`.trim() : t
    setVerlauf((v) => [...v, { id: `tmp-${Date.now()}`, rolle: "user", text: anzeige, zeit: new Date().toISOString() }])
    startTransition(async () => {
      const r = await frage(t, b)
      if (r.ok) setVerlauf((v) => [...v, r.antwort])
      else setFehler(r.fehler)
    })
  }

  function beantworte(f: EminFrage, antwort: string) {
    if (laeuft) return
    setFehler(null)
    setFragen((l) => l.filter((x) => x.id !== f.id))
    const p = personVon(f.agent)
    setVerlauf((v) => [...v, { id: `tmp-${Date.now()}`, rolle: "user", text: `Antwort an ${p.name} auf „${f.frage}“: ${antwort}`, zeit: new Date().toISOString() }])
    startTransition(async () => {
      const r = await frageBeantworten(f.id, antwort)
      if (r.ok) setVerlauf((v) => [...v.filter((m) => !m.id.startsWith("tmp-")), ...r.nachrichten.filter((n) => !v.some((x) => x.id === n.id))])
      else setFehler(r.fehler)
    })
  }

  function spaeter(f: EminFrage) {
    setFragen((l) => l.filter((x) => x.id !== f.id))
    void frageSpaeter(f.id)
  }

  function sprechen() {
    if (hoert) {
      erkennung.current?.stop()
      return
    }
    const W = window as unknown as { SpeechRecognition?: new () => Erkennung; webkitSpeechRecognition?: new () => Erkennung }
    const Klasse = W.SpeechRecognition ?? W.webkitSpeechRecognition
    if (!Klasse) {
      setFehler("Spracheingabe wird von diesem Browser nicht unterstützt (Safari oder Chrome nutzen).")
      return
    }
    const r = new Klasse()
    r.lang = sprache
    r.interimResults = true
    r.continuous = true
    const basis = eingabe ? `${eingabe} ` : ""
    r.onresult = (e) => {
      let t = ""
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript
      setEingabe(basis + t)
    }
    r.onend = () => setHoert(false)
    erkennung.current = r
    r.start()
    setHoert(true)
  }

  return (
    <section className="flex min-h-[24rem] w-full min-w-0 md:min-h-[32rem] flex-col overflow-hidden rounded-3xl bg-card shadow-sm" aria-label="Chat mit dem Assistenten">
      <FragenAnDich fragen={fragen} beantworte={beantworte} spaeter={spaeter} gesperrt={laeuft} />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 md:p-6" style={{ maxHeight: "60vh" }}>
        {verlauf.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              Erzähl mir, woran du gerade denkst – schreibend oder per Mikrofon. Ich bereite alles vor, du gibst frei.
            </p>
            <div className="flex flex-wrap gap-2">
              {VORSCHLAEGE.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => senden(v)}
                  className="rounded-full bg-secondary px-4 py-2 text-left text-sm text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ) : (
          verlauf.map((m) => (
            <div key={m.id} className={m.rolle === "user" ? "flex justify-end" : "flex flex-col items-start"}>
              {m.rolle === "assistant" ? <span className="mb-1 px-1 text-xs text-muted-foreground">Aylin · Chief of Staff · KI</span> : null}
              <div
                className={
                  m.rolle === "user"
                    ? "min-w-0 max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-br-lg bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground [overflow-wrap:anywhere]"
                    : "min-w-0 max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-bl-lg bg-secondary px-4 py-3 text-sm leading-relaxed text-secondary-foreground [overflow-wrap:anywhere]"
                }
              >
                {m.text}
              </div>
              {m.rolle === "assistant" && m.uebernahmen?.length ? <Uebernahmen liste={m.uebernahmen} /> : null}
            </div>
          ))
        )}
        {laeuft ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Denkt nach und prüft deine Daten …
          </div>
        ) : null}
        <div ref={ende} />
      </div>

      <form
        className="flex flex-col gap-2 p-4 md:p-5"
        onSubmit={(e) => {
          e.preventDefault()
          senden(eingabe)
        }}
      >
        {fehler ? (
          <p className="text-sm text-destructive" role="alert">
            {fehler}
          </p>
        ) : null}
        {bild ? (
          <div className="flex items-center gap-3 rounded-2xl bg-secondary p-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- lokale Vorschau aus data:-URL */}
            <img src={bild} alt="Angehängtes Bild" className="size-14 rounded-xl object-cover" />
            <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
              Bild angehängt – wird mit Claude Sonnet gelesen und ins System eingeordnet.
            </p>
            <button
              type="button"
              onClick={() => setBild(null)}
              aria-label="Bild entfernen"
              className="flex size-8 items-center justify-center rounded-full bg-card text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
        <div
          className="flex items-center gap-2 rounded-3xl bg-secondary p-2"
          onPaste={(e) => {
            const datei = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"))
            if (datei) {
              e.preventDefault()
              void bildWaehlen(datei)
            }
          }}
        >
          <input
            ref={dateiFeld}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              void bildWaehlen(e.target.files?.[0])
              e.target.value = ""
            }}
          />
          <button
            type="button"
            onClick={() => dateiFeld.current?.click()}
            aria-label="Bild anhängen"
            className="flex size-10 items-center justify-center rounded-full bg-card text-foreground hover:bg-background"
          >
            <ImagePlus className="size-4" aria-hidden="true" />
          </button>
          <label htmlFor="assistent-eingabe" className="sr-only">
            Nachricht an den Assistenten
          </label>
          <textarea
            id="assistent-eingabe"
            rows={2}
            value={eingabe}
            onChange={(e) => setEingabe(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                if (e.nativeEvent.isComposing || e.keyCode === 229) return
                e.preventDefault()
                senden(eingabe)
              }
            }}
            placeholder="Laut denken, fragen …"
            className="min-h-12 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:truncate placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setSprache((s) => (s === "de-DE" ? "tr-TR" : "de-DE"))}
            className="rounded-full px-2 py-2 font-mono text-xs text-muted-foreground hover:text-foreground"
            aria-label="Sprache der Spracheingabe wechseln"
          >
            {sprache === "de-DE" ? "DE" : "TR"}
          </button>
          <button
            type="button"
            onClick={sprechen}
            aria-pressed={hoert}
            aria-label={hoert ? "Aufnahme beenden" : "Spracheingabe starten"}
            className={
              hoert
                ? "flex size-10 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                : "flex size-10 items-center justify-center rounded-full bg-card text-foreground hover:bg-background"
            }
          >
            {hoert ? <Square className="size-4" aria-hidden="true" /> : <Mic className="size-4" aria-hidden="true" />}
          </button>
          <button
            type="submit"
            disabled={laeuft || (!eingabe.trim() && !bild)}
            aria-label="Senden"
            className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </button>
        </div>
        <p className="px-2 text-xs text-muted-foreground">
          Heute noch {Math.max(0, rest - verlauf.filter((m) => m.rolle === "user" && m.id.startsWith("tmp-")).length)}{" "}
          Fragen · nichts geht ohne deine Freigabe raus
        </p>
      </form>
    </section>
  )
}
