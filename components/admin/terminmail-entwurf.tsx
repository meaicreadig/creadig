"use client"

import { useState, useTransition } from "react"
import { Sparkles } from "lucide-react"

import { terminmailEntwerfen } from "@/app/(admin)/admin/termine/ki-actions"

const FELD =
  "border-line bg-background focus:border-gold w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors"

export function TerminmailEntwurf({
  kontaktId,
  startBetreff,
  startText,
}: {
  kontaktId: string
  startBetreff: string
  startText: string
}) {
  const [betreff, setBetreff] = useState(startBetreff)
  const [text, setText] = useState(startText)
  const [hinweis, setHinweis] = useState("")
  const [meldung, setMeldung] = useState<string | null>(null)
  const [laeuft, starte] = useTransition()

  function entwerfen(form: HTMLFormElement | null) {
    const art = (form?.elements.namedItem("art") as HTMLSelectElement | null)?.value ?? "kennenlernen"
    setMeldung(null)
    starte(async () => {
      const r = await terminmailEntwerfen(kontaktId, art, hinweis)
      if ("fehler" in r) {
        setMeldung(r.fehler)
        return
      }
      setBetreff(r.betreff)
      setText(r.text)
      setMeldung("Entwurf eingesetzt. Bitte lesen, anpassen und erst dann senden.")
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border-gold/30 bg-gold/5 flex flex-col gap-3 rounded-md border p-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="flex items-center gap-2">
            <Sparkles className="text-gold-text size-4" aria-hidden="true" />
            Mit KI entwerfen
          </span>
          <span className="text-muted-foreground text-xs leading-relaxed">
            Die KI liest das Firmengehirn und die Gesprächsnotizen dieses Kontakts. Nichts wird ohne Ihren Klick gesendet.
          </span>
          <input
            value={hinweis}
            onChange={(e) => setHinweis(e.target.value)}
            maxLength={600}
            className={FELD}
            placeholder="Optional: z. B. Stammo-Kundenkarte kurz erwähnen, auf Türkisch schreiben"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={laeuft}
            onClick={(e) => entwerfen(e.currentTarget.form)}
            className="border-gold text-gold-text hover:bg-gold/10 inline-flex min-h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium disabled:opacity-50"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {laeuft ? "Entwurf wird geschrieben …" : "Entwurf schreiben"}
          </button>
          {meldung && (
            <p role="status" className="text-muted-foreground text-xs">
              {meldung}
            </p>
          )}
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        Betreff
        <input name="betreff" required maxLength={160} value={betreff} onChange={(e) => setBetreff(e.target.value)} className={FELD} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Text <span className="text-muted-foreground text-xs">{"{link} wird durch den persönlichen Buchungslink ersetzt."}</span>
        <textarea
          name="text"
          required
          rows={11}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`${FELD} leading-relaxed`}
        />
      </label>
    </div>
  )
}
