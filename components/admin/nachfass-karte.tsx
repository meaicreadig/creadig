"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Send, Sparkles, X } from "lucide-react"

import { nachfassSenden, nachfassVerwerfen } from "@/app/(admin)/admin/nachfass-actions"

const TEXT = {
  de: { bereit: "KI-Entwurf bereit", vorbereitet: "Entwurf wird vorbereitet", senden: "Senden", sendet: "Sendet …", bearbeiten: "Bearbeiten", verwerfen: "Verwerfen", lesen: "Ganzen Text lesen" },
  tr: { bereit: "Yapay zekâ taslağı hazır", vorbereitet: "Taslak hazırlanıyor", senden: "Gönder", sendet: "Gönderiliyor …", bearbeiten: "Düzenle", verwerfen: "Vazgeç", lesen: "Metnin tamamı" },
}

export function NachfassKarte({
  sprache,
  kontaktId,
  entwurf,
}: {
  sprache: "de" | "tr"
  kontaktId: string | null
  entwurf: { id: string; betreff: string; text: string } | null
}) {
  const t = TEXT[sprache]
  const [meldung, setMeldung] = useState<{ ok: boolean; text: string } | null>(null)
  const [laeuft, starte] = useTransition()
  const bearbeiten = kontaktId
    ? `/admin/termine?kontakt=${encodeURIComponent(kontaktId)}${entwurf ? `&entwurf=${encodeURIComponent(entwurf.id)}` : ""}`
    : "/admin/termine"

  if (!entwurf) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-xs">
        <Sparkles className="size-3.5 animate-pulse" aria-hidden="true" />
        {t.vorbereitet}
      </p>
    )
  }

  function los(aktion: typeof nachfassSenden) {
    starte(async () => {
      const r = await aktion(entwurf!.id)
      setMeldung({ ok: r.ok, text: r.meldung })
    })
  }

  return (
    <div className="border-gold/30 bg-gold/5 flex flex-col gap-3 rounded-md border p-3">
      <span className="text-gold-text flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] uppercase">
        <Sparkles className="size-3.5" aria-hidden="true" />
        {t.bereit}
      </span>
      <details className="group">
        <summary className="cursor-pointer list-none">
          <span className="block text-sm font-medium text-pretty">{entwurf.betreff}</span>
          <span className="text-muted-foreground line-clamp-2 text-xs leading-relaxed group-open:hidden">
            {entwurf.text.replace("{link}", "").replace(/\s+/g, " ").trim()}
          </span>
          <span className="text-gold-text text-xs underline-offset-4 group-open:hidden hover:underline">{t.lesen}</span>
        </summary>
        <p className="text-muted-foreground mt-2 text-xs leading-relaxed whitespace-pre-line">
          {entwurf.text.replace("{link}", "→ [Termin wählen]")}
        </p>
      </details>
      {meldung ? (
        <p role="status" className={`text-xs ${meldung.ok ? "text-gold-text" : "text-destructive"}`}>
          {meldung.text}
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={laeuft}
            onClick={() => los(nachfassSenden)}
            className="bg-gold text-background hover:bg-gold/90 inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Send className="size-3.5" aria-hidden="true" />
            {laeuft ? t.sendet : t.senden}
          </button>
          <Link
            href={bearbeiten}
            className="border-gold/40 text-gold-text hover:bg-gold/10 inline-flex min-h-9 items-center rounded-md border px-3 text-xs font-medium transition-colors"
          >
            {t.bearbeiten}
          </Link>
          <button
            type="button"
            disabled={laeuft}
            onClick={() => los(nachfassVerwerfen)}
            className="text-muted-foreground hover:text-foreground ml-auto inline-flex min-h-9 items-center gap-1 px-2 text-xs transition-colors disabled:opacity-50"
          >
            <X className="size-3.5" aria-hidden="true" />
            {t.verwerfen}
          </button>
        </div>
      )}
    </div>
  )
}
